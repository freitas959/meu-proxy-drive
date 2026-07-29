# Banco de dados

Aplicado no projeto `oqmonbwiwqyxtphrglsg`. Os arquivos aqui são o registro do
que está lá, e recriam o banco do zero nesta ordem:

1. `01-esquema.sql` — tabelas, funções de crédito, RLS, permissões
2. `02-storage.sql` — bucket das imagens e as políticas dele

Os dois são idempotentes: rodar de novo não duplica nada nem apaga dados.

## O que cada tabela guarda

| Tabela       | Para quê |
| ------------ | -------- |
| `perfis`     | um por usuário do Auth; é aqui que mora o saldo de créditos |
| `projetos`   | template, paleta, fontes, roteiro e legenda de cada carrossel |
| `transacoes` | histórico de todo débito e estorno — auditoria e limite diário |
| `config`     | os limites do disjuntor, editáveis sem publicar código |

## As três regras que sustentam o resto

**O saldo não é editável pelo cliente.** Em `perfis` o navegador tem `select` e
nada mais. Quem mexe em crédito são as funções, que rodam em `security definer`.

**Débito e estorno vivem em lados opostos.** `debitar()` usa `auth.uid()` e pode
ficar exposta: o pior que alguém faz chamando direto é queimar o próprio saldo.
`estornar()` credita, então recebe o usuário por parâmetro e só a `service_role`
executa — o servidor chama, depois de validar a sessão. Se ela estivesse
concedida a `authenticated`, qualquer pessoa logada chamaria
`/rest/v1/rpc/estornar` com a quantia que quisesse.

**Um débito é atômico.** `debitar()` trava a linha do perfil com
`select ... for update` antes de conferir o saldo. Duas requisições
simultâneas do mesmo usuário não gastam o mesmo crédito duas vezes.

## A armadilha das permissões

O Supabase mantém um `alter default privileges` no schema `public` que concede
**ALL** em toda tabela e função nova para `anon` e `authenticated`. Um
`grant select` não é a permissão — é um acréscimo a um ALL que já estava lá.
Por isso o esquema faz `revoke all` antes de conceder, e desarma o default para
o que vier depois.

Se um dia você criar uma tabela pela interface do Supabase, confira as
permissões dela:

```sql
select table_name, grantee, string_agg(privilege_type, ',') 
  from information_schema.role_table_grants
 where table_schema='public' and grantee in ('anon','authenticated')
 group by table_name, grantee;
```

## Limites

Ficam em `config`, na chave `limites`:

```sql
update public.config
   set valor = '{"limite_diario_usuario": 60,
                 "limite_diario_global": 2000,
                 "cadastro_aberto": true}'::jsonb
 where chave = 'limites';
```

O cadastro é aberto, então o teto diário global é o que impede uma enxurrada
de contas novas de queimar a fatura da API numa madrugada. Para travar um
usuário específico sem apagar a conta dele:

```sql
update public.perfis set bloqueado = true where email = 'quem@exemplo.com';
```

## Conta ilimitada

```sql
update public.perfis set ilimitado = true where email = 'voce@exemplo.com';
```

Gera sem gastar crédito e sem esbarrar no teto diário pessoal. **O teto global
continua valendo** — se algo entrar em laço e disparar mil chamadas, é a fatura
da API que sangra, e esse é o único freio.

O consumo continua sendo registrado em `transacoes`, com ` (ilimitado)` no
motivo. Sem isso não haveria como saber quanto a conta de casa custa de API:

```sql
select date_trunc('day', criado_em) as dia, -sum(quantia) as creditos_equivalentes
  from public.transacoes
 where quantia < 0 and motivo like '%(ilimitado)'
 group by 1 order by 1 desc;
```

## O que foi testado no banco de verdade

Com dois usuários de teste, criados e apagados depois:

- perfil criado automaticamente pelo gatilho, com 9 créditos
- débito de 3 → saldo 6; estorno pelo servidor → volta a 9
- cliente chamando `estornar` → `permission denied for function estornar`
- cliente dando `update` no próprio saldo → `permission denied for table perfis`
- cliente inserindo transação → `permission denied for table transacoes`
- cliente lendo `config` → `permission denied for table config`
- débito além do saldo → `saldo_insuficiente`; quantia negativa → `quantia_invalida`
- Ana inserindo projeto no nome do Bruno → violação de RLS
- Ana enxerga 1 projeto, 1 perfil e 1 transação: os dela

Os limites diários e a corrida de concorrência foram testados antes, num
Postgres local com o mesmo esquema: saldo 3, dois pedidos de 3 ao mesmo tempo,
um passa e o outro é recusado.

O advisor de segurança do Supabase está limpo, fora um INFO sobre `config` ter
RLS sem policy — que é exatamente a intenção.

## Caminho dos arquivos no bucket

```
{usuario_id}/{projeto_id}/{indice}.png
```

O bucket é privado, limitado a 8 MB por arquivo, e só aceita PNG, JPEG, WebP e
SVG. Nada é servido sem URL assinada.
