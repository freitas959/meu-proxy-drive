// Dados que aparecem nos Termos e na Política de Privacidade.
//
// ⚠️ PREENCHA ANTES DE PUBLICAR. A LGPD (Lei 13.709/2018, art. 9º) exige que o
// titular saiba QUEM controla os dados dele e COMO falar com essa pessoa. Um
// "[preencher]" no ar não cumpre a lei e ainda passa a impressão errada.
//
// Ficam aqui, e não soltos no texto das páginas, para você editar uma vez só.

export const EMPRESA = {
  /** Razão social, ou seu nome completo se ainda for pessoa física. */
  nome: "[preencher: razão social ou nome completo]",
  /** CNPJ, ou CPF se for pessoa física. */
  documento: "[preencher: CNPJ ou CPF]",
  /** Endereço completo. */
  endereco: "[preencher: endereço completo]",
  /**
   * Contato do encarregado de dados (o "DPO" do art. 41). Não precisa ser
   * empresa nem advogado: pode ser você, com um e-mail que alguém lê.
   */
  encarregado: "[preencher: e-mail de contato para dados]",
  /** Para onde vão dúvidas e pedidos em geral. */
  suporte: "[preencher: e-mail de suporte]",
};

export const NOME_APP = "Carrossê";

/** Muda quando o texto muda. Aparece no rodapé das duas páginas. */
export const ATUALIZADO_EM = "31 de julho de 2026";

/**
 * Terceiros que recebem dado do usuário. A LGPD pede transparência sobre com
 * quem os dados são compartilhados — e esta lista é o que torna a política
 * verdadeira em vez de genérica. Se entrar um serviço novo, entra aqui.
 */
export const SUBPROCESSADORES = [
  {
    nome: "Supabase",
    papel: "Conta, autenticação e banco de dados",
    dados: "E-mail, senha (com hash), projetos e histórico de créditos",
    onde: "Estados Unidos",
  },
  {
    nome: "Anthropic (Claude)",
    papel: "Geração do roteiro do carrossel",
    dados: "O tema, o texto e os arquivos que você envia na etapa de conteúdo",
    onde: "Estados Unidos",
  },
  {
    nome: "Google (Gemini)",
    papel: "Geração da imagem de capa",
    dados: "A descrição da cena da capa",
    onde: "Estados Unidos",
  },
];
