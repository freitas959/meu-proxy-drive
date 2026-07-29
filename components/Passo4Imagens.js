"use client";

import { useState } from "react";
import CardCanvas from "./CardCanvas";
import PreviaFeed from "./PreviaFeed";
import { renderizarCard, carregarFontes, canvasParaBlob, baixarCanvas } from "@/lib/render";
import s from "@/app/app/wizard.module.css";

function nomeArquivo(indice, total) {
  return `carrossel-${String(indice + 1).padStart(2, "0")}-de-${total}.png`;
}

export default function Passo4Imagens({
  template,
  paleta,
  fontes,
  tamanho,
  handle,
  perfil,
  roteiro,
  imagens,
  gerandoCapa,
  erroCapa,
  capaEstilo,
  legenda,
  onVoltar,
  onNovo,
}) {
  const [ocupado, setOcupado] = useState(null);
  const [feedAberto, setFeedAberto] = useState(false);
  const [aviso, setAviso] = useState("");

  const total = roteiro.length;

  /** Redesenha o card em resolução cheia — a prévia na tela é reduzida. */
  async function renderCheio(indice) {
    await carregarFontes([fontes.titulo, fontes.corpo]);
    return renderizarCard({
      card: roteiro[indice],
      template,
      paleta,
      fontes,
      tamanho,
      indice,
      total,
      imagem: imagens[indice] || null,
      handle,
      perfil,
      ehCapa: indice === 0,
    });
  }

  async function baixarUm(indice) {
    setOcupado(`um-${indice}`);
    try {
      baixarCanvas(await renderCheio(indice), nomeArquivo(indice, total));
    } finally {
      setOcupado(null);
    }
  }

  async function baixarZip() {
    setOcupado("zip");
    setAviso("");
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      for (let i = 0; i < total; i++) {
        const blob = await canvasParaBlob(await renderCheio(i));
        zip.file(nomeArquivo(i, total), blob);
      }
      const conteudo = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(conteudo);
      const a = document.createElement("a");
      a.href = url;
      a.download = "carrossel.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setAviso("Não consegui montar o .zip. Baixe os cards individualmente.");
    } finally {
      setOcupado(null);
    }
  }

  /**
   * No celular, compartilhar os PNGs é o caminho pra "salvar nas fotos".
   * Onde a Web Share API não aceita arquivos, cai pro .zip.
   */
  async function salvarNasFotos() {
    setOcupado("fotos");
    setAviso("");
    try {
      const arquivos = [];
      for (let i = 0; i < total; i++) {
        const blob = await canvasParaBlob(await renderCheio(i));
        arquivos.push(new File([blob], nomeArquivo(i, total), { type: "image/png" }));
      }
      if (navigator.canShare?.({ files: arquivos })) {
        await navigator.share({ files: arquivos, title: "Meu carrossel" });
      } else {
        setAviso("Seu navegador não permite salvar direto nas fotos. Baixei o .zip.");
        setOcupado(null);
        await baixarZip();
        return;
      }
    } catch (erro) {
      if (erro?.name !== "AbortError") {
        setAviso("Não consegui compartilhar. Tente baixar o .zip.");
      }
    } finally {
      setOcupado(null);
    }
  }

  return (
    <>
      <span className="step-pill">Passo 4 de 4</span>
      <h1 className="page-title">Seu carrossel</h1>
      <p className="page-sub">
        Cards desenhados na hora, com tipografia nítida em PNG. Baixe individual ou tudo em
        .zip.
      </p>

      <div className={s.resultadoTopo}>
        <span className={s.resultadoTitulo}>Slides prontos</span>
        <div className="step-actions-right">
          <button type="button" className="btn" onClick={() => setFeedAberto(true)}>
            Prévia no feed
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={salvarNasFotos}
            disabled={Boolean(ocupado) || gerandoCapa}
          >
            {ocupado === "fotos" ? "Preparando…" : "Salvar nas fotos"}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={baixarZip}
            disabled={Boolean(ocupado) || gerandoCapa}
          >
            {ocupado === "zip" ? "Compactando…" : "Baixar todas (.zip)"}
          </button>
        </div>
      </div>

      {aviso && <p className={s.erro}>{aviso}</p>}
      {erroCapa && (
        <p className={s.erro}>
          A capa da IA falhou ({erroCapa}). Os outros cards estão prontos — dá pra voltar ao
          roteiro e tentar de novo, trocar o estilo da capa no passo anterior, ou seguir com
          a capa só de texto.
        </p>
      )}

      {feedAberto && (
        <PreviaFeed
          roteiro={roteiro}
          template={template}
          paleta={paleta}
          fontes={fontes}
          tamanho={tamanho}
          handle={handle}
          perfilPost={perfil}
          imagens={imagens}
          legenda={legenda}
          onFechar={() => setFeedAberto(false)}
        />
      )}

      <div className={s.gradeResultado}>
        {roteiro.map((card, i) => {
          const capaPendente = i === 0 && gerandoCapa;
          return (
            <div
              key={i}
              className={`${s.slotResultado} ${i === 0 ? s.slotResultadoAtivo : ""}`}
            >
              {capaPendente ? (
                <div className={s.gerando}>
                  <span className={s.gerandoQuadrado} />
                  <span className={s.gerandoTitulo}>
                    {capaEstilo === "foto"
                      ? "Aguarde: fotografando a capa."
                      : "Aguarde: criando capa com Claude."}
                  </span>
                  <span className={s.gerandoNota}>
                    {capaEstilo === "foto"
                      ? "a IA está gerando a imagem (~10s · pode deixar rolando)"
                      : "a IA está desenhando o card completo (~1 min · pode deixar rolando)"}
                  </span>
                </div>
              ) : (
                <CardCanvas
                  card={card}
                  template={template}
                  paleta={paleta}
                  fontes={fontes}
                  tamanho={tamanho}
                  indice={i}
                  total={total}
                  imagem={imagens[i] || null}
                  handle={handle}
                  perfil={perfil}
                  ehCapa={i === 0}
                  escala={0.3}
                />
              )}

              <button
                type="button"
                className={s.slotBaixar}
                onClick={() => baixarUm(i)}
                disabled={capaPendente || ocupado === `um-${i}`}
              >
                {capaPendente
                  ? "Gerando…"
                  : ocupado === `um-${i}`
                    ? "Baixando…"
                    : `Baixar ${String(i + 1).padStart(2, "0")}`}
              </button>
            </div>
          );
        })}
      </div>

      <div className="step-actions">
        <button type="button" className="btn" onClick={onVoltar}>
          Voltar ao roteiro
        </button>
        <button type="button" className="btn" onClick={onNovo}>
          Novo carrossel
        </button>
      </div>
    </>
  );
}
