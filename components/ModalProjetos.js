"use client";

import { useEffect, useState } from "react";
import CardCanvas from "./CardCanvas";
import { getProjetos, removerProjeto, salvarProjeto } from "@/lib/store";
import { carregarImagens, apagarImagens } from "@/lib/imagens";
import { getTemplate } from "@/lib/templates";
import s from "./projetos.module.css";

function quando(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function IconeLapis() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M13.6 2.9l3.5 3.5L6.6 16.9 2 18l1.1-4.6L13.6 2.9z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconeLixeira() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3 5h14M8 5V3h4v2M5 5l1 12h8l1-12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Um cartão da grade: prévia do card 1, nome editável e as três ações. */
function Cartao({ projeto, onAbrir, onRenomear, onApagar }) {
  const [imagens, setImagens] = useState(null);
  const [renomeando, setRenomeando] = useState(false);
  const [rascunho, setRascunho] = useState(projeto.titulo);
  const [confirmando, setConfirmando] = useState(false);

  const template = getTemplate(projeto.templateId);
  const capa = projeto.roteiro?.[0];

  useEffect(() => {
    let vivo = true;
    carregarImagens(projeto.id).then((imgs) => vivo && setImagens(imgs));
    return () => {
      vivo = false;
    };
  }, [projeto.id]);

  function confirmarNome() {
    const limpo = rascunho.trim();
    setRenomeando(false);
    if (limpo && limpo !== projeto.titulo) onRenomear(projeto, limpo);
    else setRascunho(projeto.titulo);
  }

  return (
    <article className={s.cartao}>
      <div className={s.previa}>
        {template && capa ? (
          <CardCanvas
            card={capa}
            template={template}
            paleta={projeto.paleta}
            fontes={projeto.fontes}
            tamanho={projeto.tamanho || "retrato"}
            indice={0}
            total={projeto.roteiro.length}
            imagem={imagens?.[0] || null}
            handle={projeto.handle}
            ehCapa
            escala={0.22}
          />
        ) : (
          <div className={s.previaVazia}>SEM PRÉVIA</div>
        )}
      </div>

      <div className={s.info}>
        {renomeando ? (
          <>
            <input
              className={s.campoNome}
              value={rascunho}
              autoFocus
              maxLength={80}
              onChange={(e) => setRascunho(e.target.value)}
              onBlur={confirmarNome}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmarNome();
                if (e.key === "Escape") {
                  setRascunho(projeto.titulo);
                  setRenomeando(false);
                }
              }}
              aria-label="Novo nome do projeto"
            />
            <p className={s.dicaRenomear}>ENTER SALVA · ESC CANCELA</p>
          </>
        ) : (
          <>
            <p className={s.nome}>{projeto.titulo}</p>
            <p className={s.meta}>
              {projeto.roteiro?.length || 0} cards · {quando(projeto.atualizadoEm)}
            </p>
          </>
        )}
      </div>

      {confirmando ? (
        <div className={s.confirmar}>
          <p className={s.confirmarTexto}>Apagar este projeto? Não dá pra desfazer.</p>
          <div className={s.confirmarBotoes}>
            <button
              type="button"
              className={s.confirmarSim}
              onClick={() => onApagar(projeto)}
            >
              Apagar
            </button>
            <button
              type="button"
              className={s.confirmarNao}
              onClick={() => setConfirmando(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className={s.acoes}>
          <button type="button" className={s.abrir} onClick={() => onAbrir(projeto)}>
            Abrir
          </button>
          <button
            type="button"
            className={s.icone}
            onClick={() => setRenomeando(true)}
            aria-label={`Renomear ${projeto.titulo}`}
            title="Renomear"
          >
            <IconeLapis />
          </button>
          <button
            type="button"
            className={`${s.icone} ${s.iconeApagar}`}
            onClick={() => setConfirmando(true)}
            aria-label={`Apagar ${projeto.titulo}`}
            title="Apagar"
          >
            <IconeLixeira />
          </button>
        </div>
      )}
    </article>
  );
}

export default function ModalProjetos({ onFechar, onAbrir }) {
  const [projetos, setProjetos] = useState(null);

  useEffect(() => {
    setProjetos(getProjetos());
    const aoTeclar = (e) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);

  function renomear(projeto, titulo) {
    salvarProjeto({ ...projeto, titulo });
    setProjetos(getProjetos());
  }

  async function apagar(projeto) {
    removerProjeto(projeto.id);
    await apagarImagens(projeto.id);
    setProjetos(getProjetos());
  }

  async function abrir(projeto) {
    // As imagens vêm do IndexedDB só agora, na hora de reabrir, pra não
    // carregar tudo de uma vez ao montar a grade.
    onAbrir({ ...projeto, imagens: await carregarImagens(projeto.id) });
  }

  return (
    <div
      className={s.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Meus projetos"
      onMouseDown={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div className={s.painel}>
        <button type="button" className={s.fechar} onClick={onFechar} aria-label="Fechar">
          ×
        </button>

        <h2 className={s.titulo}>Meus projetos</h2>
        <p className={s.subtitulo}>
          Abra um projeto pra baixar as imagens de novo, renomeie pra achar depois, ou
          apague o que não serve mais.
        </p>

        {projetos === null && <div className={s.vazio}>Carregando…</div>}

        {projetos?.length === 0 && (
          <div className={s.vazio}>
            <p className={s.vazioTitulo}>Nenhum carrossel por aqui ainda</p>
            <p>Assim que você gerar o primeiro, ele aparece nesta tela.</p>
          </div>
        )}

        {projetos?.length > 0 && (
          <div className={s.grade}>
            {projetos.map((projeto) => (
              <Cartao
                key={projeto.id}
                projeto={projeto}
                onAbrir={abrir}
                onRenomear={renomear}
                onApagar={apagar}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
