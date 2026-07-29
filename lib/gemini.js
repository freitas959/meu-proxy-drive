// Geração de imagem pela API do Gemini ("nano banana"). Feito com fetch direto
// pra não trazer mais um SDK só por uma chamada.

/**
 * Padrão no Flash Image 2.5: é o único da família com cota no nível gratuito,
 * então o app funciona sem exigir faturamento no Google. Os Flash mais novos e
 * o Pro rendem mais, mas respondem `limit: 0` numa conta sem billing — troque
 * pela GEMINI_IMAGE_MODEL quando o faturamento estiver ativo.
 *
 * Vale o Flash e não o Pro de propósito: o diferencial do Pro é desenhar texto
 * dentro da imagem, e o texto dos cards é desenhado pelo nosso canvas.
 */
export const MODELO_IMAGEM = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

export function temChaveGemini() {
  return Boolean(process.env.GEMINI_API_KEY);
}

/** Converte o tamanho da arte no formato de proporção que a API espera. */
export function aspectoDe(tamanho) {
  return tamanho === "quadrado" ? "1:1" : "4:5";
}

/**
 * Gera uma imagem e devolve `{ midia, dados }` em base64.
 * Lança com mensagem legível — quem chama decide como reportar.
 */
function chamar(chave, corpo, sinal) {
  return fetch(`${ENDPOINT}/${MODELO_IMAGEM}:generateContent`, {
    method: "POST",
    signal: sinal,
    headers: { "Content-Type": "application/json", "x-goog-api-key": chave },
    body: JSON.stringify(corpo),
  });
}

async function detalheDe(resposta) {
  const bruto = await resposta.text().catch(() => "");
  try {
    return JSON.parse(bruto)?.error?.message || "";
  } catch {
    return bruto.slice(0, 300);
  }
}

export async function gerarImagem({ prompt, aspecto = "4:5", sinal }) {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) throw new Error("GEMINI_API_KEY não configurada.");

  const base = { contents: [{ parts: [{ text: prompt }] }] };

  let resposta = await chamar(
    chave,
    {
      ...base,
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: aspecto },
      },
    },
    sinal
  );

  // Modelos mais antigos não conhecem `imageConfig` e recusam a requisição
  // inteira por causa dele. Repetimos sem o campo: a imagem sai no formato
  // padrão do modelo e o renderizador recorta pra proporção do card.
  if (resposta.status === 400) {
    const detalhe = await detalheDe(resposta);
    if (/imageConfig|aspectRatio|aspect_ratio/i.test(detalhe)) {
      resposta = await chamar(
        chave,
        { ...base, generationConfig: { responseModalities: ["IMAGE"] } },
        sinal
      );
    } else {
      const erro = new Error(detalhe);
      erro.status = 400;
      erro.detalhe = detalhe;
      throw erro;
    }
  }

  if (!resposta.ok) {
    const detalhe = await detalheDe(resposta);
    const erro = new Error(detalhe || `Gemini respondeu ${resposta.status}.`);
    erro.status = resposta.status;
    erro.detalhe = detalhe;
    throw erro;
  }

  const dados = await resposta.json();

  // A imagem vem como inlineData entre as partes; a posição não é garantida,
  // e junto pode vir texto que não interessa.
  const partes = dados?.candidates?.[0]?.content?.parts || [];
  const imagem = partes.find((p) => p.inlineData?.data || p.inline_data?.data);
  const inline = imagem?.inlineData || imagem?.inline_data;

  if (!inline?.data) {
    const motivo = dados?.candidates?.[0]?.finishReason;
    throw new Error(
      motivo && motivo !== "STOP"
        ? `A geração foi interrompida (${motivo}). Tente descrever a cena de outro jeito.`
        : "O Gemini não devolveu imagem."
    );
  }

  return {
    midia: inline.mimeType || inline.mime_type || "image/png",
    dados: inline.data,
  };
}

/**
 * Monta a direção de arte. O terço inferior precisa ficar escuro e vazio
 * porque é onde o canvas desenha o título depois.
 */
export function promptDeCapa({ cena, paleta }) {
  return `Fotografia editorial para capa de carrossel de Instagram.

CENA: ${cena}

DIREÇÃO DE ARTE
- Estilo fotográfico cinematográfico, luz direcional marcante, profundidade de campo rasa.
- Composição vertical com o interesse visual no terço SUPERIOR do quadro.
- O terço INFERIOR deve ficar escuro, limpo e sem elementos importantes: é onde entra o texto depois.
- Clima de cor puxando para ${paleta?.botoes || "#ee5b2b"} sobre fundo escuro ${paleta?.fundo || "#0d0d0d"}.
- Contraste alto, imagem legível em miniatura no feed.

PROIBIDO: qualquer texto, letra, número, legenda, logotipo, marca d'água ou interface na imagem. Nenhuma palavra escrita.`;
}
