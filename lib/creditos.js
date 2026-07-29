import { getSupabaseAdmin, getSupabaseServidor, supabaseConfigurado } from "@/lib/supabase/servidor";

// As mensagens que o usuário lê. O banco devolve um código curto; traduzir
// aqui evita vazar nome de tabela e função para a tela.
const MENSAGENS = {
  sem_sessao: "Entre na sua conta para gerar carrosséis.",
  perfil_indisponivel: "Sua conta está indisponível. Fale com o suporte.",
  saldo_insuficiente: "Créditos insuficientes para esta geração.",
  quantia_invalida: "Quantidade de créditos inválida.",
  limite_diario_usuario:
    "Você atingiu o limite de gerações de hoje. Volte amanhã ou fale com o suporte.",
  limite_diario_global:
    "O sistema atingiu o limite de gerações de hoje. Tente de novo amanhã.",
};

function traduzir(mensagem = "") {
  for (const codigo of Object.keys(MENSAGENS)) {
    if (mensagem.includes(codigo)) return { erro: MENSAGENS[codigo], codigo };
  }
  return { erro: "Não consegui debitar seus créditos agora.", codigo: "desconhecido" };
}

/**
 * Portão de entrada das rotas pagas. Vem antes de qualquer outra checagem:
 * quem não está logado não precisa saber como o servidor está configurado.
 * Devolve `{ ok, usuario, supabase }` ou uma `resposta` pronta.
 */
export async function exigirUsuario() {
  if (!supabaseConfigurado()) {
    return {
      ok: false,
      resposta: Response.json(
        { erro: "O banco de dados não está configurado neste servidor." },
        { status: 503 }
      ),
    };
  }

  const supabase = await getSupabaseServidor();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    return {
      ok: false,
      resposta: Response.json({ erro: MENSAGENS.sem_sessao }, { status: 401 }),
    };
  }

  return { ok: true, usuario: data.user, supabase };
}

/**
 * Cobra antes de chamar a IA. Recebe a sessão já validada por `exigirUsuario`
 * e devolve `{ ok, usuarioId, saldo }` ou uma `resposta` pronta.
 *
 * O débito acontece no banco, dentro de uma função que trava a linha do
 * perfil — o cliente não participa da conta. Se ele mandar um custo diferente
 * no corpo da requisição, não muda nada: a quantia sai daqui.
 */
export async function cobrar(sessao, quantia, motivo, projetoId = null) {
  const { supabase, usuario } = sessao;

  const { data: saldo, error } = await supabase.rpc("debitar", {
    p_quantia: quantia,
    p_motivo: motivo,
    p_projeto_id: projetoId,
  });

  if (error) {
    const { erro, codigo } = traduzir(error.message);
    // Saldo e limites são situação do usuário, não falha do servidor.
    const status = codigo === "desconhecido" ? 500 : 402;
    return { ok: false, resposta: Response.json({ erro }, { status }) };
  }

  return { ok: true, usuarioId: usuario.id, saldo };
}

/**
 * Devolve o crédito quando a IA falha depois do débito. Roda com a service
 * role porque `estornar` não é — e não pode ser — exposta ao navegador.
 * O id vem sempre do retorno de `cobrar`, nunca do corpo da requisição.
 */
export async function devolver(usuarioId, quantia, motivo) {
  const admin = getSupabaseAdmin();
  if (!admin || !usuarioId) return;
  try {
    await admin.rpc("estornar", {
      p_usuario: usuarioId,
      p_quantia: quantia,
      p_motivo: motivo,
    });
  } catch (falha) {
    // Um estorno perdido é ruim, mas derrubar a resposta de erro é pior:
    // o usuário ficaria sem a mensagem do que de fato aconteceu.
    console.error("[creditos] estorno falhou", falha);
  }
}
