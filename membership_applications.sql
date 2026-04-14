-- Tabela para solicitações de filiação
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
  email_institutional text not null,
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

-- Políticas
-- Apenas permitir inserção pública (qualquer um pode se associar)
create policy "Allow public insert"
on public.membership_applications for insert
with check (true);

-- Apenas membros autenticados (ou admins futuramente) podem ver os pedidos
create policy "Allow authenticated view"
on public.membership_applications for select
to authenticated
using (true);
