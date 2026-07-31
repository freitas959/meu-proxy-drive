// Renderizador dos cards em <canvas>. O mesmo desenho serve pra prévia na tela
// e pro PNG baixado — só muda a escala de exibição via CSS.

import { aplicarEstilo } from "@/lib/estilos";

export const TAMANHOS = {
  quadrado: { w: 1080, h: 1080, label: "Quadrado", nota: "1:1 · feed" },
  retrato: { w: 1080, h: 1350, label: "Retrato", nota: "4:5 · ocupa mais tela" },
};

/** Famílias que só têm o peso regular — pedir 700 delas gera fake-bold feio. */
const PESO_POR_FONTE = {
  Anton: 400,
  "Bebas Neue": 400,
  "Archivo Black": 400,
};

function pesoTitulo(familia) {
  return PESO_POR_FONTE[familia] ?? 700;
}

/** Anton e afins já são condensadas: entrelinha menor evita buraco no título. */
function alturaLinhaTitulo(familia) {
  return PESO_POR_FONTE[familia] === 400 ? 1.04 : 1.12;
}

function fonte(familia, tamanho, peso = 400) {
  return `${peso} ${tamanho}px "${familia}", "Familjen Grotesk", sans-serif`;
}

/**
 * Garante que as webfonts usadas no card estão prontas antes de desenhar —
 * sem isso o canvas cai no fallback e o PNG sai com a fonte errada.
 */
export async function carregarFontes(familias) {
  if (typeof document === "undefined" || !document.fonts) return;
  const pedidos = [];
  for (const familia of new Set(familias.filter(Boolean))) {
    const peso = pesoTitulo(familia);
    pedidos.push(document.fonts.load(`${peso} 80px "${familia}"`));
    pedidos.push(document.fonts.load(`400 32px "${familia}"`));
    pedidos.push(document.fonts.load(`700 32px "${familia}"`));
  }
  pedidos.push(document.fonts.load('700 24px "JetBrains Mono"'));
  try {
    await Promise.all(pedidos);
    await document.fonts.ready;
  } catch {
    // fonte indisponível: segue com o fallback em vez de travar a geração
  }
}

/* ---------------- texto ---------------- */

/** Quebra `**destaque**` em pedaços marcados, preservando a ordem do texto. */
function parseRico(texto) {
  const partes = [];
  const re = /\*\*(.+?)\*\*/gs;
  let ultimo = 0;
  let m;
  while ((m = re.exec(texto))) {
    if (m.index > ultimo) partes.push({ text: texto.slice(ultimo, m.index), forte: false });
    partes.push({ text: m[1], forte: true });
    ultimo = m.index + m[0].length;
  }
  if (ultimo < texto.length) partes.push({ text: texto.slice(ultimo), forte: false });
  return partes;
}

/** Converte os pedaços em palavras individuais, cada uma sabendo se é destaque. */
function palavras(texto) {
  const saida = [];
  for (const parte of parseRico(texto)) {
    for (const pedaco of parte.text.split(/(\s+)/)) {
      if (!pedaco) continue;
      if (/^\s+$/.test(pedaco)) {
        if (saida.length) saida[saida.length - 1].espaco = true;
      } else {
        saida.push({ text: pedaco, forte: parte.forte, espaco: false });
      }
    }
  }
  return saida;
}

function medir(ctx, palavra) {
  return ctx.measureText(palavra.text).width;
}

/**
 * Só há espaço entre duas palavras se ele existia no texto original. Sem isso,
 * `**termo**,` sairia renderizado como "termo ," com espaço antes da vírgula.
 */
function quebrar(ctx, itens, larguraMax) {
  const linhas = [];
  let atual = [];
  let largura = 0;
  const espaco = ctx.measureText(" ").width;

  for (const item of itens) {
    const w = medir(ctx, item);
    const anterior = atual[atual.length - 1];
    const extra = anterior?.espaco ? espaco : 0;
    if (atual.length && largura + extra + w > larguraMax) {
      linhas.push(atual);
      atual = [item];
      largura = w;
    } else {
      atual.push(item);
      largura += extra + w;
    }
  }
  if (atual.length) linhas.push(atual);
  return linhas;
}

function larguraDaLinha(ctx, linha) {
  const espaco = ctx.measureText(" ").width;
  let total = 0;
  for (let i = 0; i < linha.length; i++) {
    total += ctx.measureText(linha[i].text).width;
    if (i < linha.length - 1 && linha[i].espaco) total += espaco;
  }
  return total;
}

