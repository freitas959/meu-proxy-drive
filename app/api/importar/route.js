import { getCliente, semChave, extrairFerramenta } from "@/lib/anthropic";
import { getTemplate } from "@/lib/templates";
import { erroAnthropic } from "@/lib/erros";
import { cobrar, devolver, exigirUsuario } from "@/lib/creditos";
import { CUSTOS } from "@/lib/custos";

export const maxDuration = 45;

/** Importar é o caminho barato: o texto é do usuário, a IA só fatia e formata. */
const MODELO_IMPORT = process.env.ANTHROPIC_MODEL_RAPIDO || "claude-haiku-4-5-20251001";

const FERRAMENTA = {
  name: "entregar_roteiro",
  description: "Distribui o texto do usuário nos cards do carrossel.",
  input_schema: {
    type: "object",
    properties: {
      slides: {
        type: "array",
        items: {
          type: "object",
          properties: {
            tipo: { type: "string", enum: ["hook", "conteudo", "cta"] },
            selo: { type: "string", description: "Etiqueta curta em CAIXA ALTA, máx. 14 caracteres." },
            titulo: { type: "string", description: "Título curto do card, máx. 60 caracteres." },
            texto: {
              type: "string",
              description:
                "Corpo do card, com **asteriscos duplos** em 1 a 3 termos de destaque.",
            },
            botao: { type: "string", description: "Rótulo de botão em CAIXA ALTA ou vazio." },
          },
          required: ["tipo", "selo", "titulo", "texto"],
        },
      },
      palavraImpacto: { type: "string" },
      promptCapa: { type: "string" },
      legenda: { type: "string" },
    },
    required: ["slides"],
  },
};

export async function POST(req) {
  const sessao = await exigirUsuario();
  if (!sessao.ok) return sessao.resposta;

  const cli = getCliente();
  if (!cli) return semChave();

  let corpo;
  try {
    corpo = await req.json();
  } catch {
    return Response.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const { texto = "", slides = 6, templateId } = corpo;
  if (texto.trim().length < 40) {
    return Response.json(
      { erro: "Cole um texto um pouco maior pra importar." },
      { status: 400 }
    );
  }

  const template = getTemplate(templateId);
  const total = Math.min(Math.max(Number(slides) || 6, 3), 10);

  const cobranca = await cobrar(sessao, CUSTOS.importar, "importar");
  if (!cobranca.ok) return cobranca.resposta;

  try {
    const resposta = await cli.messages.create({
      model: MODELO_IMPORT,
      max_tokens: 2500,
      system: `Você organiza um texto que JÁ EXISTE em cards de carrossel. Português do Brasil.

O texto é do usuário: preserve as palavras e as ideias dele. Você pode cortar, encurtar e criar títulos, mas NÃO reescreva o conteúdo com suas próprias ideias nem invente fatos, números ou exemplos que não estejam no texto.

- Exatamente ${total} cards.
- Primeiro card tipo "hook", último tipo "cta", o resto "conteudo".
- Título de cada card: extraia a ideia central daquele trecho, máx. 60 caracteres.
- Selos curtos em CAIXA ALTA${template ? `, no espírito de: ${template.selos.join(", ")}` : ""}.
- Marque de 1 a 3 termos por card com **asteriscos duplos**.`,
      tools: [FERRAMENTA],
      tool_choice: { type: "tool", name: "entregar_roteiro" },
      messages: [{ role: "user", content: texto.slice(0, 20000) }],
    });

    const dados = extrairFerramenta(resposta, "entregar_roteiro");
    if (!dados?.slides?.length) {
      await devolver(cobranca.usuarioId, CUSTOS.importar, "estorno: importação vazia");
      return Response.json({ erro: "Não consegui organizar esse texto." }, { status: 502 });
    }

    dados.slides = dados.slides.slice(0, total);
    if (!dados.promptCapa) dados.promptCapa = template?.cenaCapa || "";

    return Response.json({ ...dados, saldo: cobranca.saldo });
  } catch (erro) {
    console.error("[importar]", erro);
    await devolver(cobranca.usuarioId, CUSTOS.importar, "estorno: falha na importação");
    return Response.json({ erro: erroAnthropic(erro) }, { status: 502 });
  }
}
