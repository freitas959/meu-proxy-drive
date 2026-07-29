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
    exemplo: {
      titulo: "Eu perdia um dia inteiro fazendo 1 carrossel.",
      texto: "Hoje a IA faz em 2 minutos pra mim, veja como.",
    },
    selos: ["THREAD", "OPINIÃO", "BASTIDOR", "DADO", "AGORA"],
    descricao:
      "Print de post de rede social. Texto solto, sem peso de design — funciona pra opinião e bastidor.",
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
    exemplo: {
      titulo: "O método que permite publicar 30 posts por semana em menos de 2 horas.",
      texto: "Arrasta pra o lado",
    },
    selos: SELOS_PADRAO,
    cenaCapa:
      "pessoa sentada numa cadeira em estúdio de concreto, folhas de papel voando ao redor, luz dura lateral, atmosfera editorial",
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
    exemplo: {
      titulo: "IA não vai roubar seu emprego. Quem domina IA vai.",
      texto: "",
    },
    selos: SELOS_PADRAO,
    cenaCapa:
      "robô humanoide metálico em ambiente industrial escuro, luz âmbar de baixo, poeira no ar, estilo cinematográfico",
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
    exemplo: {
      titulo: "Demitido sem justa causa? Você tem mais direitos do que imagina.",
      texto: "",
    },
    selos: ["SEU DIREITO", "PRAZO", "ERRO COMUM", "ATENÇÃO", "NA PRÁTICA"],
    cenaCapa:
      "advogado de terno em escritório clássico com estante de livros ao fundo, abajur aceso, luz quente",
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
    exemplo: {
      titulo: "Bomba no mercado: o anúncio que parou a internet",
      texto: "",
    },
    selos: ["URGENTE", "BOMBA", "REPERCUSSÃO", "DADO", "AGORA"],
    cenaCapa:
      "multidão em avenida movimentada à noite, letreiros de neon, movimento borrado, clima de notícia urgente",
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
    exemplo: {
      titulo: "Você não precisa de mais motivação. Precisa de um plano.",
      texto: "O treino de 45 minutos que cabe na sua rotina.",
    },
    selos: ["TREINO", "ERRO COMUM", "DADO", "PROGRESSÃO", "AGORA"],
    cenaCapa:
      "atleta levantando peso em academia escura, luz verde neon de fundo, vapor no ar, ângulo baixo",
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
    exemplo: {
      titulo: "Harmonização não é exagero. É equilíbrio.",
      texto: "O que avaliar antes de fechar seu procedimento.",
    },
    selos: ["MITO", "VERDADE", "CUIDADO", "PROCEDIMENTO", "ANTES E DEPOIS"],
    cenaCapa:
      "retrato feminino em close com pele iluminada, fundo escuro neutro, luz suave de beleza",
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
    exemplo: {
      titulo: "Comer bem não é comer menos.",
      texto: "Os 3 ajustes no prato que sustentam sua energia na primeira semana.",
    },
    selos: ["MITO", "NA PRÁTICA", "DADO", "ERRO COMUM", "CARDÁPIO"],
    cenaCapa:
      "nutricionista sorrindo segurando prato colorido de salada em cozinha clara com plantas ao fundo",
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
    exemplo: {
      titulo: "O erro que faz você pagar caro no primeiro imóvel",
      texto: "Confira isso antes de assinar qualquer contrato.",
    },
    selos: ["ATENÇÃO", "CUSTO OCULTO", "DADO", "CHECKLIST", "AGORA"],
    cenaCapa:
      "sala de apartamento de alto padrão ao entardecer, janelas do chão ao teto com vista da cidade, luz dourada",
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
    exemplo: {
      titulo: "Seu anúncio não é ruim. Sua oferta é.",
      texto: "O ajuste que dobra o retorno antes de aumentar o orçamento.",
    },
    selos: ["TENDÊNCIA", "DADO", "MECANISMO", "ERRO COMUM", "TESTE ISSO"],
    cenaCapa:
      "pessoa jovem de perfil com luzes roxas e azuis de neon ao redor, ambiente escuro, estilo synthwave",
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
    exemplo: {
      titulo: "A decisão que mexe com o bolso de todo brasileiro",
      texto: "",
    },
    selos: ["URGENTE", "O QUE MUDA", "DADO", "CONTEXTO", "AGORA"],
    cenaCapa:
      "pessoa olhando o celular em rua urbana à noite com luzes desfocadas ao fundo, clima jornalístico",
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
    exemplo: {
      titulo: "Clareamento: o que ninguém te conta antes de fazer",
      texto: "Mito, o sabor e o resultado real.",
    },
    selos: ["MITO", "VERDADE", "CUIDADO", "PROCEDIMENTO", "DADO"],
    cenaCapa:
      "dentista sorrindo de jaleco em consultório moderno e iluminado, fundo azul claro desfocado",
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
    exemplo: {
      titulo: "Os sinais silenciosos que o seu corpo dá antes de adoecer",
      texto: "",
    },
    selos: ["SINAL DE ALERTA", "DADO", "MITO", "PREVENÇÃO", "PROCURE UM MÉDICO"],
    cenaCapa:
      "médico de jaleco em corredor de hospital moderno, luz azulada suave, profundidade de campo rasa",
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
    exemplo: {
      titulo: "Sua pele não precisa de mais produto. Precisa de ordem.",
      texto: "A sequência certa de skincare em 4 passos.",
    },
    selos: ["ROTINA", "MITO", "ORDEM CERTA", "ERRO COMUM", "DICA"],
    cenaCapa:
      "mulher em ambiente de salão sofisticado com prateleiras de produtos ao fundo, luz quente difusa",
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
    exemplo: {
      titulo: "Seu aluno não é desatento. Sua aula é previsível.",
      texto: "Três mudanças que prendem a turma até o fim.",
    },
    selos: ["NA PRÁTICA", "ERRO COMUM", "DADO", "ESTRATÉGIA", "TESTE ISSO"],
    cenaCapa:
      "professora gesticulando em frente a uma turma, sala de aula iluminada, expressão de entusiasmo",
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
    exemplo: {
      titulo: "MEI ou ME? A escolha errada custa caro no imposto.",
      texto: "Onde está o limite e quando migrar.",
    },
    selos: ["PRAZO", "ATENÇÃO", "DADO", "ECONOMIA", "CHECKLIST"],
    cenaCapa:
      "mesa de escritório com notebook, documentos empilhados e calculadora, luz dourada de manhã",
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
    exemplo: {
      titulo: "Roteiro de 5 dias que cabe no seu bolso",
      texto: "Viaje mais gastando menos, com o passeio a passeio.",
    },
    selos: ["ROTEIRO", "ECONOMIA", "DICA LOCAL", "QUANDO IR", "CHECKLIST"],
    cenaCapa:
      "praia ao pôr do sol com montanhas ao fundo e pessoas caminhando na areia, luz dourada",
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
    exemplo: {
      titulo: "Seu cachorro não é teimoso. Ele não te entendeu.",
      texto: "O jeito certo de ensinar comando sem estresse.",
    },
    selos: ["COMPORTAMENTO", "MITO", "NA PRÁTICA", "ATENÇÃO", "DICA"],
    cenaCapa:
      "golden retriever feliz de língua pra fora em close, fundo neutro escuro, luz quente",
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
    exemplo: {
      titulo: "Semijoia de qualidade existe. Aprenda a reconhecer.",
      texto: "Os detalhes que separam uma peça durável de uma que escurece em semanas.",
    },
    selos: ["COMO ESCOLHER", "MITO", "CUIDADO", "MATERIAL", "DICA"],
    cenaCapa:
      "joias douradas sobre superfície escura acetinada, luz pontual criando brilho, macro fotográfico",
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
    alternarFundo: true,
    numerarTitulo: true,
    destaqueCaixa: true,
    exemplo: {
      titulo: "O prompt que escreve sua legenda inteira.",
      texto: "Eu ensino [SEU TEMA] para [SEU PÚBLICO]. Me dê 5 ganchos de no máximo 12 palavras.",
    },
    selos: ["PROMPT", "COPIE E COLE", "ATALHO", "TESTE ISSO", "FERRAMENTA"],
    cenaCapa:
      "objeto cotidiano inesperado em close, fundo neutro claro, luz suave de estúdio, humor seco",
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
    numerarTitulo: true,
    destaqueCaixa: true,
    exemplo: {
      titulo: "A pergunta que destrava qualquer bloqueio criativo.",
      texto: "Assuma que meu problema é [X]. Liste 5 causas que eu provavelmente não considerei.",
    },
    selos: ["PROMPT", "COPIE E COLE", "ATALHO", "TESTE ISSO", "FERRAMENTA"],
    cenaCapa:
      "mesa escura com um único objeto iluminado por luz fria, atmosfera noturna, minimalista",
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
