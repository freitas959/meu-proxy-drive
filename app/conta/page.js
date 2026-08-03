"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cabecalho, Rodape } from "@/components/Chrome";
import { getUsuarioAtual, sair } from "@/lib/conta";
import { EMPRESA } from "@/lib/legal";
import g from "../legal.module.css";
import s from "./conta.module.css";

export default function Conta() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [baixando, setBaixando] = useState(false);
  const [confirmacao, setConfirmacao] = useState("");
  const [abrirExclusao, setAbrirExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    getUsuarioAtual().then((u) => setEmail(u?.email || ""));
  }, []);

  async function exportar() {
    setErro("");
    setBaixando(true);
    try {
      // fetch em vez de <a download>: assim um 401 vira mensagem na tela em vez
      // de um arquivo JSON com o erro dentro.
      const resposta = await fetch("/api/conta/exportar");
      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => ({}));
        throw new Error(corpo.erro || "Não consegui montar sua exportação.");
      }
      const blob = await resposta.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carrosse-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setBaixando(false);
    }
  }

  async function excluir() {
    setErro("");
    setExcluindo(true);
    try {
      const resposta = await fetch("/api/conta/excluir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmacao }),
      });
      const corpo = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(corpo.erro || "Não consegui excluir sua conta.");

      // A conta não existe mais; a sessão no navegador precisa ir junto, senão
      // a próxima tela tenta usar um token de um usuário que sumiu.
      await sair();
      router.replace("/");
      router.refresh();
    } catch (falha) {
      setErro(falha.message);
      setExcluindo(false);
    }
  }

  return (
    <>
      <Cabecalho />
      <main className={g.doc}>
        <h1 className={g.titulo}>Minha conta</h1>
        <p className={g.data}>{email || "…"}</p>

        <h2>Seus dados</h2>
        <p>
          Baixe tudo o que guardamos sobre você em um arquivo JSON: cadastro, projetos e
          histórico de créditos. É o direito de acesso e portabilidade do art. 18 da LGPD.
        </p>
        <p className={s.nota}>
          As imagens dos cards ficam no seu próprio navegador e não entram no arquivo. Para
          guardá-las, abra o projeto e baixe as artes.
        </p>
        <button
          type="button"
          className="btn"
          onClick={exportar}
          disabled={baixando}
        >
          {baixando ? "Preparando…" : "Baixar meus dados"}
        </button>

        <h2>Encerrar a conta</h2>
        <p>
          Apaga sua conta, seus projetos e seu histórico de créditos.{" "}
          <strong>Não tem como desfazer</strong> — se quiser guardar alguma coisa, baixe
          seus dados antes.
        </p>

        {!abrirExclusao ? (
          <button
            type="button"
            className={`btn ${s.perigo}`}
            onClick={() => setAbrirExclusao(true)}
          >
            Quero excluir minha conta
          </button>
        ) : (
          <div className={`${g.destaque} ${s.caixaPerigo}`}>
            <p>
              Escreva <strong>EXCLUIR</strong> abaixo para confirmar.
            </p>
            <input
              className="field"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder="EXCLUIR"
              aria-label="Escreva EXCLUIR para confirmar"
              autoComplete="off"
            />
            <div className={s.botoes}>
              <button
                type="button"
                className={`btn ${s.perigo}`}
                onClick={excluir}
                disabled={excluindo || confirmacao.trim().toUpperCase() !== "EXCLUIR"}
              >
                {excluindo ? "Excluindo…" : "Excluir para sempre"}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setAbrirExclusao(false);
                  setConfirmacao("");
                  setErro("");
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {erro && <p className={s.erro}>{erro}</p>}

        <h2>Outros direitos</h2>
        <p>
          Correção, anonimização, bloqueio e revogação de consentimento: escreva para{" "}
          {EMPRESA.encarregado}. Respondemos em até 15 dias.
        </p>
        <p>
          Veja também os <Link href="/termos">Termos de Uso</Link> e a{" "}
          <Link href="/privacidade">Política de Privacidade</Link>.
        </p>
      </main>
      <Rodape />
    </>
  );
}