/**
 * Diminui o corpo da fonte até o texto caber em `maxLinhas`. Também checa a
 * largura de cada linha: uma palavra única e longa nunca quebra, então contar
 * linhas sozinho a deixaria vazar pra fora do card.
 */
function ajustar(ctx, texto, larguraMax, maxLinhas, familia, peso, inicial, minimo) {
  const itens = palavras(texto);
  let tamanho = inicial;
  let linhas = [];
  while (tamanho >= minimo) {
    ctx.font = fonte(familia, tamanho, peso);
    linhas = quebrar(ctx, itens, larguraMax);
    const cabe =
      linhas.length <= maxLinhas &&
      linhas.every((linha) => larguraDaLinha(ctx, linha) <= larguraMax);
    if (cabe) break;
    tamanho -= 2;
  }
  return { tamanho, linhas };
}

/**
 * `caixa` troca o destaque de "palavra colorida" por "palavra dentro de um
 * retângulo cheio", como no marca-texto. Vem por template porque o efeito é
 * forte demais pra ser padrão.
 */
function desenharLinhas(
  ctx,
  linhas,
  x,
  y,
  tamanho,
  alturaLinha,
  corBase,
  corForte,
  alfaBase = 1,
  caixa = false
) {
  const espaco = ctx.measureText(" ").width;
  let cursorY = y;
  for (const linha of linhas) {
    let cursorX = x;
    for (let i = 0; i < linha.length; i++) {
      const palavra = linha[i];
      const largura = ctx.measureText(palavra.text).width;

      if (palavra.forte && caixa) {
        // O texto está em textBaseline "top", então a caixa começa em cursorY.
        const folgaX = tamanho * 0.1;
        const folgaY = tamanho * 0.11;
        ctx.globalAlpha = 1;
        ctx.fillStyle = corForte;
        ctx.fillRect(
          cursorX - folgaX,
          cursorY - folgaY,
          largura + folgaX * 2,
          tamanho + folgaY * 1.7
        );
        ctx.fillStyle = contraste(corForte);
      } else {
        ctx.globalAlpha = palavra.forte ? 1 : alfaBase;
        ctx.fillStyle = palavra.forte ? corForte : corBase;
      }

      ctx.fillText(palavra.text, cursorX, cursorY);
      cursorX += largura;
      if (palavra.espaco) cursorX += espaco;
    }
    cursorY += tamanho * alturaLinha;
  }
  ctx.globalAlpha = 1;
  return cursorY;
}

/* ---------------- formas ---------------- */

