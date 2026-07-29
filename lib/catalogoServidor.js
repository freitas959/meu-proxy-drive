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
  const doCodigo = getTemplate(id);
  if (doCodigo) return doCodigo;
  if (!supabase || !id) return null;

  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return daLinha(data);
}
