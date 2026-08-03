export const maxDuration = 30;

/** Tira script/style/nav e devolve só o texto corrido que a IA precisa ler. */
function extrairTexto(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(nav|header|footer|aside|form)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req) {
  try {
    const { link } = await req.json();
    let url;
    try {
      url = new URL(link);
    } catch {
      return Response.json({ erro: "Link inválido." }, { status: 400 });
    }
    if (!["http:", "https:"].includes(url.protocol)) {
      return Response.json({ erro: "Use um link http ou https." }, { status: 400 });
    }

    const controle = new AbortController();
    const limite = setTimeout(() => controle.abort(), 15000);

    const resposta = await fetch(url, {
      signal: controle.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Carrosse/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
    }).finally(() => clearTimeout(limite));

    if (!resposta.ok) {
      return Response.json(
        { erro: `A página respondeu ${resposta.status}.` },
        { status: 502 }
      );
    }

    const texto = extrairTexto(await resposta.text());
    if (texto.length < 200) {
      return Response.json(
        { erro: "Não consegui extrair texto suficiente dessa página." },
        { status: 422 }
      );
    }

    return Response.json({ texto: texto.slice(0, 20000) });
  } catch (erro) {
    const abortou = erro?.name === "AbortError";
    return Response.json(
      { erro: abortou ? "A página demorou demais pra responder." : "Não consegui ler esse link." },
      { status: 502 }
    );
  }
}
