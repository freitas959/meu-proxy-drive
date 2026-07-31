-- ============================================================================
-- 04 · Projetos no banco
--
-- Rode DEPOIS do 01. É pequeno de propósito: a tabela `projetos`, o índice, o
-- trigger de `atualizado_em`, as quatro políticas de RLS e os grants já vieram
-- no 01. Faltava só um campo.
--
-- Até agora os projetos viviam no localStorage do navegador. Na prática isso
-- queria dizer: carrossel criado numa máquina não existia na outra, e limpar o
-- navegador apagava tudo.
-- ============================================================================

-- O wizard guarda nome e foto de quem assina o carrossel (usado pelo layout de
-- post). Era o único campo do objeto sem coluna correspondente — sem ele, quem
-- abrisse um projeto salvo perderia a assinatura.
alter table public.projetos
  add column if not exists perfil jsonb not null default '{}'::jsonb;

-- ---------------------------------------------------------------- conferência
-- Depois de rodar, isto tem que devolver as 12 colunas, com `perfil` entre elas:
--
--   select column_name, data_type
--     from information_schema.columns
--    where table_schema = 'public' and table_name = 'projetos'
--    order by ordinal_position;
--
-- E isto tem que devolver as quatro políticas (leitura, insercao, alteracao,
-- exclusao), todas amarradas em auth.uid():
--
--   select policyname, cmd from pg_policies
--    where schemaname = 'public' and tablename = 'projetos';
--
-- Se `select` devolver projeto de outro usuário, PARE: o RLS não está valendo.
