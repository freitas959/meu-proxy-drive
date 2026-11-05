# Squad de Desenvolvimento — Frontend & Backend

> Documento de referência do squad: quem faz o quê, como trabalhamos e quais padrões seguimos.
> Projeto base: **meu-proxy-drive** (Next.js 15 + React 19, rotas de API em `app/api/`).

---

## 1. Missão do Squad

Entregar, de forma contínua e com qualidade, funcionalidades de ponta a ponta (interface + API) que gerem valor para o usuário final, mantendo o sistema estável, seguro e fácil de evoluir.

**Objetivos permanentes**

- Entregas pequenas e frequentes (deploy pelo menos 1x por semana).
- Zero bug crítico em produção sem correção em até 24h.
- Código revisado por pelo menos 1 pessoa antes do merge.
- Documentação mínima sempre atualizada (README, este arquivo, contratos de API).

---

## 2. Composição do Time

| Papel | Qtd. | Foco principal |
|---|---|---|
| Product Owner (PO) | 1 | Visão do produto, backlog e priorização |
| Tech Lead (TL) | 1 | Arquitetura, padrões técnicos e destravamento do time |
| Dev Frontend | 2 | Interface, experiência do usuário, performance no cliente |
| Dev Backend | 2 | APIs, integrações, dados, segurança |
| UI/UX Designer | 1 | Fluxos, protótipos, design system |
| QA / Analista de Testes | 1 | Estratégia de testes, automação, validação |
| DevOps / SRE (compartilhado) | 0,5 | CI/CD, infraestrutura, observabilidade |
| Agile Master (opcional) | 0,5 | Rituais, métricas e remoção de impedimentos |

Tamanho ideal: **7 a 9 pessoas**.

---

## 3. Papéis e Responsabilidades

### 3.1 Product Owner
- Mantém o backlog priorizado e refinado para pelo menos 2 sprints.
- Escreve histórias com critérios de aceite claros.
- Aceita ou recusa as entregas na Review.
- Ponte entre stakeholders e o time.

### 3.2 Tech Lead
- Define e documenta decisões de arquitetura (ADRs).
- Garante padrões de código, segurança e performance.
- Revisa PRs críticos e faz pareamento com os devs.
- Estima riscos técnicos junto ao PO.

### 3.3 Dev Frontend
- Implementa telas e componentes em **React / Next.js (App Router)**.
- Garante responsividade, acessibilidade (WCAG AA) e boa performance (Core Web Vitals).
- Consome as APIs seguindo o contrato combinado com o backend.
- Escreve testes de componente e de integração no cliente.

**Stack sugerida:** Next.js, React, CSS Modules / Tailwind, React Query ou SWR, Jest + Testing Library, Playwright.

### 3.4 Dev Backend
- Implementa rotas de API (`app/api/**/route.js`) e serviços.
- Integrações externas (ex.: Google Drive), tratamento de erros, timeouts e retries.
- Modelagem e acesso a dados, cache e filas quando necessário.
- Segurança: validação de entrada, autenticação/autorização, rate limiting, CORS restrito.
- Testes unitários e de integração das rotas.

**Stack sugerida:** Node.js, Next.js Route Handlers, Zod (validação), banco relacional (PostgreSQL / Supabase), Redis (cache), Jest/Vitest.

### 3.5 UI/UX Designer
- Pesquisa com usuários e mapeamento de jornadas.
- Protótipos no Figma, entregues antes do início do desenvolvimento.
- Mantém o design system (cores, tipografia, componentes).
- Valida a implementação junto com o frontend (design review).

### 3.6 QA
- Define a estratégia de testes (pirâmide: unitário > integração > E2E).
- Automatiza os fluxos críticos com Playwright.
- Testa cada história contra os critérios de aceite antes do "Done".
- Acompanha bugs e métricas de qualidade.

### 3.7 DevOps / SRE
- Mantém pipelines de CI/CD (lint, testes, build, deploy).
- Ambientes: `dev` → `staging` → `produção`.
- Monitoramento, logs e alertas (ex.: Vercel Analytics, Sentry).
- Gestão de segredos e variáveis de ambiente.

---

## 4. Matriz RACI

R = Responsável · A = Aprovador · C = Consultado · I = Informado

| Atividade | PO | TL | Front | Back | UX | QA | DevOps |
|---|---|---|---|---|---|---|---|
| Priorizar backlog | A/R | C | I | I | C | I | I |
| Definir arquitetura | I | A/R | C | C | I | C | C |
| Protótipo de tela | C | I | C | I | A/R | I | I |
| Contrato de API | I | A | C | R | I | C | I |
| Implementar UI | I | C | R | C | C | I | I |
| Implementar API | I | C | C | R | I | I | I |
| Testes de aceite | A | I | C | C | I | R | I |
| Deploy em produção | I | A | C | C | I | C | R |
| Resposta a incidentes | I | A | C | R | I | C | R |

---

## 5. Rituais (Sprint de 2 semanas)

| Ritual | Quando | Duração | Participantes | Saída |
|---|---|---|---|---|
| Planning | 1º dia da sprint | 2h | Todos | Meta da sprint + backlog da sprint |
| Daily | Todo dia, 9h30 | 15 min | Time de desenvolvimento | Impedimentos visíveis |
| Refinamento | Meio da sprint | 1h | PO, TL, devs, UX, QA | Histórias prontas (DoR) |
| Review | Último dia | 1h | Todos + stakeholders | Feedback sobre o incremento |
| Retrospectiva | Último dia | 1h | Time | 1 a 3 ações de melhoria |
| Sync Front/Back | 2x por semana | 20 min | Devs + TL | Contratos de API alinhados |

