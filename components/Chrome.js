"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EMPRESA } from "@/lib/legal";
import { useRouter } from "next/navigation";
import { buscarSaldo, getUsuarioAtual, ouvirSaldo, sair } from "@/lib/conta";
import { temSupabase } from "@/lib/supabase/navegador";
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
      <rect
        x="17"
        y="8"
        width="4.5"
        height="12"
        rx="1.5"
        fill="#fff"
        opacity="0.55"
      />
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
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
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

function IconeRegua() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="1.6"
        y="5"
        width="12.8"
        height="6"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4.6 5v2M7 5v3M9.4 5v2M11.8 5v3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconeMenu() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 5.5h14M3 10h14M3 14.5h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Elementos que recebem foco por Tab, na ordem em que aparecem. */
const FOCAVEIS =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Gaveta de navegação para telas estreitas.
 *
 * Prende o foco dentro do painel enquanto está aberta e devolve para o botão
 * que a abriu ao fechar. Sem isso, quem navega por teclado sai da gaveta e
 * continua tabulando pela página atrás dela, sem perceber.
 */
function Gaveta({ aberta, onFechar, children }) {
  const painel = useRef(null);
  const anterior = useRef(null);

  useEffect(() => {
    if (!aberta) return;

    anterior.current = document.activeElement;
    // Trava a rolagem de fundo: rolar a página atrás da gaveta desorienta.
    const rolagem = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const alvos = () => [...(painel.current?.querySelectorAll(FOCAVEIS) || [])];
    alvos()[0]?.focus();

    function aoTeclar(e) {
      if (e.key === "Escape") {
        onFechar();
        return;
      }
      if (e.key !== "Tab") return;
      const lista = alvos();
      if (!lista.length) return;
      const primeiro = lista[0];
      const ultimo = lista[lista.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = rolagem;
      anterior.current?.focus?.();
    };
  }, [aberta, onFechar]);

  if (!aberta) return null;

  return (
    <div
      className={s.gavetaFundo}
      onMouseDown={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div
        className={s.gaveta}
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-label="Navegação"
      >
        <button type="button" className={s.gavetaFechar} onClick={onFechar}>
          Fechar ×
        </button>
        <div className={s.gavetaItens}>{children}</div>
      </div>
    </div>
  );
}

/**
 * Cabeçalho global. O saldo vem do banco; as rotas devolvem o valor novo a
 * cada geração e anunciam pelo evento, então não há polling nem prop drilling.
 */
export function Cabecalho({ paginaAtual, onProjetos }) {
  const router = useRouter();
  const [creditos, setCreditos] = useState(null);
  const [ilimitado, setIlimitado] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);
  const fecharMenu = useCallback(() => setMenuAberto(false), []);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const [saldo, usuario] = await Promise.all([
        buscarSaldo(),
        getUsuarioAtual(),
      ]);
      if (!vivo) return;
      setCreditos(saldo?.creditos ?? null);
      setIlimitado(Boolean(saldo?.ilimitado));
      setAdmin(Boolean(saldo?.admin));
      setEmail(usuario?.email || "");
    })();
    return () => {
      vivo = false;
    };
  }, []);

  // As rotas devolvem o saldo depois de cada geração. Numa conta ilimitada ele
  // volta sempre igual, então não há o que atualizar.
  useEffect(
    () => ouvirSaldo((valor) => !ilimitado && setCreditos(valor)),
    [ilimitado],
  );

  async function encerrar() {
    await sair();
    router.replace("/entrar");
    router.refresh();
  }

  const inicial = (email[0] || "?").toUpperCase();

  // Os mesmos itens servem à barra do desktop e à gaveta do celular. Escritos
  // uma vez só: duplicar seria garantir que um dia os dois divergem.
  const itens = (
    <>
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
      {/* Só aparece pra admin. Esconder aqui é conveniência: quem barra
              de verdade é o RLS da tabela `templates`. */}
      {admin && (
        <Link
          href="/estudio"
          className={`${s.navBtn} ${s.navBtnDestaque}`}
          aria-current={paginaAtual === "estudio" ? "page" : undefined}
        >
          <IconeRegua />
          Estúdio
        </Link>
      )}
      <Link
        href="/planos"
        className={`${s.credits} ${
          !ilimitado && creditos !== null && creditos < 10 ? s.creditsLow : ""
        }`}
        title={ilimitado ? "Conta ilimitada" : "Seu saldo de créditos"}
      >
        <IconeDiamante />
        {ilimitado
          ? "ilimitado"
          : `${creditos === null ? "—" : creditos} créditos`}
      </Link>
      {email ? (
        <button
          type="button"
          className={s.avatar}
          onClick={encerrar}
          title={`${email} — clique para sair`}
        >
          {inicial} ↩
        </button>
      ) : (
        temSupabase() && (
          <Link href="/entrar" className={s.navBtn}>
            Entrar
          </Link>
        )
      )}
    </>
  );

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

        <nav className={s.nav}>{itens}</nav>

        <button
          type="button"
          className={s.menuBtn}
          onClick={() => setMenuAberto(true)}
          aria-expanded={menuAberto}
          aria-label="Abrir menu"
        >
          <IconeMenu />
        </button>

        <span className={s.madeWith}>feito com Claude</span>
      </div>

      <Gaveta aberta={menuAberto} onFechar={fecharMenu}>
        {itens}
      </Gaveta>
    </header>
  );
}

const PASSOS = ["Templates", "Tema", "Roteiro", "Imagens"];

/** Trilha 1→4. Passos já concluídos viram botão pra voltar. */
export function Trilha({ atual, onIr, maxAlcancado = 1 }) {
  return (
    <div className={s.stepper}>
      {/* Versão de tela estreita: as quatro etiquetas não cabem em 390px sem
          rolagem lateral, e rolagem horizontal escondida é rolagem que ninguém
          descobre. Some acima de 560px, onde a trilha inteira cabe. */}
      <div className={s.stepperCompacto}>
        <p className={s.stepperCompactoTexto}>
          Passo {atual} de {PASSOS.length} · <strong>{PASSOS[atual - 1]}</strong>
        </p>
        <div
          className={s.stepperBarra}
          role="progressbar"
          aria-valuenow={atual}
          aria-valuemin={1}
          aria-valuemax={PASSOS.length}
          aria-label={`Passo ${atual} de ${PASSOS.length}: ${PASSOS[atual - 1]}`}
        >
          <span style={{ width: `${(atual / PASSOS.length) * 100}%` }} />
        </div>
      </div>

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
            <span className={s.footerBrand}>Carrosseia</span> · carrosséis de
            Instagram com IA · seus projetos ficam salvos na sua conta.
          </span>
        </div>
        {/* Em todas as páginas de propósito: política escondida não cumpre o
            dever de transparência, e processador de pagamento exige as duas
            acessíveis do site inteiro. */}
        <nav className={s.footerLinks}>
          <Link href="/termos">Termos de Uso</Link>
          <Link href="/privacidade">Política de Privacidade</Link>
          <Link href="/conta">Minha conta</Link>
        </nav>
      </footer>
      {/* Endereço único, vindo do lib/legal.js: o mesmo que os Termos citam. */}
      <a className={s.support} href={`mailto:${EMPRESA.suporte}`}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
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
