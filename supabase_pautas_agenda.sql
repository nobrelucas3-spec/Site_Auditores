-- ============================================================================
-- SCRIPT DE CRIAÇÃO: MÓDULO DE PAUTAS E AGENDA DA DIRETORIA EXECUTIVA
-- ============================================================================

-- 1. TABELA DE PAUTAS DOS ASSOCIADOS
create table if not exists public.pautas (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null, -- 'Carreira e Remuneração', 'Condições de Trabalho', 'Prerrogativas', 'Saúde e Benefícios', 'Tecnologia e Processos', 'Institucional', 'Outros'
  description text not null,
  status text not null default 'aberta', -- 'aberta', 'em_analise_de', 'priorizada_de', 'em_negociacao', 'atendida', 'arquivada', 'unificada'
  is_prioritized boolean default false,
  priority_note text, -- Justificativa da Diretoria para priorização estratégica
  de_considerations text, -- Parecer oficial / considerações da Diretoria Executiva
  current_progress text, -- Resumo do andamento atual
  support_count integer default 1, -- Nasce com 1 apoio (do criador)
  oppose_count integer default 0,
  score integer default 1, -- support_count - oppose_count
  created_by uuid references auth.users(id) on delete set null,
  unified_into_pauta_id uuid references public.pautas(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. TABELA DE VOTOS / MANIFESTAÇÕES DOS ASSOCIADOS (SIGILOSA)
create table if not exists public.pauta_votes (
  id uuid default gen_random_uuid() primary key,
  pauta_id uuid references public.pautas(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  vote_type text not null check (vote_type in ('support', 'oppose')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_pauta_vote unique (pauta_id, user_id)
);

-- 3. TABELA DE ANDAMENTOS / LINHA DO TEMPO DA PAUTA
create table if not exists public.pauta_updates (
  id uuid default gen_random_uuid() primary key,
  pauta_id uuid references public.pautas(id) on delete cascade not null,
  title text not null,
  description text not null,
  event_date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABELA DE AGENDA DA DIRETORIA EXECUTIVA (DE)
create table if not exists public.de_meetings (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  meeting_date date not null,
  meeting_time text,
  meeting_type text not null default 'Ordinária', -- 'Ordinária', 'Extraordinária', 'Reunião com Presidência do TCE-PE', 'Audiência Externa', 'Outro'
  location text, -- 'Sede da Associação', 'Online via Teams', etc.
  status text not null default 'agendada', -- 'agendada', 'realizada', 'cancelada'
  general_deliberations text, -- Ata / resumo geral das deliberações
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TABELA DE VÍNCULO REUNIÃO DA DE <-> PAUTA
create table if not exists public.meeting_pautas (
  id uuid default gen_random_uuid() primary key,
  meeting_id uuid references public.de_meetings(id) on delete cascade not null,
  pauta_id uuid references public.pautas(id) on delete cascade not null,
  discussion_notes text, -- Apontamentos da discussão sobre a pauta
  deliberation_result text, -- Encaminhamento / decisão da DE para essa pauta
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_meeting_pauta unique (meeting_id, pauta_id)
);

-- ============================================================================
-- TRIGGERS E FUNÇÕES PARA ATUALIZAÇÃO AUTOMÁTICA DE SALDO DE VOTOS
-- ============================================================================

-- Função para recalcular os contadores da pauta
create or replace function public.recalculate_pauta_scores()
returns trigger as $$
declare
  target_pauta_id uuid;
  v_support integer;
  v_oppose integer;
begin
  if (TG_OP = 'DELETE') then
    target_pauta_id := OLD.pauta_id;
  else
    target_pauta_id := NEW.pauta_id;
  end if;

  select 
    count(*) filter (where vote_type = 'support'),
    count(*) filter (where vote_type = 'oppose')
  into v_support, v_oppose
  from public.pauta_votes
  where pauta_id = target_pauta_id;

  update public.pautas
  set 
    support_count = v_support,
    oppose_count = v_oppose,
    score = (v_support - v_oppose),
    updated_at = timezone('utc'::text, now())
  where id = target_pauta_id;

  return null;
end;
$$ language plpgsql security definer;

-- Trigger disparado após insert, update ou delete em pauta_votes
drop trigger if exists trigger_recalculate_pauta_scores on public.pauta_votes;
create trigger trigger_recalculate_pauta_scores
after insert or update or delete on public.pauta_votes
for each row execute function public.recalculate_pauta_scores();

-- ============================================================================
-- FUNÇÃO RPC: REGISTRAR / ALTERAR / REMOVER VOTO (SIGILOSA)
-- ============================================================================
create or replace function public.cast_pauta_vote(
  p_pauta_id uuid,
  p_vote_type text -- 'support', 'oppose' ou null para remover
)
returns json as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Usuário não autenticado');
  end if;

  if p_vote_type is null or p_vote_type = '' then
    -- Remover voto
    delete from public.pauta_votes
    where pauta_id = p_pauta_id and user_id = v_user_id;
    return json_build_object('success', true, 'action', 'removed');
  elsif p_vote_type in ('support', 'oppose') then
    -- Inserir ou atualizar voto
    insert into public.pauta_votes (pauta_id, user_id, vote_type, updated_at)
    values (p_pauta_id, v_user_id, p_vote_type, timezone('utc'::text, now()))
    on conflict (pauta_id, user_id)
    do update set vote_type = excluded.vote_type, updated_at = timezone('utc'::text, now());
    return json_build_object('success', true, 'action', 'voted', 'vote_type', p_vote_type);
  else
    return json_build_object('success', false, 'error', 'Tipo de voto inválido');
  end if;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- FUNÇÃO RPC: CRIAR PAUTA COM 1º APOIO AUTOMÁTICO DO CRIADOR
-- ============================================================================
create or replace function public.create_pauta_with_initial_vote(
  p_title text,
  p_category text,
  p_description text
)
returns json as $$
declare
  v_user_id uuid;
  v_new_pauta_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Usuário não autenticado');
  end if;

  -- 1. Cria a pauta
  insert into public.pautas (
    title,
    category,
    description,
    status,
    created_by,
    support_count,
    oppose_count,
    score
  ) values (
    p_title,
    p_category,
    p_description,
    'aberta',
    v_user_id,
    1,
    0,
    1
  ) returning id into v_new_pauta_id;

  -- 2. Insere o voto de apoio do criador
  insert into public.pauta_votes (pauta_id, user_id, vote_type)
  values (v_new_pauta_id, v_user_id, 'support');

  return json_build_object('success', true, 'pauta_id', v_new_pauta_id);
end;
$$ language plpgsql security definer;

-- ============================================================================
-- FUNÇÃO RPC: UNIFICAÇÃO DE PAUTAS PELA DIRETORIA EXECUTIVA
-- ============================================================================
create or replace function public.unify_pautas(
  p_source_pauta_id uuid,
  p_target_pauta_id uuid
)
returns json as $$
begin
  if p_source_pauta_id = p_target_pauta_id then
    return json_build_object('success', false, 'error', 'Pauta de origem e destino não podem ser a mesma.');
  end if;

  -- Migrar votos da pauta de origem para destino sem duplicar
  insert into public.pauta_votes (pauta_id, user_id, vote_type)
  select p_target_pauta_id, user_id, vote_type
  from public.pauta_votes
  where pauta_id = p_source_pauta_id
  on conflict (pauta_id, user_id) do nothing;

  -- Marcar pauta de origem como unificada
  update public.pautas
  set 
    status = 'unificada',
    unified_into_pauta_id = p_target_pauta_id,
    current_progress = 'Pauta unificada com proposta similar pela Diretoria Executiva.',
    updated_at = timezone('utc'::text, now())
  where id = p_source_pauta_id;

  -- Forçar recalculo dos scores
  perform public.recalculate_pauta_scores();

  return json_build_object('success', true);
end;
$$ language plpgsql security definer;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
alter table public.pautas enable row level security;
alter table public.pauta_votes enable row level security;
alter table public.pauta_updates enable row level security;
alter table public.de_meetings enable row level security;
alter table public.meeting_pautas enable row level security;

-- Políticas para pautas (todos os autenticados podem ver e cadastrar)
create policy "Pautas viewable by authenticated"
on public.pautas for select to authenticated using (true);

create policy "Pautas insertable by authenticated"
on public.pautas for insert to authenticated with check (true);

create policy "Pautas updateable by authenticated"
on public.pautas for update to authenticated using (true);

-- Políticas para votos (SIGILO TOTAL: usuário só vê e altera o seu próprio voto)
create policy "Users can view only their own vote"
on public.pauta_votes for select to authenticated
using (user_id = auth.uid());

create policy "Users can insert their own vote"
on public.pauta_votes for insert to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own vote"
on public.pauta_votes for update to authenticated
using (user_id = auth.uid());

create policy "Users can delete their own vote"
on public.pauta_votes for delete to authenticated
using (user_id = auth.uid());

-- Políticas para andamentos
create policy "Pauta updates viewable by authenticated"
on public.pauta_updates for select to authenticated using (true);

create policy "Pauta updates insertable by authenticated"
on public.pauta_updates for insert to authenticated with check (true);

-- Políticas para reuniões da DE
create policy "DE meetings viewable by authenticated"
on public.de_meetings for select to authenticated using (true);

create policy "DE meetings writeable by authenticated"
on public.de_meetings for insert to authenticated with check (true);

create policy "DE meetings updateable by authenticated"
on public.de_meetings for update to authenticated using (true);

-- Políticas para vínculos reunião <-> pauta
create policy "Meeting pautas viewable by authenticated"
on public.meeting_pautas for select to authenticated using (true);

create policy "Meeting pautas writeable by authenticated"
on public.meeting_pautas for insert to authenticated with check (true);

create policy "Meeting pautas updateable by authenticated"
on public.meeting_pautas for update to authenticated using (true);

-- ============================================================================
-- PERMISSÕES EXPLICITAS SUPABASE (GRANT ALL)
-- ============================================================================
grant all on table public.pautas to anon, authenticated, service_role;
grant all on table public.pauta_votes to anon, authenticated, service_role;
grant all on table public.pauta_updates to anon, authenticated, service_role;
grant all on table public.de_meetings to anon, authenticated, service_role;
grant all on table public.meeting_pautas to anon, authenticated, service_role;
