"use client";

import { useEffect, useState } from "react";
import { Cabecalho, Rodape } from "@/components/Chrome";
import { CUSTOS, getCreditos, setCreditos } from "@/lib/store";
import p from "../paginas.module.css";

const PLANOS = [
  {
    nome: "Teste",
    preco: "Grátis",
    periodo: "",
    creditos: 30,
    destaque: false,
    itens: ["30 créditos ao criar a conta", "Todos os templates", "Download em PNG e .zip"],
  },
  {
    nome: "Criador",
    preco: "R$ 39",
    periodo: "/mês",
    creditos: 400,
    destaque: true,
    itens: [
      "400 créditos por mês",
      "Capa ilustrada pela IA",
      "Sua fonte e sua paleta",
      "Leitura de link e PDF",
    ],
  },
  {
    nome: "Agência",
    preco: "R$ 129",
    periodo: "/mês",
    creditos: 1600,
    destaque: false,
    itens: [
      "1.600 créditos por mês",
      "Tudo do Criador",
      "Projetos ilimitados salvos",
      "Suporte prioritário",
    ],
  },
];

export default function Planos() {
  const [saldo, setSaldo] = useState(null);

  useEffect(() => {
    const atualizar = () => setSaldo(getCreditos());
    atualizar();
    window.addEventListener("carrosseia:store", atualizar);
    return () => window.removeEventListener("carrosseia:store", atualizar);
  }, []);

  return (
    <>
      <Cabecalho paginaAtual="planos" />

      <main className={`wrap ${p.pagina}`}>
        <span className="step-pill">Planos e créditos</span>
        <h1 className="page-title">Quanto custa cada coisa</h1>
        <p className={p.lead}>
          Você gasta crédito só quando a IA trabalha. Editar texto, trocar cor, mudar fonte e
          baixar as imagens não custam nada.
        </p>

        <div className={p.tabelaRolagem}>
          <table className={p.tabela}>
            <thead>
              <tr>
                <th>Ação</th>
                <th>Custo</th>
                <th>O que acontece</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Gerar roteiro</td>
                <td>{CUSTOS.roteiro} créditos</td>
                <td>A IA escreve todos os cards a partir do tema, link ou PDF.</td>
              </tr>
              <tr>
                <td>Importar meu texto</td>
                <td>{CUSTOS.importar} crédito</td>
                <td>A IA só distribui e formata o texto que você já escreveu.</td>
              </tr>
              <tr>
                <td>Capa ilustrada</td>
                <td>{CUSTOS.capaIA} créditos</td>
                <td>A IA desenha a ilustração da capa em vetor, na sua paleta.</td>
              </tr>
              <tr>
                <td>Baixar PNG / .zip</td>
                <td>grátis</td>
                <td>Os cards são desenhados no seu navegador, sem consumir crédito.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={p.planos}>
          {PLANOS.map((plano) => (
            <article
              key={plano.nome}
              className={`panel ${p.plano} ${plano.destaque ? p.planoDestaque : ""}`}
            >
              <span className={p.planoNome}>{plano.nome}</span>
              <span className={p.planoPreco}>
                {plano.preco}
                <span>{plano.periodo}</span>
              </span>
              <ul className={p.planoLista}>
                {plano.itens.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <button
                type="button"
                className={`btn ${plano.destaque ? "btn-primary" : ""}`}
                style={{ marginTop: "auto" }}
                onClick={() => setCreditos(plano.creditos)}
              >
                Carregar {plano.creditos} créditos
              </button>
            </article>
          ))}
        </div>

        <p className="hint" style={{ marginTop: 22 }}>
          Ainda não há cobrança ligada: os botões acima apenas ajustam o saldo local pra você
          testar o fluxo. Seu saldo agora é de{" "}
          <strong>{saldo === null ? "—" : saldo} créditos</strong>.
        </p>
      </main>

      <Rodape />
    </>
  );
}
