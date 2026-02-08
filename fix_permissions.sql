-- 1. Habilitar RLS (segurança) na tabela
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Documentos Públicos" ON public.documents;
DROP POLICY IF EXISTS "Documentos para Membros" ON public.documents;
DROP POLICY IF EXISTS "Upload de Documentos" ON public.documents;
DROP POLICY IF EXISTS "Excluir Documentos" ON public.documents;

-- 3. Criar Novas Políticas

-- Permite LEITURA PÚBLICA apenas se 'is_public' for true
CREATE POLICY "Leitura Pública" ON public.documents
FOR SELECT USING (is_public = true);

-- Permite LEITURA TOTAL para qualquer usuário logado (membro)
CREATE POLICY "Leitura Membros" ON public.documents
FOR SELECT TO authenticated USING (true);

-- Permite INSERIR (Upload) para qualquer usuário logado
CREATE POLICY "Upload Membros" ON public.documents
FOR INSERT TO authenticated WITH CHECK (true);

-- Permite EXCLUIR para qualquer usuário logado (ou restrinja a admin se preferir)
CREATE POLICY "Excluir Membros" ON public.documents
FOR DELETE TO authenticated USING (true);

-- Permite ATUALIZAR para qualquer usuário logado
CREATE POLICY "Atualizar Membros" ON public.documents
FOR UPDATE TO authenticated USING (true);
