import { getCliente, semChave, MODELO, extrairFerramenta } from "@/lib/anthropic";

export const maxDuration = 90;

const FERRAMENTA = {
  name: "entregar_capa",
  description: "Entrega a ilustração da capa como um SVG completo.",
  input_schema: {
    type: "object",
    properties: {
      svg: {
        type: "string",
        description:
          "O documento SVG completo, começando em <svg e terminando em </svg>.",
      },
    },
    required: ["svg"],
  },
};

const SISTEMA = `Você é um ilustrador que desenha capas de carrossel diretamente em SVG.

FORMATO OBRIGATÓRIO
- Um único <svg> com viewBox="0 0 1080 1350", width="1080" height="1350".
- Só primitivas: path, rect, circle, ellipse, polygon, line, g, defs, linearGradient, radialGradient, filter (feGaussianBlur é permitido).
- PROIBIDO: <text>, <image>, <foreignObject>, <use href> externo, <script>, qualquer url() apontando pra fora do próprio SVG, qualquer fonte.
- Nenhuma palavra escrita na imagem — o texto do card é desenhado por cima depois.

DIREÇÃO DE ARTE
- Ilustração editorial de cartaz: formas grandes e legíveis, não rabisco fofo.
- Composição pensada pra 4:5, com o interesse visual no terço SUPERIOR: o terço de baixo fica coberto pelo texto e deve ficar mais escuro e mais vazio.
- Use exclusivamente a paleta informada, mais variações de luminosidade dela.
- Profundidade com gradientes e silhuetas sobrepostas, luz direcional clara.
- Entre 40 e 150 elementos: rico o bastante pra não parecer clipart, simples o bastante pra ler no feed.`;

/** Barra construções que o canvas não renderiza ou que puxariam rede externa. */
const PROIBIDOS = [
  /<script/i,
  /<foreignObject/i,
  /<image/i,
  /<text[\s>]/i,
  /xlink:href\s*=\s*["']?(?!#)/i,
  /\bhref\s*=\s*["']?(?!#)/i,
  /url\((?!#)/i,
  /on[a-z]+\s*=/i,
];

function svgValido(svg) {
  if (!svg || !svg.trim().startsWith("<svg")) return "O SVG veio malformado.";
  for (const padrao of PROIBIDOS) {
    if (padrao.test(svg)) return "O SVG usou um recurso não permitido.";
  }
  return null;
}

export async function POST(req) {
  const cli = getCliente();
  if (!cli) return semChave();

  try {
    const { cena = "", paleta = {}, tema = "" } = await req.json();
    if (!cena.trim() && !tema.trim()) {
      return Response.json({ erro: "Descreva a cena da capa." }, { status: 400 });
    }

    const pedido = `CENA: ${cena.trim() || tema.trim()}

PALETA (use só estas cores e tons derivados delas):
- fundo: ${paleta.fundo || "#0d0d0d"}
- destaque: ${paleta.botoes || "#ee5b2b"}
- apoio: ${paleta.secundaria || "#a8a29a"}

Desenhe e entregue pela ferramenta.`;

    const resposta = await cli.messages.create({
      model: MODELO,
      max_tokens: 8000,
      system: SISTEMA,
      tools: [FERRAMENTA],
      tool_choice: { type: "tool", name: "entregar_capa" },
      messages: [{ role: "user", content: pedido }],
    });

    const dados = extrairFerramenta(resposta, "entregar_capa");
    const problema = svgValido(dados?.svg);
    if (problema) {
      return Response.json({ erro: problema }, { status: 502 });
    }

    return Response.json({ svg: dados.svg });
  } catch (erro) {
    console.error("[capa]", erro);
    return Response.json({ erro: erro?.message || "Falha ao gerar a capa." }, { status: 500 });
  }
}
