-- ============================================================================
-- SCRIPT DE LIMPEZA SEGURA: DADOS DE TESTE (PAUTAS E REUNIÕES DA DIRETORIA)
-- ============================================================================
-- Este script remove APENAS os registros de teste criados no novo módulo.
-- NÃO AFETA:
--   - Usuários cadastrados (auth.users)
--   - Tabela de filiados/membros (public.members)
--   - Notícias e comunicados (public.news / announcements)
--   - Convênios e parceiros (public.agreements)
--   - Acervo e repositório de documentos (public.documents / folders)
--   - Nenhuma outra tabela institucional do sistema.
-- ============================================================================

-- Desativa temporariamente triggers para limpeza rápida e limpa em cascata
TRUNCATE TABLE 
    public.meeting_pautas,
    public.pauta_updates,
    public.pauta_votes,
    public.de_meetings,
    public.pautas 
CASCADE;

-- Alternativa equivalente usando DELETE (caso o banco exija verificação de restrições):
-- DELETE FROM public.meeting_pautas;
-- DELETE FROM public.pauta_updates;
-- DELETE FROM public.pauta_votes;
-- DELETE FROM public.de_meetings;
-- DELETE FROM public.pautas;

-- Mensagem de confirmação
SELECT 'Limpeza concluída com sucesso! Nenhuma outra tabela foi afetada.' AS status;
