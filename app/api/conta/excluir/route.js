import { exigirUsuario } from "@/lib/creditos";
import { getSupabaseAdmin } from "@/lib/supabase/servidor";

// Direito de eliminação, art. 18, VI da LGPD.
//
// Apagar o usuário em auth.users derruba o resto sozinho: `perfis`, `projetos`
// e `transacoes` referenciam auth.users com `on delete cascade`. Por isso aqui
// não há uma lista de deletes que alguém precise lembrar de atualizar quando
// surgir uma tabela nova.

export async function POST(req) {
  const sessao = await exigirUsuario();
  if (!sessao.ok) return sessao.resposta;

  let corpo;
  try {
    corpo = await req.json();
  } catch {
    corpo = {};
  }

  // Confirmação explícita: um POST solto nesta rota não pode apagar uma conta
  // por acidente — um clique errado, um prefetch, um CSRF.
  if (String(corpo?.confirmacao || "").trim().toUpperCase() !== "EXCLUIR") {
    return Response.json(
      { erro: "Escreva EXCLUIR para confirmar." },
      { status: 400 }
    );
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return Response.json(
      { erro: "A exclusão automática não está configurada neste servidor." },
      { status: 503 }
    );
  }

  // O id vem da sessão validada, NUNCA do corpo da requisição. Com service role
  // um id vindo de fora seria "apague a conta de quem eu quiser".
  const { error } = await admin.auth.admin.deleteUser(sessao.usuario.id);
  if (error) {
    console.error("[excluir conta]", error);
    return Response.json({ erro: "Não consegui excluir sua conta agora." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
