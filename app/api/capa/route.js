import { getCliente, semChave, MODELO, extrairFerramenta } from "@/lib/anthropic";
import {
  gerarImagem,
  promptDeCapa,
  temChaveGemini,
  aspectoDe,
  MODELO_IMAGEM,
} from "@/lib/gemini";
import { erroGemini, erroAnthropic } from "@/lib/erros";
import { cobrar, devolver, exigirUsuario } from "@/lib/creditos";
import { CUSTOS } from "@/lib/custos";

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

/** Foto realista pelo Gemini. Devolve a imagem como data URL pro canvas usar. */
async function capaEmFoto(cena, paleta, tamanho) {
  const { midia, dados } = await gerarImagem({
    prompt: promptDeCapa({ cena, paleta }),
    aspecto: aspectoDe(tamanho),
  });

  return { imagem: `data:${midia};base64,${dados}`, estilo: "foto" };
}

export async function POST(req) {
  const sessao = await exigirUsuario();
  if (!sessao.ok) return sessao.resposta;

  let corpo;
  try {
    corpo = await req.json();
  } catch {
    return Response.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const { cena = "", paleta = {}, tema = "", estilo = "ilustracao", tamanho } = corpo;
  const descricao = cena.trim() || tema.trim();

  if (!descricao) {
    return Response.json({ erro: "Descreva a cena da capa." }, { status: 400 });
  }

  // Servidor sem a chave do estilo pedido é problema nosso, não do saldo dele:
  // confere antes de cobrar.
  if (estilo === "foto" && !temChaveGemini()) {
    return Response.json(
      {
        erro:
          "GEMINI_API_KEY não configurada. Defina a variável de ambiente ou escolha a capa em ilustração.",
      },
      { status: 503 }
    );
  }

  const cli = estilo === "foto" ? null : getCliente();
  if (estilo !== "foto" && !cli) return semChave();

  // A capa é a ação mais cara; o estorno abaixo é o que a torna justa.
  const cobranca = await cobrar(sessao, CUSTOS.capaIA, `capa:${estilo}`);
  if (!cobranca.ok) return cobranca.resposta;

  if (estilo === "foto") {
    try {
      const dados = await capaEmFoto(descricao, paleta, tamanho);
      return Response.json({ ...dados, saldo: cobranca.saldo });
    } catch (erro) {
      console.error("[capa/foto]", erro);
      await devolver(cobranca.usuarioId, CUSTOS.capaIA, "estorno: falha na capa em foto");
      const amigavel = erro?.status
        ? erroGemini(erro.status, erro.detalhe || "", MODELO_IMAGEM)
        : erro?.message || "Falha ao gerar a foto da capa.";
      return Response.json({ erro: amigavel }, { status: 502 });
    }
  }

  try {
    const pedido = `CENA: ${descricao}

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
      await devolver(cobranca.usuarioId, CUSTOS.capaIA, "estorno: SVG inválido");
      return Response.json({ erro: problema }, { status: 502 });
    }

    // Os dois estilos devolvem o mesmo formato: uma data URL pronta pro canvas.
    const base64 = Buffer.from(dados.svg, "utf8").toString("base64");
    return Response.json({
      imagem: `data:image/svg+xml;base64,${base64}`,
      estilo: "ilustracao",
      saldo: cobranca.saldo,
    });
  } catch (erro) {
    console.error("[capa]", erro);
    await devolver(cobranca.usuarioId, CUSTOS.capaIA, "estorno: falha na capa");
    return Response.json({ erro: erroAnthropic(erro) }, { status: 502 });
  }
}
