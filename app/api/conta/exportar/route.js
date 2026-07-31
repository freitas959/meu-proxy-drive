import { exigirUsuario } from "@/lib/creditos";

// Portabilidade e acesso, art. 18 da LGPD. O usuário baixa tudo o que temos
// dele num arquivo só, sem precisar pedir a ninguém.

export async function GET() {
  const sessao = await exigirUsuario();
  if (!sessao.ok) return sessao.resposta;

  const { supabase, usuario } = sessao;

  // Cliente da sessão, não o admin: o RLS garante que só sai o que é do dono.
  // Usar service role aqui seria trocar uma proteção do banco por um `eq()` que
  // eu poderia esquecer.
  const [perfil, projetos, transacoes] = await Promise.all([
    supabase.from("perfis").select("*").maybeSingle(),
    supabase.from("projetos").select("*").order("criado_em", { ascending: true }),
    supabase.from("transacoes").select("*").order("criado_em", { ascending: true }),
  ]);

  const erro = perfil.error || projetos.error || transacoes.error;
  if (erro) {
    return Response.json({ erro: "Não consegui montar sua exportação." }, { status: 500 });
  }

  const pacote = {
    exportado_em: new Date().toISOString(),
    conta: {
      id: usuario.id,
      email: usuario.email,
      criada_em: usuario.created_at,
      ultimo_acesso: usuario.last_sign_in_at,
    },
    perfil: perfil.data || null,
    projetos: projetos.data || [],
    transacoes: transacoes.data || [],
    // Dito no arquivo porque é o tipo de coisa que gera reclamação depois: as
    // imagens ficam no navegador (IndexedDB), não no servidor.
    observacao:
      "As imagens dos cards ficam guardadas no seu próprio navegador e por isso não entram nesta exportação. Para guardá-las, abra o projeto e baixe as artes.",
  };

  const nome = `carrosseia-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
  return new Response(JSON.stringify(pacote, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nome}"`,
      "Cache-Control": "no-store",
    },
  });
}
