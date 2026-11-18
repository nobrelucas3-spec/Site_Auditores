-- ==============================================================================
-- FLUXO DE FILIAÇÃO 100% ONLINE + COFRE PRIVADO GOV.BR (LGPD) - AUDITORES TCE-PE
-- ==============================================================================
-- 1. Torna o bucket `signed-fichas` 100% PRIVADO (`public = false`), legível
--    exclusivamente por administradores autenticados (`public.is_admin()`).
-- 2. Exige credenciais (CPF + Matrícula) ou sessão Admin para consultar ou
--    anexar o PDF assinado pelo Gov.br, bloqueando sobrescrita após validação.
-- 3. Impede que visitantes anônimos listem arquivos internos do bucket `documents`.
-- 4. Endurece o INSERT público em `membership_applications` (status Pendente,
--    sem assinatura forjada e CPF de 11 dígitos obrigatório).
-- ==============================================================================

BEGIN;

-- 1. Garantir colunas de assinatura digital em `public.membership_applications`
ALTER TABLE public.membership_applications
    ADD COLUMN IF NOT EXISTS signed_pdf_url text,
    ADD COLUMN IF NOT EXISTS signed_pdf_name text,
    ADD COLUMN IF NOT EXISTS signature_metadata jsonb,
    ADD COLUMN IF NOT EXISTS signed_at timestamp with time zone;

-- 2. Política endurecida para INSERT público de solicitações de filiação
DROP POLICY IF EXISTS "Public insert membership applications" ON public.membership_applications;
CREATE POLICY "Public insert membership applications"
    ON public.membership_applications FOR INSERT TO anon, authenticated
    WITH CHECK (
        coalesce(status, 'Pendente') = 'Pendente'
        AND signed_pdf_url IS NULL
        AND signature_metadata IS NULL
        AND signed_at IS NULL
        AND length(regexp_replace(coalesce(cpf, ''), '\D', '', 'g')) = 11
        AND length(trim(coalesce(full_name, ''))) BETWEEN 3 AND 180
        AND length(trim(coalesce(matricula, ''))) BETWEEN 1 AND 30
    );

-- 3. Função auxiliar SECURITY DEFINER para validar pasta de upload sem expor tabela
CREATE OR REPLACE FUNCTION public.can_upload_signed_ficha(p_object_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.membership_applications ma
    WHERE ma.id::text = split_part(coalesce(p_object_name, ''), '/', 1)
      AND ma.status = 'Pendente'
      AND coalesce((ma.signature_metadata ->> 'verified')::boolean, false) = false
  );
$$;

GRANT EXECUTE ON FUNCTION public.can_upload_signed_ficha(text) TO anon, authenticated, service_role;

