import Link from "next/link";
import { Cabecalho, Rodape } from "@/components/Chrome";
import { TEMPLATES } from "@/lib/templates";
import p from "./paginas.module.css";

const RECURSOS = [
  {
    titulo: `${TEMPLATES.length} templates por nicho`,
    texto:
      "Advocacia, fitness, estética, contabilidade, pets… cada um com paleta, tipografia e tom próprios.",
  },
  {
    titulo: "A IA escreve o roteiro",
    texto:
      "Você dá o tema, cola um link de matéria ou anexa um PDF. Ela devolve hook, desenvolvimento e CTA, card a card.",
  },
  {
    titulo: "Capa desenhada na hora",
    texto:
      "A ilustração da capa é gerada pelo Claude na sua paleta, direto em vetor — sem banco de imagem genérico.",
  },
  {
    titulo: "PNG nítido, pronto pro feed",
    texto:
      "Cards em 1080px, quadrado ou 4:5. Baixe um a um, tudo em .zip, ou mande direto pras fotos do celular.",
  },
];

export default function Landing() {
  return (
    <>
      <Cabecalho />

      <main className="wrap">
        <section className={p.hero}>
          <span className="step-pill">carrosséis de Instagram com IA</span>
          <h1 className={p.heroTitulo}>
            Do tema ao carrossel pronto em menos de 2 minutos.
          </h1>
          <p className={p.heroSub}>
            Escolha um template, descreva o assunto e a IA escreve o texto e desenha os cards.
            Você só ajusta o que quiser e baixa.
          </p>
          <div className={p.heroAcoes}>
            <Link href="/app" className={`btn btn-primary ${p.heroCta}`}>
              Criar meu carrossel
            </Link>
            <Link href="/aprendizado" className={`btn ${p.heroCta}`}>
              Como funciona
            </Link>
          </div>
        </section>

        <section className={p.recursos}>
          {RECURSOS.map((recurso) => (
            <article key={recurso.titulo} className={`panel ${p.cartao}`}>
              <h2 className={p.cartaoTitulo}>{recurso.titulo}</h2>
              <p className="hint">{recurso.texto}</p>
            </article>
          ))}
        </section>
      </main>

      <Rodape />
    </>
  );
}
