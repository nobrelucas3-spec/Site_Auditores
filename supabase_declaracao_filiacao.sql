-- ==============================================================================
-- EMISSÃO E VALIDAÇÃO DE DECLARAÇÃO OFICIAL DE FILIAÇÃO - AUDITORES TCE-PE
-- ==============================================================================
-- Objetivo:
--   1. Criar a tabela `public.membership_declarations` para registrar todas as
--      declarações emitidas exclusivamente por associados autenticados e ativos.
--   2. Garantir RLS restrita: anônimos não leem nem gravam; associados veem apenas
--      suas próprias declarações; admins gerenciam todas.
--   3. Disponibilizar RPC `issue_membership_declaration` (autenticada, SECURITY DEFINER)
--      exigindo sessão válida em `auth.users` com e-mail confirmado, cadastro em
--      `public.members` com `status = 'active'` e `is_associado = true`.
--   4. Disponibilizar RPC pública `verify_membership_declaration` (SECURITY DEFINER)
--      que valida exclusivamente códigos registrados na tabela oficial e confirma
--      em tempo real a situação cadastral ativa do associado em `public.members`.
--
-- Seguro para reexecução (idempotente).
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. FUNÇÃO AUXILIAR: public.is_admin() (idempotente)
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

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;


-- ==============================================================================
-- 2. TABELA: public.membership_declarations
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.membership_declarations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_code text UNIQUE NOT NULL,
    member_name text NOT NULL,
    member_matricula text NOT NULL,
    member_email text,
    purpose text NOT NULL DEFAULT 'fisco_saude' CHECK (purpose IN ('fisco_saude', 'geral', 'custom')),
    custom_recipient text,
    issued_at timestamptz NOT NULL DEFAULT now(),
    valid_until timestamptz NOT NULL DEFAULT (now() + interval '60 days'),
    status text NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'revoked')),
    signer_name text NOT NULL DEFAULT 'AUDITORES-TCE/PE',
    signer_role text NOT NULL DEFAULT 'Assinado e autenticado eletronicamente pelo Portal Oficial',
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.membership_declarations
    ALTER COLUMN valid_until SET DEFAULT (now() + interval '60 days');

ALTER TABLE public.membership_declarations
    ALTER COLUMN signer_name SET DEFAULT 'AUDITORES-TCE/PE';

ALTER TABLE public.membership_declarations
    ALTER COLUMN signer_role SET DEFAULT 'Assinado e autenticado eletronicamente pelo Portal Oficial';

CREATE INDEX IF NOT EXISTS idx_membership_declarations_code
    ON public.membership_declarations (upper(trim(verification_code)));

CREATE INDEX IF NOT EXISTS idx_membership_declarations_matricula_issued
    ON public.membership_declarations (member_matricula, issued_at DESC);

-- Limpeza inicial de registros expirados e eventuais duplicatas antigas
DELETE FROM public.membership_declarations
WHERE valid_until <= now();

DELETE FROM public.membership_declarations d
USING (
    SELECT id,
           row_number() OVER (
               PARTITION BY member_matricula, purpose
               ORDER BY issued_at DESC, created_at DESC
           ) AS rn
    FROM public.membership_declarations
    WHERE status = 'valid'
) dup
WHERE d.id = dup.id
  AND dup.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_membership_declarations_unique_active_purpose
    ON public.membership_declarations (member_matricula, purpose)
    WHERE status = 'valid';


-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) EM `public.membership_declarations`
-- ==============================================================================
ALTER TABLE public.membership_declarations ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'membership_declarations'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.membership_declarations', pol.policyname);
    END LOOP;
END $$;

REVOKE ALL ON TABLE public.membership_declarations FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.membership_declarations TO authenticated, service_role;

CREATE POLICY "Members select own declarations or admin"
    ON public.membership_declarations FOR SELECT TO authenticated
    USING (
        lower(trim(coalesce(member_email, ''))) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        OR public.is_admin()
    );

CREATE POLICY "Admins insert declarations"
    ON public.membership_declarations FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins update declarations"
    ON public.membership_declarations FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete declarations"
    ON public.membership_declarations FOR DELETE TO authenticated
    USING (public.is_admin());