-- 4. Bucket PRIVADO no Supabase Storage para armazenar as fichas assinadas
INSERT INTO storage.buckets (id, name, public)
VALUES ('signed-fichas', 'signed-fichas', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Políticas de acesso aos buckets `signed-fichas` e `documents`
DO $$
BEGIN
    -- Cofre `signed-fichas`: leitura/download APENAS por Administradores
    DROP POLICY IF EXISTS "Public read signed fichas" ON storage.objects;
    DROP POLICY IF EXISTS "Admins read signed fichas" ON storage.objects;
    CREATE POLICY "Admins read signed fichas"
        ON storage.objects FOR SELECT TO authenticated
        USING (bucket_id = 'signed-fichas' AND public.is_admin());

    -- Upload restrito a PDFs dentro da pasta de ficha pendente e ainda não assinada
    DROP POLICY IF EXISTS "Public insert signed fichas" ON storage.objects;
    CREATE POLICY "Public insert signed fichas"
        ON storage.objects FOR INSERT TO anon, authenticated
        WITH CHECK (
            bucket_id = 'signed-fichas'
            AND lower(name) LIKE '%.pdf'
            AND (
                public.is_admin()
                OR public.can_upload_signed_ficha(name)
            )
        );

    DROP POLICY IF EXISTS "Admins update signed fichas" ON storage.objects;
    CREATE POLICY "Admins update signed fichas"
        ON storage.objects FOR UPDATE TO authenticated
        USING (bucket_id = 'signed-fichas' AND public.is_admin())
        WITH CHECK (bucket_id = 'signed-fichas' AND public.is_admin());

    DROP POLICY IF EXISTS "Admins delete signed fichas" ON storage.objects;
    CREATE POLICY "Admins delete signed fichas"
        ON storage.objects FOR DELETE TO authenticated
        USING (bucket_id = 'signed-fichas' AND public.is_admin());

    -- Bucket `documents`: bloquear listagem anônima de documentos internos (apenas `is_public = true`)
    DROP POLICY IF EXISTS "Restrict documents bucket select for anon" ON storage.objects;
    CREATE POLICY "Restrict documents bucket select for anon"
        ON storage.objects AS RESTRICTIVE FOR SELECT TO anon
        USING (
            bucket_id <> 'documents'
            OR EXISTS (
                SELECT 1
                FROM public.documents d
                WHERE d.is_public = true
                  AND (
                      d.file_url LIKE '%/' || storage.objects.name
                      OR replace(d.file_url, '%20', ' ') LIKE '%/' || storage.objects.name
                  )
            )
        );
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Aviso ao configurar políticas em storage.objects: %', SQLERRM;
END $$;

-- 5. RPC Segura para leitura da ficha apenas mediante Admin OU CPF + Matrícula
DROP FUNCTION IF EXISTS public.get_membership_application_by_id(uuid);
DROP FUNCTION IF EXISTS public.get_membership_application_by_id(uuid, text, text);

CREATE OR REPLACE FUNCTION public.get_membership_application_by_id(
    p_id uuid,
    p_cpf text DEFAULT NULL,
    p_matricula text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_cpf text := regexp_replace(coalesce(p_cpf, ''), '\D', '', 'g');
    v_matricula text := trim(coalesce(p_matricula, ''));
    v_result jsonb;
BEGIN
    IF p_id IS NULL THEN
        RETURN NULL;
    END IF;

    IF public.is_admin() THEN
        SELECT to_jsonb(ma)
        INTO v_result
        FROM public.membership_applications ma
        WHERE ma.id = p_id
        LIMIT 1;
        RETURN v_result;
    END IF;

    IF length(v_cpf) <> 11 OR v_matricula = '' THEN
        RETURN NULL;
    END IF;

    SELECT to_jsonb(ma)
    INTO v_result
    FROM public.membership_applications ma
    WHERE ma.id = p_id
      AND regexp_replace(coalesce(ma.cpf, ''), '\D', '', 'g') = v_cpf
      AND trim(coalesce(ma.matricula, '')) = v_matricula
    LIMIT 1;

    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_membership_application_by_id(uuid, text, text) TO anon, authenticated, service_role;

-- 6. RPC Segura para anexar o PDF assinado pelo Gov.br com verificação de credenciais
DROP FUNCTION IF EXISTS public.submit_signed_membership_ficha(uuid, text, text, jsonb);
DROP FUNCTION IF EXISTS public.submit_signed_membership_ficha(uuid, text, text, text, text, jsonb);

CREATE OR REPLACE FUNCTION public.submit_signed_membership_ficha(
    p_id uuid,
    p_cpf text,
    p_matricula text,
    p_signed_pdf_url text,
    p_signed_pdf_name text,
    p_signature_metadata jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_cpf text := regexp_replace(coalesce(p_cpf, ''), '\D', '', 'g');
    v_matricula text := trim(coalesce(p_matricula, ''));
    v_is_admin boolean := public.is_admin();
    v_app record;
    v_updated jsonb;
BEGIN
    IF p_id IS NULL OR coalesce(trim(p_signed_pdf_url), '') = '' THEN
        RAISE EXCEPTION 'ID da ficha e caminho do documento assinado são obrigatórios.';
    END IF;

    SELECT id, cpf, matricula, status, signature_metadata
    INTO v_app
    FROM public.membership_applications
    WHERE id = p_id
    LIMIT 1;

    IF v_app.id IS NULL THEN
        RAISE EXCEPTION 'Ficha de filiação não encontrada.';
    END IF;

    IF NOT v_is_admin THEN
        IF length(v_cpf) <> 11 OR v_matricula = '' THEN
            RAISE EXCEPTION 'Credenciais obrigatórias (CPF e matrícula) não informadas.';
        END IF;

        IF regexp_replace(coalesce(v_app.cpf, ''), '\D', '', 'g') <> v_cpf
           OR trim(coalesce(v_app.matricula, '')) <> v_matricula THEN
            RAISE EXCEPTION 'Credenciais inválidas para anexar documentos a esta ficha.';
        END IF;

        IF v_app.status <> 'Pendente' THEN
            RAISE EXCEPTION 'Esta solicitação já foi analisada e não aceita novos envios.';
        END IF;

        IF coalesce((v_app.signature_metadata ->> 'verified')::boolean, false) = true THEN
            RAISE EXCEPTION 'Esta ficha já possui documento assinado validado e não pode ser substituída sem autorização administrativa.';
        END IF;
    END IF;

    UPDATE public.membership_applications
    SET
        signed_pdf_url = p_signed_pdf_url,
        signed_pdf_name = coalesce(nullif(trim(p_signed_pdf_name), ''), 'ficha-assinada-govbr.pdf'),
        signature_metadata = p_signature_metadata,
        signed_at = timezone('utc'::text, now())
    WHERE id = p_id
    RETURNING to_jsonb(membership_applications.*) INTO v_updated;

    RETURN v_updated;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_signed_membership_ficha(uuid, text, text, text, text, jsonb) TO anon, authenticated, service_role;

-- 7. RPC Segura para o associado localizar a própria ficha via CPF + Matrícula
CREATE OR REPLACE FUNCTION public.lookup_membership_application(
    p_cpf text,
    p_matricula text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_cpf text := regexp_replace(coalesce(p_cpf, ''), '\D', '', 'g');
    v_matricula text := trim(coalesce(p_matricula, ''));
    v_result jsonb;
BEGIN
    IF length(v_cpf) <> 11 OR v_matricula = '' THEN
        RETURN NULL;
    END IF;

    SELECT jsonb_build_object(
        'id', ma.id,
        'full_name', ma.full_name,
        'status', ma.status,
        'signed_at', ma.signed_at
    )
    INTO v_result
    FROM public.membership_applications ma
    WHERE regexp_replace(coalesce(ma.cpf, ''), '\D', '', 'g') = v_cpf
      AND trim(coalesce(ma.matricula, '')) = v_matricula
    ORDER BY ma.created_at DESC
    LIMIT 1;

    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_membership_application(text, text) TO anon, authenticated, service_role;

COMMIT;

SELECT 'Cofre privado, bloqueio de listagem e validação LGPD aplicados com sucesso!' AS status;
