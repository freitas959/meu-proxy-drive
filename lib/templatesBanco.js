// Ponte entre a tabela `templates` e o formato que o renderizador espera.
// Os 19 templates do código continuam no código: o banco SOMA a eles. Isso
// evita migração, mantém o app funcionando sem sessão e garante que projeto
// antigo continue abrindo.

/** Linha do banco → objeto de template. */
export function daLinha(linha) {
  return {
    id: linha.id,
    nome: linha.nome,
    nicho: linha.nicho || null,
    layout: linha.layout || "editorial",
    capaIA: linha.capa_ia !== false,
    creditosCapa: linha.capa_ia === false ? 0 : 10,
    paleta: linha.paleta || {},
    fontes: linha.fontes || {},
    exemplo: linha.exemplo || {},
    selos: Array.isArray(linha.selos) ? linha.selos : [],
    cenaCapa: linha.cena_capa || "",
    capaUrl: linha.capa_url || "",
    descricao: linha.descricao || "",
    estilos: linha.estilos || {},
    numerarTitulo: Boolean(linha.numerar_titulo),
    destaqueCaixa: Boolean(linha.destaque_caixa),
    alternarFundo: Boolean(linha.alternar_fundo),
    publicado: Boolean(linha.publicado),
    arquivado: Boolean(linha.arquivado),
    doEstudio: true,
  };
}

/** Objeto de template → colunas da tabela. */
export function paraLinha(template) {
  return {
    id: template.id,
    nome: template.nome,
    layout: template.layout,
    nicho: template.nicho,
    paleta: template.paleta,
    fontes: template.fontes,
    selos: template.selos,
    exemplo: template.exemplo,
    cena_capa: template.cenaCapa || "",
    capa_url: template.capaUrl || "",
    descricao: template.descricao || "",
    capa_ia: template.capaIA !== false,
    estilos: template.estilos || {},
    numerar_titulo: Boolean(template.numerarTitulo),
    destaque_caixa: Boolean(template.destaqueCaixa),
    alternar_fundo: Boolean(template.alternarFundo),
    publicado: Boolean(template.publicado),
    arquivado: Boolean(template.arquivado),
  };
}
