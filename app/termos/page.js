import Link from "next/link";
import { Cabecalho, Rodape } from "@/components/Chrome";
import Dado from "@/components/Dado";
import { EMPRESA, NOME_APP, ATUALIZADO_EM } from "@/lib/legal";
import g from "../legal.module.css";

export const metadata = {
  title: "Termos de Uso · CarrosseIA",
  description: "As regras de uso do CarrosseIA.",
};

export default function Termos() {
  return (
    <>
      <Cabecalho />
      <main className={g.doc}>
        <Link className={g.voltar} href="/">
          ← Voltar
        </Link>

        <h1 className={g.titulo}>Termos de Uso</h1>
        <p className={g.data}>Atualizados em {ATUALIZADO_EM}</p>

        <p>
          Ao criar uma conta no {NOME_APP} você concorda com estes termos. Se não concordar
          com algum ponto, não use o serviço.
        </p>
        <p>
          O serviço é oferecido por <Dado valor={EMPRESA.nome} />, inscrito sob{" "}
          <Dado valor={EMPRESA.documento} />.
        </p>

        <h2>1. O que o serviço faz</h2>
        <p>
          O {NOME_APP} gera carrosséis para Instagram: você escolhe um template, descreve o
          assunto, e a inteligência artificial escreve o roteiro e, se você pedir, cria a
          imagem de capa. As artes finais são geradas no seu navegador e você baixa os
          arquivos PNG.
        </p>

        <h2>2. Sua conta</h2>
        <ul>
          <li>Você precisa ter 18 anos ou mais.</li>
          <li>
            Os dados do cadastro precisam ser verdadeiros, e a senha é de sua
            responsabilidade. Se desconfiar de acesso indevido, troque a senha em{" "}
            <Link href="/esqueci-senha">Esqueci minha senha</Link>.
          </li>
          <li>Uma pessoa por conta. Não compartilhe seu acesso.</li>
        </ul>

        <h2>3. Créditos</h2>
        <ul>
          <li>Cada geração consome créditos, e o custo aparece antes de você confirmar.</li>
          <li>
            Contas novas recebem créditos de cortesia para experimentar. Eles não valem
            dinheiro e não são resgatáveis.
          </li>
          <li>
            Se uma geração falhar por culpa nossa ou do provedor de IA, o crédito volta
            automaticamente para o seu saldo.
          </li>
          <li>
            Há um limite de gerações por dia, por conta e no total do sistema, para conter
            abuso e manter o serviço disponível para todos.
          </li>
        </ul>

        <h2>4. De quem é o conteúdo</h2>
        <p>
          <strong>Seu.</strong> O texto que você escreve, o roteiro gerado a partir dele e
          as artes que você baixa são seus, inclusive para uso comercial. Não reivindicamos
          propriedade sobre nada disso e não usamos seu conteúdo para treinar modelos.
        </p>
        <p>
          Os templates, o código e a identidade visual do {NOME_APP} continuam nossos. Você
          pode usá-los para criar seus carrosséis; não pode revender o template em si nem
          copiar o serviço.
        </p>

        <h2>5. O que você não pode publicar</h2>
        <p>Você é responsável pelo que gera. É proibido usar o serviço para:</p>
        <ul>
          <li>Conteúdo ilegal, que incite violência, ódio ou discriminação.</li>
          <li>Desinformação apresentada como fato, sobretudo em saúde e finanças.</li>
          <li>
            Violar direito autoral, marca ou imagem de terceiros — inclusive enviando
            material de outra pessoa como base do carrossel.
          </li>
          <li>Conteúdo sexual, ou que envolva menores de idade de forma imprópria.</li>
          <li>
            Tentar burlar limites de crédito, automatizar acesso ou sobrecarregar o
            sistema.
          </li>
        </ul>
        <p>
          Podemos suspender ou encerrar contas que descumpram esta seção. Em caso grave, sem
          aviso prévio.
        </p>

        <h2>6. O que a IA faz e o que ela não garante</h2>
        <p>
          O roteiro é escrito por um modelo de linguagem e a capa por um modelo de imagem.
          Isso significa que:
        </p>
        <ul>
          <li>
            <strong>Confira os fatos antes de publicar.</strong> Modelos de linguagem erram
            dados, datas e números com aparência de segurança.
          </li>
          <li>
            Gerações iguais podem devolver resultados diferentes, e a qualidade varia.
          </li>
          <li>
            A imagem pode sair com defeito visual — mãos, texto ilegível, proporção
            estranha. Gerar de novo costuma resolver, e cada tentativa consome crédito.
          </li>
          <li>
            Você é quem publica. A responsabilidade pelo que vai ao ar no seu perfil é sua.
          </li>
        </ul>

        <h2>7. Disponibilidade</h2>
        <p>
          Não prometemos funcionamento ininterrupto. O serviço depende de provedores
          externos de IA, que podem ficar indisponíveis ou congestionados. Podemos fazer
          manutenção, mudar funcionalidades ou descontinuar o serviço — neste último caso,
          com aviso prévio de 30 dias por e-mail e tempo para você baixar seus projetos.
        </p>

        <h2>8. Limitação de responsabilidade</h2>
        <p>
          O serviço é fornecido no estado em que se encontra. Na medida permitida pela lei,
          nossa responsabilidade se limita ao valor que você pagou nos 12 meses anteriores
          ao fato. Nada aqui afasta direitos que o Código de Defesa do Consumidor garante a
          você.
        </p>

        <h2>9. Encerrar a conta</h2>
        <p>
          Você pode excluir sua conta a qualquer momento em{" "}
          <Link href="/conta">Minha conta</Link>, sem precisar pedir a ninguém. A exclusão
          apaga seus projetos e seu histórico, e não tem como desfazer — baixe o que quiser
          guardar antes.
        </p>

        <h2>10. Foro e contato</h2>
        <p>
          Estes termos seguem a lei brasileira. Dúvidas e reclamações:{" "}
          <Dado valor={EMPRESA.suporte} />. Sobre dados pessoais, veja a{" "}
          <Link href="/privacidade">Política de Privacidade</Link>.
        </p>
      </main>
      <Rodape />
    </>
  );
}
