"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCreditos } from "@/lib/store";
import s from "./chrome.module.css";

function Marca() {
  return (
    <svg
      className={s.brandMark}
      width="28"
      height="28"
      viewBox="0 0 28 28"
      aria-hidden="true"
    >
      <rect width="28" height="28" rx="7" fill="var(--orange)" />
      <rect x="7" y="6" width="9" height="16" rx="1.5" fill="#fff" />
      <rect x="17" y="8" width="4.5" height="12" rx="1.5" fill="#fff" opacity="0.55" />
      <path d="M9.5 6h4.5v7l-2.25-1.7L9.5 13V6z" fill="var(--orange)" />
    </svg>
  );
}

function IconeDiamante() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 1l7 7-7 7-7-7 7-7z" fill="currentColor" />
    </svg>
  );
}

function IconeChapeu() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2L1.5 5.5 8 9l6.5-3.5L8 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M4 7.2v3.3c0 .9 1.8 1.8 4 1.8s4-.9 4-1.8V7.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Cabeçalho global. O saldo de créditos se reinscreve no evento do store pra
 * refletir um débito feito em qualquer ponto do fluxo, sem prop drilling.
 */
export function Cabecalho({ paginaAtual, onProjetos }) {
  const [creditos, setCreditos] = useState(null);

  useEffect(() => {
    const atualizar = () => setCreditos(getCreditos());
    atualizar();
    window.addEventListener("carrosseia:store", atualizar);
    window.addEventListener("storage", atualizar);
    return () => {
      window.removeEventListener("carrosseia:store", atualizar);
      window.removeEventListener("storage", atualizar);
    };
  }, []);

  return (
    <header className={s.header}>
      <div className={s.headerInner}>
        <Link href="/app" className={s.brand}>
          <Marca />
          <span>
            <span className={s.brandStrong}>Carrosse</span>
            <span className={s.brandLight}>IA</span>
          </span>
        </Link>

        <nav className={s.nav}>
          <Link
            href="/aprendizado"
            className={s.navBtn}
            aria-current={paginaAtual === "aprendizado" ? "page" : undefined}
          >
            <IconeChapeu />
            Aprendizado
          </Link>
          {onProjetos ? (
            <button type="button" className={s.navBtn} onClick={onProjetos}>
              Meus projetos
            </button>
          ) : (
            <Link href="/app?projetos=1" className={s.navBtn}>
              Meus projetos
            </Link>
          )}
          <Link
            href="/planos"
            className={s.navBtn}
            aria-current={paginaAtual === "planos" ? "page" : undefined}
          >
            Ver Planos
          </Link>
          <Link
            href="/planos"
            className={`${s.credits} ${creditos !== null && creditos < 10 ? s.creditsLow : ""}`}
            title="Seu saldo de créditos"
          >
            <IconeDiamante />
            {creditos === null ? "—" : creditos} créditos
          </Link>
          <span className={s.avatar}>A ▾</span>
        </nav>

        <span className={s.madeWith}>feito com Claude</span>
      </div>
    </header>
  );
}

const PASSOS = ["Templates", "Tema", "Roteiro", "Imagens"];

/** Trilha 1→4. Passos já concluídos viram botão pra voltar. */
export function Trilha({ atual, onIr, maxAlcancado = 1 }) {
  return (
    <div className={s.stepper}>
      <div className={s.stepperInner}>
        {PASSOS.map((rotulo, i) => {
          const numero = i + 1;
          const ativo = numero === atual;
          const concluido = numero < atual;
          const clicavel = numero <= maxAlcancado && numero !== atual;
          const classe = [
            s.step,
            ativo ? s.stepActive : "",
            concluido ? s.stepDone : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div key={rotulo} style={{ display: "contents" }}>
              <button
                type="button"
                className={classe}
                disabled={!clicavel}
                onClick={() => clicavel && onIr?.(numero)}
                aria-current={ativo ? "step" : undefined}
              >
                <span className={s.stepBullet}>{numero}</span>
                {rotulo}
              </button>
              {i < PASSOS.length - 1 && (
                <span
                  className={`${s.stepLine} ${numero < atual ? s.stepLineDone : ""}`}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Rodape() {
  return (
    <>
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <Marca />
          <span>
            <span className={s.footerBrand}>Carrosseia</span> · carrosséis de Instagram
            com IA · seus projetos ficam salvos na sua conta.
          </span>
        </div>
      </footer>
      <a className={s.support} href="mailto:suporte@carrosseia.local">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M14 7.5c0 2.8-2.7 5-6 5-.7 0-1.4-.1-2-.3L2.5 13.5l.9-2.4C2.5 10.2 2 8.9 2 7.5c0-2.8 2.7-5 6-5s6 2.2 6 5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        Suporte
      </a>
    </>
  );
}
