import { getCliente, semChave, MODELO, extrairFerramenta } from "@/lib/anthropic";
import { getTemplate } from "@/lib/templates";
import { erroAnthropic } from "@/lib/erros";

export const maxDuration = 60;

const FERRAMENTA = {
  name: "entregar_roteiro",
  description: "Entrega o roteiro completo do carrossel, card a card.",
  input_schema: {
    type: "object",
    properties: {
      slides: {
        type: "array",
        description: "Os cards na ordem em que aparecem no carrossel.",
        items: {
          type: "object",
          properties: {
            tipo: {
              type: "string",
              enum: ["hook", "conteudo", "cta"],
              description:
                "hook no primeiro card, cta no último, conteudo em todos os do meio.",
            },
            selo: {
              type: "string",
              description:
                "Etiqueta curta em CAIXA ALTA que aparece no canto do card (máx. 14 caracteres).",
            },
            titulo: {
              type: "string",
              description:
                "Título do card. Curto e afirmativo, no máximo 60 caracteres. Sem ponto final.",
            },
            texto: {
              type: "string",
              description:
                "Corpo do card, 1 a 3 frases (máx. 280 caracteres). Use **asteriscos duplos** em volta de 1 a 3 termos que merecem destaque visual. No card de hook pode vir vazio.",
            },
            botao: {
              type: "string",
              description:
                "Rótulo curto de botão em CAIXA ALTA. Só no primeiro e no último card; vazio nos demais.",
            },
          },
          required: ["tipo", "selo", "titulo", "texto"],
        },
      },
      palavraImpacto: {
        type: "string",
        description:
          "Uma única palavra, em CAIXA ALTA, que resume a tensão do carrossel. Aparece gigante na capa. Pode ser vazia.",
      },
      promptCapa: {
        type: "string",
        description:
          "Descrição visual da cena da capa, em português, sem texto escrito na imagem. Uma frase.",
      },
      legenda: {
        type: "string",
        description: "Legenda pronta pro post no Instagram, com 3 a 6 hashtags no fim.",
      },
    },
    required: ["slides", "promptCapa", "legenda"],
  },
};

function sistema(template, slides) {
  return `Você escreve carrosséis de Instagram em português do Brasil que prendem a atenção até o último card.

TEMPLATE ESCOLHIDO: "${template.nome}" — ${template.descricao}
SELOS QUE COMBINAM COM ESSE TEMPLATE: ${template.selos.join(", ")}

REGRAS DE ESCRITA
- Exatamente ${slides} cards.
- Card 1 é o hook: uma tensão ou promessa concreta que faz parar o dedo. Nada de "você sabia que".
- Cards do meio entregam substância: um argumento por card, encadeados. Cada card puxa o próximo.
- Último card é o CTA: uma ação específica e pequena, que dá pra fazer hoje.
- Frases curtas. Voz ativa. Segunda pessoa ("você").
- Nada de emoji, nada de hashtag dentro dos cards, nada de clichê de LinkedIn.
- Números e prazos concretos valem mais que adjetivo. Se você não tem o dado, não invente número específico — prefira uma formulação qualitativa honesta.
- Cada selo deve ser diferente dos outros e descrever o papel daquele card.
- Nos textos, marque de 1 a 3 termos com **asteriscos duplos** para o destaque visual. Nunca marque uma frase inteira.`;
}

export async function POST(req) {
  const cli = getCliente();
  if (!cli) return semChave();

  try {
    const body = await req.json();
    const { tema = "", link = "", slides = 6, templateId, materia = "", anexos = [] } = body;

    const template = getTemplate(templateId);
    if (!template) {
      return Response.json({ erro: "Template desconhecido." }, { status: 400 });
    }
    if (!tema.trim() && !materia.trim() && !link.trim()) {
      return Response.json(
        { erro: "Escreva o tema ou cole um link de matéria." },
        { status: 400 }
      );
    }

    const total = Math.min(Math.max(Number(slides) || 6, 3), 10);

    const partes = [];
    if (tema.trim()) partes.push(`TEMA PEDIDO PELO USUÁRIO:\n${tema.trim()}`);
    if (materia.trim()) {
      partes.push(
        `CONTEÚDO DA MATÉRIA (${link || "link informado"}), use como base factual:\n${materia.slice(0, 12000)}`
      );
    } else if (link.trim()) {
      partes.push(
        `O usuário informou o link ${link.trim()}, mas o conteúdo não pôde ser lido. Trabalhe só com o tema.`
      );
    }
    partes.push(`Escreva o roteiro com ${total} cards e entregue pela ferramenta.`);

    // Imagens e PDFs anexados viram blocos de conteúdo: o modelo lê o arquivo
    // em si, em vez de receber um resumo nosso dele.
    const conteudo = [];
    for (const anexo of anexos.slice(0, 6)) {
      if (!anexo?.dados) continue;
      if (anexo.tipo === "pdf") {
        conteudo.push({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: anexo.dados },
        });
      } else {
        conteudo.push({
          type: "image",
          source: {
            type: "base64",
            media_type: anexo.midia || "image/png",
            data: anexo.dados,
          },
        });
      }
    }
    if (conteudo.length) {
      conteudo.push({
        type: "text",
        text: "Os arquivos acima são referências enviadas pelo usuário. Use o conteúdo deles como base factual e de tom.",
      });
    }
    conteudo.push({ type: "text", text: partes.join("\n\n") });

    const resposta = await cli.messages.create({
      model: MODELO,
      max_tokens: 3000,
      system: sistema(template, total),
      tools: [FERRAMENTA],
      tool_choice: { type: "tool", name: "entregar_roteiro" },
      messages: [{ role: "user", content: conteudo }],
    });

    const dados = extrairFerramenta(resposta, "entregar_roteiro");
    if (!dados?.slides?.length) {
      return Response.json({ erro: "A IA não devolveu um roteiro válido." }, { status: 502 });
    }

    // O modelo às vezes entrega um card a mais ou a menos; corta no tamanho pedido.
    dados.slides = dados.slides.slice(0, total);
    if (!dados.promptCapa) dados.promptCapa = template.cenaCapa || "";

    return Response.json(dados);
  } catch (erro) {
    console.error("[roteiro]", erro);
    return Response.json({ erro: erroAnthropic(erro) }, { status: 502 });
  }
}
