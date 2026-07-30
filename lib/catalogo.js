"use client";

import { TEMPLATES } from "@/lib/templates";
import { daLinha } from "@/lib/templatesBanco";
import { getSupabase } from "@/lib/supabase/navegador";

// Catálogo visto pelo navegador: os templates do código mais os do estúdio.
// A busca fica em cache num promise de módulo — várias telas pedem a mesma
// lista e não faz sentido ir ao banco em cada uma.

let cache = null;

async function buscar() {
  const supabase = getSupabase();
  if (!supabase) return TEMPLATES;

  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("arquivado", false)
    .order("criado_em", { ascending: false });

  // Sem sessão, ou banco fora do ar: o catálogo do código sozinho já entrega
  // um app utilizável. Melhor isso do que uma tela de templates vazia.
  if (error || !data) return TEMPLATES;

  // Um template do banco com o mesmo id de um do código SUBSTITUI o do código.
  // É isso que permite editar os 19 originais sem tocar no repositório — e
  // arquivar a versão do banco devolve a original, porque ela some daqui.
  const doBanco = data.map(daLinha);
  const ids = new Set(doBanco.map((t) => t.id));
  return [...doBanco, ...TEMPLATES.filter((t) => !ids.has(t.id))];
}

export function carregarCatalogo() {
  if (!cache) cache = buscar();
  return cache;
}

/** Chame depois de salvar no estúdio, senão a lista fica velha. */
export function invalidarCatalogo() {
  cache = null;
}

export async function acharTemplate(id) {
  const lista = await carregarCatalogo();
  return lista.find((t) => t.id === id) || null;
}

export function filtrar(lista, termo) {
  const q = termo.trim().toLowerCase();
  if (!q) return lista;
  return lista.filter((t) =>
    [t.nome, t.nicho?.label, t.descricao, ...(t.selos || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}
