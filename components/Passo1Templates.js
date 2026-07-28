"use client";

import { useEffect, useMemo, useState } from "react";
import { TEMPLATES, buscarTemplates, FUNDOS } from "@/lib/templates";
import CardCanvas from "./CardCanvas";
import s from "@/app/app/wizard.module.css";

/** Três cards de amostra pro carrossel do modal — hook, conteúdo e CTA. */
function slidesDemo(template) {
  return [
    {
      titulo: template.exemplo.titulo,
      texto: template.exemplo.texto,
      selo: template.selos[0],
      botao: template.layout === "tweet" ? "" : "ARRASTA PRA O LADO",
    },
    {
      titulo: "O ponto que quase ninguém percebe",
      texto:
        "Aqui entra o **argumento central** do seu conteúdo, escrito pela IA no tom do template.",
      selo: template.selos[1] || "DADO",
    },
    {
      titulo: "O que fazer com isso hoje",
      texto: "Fecha com uma **ação pequena** que o seguidor consegue executar agora.",
      selo: template.selos[template.selos.length - 1],
      botao: "SALVAR ESTE POST",
    },
  ];
}

function ModalTemplate({ template, onFechar, onUsar }) {
  const [indice, setIndice] = useState(0);
  const [fundo, setFundo] = useState(null);

  const slides = useMemo(() => slidesDemo(template), [template]);

  // Templates de fundo claro já nascem com a escolha feita: oferecer "fundo
  // preto" num layout de print de rede social não faz sentido.
  const permiteFundo = template.layout !== "tweet";
  const paleta = useMemo(() => {
    if (!permiteFundo) return template.paleta;
    const escolhido = FUNDOS.find((f) => f.id === fundo);
    if (!escolhido) return template.paleta;
    return { ...template.paleta, fundo: escolhido.paleta.fundo, texto: escolhido.paleta.texto, secundaria: escolhido.paleta.secundaria };
  }, [template, fundo, permiteFundo]);

  useEffect(() => {
    const aoTeclar = (e) => {
      if (e.key === "Escape") onFechar();
      if (e.key === "ArrowRight") setIndice((i) => Math.min(i + 1, slides.length - 1));
      if (e.key === "ArrowLeft") setIndice((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onFechar, slides.length]);

  const rotuloEtapa = ["Intro Slide", "Conteúdo", "Fechamento"][indice] || "Slide";
  const liberado = !permiteFundo || Boolean(fundo);

  return (
    <div
      className={s.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`Prévia do template ${template.nome}`}
      onMouseDown={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div className={s.modal}>
        <button type="button" className={s.modalFechar} onClick={onFechar} aria-label="Fechar">
          ×
        </button>

        <span className={s.modalPill}>{rotuloEtapa}</span>

        <div className={s.modalPalco}>
          <button
            type="button"
            className={`${s.modalSeta} ${s.modalSetaEsq}`}
            onClick={() => setIndice((i) => Math.max(i - 1, 0))}
            disabled={indice === 0}
            aria-label="Slide anterior"
          >
            ‹
          </button>

          <CardCanvas
            className={s.modalSlide}
            card={slides[indice]}
            template={template}
            paleta={paleta}
            fontes={template.fontes}
            indice={indice}
            total={slides.length}
            ehCapa={indice === 0}
            escala={0.32}
          />

          <button
            type="button"
            className={`${s.modalSeta} ${s.modalSetaDir}`}
            onClick={() => setIndice((i) => Math.min(i + 1, slides.length - 1))}
            disabled={indice === slides.length - 1}
            aria-label="Próximo slide"
          >
            ›
          </button>
        </div>

        <div className={s.modalMiniaturas}>
          {slides.map((slide, i) => (
            <button
              key={i}
              type="button"
              className={`${s.miniatura} ${i === indice ? s.miniaturaAtiva : ""}`}
              onClick={() => setIndice(i)}
              aria-label={`Ver slide ${i + 1}`}
            >
              <CardCanvas
                card={slide}
                template={template}
                paleta={paleta}
                fontes={template.fontes}
                indice={i}
                total={slides.length}
                ehCapa={i === 0}
                escala={0.07}
              />
            </button>
          ))}
        </div>

        {permiteFundo && (
          <>
            <p className={s.modalLegenda}>
              Fundo dos cards <span>(escolha um pra continuar)</span>
            </p>
            <div className={s.modalFundos}>
              {FUNDOS.map((opcao) => (
                <button
                  key={opcao.id}
                  type="button"
                  className={`${s.fundoBtn} ${fundo === opcao.id ? s.fundoBtnAtivo : ""}`}
                  onClick={() => setFundo(opcao.id)}
                  aria-pressed={fundo === opcao.id}
                >
                  {opcao.nome}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          type="button"
          className={`btn btn-dashed ${s.modalUsar}`}
          disabled={!liberado}
          onClick={() => onUsar(template, paleta)}
        >
          {liberado ? "Usar esse template" : "Escolha o fundo dos cards"}
        </button>
      </div>
    </div>
  );
}

export default function Passo1Templates({ onEscolher }) {
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(null);

  const lista = useMemo(() => buscarTemplates(busca), [busca]);

  return (
    <>
      <span className="step-pill">Passo 1 de 4</span>
      <h1 className="page-title">Escolha um template</h1>
      <p className="page-sub">
        É o visual do seu carrossel. A IA escreve o conteúdo em cima do template que você
        escolher. Alguns têm capa gerada por IA (custam mais créditos).
      </p>

      <div className={s.busca}>
        <svg
          className={s.buscaIcone}
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          className={s.buscaCampo}
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar template (ex.: advogado, treino...)"
          aria-label="Buscar template"
        />
      </div>

      <div className={s.grade}>
        {lista.map((template) => (
          <button
            key={template.id}
            type="button"
            className={s.cardTemplate}
            onClick={() => setAberto(template)}
          >
            <span className={s.cardPreview}>
              {template.nicho && (
                <span
                  className={s.cardNicho}
                  style={{ background: template.nicho.cor }}
                >
                  {template.nicho.label}
                </span>
              )}
              <CardCanvas
                card={{
                  titulo: template.exemplo.titulo,
                  texto: template.exemplo.texto,
                  selo: "",
                  botao: template.layout === "tweet" ? "" : "ARRASTA PRA O LADO",
                }}
                template={template}
                paleta={template.paleta}
                fontes={template.fontes}
                indice={0}
                total={template.layout === "tweet" ? 8 : 6}
                ehCapa
                escala={0.24}
              />
            </span>
            <span className={s.cardNome}>{template.nome}</span>
          </button>
        ))}

        {!lista.length && (
          <p className={s.vazio}>
            Nenhum template pra “{busca}”. Tente o nome do nicho, tipo “dentista” ou
            “viagem”.
          </p>
        )}
      </div>

      {aberto && (
        <ModalTemplate
          template={aberto}
          onFechar={() => setAberto(null)}
          onUsar={(template, paleta) => {
            setAberto(null);
            onEscolher(template, paleta);
          }}
        />
      )}
    </>
  );
}

export { TEMPLATES };