function retanguloArredondado(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Escolhe preto ou branco pro texto de cima conforme o brilho do fundo. */
function contraste(hex) {
  const c = hex.replace("#", "");
  const n = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#111111" : "#ffffff";
}

/**
 * Alguns templates alternam o fundo entre um card e outro — claro, escuro,
 * claro. A capa fica de fora: ela é foto e já tem o próprio tratamento.
 */
function paletaDoCard(paleta, template, indice, ehCapa) {
  // O primeiro card depois da capa fica na cor base; a virada começa no segundo.
  if (!template?.alternarFundo || ehCapa || indice % 2 !== 0) return paleta;
  return {
    ...paleta,
    fundo: paleta.fundoAlt || paleta.texto,
    texto: paleta.textoAlt || paleta.fundo,
    secundaria: paleta.secundariaAlt || paleta.secundaria,
  };
}

/**
 * Junta as duas fontes de variação: o estilo por papel, que o estúdio define,
 * e o `alternarFundo`, que é o mecanismo antigo por paridade. O estilo por
 * papel tem precedência — quando ele existe, a alternância sai de cena, senão
 * as duas brigariam pelo mesmo fundo.
 */
function visualDoCard({ template, paleta, fontes, card, indice, ehCapa }) {
  const comEstilo = aplicarEstilo({ template, paleta, fontes, card, ehCapa });
  if (comEstilo.paleta !== paleta) return comEstilo;
  return { paleta: paletaDoCard(paleta, template, indice, ehCapa), fontes };
}

/**
 * O `01-` laranja colado no título. Sai como destaque porque o renderizador já
 * sabe pintar `**assim**` com a cor de acento — não precisa de caso especial.
 */
function tituloComNumero(card, template, indice, ehCapa) {
  const titulo = card.titulo || "";
  // Numera só o miolo: a capa não leva número e o CTA não é item de lista.
  if (!template?.numerarTitulo || ehCapa || card.tipo === "cta" || !titulo) return titulo;
  return `**${String(indice).padStart(2, "0")}-** ${titulo}`;
}

function carregarImagem(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/* ---------------- fundo procedural ---------------- */

function hashTexto(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** PRNG simples e determinístico: o mesmo template gera sempre o mesmo fundo. */
function aleatorio(semente) {
  let s = semente >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function comAlfa(hex, alfa) {
  const c = hex.replace("#", "");
  const n = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alfa})`;
}

/**
 * Cena abstrata pra capa quando o usuário não subiu foto nem gerou ilustração.
 * Vale mais que cor chapada e não depende de banco de imagem.
 */
function desenharFundoProcedural(ctx, W, H, paleta, semente) {
  const rnd = aleatorio(hashTexto(semente));

  const brilho = ctx.createRadialGradient(
    W * (0.3 + rnd() * 0.4),
    H * 0.28,
    0,
    W * 0.5,
    H * 0.3,
    W * 0.95
  );
  brilho.addColorStop(0, comAlfa(paleta.botoes, 0.32));
  brilho.addColorStop(0.55, comAlfa(paleta.secundaria, 0.09));
  brilho.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = brilho;
  ctx.fillRect(0, 0, W, H);

  // silhuetas grandes, concentradas na metade de cima
  const formas = 4 + Math.floor(rnd() * 3);
  for (let i = 0; i < formas; i++) {
    const cor = rnd() > 0.45 ? paleta.botoes : paleta.secundaria;
    ctx.fillStyle = comAlfa(cor, 0.05 + rnd() * 0.09);
    const cx = W * (0.1 + rnd() * 0.8);
    const cy = H * (0.08 + rnd() * 0.42);
    const raio = W * (0.14 + rnd() * 0.26);

    if (rnd() > 0.5) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, raio, raio * (0.6 + rnd() * 0.7), rnd() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rnd() - 0.5) * 0.9);
      ctx.fillRect(-raio, -raio * 0.7, raio * 2, raio * 1.4);
      ctx.restore();
    }
  }

  // riscos finos: dão textura sem competir com o texto
  ctx.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    ctx.strokeStyle = comAlfa(paleta.secundaria, 0.05 + rnd() * 0.06);
    const y = H * rnd() * 0.62;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y + (rnd() - 0.5) * 90);
    ctx.stroke();
  }

  // vinheta: garante contraste onde o texto vai cair
  const base = ctx.createLinearGradient(0, H * 0.3, 0, H);
  base.addColorStop(0, "rgba(0,0,0,0)");
  base.addColorStop(1, comAlfa(paleta.fundo, 0.92));
  ctx.fillStyle = base;
  ctx.fillRect(0, H * 0.3, W, H * 0.7);
}

/** Preenche a área inteira mantendo proporção (equivalente a object-fit: cover). */
/**
 * Preenche o card com a imagem, cortando o excesso. `ancorarTopo` corta só por
 * baixo em vez de centralizar: as capas são compostas com o assunto na metade
 * de cima, então centralizar num card quadrado cortaria justamente o assunto.
 */
function desenharCobrindo(ctx, img, W, H, ancorarTopo = false) {
  const escala = Math.max(W / img.width, H / img.height);
  const w = img.width * escala;
  const h = img.height * escala;
  ctx.drawImage(img, (W - w) / 2, ancorarTopo ? 0 : (H - h) / 2, w, h);
}

/* ---------------- blocos do card ---------------- */

function desenharSelo(ctx, texto, W, pad, cor) {
  if (!texto) return;
  ctx.font = fonte("JetBrains Mono", 21, 700);
  const larguraTexto = ctx.measureText(texto).width;
  const padH = 15;
  const w = larguraTexto + padH * 2;
  const h = 38;
  const x = W - pad - w;
  const y = 58;
  ctx.fillStyle = cor;
  retanguloArredondado(ctx, x, y, w, h, 7);
  ctx.fill();
  ctx.fillStyle = contraste(cor);
  ctx.textBaseline = "middle";
  ctx.fillText(texto, x + padH, y + h / 2 + 1);
  ctx.textBaseline = "alphabetic";
}

function desenharRodape(ctx, { W, H, pad, indice, total, paleta, arrasta }) {
  const y = H - 58;
  ctx.font = fonte("JetBrains Mono", 20, 500);
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = paleta.secundaria;
  ctx.textBaseline = "middle";

  const numero = `${String(indice + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}`;
  ctx.fillText(numero, pad, y);

  if (arrasta) {
    const rotulo = "ARRASTA →";
    ctx.textAlign = "right";
    ctx.fillText(rotulo, W - pad, y);
    ctx.textAlign = "left";
  }
  ctx.globalAlpha = 1;

  // pontinhos de paginação, centralizados
  const raio = 5;
  const gap = 16;
  const larguraTotal = total * raio * 2 + (total - 1) * (gap - raio * 2);
  let x = W / 2 - larguraTotal / 2 + raio;
  for (let i = 0; i < total; i++) {
    ctx.beginPath();
    ctx.arc(x, y, raio, 0, Math.PI * 2);
    ctx.fillStyle = i === indice ? paleta.botoes : paleta.secundaria;
    ctx.globalAlpha = i === indice ? 1 : 0.35;
    ctx.fill();
    x += gap + raio;
  }
  ctx.globalAlpha = 1;
  ctx.textBaseline = "alphabetic";
}

function desenharBotao(ctx, texto, x, y, paleta, preenchido) {
  ctx.font = fonte("JetBrains Mono", 20, 700);
  const larguraTexto = ctx.measureText(texto).width;
  const padH = 20;
  const w = larguraTexto + padH * 2;
  const h = 46;
  retanguloArredondado(ctx, x, y, w, h, 8);
  if (preenchido) {
    ctx.fillStyle = paleta.botoes;
    ctx.fill();
    ctx.fillStyle = contraste(paleta.botoes);
  } else {
    ctx.strokeStyle = paleta.texto;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = paleta.texto;
  }
  ctx.textBaseline = "middle";
  ctx.fillText(texto, x + padH, y + h / 2 + 1);
  ctx.textBaseline = "alphabetic";
  return h;
}

/* ---------------- layouts ---------------- */

async function layoutEditorial(ctx, opcoes) {
  const { W, H, card, template, indice, total, imagem, handle, ehCapa } = opcoes;
  const { paleta, fontes } = visualDoCard(opcoes);
  const caixa = Boolean(template?.destaqueCaixa);
  const pad = Math.round(W * 0.07);
  const larguraUtil = W - pad * 2;

  ctx.fillStyle = paleta.fundo;
  ctx.fillRect(0, 0, W, H);

  const img = await carregarImagem(imagem);
  if (img) {
    desenharCobrindo(ctx, img, W, H, ehCapa);
    // escurece a base pro texto continuar legível sobre qualquer foto
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, `${paleta.fundo}66`);
    grad.addColorStop(0.42, `${paleta.fundo}33`);
    grad.addColorStop(0.72, `${paleta.fundo}e0`);
    grad.addColorStop(1, paleta.fundo);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  } else if (ehCapa) {
    desenharFundoProcedural(ctx, W, H, paleta, `${template?.id || "base"}|${card.titulo || ""}`);
  }

  desenharSelo(ctx, card.selo, W, pad, paleta.botoes);

  const familiaTitulo = fontes.titulo;
  const peso = pesoTitulo(familiaTitulo);
  const alturaLinha = alturaLinhaTitulo(familiaTitulo);

  // Sobre arte (foto ou fundo procedural) o texto ancora embaixo; nos cards de
  // texto puro ele fica no terço superior, como no template original.
  const ancoraEmbaixo = Boolean(img) || ehCapa;

  const impacto = ehCapa && card.palavraImpacto ? card.palavraImpacto.trim() : "";
  const tituloAjuste = ajustar(
    ctx,
    tituloComNumero(card, template, indice, ehCapa),
    larguraUtil,
    ehCapa ? 4 : 3,
    familiaTitulo,
    peso,
    ehCapa ? Math.round(W * 0.085) : Math.round(W * 0.062),
    Math.round(W * 0.036)
  );

  const corpoTamanho = Math.round(W * 0.028);
  ctx.font = fonte(fontes.corpo, corpoTamanho, 400);
  const corpoLinhas = card.texto ? quebrar(ctx, palavras(card.texto), larguraUtil) : [];
  const corpoAltura = corpoLinhas.length * corpoTamanho * 1.5;

  let impactoAjuste = null;
  if (impacto) {
    impactoAjuste = ajustar(
      ctx,
      impacto,
      larguraUtil,
      2,
      familiaTitulo,
      peso,
      Math.round(W * 0.16),
      Math.round(W * 0.045)
    );
  }

  const alturaTitulo = tituloAjuste.linhas.length * tituloAjuste.tamanho * alturaLinha;
  const alturaImpacto = impactoAjuste
    ? impactoAjuste.linhas.length * impactoAjuste.tamanho * 1.0 + 14
    : 0;
  const alturaLinhaAcento = 5 + 22 + 26;
  const alturaBotao = card.botao ? 46 + 26 : 0;
  const blocoAltura =
    alturaImpacto + alturaTitulo + (corpoLinhas.length ? alturaLinhaAcento + corpoAltura : 0) + alturaBotao;

  let y = ancoraEmbaixo ? H - 132 - blocoAltura : Math.round(H * 0.34);
  y = Math.max(y, 150);

  if (impactoAjuste) {
    ctx.font = fonte(familiaTitulo, impactoAjuste.tamanho, peso);
    ctx.textBaseline = "top";
    desenharLinhas(
      ctx,
      impactoAjuste.linhas,
      pad,
      y,
      impactoAjuste.tamanho,
      1.0,
      paleta.botoes,
      paleta.botoes
    );
    y += alturaImpacto;
  }

  ctx.font = fonte(familiaTitulo, tituloAjuste.tamanho, peso);
  ctx.textBaseline = "top";
  y = desenharLinhas(
    ctx,
    tituloAjuste.linhas,
    pad,
    y,
    tituloAjuste.tamanho,
    alturaLinha,
    paleta.tituloCor || paleta.texto,
    paleta.botoes,
    1,
    caixa
  );

  if (corpoLinhas.length) {
    y += 22;
    ctx.fillStyle = paleta.botoes;
    ctx.fillRect(pad, y, 58, 5);
    y += 5 + 26;

    ctx.font = fonte(fontes.corpo, corpoTamanho, 400);
    y = desenharLinhas(
      ctx,
      corpoLinhas,
      pad,
      y,
      corpoTamanho,
      1.5,
      paleta.corpoCor || paleta.texto,
      paleta.botoes,
      0.82,
      caixa
    );
  }

  if (card.botao) {
    y += 20;
    desenharBotao(ctx, card.botao, pad, y, paleta, ehCapa);
  }

  ctx.textBaseline = "alphabetic";

  // Fica no topo à esquerda porque o canto direito é do selo.
  if (handle) {
    ctx.font = fonte("JetBrains Mono", 19, 500);
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = paleta.secundaria;
    ctx.textBaseline = "middle";
    ctx.fillText(`@${handle.replace(/^@\s*/, "")}`, pad, 77);
    ctx.textBaseline = "alphabetic";
    ctx.globalAlpha = 1;
  }

  desenharRodape(ctx, {
    W,
    H,
    pad,
    indice,
    total,
    paleta,
    arrasta: indice < total - 1,
  });
}

/* ---------------- chat de IA ---------------- */

// Os três glifos da fileira de ações. São formas genéricas de propósito: a
// referência é a gramática visual dos chats de IA, não a marca de nenhum deles.

function glifoClipe(ctx, x, y, t, cor) {
  ctx.strokeStyle = cor;
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + t * 0.66, y + t * 0.3);
  ctx.lineTo(x + t * 0.3, y + t * 0.66);
  ctx.arc(x + t * 0.5, y + t * 0.5, t * 0.28, Math.PI * 0.75, Math.PI * 1.75);
  ctx.stroke();
}

function glifoGlobo(ctx, x, y, t, cor) {
  const cx = x + t / 2;
  const cy = y + t / 2;
  const r = t * 0.34;
  ctx.strokeStyle = cor;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.45, r, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function glifoCapelo(ctx, x, y, t, cor) {
  const cx = x + t / 2;
  const cy = y + t * 0.44;
  const l = t * 0.38;
  ctx.strokeStyle = cor;
  ctx.lineWidth = 1.6;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy - t * 0.16);
  ctx.lineTo(cx + l, cy + t * 0.02);
  ctx.lineTo(cx, cy + t * 0.2);
  ctx.lineTo(cx - l, cy + t * 0.02);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - l * 0.55, cy + t * 0.1);
  ctx.lineTo(cx - l * 0.55, cy + t * 0.3);
  ctx.stroke();
}

/** Pílula de ação: contorno arredondado, glifo à esquerda, rótulo à direita. */
function desenharChip(ctx, x, y, rotulo, glifo, cor, fonteCorpo) {
  const alturaChip = 52;
  const tamanhoGlifo = 22;
  ctx.font = fonte(fonteCorpo, 23, 400);
  const larguraTexto = ctx.measureText(rotulo).width;
  const largura = 22 + tamanhoGlifo + 11 + larguraTexto + 22;

  ctx.strokeStyle = comAlfa(cor, 0.34);
  ctx.lineWidth = 1.8;
  retanguloArredondado(ctx, x, y, largura, alturaChip, alturaChip / 2);
  ctx.stroke();

  glifo(ctx, x + 22, y + (alturaChip - tamanhoGlifo) / 2, tamanhoGlifo, cor);

  ctx.fillStyle = cor;
  ctx.textBaseline = "middle";
  ctx.fillText(rotulo, x + 22 + tamanhoGlifo + 11, y + alturaChip / 2 + 1);
  ctx.textBaseline = "alphabetic";

  return largura;
}

/** Botão redondo de enviar, com a seta para cima. */
function desenharEnviar(ctx, cx, cy, r, corFundo) {
  ctx.fillStyle = corFundo;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = contraste(corFundo);
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.4);
  ctx.lineTo(cx, cy - r * 0.42);
  ctx.moveTo(cx - r * 0.3, cy - r * 0.12);
  ctx.lineTo(cx, cy - r * 0.44);
  ctx.lineTo(cx + r * 0.3, cy - r * 0.12);
  ctx.stroke();
}

/** A setinha curva que sai da etiqueta e aponta pro balão. */
function desenharSetaCurva(ctx, x, y, cor) {
  ctx.strokeStyle = cor;
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x + 40, y + 4, x + 58, y + 26, x + 62, y + 62);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 50, y + 46);
  ctx.lineTo(x + 62, y + 66);
  ctx.lineTo(x + 74, y + 44);
  ctx.stroke();
}

/**
 * Card que imita a caixa de conversa de um chat de IA: título em cima,
 * etiqueta, e o corpo dentro do balão com a fileira de ações e o botão de
 * enviar. É a referência visual do gênero — sem nome nem marca de ninguém.
 */
async function layoutChat(ctx, opcoes) {
  const { W, H, card, template, indice, handle, ehCapa } = opcoes;

  // A capa continua sendo foto com título grande: é ela que para o dedo. E um
  // card sem corpo (o CTA) não tem prompt pra mostrar. Nos dois casos o
  // editorial já faz melhor do que uma caixa de chat vazia faria.
  if (ehCapa || !card.texto?.trim()) {
    return layoutEditorial(ctx, opcoes);
  }

  const { paleta, fontes } = visualDoCard(opcoes);
  const pad = Math.round(W * 0.07);
  const larguraUtil = W - pad * 2;

  ctx.fillStyle = paleta.fundo;
  ctx.fillRect(0, 0, W, H);

  const familiaTitulo = fontes.titulo;
  const peso = pesoTitulo(familiaTitulo);
  const alturaLinha = alturaLinhaTitulo(familiaTitulo);

  let y = Math.round(H * 0.11);

  const tituloAjuste = ajustar(
    ctx,
    tituloComNumero(card, template, indice, ehCapa),
    larguraUtil,
    3,
    familiaTitulo,
    peso,
    Math.round(W * 0.072),
    Math.round(W * 0.038)
  );

  ctx.font = fonte(familiaTitulo, tituloAjuste.tamanho, peso);
  ctx.textBaseline = "top";
  y = desenharLinhas(
    ctx,
    tituloAjuste.linhas,
    pad,
    y,
    tituloAjuste.tamanho,
    alturaLinha,
    paleta.tituloCor || paleta.texto,
    paleta.botoes,
    1,
    Boolean(template?.destaqueCaixa)
  );

  // Etiqueta invertida — fundo na cor do texto, letra na cor do fundo.
  const etiqueta = (card.selo || "PROMPT").toUpperCase();
  y += 26;
  ctx.font = fonte("JetBrains Mono", 24, 700);
  const larguraEtiqueta = ctx.measureText(etiqueta).width + 34;
  const alturaEtiqueta = 42;
  ctx.fillStyle = paleta.texto;
  ctx.fillRect(pad, y, larguraEtiqueta, alturaEtiqueta);
  ctx.fillStyle = paleta.fundo;
  ctx.textBaseline = "middle";
  ctx.fillText(etiqueta, pad + 17, y + alturaEtiqueta / 2 + 1);
  ctx.textBaseline = "top";

  desenharSetaCurva(ctx, pad + larguraEtiqueta + 22, y + alturaEtiqueta / 2, paleta.texto);

  y += alturaEtiqueta + 74;

  // O balão cresce com o texto: mede primeiro, desenha depois.
  const padBalao = 44;
  const larguraTexto = larguraUtil - padBalao * 2;
  const corpoTamanho = Math.round(W * 0.031);
  const corpoAjuste = ajustar(
    ctx,
    card.texto,
    larguraTexto,
    11,
    fontes.corpo,
    400,
    corpoTamanho,
    Math.round(W * 0.02)
  );
  const alturaTexto = corpoAjuste.linhas.length * corpoAjuste.tamanho * 1.5;
  const alturaAcoes = 52;
  const alturaBalao = padBalao + alturaTexto + 38 + alturaAcoes + padBalao * 0.8;

  const claro = contraste(paleta.fundo) === "#111111";
  ctx.fillStyle = claro ? "#ffffff" : comAlfa(paleta.texto, 0.07);
  retanguloArredondado(ctx, pad, y, larguraUtil, alturaBalao, 40);
  ctx.fill();
  if (!claro) {
    ctx.strokeStyle = comAlfa(paleta.texto, 0.14);
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }

  ctx.font = fonte(fontes.corpo, corpoAjuste.tamanho, 400);
  desenharLinhas(
    ctx,
    corpoAjuste.linhas,
    pad + padBalao,
    y + padBalao,
    corpoAjuste.tamanho,
    1.5,
    paleta.corpoCor || paleta.texto,
    paleta.botoes,
    0.95,
    Boolean(template?.destaqueCaixa)
  );

  // Fileira de ações, alinhada com o botão de enviar na outra ponta.
  const yAcoes = y + padBalao + alturaTexto + 38;
  const corTenue = comAlfa(paleta.texto, 0.7);
  let x = pad + padBalao;
  x += desenharChip(ctx, x, yAcoes, "Anexar", glifoClipe, corTenue, fontes.corpo) + 14;
  x += desenharChip(ctx, x, yAcoes, "Buscar", glifoGlobo, corTenue, fontes.corpo) + 14;
  desenharChip(ctx, x, yAcoes, "Estudar", glifoCapelo, corTenue, fontes.corpo);

  const raioEnviar = 30;
  desenharEnviar(
    ctx,
    pad + larguraUtil - padBalao - raioEnviar,
    yAcoes + alturaAcoes / 2,
    raioEnviar,
    paleta.texto
  );

  ctx.textBaseline = "alphabetic";

  // Assinatura espaçada no rodapé, na cor de acento — como na referência.
  if (handle) {
    ctx.font = fonte("JetBrains Mono", 21, 600);
    ctx.fillStyle = paleta.botoes;
    ctx.textBaseline = "middle";
    const marca = handle.replace(/^@\s*/, "").toUpperCase().split("").join(" ");
    ctx.fillText(marca, pad, H - 74);
    ctx.textBaseline = "alphabetic";
  }
}

async function layoutTweet(ctx, opcoes) {
  const { W, H, card, indice, total, handle, perfil } = opcoes;
  const { paleta, fontes } = visualDoCard(opcoes);
  const pad = Math.round(W * 0.07);
  const larguraUtil = W - pad * 2;

  ctx.fillStyle = paleta.fundo;
  ctx.fillRect(0, 0, W, H);

  const topo = Math.round(H * 0.22);
  const raioAvatar = 34;
  const cxAvatar = pad + raioAvatar;
  const cyAvatar = topo + raioAvatar;

  const foto = await carregarImagem(perfil?.foto);
  if (foto) {
    // Recorta no círculo antes de desenhar, senão a foto sai quadrada por
    // cima do avatar.
    ctx.save();
    ctx.beginPath();
    ctx.arc(cxAvatar, cyAvatar, raioAvatar, 0, Math.PI * 2);
    ctx.clip();
    const escala = Math.max((raioAvatar * 2) / foto.width, (raioAvatar * 2) / foto.height);
    const w = foto.width * escala;
    const h = foto.height * escala;
    ctx.drawImage(foto, cxAvatar - w / 2, cyAvatar - h / 2, w, h);
    ctx.restore();
  } else {
    ctx.beginPath();
    ctx.arc(cxAvatar, cyAvatar, raioAvatar, 0, Math.PI * 2);
    ctx.fillStyle = "#d9d3c8";
    ctx.fill();

    // Sem foto, a inicial vem do nome — que é o que a pessoa reconhece.
    const base = perfil?.nome || handle || "S";
    const inicial = base.replace(/^@/, "").trim().charAt(0).toUpperCase() || "S";
    ctx.font = fonte(fontes.corpo, 32, 700);
    ctx.fillStyle = "#6b6660";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(inicial, cxAvatar, cyAvatar + 1);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  const nome = perfil?.nome?.trim() || "Seu Nome";
  const xTexto = pad + raioAvatar * 2 + 22;
  ctx.font = fonte(fontes.corpo, 30, 700);
  ctx.fillStyle = paleta.texto;
  ctx.fillText(nome, xTexto, topo + 30);

  const larguraNome = ctx.measureText(nome).width;
  ctx.beginPath();
  ctx.arc(xTexto + larguraNome + 18, topo + 21, 9, 0, Math.PI * 2);
  ctx.fillStyle = "#1d9bf0";
  ctx.fill();

  ctx.font = fonte(fontes.corpo, 26, 400);
  ctx.fillStyle = paleta.secundaria;
  ctx.fillText(`@${(handle || "seuperfil").replace(/^@/, "")}`, xTexto, topo + 68);

  let y = topo + raioAvatar * 2 + 52;

  const tituloAjuste = ajustar(
    ctx,
    card.titulo || "",
    larguraUtil,
    5,
    fontes.titulo,
    700,
    Math.round(W * 0.048),
    Math.round(W * 0.03)
  );
  ctx.font = fonte(fontes.titulo, tituloAjuste.tamanho, 700);
  ctx.textBaseline = "top";
  y = desenharLinhas(
    ctx,
    tituloAjuste.linhas,
    pad,
    y,
    tituloAjuste.tamanho,
    1.3,
    paleta.texto,
    paleta.botoes
  );

  if (card.texto) {
    y += 20;
    const corpoTamanho = Math.round(W * 0.026);
    ctx.font = fonte(fontes.corpo, corpoTamanho, 400);
    const linhas = quebrar(ctx, palavras(card.texto), larguraUtil);
    y = desenharLinhas(
      ctx,
      linhas,
      pad,
      y,
      corpoTamanho,
      1.5,
      paleta.secundaria,
      paleta.botoes
    );
  }
  ctx.textBaseline = "alphabetic";

  desenharRodape(ctx, {
    W,
    H,
    pad,
    indice,
    total,
    paleta,
    arrasta: indice < total - 1,
  });
}

/* ---------------- API ---------------- */

/**
 * Desenha um card e devolve o canvas em resolução cheia (1080px de largura).
 * @param {object} card  { titulo, texto, selo, botao, palavraImpacto }
 */
export async function renderizarCard({
  card,
  template,
  paleta,
  fontes,
  tamanho = "retrato",
  indice = 0,
  total = 1,
  imagem = null,
  handle = "",
  perfil = null,
  ehCapa = false,
  escala = 1,
}) {
  const { w: W, h: H } = TAMANHOS[tamanho] || TAMANHOS.retrato;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(W * escala);
  canvas.height = Math.round(H * escala);
  const ctx = canvas.getContext("2d");
  // Os layouts trabalham sempre em coordenadas de 1080px; a escala só encolhe
  // o bitmap, então a mesma rotina serve pra miniatura e pro PNG final.
  if (escala !== 1) ctx.scale(escala, escala);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  const opcoes = {
    W,
    H,
    card,
    template,
    paleta,
    fontes,
    indice,
    total,
    imagem,
    handle,
    perfil,
    ehCapa,
  };

  if (template?.layout === "tweet") {
    await layoutTweet(ctx, opcoes);
  } else if (template?.layout === "chat") {
    await layoutChat(ctx, opcoes);
  } else {
    await layoutEditorial(ctx, opcoes);
  }

  return canvas;
}

export function canvasParaBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export function baixarCanvas(canvas, nomeArquivo) {
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
