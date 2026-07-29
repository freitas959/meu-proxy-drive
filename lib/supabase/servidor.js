import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function supabaseConfigurado() {
  return Boolean(URL && ANON);
}

/**
 * Cliente amarrado à sessão de quem fez a requisição: dentro do banco,
 * `auth.uid()` devolve esse usuário e o RLS se aplica normalmente.
 */
export async function getSupabaseServidor() {
  if (!URL || !ANON) return null;
  const jar = await cookies();

  return createServerClient(URL, ANON, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (lista) => {
        try {
          for (const { name, value, options } of lista) jar.set(name, value, options);
        } catch {
          // Em Server Component a escrita é bloqueada; o middleware renova.
        }
      },
    },
  });
}

/**
 * Cliente com a service role. Ele passa por cima de todo o RLS, então só
 * existe para o que o usuário não pode fazer por conta própria — hoje, o
 * estorno de crédito. Nunca deve receber um id vindo do corpo da requisição:
 * o id sai sempre da sessão validada.
 */
export function getSupabaseAdmin() {
  if (!URL || !SERVICE) return null;
  return createClient(URL, SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Devolve o usuário autenticado ou null. Valida o token no servidor do Auth. */
export async function getUsuario() {
  const supabase = await getSupabaseServidor();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user || null;
}
