"use client";

// Preparo das fotos que o usuário sobe para os cards.
//
// Antes o app recusava qualquer arquivo acima de 4 MB. Na prática isso recusava
// quase toda foto de celular — e o aviso aparecia longe dos quadradinhos, então
// dava a impressão de que o clique simplesmente não fez nada.
//
// Recusar era desperdício além de confuso: o card é renderizado a 1080px, então
// uma foto de 4000px é peso jogado fora. Reduzir no navegador resolve os dois
// problemas de uma vez.

/** Maior lado depois da redução. Folga sobre os 1080px do card, para o corte. */
const LADO_MAX = 1800;

/** Teto do que aceitamos ler, já reduzido. Acima disso é arquivo estranho. */
export const LIMITE_ARQUIVO = 25 * 1024 * 1024;

/**
 * Leitura crua, sem reduzir. As referências que a IA lê passam por aqui: PDF
 * não atravessa canvas, e reduzir a imagem de referência pioraria justamente o
 * detalhe que o modelo precisa enxergar.
 */
export function lerComoDataURL(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () => reject(new Error("Não consegui ler o arquivo."));
    leitor.readAsDataURL(arquivo);
  });
}

function carregar(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Esse arquivo não parece uma imagem."));
    img.src = dataUrl;
  });
}

/**
 * Lê a foto e devolve um data URL já reduzido.
 *
 * Sai em JPEG mesmo quando entra PNG: foto em PNG ocupa várias vezes mais, e o
 * que vai para o card é fotografia, não arte com transparência. A exceção fica
 * para imagens pequenas, que voltam como estão — recomprimir só perderia
 * qualidade sem ganhar nada.
 */
export async function prepararFoto(arquivo) {
  if (arquivo.size > LIMITE_ARQUIVO) {
    throw new Error("Arquivo acima de 25 MB. Esse é grande demais até para reduzir.");
  }

  const original = await lerComoDataURL(arquivo);
  const img = await carregar(original);

  const maiorLado = Math.max(img.width, img.height);
  if (maiorLado <= LADO_MAX && arquivo.size <= 1024 * 1024) return original;

  const escala = Math.min(1, LADO_MAX / maiorLado);
  const largura = Math.round(img.width * escala);
  const altura = Math.round(img.height * escala);

  const tela = document.createElement("canvas");
  tela.width = largura;
  tela.height = altura;
  const ctx = tela.getContext("2d");
  // Sem isto, reduzir muito serrilha a foto.
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, largura, altura);

  return tela.toDataURL("image/jpeg", 0.86);
}

/** Só para a mensagem de erro e para o log; não decide nada. */
export function emMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1).replace(".", ",");
}
