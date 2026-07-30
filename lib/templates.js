// Catálogo de templates. Cada template define o VISUAL do carrossel: a IA
// escreve o conteúdo em cima dele. `layout` decide qual renderer desenha o card.

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
      "mesa de trabalho vista de cima ao amanhecer, caderno aberto com anotações à mão, xícara pela metade, luz fria de janela",
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
      titulo: "Você está pedindo à IA o que deveria estar decidindo sozinho.",
      texto: "Onde a máquina acelera e onde ela só te deixa mais lento.",
    },
    selos: SELOS_PADRAO,
    cenaCapa:
      "placa-mãe em macro com luz âmbar correndo pelas trilhas, fundo preto profundo, foco raso",
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
      "caneta tinteiro sobre documento impresso em mesa de madeira escura, luz quente de abajur vinda do lado, sombra longa",
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
      "banca de jornal iluminada à noite em calçada molhada, reflexo de neon no asfalto, movimento borrado ao fundo",
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
      "halteres largados no chão de academia vazia ao amanhecer, poeira suspensa no facho de luz da janela",
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
      "frascos de vidro âmbar alinhados sobre mármore claro, luz difusa suave, sombras delicadas, composição minimalista",
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
      "feira livre pela manhã, caixotes de frutas e verduras, mão escolhendo um tomate, luz natural",
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
      "chave sobre planta baixa impressa em mesa clara, luz dourada de fim de tarde entrando pela janela",
    descricao: "Dourado quente sobre marrom escuro. Vende sofisticação.",
  },
  {
    id: "marketing",
    nome: "Marketing",
    nicho: { label: "MARKETING", cor: "#7b5cff" },
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
      "parede coberta de post-its com um único em destaque no centro, luz roxa lateral, ambiente escuro",
    descricao: "Roxo neon. Cara de conteúdo de performance e growth.",
  },
  {
    id: "noticias",
    nome: "Notícias",
    nicho: { label: "URGENTE", cor: "#e03e2f" },
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
      "painel de letras giratórias de estação com as placas em movimento, iluminação fria, movimento congelado",
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
      "instrumentos odontológicos alinhados sobre pano azul claro, macro, luz clínica difusa",
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
      "estetoscópio sobre jaleco dobrado em superfície clara, luz azulada suave, composição minimalista",
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
      "pincéis e frascos dispostos sobre tecido rosado amassado, luz quente difusa, sombras suaves",
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
      "carteiras vazias de sala de aula com luz da manhã pela janela, giz e apagador na quina da mesa",
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
      "calculadora antiga e bloco de notas sobre mesa de madeira, luz dourada rasante da manhã",
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
      "mala aberta pela metade com mapa dobrado e câmera antiga sobre chão de madeira, luz de fim de tarde",
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
      "coleira e brinquedo de corda sobre tapete da sala, patas desfocadas ao fundo, luz quente de fim de tarde",
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
      "anel e corrente sobre veludo escuro, luz pontual criando brilho controlado, macro fotográfico",
    descricao: "Dourado sobre preto fosco. Serifada pra peso de marca.",
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
      "teclado antigo sobre mesa clara com uma folha em branco ao lado, luz de estúdio suave, humor seco",
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
      "luminária de mesa acesa sobre caderno fechado em quarto escuro, um único ponto de luz, minimalista",
    descricao: "Só o modo escuro, sem alternância. Verde-água no lugar do laranja.",
  },
];

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
