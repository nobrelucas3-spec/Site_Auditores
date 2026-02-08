-- 1. Criar Tabela de Documentos
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  file_url text not null, -- URL do arquivo no Storage
  category text not null, -- Ex: 'Atas', 'Financeiro', 'Jurídico'
  is_public boolean default false, -- Se true, aparece na Transparência. Se false, só logado.
  year integer, -- Para filtrar por ano (2025, 2026...)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar Segurança (RLS)
alter table public.documents enable row level security;

-- 3. Políticas de Acesso
-- Leitura Pública para documentos marcados como 'is_public'
create policy "Documentos Públicos" on public.documents
  for select using (is_public = true);

-- Leitura para Membros Logados (Vê tudo)
create policy "Documentos para Membros" on public.documents
  for select to authenticated using (true);

-- Insert/Update (Apenas Admins - Aqui simplificado para autenticados por enquanto ou manual via dashboard)
create policy "Upload de Documentos" on public.documents
  for insert to authenticated with check (true);

-- INSTRUÇÕES PARA O STORAGE (Buckets):
-- 1. No menu do Supabase, vá em "Storage"
-- 2. Crie um novo Bucket chamado "documents"
-- 3. Deixe-o como "Public" se quiser facilitar, ou "Private" configurando políticas.
--    Recomendação: Public bucket para facilitar leitura, mas controle via tabela quem vê o link.
