"use client";

import { getSupabase } from "@/lib/supabase/navegador";

// O saldo agora mora no banco. Este módulo é a única porta de leitura no
// cliente — e leitura é tudo que ele pode fazer: `perfis` só concede select.

// ⚠️ NÃO RENOMEIE no rebrand: é só o nome de um evento interno. Renomear não
// quebra dados, mas quebra a comunicação entre cabeçalho e rotas se alguém
// trocar num arquivo e esquecer no outro.
const EVENTO = "carrosseia:saldo";

/** Avisa o cabeçalho (e quem mais estiver ouvindo) que o saldo mudou. */
export function anunciarSaldo(saldo) {
  if (typeof window === "undefined" || typeof saldo !== "number") return;
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: { saldo } }));
}

export function ouvirSaldo(callback) {
  if (typeof window === "undefined") return () => {};
  const handler = (evento) => callback(evento.detail.saldo);
  window.addEventListener(EVENTO, handler);
  return () => window.removeEventListener(EVENTO, handler);
}

/**
 * Lê o saldo do banco. Devolve `{ creditos, ilimitado }`, ou null quando não
 * há sessão nem banco. Conta ilimitada tem um número em `creditos` também,
 * mas ele não anda — quem lê isso deve olhar o `ilimitado` primeiro.
 */
export async function buscarSaldo() {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: sessao } = await supabase.auth.getUser();
  if (!sessao?.user) return null;

  const { data, error } = await supabase
    .from("perfis")
    .select("creditos, ilimitado, admin")
    .eq("id", sessao.user.id)
    .single();

  if (error) return null;
  return {
    creditos: data?.creditos ?? 0,
    ilimitado: Boolean(data?.ilimitado),
    admin: Boolean(data?.admin),
  };
}

export async function getUsuarioAtual() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export async function sair() {
  const supabase = getSupabase();
  if (supabase) await supabase.auth.signOut();
}
