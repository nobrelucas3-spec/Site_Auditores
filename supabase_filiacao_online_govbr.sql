-- ==============================================================================
-- FLUXO DE FILIAÇÃO 100% ONLINE + VALIDAÇÃO GOV.BR (COM TRAVA DE CREDENCIAIS)
-- ==============================================================================
-- 1. Exige credenciais (CPF + Matrícula) ou sessão Admin para consultar a ficha.
-- 2. Exige credenciais (CPF + Matrícula) ou sessão Admin para anexar o PDF
--    assinado pelo Gov.br e impede sobrescrita após validação ou aprovação.
-- 3. Restringe o bucket `signed-fichas` para aceitar somente arquivos .pdf.
-- ==============================================================================

BEGIN;

-- 1. Novas colunas na tabela `public.membership_applications`
ALTER TABLE public.membership_applications
    ADD COLUMN IF NOT EXISTS signed_pdf_url text,
    ADD COLUMN IF NOT EXISTS signed_pdf_name text,
    ADD COLUMN IF NOT EXISTS signature_metadata jsonb,
    ADD COLUMN IF NOT EXISTS signed_at timestamp with time zone;

-- 2. Bucket no Supabase Storage para armazenar as fichas assinadas em PDF
INSERT INTO storage.buckets (id, name, public)
VALUES ('signed-fichas', 'signed-fichas', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de acesso ao bucket 'signed-fichas'
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public read signed fichas" ON storage.objects;
    CREATE POLICY "Public read signed fichas"
        ON storage.objects FOR SELECT TO anon, authenticated
        USING (bucket_id = 'signed-fichas');

    DROP POLICY IF EXISTS "Public insert signed fichas" ON storage.objects;
    CREATE POLICY "Public insert signed fichas"
        ON storage.objects FOR INSERT TO anon, authenticated
        WITH CHECK (
            bucket_id = 'signed-fichas'
            AND lower(name) LIKE '%.pdf'
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
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Aviso ao configurar políticas do bucket signed-fichas: %', SQLERRM;
END $$;

-- 3. RPC Segura para leitura da ficha apenas mediante Admin OU CPF + Matrícula
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

-- 4. RPC Segura para anexar o PDF assinado pelo Gov.br com verificação de credenciais
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
        RAISE EXCEPTION 'ID da ficha e URL do documento assinado são obrigatórios.';
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

-- 5. RPC Segura para o associado localizar a própria ficha via CPF + Matrícula
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

SELECT 'Migração de filiação online e proteção por credenciais aplicada com sucesso!' AS status;
