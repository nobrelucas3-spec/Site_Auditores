-- ==============================================================================
-- PACOTE DE BLINDAGEM DE SEGURANÇA (RLS + RPCs SEGURAS) - AUDITORES TCE-PE
-- ==============================================================================
-- Objetivo:
--   1. Eliminar exposição pública (anon) de dados pessoais em `members` e `membership_applications`.
--   2. Garantir que associados autenticados vejam apenas seu próprio cadastro em `members`,
--      enquanto administradores (`admins`) mantêm visão e gestão completas.
--   3. Restringir operações administrativas de escrita/exclusão (documentos, financeiro,
--      pautas da diretoria, reuniões, membros e filiações) exclusivamente a `admins`.
--   4. Disponibilizar RPCs `SECURITY DEFINER` com retorno mínimo necessário para:
--      - Primeiro Acesso (`verify_first_access_member`)
--      - Validação de status de conta/e-mail (`check_member_auth_status`)
--      - Impressão individual de ficha de filiação por UUID exato (`get_membership_application_by_id`)
--
-- Seguro para reexecução (idempotente) e projetado para ZERO DOWNTIME.
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. FUNÇÃO AUXILIAR: public.is_admin()
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admins
    WHERE lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;


-- ==============================================================================
-- 2. FUNÇÃO RPC: public.check_member_auth_status(p_email text)
--    Verifica vínculo ativo e status no Supabase Auth sem expor lista de membros.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_member_auth_status(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_clean_email text := lower(trim(coalesce(p_email, '')));
    v_member record;
    v_user record;
BEGIN
    IF v_clean_email = '' THEN
        RETURN json_build_object(
            'ok', false,
            'is_active_member', false,
            'reason', 'not_member',
            'message', 'Informe um endereço de e-mail válido.'
        );
    END IF;

    -- 1. Verificar se existe na tabela de associados (members)
    SELECT id, status, is_associado, is_filiado, email, email_institutional, email_personal
    INTO v_member
    FROM public.members
    WHERE lower(trim(coalesce(email, ''))) = v_clean_email
       OR lower(trim(coalesce(email_institutional, ''))) = v_clean_email
       OR lower(trim(coalesce(email_personal, ''))) = v_clean_email
    LIMIT 1;

    IF v_member.id IS NULL THEN
        RETURN json_build_object(
            'ok', false,
            'is_active_member', false,
            'reason', 'not_member',
            'message', 'E-mail não encontrado no cadastro de associados. O envio de códigos de segurança é exclusivo para associados da entidade.'
        );
    END IF;

    IF v_member.status != 'active' OR (NOT coalesce(v_member.is_associado, false) AND NOT coalesce(v_member.is_filiado, false)) THEN
        RETURN json_build_object(
            'ok', false,
            'is_active_member', false,
            'reason', 'inactive_member',
            'message', 'Cadastro de associado inativo. Entre em contato com a secretaria da associação.'
        );
    END IF;

    -- 2. Verificar se existe registro correspondente em auth.users
    SELECT id, email_confirmed_at, confirmed_at
    INTO v_user
    FROM auth.users
    WHERE lower(trim(email)) = v_clean_email
       OR lower(trim(email)) = lower(trim(coalesce(v_member.email, '')))
       OR lower(trim(email)) = lower(trim(coalesce(v_member.email_institutional, '')))
       OR lower(trim(email)) = lower(trim(coalesce(v_member.email_personal, '')))
    ORDER BY (email_confirmed_at IS NOT NULL OR confirmed_at IS NOT NULL) DESC
    LIMIT 1;

    IF v_user.id IS NULL THEN
        RETURN json_build_object(
            'ok', false,
            'is_active_member', true,
            'reason', 'no_account',
            'message', 'Você ainda não realizou o Primeiro Acesso. Por favor, cadastre sua senha em "Primeiro Acesso" antes de redefini-la.'
        );
    END IF;

    IF v_user.email_confirmed_at IS NULL AND v_user.confirmed_at IS NULL THEN
        RETURN json_build_object(
            'ok', false,
            'is_active_member', true,
            'reason', 'unconfirmed',
            'message', 'Sua conta ainda não foi ativada. Acesse o "Primeiro Acesso" para confirmar o código enviado ao seu e-mail.'
        );
    END IF;

    RETURN json_build_object(
        'ok', true,
        'is_active_member', true,
        'reason', 'ok',
        'message', 'OK'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_member_auth_status(text) TO anon, authenticated, service_role;


-- ==============================================================================
-- 3. FUNÇÃO RPC: public.verify_first_access_member(p_email text, p_matricula text)
--    Valida simultaneamente E-mail + Matrícula para Primeiro Acesso sem expor a tabela.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.verify_first_access_member(p_email text, p_matricula text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_clean_email text := trim(coalesce(p_email, ''));
    v_lower_email text := lower(v_clean_email);
    v_clean_matricula text := trim(coalesce(p_matricula, ''));
    v_member record;
BEGIN
    IF v_lower_email = '' OR v_clean_matricula = '' THEN
        RETURN json_build_object(
            'ok', false,
            'reason', 'invalid_input',
            'message', 'Informe o E-mail e a Matrícula cadastrados.'
        );
    END IF;

    SELECT id, full_name, matricula, email, status, is_associado, is_filiado
    INTO v_member
    FROM public.members
    WHERE trim(coalesce(matricula, '')) = v_clean_matricula
      AND (
          lower(trim(coalesce(email, ''))) = v_lower_email
          OR lower(trim(coalesce(email_institutional, ''))) = v_lower_email
          OR lower(trim(coalesce(email_personal, ''))) = v_lower_email
      )
    LIMIT 1;

    IF v_member.id IS NULL THEN
        RETURN json_build_object(
            'ok', false,
            'reason', 'not_found',
            'message', 'Dados não encontrados. Verifique se o E-mail e Matrícula conferem com seu cadastro na associação.'
        );
    END IF;

    IF v_member.status != 'active' THEN
        RETURN json_build_object(
            'ok', false,
            'reason', 'inactive',
            'message', 'Seu cadastro consta como inativo. Entre em contato com a associação para regularizar sua situação.'
        );
    END IF;

    IF NOT coalesce(v_member.is_associado, false) AND NOT coalesce(v_member.is_filiado, false) THEN
        RETURN json_build_object(
            'ok', false,
            'reason', 'not_affiliated',
            'message', 'Para criar o acesso, é necessário ser associado ou filiado ativo.'
        );
    END IF;

    -- Sincroniza o e-mail principal de login caso o associado utilize seu e-mail institucional/particular cadastrado
    IF coalesce(v_member.email, '') IS DISTINCT FROM v_clean_email THEN
        UPDATE public.members
        SET email = v_clean_email
        WHERE id = v_member.id;
    END IF;

    RETURN json_build_object(
        'ok', true,
        'member', json_build_object(
            'full_name', v_member.full_name,
            'matricula', v_member.matricula,
            'status', v_member.status,
            'is_associado', coalesce(v_member.is_associado, false),
            'is_filiado', coalesce(v_member.is_filiado, false)
        )
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_first_access_member(text, text) TO anon, authenticated, service_role;


-- ==============================================================================
-- 4. FUNÇÃO RPC: public.get_membership_application_by_id(p_id uuid)
--    Retorna exclusivamente a ficha correspondente ao UUID exato informado,
--    impedindo listagem pública (enumeração em massa) de CPFs/RGs/endereços.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_membership_application_by_id(p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result jsonb;
BEGIN
    IF p_id IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT to_jsonb(ma)
    INTO v_result
    FROM public.membership_applications ma
    WHERE ma.id = p_id
    LIMIT 1;

    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_membership_application_by_id(uuid) TO anon, authenticated, service_role;


-- ==============================================================================
-- 5. BLINDAGEM DA TABELA `public.admins`
-- ==============================================================================
DO $$
DECLARE
    pol record;
BEGIN
    IF to_regclass('public.admins') IS NOT NULL THEN
        ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admins' LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.admins', pol.policyname);
        END LOOP;

        REVOKE ALL ON TABLE public.admins FROM anon;
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admins TO authenticated, service_role;

        CREATE POLICY "Admins select own record or admin"
            ON public.admins FOR SELECT TO authenticated
            USING (
                lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
                OR public.is_admin()
            );

        CREATE POLICY "Admins insert admins"
            ON public.admins FOR INSERT TO authenticated
            WITH CHECK (public.is_admin());

        CREATE POLICY "Admins update admins"
            ON public.admins FOR UPDATE TO authenticated
            USING (public.is_admin())
            WITH CHECK (public.is_admin());

        CREATE POLICY "Admins delete admins"
            ON public.admins FOR DELETE TO authenticated
            USING (public.is_admin());
    END IF;
END $$;


-- ==============================================================================
-- 6. BLINDAGEM DA TABELA `public.members`
--    Remove acesso anônimo total; cada associado lê apenas o próprio registro;
--    administradores gerenciam toda a base.
-- ==============================================================================
DO $$
DECLARE
    pol record;
BEGIN
    IF to_regclass('public.members') IS NOT NULL THEN
        ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'members' LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.members', pol.policyname);
        END LOOP;

        REVOKE ALL ON TABLE public.members FROM anon;
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.members TO authenticated, service_role;

        CREATE POLICY "Members select own profile or admin"
            ON public.members FOR SELECT TO authenticated
            USING (
                lower(trim(coalesce(email, ''))) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
                OR lower(trim(coalesce(email_institutional, ''))) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
                OR lower(trim(coalesce(email_personal, ''))) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
                OR public.is_admin()
            );

        CREATE POLICY "Admins insert members"
            ON public.members FOR INSERT TO authenticated
            WITH CHECK (public.is_admin());

        CREATE POLICY "Admins update members"
            ON public.members FOR UPDATE TO authenticated
            USING (public.is_admin())
            WITH CHECK (public.is_admin());

        CREATE POLICY "Admins delete members"
            ON public.members FOR DELETE TO authenticated
            USING (public.is_admin());
    END IF;
END $$;


-- ==============================================================================
-- 7. BLINDAGEM DA TABELA `public.membership_applications`
--    Permite INSERT público (formulário Associe-se), bloqueia listagem por `anon`
--    e por usuários comuns, e restringe gestão aos administradores.
-- ==============================================================================
DO $$
DECLARE
    pol record;
BEGIN
    IF to_regclass('public.membership_applications') IS NOT NULL THEN
        ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;

        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'membership_applications' LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.membership_applications', pol.policyname);
        END LOOP;

        REVOKE ALL ON TABLE public.membership_applications FROM anon;
        GRANT INSERT ON TABLE public.membership_applications TO anon;
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.membership_applications TO authenticated, service_role;

        CREATE POLICY "Public insert membership applications"
            ON public.membership_applications FOR INSERT TO anon, authenticated
            WITH CHECK (true);

        CREATE POLICY "Admins select membership applications"
            ON public.membership_applications FOR SELECT TO authenticated
            USING (public.is_admin());

        CREATE POLICY "Admins update membership applications"
            ON public.membership_applications FOR UPDATE TO authenticated
            USING (public.is_admin())
            WITH CHECK (public.is_admin());

        CREATE POLICY "Admins delete membership applications"
            ON public.membership_applications FOR DELETE TO authenticated
            USING (public.is_admin());
    END IF;
END $$;


-- ==============================================================================
-- 8. BLINDAGEM DA TABELA `public.documents` E BUCKET STORAGE `documents`
--    Mantém leitura pública para `is_public = true` e leitura interna para autenticados,
--    restringindo upload/edição/exclusão exclusivamente a administradores.
-- ==============================================================================
DO $$
DECLARE
    pol record;
BEGIN
    IF to_regclass('public.documents') IS NOT NULL THEN
        ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'documents' LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.documents', pol.policyname);
        END LOOP;

        REVOKE ALL ON TABLE public.documents FROM anon;
        GRANT SELECT ON TABLE public.documents TO anon;
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.documents TO authenticated, service_role;

        CREATE POLICY "Public read public documents"
            ON public.documents FOR SELECT TO anon
            USING (is_public = true);

        CREATE POLICY "Authenticated read all documents"
            ON public.documents FOR SELECT TO authenticated
            USING (true);

        CREATE POLICY "Admins insert documents"
            ON public.documents FOR INSERT TO authenticated
            WITH CHECK (public.is_admin());

        CREATE POLICY "Admins update documents"
            ON public.documents FOR UPDATE TO authenticated
            USING (public.is_admin())
            WITH CHECK (public.is_admin());

        CREATE POLICY "Admins delete documents"
            ON public.documents FOR DELETE TO authenticated
            USING (public.is_admin());
    END IF;
END $$;

-- Políticas restritivas no Storage para impedir upload/exclusão por não-admins no bucket 'documents'
DO $$
BEGIN
    DROP POLICY IF EXISTS "Restrict documents bucket insert to admins" ON storage.objects;
    CREATE POLICY "Restrict documents bucket insert to admins"
        ON storage.objects AS RESTRICTIVE FOR INSERT TO anon, authenticated
        WITH CHECK (bucket_id <> 'documents' OR public.is_admin());

    DROP POLICY IF EXISTS "Restrict documents bucket update to admins" ON storage.objects;
    CREATE POLICY "Restrict documents bucket update to admins"
        ON storage.objects AS RESTRICTIVE FOR UPDATE TO anon, authenticated
        USING (bucket_id <> 'documents' OR public.is_admin())
        WITH CHECK (bucket_id <> 'documents' OR public.is_admin());

    DROP POLICY IF EXISTS "Restrict documents bucket delete to admins" ON storage.objects;
    CREATE POLICY "Restrict documents bucket delete to admins"
        ON storage.objects AS RESTRICTIVE FOR DELETE TO anon, authenticated
        USING (bucket_id <> 'documents' OR public.is_admin());
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Aviso: Não foi possível aplicar políticas restritivas em storage.objects automaticamente (%).', SQLERRM;
END $$;


-- ==============================================================================
-- 9. BLINDAGEM DAS TABELAS FINANCEIRAS (`fixed_investments` e `finances_YYYY`)
-- ==============================================================================
DO $$
DECLARE
    pol record;
    fin_tbl record;
BEGIN
    -- 9.1 Portfólio de Investimentos Fixos (leitura autenticada, escrita apenas admins)
    IF to_regclass('public.fixed_investments') IS NOT NULL THEN
        ALTER TABLE public.fixed_investments ENABLE ROW LEVEL SECURITY;

        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fixed_investments' LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.fixed_investments', pol.policyname);
        END LOOP;

        REVOKE ALL ON TABLE public.fixed_investments FROM anon;
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.fixed_investments TO authenticated, service_role;

        CREATE POLICY "Authenticated read fixed investments"
            ON public.fixed_investments FOR SELECT TO authenticated
            USING (true);

        CREATE POLICY "Admins insert fixed investments"
            ON public.fixed_investments FOR INSERT TO authenticated
            WITH CHECK (public.is_admin());

        CREATE POLICY "Admins update fixed investments"
            ON public.fixed_investments FOR UPDATE TO authenticated
            USING (public.is_admin())
            WITH CHECK (public.is_admin());

        CREATE POLICY "Admins delete fixed investments"
            ON public.fixed_investments FOR DELETE TO authenticated
            USING (public.is_admin());
    END IF;

    -- 9.2 Tabelas Anuais de Lançamentos (`finances_2024`, `finances_2026`, etc.)
    -- Mantém leitura pública para o Portal da Transparência (/transparencia) e restringe escrita a admins
    FOR fin_tbl IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public' AND tablename ~ '^finances_[0-9]{4}$'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', fin_tbl.tablename);

        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = fin_tbl.tablename LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, fin_tbl.tablename);
        END LOOP;

        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', fin_tbl.tablename);
        EXECUTE format('GRANT SELECT ON TABLE public.%I TO anon', fin_tbl.tablename);
        EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated, service_role', fin_tbl.tablename);

        EXECUTE format(
            'CREATE POLICY "Public and member read %1$s" ON public.%1$I FOR SELECT TO anon, authenticated USING (true)',
            fin_tbl.tablename
        );
        EXECUTE format(
            'CREATE POLICY "Admins insert %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (public.is_admin())',
            fin_tbl.tablename
        );
        EXECUTE format(
            'CREATE POLICY "Admins update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())',
            fin_tbl.tablename
        );
        EXECUTE format(
            'CREATE POLICY "Admins delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (public.is_admin())',
            fin_tbl.tablename
        );
    END LOOP;
END $$;


-- ==============================================================================
-- 10. BLINDAGEM DO MÓDULO DE PAUTAS & AGENDA DA DIRETORIA EXECUTIVA
-- ==============================================================================
DO $$
DECLARE
    pol record;
BEGIN
    -- 10.1 Tabela `pautas`: associados autenticados leem e criam; apenas admins editam/excluem
    IF to_regclass('public.pautas') IS NOT NULL THEN
        ALTER TABLE public.pautas ENABLE ROW LEVEL SECURITY;

        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pautas' LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.pautas', pol.policyname);
        END LOOP;

        REVOKE ALL ON TABLE public.pautas FROM anon;
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pautas TO authenticated, service_role;

        CREATE POLICY "Authenticated read pautas"
            ON public.pautas FOR SELECT TO authenticated
            USING (true);

        CREATE POLICY "Authenticated create own pauta"
            ON public.pautas FOR INSERT TO authenticated
            WITH CHECK (created_by = auth.uid() OR public.is_admin());

        CREATE POLICY "Admins update pautas"
            ON public.pautas FOR UPDATE TO authenticated
            USING (public.is_admin())
            WITH CHECK (public.is_admin());

        CREATE POLICY "Admins delete pautas"
            ON public.pautas FOR DELETE TO authenticated
            USING (public.is_admin());
    END IF;

    -- 10.2 Tabela `pauta_votes`: sigilo total do voto individual
    IF to_regclass('public.pauta_votes') IS NOT NULL THEN
        ALTER TABLE public.pauta_votes ENABLE ROW LEVEL SECURITY;

        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pauta_votes' LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.pauta_votes', pol.policyname);
        END LOOP;

        REVOKE ALL ON TABLE public.pauta_votes FROM anon;
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pauta_votes TO authenticated, service_role;

        CREATE POLICY "Users view own vote"
            ON public.pauta_votes FOR SELECT TO authenticated
            USING (user_id = auth.uid());

        CREATE POLICY "Users insert own vote"
            ON public.pauta_votes FOR INSERT TO authenticated
            WITH CHECK (user_id = auth.uid());

        CREATE POLICY "Users update own vote"
            ON public.pauta_votes FOR UPDATE TO authenticated
            USING (user_id = auth.uid())
            WITH CHECK (user_id = auth.uid());

        CREATE POLICY "Users delete own vote"
            ON public.pauta_votes FOR DELETE TO authenticated
            USING (user_id = auth.uid());
    END IF;

    -- 10.3 Tabela `pauta_updates`: leitura autenticada; escrita exclusiva para admins
    IF to_regclass('public.pauta_updates') IS NOT NULL THEN
        ALTER TABLE public.pauta_updates ENABLE ROW LEVEL SECURITY;

        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pauta_updates' LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.pauta_updates', pol.policyname);
        END LOOP;

        REVOKE ALL ON TABLE public.pauta_updates FROM anon;
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pauta_updates TO authenticated, service_role;

        CREATE POLICY "Authenticated read pauta updates"
            ON public.pauta_updates FOR SELECT TO authenticated
            USING (true);

        CREATE POLICY "Admins insert pauta updates"
            ON public.pauta_updates FOR INSERT TO authenticated
            WITH CHECK (public.is_admin());

        CREATE POLICY "Admins update pauta updates"
            ON public.pauta_updates FOR UPDATE TO authenticated
            USING (public.is_admin())
            WITH CHECK (public.is_admin());

        CREATE POLICY "Admins delete pauta updates"
            ON public.pauta_updates FOR DELETE TO authenticated
            USING (public.is_admin());
    END IF;

    -- 10.4 Tabela `de_meetings`: leitura autenticada; escrita exclusiva para admins
    IF to_regclass('public.de_meetings') IS NOT NULL THEN
        ALTER TABLE public.de_meetings ENABLE ROW LEVEL SECURITY;

        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'de_meetings' LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.de_meetings', pol.policyname);
        END LOOP;

        REVOKE ALL ON TABLE public.de_meetings FROM anon;
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.de_meetings TO authenticated, service_role;

        CREATE POLICY "Authenticated read DE meetings"
            ON public.de_meetings FOR SELECT TO authenticated
            USING (true);

        CREATE POLICY "Admins insert DE meetings"
            ON public.de_meetings FOR INSERT TO authenticated
            WITH CHECK (public.is_admin());

        CREATE POLICY "Admins update DE meetings"
            ON public.de_meetings FOR UPDATE TO authenticated
            USING (public.is_admin())
            WITH CHECK (public.is_admin());

        CREATE POLICY "Admins delete DE meetings"
            ON public.de_meetings FOR DELETE TO authenticated
            USING (public.is_admin());
    END IF;

    -- 10.5 Tabela `meeting_pautas`: leitura autenticada; escrita exclusiva para admins
    IF to_regclass('public.meeting_pautas') IS NOT NULL THEN
        ALTER TABLE public.meeting_pautas ENABLE ROW LEVEL SECURITY;

        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'meeting_pautas' LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.meeting_pautas', pol.policyname);
        END LOOP;

        REVOKE ALL ON TABLE public.meeting_pautas FROM anon;
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.meeting_pautas TO authenticated, service_role;

        CREATE POLICY "Authenticated read meeting pautas"
            ON public.meeting_pautas FOR SELECT TO authenticated
            USING (true);

        CREATE POLICY "Admins insert meeting pautas"
            ON public.meeting_pautas FOR INSERT TO authenticated
            WITH CHECK (public.is_admin());

        CREATE POLICY "Admins update meeting pautas"
            ON public.meeting_pautas FOR UPDATE TO authenticated
            USING (public.is_admin())
            WITH CHECK (public.is_admin());

        CREATE POLICY "Admins delete meeting pautas"
            ON public.meeting_pautas FOR DELETE TO authenticated
            USING (public.is_admin());
    END IF;
