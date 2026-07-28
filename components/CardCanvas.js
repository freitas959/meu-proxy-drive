"use client";

import { useEffect, useRef } from "react";
import { renderizarCard, carregarFontes } from "@/lib/render";

/**
 * Prévia de um card. Desenha sempre em 1080px e deixa o CSS reduzir, então o
 * que aparece na tela é exatamente o PNG que será baixado.
 */
export default function CardCanvas({
  card,
  template,
  paleta,
  fontes,
  tamanho = "retrato",
  indice = 0,
  total = 1,
  imagem = null,
  handle = "",
  ehCapa = false,
  escala = 1,
  className = "",
  style,
}) {
  const hospedeiro = useRef(null);

  // Serializa as props de desenho pra só redesenhar quando algo visual muda.
  const chave = JSON.stringify({
    card,
    layout: template?.layout,
    paleta,
    fontes,
    tamanho,
    indice,
    total,
    imagem,
    handle,
    ehCapa,
    escala,
  });

  useEffect(() => {
    let cancelado = false;

    (async () => {
      await carregarFontes([fontes?.titulo, fontes?.corpo]);
      const canvas = await renderizarCard({
        card,
        template,
        paleta,
        fontes,
        tamanho,
        indice,
        total,
        imagem,
        handle,
        ehCapa,
        escala,
      });
      // Uma re-renderização mais nova pode ter terminado antes desta; nesse
      // caso descartamos o resultado velho em vez de sobrescrever o novo.
      if (cancelado || !hospedeiro.current) return;
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      canvas.style.display = "block";
      hospedeiro.current.replaceChildren(canvas);
    })();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  return <div ref={hospedeiro} className={className} style={style} aria-hidden="true" />;
}
