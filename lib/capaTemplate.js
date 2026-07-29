"use client";

import { getSupabase } from "@/lib/supabase/navegador";

const BUCKET = "templates";

/** data:image/png;base64,... → Blob, que é o que o Storage aceita. */
function dataUrlParaBlob(dataUrl) {
  const [cabecalho, base64] = dataUrl.split(",");
  const tipo = /data:([^;]+)/.exec(cabecalho)?.[1] || "image/png";
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return new Blob([bytes], { type: tipo });
}

/**
 * Sobe a capa do template e devolve a URL pública.
 *
 * O nome do arquivo leva um carimbo de tempo de propósito: sobrescrever o
 * mesmo caminho deixaria o navegador servindo a imagem velha do cache, e a
 * troca de capa pareceria não ter funcionado.
 */
export async function enviarCapa(templateId, arquivo) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Banco não configurado.");

  const blob = typeof arquivo === "string" ? dataUrlParaBlob(arquivo) : arquivo;

  if (blob.size > 5 * 1024 * 1024) {
    throw new Error("A imagem passa de 5 MB. Reduza antes de subir.");
  }
  if (!/^image\/(png|jpeg|webp)$/.test(blob.type)) {
    throw new Error("Use PNG, JPEG ou WebP.");
  }

  const extensao = blob.type.split("/")[1].replace("jpeg", "jpg");
  const caminho = `${templateId || "rascunho"}/${Date.now()}.${extensao}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(caminho, blob, { contentType: blob.type, upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho);
  return data.publicUrl;
}