END $$;

-- 10.6 Proteção de administrador na função `unify_pautas` (se a tabela `pautas` existir)
DO $$
BEGIN
    IF to_regclass('public.pautas') IS NOT NULL THEN
        CREATE OR REPLACE FUNCTION public.unify_pautas(
            p_source_pauta_id uuid,
            p_target_pauta_id uuid
        )
        RETURNS json
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $func$
        DECLARE
            v_support integer;
            v_oppose integer;
        BEGIN
            IF NOT public.is_admin() THEN
                RAISE EXCEPTION 'Acesso negado: apenas administradores podem unificar pautas.';
            END IF;

            IF p_source_pauta_id = p_target_pauta_id THEN
                RETURN json_build_object('success', false, 'error', 'Pauta de origem e destino não podem ser a mesma.');
            END IF;

            INSERT INTO public.pauta_votes (pauta_id, user_id, vote_type)
            SELECT p_target_pauta_id, user_id, vote_type
            FROM public.pauta_votes
            WHERE pauta_id = p_source_pauta_id
            ON CONFLICT (pauta_id, user_id) DO NOTHING;

            UPDATE public.pautas
            SET
                status = 'unificada',
                unified_into_pauta_id = p_target_pauta_id,
                current_progress = 'Pauta unificada com proposta similar pela Diretoria Executiva.',
                updated_at = timezone('utc'::text, now())
            WHERE id = p_source_pauta_id;

            SELECT
                count(*) FILTER (WHERE vote_type = 'support'),
                count(*) FILTER (WHERE vote_type = 'oppose')
            INTO v_support, v_oppose
            FROM public.pauta_votes
            WHERE pauta_id = p_target_pauta_id;

            UPDATE public.pautas
            SET
                support_count = v_support,
                oppose_count = v_oppose,
                score = (v_support - v_oppose),
                updated_at = timezone('utc'::text, now())
            WHERE id = p_target_pauta_id;

            RETURN json_build_object('success', true);
        END;
        $func$;

        REVOKE EXECUTE ON FUNCTION public.unify_pautas(uuid, uuid) FROM anon;
        GRANT EXECUTE ON FUNCTION public.unify_pautas(uuid, uuid) TO authenticated, service_role;
    END IF;
END $$;

COMMIT;

SELECT 'Pacote de blindagem aplicado com sucesso!' AS status;
