-- 1. Create Documents Table
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text not null, -- 'Financeiro', 'Estatuto', 'Ata', etc.
  year integer,
  file_url text not null,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.documents enable row level security;

-- 3. Policies
-- Public read access for public documents
create policy "Allow public read access for public documents"
on public.documents for select
using (is_public = true);

-- Authenticated read access for all documents (members can see private docs too, or filter by logic)
-- Assuming all members can see all documents for now
create policy "Allow authenticated read access"
on public.documents for select
to authenticated
using (true);

-- Admin write access (for now, allow all authenticated to upload - ideally restrict to admin email)
-- For this MVP, we trust authenticated users or assume only admins have the link
create policy "Allow authenticated insert"
on public.documents for insert
to authenticated
with check (true);

create policy "Allow authenticated delete"
on public.documents for delete
to authenticated
using (true);
