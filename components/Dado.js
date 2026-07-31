import g from "@/app/legal.module.css";

/**
 * Mostra um campo do lib/legal.js e destaca em vermelho o que ainda está com
 * "[preencher]". Sem isso, um placeholder esquecido passa despercebido no meio
 * de um texto legal longo — e ir ao ar com "[preencher: CNPJ]" é pior do que
 * não ter a página.
 */
export default function Dado({ valor }) {
  const pendente = /^\[preencher/i.test(String(valor).trim());
  return pendente ? <span className={g.pendente}>{valor}</span> : <>{valor}</>;
}
