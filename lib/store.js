"use client";

// Créditos e projetos vivem no localStorage. Quando entrar autenticação de
// verdade, é este módulo que troca de backend — o resto da UI não muda.

const CHAVE_CREDITOS = "carrosseia:creditos";
const CHAVE_PROJETOS = "carrosseia:projetos";

export const CREDITOS_INICIAIS = 30;

export const CUSTOS = {
  roteiro: 3,
  importar: 1,
  capaIA: 10,
};

function ler(chave, padrao) {
  if (typeof window === "undefined") return padrao;
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto === null ? padrao : JSON.parse(bruto);
  } catch {
    return padrao;
  }
}

function gravar(chave, valor) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
    // Avisa os outros componentes da mesma aba; o evento nativo `storage` só
    // dispara em outras abas.
    window.dispatchEvent(new CustomEvent("carrosseia:store", { detail: { chave } }));
  } catch {
    // cota estourada ou modo privado: a sessão segue, só não persiste
  }
}

export function getCreditos() {
  return ler(CHAVE_CREDITOS, CREDITOS_INICIAIS);
}

export function setCreditos(valor) {
  gravar(CHAVE_CREDITOS, Math.max(0, valor));
}

/** Debita se houver saldo. Devolve false quando não dá — quem chama decide o aviso. */
export function debitar(quantia) {
  const atual = getCreditos();
  if (atual < quantia) return false;
  setCreditos(atual - quantia);
  return true;
}

export function estornar(quantia) {
  setCreditos(getCreditos() + quantia);
}

export function getProjetos() {
  const lista = ler(CHAVE_PROJETOS, []);
  return Array.isArray(lista) ? lista : [];
}

export function salvarProjeto(projeto) {
  const lista = getProjetos();
  const indice = lista.findIndex((p) => p.id === projeto.id);
  const registro = { ...projeto, atualizadoEm: Date.now() };
  if (indice >= 0) lista[indice] = registro;
  else lista.unshift(registro);
  gravar(CHAVE_PROJETOS, lista.slice(0, 40));
  return registro;
}

export function removerProjeto(id) {
  gravar(
    CHAVE_PROJETOS,
    getProjetos().filter((p) => p.id !== id)
  );
}

export function novoId() {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
