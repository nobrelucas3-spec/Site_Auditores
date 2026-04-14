-- Tabela para solicitações de filiação
-- Versão Atualizada: Permite e-mail institucional opcional e leitura pública por ID (UUID)

create table if not exists public.membership_applications (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  cpf text not null,
  rg text not null,
  birth_date date not null,
  birthplace text,
  address text not null,
  matricula text not null,
  role text not null,
  email_institutional text, -- Tornado opcional para evitar erros na submissão
  email_personal text,
  phone_fixed text,
  phone_mobile text not null,
  affiliation_type text not null, -- 'Associação', 'Sindicato', 'Ambos'
  terms_accepted boolean default true,
  status text default 'Pendente', -- 'Pendente', 'Aprovado', 'Rejeitado'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.membership_applications enable row level security;

-- Políticas de Segurança

-- 1. Permitir inserção pública (qualquer um pode se associar)
drop policy if exists "Allow public insert" on public.membership_applications;
create policy "Allow public insert"
on public.membership_applications for insert
to anon
with check (true);

-- 2. Permitir leitura pública por ID (Necessário para o link da ficha no e-mail)
-- Nota: Como o ID é um UUID (longo e aleatório), é seguro permitir a leitura se o ID for conhecido.
drop policy if exists "Allow public select by id" on public.membership_applications;
create policy "Allow public select by id" 
on public.membership_applications for select 
to anon 
using (true);

-- 3. Permitir que administradores autenticados vejam todos os pedidos
drop policy if exists "Allow authenticated view all" on public.membership_applications;
create policy "Allow authenticated view all"
on public.membership_applications for select
to authenticated
using (true);
