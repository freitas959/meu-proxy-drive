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