-- ==============================================================================
-- 4. RPC: public.issue_membership_declaration(p_purpose, p_custom_recipient)
--    Emite declaração oficial exclusivamente para associado logado, confirmado
--    em `auth.users` e com vínculo ativo (`status = 'active'` e `is_associado = true`).
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.issue_membership_declaration(
    p_purpose text DEFAULT 'fisco_saude',
    p_custom_recipient text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_uid uuid := auth.uid();
    v_auth_user record;
    v_auth_email text;
    v_member record;
    v_purpose text := lower(trim(coalesce(p_purpose, 'fisco_saude')));
    v_recipient text;
    v_existing record;
    v_code text;
    v_year text := to_char(timezone('America/Recife', now()), 'YYYY');
    v_attempts integer := 0;
    v_inserted record;
BEGIN
    IF v_uid IS NULL THEN
        RETURN json_build_object(
            'ok', false,
            'message', 'Sessão expirada ou usuário não autenticado.'
        );
    END IF;

    -- Confirmar que o usuário existe em auth.users e possui e-mail verificado
    SELECT id, email, email_confirmed_at, confirmed_at
    INTO v_auth_user
    FROM auth.users
    WHERE id = v_uid
    LIMIT 1;

    IF v_auth_user.id IS NULL OR (v_auth_user.email_confirmed_at IS NULL AND v_auth_user.confirmed_at IS NULL) THEN
        RETURN json_build_object(
            'ok', false,
            'message', 'Conta não ativada ou e-mail ainda não confirmado.'
        );
    END IF;

    v_auth_email := lower(trim(coalesce(v_auth_user.email, '')));
    IF v_auth_email = '' THEN
        RETURN json_build_object(
            'ok', false,
            'message', 'Não foi possível identificar o e-mail da conta autenticada.'
        );
    END IF;

    IF v_purpose NOT IN ('fisco_saude', 'geral', 'custom') THEN
        v_purpose := 'fisco_saude';
    END IF;

    IF v_purpose = 'custom' THEN
        v_recipient := nullif(
            left(regexp_replace(trim(coalesce(p_custom_recipient, '')), '[<>]', '', 'g'), 140),
            ''
        );
    ELSE
        v_recipient := NULL;
    END IF;

    -- Localizar associado correspondente ao e-mail autenticado
    SELECT id, full_name, matricula, email, email_institutional, email_personal, status, is_associado
    INTO v_member
    FROM public.members
    WHERE lower(trim(coalesce(email, ''))) = v_auth_email
       OR lower(trim(coalesce(email_institutional, ''))) = v_auth_email
       OR lower(trim(coalesce(email_personal, ''))) = v_auth_email
    LIMIT 1;

    IF v_member.id IS NULL THEN
        RETURN json_build_object(
            'ok', false,
            'message', 'Associado não localizado na base cadastral.'
        );
    END IF;

    IF v_member.status != 'active' OR coalesce(v_member.is_associado, false) = false THEN
        RETURN json_build_object(
            'ok', false,
            'message', 'A emissão de declaração está disponível apenas para associados com filiação ativa e regular.'
        );
    END IF;

    -- Limpeza automática de declarações com prazo de 60 dias já expirado
    DELETE FROM public.membership_declarations
    WHERE valid_until <= now();

    -- Manter no máximo 1 declaração ativa por (matrícula, finalidade), reaproveitando o mesmo código
    SELECT *
    INTO v_existing
    FROM public.membership_declarations
    WHERE member_matricula = v_member.matricula
      AND purpose = v_purpose
      AND status = 'valid'
      AND valid_until > now()
    ORDER BY issued_at DESC
    LIMIT 1;

    IF v_existing.id IS NOT NULL THEN
        UPDATE public.membership_declarations
        SET
            member_name = v_member.full_name,
            member_email = v_auth_email,
            custom_recipient = v_recipient,
            issued_at = now(),
            valid_until = now() + interval '60 days',
            signer_name = 'AUDITORES-TCE/PE',
            signer_role = 'Assinado e autenticado eletronicamente pelo Portal Oficial'
        WHERE id = v_existing.id
        RETURNING * INTO v_existing;

        RETURN json_build_object(
            'ok', true,
            'verification_code', v_existing.verification_code,
            'member_name', v_existing.member_name,
            'member_matricula', v_existing.member_matricula,
            'purpose', v_existing.purpose,
            'custom_recipient', v_existing.custom_recipient,
            'issued_at', v_existing.issued_at,
            'valid_until', v_existing.valid_until,
            'status', v_existing.status,
            'signer_name', v_existing.signer_name,
            'signer_role', v_existing.signer_role
        );
    END IF;

    -- Gerar código único criptograficamente aleatório AUT-YYYY-XXXXXXXX
    LOOP
        v_attempts := v_attempts + 1;
        v_code := 'AUT-' || v_year || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

        EXIT WHEN NOT EXISTS (
            SELECT 1 FROM public.membership_declarations WHERE verification_code = v_code
        ) OR v_attempts >= 20;
    END LOOP;

    INSERT INTO public.membership_declarations (
        verification_code,
        member_name,
        member_matricula,
        member_email,
        purpose,
        custom_recipient,
        issued_at,
        valid_until,
        status,
        signer_name,
        signer_role
    )
    VALUES (
        v_code,
        v_member.full_name,
        v_member.matricula,
        v_auth_email,
        v_purpose,
        v_recipient,
        now(),
        now() + interval '60 days',
        'valid',
        'AUDITORES-TCE/PE',
        'Assinado e autenticado eletronicamente pelo Portal Oficial'
    )
    RETURNING * INTO v_inserted;

    RETURN json_build_object(
        'ok', true,
        'verification_code', v_inserted.verification_code,
        'member_name', v_inserted.member_name,
        'member_matricula', v_inserted.member_matricula,
        'purpose', v_inserted.purpose,
        'custom_recipient', v_inserted.custom_recipient,
        'issued_at', v_inserted.issued_at,
        'valid_until', v_inserted.valid_until,
        'status', v_inserted.status,
        'signer_name', v_inserted.signer_name,
        'signer_role', v_inserted.signer_role
    );
END;
$$;

REVOKE ALL ON FUNCTION public.issue_membership_declaration(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_membership_declaration(text, text) TO authenticated, service_role;


-- ==============================================================================
-- 5. RPC PÚBLICA: public.verify_membership_declaration(p_code)
--    Valida exclusivamente códigos gravados em `public.membership_declarations`
--    e confirma em tempo real se o titular segue ativo em `public.members`.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.verify_membership_declaration(p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_code text := upper(trim(coalesce(p_code, '')));
    v_decl record;
    v_member record;
BEGIN
    IF v_code = '' THEN
        RETURN json_build_object(
            'valid', false,
            'reason', 'Informe o código de autenticidade para realizar a verificação.'
        );
    END IF;

    SELECT *
    INTO v_decl
    FROM public.membership_declarations
    WHERE upper(trim(verification_code)) = v_code
    LIMIT 1;

    IF v_decl.id IS NULL THEN
        RETURN json_build_object(
            'valid', false,
            'reason', 'Código de autenticidade não encontrado na base oficial da AUDITORES-TCE/PE.'
        );
    END IF;

    IF v_decl.status = 'revoked' THEN
        RETURN json_build_object(
            'valid', false,
            'reason', 'Esta declaração foi revogada pela administração da entidade.',
            'record', json_build_object(
                'verification_code', v_decl.verification_code,
                'member_name', v_decl.member_name,
                'member_matricula', v_decl.member_matricula,
                'purpose', v_decl.purpose,
                'custom_recipient', v_decl.custom_recipient,
                'issued_at', v_decl.issued_at,
                'valid_until', v_decl.valid_until,
                'status', 'revoked',
                'signer_name', v_decl.signer_name,
                'signer_role', v_decl.signer_role
            )
        );
    END IF;

    IF v_decl.valid_until < now() THEN
        RETURN json_build_object(
            'valid', false,
            'reason', 'O prazo de validade de 60 dias desta declaração expirou.',
            'record', json_build_object(
                'verification_code', v_decl.verification_code,
                'member_name', v_decl.member_name,
                'member_matricula', v_decl.member_matricula,
                'purpose', v_decl.purpose,
                'custom_recipient', v_decl.custom_recipient,
                'issued_at', v_decl.issued_at,
                'valid_until', v_decl.valid_until,
                'status', 'expired',
                'signer_name', v_decl.signer_name,
                'signer_role', v_decl.signer_role
            )
        );
    END IF;

    -- Confirmar em tempo real a situação cadastral atual do associado na tabela `members`
    SELECT id, status, is_associado
    INTO v_member
    FROM public.members
    WHERE upper(trim(coalesce(matricula, ''))) = upper(trim(v_decl.member_matricula))
    LIMIT 1;

    IF v_member.id IS NULL OR v_member.status != 'active' OR coalesce(v_member.is_associado, false) = false THEN
        RETURN json_build_object(
            'valid', false,
            'reason', 'O titular desta declaração não consta mais como associado ativo no cadastro atual.',
            'record', json_build_object(
                'verification_code', v_decl.verification_code,
                'member_name', v_decl.member_name,
                'member_matricula', v_decl.member_matricula,
                'purpose', v_decl.purpose,
                'custom_recipient', v_decl.custom_recipient,
                'issued_at', v_decl.issued_at,
                'valid_until', v_decl.valid_until,
                'status', 'revoked',
                'signer_name', v_decl.signer_name,
                'signer_role', v_decl.signer_role
            )
        );
    END IF;

    RETURN json_build_object(
        'valid', true,
        'record', json_build_object(
            'verification_code', v_decl.verification_code,
            'member_name', v_decl.member_name,
            'member_matricula', v_decl.member_matricula,
            'purpose', v_decl.purpose,
            'custom_recipient', v_decl.custom_recipient,
            'issued_at', v_decl.issued_at,
            'valid_until', v_decl.valid_until,
            'status', 'valid',
            'signer_name', v_decl.signer_name,
            'signer_role', v_decl.signer_role
        )
    );
END;
$$;

REVOKE ALL ON FUNCTION public.verify_membership_declaration(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_membership_declaration(text) TO anon, authenticated, service_role;

COMMIT;

SELECT 'Blindagem de segurança da Declaração de Filiação aplicada com sucesso!' AS status;
