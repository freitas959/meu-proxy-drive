import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// O token de acesso do Supabase vence rápido. Sem alguém renovando, o usuário
// é deslogado no meio do trabalho. O middleware faz isso a cada requisição e
// devolve os cookies novos junto da resposta.
export async function middleware(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) return NextResponse.next();

  let resposta = NextResponse.next({ request: req });

  const supabase = createServerClient(url, chave, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (lista) => {
        for (const { name, value } of lista) req.cookies.set(name, value);
        resposta = NextResponse.next({ request: req });
        for (const { name, value, options } of lista) {
          resposta.cookies.set(name, value, options);
        }
      },
    },
  });

  // Não remova: é esta chamada que dispara a renovação.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const caminho = req.nextUrl.pathname;

  // O wizard sem sessão só levaria a um 401 na primeira geração. Melhor pedir
  // o login antes de a pessoa escrever o tema inteiro.
  if (!user && caminho.startsWith("/app")) {
    const destino = req.nextUrl.clone();
    destino.pathname = "/entrar";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  // Quem já está logado não tem o que fazer na tela de login.
  if (user && caminho === "/entrar") {
    const destino = req.nextUrl.clone();
    destino.pathname = "/app";
    return NextResponse.redirect(destino);
  }

  return resposta;
}

export const config = {
  matcher: [
    // Tudo, menos estáticos e imagens — eles não têm sessão para renovar.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
