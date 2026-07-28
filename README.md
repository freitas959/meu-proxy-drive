# CarrosseIA

Gerador de carrosséis de Instagram com IA, em Next.js. O fluxo tem quatro
passos: escolher template → descrever o tema → ajustar o roteiro → baixar as
imagens.

## Rodando

```bash
npm install
cp .env.example .env.local   # e preencha ANTHROPIC_API_KEY
npm run dev
```

O app fica em `/app`. Sem `ANTHROPIC_API_KEY` a interface funciona normalmente,
mas as rotas de geração respondem 503 com uma mensagem explicando.

## Como está montado

```
app/
  page.js              landing
  app/page.js          o wizard de 4 passos (orquestra o estado)
  aprendizado|planos|projetos/
  api/roteiro          Claude escreve o roteiro (tool use → JSON)
  api/capa             capa da IA nos dois estilos (foto ou ilustração)
  api/importar         distribui um texto que o usuário já tem
  api/materia          lê um link e extrai o texto da página
  api/stream           proxy do Google Drive (pré-existente, fora do app)
components/            chrome + os quatro passos + o canvas de prévia
lib/
  templates.js         catálogo dos 19 templates (paleta, fontes, selos)
  render.js            renderizador dos cards em canvas
  store.js             créditos e projetos (localStorage)
```

### Renderização

Os cards são desenhados em `<canvas>` a 1080px de largura (1:1 ou 4:5) e
exibidos reduzidos por CSS — a prévia na tela é exatamente o PNG que sai no
download. O renderizador cuida de quebra de linha, ajuste automático do corpo
da fonte, destaque de termos marcados com `**asteriscos**`, selo, rodapé com
paginação e botões.

Capas sem imagem ganham um fundo abstrato gerado proceduralmente a partir da
paleta do template, com semente determinística — o mesmo template produz sempre
a mesma cena.

### A capa da IA

São dois estilos, escolhidos no passo 2, e ambos chegam ao canvas como data URL
pelo mesmo caminho das fotos que o usuário sobe:

- **Foto realista** — Gemini Flash Image ("nano banana"). Usamos o Flash e não o
  Pro porque o diferencial do Pro é desenhar texto dentro da imagem, e o texto
  dos cards é desenhado pelo nosso canvas, com tipografia nítida e editável. O
  prompt pede o terço inferior escuro e vazio, que é onde o título cai.
- **Ilustração** — Claude devolve um SVG restrito a primitivas, validado no
  servidor (sem `<text>`, `<image>`, script ou referência externa) antes de ir
  pro cliente.

O app funciona sem `GEMINI_API_KEY`: só a opção de foto responde 503, com uma
mensagem sugerindo a ilustração.

As webfonts entram por `<link>` no layout (e não por `next/font`) porque o
canvas precisa delas registradas em `document.fonts` sob o nome da família.
O usuário também pode subir a própria fonte, que é registrada via `FontFace`.

### Créditos

Contabilizados no `localStorage` (`lib/store.js`), 30 iniciais. Gerar roteiro
custa 3, importar texto 1 e a capa ilustrada 10. Baixar não custa nada, já que
o desenho acontece no navegador. O débito acontece antes da chamada e é
estornado se ela falhar. Trocar por contas de verdade é uma mudança contida
nesse módulo.

## Limitações conhecidas

- Créditos e projetos são por navegador; não há autenticação.
- Os projetos salvos guardam o roteiro e os ajustes, não as imagens — elas são
  redesenhadas sob demanda para não estourar a cota do `localStorage`.
- `/api/materia` depende de a página alvo permitir leitura pelo servidor;
  paywall e bloqueio de bot fazem o app seguir só com o tema digitado.
- Os planos em `/planos` apenas ajustam o saldo local: não há cobrança ligada.
