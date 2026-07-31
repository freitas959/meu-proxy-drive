"use client";

import { useCallback, useEffect, useState } from "react";
import CardCanvas from "./CardCanvas";
import s from "./previa.module.css";

/**
 * Número de curtidas plausível e estável: derivado do conteúdo, então não muda
 * a cada abertura (o que distrairia de avaliar a arte).
 */
function curtidasFicticias(semente) {
  let h = 2166136261;
  for (let i = 0; i < semente.length; i++) {
    h ^= semente.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 320 + ((h >>> 0) % 4680);
}

function IconeCoracao() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="#ed4956" aria-hidden="true">
      <path d="M12 21.4l-1.5-1.35C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.5 11.55L12 21.4z" />
    </svg>
  );
}

function IconeComentario() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 11.5a8.38 8.38 0 01-9 8.5 8.5 8.5 0 01-3.8-.9L3 21l1.9-5.1A8.38 8.38 0 014 11.5 8.5 8.5 0 0112.5 3 8.38 8.38 0 0121 11.5z"
        stroke="#111"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconeEnviar() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="#111"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconeSalvar() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 3h12v18l-6-4.5L6 21V3z" stroke="#111" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function SeloVerificado() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-label="verificado">
      <path
        d="M12 1l2.4 2.1 3.2-.3.9 3.1 2.8 1.6-1.2 3 1.2 3-2.8 1.6-.9 3.1-3.2-.3L12 23l-2.4-2.1-3.2.3-.9-3.1L2.7 16.5l1.2-3-1.2-3 2.8-1.6.9-3.1 3.2.3L12 1z"
        fill="#0095f6"
      />
      <path
        d="M10.6 15.4l-3-3 1.3-1.3 1.7 1.7 4.4-4.4 1.3 1.3-5.7 5.7z"
        fill="#fff"
      />
    </svg>
  );
}

/**
 * Simula o post no feed do Instagram para o usuário conferir enquadramento,
 * legibilidade em tamanho real e como a sequência de cards se lê.
 */
export default function PreviaFeed({
  roteiro,
  template,
  paleta,
  fontes,
  tamanho,
  handle,
  perfilPost,
  imagens,
  legenda,
  onFechar,
}) {
  const [indice, setIndice] = useState(0);
  const total = roteiro.length;

  const arroba = (handle || "seuperfil").replace(/^@\s*/, "") || "seuperfil";
  // O nome e a foto que o usuário definiu no passo 3 valem aqui também: a
  // simulação do feed é a mesma conta que aparece dentro do card.
  const inicial = (perfilPost?.nome || arroba).charAt(0).toUpperCase();
  const curtidas = curtidasFicticias(roteiro[0]?.titulo || arroba);
  const textoLegenda = legenda?.trim() || roteiro[0]?.titulo || "";

  const anterior = useCallback(() => setIndice((i) => Math.max(0, i - 1)), []);
  const proximo = useCallback(
    () => setIndice((i) => Math.min(total - 1, i + 1)),
    [total]
  );

  // O contador reaparece a cada troca de card e some sozinho, como no app.
  const [contadorVisivel, setContadorVisivel] = useState(true);
  useEffect(() => {
    setContadorVisivel(true);
    const t = setTimeout(() => setContadorVisivel(false), 2600);
    return () => clearTimeout(t);
  }, [indice]);

  useEffect(() => {
    const aoTeclar = (e) => {
      if (e.key === "Escape") onFechar();
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") proximo();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onFechar, anterior, proximo]);

  // Arrastar com o dedo, como no app de verdade.
  const [toqueX, setToqueX] = useState(null);
  function aoSoltar(e) {
    if (toqueX === null) return;
    const delta = e.changedTouches[0].clientX - toqueX;
    if (Math.abs(delta) > 40) (delta < 0 ? proximo : anterior)();
    setToqueX(null);
  }

  return (
    <div
      className={s.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Prévia do carrossel no feed"
      onMouseDown={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div className={s.post}>
        <button type="button" className={s.fechar} onClick={onFechar} aria-label="Fechar prévia">
          ×
        </button>

        <header className={s.cabecalho}>
          <span className={s.avatar} aria-hidden="true">
            {perfilPost?.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={perfilPost.foto} alt="" className={s.avatarFoto} />
            ) : (
              inicial
            )}
          </span>
          <span className={s.perfil}>{arroba}</span>
          <SeloVerificado />
          <span className={s.menu} aria-hidden="true">
            ⋯
          </span>
        </header>

        <div
          className={s.palco}
          onTouchStart={(e) => setToqueX(e.touches[0].clientX)}
          onTouchEnd={aoSoltar}
        >
          <CardCanvas
            className={s.slide}
            card={roteiro[indice]}
            template={template}
            paleta={paleta}
            fontes={fontes}
            tamanho={tamanho}
            indice={indice}
            total={total}
            imagem={imagens[indice] || null}
            imagemB={imagens[`${indice}b`] || null}
            handle={handle}
            perfil={perfilPost}
            ehCapa={indice === 0}
            escala={0.42}
          />

          <span
            className={`${s.contador} ${contadorVisivel ? s.contadorVisivel : ""}`}
          >
            {indice + 1}/{total}
          </span>

          {indice > 0 && (
            <button
              type="button"
              className={`${s.seta} ${s.setaEsq}`}
              onClick={anterior}
              aria-label="Card anterior"
            >
              ‹
            </button>
          )}
          {indice < total - 1 && (
            <button
              type="button"
              className={`${s.seta} ${s.setaDir}`}
              onClick={proximo}
              aria-label="Próximo card"
            >
              ›
            </button>
          )}
        </div>

        <div className={s.pontos}>
          {roteiro.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${s.ponto} ${i === indice ? s.pontoAtivo : ""}`}
              onClick={() => setIndice(i)}
              aria-label={`Ir para o card ${i + 1}`}
            />
          ))}
        </div>

        <div className={s.acoes}>
          <IconeCoracao />
          <IconeComentario />
          <IconeEnviar />
          <span className={s.acoesDireita}>
            <IconeSalvar />
          </span>
        </div>

        <div className={s.rodape}>
          <p className={s.curtidas}>{curtidas.toLocaleString("pt-BR")} curtidas</p>
          {textoLegenda && (
            <p className={s.legenda}>
              <span className={s.perfilLegenda}>{arroba}</span> {textoLegenda}
            </p>
          )}
          <p className={s.aviso}>Prévia ilustrativa — curtidas e comentários são fictícios.</p>
        </div>
      </div>
    </div>
  );
}