---

## 6. Fluxo de Trabalho

```
Backlog → Refinado (DoR) → Em andamento → Code Review → QA → Pronto (DoD) → Produção
```

### 6.1 Definition of Ready (DoR)
Uma história só entra na sprint se:
- [ ] Tem descrição no formato *"Como [usuário], quero [ação], para [benefício]"*.
- [ ] Tem critérios de aceite testáveis.
- [ ] Tem protótipo aprovado (quando envolve tela).
- [ ] Tem contrato de API definido (quando envolve backend).
- [ ] Está estimada e cabe em uma sprint.
- [ ] Dependências identificadas.

### 6.2 Definition of Done (DoD)
- [ ] Código revisado e aprovado em PR.
- [ ] Lint e build passando na CI (`npm run lint`, `npm run build`).
- [ ] Testes escritos e passando (cobertura mínima de 70% no código novo).
- [ ] Validado pelo QA em `staging`.
- [ ] Sem vulnerabilidades críticas conhecidas.
- [ ] Documentação atualizada (README / contrato de API / changelog).
- [ ] Aceito pelo PO.

---

## 7. Integração Frontend ↔ Backend

1. **Contrato primeiro:** backend e frontend combinam o contrato (rota, método, parâmetros, respostas e erros) antes de implementar.
2. **Mocks:** o frontend começa com dados simulados enquanto a API é construída.
3. **Padrão de resposta de erro:**

```json
{
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "Arquivo não encontrado",
    "details": {}
  }
}
```

4. **Exemplo de contrato** (rota existente):

| Item | Valor |
|---|---|
| Rota | `GET /api/stream` |
| Query | `id` (obrigatório) — ID do arquivo no Google Drive · `mode` (opcional) — `json` \| `redirect` \| `preview` |
| 200 | Stream do arquivo com `Content-Type` original |
| 400 | `id` ausente |
| 404 / 5xx | Arquivo inacessível ou falha na origem |

5. **Versionamento:** mudanças que quebram compatibilidade exigem nova versão (`/api/v2/...`) ou feature flag.

---

## 8. Padrões de Código e Git

### Branches
- `main` — sempre estável e pronta para deploy.
- `feat/<descricao-curta>` — nova funcionalidade.
- `fix/<descricao-curta>` — correção.
- `chore/<descricao-curta>` — manutenção, configurações.

### Commits (Conventional Commits)
```
feat(api): adiciona suporte a range requests no stream
fix(ui): corrige layout do player em telas pequenas
docs: atualiza contrato da rota /api/stream
```

### Pull Requests
- Pequenos (idealmente < 400 linhas alteradas).
- Descrição com: o que mudou, por quê, como testar, prints (se for UI).
- Pelo menos 1 aprovação; mudanças de arquitetura exigem aprovação do TL.

### Estrutura de pastas sugerida
```
app/
  (rotas e páginas)
  api/
    stream/route.js
components/      # componentes de UI reutilizáveis
lib/             # serviços, clientes de API, utilitários
tests/           # testes unitários e de integração
e2e/             # testes Playwright
```

---

## 9. Qualidade e Segurança

- **Testes:** unitários (lógica), integração (rotas de API), E2E (fluxos críticos).
- **Performance:** LCP < 2,5s, CLS < 0,1, INP < 200ms.
- **Segurança:**
  - Validar todo parâmetro de entrada (ex.: formato do `id`).
  - Restringir `Access-Control-Allow-Origin` aos domínios permitidos em produção.
  - Rate limiting nas rotas públicas para evitar abuso do proxy.
  - Segredos apenas em variáveis de ambiente, nunca no repositório.
- **Observabilidade:** logs estruturados, rastreamento de erros e alertas para taxa de erro > 2%.

---

## 10. Métricas do Squad

| Métrica | Meta |
|---|---|
| Lead time (história iniciada → produção) | ≤ 5 dias |
| Frequência de deploy | ≥ 1 por semana |
| Taxa de falha em mudanças | < 15% |
| Tempo de recuperação (MTTR) | < 4 horas |
| Previsibilidade (entregue / planejado) | ≥ 80% |
| Bugs escapados para produção por sprint | ≤ 2 |

---

## 11. Comunicação

- **Canal principal:** `#squad-dev` (dúvidas e alinhamentos do dia a dia).
- **Incidentes:** `#squad-incidentes` com o responsável de plantão.
- **Quadro de tarefas:** ClickUp / Jira / GitHub Projects.
- **Documentação:** pasta `docs/` no repositório + decisões em `docs/adr/`.
- **Horário de foco:** 14h–17h sem reuniões.

---

## 12. Onboarding de Novos Membros

1. Acesso ao repositório, quadro de tarefas e canais.
2. Rodar o projeto localmente:
   ```bash
   npm install
   npm run dev
   ```
3. Ler este documento e o `README.md`.
4. Pegar uma tarefa marcada como `good-first-issue`.
5. Pareamento com um dev da mesma área na primeira semana.

---

*Última atualização: novembro de 2026.*
