"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cabecalho, Rodape } from "@/components/Chrome";
import { getProjetos, removerProjeto } from "@/lib/store";
import { getTemplate } from "@/lib/templates";
import p from "../paginas.module.css";

function quando(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Projetos() {
  const [projetos, setProjetos] = useState(null);

  // null enquanto não leu o localStorage: evita piscar o estado vazio antes da
  // hidratação e um mismatch com o HTML do servidor.
  useEffect(() => setProjetos(getProjetos()), []);

  function apagar(id) {
    removerProjeto(id);
    setProjetos(getProjetos());
  }

  return (
    <>
      <Cabecalho paginaAtual="projetos" />

      <main className={`wrap ${p.pagina}`}>
        <span className="step-pill">Meus projetos</span>
        <h1 className="page-title">Seus carrosséis</h1>
        <p className={p.lead}>
          O roteiro e os ajustes de cada carrossel ficam salvos neste navegador. As imagens
          não são guardadas — elas são redesenhadas na hora, sempre em resolução cheia.
        </p>

        {projetos === null && <p className={`panel ${p.vazio}`}>Carregando…</p>}

        {projetos?.length === 0 && (
          <div className={`panel ${p.vazio}`}>
            <p>Você ainda não gerou nenhum carrossel.</p>
            <Link href="/app" className="btn btn-primary" style={{ marginTop: 16 }}>
              Criar o primeiro
            </Link>
          </div>
        )}

        {projetos && projetos.length > 0 && (
          <div className={p.grade}>
            {projetos.map((projeto) => {
              const template = getTemplate(projeto.templateId);
              return (
                <article key={projeto.id} className={`panel ${p.cartao}`}>
                  <span className={p.cartaoMeta}>
                    {template?.nome || "Template removido"} · {projeto.roteiro?.length || 0}{" "}
                    cards · {quando(projeto.atualizadoEm)}
                  </span>
                  <h2 className={p.cartaoTitulo}>{projeto.titulo}</h2>
                  <div className={p.cartaoAcoes}>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => apagar(projeto.id)}
                    >
                      Apagar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Rodape />
    </>
  );
}
