"use client";

import { useRef, useState } from "react";
import { FONTES_TITULO, FONTES_CORPO } from "@/lib/templates";
import { TAMANHOS } from "@/lib/render";
import { CUSTOS } from "@/lib/store";
import s from "@/app/app/wizard.module.css";

const ROTULO_TIPO = {
  hook: "Hook · abertura",
  conteudo: "Conteúdo",
  cta: "CTA · fechamento",
};

const SWATCHES = [
  { chave: "fundo", nome: "Fundo" },
  { chave: "texto", nome: "Texto" },
  { chave: "secundaria", nome: "Secundária" },
  { chave: "botoes", nome: "Botões" },
];

export default function Passo3Roteiro({
  template,
  paleta,
  setPaleta,
  fontes,
  setFontes,
  tamanho,
  setTamanho,
  handle,
  setHandle,
  roteiro,
  setRoteiro,
  capaIA,
  setCapaIA,
  capaEstilo,
  temUploadCapa,
  onVoltar,
  onGerar,
  carregando,
}) {
  const [fonteCustom, setFonteCustom] = useState(null);
  const inputFonte = useRef(null);

  const custo = capaIA ? CUSTOS.capaIA : 0;

  function alterarSlide(indice, campo, valor) {
    setRoteiro(
      roteiro.map((slide, i) => (i === indice ? { ...slide, [campo]: valor } : slide))
    );
  }

  /**
   * Registra a fonte do usuário no documento com FontFace, o que a torna
   * utilizável tanto no CSS quanto no canvas que gera o PNG.
   */
  async function receberFonte(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;
    try {
      const buffer = await arquivo.arrayBuffer();
      const nome = arquivo.name.replace(/\.[^.]+$/, "").slice(0, 40) || "Minha fonte";
      const face = new FontFace(nome, buffer);
      await face.load();
      document.fonts.add(face);
      setFonteCustom(nome);
      setFontes({ ...fontes, titulo: nome });
    } catch {
      setFonteCustom(null);
      alert("Não consegui carregar essa fonte. Use um arquivo .ttf, .otf ou .woff2.");
    }
  }

  const opcoesTitulo = fonteCustom ? [fonteCustom, ...FONTES_TITULO] : FONTES_TITULO;

  return (
    <>
      <span className="step-pill">Passo 3 de 4</span>
      <h1 className="page-title">Roteiro e ajustes</h1>
      <p className="page-sub">
        A IA escreveu o texto e o design de cada card. Edite o que quiser, escolha o tamanho
        da arte e gere.
      </p>

      <div className={`panel ${s.bloco}`} style={{ marginTop: 26 }}>
        <div className={s.blocoTopo}>
          <span className={s.blocoTitulo}>Tamanho da arte</span>
          <span className={s.selo}>Obrigatório</span>
        </div>

        <div className={s.tamanhoOpcoes}>
          {Object.entries(TAMANHOS).map(([chave, info]) => {
            const ativo = tamanho === chave;
            return (
              <button
                key={chave}
                type="button"
                className={`${s.tamanhoBtn} ${ativo ? s.tamanhoBtnAtivo : ""}`}
                onClick={() => setTamanho(chave)}
                aria-pressed={ativo}
              >
                <span
                  className={s.tamanhoIcone}
                  style={{
                    width: 22,
                    height: chave === "quadrado" ? 22 : 27,
                    background: ativo ? "rgba(255,255,255,0.45)" : "transparent",
                  }}
                  aria-hidden="true"
                />
                <span>
                  <span className={s.tamanhoNome}>{info.label}</span>
                  <br />
                  <span className={s.tamanhoNota}>{info.nota}</span>
                </span>
              </button>
            );
          })}
        </div>

        <hr className="divider-dashed" />

        <div className={s.handleLinha}>
          <label className="mono-label" htmlFor="handle">
            Seu @ do Instagram{" "}
            <span className={s.rotuloLeve}>(opcional, aparece nos cards)</span>
          </label>
          <input
            id="handle"
            className={`field ${s.handleCampo}`}
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="@ seuperfil"
          />
        </div>
      </div>

      <div className={`panel ${s.bloco}`}>
        <div className={s.tipografia}>
          <div className={s.tipoGrupo}>
            <label className="mono-label" htmlFor="fonte-titulo">
              Título
            </label>
            <select
              id="fonte-titulo"
              className={s.select}
              value={fontes.titulo}
              onChange={(e) => setFontes({ ...fontes, titulo: e.target.value })}
            >
              {opcoesTitulo.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className={s.tipoGrupo}>
            <label className="mono-label" htmlFor="fonte-corpo">
              Corpo
            </label>
            <select
              id="fonte-corpo"
              className={s.select}
              value={fontes.corpo}
              onChange={(e) => setFontes({ ...fontes, corpo: e.target.value })}
            >
              {FONTES_CORPO.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className={s.tipoGrupo}>
            <span className="mono-label">
              Paleta <span className={s.rotuloLeve}>(clique p/ trocar)</span>
            </span>
            <div className={s.paleta}>
              {SWATCHES.map(({ chave, nome }) => (
                <span key={chave} className={s.swatchGrupo}>
                  <input
                    type="color"
                    className={s.swatch}
                    value={paleta[chave]}
                    onChange={(e) => setPaleta({ ...paleta, [chave]: e.target.value })}
                    aria-label={`Cor: ${nome}`}
                  />
                  <span className={s.swatchNome}>{nome.toUpperCase()}</span>
                </span>
              ))}
            </div>
          </div>

          <div className={s.tipoGrupo}>
            <span className="mono-label">
              Sua fonte <span className={s.rotuloLeve}>(diferencial)</span>
            </span>
            <button
              type="button"
              className={s.fonteUpload}
              onClick={() => inputFonte.current?.click()}
            >
              ↑ {fonteCustom ? "Trocar fonte" : "Subir minha fonte"}
            </button>
            <input
              ref={inputFonte}
              type="file"
              accept=".ttf,.otf,.woff,.woff2,font/*"
              hidden
              onChange={receberFonte}
            />
          </div>
        </div>
      </div>

      {roteiro.map((slide, i) => {
        const ehCapa = i === 0;
        return (
          <div
            key={i}
            className={`${s.cardRoteiro} ${ehCapa ? s.cardRoteiroCapa : ""}`}
          >
            <div className={s.cardRoteiroTopo}>
              <span className={s.cardRoteiroNum}>{String(i + 1).padStart(2, "0")}</span>
              <span className={s.cardRoteiroTipo}>
                {ROTULO_TIPO[slide.tipo] || "Conteúdo"}
              </span>
              <input
                className={s.seloCampo}
                value={slide.selo || ""}
                maxLength={16}
                onChange={(e) => alterarSlide(i, "selo", e.target.value.toUpperCase())}
                aria-label={`Selo do card ${i + 1}`}
              />
            </div>

            <div className={s.cardRoteiroCorpo}>
              <input
                className={s.tituloCampo}
                value={slide.titulo || ""}
                onChange={(e) => alterarSlide(i, "titulo", e.target.value)}
                aria-label={`Título do card ${i + 1}`}
              />
              <textarea
                className={s.textoCampo}
                rows={3}
                value={slide.texto || ""}
                onChange={(e) => alterarSlide(i, "texto", e.target.value)}
                aria-label={`Texto do card ${i + 1}`}
              />

              {ehCapa && (
                <>
                  <label className={`mono-label ${s.rotulo}`} htmlFor="impacto">
                    Palavra de impacto{" "}
                    <span className={s.rotuloLeve}>(gigante, na cor de destaque)</span>
                  </label>
                  <input
                    id="impacto"
                    className="field"
                    value={slide.palavraImpacto || ""}
                    onChange={(e) =>
                      alterarSlide(i, "palavraImpacto", e.target.value.toUpperCase())
                    }
                  />

                  {temUploadCapa ? (
                    <p className="hint">
                      A capa é a <strong>foto que você subiu</strong>. Pra usar uma ilustração
                      da IA, volte e escolha “Gerar com IA”.
                    </p>
                  ) : (
                    <>
                      <label className={s.checkLinha}>
                        <input
                          type="checkbox"
                          checked={capaIA}
                          onChange={(e) => setCapaIA(e.target.checked)}
                        />
                        Gerar capa com IA?
                      </label>
                      <p className="hint">
                        {capaEstilo === "foto" ? (
                          <>
                            A capa (card 1) é uma <strong>foto gerada pela IA</strong> a
                            partir da cena abaixo ({CUSTOS.capaIA} créd. ao gerar).
                          </>
                        ) : (
                          <>
                            A capa (card 1) é uma{" "}
                            <strong>ilustração desenhada pela IA</strong> na sua paleta (
                            {CUSTOS.capaIA} créd. ao gerar).
                          </>
                        )}
                      </p>

                      {capaIA && (
                        <details className={s.detalhes}>
                          <summary className={s.detalhesResumo}>
                            {capaEstilo === "foto"
                              ? "Prompt da foto da capa (IA)"
                              : "Prompt da ilustração da capa (IA)"}
                          </summary>
                          <textarea
                            className="field"
                            style={{ marginTop: 10 }}
                            rows={3}
                            value={slide.promptCapa || ""}
                            onChange={(e) => alterarSlide(i, "promptCapa", e.target.value)}
                            placeholder="Descreva a cena da capa"
                          />
                        </details>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}

      <div className="step-actions">
        <button type="button" className="btn" onClick={onVoltar} disabled={carregando}>
          Voltar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onGerar}
          disabled={!tamanho || carregando}
          title={!tamanho ? "Escolha o tamanho da arte" : undefined}
        >
          {carregando ? "Gerando…" : "Gerar imagens"}{" "}
          <span className={s.custo}>· {custo} créd. ›</span>
        </button>
      </div>

      {!tamanho && (
        <p className={`hint ${s.dica}`}>Escolha o tamanho da arte pra liberar a geração.</p>
      )}
    </>
  );
}
