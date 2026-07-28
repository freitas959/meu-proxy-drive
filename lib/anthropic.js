import Anthropic from "@anthropic-ai/sdk";

/** Modelo padrão; dá pra trocar por env sem mexer no código. */
export const MODELO = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

let cliente = null;

export function getCliente() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!cliente) {
    cliente = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return cliente;
}

export function semChave() {
  return Response.json(
    {
      erro:
        "ANTHROPIC_API_KEY não configurada. Defina a variável de ambiente pra habilitar a geração com IA.",
    },
    { status: 503 }
  );
}

/**
 * Extrai o input da primeira chamada de ferramenta. Usar tool-use em vez de
 * pedir "responda em JSON" evita ter que limpar cercas de markdown na mão.
 */
export function extrairFerramenta(resposta, nome) {
  const bloco = resposta.content.find((c) => c.type === "tool_use" && c.name === nome);
  return bloco ? bloco.input : null;
}
