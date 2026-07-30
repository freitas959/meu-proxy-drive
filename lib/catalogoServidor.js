import { getTemplate } from "@/lib/templates";
import { daLinha } from "@/lib/templatesBanco";

/**
 * Resolve um template pelo id, no servidor. Procura primeiro no código, que
 * é o caso comum e não custa viagem ao banco; só então na tabela do estúdio.
 *
 * Recebe o cliente já amarrado à sessão, então o RLS decide o que este
 * usuário enxerga: publicado para todos, rascunho só para o admin.
 */
export async function acharTemplateServidor(supabase, id) {
  if (!id) return null;

  // O banco vem primeiro: uma linha com o mesmo id de um template do código é
  // a versão editada dele, e é ela que deve valer. Arquivada não conta —
  // arquivar é justamente como se volta para a original.
  if (supabase) {
    const { data } = await supabase
      .from("templates")
      .select("*")
      .eq("id", id)
      .eq("arquivado", false)
      .maybeSingle();
    if (data) return daLinha(data);
  }

  return getTemplate(id);
}
