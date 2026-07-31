# Capas dos templates — prompts para gerar no Gemini

Uma imagem por template, para aparecer atrás do primeiro card na vitrine.

> **Versão 2.** A primeira leva de prompts gerou imagens corretas tecnicamente e
> sem graça nenhuma. Três erros meus: tirei as pessoas (e são elas que param o
> dedo), pus papel e caderno no centro — objeto que carrega texto convida o
> modelo a escrever garrancho — e escrevi cenas vagas demais, que devolvem cara
> de banco de imagem. Refeito com pessoa onde o nicho é sobre gente, objeto onde
> é sobre coisa, e direção fotográfica de verdade em cada um.

## O jeito rápido: gerar em lote pela API

Não precisa colar prompt no AI Studio uma por uma. A chave do Gemini que já
está no `.env.local` serve, e o script faz todas:

```powershell
npm run capas -- pizzaria                  # um template, 3 variações
npm run capas -- pizzaria hamburgueria     # vários
npm run capas -- --todas                   # todos que ainda não têm capa
npm run capas -- --todas --variacoes 4
npm run capas -- pizzaria --forcar         # refazer um que já tem
```

Os arquivos caem em `public/templates/` como `pizzaria-1.png`, `pizzaria-2.png`
e assim por diante. **Escolha a melhor de cada e renomeie para `pizzaria.png`**,
sem o número. As descartadas você apaga.

Depois de renomear, rode:

```powershell
npm run capas:mapear
```

Ele varre a pasta e escreve `lib/capas.js`, que é como o app descobre quais
capas existem. Sem isso a imagem fica lá parada e o card continua com o fundo
abstrato. Só entra arquivo cujo nome seja exatamente o id de um template — as
numeradas ficam de fora, de propósito.

Cada imagem é uma chamada paga na sua conta do Google. O script diz quantas vai
gerar antes de começar, e espera dois segundos entre uma e outra para não
esbarrar no limite por minuto.

O texto exato de cada prompt vive em `scripts/prompts-capas.mjs`. Este
documento é a versão para ler, com a explicação de cada escolha.

## As três regras que o renderizador impõe

O título é desenhado **por cima** da imagem, ancorado embaixo, com um degradê
que escurece a base. Daí:

1. **4:5 vertical.** É o formato do card.
2. **Assunto centralizado, com folga nas bordas de cima e de baixo.** Quem tira
   o assunto de baixo do título não é o prompt — é o `desenharCapa()` do
   `lib/render.js`, que corta uma fatia do topo e ancora o centro da foto acima
   do bloco de texto. O prompt só precisa garantir que os ~15% de cima (que o
   render descarta) e os ~15% de baixo (que o véu escurece) não tenham nada
   essencial.
3. **Nenhuma palavra na imagem.** E, mais importante que pedir isso: **não
   coloque papel, tela ou placa como protagonista**. Se o objeto pede texto, o
   modelo escreve.

> **Por que não se pede mais "assunto na metade de cima".** Foi tentado duas
> vezes — "terço superior", depois "metade de cima" — e o modelo continuou
> centralizando o prato, o rosto e a máquina de escrever, que caíam debaixo do
> texto. Posição de assunto é problema de layout, não de redação de prompt.
> Resolvido no render, funciona com qualquer imagem que chegar, inclusive as
> que já estavam geradas.

## O bloco técnico

Cole no fim de todo prompt:

```
Vertical 4:5 composition. Photorealistic editorial photograph, full-frame
camera, natural film grain.

FRAMING: centre the main subject in the frame, at a comfortable distance —
not a tight crop. Leave breathing room at the top and bottom edges: the top
15% and the bottom 15% of the image are trimmed in layout, so no face, no
product and no essential detail may touch either edge.

No text, letters, numbers, logos or watermarks anywhere in the image. No real
or recognizable public figures.
```

