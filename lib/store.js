"use client";

// Os projetos moram no Supabase. Antes viviam no localStorage, e isso queria
// dizer que um carrossel criado no computador do trabalho não existia no de
// casa — e que limpar o navegador apagava tudo.
//
// As IMAGENS continuam no IndexedDB, em lib/imagens.js. Uma capa em foto passa
// de 1 MB, e subir isso a cada autosave seria caro e lento. A consequência
// honesta: ao abrir um projeto em outra máquina o roteiro vem inteiro, mas a
// capa gerada não — ela é local. Mover as imagens para o Storage é o próximo
// passo natural, e o bucket `carrosseia` já existe pra isso.

import { getSupabase, garantirSessao } from "./supabase/navegador";
import { carregarImagens, salvarImagens, apagarImagens } from "./imagens";

// ⚠️ NÃO RENOMEIE as chaves abaixo no rebrand. Elas não são texto de tela: são
// identificadores de armazenamento no navegador de cada usuário. Trocar
// "carrosseia" por "carrosse" aqui equivale a apagar os dados de todo mundo —
// o navegador passaria a ler um lugar vazio.
const CHAVE_PROJETOS = "carrosseia:projetos";
const CHAVE_MIGRADO = "carrosseia:projetos-migrados";

/** Colunas do banco -> objeto que o wizard usa. */
function daLinha(linha) {
  return {
    id: linha.id,
    titulo: linha.titulo,
    templateId: linha.template_id,
    paleta: linha.paleta,
    fontes: linha.fontes,
    tamanho: linha.tamanho,
    handle: linha.handle,
    perfil: linha.perfil,
    roteiro: linha.roteiro,
    legenda: linha.legenda,
    capaEstilo: linha.capa_estilo,
    atualizadoEm: linha.atualizado_em ? new Date(linha.atualizado_em).getTime() : 0,
  };
}

/** Objeto do wizard -> colunas do banco. `usuario_id` é exigido pelo RLS. */
function paraLinha(projeto, usuarioId) {
  return {
    id: projeto.id,
    usuario_id: usuarioId,
    titulo: projeto.titulo || "Carrossel sem título",
    template_id: projeto.templateId,
    paleta: projeto.paleta || {},
    fontes: projeto.fontes || {},
    tamanho: projeto.tamanho || "retrato",
    handle: projeto.handle || "",
    perfil: projeto.perfil || {},
    roteiro: projeto.roteiro || [],
    legenda: projeto.legenda || "",
    capa_estilo: projeto.capaEstilo || "foto",
  };
}

async function usuarioAtual() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
}

export async function listarProjetos() {
  const supabase = getSupabase();
  if (!supabase) return [];

  // O RLS já filtra pelo dono; o `order` é só pra lista sair do mais recente.
  const { data, error } = await supabase
    .from("projetos")
    .select("*")
    .order("atualizado_em", { ascending: false })
    .limit(60);

  if (error) throw error;
  return (data || []).map(daLinha);
}

export async function salvarProjeto(projeto) {
  if (!(await garantirSessao())) throw new Error("Sua sessão expirou. Entre de novo.");

  const supabase = getSupabase();
  const usuarioId = await usuarioAtual();
  if (!usuarioId) throw new Error("Sua sessão expirou. Entre de novo.");

  // upsert e não insert: o wizard salva o mesmo projeto várias vezes enquanto a
  // pessoa mexe na paleta e nas fontes.
  const { data, error } = await supabase
    .from("projetos")
    .upsert(paraLinha(projeto, usuarioId), { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return daLinha(data);
}

export async function removerProjeto(id) {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from("projetos").delete().eq("id", id);
  if (error) throw error;
}

/**
 * O id agora é a chave primária de uma tabela `uuid` — `p_lq3k_x9f2` não entra
 * mais. `randomUUID` exige contexto seguro; em http:// que não seja localhost
 * ele não existe, daí o plano B.
 */
export function novoId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/* ------------------------------------------------------- migração única ---- */

function lerLocais() {
  if (typeof window === "undefined") return [];
  try {
    const bruto = window.localStorage.getItem(CHAVE_PROJETOS);
    const lista = bruto === null ? [] : JSON.parse(bruto);
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

/**
 * Sobe para o banco os projetos que ficaram no navegador antes desta mudança.
 *
 * Roda uma vez por navegador e NÃO apaga o localStorage: se algo falhar no
 * meio, os dados originais continuam lá para uma segunda tentativa. A marca de
 * "já migrei" só é gravada quando tudo passou.
 *
 * Os ids mudam — os antigos não são uuid — então as imagens no IndexedDB são
 * rechaveadas junto, senão a capa já gerada ficaria órfã.
 */
export async function migrarDoNavegador() {
  if (typeof window === "undefined") return 0;
  if (window.localStorage.getItem(CHAVE_MIGRADO)) return 0;

  const antigos = lerLocais();
  if (!antigos.length) {
    window.localStorage.setItem(CHAVE_MIGRADO, "1");
    return 0;
  }

  let migrados = 0;
  for (const antigo of antigos) {
    // Sem roteiro não há o que restaurar; rascunho pela metade não vale a linha
    // no banco.
    if (!antigo?.roteiro?.length) continue;

    const idNovo = novoId();
    await salvarProjeto({ ...antigo, id: idNovo });

    const imagens = await carregarImagens(antigo.id);
    if (imagens && Object.keys(imagens).length) {
      await salvarImagens(idNovo, imagens);
      await apagarImagens(antigo.id);
    }
    migrados += 1;
  }

  window.localStorage.setItem(CHAVE_MIGRADO, "1");
  return migrados;
}
