// Traduz as falhas mais comuns dos provedores para uma frase em português que
// diz o que fazer. O texto cru das APIs vem em inglês e é longo demais pra ser
// útil na tela.

/**
 * `limit: 0` não é cota esgotada — é modelo indisponível no nível gratuito.
 * Esperar não resolve, então a mensagem precisa dizer outra coisa.
 */
function semCotaGratuita(detalhe) {
  return /limit:\s*0\b/.test(detalhe) && /free_tier/i.test(detalhe);
}

export function erroGemini(status, detalhe = "", modelo = "") {
  const alvo = modelo ? `O modelo ${modelo}` : "Esse modelo";

  if (status === 429) {
    if (semCotaGratuita(detalhe)) {
      return `${alvo} não tem cota gratuita. Ative o faturamento em aistudio.google.com, troque o modelo pela variável GEMINI_IMAGE_MODEL, ou gere a capa em ilustração.`;
    }
    return "Cota do Gemini esgotada por enquanto. Tente de novo em alguns minutos, ou gere a capa em ilustração.";
  }

  if (status === 400 && /api[_ ]?key/i.test(detalhe)) {
    return "A chave do Gemini é inválida. Confira a GEMINI_API_KEY no .env.local e reinicie o servidor.";
  }

  if (status === 403) {
    return "A chave do Gemini não tem permissão para esse modelo. Verifique se a API está habilitada no projeto do Google.";
  }

  if (status === 404) {
    return `${alvo} não existe ou não está disponível para a sua chave. Ajuste a GEMINI_IMAGE_MODEL no .env.local.`;
  }

  if (status >= 500) {
    return "O Gemini está fora do ar no momento. Tente de novo em instantes, ou gere a capa em ilustração.";
  }

  return `O Gemini respondeu ${status}.${detalhe ? ` ${detalhe.slice(0, 180)}` : ""}`;
}

export function erroAnthropic(erro) {
  const status = erro?.status;
  const texto = erro?.message || "";

  if (/credit balance is too low/i.test(texto)) {
    return "Sua conta da API da Anthropic está sem saldo. Compre créditos em console.anthropic.com, em Plans & Billing.";
  }

  if (status === 401) {
    return "A chave da Anthropic é inválida. Confira a ANTHROPIC_API_KEY no .env.local e reinicie o servidor.";
  }

  if (status === 403) {
    return "A chave da Anthropic não tem permissão para esse modelo.";
  }

  if (status === 429) {
    return "Muitas requisições seguidas à Anthropic. Espere alguns segundos e tente de novo.";
  }

  if (status === 529 || status >= 500) {
    return "A API da Anthropic está sobrecarregada. Tente de novo em instantes.";
  }

  return texto || "Falha ao falar com a Anthropic.";
}
