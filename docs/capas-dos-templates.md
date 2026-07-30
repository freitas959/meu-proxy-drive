# Capas dos templates — prompts para gerar no Gemini

Uma imagem por template, para aparecer atrás do primeiro card na vitrine.

## Antes de gerar: as três regras que fazem a capa funcionar

O renderizador desenha o título **por cima** da imagem, ancorado embaixo, e
aplica um degradê que escurece a base. Isso impõe três coisas:

1. **Proporção 4:5 (vertical).** É o formato do card.
2. **Terço inferior escuro e vazio.** É onde o texto entra. Assunto interessante
   fica no terço de cima.
3. **Nenhuma palavra na imagem.** Letra gerada por IA sai torta e ainda briga
   com o título de verdade.

Cole este bloco no fim de cada prompt:

```
Proporção 4:5 vertical. Fotografia realista, sem nenhum texto, letra,
número, logotipo ou marca d'água na imagem. O terço inferior deve ficar
escuro e sem elementos importantes, para receber texto por cima depois.
Sem pessoas identificáveis em primeiro plano.
```

## Como entregar

Salve cada arquivo com o **id do template** no nome — é assim que eu ligo a
imagem ao template certo:

```
insider.webp
advocacia.webp
nutricionista.webp
...
```

WebP ou JPG, no máximo 5 MB, largura entre 1080 e 1440. Me mande os arquivos e
eu coloco em `public/templates/` e preencho o campo `capaUrl` de cada um.

Depois disso, qualquer capa continua trocável pelo estúdio: **Editar** no
template → **Imagem da capa** → **Subir imagem**. A versão do estúdio passa a
valer por cima da que está no código.

---

## Os prompts

### insider — Insider
> Mesa de trabalho vista de cima ao amanhecer, caderno aberto com anotações à
> mão, xícara de café pela metade, caneta atravessada na página. Luz fria de
> janela vindo da esquerda. Madeira escura, clima de quem começou cedo.

### inteligencia-artificial — Inteligência Artificial
> Placa-mãe em macro fotográfico, luz âmbar correndo pelas trilhas de cobre
> como se fosse corrente elétrica. Fundo preto profundo, foco raso, reflexos
> quentes nos componentes.

### advocacia — Advocacia
> Caneta tinteiro apoiada sobre documento impresso em mesa de madeira escura.
> Luz quente de abajur entrando pela lateral, sombra longa atravessando o
> papel. Clima de escritório antigo, silencioso.

### noticias-virais — Notícias Virais
> Banca de jornal iluminada à noite em calçada molhada de chuva. Reflexo de
> letreiros de neon no asfalto, vultos passando borrados pelo movimento.
> Amarelo e âmbar dominando a luz.

### academia-fitness — Academia / Fitness
> Halteres largados no chão de uma academia vazia ao amanhecer. Poeira suspensa
> no facho de luz que entra pela janela alta. Piso de borracha, tons frios com
> um toque de verde.

### clinica-estetica — Clínica de Estética
> Frascos de vidro âmbar alinhados sobre bancada de mármore claro. Luz difusa
> suave vinda de cima, sombras delicadas e alongadas. Composição minimalista,
> muito espaço vazio.

### nutricionista — Nutricionista
> Feira livre pela manhã, caixotes de frutas e verduras coloridas em primeiro
> plano, uma mão escolhendo um tomate. Luz natural, cores saturadas mas
> naturais, movimento leve ao fundo.

### imobiliaria — Imobiliária
> Chave apoiada sobre uma planta baixa impressa, em mesa clara. Luz dourada de
> fim de tarde entrando por uma janela fora de quadro. Foco raso na chave.

### marketing — Marketing
> Parede coberta de post-its coloridos, um único deles em destaque no centro,
> ligeiramente descolado. Luz roxa lateral, ambiente escuro, atmosfera de sala
> de planejamento à noite.

### noticias — Notícias
> Painel de letras giratórias de estação ferroviária com as placas em pleno
> movimento, congeladas pela fotografia. Iluminação fria, metal desgastado.

### dentistas — Dentistas
> Instrumentos odontológicos alinhados com precisão sobre pano azul claro.
> Macro fotográfico, luz clínica difusa, aço polido refletindo. Assepsia
> visível, nada de boca ou pessoa.

### medicos-hospitalar — Médicos / Hospitalar
> Estetoscópio apoiado sobre um jaleco branco dobrado, em superfície clara.
> Luz azulada suave, composição minimalista e centrada, muito espaço negativo.

### beleza-estetica — Beleza e Estética
> Pincéis de maquiagem e frascos dispostos sobre tecido rosado amassado. Luz
> quente difusa, sombras suaves, textura do tecido bem visível.

### educacao-professores — Educação / Professores
> Carteiras vazias de sala de aula em fileira, luz da manhã entrando pelas
> janelas laterais. Giz e apagador na quina da mesa do professor em primeiro
> plano. Tons de madeira e verde-quadro.

### contabilidade-financeiro — Contabilidade e Financeiro
> Calculadora antiga e bloco de anotações sobre mesa de madeira. Luz dourada
> rasante da manhã atravessando o quadro, sombras compridas.

### turismo — Turismo
> Mala aberta pela metade no chão de madeira, mapa dobrado e câmera analógica
> ao lado. Luz de fim de tarde entrando de lado, clima de véspera de viagem.

### pets — Pets
> Coleira e brinquedo de corda largados sobre o tapete da sala. Patas de
> cachorro desfocadas ao fundo, se aproximando. Luz quente de fim de tarde.

### joias-semijoias — Joias e Semijoias
> Anel e corrente delicada sobre veludo escuro. Luz pontual criando um brilho
> controlado no metal, macro fotográfico, resto do quadro em penumbra.

### prompt-claro — Prompt · claro
> Teclado mecânico antigo sobre mesa clara, uma folha de papel em branco ao
> lado, canto levemente dobrado. Luz de estúdio suave, fundo creme, humor seco
> e limpo.

### prompt-escuro — Prompt · escuro
> Luminária de mesa acesa iluminando um caderno fechado num quarto escuro. Um
> único ponto de luz no quadro, o resto em sombra. Minimalista.

### post-rede-social — Post / Rede Social
Este não usa imagem de capa: o layout imita um print de post, com fundo sólido.
Pode pular.
