"use client";

import { createBrowserClient } from "@supabase/ssr";

// Só a URL e a chave publicável entram aqui — as duas são feitas para o
// navegador. Quem protege os dados é o RLS, não o segredo da chave.
let cliente = null;

export function getSupabase() {
  if (cliente) return cliente;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) return null;

  cliente = createBrowserClient(url, chave);
  return cliente;
}

/** O app inteiro precisa saber se dá pra logar antes de mostrar tela de login. */
export function temSupabase() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Garante um token válido antes de gravar. O token de acesso vence em cerca de
 * uma hora, e telas como o estúdio ficam abertas muito mais que isso sem
 * navegar — o middleware, que renova a cada requisição de página, não ajuda ali.
 *
 * `getSession` renova sozinho quando o token está perto do fim; se nem assim
 * der, devolve false e quem chamou manda a pessoa entrar de novo.
 */
export async function garantirSessao() {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session) return false;

  // Margem de 60s: um token que vence no meio da requisição falha igual.
  const vencimento = (data.session.expires_at || 0) * 1000;
  if (vencimento - Date.now() > 60_000) return true;

  const { data: renovada } = await supabase.auth.refreshSession();
  return Boolean(renovada?.session);
}

/** Traduz o que o Supabase devolve quando o problema é a sessão, não o dado. */
export function ehErroDeSessao(mensagem = "") {
  return /exp.*claim|jwt|token|expired|invalid signature|not authenticated/i.test(
    String(mensagem)
  );
}

export const AVISO_SESSAO =
  "Sua sessão expirou. Recarregue a página e entre de novo — o que você digitou continua aqui até recarregar.";
