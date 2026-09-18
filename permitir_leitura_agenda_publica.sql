-- ============================================================================
-- SCRIPT DE PERMISSÕES: LEITURA PÚBLICA DA AGENDA DA DIRETORIA EXECUTIVA
-- ============================================================================
-- Permite que filiados e consultas pelo portal leiam com segurança a agenda
-- e os apontamentos de reuniões da Diretoria Executiva da Associação.
-- ============================================================================

-- 1. Garantir RLS habilitado
ALTER TABLE public.de_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_pautas ENABLE ROW LEVEL SECURITY;

-- 2. Recriar políticas de leitura irrestrita para reuniões da Diretoria
DROP POLICY IF EXISTS "DE meetings viewable by authenticated" ON public.de_meetings;
DROP POLICY IF EXISTS "DE meetings viewable by all" ON public.de_meetings;
CREATE POLICY "DE meetings viewable by all"
ON public.de_meetings FOR SELECT
USING (true);

-- 3. Recriar políticas de leitura irrestrita para pautas vinculadas a reuniões
DROP POLICY IF EXISTS "Meeting pautas viewable by authenticated" ON public.meeting_pautas;
DROP POLICY IF EXISTS "Meeting pautas viewable by all" ON public.meeting_pautas;
CREATE POLICY "Meeting pautas viewable by all"
ON public.meeting_pautas FOR SELECT
USING (true);

-- 4. Conceder permissão de SELECT para os papéis da API Supabase
GRANT SELECT ON TABLE public.de_meetings TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.meeting_pautas TO anon, authenticated, service_role;

SELECT 'Permissões da agenda pública aplicadas com sucesso!' AS status;
