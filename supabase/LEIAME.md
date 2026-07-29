# Banco de dados

Dois arquivos, nesta ordem, no **SQL Editor** do projeto Supabase:

1. `01-esquema.sql` — tabelas, funções de crédito, RLS, permissões
2. `02-storage.sql` — bucket das imagens e as políticas dele

Cole o conteúdo inteiro de cada um, execute, e confira que a resposta é
`Success`. Os dois são idempotentes: rodar de novo não duplica nada nem
apaga dados.

## O que cada tabela guarda

| Tabela       | Para quê |
| ------------ | -------- |
| `perfis`     | um por usuário do Auth; é aqui que mora o saldo de créditos |
| `projetos`   | template, paleta, fontes, roteiro e legenda de cada carrossel |
| `transacoes` | histórico de todo débito e estorno — auditoria e limite diário |
| `config`     | os limites do disjuntor, editáveis sem publicar código |

## As duas regras que sustentam o resto

**O saldo não é editável pelo cliente.** A permissão concedida em `perfis` é
só `select`. Quem mexe em créditos são as funções `debitar()` e `estornar()`,
que rodam em `security definer`. Mesmo com a chave anon em mãos e o DevTools
aberto, não existe caminho para se dar crédito.

**Um débito é atômico.** `debitar()` trava a linha do perfil com
`select ... for update` antes de conferir o saldo. Duas requisições
simultâneas do mesmo usuário não gastam o mesmo crédito duas vezes.

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

## O que eu testei

Rodei o `01-esquema.sql` num Postgres 16 local com `auth.users`, `auth.uid()`
e os papéis `anon`/`authenticated` simulados. Passaram:

- perfil criado automaticamente no cadastro, com 9 créditos
- débito, estorno e histórico de transações
- recusa de saldo insuficiente, quantia inválida (0, negativa) e sem sessão
- RLS: um usuário não lê, não edita nem apaga dados do outro
- tentativa de se dar crédito via `update` → `permission denied`
- tentativa de inserir transação direto → `permission denied`
- leitura de `config` pelo cliente → `permission denied`
- limite diário por usuário e limite global barrando na hora certa
- concorrência: saldo 3, dois pedidos de 3 ao mesmo tempo → um passa, o outro
  é recusado. Sem a trava os dois passariam e o saldo iria a −3.

**O `02-storage.sql` não foi testado aqui** — o esquema `storage` só existe
dentro do Supabase. A lógica das políticas é a mesma dos outros arquivos
(`(storage.foldername(name))[1] = auth.uid()::text`, ou seja, a primeira pasta
do caminho é o dono), mas quem confirma é o primeiro upload real.

## Caminho dos arquivos no bucket

```
{usuario_id}/{projeto_id}/{indice}.png
```

O bucket é privado: nada é servido sem URL assinada.