*(4:5 vertical, fotografia editorial realista. Assunto centralizado, sem corte
apertado. Folga nas bordas: os 15% de cima e os 15% de baixo são descartados no
layout, então nada essencial pode encostar neles. Nenhum texto, letra, número,
logo ou marca d'água. Nenhuma pessoa real ou reconhecível.)*

O texto exato dos prompts vive em `scripts/prompts-capas.mjs`, e é de lá que o
script lê. Os trechos abaixo servem para você entender cada escolha.

## Como usar

Gere **três ou quatro variações de cada** e escolha pelo terço inferior mais
limpo — é o critério que mais importa aqui, mais que a beleza da cena.

Descarte sem dó quando a mão sair com dedo a mais, que é o defeito mais comum
em imagem com gente. Enquadramentos onde a mão está ocupada ou fora de quadro
já reduzem bastante isso, e os prompts abaixo foram escritos assim.

## Como entregar

Nomeie cada arquivo com o **id do template**:

```
insider.webp
advocacia.webp
nutricionista.webp
```

WebP ou JPG, até 5 MB, largura entre 1080 e 1440. Me mande que eu coloco em
`public/templates/` e preencho o `capaUrl` de cada um. Depois disso, qualquer
capa continua trocável pelo estúdio, em **Editar → Imagem da capa**.

---

# Os prompts

## Com pessoa

### insider — Insider
```
A woman in her thirties sitting alone in a bare concrete studio, leaning back
in a wooden chair, eyes closed, exhausted but composed. Loose sheets of paper
suspended in mid-air around her, frozen in motion. Hard directional light from
a single tall window on camera left, deep black shadows on the right. 35mm
lens, slight motion blur on the papers. Desaturated grey and black grade.
```
*Mulher parada numa cadeira, papéis congelados no ar em volta, luz dura de uma
janela só. Foi a cena do original, e funciona.*

### advocacia — Advocacia
```
A man in his fifties wearing a dark tailored suit, standing in a classic law
library, one hand resting on a bookshelf, looking off camera with quiet
authority. Warm tungsten lamp glow behind him creating a rim light along his
shoulder. 85mm f/1.8, shallow depth of field, bookshelves dissolving into
bokeh. Deep amber and near-black grade.
```
*Advogado de terno na estante, luz quente por trás desenhando o ombro.*

### noticias-virais — Notícias Virais
```
A young woman standing still in a crowded avenue at night while everyone
around her moves in motion blur, looking past the camera. Neon signage
reflecting on wet asphalt. 35mm, 1/15s shutter, handheld documentary feel.
Yellow and amber neon against deep black.
```
*Ela parada, a multidão borrada em volta. O contraste de movimento é o que
segura o olho.*

### academia-fitness — Academia / Fitness
```
An athlete resting between sets in a dark gym, forearms on knees, head down,
breathing hard, sweat on the shoulders. Single hard lime-green light from high
behind, chalk dust suspended in the beam. 50mm, low camera angle. Black
background, green rim light as the only colour.
```
*O descanso, não o esforço — combina com o texto do template.*

### clinica-estetica — Clínica de Estética
```
Close portrait of a woman's face turned three quarters, eyes lowered, luminous
untouched skin, against a deep neutral backdrop. Single large softbox on camera
right with gentle falloff into shadow. 85mm f/2, shallow focus on the
cheekbone. Warm champagne and dark chocolate grade.
```
*Retrato fechado, pele real, fundo escuro. Sem plástico.*

### nutricionista — Nutricionista
```
A nutritionist in a bright kitchen laughing mid-gesture while plating a
colourful bowl, fresh herbs and vegetables scattered on the counter. Soft
daylight from a large window behind her. 35mm, natural colour, greens
dominant. Foreground counter falling into shadow.
```
*Gesto e riso de verdade, não pose de banco de imagem.*

### imobiliaria — Imobiliária
```
A couple seen from behind standing in an empty high-end apartment at dusk,
looking out floor-to-ceiling windows at the city skyline. Warm golden light
flooding in, long shadows across the bare floor. 24mm wide, architectural
framing. Amber and deep brown grade.
```
*De costas resolve o rosto e ainda conta a história melhor.*

### marketing — Marketing
```
A young person in profile in a dark room, face lit only by shifting purple and
blue light, focused expression. Out-of-focus point lights behind. 85mm f/1.4,
heavy bokeh. Violet and magenta grade over near-black.
```

### noticias — Notícias
```
A person standing on a night street checking a phone, face lit from below by
the screen glow, blurred traffic light streaks behind. 50mm, shallow depth of
field, urgent documentary feel. Cold blue background with a single red light
source.
```
*A tela ilumina o rosto mas fica fora de foco — nada de texto legível.*

### dentistas — Dentistas
```
A dentist in scrubs standing in a modern clinic, arms crossed, warm confident
smile, blurred equipment behind. Clean even lighting. 50mm f/2. Cyan and white
palette, background falling off to deep teal at the bottom of the frame.
```

### medicos-hospitalar — Médicos / Hospitalar
```
A doctor walking down a modern hospital corridor toward the camera, mid-stride,
slightly soft focus. Cool blue light from ceiling panels, strong perspective
lines. 50mm, shallow depth of field. Blue and steel grade, foreground floor in
shadow.
```

### beleza-estetica — Beleza e Estética
```
A woman having her hair worked on in an upscale salon, seen through a mirror
reflection, calm expression, warm lamps glowing behind her. 50mm f/1.8, shallow
depth of field. Dusty rose and deep wine grade.
```
*O reflexo no espelho dá camada e resolve o enquadramento.*

### educacao-professores — Educação / Professores
```
A teacher mid-explanation in front of a class, gesturing with one hand,
genuinely animated. Students in the foreground rendered as dark out-of-focus
silhouettes. Warm morning light from side windows. 35mm. Chalk yellow
highlights against a dark board.
```
*As silhuetas dos alunos criam a moldura escura embaixo naturalmente.*

### turismo — Turismo
```
A traveller standing on a coastal viewpoint at sunset, seen from behind, wind
in their clothes, mountains meeting the sea ahead. Backlit by the low sun, soft
lens flare. 35mm. Orange and teal grade, foreground rocks in deep shadow.
```

### pizzaria — Pizzaria
```
A pizzaiolo pulling a pizza out of a wood-fired oven on a long metal peel,
flames visible inside the oven mouth, flour dust and sparks suspended in the
air, face lit from below by the fire. 35mm, slight motion blur on the peel.
Amber and deep black grade, everything below the oven in shadow.
```
*O fogo faz a luz e ainda escurece embaixo sozinho.*

### pets — Pets
```
A golden retriever sitting and looking up attentively at a hand just outside
the frame, in a warm living room, late afternoon light through a window. 50mm
f/1.8, shallow depth of field, camera at the dog's eye level. Caramel and amber
grade, floor in shadow.
```
*A mão fora de quadro evita o defeito mais comum e ainda sugere o comando.*

## Com objeto

### inteligencia-artificial — Inteligência Artificial
```
A dark workshop bench with a partially disassembled machine, amber work light
raking across brushed metal, fine dust suspended in the beam. 100mm macro,
extreme shallow focus on one component, everything else swallowed by black.
```
*Troquei a placa de circuito: é a imagem mais batida que existe pra IA.*

### hamburgueria — Hamburgueria
```
Extreme close-up of a handmade burger on a dark wooden board, melted cheese
spilling over the edge, steam rising, sesame bun with a soft sheen. Hard warm
light from camera left, deep shadow on the right. 100mm macro, very shallow
depth of field. Ember orange and burnt brown grade, kitchen behind in darkness.
```

### restaurante — Restaurante
```
A carefully plated dish on a dark restaurant table at night, lit by a single
warm pendant lamp from above, cutlery and a wine glass slightly out of focus
beside it. 50mm f/2, shallow depth of field. Copper and near-black grade, the
tablecloth falling into shadow toward the bottom of the frame.
```

### contabilidade-financeiro — Contabilidade e Financeiro
```
Close-up of an old mechanical calculator on a dark wooden desk, raking golden
morning light from the left carving long shadows across the keys. 100mm macro,
shallow focus on the key row. Deep green and gold grade, background dissolving
into black.
```

### joias-semijoias — Joias e Semijoias
```
A single fine gold chain draped over dark satin, one hard pin light raking
across the metal creating a controlled specular highlight. 100mm macro, extreme
shallow depth of field. Everything beyond the chain in complete black.
```

### prompt-claro — Prompt · claro
```
An old mechanical typewriter on a cream-coloured table, three-quarter view, one
completely blank sheet of paper curling out of the roller. Soft overhead studio
light, clean minimal set. 50mm. Warm cream and black palette, table surface
darkening toward the bottom edge.
```
*A folha tem que estar explicitamente em branco, senão vem garrancho.*

### prompt-escuro — Prompt · escuro
```
A single desk lamp switched on in an otherwise pitch-dark room, its cone of
cold light falling on an empty desk surface. Everything else in near-total
darkness. 35mm. Teal-tinted white light, black background.
```

## Sem capa

### post-rede-social — Post / Rede Social
O layout imita um print de post, com fundo sólido. Não usa imagem.
