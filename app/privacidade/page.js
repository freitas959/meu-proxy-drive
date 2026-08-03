import Link from "next/link";
import { Cabecalho, Rodape } from "@/components/Chrome";
import Dado from "@/components/Dado";
import { EMPRESA, NOME_APP, ATUALIZADO_EM, SUBPROCESSADORES } from "@/lib/legal";
import g from "../legal.module.css";

export const metadata = {
  title: "Política de Privacidade · Carrossê",
  description: "Como o Carrossê trata seus dados pessoais, conforme a LGPD.",
};

export default function Privacidade() {
  return (
    <>
      <Cabecalho />
      <main className={g.doc}>
        <Link className={g.voltar} href="/">
          ← Voltar
        </Link>

        <h1 className={g.titulo}>Política de Privacidade</h1>
        <p className={g.data}>Atualizada em {ATUALIZADO_EM}</p>

        <p>
          Esta política explica quais dados o {NOME_APP} coleta, por que coleta, com quem
          compartilha e o que você pode exigir a respeito. Ela segue a Lei Geral de Proteção
          de Dados (Lei 13.709/2018).
        </p>

        <h2>1. Quem é o controlador</h2>
        <p>
          O controlador dos seus dados é <Dado valor={EMPRESA.nome} />, inscrito sob{" "}
          <Dado valor={EMPRESA.documento} />, com endereço em <Dado valor={EMPRESA.endereco} />.
        </p>
        <p>
          Para qualquer assunto sobre dados pessoais, o contato do encarregado é{" "}
          <Dado valor={EMPRESA.encarregado} />.
        </p>

        <h2>2. Que dados coletamos</h2>

        <h3>Dados que você fornece</h3>
        <ul>
          <li>
            <strong>E-mail e senha</strong>, para criar e acessar sua conta. A senha é
            guardada com hash pelo Supabase — nem nós conseguimos lê-la.
          </li>
          <li>
            <strong>Conteúdo dos carrosséis</strong>: o tema que você escreve, os links e
            arquivos que envia, o roteiro gerado, as cores, as fontes e o nome e a foto de
            perfil que você define para assinar os cards.
          </li>
        </ul>

        <h3>Dados gerados pelo uso</h3>
        <ul>
          <li>
            <strong>Histórico de créditos</strong>: cada geração e cada estorno viram um
            registro com data, valor e motivo. É o que permite auditar cobrança e aplicar
            limites diários.
          </li>
          <li>
            <strong>Registros técnicos</strong> do servidor, como data e hora de acesso e
            mensagens de erro, mantidos para segurança e diagnóstico.
          </li>
        </ul>

        <h3>O que NÃO coletamos</h3>
        <ul>
          <li>Não usamos cookies de publicidade nem rastreadores de terceiros.</li>
          <li>Não vendemos, alugamos nem cedemos seus dados para ninguém.</li>
          <li>
            Não usamos o conteúdo dos seus carrosséis para treinar modelos de inteligência
            artificial.
          </li>
        </ul>
        <p>
          Os únicos cookies que usamos são os da sua sessão de login. Sem eles não há como
          manter você conectado, então não existe opção de recusá-los e continuar usando a
          conta.
        </p>

        <h2>3. Por que tratamos cada dado</h2>
        <div className={g.rolagem}>
          <table className={g.tabela}>
            <thead>
              <tr>
                <th>Dado</th>
                <th>Finalidade</th>
                <th>Base legal (art. 7º)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>E-mail e senha</td>
                <td>Criar a conta e autenticar você</td>
                <td>Execução de contrato (inciso V)</td>
              </tr>
              <tr>
                <td>Conteúdo dos carrosséis</td>
                <td>Gerar e guardar seus projetos</td>
                <td>Execução de contrato (inciso V)</td>
              </tr>
              <tr>
                <td>Histórico de créditos</td>
                <td>Controlar saldo, limites e cobrança</td>
                <td>Execução de contrato (inciso V)</td>
              </tr>
              <tr>
                <td>Registros técnicos</td>
                <td>Segurança, prevenção a fraude e diagnóstico</td>
                <td>Legítimo interesse (inciso IX)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>4. Com quem compartilhamos</h2>
        <p>
          Para o app funcionar, alguns dados passam por serviços de terceiros. Eles tratam
          esses dados apenas para nos prestar o serviço:
        </p>
        <div className={g.rolagem}>
          <table className={g.tabela}>
            <thead>
              <tr>
                <th>Serviço</th>
                <th>Para quê</th>
                <th>O que recebe</th>
                <th>Onde fica</th>
              </tr>
            </thead>
            <tbody>
              {SUBPROCESSADORES.map((s) => (
                <tr key={s.nome}>
                  <td>{s.nome}</td>
                  <td>{s.papel}</td>
                  <td>{s.dados}</td>
                  <td>{s.onde}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Como esses serviços ficam nos Estados Unidos, há transferência internacional de
          dados, permitida pelo art. 33 da LGPD quando necessária para executar o contrato
          com você. Na prática: sem enviar seu tema para a IA, não há carrossel para gerar.
        </p>

        <h2>5. Por quanto tempo guardamos</h2>
        <ul>
          <li>
            <strong>Conta e projetos</strong>: enquanto sua conta existir. Ao excluí-la,
            apagamos tudo imediatamente.
          </li>
          <li>
            <strong>Histórico de créditos</strong>: apagado junto com a conta. Se houver
            cobrança envolvida, podemos manter o registro fiscal mínimo exigido por lei,
            sem o conteúdo dos seus carrosséis.
          </li>
          <li>
            <strong>Registros técnicos</strong>: até 6 meses.
          </li>
        </ul>

        <h2>6. Seus direitos</h2>
        <p>
          O art. 18 da LGPD te dá o direito de confirmar o tratamento, acessar, corrigir,
          anonimizar, bloquear, eliminar, portar seus dados e revogar o consentimento.
        </p>

        <div className={g.destaque}>
          <p>
            <strong>Dois deles você exerce sozinho, sem pedir nada a ninguém.</strong> Em{" "}
            <Link href="/conta">Minha conta</Link> você baixa todos os seus dados em um
            arquivo JSON e exclui sua conta com tudo o que há nela.
          </p>
          <p>
            Para os demais, escreva para <Dado valor={EMPRESA.encarregado} />. Respondemos
            em até 15 dias.
          </p>
        </div>

        <h2>7. Segurança</h2>
        <ul>
          <li>Todo o tráfego é criptografado por HTTPS.</li>
          <li>As senhas ficam guardadas com hash, nunca em texto puro.</li>
          <li>
            O banco usa isolamento por linha (RLS): a regra que separa os dados de cada
            usuário roda dentro do próprio banco, não na aplicação.
          </li>
        </ul>
        <p>
          Nenhum sistema é imune. Se houver incidente de segurança com risco relevante a
          você, comunicaremos você e a ANPD, como manda o art. 48.
        </p>

        <h2>8. Menores de idade</h2>
        <p>
          O {NOME_APP} não é destinado a menores de 18 anos. Se soubermos que criamos conta
          para alguém nessa faixa sem autorização dos responsáveis, ela será excluída.
        </p>

        <h2>9. Mudanças nesta política</h2>
        <p>
          Se mudarmos algo relevante, avisaremos por e-mail antes de a mudança valer. A data
          no topo sempre indica a versão vigente.
        </p>
      </main>
      <Rodape />
    </>
  );
}
