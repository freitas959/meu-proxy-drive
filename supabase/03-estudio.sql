-- ============================================================================
-- CarrosseIA — estúdio de templates
-- Já aplicado no projeto oqmonbwiwqyxtphrglsg, depois do 01 e do 02.
-- ============================================================================

-- Admin é coluna, não botão escondido. Esconder no React resolve a aparência;
-- a chave anon é pública e a rota se descobre.
alter table public.perfis
  add column if not exists admin boolean not null default false;

-- Os 19 templates do código continuam no código. Esta tabela SOMA a eles: não
-- houve migração, o app segue utilizável sem banco, e projeto antigo continua
-- abrindo.
create table if not exists public.templates (
  id             text primary key,
  nome           text        not null,
  layout         text        not null default 'editorial',
  nicho          jsonb,
  paleta         jsonb       not null,
  fontes         jsonb       not null,
  selos          jsonb       not null default '[]'::jsonb,
  exemplo        jsonb       not null default '{}'::jsonb,
  cena_capa      text        not null default '',
  capa_url       text        not null default '',
  descricao      text        not null default '',
  -- Estilo por papel do card: capa, conteudo, cta. Cada cor guarda ou uma
  -- referência à paleta do cliente ("@botoes") ou um valor fixo ("#0d0d0d").
  -- É a referência que faz o mesmo template servir a vários nichos.
  estilos        jsonb       not null default '{}'::jsonb,
  capa_ia        boolean     not null default true,
  numerar_titulo boolean     not null default false,
  destaque_caixa boolean     not null default false,
  alternar_fundo boolean     not null default false,
  publicado      boolean     not null default false,
  arquivado      boolean     not null default false,
  criado_por     uuid        references auth.users (id) on delete set null,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

-- Para bancos criados antes destas colunas existirem.
alter table public.templates add column if not exists capa_url text not null default '';
alter table public.templates add column if not exists estilos jsonb not null default '{}'::jsonb;

drop trigger if exists templates_atualizado_em on public.templates;
create trigger templates_atualizado_em
  before update on public.templates
  for each row execute function public.tocar_atualizado_em();

alter table public.templates enable row level security;

-- Em security definer para a policy poder ler `perfis` sem esbarrar no RLS
-- da própria tabela.
create or replace function public.eh_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select admin from public.perfis where id = auth.uid()), false);
$$;

-- Todo mundo logado vê o que está publicado; o admin vê também os rascunhos.
drop policy if exists templates_leitura on public.templates;
create policy templates_leitura on public.templates
  for select to authenticated
  using ((publicado and not arquivado) or public.eh_admin());

drop policy if exists templates_insercao on public.templates;
create policy templates_insercao on public.templates
  for insert to authenticated
  with check (public.eh_admin());

drop policy if exists templates_alteracao on public.templates;
create policy templates_alteracao on public.templates
  for update to authenticated
  using (public.eh_admin())
  with check (public.eh_admin());

-- Sem policy de delete, de propósito: projeto salvo guarda o template_id e
-- deixaria de abrir se a linha sumisse. Arquivar resolve sem perder histórico.

revoke all on public.templates from public, anon, authenticated;
grant select, insert, update on public.templates to authenticated;

revoke all on function public.eh_admin() from public, anon, authenticated;
grant execute on function public.eh_admin() to authenticated;

-- ------------------------------------------------- capa dos templates ------

-- Bucket PÚBLICO, ao contrário do das capas de usuário. A vitrine é vista por
-- todo mundo e URL assinada expira — um catálogo com imagem quebrada depois de
-- uma hora não serve. Aqui não há dado de usuário: é material do produto.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('templates', 'templates', true, 5242880,
        array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public             = true,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ATENÇÃO: bucket público dispensa policy para a URL pública, mas NÃO para o
-- upload. A Storage API insere a linha com RETURNING, e RETURNING exige SELECT
-- na linha recém-criada. Sem esta policy o upload falha com "new row violates
-- row-level security policy" — mensagem que aponta para o INSERT e esconde que
-- o problema é a leitura.
drop policy if exists templates_capa_ler on storage.objects;
create policy templates_capa_ler on storage.objects
  for select to authenticated
  using (bucket_id = 'templates');

drop policy if exists templates_capa_enviar on storage.objects;
create policy templates_capa_enviar on storage.objects
  for insert to authenticated
  with check (bucket_id = 'templates' and public.eh_admin());

drop policy if exists templates_capa_substituir on storage.objects;
create policy templates_capa_substituir on storage.objects
  for update to authenticated
  using (bucket_id = 'templates' and public.eh_admin());

drop policy if exists templates_capa_apagar on storage.objects;
create policy templates_capa_apagar on storage.objects
  for delete to authenticated
  using (bucket_id = 'templates' and public.eh_admin());

-- Para promover alguém a admin:
--   update public.perfis set admin = true where email = 'voce@exemplo.com';
