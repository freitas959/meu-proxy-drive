import Link from "next/link";
import { Cabecalho, Rodape } from "@/components/Chrome";
import p from "../paginas.module.css";

const PASSOS = [
  {
    titulo: "Escolha o template pelo nicho, não pela cor",
    texto:
      "Cada template já vem com paleta, tipografia e vocabulário de selos ajustados a um tipo de conteúdo. Depois dá pra mudar cor e fonte — mas começar pelo nicho certo poupa ajuste.",
  },
  {
    titulo: "Dê contexto, não só o assunto",
    texto:
      "“Beber água” rende um carrossel genérico. “Quanto de água beber por dia, por que 2 litros virou regra e o que muda em quem treina” rende um carrossel específico. Link de matéria e PDF entram como base factual.",
  },
  {
    titulo: "Ajuste o roteiro antes de gerar as imagens",
    texto:
      "Você edita título, texto e selo de cada card direto na tela. Marque termos com **asteriscos duplos** pra eles saírem na cor de destaque no card.",
  },
  {
    titulo: "Escolha o tamanho pensando no feed",
    texto:
      "4:5 ocupa mais tela e costuma segurar mais tempo de visualização. 1:1 é mais seguro quando o carrossel também vai virar post avulso.",
  },
  {
    titulo: "Baixe e publique",
    texto:
      "Os PNGs saem em 1080px. No celular, “Salvar nas fotos” manda tudo direto pra galeria; no computador, use o .zip.",
  },
];

export const metadata = {
  title: "Aprendizado · CarrosseIA",
  description: "Como tirar o melhor do gerador de carrosséis.",
};

export default function Aprendizado() {
  return (
    <>
      <Cabecalho paginaAtual="aprendizado" />

      <main className={`wrap ${p.pagina}`}>
        <span className="step-pill">Aprendizado</span>
        <h1 className="page-title">Como fazer um carrossel que segura</h1>
        <p className={p.lead}>
          O gerador faz o trabalho pesado, mas o resultado muda bastante conforme o que você
          entrega pra ele. Cinco coisas que fazem diferença:
        </p>

        <ol className={p.passos}>
          {PASSOS.map((passo) => (
            <li key={passo.titulo} className={`panel ${p.passoItem}`}>
              <h2 className={p.passoTitulo}>{passo.titulo}</h2>
              <p className={p.passoTexto}>{passo.texto}</p>
            </li>
          ))}
        </ol>

        <div style={{ marginTop: 30 }}>
          <Link href="/app" className="btn btn-primary">
            Criar meu carrossel
          </Link>
        </div>
      </main>

      <Rodape />
    </>
  );
}
