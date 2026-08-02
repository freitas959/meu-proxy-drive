// Catálogo de templates. Cada template define o VISUAL do carrossel: a IA
// escreve o conteúdo em cima dele. `layout` decide qual renderer desenha o card.

import { CAPAS } from "./capas";

/** Paletas base reutilizadas pelos templates. */
const PRETO = {
  fundo: "#0d0d0d",
  texto: "#ffffff",
  secundaria: "#a8a29a",
  botoes: "#e03e2f",
};

const BRANCO = {
  fundo: "#ffffff",
  texto: "#111111",
  secundaria: "#6b6660",
  botoes: "#ee5b2b",
};

export const FUNDOS = [
  { id: "preto", nome: "Fundo preto", paleta: PRETO },
  { id: "branco", nome: "Fundo branco", paleta: BRANCO },
];

/**
 * Vocabulário de selos que a IA pode carimbar em cada card. Fica por template
 * porque o selo certo muda com o nicho ("DADO" cabe em notícia, não em pet).
 */
const SELOS_PADRAO = [
  "TENDÊNCIA",
  "DADO",
  "MECANISMO",
  "ERRO COMUM",
  "AGORA",
  "ATENÇÃO",
  "PASSO A PASSO",
];

export const TEMPLATES = [
  {
    id: "post-rede-social",
    nome: "Post / Rede Social",
    nicho: null,
    layout: "tweet",
    capaIA: false,
    creditosCapa: 0,
    paleta: BRANCO,
    fontes: { titulo: "Inter", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "Ninguém quer o seu produto. Querem o problema resolvido.",
      texto: "Levei três meses vendendo a coisa errada pra entender isso.",
    },
    selos: ["THREAD", "OPINIÃO", "BASTIDOR", "DADO", "AGORA"],
    descricao:
      "Print de post de rede social. Texto solto, sem peso de design — bom pra opinião e bastidor.",
  },
  {
    id: "insider",
    nome: "Insider",
    nicho: null,
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: PRETO,
    fontes: { titulo: "Anton", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "A parte chata do meu trabalho é a que ninguém posta.",
      texto: "Arrasta pra o lado",
    },
    selos: SELOS_PADRAO,
    cenaCapa:
      "mulher sentada numa cadeira em estúdio de concreto, olhos fechados, folhas de papel congeladas no ar ao redor, luz dura de uma janela só, sombra profunda do outro lado",
    descricao: "Editorial preto com título gigante. O mais versátil da lista.",
  },
  {
    id: "inteligencia-artificial",
    nome: "Inteligência Artificial",
    nicho: { label: "IA", cor: "#ee5b2b" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { ...PRETO, botoes: "#ffb020" },
    fontes: { titulo: "Anton", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "Você pede à IA o que deveria estar decidindo sozinho.",
      texto: "Onde a máquina acelera e onde ela só te deixa mais lento.",
    },
    selos: SELOS_PADRAO,
    cenaCapa:
      "close extremo de um processador sobre placa escura sem serigrafia, luz âmbar rasante pela esquerda brilhando nos contatos de cobre, poeira fina no facho, todo o resto no preto",
    descricao: "Alto contraste com destaque âmbar. Feito pra tema de tecnologia.",
  },
  {
    id: "advocacia",
    nome: "Advocacia",
    nicho: { label: "DIREITO", cor: "#e8c547" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#0d0d0d", texto: "#f5f0e6", secundaria: "#a09a8e", botoes: "#c9a227" },
    fontes: { titulo: "Playfair Display", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "O contrato que você assinou sem ler tem uma cláusula cara.",
      texto: "Onde ela costuma se esconder e o que dá pra fazer agora.",
    },
    selos: ["SEU DIREITO", "PRAZO", "ERRO COMUM", "ATENÇÃO", "NA PRÁTICA"],
    cenaCapa:
      "advogado de terno escuro em biblioteca jurídica clássica, mão apoiada na estante, olhar fora de quadro, luz quente de abajur por trás desenhando o ombro, fundo em bokeh",
    descricao: "Serifada sóbria e dourado. Passa autoridade sem parecer agressivo.",
  },
  {
    id: "noticias-virais",
    nome: "Notícias Virais",
    nicho: { label: "VIRAL", cor: "#e8c547" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#0d0d0d", texto: "#ffffff", secundaria: "#a8a29a", botoes: "#f5c518" },
    fontes: { titulo: "Anton", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "O número que ninguém comentou no meio do anúncio",
      texto: "",
    },
    selos: ["URGENTE", "BOMBA", "REPERCUSSÃO", "DADO", "AGORA"],
    cenaCapa:
      "mulher parada numa avenida movimentada à noite enquanto a multidão passa borrada ao redor, neon refletindo no asfalto molhado, amarelo e âmbar sobre preto",
    descricao: "Marca-texto amarelo no título, estilo manchete de portal.",
  },
  {
    id: "academia-fitness",
    nome: "Academia / Fitness",
    nicho: { label: "FITNESS", cor: "#8ee63f" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#0d0d0d", texto: "#ffffff", secundaria: "#9aa08e", botoes: "#8ee63f" },
    fontes: { titulo: "Anton", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "Treinar todo dia não é disciplina. É pressa.",
      texto: "O descanso é onde o músculo de fato acontece.",
    },
    selos: ["TREINO", "ERRO COMUM", "DADO", "PROGRESSÃO", "AGORA"],
    cenaCapa:
      "atleta descansando entre séries em academia escura, antebraços nos joelhos, cabeça baixa, respiração pesada, luz verde dura vindo de cima e de trás, poeira de magnésio no facho",
    descricao: "Verde neon sobre preto. Energia de treino pesado.",
  },
  {
    id: "clinica-estetica",
    nome: "Clínica de Estética",
    nicho: { label: "ESTÉTICA", cor: "#e8a0b4" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#171310", texto: "#f7efe7", secundaria: "#b9a99b", botoes: "#d9a441" },
    fontes: { titulo: "Playfair Display", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "Procedimento bom é o que ninguém percebe que você fez.",
      texto: "Como reconhecer excesso antes de sentar na cadeira.",
    },
    selos: ["MITO", "VERDADE", "CUIDADO", "PROCEDIMENTO", "ANTES E DEPOIS"],
    cenaCapa:
      "retrato fechado de rosto feminino em três quartos, olhos baixos, pele luminosa e real, fundo neutro escuro, luz suave de softbox pela direita",
    descricao: "Serifada elegante em tons quentes. Clima de clínica premium.",
  },
  {
    id: "nutricionista",
    nome: "Nutricionista",
    nicho: { label: "NUTRIÇÃO", cor: "#6fbf73" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#101410", texto: "#ffffff", secundaria: "#a3b0a3", botoes: "#6fbf73" },
    fontes: { titulo: "Familjen Grotesk", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "A dieta não falhou. Ela nunca coube na sua semana.",
      texto: "Três ajustes que sobrevivem ao dia corrido.",
    },
    selos: ["MITO", "NA PRÁTICA", "DADO", "ERRO COMUM", "CARDÁPIO"],
    cenaCapa:
      "nutricionista rindo em cozinha clara enquanto monta um prato colorido, ervas e legumes na bancada, luz natural de janela grande atrás, bancada em sombra no primeiro plano",
    descricao: "Verde suave e tipografia limpa. Leve, sem tom de dieta punitiva.",
  },
  {
    id: "imobiliaria",
    nome: "Imobiliária",
    nicho: { label: "IMÓVEIS", cor: "#e0913a" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#12100e", texto: "#f6efe6", secundaria: "#b0a595", botoes: "#e0913a" },
    fontes: { titulo: "Familjen Grotesk", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "O imóvel barato que sai caro depois da escritura",
      texto: "Os custos que só aparecem quando a chave já é sua.",
    },
    selos: ["ATENÇÃO", "CUSTO OCULTO", "DADO", "CHECKLIST", "AGORA"],
    cenaCapa:
      "casal de costas em apartamento vazio de alto padrão ao entardecer, olhando a cidade por janelas do chão ao teto, luz dourada entrando, sombras longas no piso",
    descricao: "Dourado quente sobre marrom escuro. Vende sofisticação.",
  },
  {
    id: "marketing",
    nome: "Marketing",
    nicho: { label: "MARKETING", cor: "#8366ff" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#0e0b1a", texto: "#ffffff", secundaria: "#a49ec4", botoes: "#7b5cff" },
    fontes: { titulo: "Familjen Grotesk", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "Você não tem problema de tráfego. Tem problema de promessa.",
      texto: "O teste de uma frase que revela isso em dois dias.",
    },
    selos: ["TENDÊNCIA", "DADO", "MECANISMO", "ERRO COMUM", "TESTE ISSO"],
    cenaCapa:
      "pessoa de perfil em sala escura, rosto iluminado só por luzes roxas e azuis em movimento, expressão concentrada, pontos de luz desfocados atrás",
    descricao: "Roxo neon. Cara de conteúdo de performance e growth.",
  },
  {
    id: "noticias",
    nome: "Notícias",
    nicho: { label: "URGENTE", cor: "#e14638" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#0d0d0d", texto: "#ffffff", secundaria: "#a8a29a", botoes: "#e03e2f" },
    fontes: { titulo: "Familjen Grotesk", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "Mudou hoje: o que isso tira do seu bolso no fim do mês",
      texto: "",
    },
    selos: ["URGENTE", "O QUE MUDA", "DADO", "CONTEXTO", "AGORA"],
    cenaCapa:
      "pessoa na rua à noite olhando o celular, rosto iluminado de baixo pela tela, rastros de faróis borrados atrás, fundo azul frio com um ponto de luz vermelha",
    descricao: "Vermelho de plantão. Direto ao ponto, sem enfeite.",
  },
  {
    id: "dentistas",
    nome: "Dentistas",
    nicho: { label: "ODONTO", cor: "#3fd0d6" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#0a1416", texto: "#ffffff", secundaria: "#93aab0", botoes: "#3fd0d6" },
    fontes: { titulo: "Familjen Grotesk", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "Dente sensível não é frescura. É aviso.",
      texto: "O que costuma estar por trás e quando procurar ajuda.",
    },
    selos: ["MITO", "VERDADE", "CUIDADO", "PROCEDIMENTO", "DADO"],
    cenaCapa:
      "dentista de jaleco em clínica moderna, braços cruzados, sorriso confiante, equipamentos desfocados atrás, luz limpa e uniforme, fundo caindo para azul profundo embaixo",
    descricao: "Ciano clínico. Transmite limpeza e confiança.",
  },
  {
    id: "medicos-hospitalar",
    nome: "Médicos / Hospitalar",
    nicho: { label: "SAÚDE", cor: "#4a90e2" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#0a1018", texto: "#ffffff", secundaria: "#96a5b8", botoes: "#4a90e2" },
    fontes: { titulo: "Familjen Grotesk", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "Cansaço que não passa com o fim de semana merece exame.",
      texto: "O que dá pra investigar antes de virar rotina.",
    },
    selos: ["SINAL DE ALERTA", "DADO", "MITO", "PREVENÇÃO", "PROCURE UM MÉDICO"],
    cenaCapa:
      "médico caminhando em corredor de hospital moderno em direção à câmera, luz azulada do teto, linhas de perspectiva fortes, chão em sombra no primeiro plano",
    descricao: "Azul institucional. Sóbrio, com espaço pra aviso de responsabilidade.",
  },
  {
    id: "beleza-estetica",
    nome: "Beleza e Estética",
    nicho: { label: "BELEZA", cor: "#e07a9a" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#191113", texto: "#fdf3f0", secundaria: "#c0a6a6", botoes: "#e07a9a" },
    fontes: { titulo: "Familjen Grotesk", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "Menos passos, mais constância. É esse o segredo chato.",
      texto: "A rotina mínima que sobrevive ao dia apertado.",
    },
    selos: ["ROTINA", "MITO", "ORDEM CERTA", "ERRO COMUM", "DICA"],
    cenaCapa:
      "mulher tendo o cabelo trabalhado em salão sofisticado, vista pelo reflexo do espelho, expressão calma, luminárias quentes acesas atrás",
    descricao: "Rosa queimado sobre vinho escuro. Rotina de skincare e salão.",
  },
  {
    id: "educacao-professores",
    nome: "Educação / Professores",
    nicho: { label: "EDUCAÇÃO", cor: "#e8c547" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#12100a", texto: "#ffffff", secundaria: "#b0a88e", botoes: "#e8c547" },
    fontes: { titulo: "Familjen Grotesk", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "A turma não parou de prestar atenção. Ela nunca começou.",
      texto: "O que muda nos primeiros cinco minutos da aula.",
    },
    selos: ["NA PRÁTICA", "ERRO COMUM", "DADO", "ESTRATÉGIA", "TESTE ISSO"],
    cenaCapa:
      "professora explicando de pé em sala de aula moderna e clara, gesticulando, animada de verdade, paredes claras e janelas grandes com muita luz do dia, dois alunos desfocados de costas no primeiro plano",
    descricao: "Amarelo giz sobre quadro escuro. Didático sem ser infantil.",
  },
  {
    id: "contabilidade-financeiro",
    nome: "Contabilidade e Financeiro",
    nicho: { label: "FINANÇAS", cor: "#3fbf8f" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#0a1412", texto: "#ffffff", secundaria: "#93b0a6", botoes: "#3fbf8f" },
    fontes: { titulo: "Familjen Grotesk", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "Você não paga imposto demais. Paga no regime errado.",
      texto: "Como saber se chegou a hora de mudar.",
    },
    selos: ["PRAZO", "ATENÇÃO", "DADO", "ECONOMIA", "CHECKLIST"],
    cenaCapa:
      "calculadora mecânica antiga sobre mesa de madeira escura, luz dourada rasante da manhã cavando sombras longas nas teclas, foco raso, fundo dissolvendo em preto",
    descricao: "Verde dinheiro. Bom pra prazo, imposto e comparativo.",
  },
  {
    id: "turismo",
    nome: "Turismo",
    nicho: { label: "VIAGEM", cor: "#f0913a" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#101418", texto: "#ffffff", secundaria: "#9fb0bd", botoes: "#f0913a" },
    fontes: { titulo: "Familjen Grotesk", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "Não é destino caro. É mês errado.",
      texto: "Quando ir pra pagar metade pelo mesmo lugar.",
    },
    selos: ["ROTEIRO", "ECONOMIA", "DICA LOCAL", "QUANDO IR", "CHECKLIST"],
    cenaCapa:
      "viajante de costas num mirante à beira-mar no pôr do sol, roupa balançando ao vento, montanhas encontrando o mar à frente, contraluz com flare suave, rochas em sombra na frente",
    descricao: "Laranja de entardecer. Feito pra roteiro e dica de destino.",
  },
  {
    id: "pets",
    nome: "Pets",
    nicho: { label: "PETS", cor: "#e8c547" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#131009", texto: "#ffffff", secundaria: "#b3a894", botoes: "#e8b53a" },
    fontes: { titulo: "Familjen Grotesk", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "Ele não está te ignorando. Está te entendendo errado.",
      texto: "Como dar um comando que o cachorro consegue seguir.",
    },
    selos: ["COMPORTAMENTO", "MITO", "NA PRÁTICA", "ATENÇÃO", "DICA"],
    cenaCapa:
      "golden retriever sentado olhando atento para uma mão fora de quadro, sala de estar aquecida, luz de fim de tarde pela janela, câmera na altura dos olhos do cachorro, chão em sombra",
    descricao: "Amarelo caramelo. Tom acolhedor pra comportamento e cuidado.",
  },
  {
    id: "joias-semijoias",
    nome: "Joias e Semijoias",
    nicho: { label: "JOIAS", cor: "#d4af37" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#12100b", texto: "#f7f0e2", secundaria: "#b8a882", botoes: "#d4af37" },
    fontes: { titulo: "Playfair Display", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "Banho de ouro tem espessura. É ali que a peça se decide.",
      texto: "O que perguntar antes de comprar.",
    },
    selos: ["COMO ESCOLHER", "MITO", "CUIDADO", "MATERIAL", "DICA"],
    cenaCapa:
      "corrente de ouro fina caída sobre cetim escuro, uma única luz dura rasante criando brilho controlado no metal, macro, tudo além da corrente em preto absoluto",
    descricao: "Dourado sobre preto fosco. Serifada pra peso de marca.",
  },
  {
    id: "hamburgueria",
    nome: "Hamburgueria",
    nicho: { label: "BURGER", cor: "#e8562a" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#140d0a", texto: "#fff6ee", secundaria: "#b09a8c", botoes: "#e8562a" },
    fontes: { titulo: "Anton", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "O ponto da carne muda tudo. E quase ninguém acerta.",
      texto: "Como pedir o seu do jeito certo da próxima vez.",
    },
    selos: ["O PONTO", "INGREDIENTE", "ERRO COMUM", "COMBINA COM", "NOVIDADE"],
    cenaCapa:
      "hambúrguer artesanal em close sobre tábua de madeira escura, queijo escorrendo pela borda, vapor subindo, luz quente dura pela esquerda, cozinha em penumbra ao fundo",
    descricao: "Laranja de brasa sobre marrom queimado. Fome à primeira vista.",
  },
  {
    id: "pizzaria",
    nome: "Pizzaria",
    nicho: { label: "PIZZA", cor: "#e8a33c" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#0f0e0b", texto: "#fdf6e8", secundaria: "#a89a80", botoes: "#e8a33c" },
    fontes: { titulo: "Bebas Neue", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "Massa boa não se faz com pressa. Se faz com tempo.",
      texto: "Por que 48 horas de fermentação mudam a sua pizza.",
    },
    selos: ["MASSA", "FORNO", "INGREDIENTE", "MITO", "COMBINA COM"],
    cenaCapa:
      "pizzaiolo tirando a pizza do forno a lenha na pá de metal, chamas na boca do forno, farinha e faísca no ar, rosto iluminado pelo fogo",
    descricao: "Âmbar de forno a lenha. Condensada e apetitosa.",
  },
  {
    id: "restaurante",
    nome: "Restaurante",
    nicho: { label: "RESTAURANTE", cor: "#c08a4a" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#100e0c", texto: "#f6efe4", secundaria: "#ada191", botoes: "#c08a4a" },
    fontes: { titulo: "Playfair Display", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "O prato que a cozinha faz melhor não é o mais pedido.",
      texto: "O que perguntar ao garçom antes de decidir.",
    },
    selos: ["DO CHEF", "HARMONIZA", "SAZONAL", "BASTIDOR", "RESERVA"],
    cenaCapa:
      "prato montado com cuidado em mesa de restaurante à noite, luz quente baixa de luminária pendente, talheres e taça em foco raso ao lado, fundo escuro",
    descricao: "Cobre sobre preto quente. Clima de jantar, não de delivery.",
  },
  {
    id: "prompt-claro",
    nome: "Prompt · claro",
    nicho: { label: "PROMPT", cor: "#ee5b2b" },
    layout: "chat",
    capaIA: true,
    creditosCapa: 10,
    // Creme e preto, acento laranja: o contraste que faz o balão flutuar.
    paleta: {
      fundo: "#f2ede4",
      texto: "#111111",
      secundaria: "#6b6660",
      botoes: "#ee5b2b",
      fundoAlt: "#111111",
      textoAlt: "#f2ede4",
      secundariaAlt: "#8a837a",
    },
    fontes: { titulo: "Archivo Black", corpo: "Inter" },
    capaUrl: "",
    alternarFundo: true,
    numerarTitulo: true,
    destaqueCaixa: true,
    exemplo: {
      titulo: "O prompt que transforma sua ideia solta em roteiro.",
      texto:
        "Eu ensino [SEU TEMA] para [SEU PÚBLICO]. Me dê 5 ganchos de no máximo 12 palavras, cada um abrindo uma **curiosidade real**. Nada de promessa vazia.",
    },
    selos: ["PROMPT", "COPIE E COLE", "ATALHO", "TESTE ISSO", "FERRAMENTA"],
    cenaCapa:
      "close de um par de mãos paradas sobre teclado moderno em mesa de madeira clara, no instante antes de digitar, luz de manhã pela esquerda, teclas em foco raso",
    descricao:
      "Cada card entrega um prompt pronto dentro de uma caixa de conversa. Fundo alterna claro e escuro.",
  },
  {
    id: "prompt-escuro",
    nome: "Prompt · escuro",
    nicho: { label: "PROMPT", cor: "#7dd3c0" },
    layout: "chat",
    capaIA: true,
    creditosCapa: 10,
    paleta: {
      fundo: "#0e0e10",
      texto: "#f4f4f5",
      secundaria: "#9b9ba1",
      botoes: "#7dd3c0",
    },
    fontes: { titulo: "Inter", corpo: "Inter" },
    capaUrl: "",
    numerarTitulo: true,
    destaqueCaixa: true,
    exemplo: {
      titulo: "A pergunta que destrava quando você já tentou de tudo.",
      texto:
        "Assuma que meu problema é [SEU PROBLEMA]. Liste 5 causas que eu **provavelmente não considerei**, e diga como testar cada uma em um dia.",
    },
    selos: ["PROMPT", "COPIE E COLE", "ATALHO", "TESTE ISSO", "FERRAMENTA"],
    cenaCapa:
      "close de um par de mãos paradas sobre teclado moderno em quarto escuro à noite, no instante antes de digitar, brilho frio de uma tela fora do quadro pegando os nós dos dedos, teclas em foco raso",
    descricao: "Só o modo escuro, sem alternância. Verde-água no lugar do laranja.",
  },
  {
    id: "terapias",
    nome: "Terapia e Psicologia",
    nicho: { label: "TERAPIA", cor: "#7fa693" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#141d1a", texto: "#eef3ef", secundaria: "#9db0a6", botoes: "#7fa693" },
    fontes: { titulo: "Familjen Grotesk", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "Você não está travado. Está esperando ter certeza.",
      texto: "Por que a decisão não vem — e o que costuma destravar.",
    },
    // Sem "SINTOMA" e sem "DIAGNÓSTICO" de propósito: selo de diagnóstico num
    // card de Instagram é o tipo de coisa que o conselho de classe cobra.
    selos: ["PADRÃO", "SINAL", "MITO", "NA PRÁTICA", "ACOLHIMENTO"],
    cenaCapa:
      "mulher sentada perto de uma janela ampla, vista de lado, expressão serena olhando para fora, luz difusa suave por cortina leve, planta desfocada ao fundo",
    descricao: "Verde-sálvia sobre verde escuro. Tom calmo, sem drama.",
  },
  {
    id: "manicure",
    nome: "Manicure e Nail Design",
    nicho: { label: "UNHAS", cor: "#c75e75" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    // O único editorial de fundo claro. O degradê da capa fecha em creme em vez
    // de preto, o que deixa a foto lavada e arejada — é o clima do nicho.
    paleta: { fundo: "#f7efe9", texto: "#241a1c", secundaria: "#8b7a76", botoes: "#c4566f" },
    fontes: { titulo: "Playfair Display", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "Esmalte que descasca não é culpa do esmalte.",
      texto: "O passo da preparação que quase todo mundo pula.",
    },
    selos: ["CUIDADO", "TENDÊNCIA", "ERRO COMUM", "PASSO A PASSO", "DURABILIDADE"],
    cenaCapa:
      "close de mãos bem cuidadas apoiadas sobre superfície de pedra clara, unhas recém-pintadas pegando a luz, luz ampla e suave de cima, fundo creme",
    descricao: "Creme e framboesa, fundo claro. O único claro entre os editoriais.",
  },
  {
    id: "moda",
    nome: "Moda e Estilo",
    nicho: { label: "MODA", cor: "#c9b8a0" },
    layout: "editorial",
    capaIA: true,
    creditosCapa: 10,
    paleta: { fundo: "#1a1917", texto: "#f3efe8", secundaria: "#a79f95", botoes: "#c9b8a0" },
    fontes: { titulo: "Archivo Black", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "A peça mais cara do armário é a que você nunca usa.",
      texto: "Como montar look com o que já está lá dentro.",
    },
    selos: ["TENDÊNCIA", "COMO USAR", "GUARDA-ROUPA", "ERRO COMUM", "COMBINA COM"],
    cenaCapa:
      "mulher caminhando em passo firme por rua urbana, alfaiataria bem cortada, flagrada em movimento com o tecido ainda solto, contraluz de fim de tarde contornando os ombros",
    descricao: "Areia sobre grafite quente. Editorial de moda, sem cor saturada.",
  },
  {
    id: "portfolio",
    nome: "Portfólio / Catálogo",
    nicho: { label: "PORTFÓLIO", cor: "#e8e3dc" },
    layout: "foto",
    // Sem capa por IA: aqui a foto é o trabalho da pessoa. Gerar uma imagem
    // fictícia para um portfólio seria mostrar um serviço que não foi feito.
    capaIA: false,
    creditosCapa: 0,
    paleta: { fundo: "#111110", texto: "#f5f3ef", secundaria: "#a8a49c", botoes: "#e8e3dc" },
    fontes: { titulo: "Familjen Grotesk", corpo: "Inter" },
    capaUrl: "",
    exemplo: {
      titulo: "Cozinha planejada, 12 m²",
      texto: "Marcenaria sob medida em freijó.",
    },
    selos: ["PROJETO", "DETALHE", "ANTES", "ENTREGA", "PROCESSO"],
    descricao:
      "A foto é o conteúdo: imagem cheia, legenda curta embaixo. Pra portfólio, catálogo e lookbook.",
  },
  {
    id: "antes-depois",
    nome: "Antes e Depois",
    nicho: { label: "TRANSFORMAÇÃO", cor: "#4fb286" },
    layout: "antes-depois",
    capaIA: false,
    creditosCapa: 0,
    paleta: { fundo: "#0f1512", texto: "#f0f5f2", secundaria: "#9aa8a0", botoes: "#4fb286" },
    fontes: { titulo: "Familjen Grotesk", corpo: "Inter" },
    capaUrl: "",
    // Dá pra trocar por "DE" e "PARA", "SEMANA 1" e "SEMANA 12" pelo estúdio.
    rotuloAntes: "ANTES",
    rotuloDepois: "DEPOIS",
    exemplo: {
      titulo: "Três sessões, sem retoque",
      texto: "Mesma luz, mesmo ângulo, mesma distância.",
    },
    selos: ["CASO REAL", "SESSÕES", "TÉCNICA", "PRAZO", "MANUTENÇÃO"],
    descricao:
      "Duas fotos por card, empilhadas, com a legenda numa faixa embaixo. Cada card pede duas imagens.",
  },
];

/** Layouts que consomem uma segunda foto por card. */
export function precisaDeDuasFotos(template) {
  return template?.layout === "antes-depois";
}

// A capa de cada template vem de public/templates/, e quem sabe o que existe
// por lá é o mapa gerado por `npm run capas:mapear`. Um `capaUrl` escrito à mão
// no template continua valendo — ele ganha do mapa.
for (const template of TEMPLATES) {
  if (!template.capaUrl && CAPAS[template.id]) template.capaUrl = CAPAS[template.id];
}

export const FONTES_TITULO = [
  "Anton",
  "Familjen Grotesk",
  "Playfair Display",
  "Bebas Neue",
  "Archivo Black",
  "Inter",
];

export const FONTES_CORPO = ["Inter", "Familjen Grotesk", "Roboto", "Lato"];

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || null;
}

/** Busca por nome, nicho ou descrição — alimenta o campo "Buscar template". */
export function buscarTemplates(termo) {
  const q = termo.trim().toLowerCase();
  if (!q) return TEMPLATES;
  return TEMPLATES.filter((t) =>
    [t.nome, t.nicho?.label, t.descricao, ...(t.selos || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}
