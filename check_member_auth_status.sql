-- ==============================================================================
-- FUNÇÃO RPC: check_member_auth_status(p_email text)
-- Objetivo: Validar rigorosamente se um e-mail pertence a um associado ativo
--           e verificar seu status real no Supabase Auth (auth.users).
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

    -- Se não existir em auth.users, nunca fez o Primeiro Acesso
    IF v_user.id IS NULL THEN
        RETURN json_build_object(
            'ok', false,
            'is_active_member', true,
            'reason', 'no_account',
            'message', 'Você ainda não realizou o Primeiro Acesso. Por favor, cadastre sua senha em "Primeiro Acesso" antes de redefini-la.'
        );
    END IF;

    -- Se existe em auth.users mas não confirmou o e-mail
    IF v_user.email_confirmed_at IS NULL AND v_user.confirmed_at IS NULL THEN
        RETURN json_build_object(
            'ok', false,
            'is_active_member', true,
            'reason', 'unconfirmed',
            'message', 'Sua conta ainda não foi ativada. Acesse o "Primeiro Acesso" para confirmar o código enviado ao seu e-mail.'
        );
    END IF;

    -- Conta válida, associado ativo e ativado no auth
    RETURN json_build_object(
        'ok', true,
        'is_active_member', true,
        'reason', 'ok',
        'message', 'OK'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_member_auth_status(text) TO anon, authenticated, service_role;
