-- ============================================================================
-- CarrosseIA — esquema inicial
-- Já aplicado no projeto oqmonbwiwqyxtphrglsg. Este arquivo é o registro do
-- que está lá e serve para recriar o banco do zero, na ordem.
-- ============================================================================

-- ---------------------------------------------------------------- tabelas ---

-- Um perfil por usuário do Auth. É aqui que mora o saldo de créditos: fora do
-- alcance do navegador, que é o ponto de existir backend.
create table if not exists public.perfis (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text,
  creditos      integer     not null default 9 check (creditos >= 0),
  bloqueado     boolean     not null default false,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.projetos (
  id            uuid primary key default gen_random_uuid(),
  usuario_id    uuid        not null references auth.users (id) on delete cascade,
  titulo        text        not null default 'Carrossel sem título',
  template_id   text        not null,
  paleta        jsonb       not null default '{}'::jsonb,
  fontes        jsonb       not null default '{}'::jsonb,
  tamanho       text        not null default 'retrato',
  handle        text        not null default '',
  roteiro       jsonb       not null default '[]'::jsonb,
  legenda       text        not null default '',
  capa_estilo   text        not null default 'foto',
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists projetos_usuario_idx
  on public.projetos (usuario_id, atualizado_em desc);

-- Todo débito e todo estorno viram uma linha aqui. Serve de auditoria e é o
-- que permite medir consumo por dia sem confiar no cliente.
create table if not exists public.transacoes (
  id         uuid primary key default gen_random_uuid(),
  usuario_id uuid        not null references auth.users (id) on delete cascade,
  quantia    integer     not null,               -- negativo debita, positivo credita
  motivo     text        not null,
  projeto_id uuid        references public.projetos (id) on delete set null,
  criado_em  timestamptz not null default now()
);

create index if not exists transacoes_usuario_dia_idx
  on public.transacoes (usuario_id, criado_em desc);

-- Disjuntor: dá pra apertar os limites sem publicar código novo.
create table if not exists public.config (
  chave text primary key,
  valor jsonb not null
);

insert into public.config (chave, valor) values
  ('limites', '{"limite_diario_usuario": 60, "limite_diario_global": 2000, "cadastro_aberto": true}'::jsonb)
on conflict (chave) do nothing;

-- ------------------------------------------------------- perfil automático ---

-- Cria o perfil no mesmo instante em que o Auth cria o usuário, senão a
-- primeira requisição do recém-cadastrado esbarra num perfil inexistente.
create or replace function public.ao_criar_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists criar_perfil on auth.users;
create trigger criar_perfil
  after insert on auth.users
  for each row execute function public.ao_criar_usuario();

-- ------------------------------------------------------------- créditos -----

-- Débito atômico, amarrado a quem chamou. O `for update` trava a linha do
-- perfil: duas requisições simultâneas do mesmo usuário não conseguem gastar
-- o mesmo saldo duas vezes.
--
-- Esta pode ficar exposta ao cliente. O pior que um usuário faz chamando
-- direto é queimar o próprio saldo — não existe caminho para ganhar crédito.
create or replace function public.debitar(
  p_quantia   integer,
  p_motivo    text,
  p_projeto_id uuid default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_usuario        uuid := auth.uid();
  v_saldo          integer;
  v_gasto_hoje     integer;
  v_gasto_global   integer;
  v_limites        jsonb;
  v_limite_usuario integer;
  v_limite_global  integer;
begin
  if v_usuario is null then
    raise exception 'sem_sessao' using errcode = '28000';
  end if;

  if p_quantia is null or p_quantia <= 0 then
    raise exception 'quantia_invalida' using errcode = '22023';
  end if;

  select valor into v_limites from public.config where chave = 'limites';
  v_limite_usuario := coalesce((v_limites->>'limite_diario_usuario')::integer, 60);
  v_limite_global  := coalesce((v_limites->>'limite_diario_global')::integer, 2000);

  select creditos into v_saldo
    from public.perfis
   where id = v_usuario and not bloqueado
     for update;

  if v_saldo is null then
    raise exception 'perfil_indisponivel' using errcode = '28000';
  end if;

  if v_saldo < p_quantia then
    raise exception 'saldo_insuficiente' using errcode = '22023';
  end if;

  select coalesce(-sum(quantia), 0) into v_gasto_hoje
    from public.transacoes
   where usuario_id = v_usuario
     and quantia < 0
     and criado_em >= date_trunc('day', now());

  if v_gasto_hoje + p_quantia > v_limite_usuario then
    raise exception 'limite_diario_usuario' using errcode = '22023';
  end if;

  select coalesce(-sum(quantia), 0) into v_gasto_global
    from public.transacoes
   where quantia < 0
     and criado_em >= date_trunc('day', now());

  if v_gasto_global + p_quantia > v_limite_global then
    raise exception 'limite_diario_global' using errcode = '22023';
  end if;

  update public.perfis
     set creditos = creditos - p_quantia,
         atualizado_em = now()
   where id = v_usuario;

  insert into public.transacoes (usuario_id, quantia, motivo, projeto_id)
  values (v_usuario, -p_quantia, p_motivo, p_projeto_id);

  return v_saldo - p_quantia;
end;
$$;

-- Devolve o crédito quando a chamada à IA falha depois do débito.
--
-- Esta NÃO pode ficar exposta ao cliente, e por isso recebe o usuário por
-- parâmetro em vez de usar auth.uid(): quem chama é o servidor, com a service
-- role, depois de já ter validado a sessão. Se ela estivesse concedida a
-- `authenticated`, qualquer pessoa logada chamaria /rest/v1/rpc/estornar com
-- a quantia que quisesse e o sistema de créditos deixaria de existir.
drop function if exists public.estornar(integer, text);

create or replace function public.estornar(
  p_usuario uuid,
  p_quantia integer,
  p_motivo  text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_saldo integer;
begin
  if p_usuario is null then
    raise exception 'usuario_ausente' using errcode = '22023';
  end if;

  if p_quantia is null or p_quantia <= 0 then
    raise exception 'quantia_invalida' using errcode = '22023';
  end if;

  update public.perfis
     set creditos = creditos + p_quantia,
         atualizado_em = now()
   where id = p_usuario
  returning creditos into v_saldo;

  if v_saldo is null then
    raise exception 'perfil_indisponivel' using errcode = '28000';
  end if;

  insert into public.transacoes (usuario_id, quantia, motivo)
  values (p_usuario, p_quantia, p_motivo);

  return v_saldo;
end;
$$;

-- --------------------------------------------------------- atualizado_em ----

create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists projetos_atualizado_em on public.projetos;
create trigger projetos_atualizado_em
  before update on public.projetos
  for each row execute function public.tocar_atualizado_em();

-- ------------------------------------------------------------------ RLS -----

alter table public.perfis     enable row level security;
alter table public.projetos   enable row level security;
alter table public.transacoes enable row level security;
alter table public.config     enable row level security;

-- O `(select auth.uid())` no lugar de `auth.uid()` faz o Postgres avaliar a
-- função uma vez por consulta em vez de uma vez por linha.

-- Perfis: cada um vê o seu. Créditos NÃO entram aqui — só as funções acima
-- mexem no saldo, e elas rodam com security definer.
drop policy if exists perfis_leitura on public.perfis;
create policy perfis_leitura on public.perfis
  for select using ((select auth.uid()) = id);

-- Projetos: dono faz tudo.
drop policy if exists projetos_leitura on public.projetos;
create policy projetos_leitura on public.projetos
  for select using ((select auth.uid()) = usuario_id);

drop policy if exists projetos_insercao on public.projetos;
create policy projetos_insercao on public.projetos
  for insert with check ((select auth.uid()) = usuario_id);

drop policy if exists projetos_alteracao on public.projetos;
create policy projetos_alteracao on public.projetos
  for update using ((select auth.uid()) = usuario_id)
           with check ((select auth.uid()) = usuario_id);

drop policy if exists projetos_exclusao on public.projetos;
create policy projetos_exclusao on public.projetos
  for delete using ((select auth.uid()) = usuario_id);

-- Transações: leitura do próprio histórico. Escrita só pelas funções.
drop policy if exists transacoes_leitura on public.transacoes;
create policy transacoes_leitura on public.transacoes
  for select using ((select auth.uid()) = usuario_id);

-- Config: sem policy nenhuma, de propósito. Sem policy = sem acesso.

-- ------------------------------------------------------------ permissões ----

-- ATENÇÃO, e foi o que quase passou batido: o Supabase mantém um
-- `alter default privileges` no schema public que concede ALL em toda tabela
-- e função nova para anon e authenticated. Um `grant select` aqui não seria a
-- permissão — seria um acréscimo a um ALL que já estava lá. Por isso zera
-- primeiro e concede depois.

revoke all on public.perfis     from anon, authenticated;
revoke all on public.projetos   from anon, authenticated;
revoke all on public.transacoes from anon, authenticated;
revoke all on public.config     from anon, authenticated;

revoke all on function public.ao_criar_usuario()                from public, anon, authenticated;
revoke all on function public.tocar_atualizado_em()             from public, anon, authenticated;
revoke all on function public.debitar(integer, text, uuid)      from public, anon, authenticated;
revoke all on function public.estornar(uuid, integer, text)     from public, anon, authenticated;

grant usage on schema public to anon, authenticated;

grant select on public.perfis to authenticated;                       -- saldo: só olhar
grant select, insert, update, delete on public.projetos to authenticated;
grant select on public.transacoes to authenticated;                   -- histórico: só olhar

grant execute on function public.debitar(integer, text, uuid) to authenticated;
grant execute on function public.estornar(uuid, integer, text) to service_role;

-- E o mesmo cuidado para o que vier depois.
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;
