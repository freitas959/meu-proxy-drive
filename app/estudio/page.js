"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Cabecalho, Rodape } from "@/components/Chrome";
import CardCanvas from "@/components/CardCanvas";
import { FONTES_CORPO, FONTES_TITULO, TEMPLATES } from "@/lib/templates";
import { daLinha, paraLinha } from "@/lib/templatesBanco";
import { invalidarCatalogo } from "@/lib/catalogo";
import { CORES_DO_PAPEL, PAPEIS, REFERENCIAS, estiloVazio } from "@/lib/estilos";
import { enviarCapa } from "@/lib/capaTemplate";
import { getSupabase } from "@/lib/supabase/navegador";
import s from "./estudio.module.css";

const LAYOUTS = [
  { id: "editorial", nome: "Editorial", nota: "Foto de fundo, título ancorado embaixo." },
  { id: "chat", nome: "Chat de IA", nota: "Corpo do card dentro de uma caixa de conversa." },
  { id: "tweet", nome: "Post de rede", nota: "Imita um post com avatar e nome." },
];

const VAZIO = {
  id: "",
  nome: "",
  layout: "editorial",
  nicho: null,
  paleta: {
    fundo: "#0d0d0d",
    texto: "#ffffff",
    secundaria: "#a8a29a",
    botoes: "#ee5b2b",
    fundoAlt: "#f2ede4",
    textoAlt: "#111111",
  },
  fontes: { titulo: "Anton", corpo: "Inter" },
  selos: ["DADO", "MECANISMO", "ERRO COMUM", "AGORA"],
  exemplo: { titulo: "", texto: "" },
  cenaCapa: "",
  capaUrl: "",
  descricao: "",
  estilos: {},
  capaIA: true,
  numerarTitulo: false,
  destaqueCaixa: false,
  alternarFundo: false,
  publicado: false,
  arquivado: false,
};

/** Cards de mentira só pra prévia — um de cada tipo, como num carrossel real. */
function amostra(template) {
  const titulo = template.exemplo?.titulo || "O título de exemplo entra aqui.";
  const texto =
    template.exemplo?.texto ||
    "O corpo do card mostra como o **destaque** aparece neste template, e como o texto respira.";
  return [
    { tipo: "hook", selo: template.selos?.[0] || "AGORA", titulo, texto: "", palavraImpacto: "", botao: "" },
    { tipo: "conteudo", selo: template.selos?.[1] || "DADO", titulo, texto, botao: "" },
    { tipo: "conteudo", selo: template.selos?.[2] || "MECANISMO", titulo, texto, botao: "" },
    { tipo: "cta", selo: template.selos?.[3] || "VAI", titulo, texto: "", botao: "SALVAR" },
  ];
}

function apelido(nome) {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function Campo({ rotulo, children }) {
  return (
    <div>
      <span className={`mono-label ${s.rotulo}`}>{rotulo}</span>
      {children}
    </div>
  );
}

function Cor({ rotulo, valor, onChange }) {
  return (
    <Campo rotulo={rotulo}>
      <div className={s.cor}>
        <input
          className={s.corAmostra}
          type="color"
          value={valor || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          aria-label={rotulo}
        />
        <input
          className="field"
          value={valor || ""}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
      </div>
    </Campo>
  );
}

/**
 * Uma cor de um papel. O seletor escolhe entre herdar, apontar para uma cor da
 * paleta do cliente, ou fixar — e só no caso "fixa" aparece o seletor de cor.
 */
function CorDoPapel({ rotulo, valor, onChange }) {
  const fixa = typeof valor === "string" && valor.startsWith("#");
  return (
    <Campo rotulo={rotulo}>
      <select
        className="field"
        value={fixa ? "#" : valor || ""}
        onChange={(e) => onChange(e.target.value === "#" ? "#000000" : e.target.value)}
      >
        {REFERENCIAS.map((r) => (
          <option key={r.id} value={r.id}>
            {r.nome}
          </option>
        ))}
      </select>
      {fixa && (
        <div className={s.cor} style={{ marginTop: 8 }}>
          <input
            className={s.corAmostra}
            type="color"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${rotulo}: cor fixa`}
          />
          <input
            className="field"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
          />
        </div>
      )}
    </Campo>
  );
}

function Marca({ ligado, onChange, titulo, nota }) {
  return (
    <label className={s.marca}>
      <input type="checkbox" checked={ligado} onChange={(e) => onChange(e.target.checked)} />
      <span>
        {titulo}
        <span className={s.marcaNota}>{nota}</span>
      </span>
    </label>
  );
}

export default function Estudio() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(null); // null = ainda checando
  const [salvos, setSalvos] = useState([]);
  const [t, setT] = useState(VAZIO);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [capaOcupada, setCapaOcupada] = useState("");

  const mudar = useCallback((patch) => setT((atual) => ({ ...atual, ...patch })), []);
  const mudarPaleta = useCallback(
    (patch) => setT((atual) => ({ ...atual, paleta: { ...atual.paleta, ...patch } })),
    []
  );

  const mudarEstilo = useCallback((papel, patch) => {
    setT((atual) => ({
      ...atual,
      estilos: {
        ...atual.estilos,
        [papel]: { ...estiloVazio(), ...(atual.estilos?.[papel] || {}), ...patch },
      },
    }));
  }, []);

  const recarregar = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase
      .from("templates")
      .select("*")
      .order("criado_em", { ascending: false });
    setSalvos((data || []).map(daLinha));
  }, []);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const supabase = getSupabase();
      if (!supabase) return vivo && setAutorizado(false);
      // A permissão é do banco, não da tela: eh_admin() lê a coluna do perfil.
      const { data, error } = await supabase.rpc("eh_admin");
      if (!vivo) return;
      if (error || !data) return setAutorizado(false);
      setAutorizado(true);
      recarregar();
    })();
    return () => {
      vivo = false;
    };
  }, [recarregar]);

  // Quem não é admin não fica olhando uma tela vazia: volta pro wizard.
  useEffect(() => {
    if (autorizado === false) router.replace("/app");
  }, [autorizado, router]);

  const cards = useMemo(() => amostra(t), [t]);

  async function salvar(publicar) {
    const nome = t.nome.trim();
    if (!nome) {
      setErro("Dê um nome ao template.");
      return;
    }

    const id = t.id || apelido(nome);
    if (!id) {
      setErro("Esse nome não gera um identificador válido. Use letras ou números.");
      return;
    }
    // Um template do estúdio com o mesmo id de um do código seria invisível:
    // o servidor procura no código primeiro e nunca chegaria no banco.
    if (!t.id && TEMPLATES.some((codigo) => codigo.id === id)) {
      setErro(`Já existe um template do sistema com o identificador "${id}". Troque o nome.`);
      return;
    }

    setErro("");
    setAviso("");
    setSalvando(true);
    try {
      const supabase = getSupabase();
      const linha = paraLinha({ ...t, id, nome, publicado: publicar });
      const { error } = await supabase.from("templates").upsert(linha);
      if (error) throw error;

      invalidarCatalogo();
      await recarregar();
      setT((atual) => ({ ...atual, id, nome, publicado: publicar }));
      setAviso(
        publicar
          ? "Publicado. Já aparece na lista de templates para todo mundo."
          : "Salvo como rascunho. Só você enxerga."
      );
    } catch (falha) {
      setErro(falha.message || "Não consegui salvar.");
    } finally {
      setSalvando(false);
    }
  }

  async function arquivar() {
    if (!t.id) return;
    setSalvando(true);
    try {
      const supabase = getSupabase();
      // Arquiva em vez de apagar: projeto antigo guarda o template_id e
      // deixaria de abrir se a linha sumisse.
      const { error } = await supabase
        .from("templates")
        .update({ arquivado: true, publicado: false })
        .eq("id", t.id);
      if (error) throw error;
      invalidarCatalogo();
      await recarregar();
      setT(VAZIO);
      setAviso("Arquivado. Sai da lista, mas os carrosséis já feitos continuam abrindo.");
    } catch (falha) {
      setErro(falha.message || "Não consegui arquivar.");
    } finally {
      setSalvando(false);
    }
  }

  async function subirCapa(arquivo) {
    if (!arquivo) return;
    setErro("");
    setAviso("");
    setCapaOcupada("upload");
    try {
      const url = await enviarCapa(t.id || apelido(t.nome) || "rascunho", arquivo);
      mudar({ capaUrl: url });
      setAviso("Capa enviada. Salve o template para gravar a mudança.");
    } catch (falha) {
      setErro(falha.message || "Não consegui subir a imagem.");
    } finally {
      setCapaOcupada("");
    }
  }

  /** Gera pelo mesmo caminho da capa dos carrosséis e guarda no bucket. */
  async function gerarCapa() {
    const cena = t.cenaCapa.trim();
    if (!cena) {
      setErro("Descreva a cena da capa antes de gerar.");
      return;
    }

    setErro("");
    setAviso("");
    setCapaOcupada("ia");
    try {
      const resposta = await fetch("/api/capa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cena,
          paleta: t.paleta,
          estilo: "foto",
          tamanho: "retrato",
        }),
      });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(dados?.erro || "Falha ao gerar a imagem.");

      const url = await enviarCapa(t.id || apelido(t.nome) || "rascunho", dados.imagem);
      mudar({ capaUrl: url });
      setAviso("Capa gerada. Salve o template para gravar a mudança.");
    } catch (falha) {
      setErro(falha.message || "Não consegui gerar a imagem.");
    } finally {
      setCapaOcupada("");
    }
  }

  function duplicar(base) {
    setT({
      ...base,
      id: "",
      nome: `${base.nome} (cópia)`,
      publicado: false,
      arquivado: false,
    });
    setAviso("");
    setErro("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (autorizado !== true) {
    return (
      <>
        <Cabecalho />
        <main className={`wrap ${s.pagina}`}>
          <p className="hint">{autorizado === null ? "Verificando acesso…" : "Redirecionando…"}</p>
        </main>
        <Rodape />
      </>
    );
  }

  return (
    <>
      <Cabecalho paginaAtual="estudio" />

      <main className={`wrap ${s.pagina}`}>
        <div className={s.topo}>
          <div>
            <span className="step-pill">Estúdio</span>
            <h1 className="page-title">{t.id ? `Editando: ${t.nome}` : "Novo template"}</h1>
            <p className="page-sub">
              Mexa nos controles e veja os cards mudando ao lado. Rascunho só você enxerga;
              publicado entra na lista de todo mundo.
            </p>
          </div>
          {t.id && (
            <button type="button" className="btn btn-sm" onClick={() => setT(VAZIO)}>
              Começar um novo
            </button>
          )}
        </div>

        <div className={s.colunas}>
          <div className={`panel ${s.painel}`}>
            <div className={s.grupo}>
              <span className={s.tituloGrupo}>Identidade</span>
              <Campo rotulo="Nome">
                <input
                  className="field"
                  value={t.nome}
                  onChange={(e) => mudar({ nome: e.target.value })}
                  placeholder="Ex.: Prompt · verde"
                />
              </Campo>
              <Campo rotulo="Descrição">
                <input
                  className="field"
                  value={t.descricao}
                  onChange={(e) => mudar({ descricao: e.target.value })}
                  placeholder="Uma frase sobre o visual. Aparece no card do template."
                />
              </Campo>
              <Campo rotulo="Layout">
                <select
                  className="field"
                  value={t.layout}
                  onChange={(e) => mudar({ layout: e.target.value })}
                >
                  {LAYOUTS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nome} — {l.nota}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            <div className={s.grupo}>
              <span className={s.tituloGrupo}>Cores</span>
              <div className={s.linha}>
                <Cor
                  rotulo="Fundo"
                  valor={t.paleta.fundo}
                  onChange={(v) => mudarPaleta({ fundo: v })}
                />
                <Cor
                  rotulo="Texto"
                  valor={t.paleta.texto}
                  onChange={(v) => mudarPaleta({ texto: v })}
                />
                <Cor
                  rotulo="Acento"
                  valor={t.paleta.botoes}
                  onChange={(v) => mudarPaleta({ botoes: v })}
                />
                <Cor
                  rotulo="Apoio"
                  valor={t.paleta.secundaria}
                  onChange={(v) => mudarPaleta({ secundaria: v })}
                />
              </div>
              {t.alternarFundo && (
                <div className={s.linha}>
                  <Cor
                    rotulo="Fundo alternado"
                    valor={t.paleta.fundoAlt}
                    onChange={(v) => mudarPaleta({ fundoAlt: v })}
                  />
                  <Cor
                    rotulo="Texto alternado"
                    valor={t.paleta.textoAlt}
                    onChange={(v) => mudarPaleta({ textoAlt: v })}
                  />
                </div>
              )}
            </div>

            <div className={s.grupo}>
              <span className={s.tituloGrupo}>Tipografia</span>
              <div className={s.linha}>
                <Campo rotulo="Título">
                  <select
                    className="field"
                    value={t.fontes.titulo}
                    onChange={(e) => mudar({ fontes: { ...t.fontes, titulo: e.target.value } })}
                  >
                    {FONTES_TITULO.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </Campo>
                <Campo rotulo="Corpo">
                  <select
                    className="field"
                    value={t.fontes.corpo}
                    onChange={(e) => mudar({ fontes: { ...t.fontes, corpo: e.target.value } })}
                  >
                    {FONTES_CORPO.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </Campo>
              </div>
            </div>

            <div className={s.grupo}>
              <span className={s.tituloGrupo}>Estilo por card</span>
              <p className="hint">
                O roteiro já marca cada card como capa, conteúdo ou CTA — o visual segue essa
                marca, então funciona igual num carrossel de 3 ou de 10 cards. Deixar tudo em
                &quot;padrão do template&quot; mantém o comportamento de sempre.
              </p>
              <p className="hint">
                <strong>Acento do cliente</strong> é o que faz um card sair na cor da marca de
                quem usa o template: dourado no advogado, verde no nutricionista. Para o texto
                por cima dele, use <strong>contraste automático</strong>.
              </p>

              {PAPEIS.map((papel) => {
                const estilo = t.estilos?.[papel.id] || {};
                return (
                  <div key={papel.id} className={s.papel}>
                    <span className={s.papelNome}>
                      {papel.nome}
                      <span className={s.marcaNota}>{papel.nota}</span>
                    </span>

                    <div className={s.linha}>
                      {CORES_DO_PAPEL.map(({ chave, nome }) => (
                        <CorDoPapel
                          key={chave}
                          rotulo={nome}
                          valor={estilo[chave] || ""}
                          onChange={(v) => mudarEstilo(papel.id, { [chave]: v })}
                        />
                      ))}
                    </div>

                    <div className={s.linha}>
                      <Campo rotulo="Fonte do título">
                        <select
                          className="field"
                          value={estilo.fontes?.titulo || ""}
                          onChange={(e) =>
                            mudarEstilo(papel.id, {
                              fontes: { ...(estilo.fontes || {}), titulo: e.target.value },
                            })
                          }
                        >
                          <option value="">Mesma do template</option>
                          {FONTES_TITULO.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </Campo>
                      <Campo rotulo="Fonte do corpo">
                        <select
                          className="field"
                          value={estilo.fontes?.corpo || ""}
                          onChange={(e) =>
                            mudarEstilo(papel.id, {
                              fontes: { ...(estilo.fontes || {}), corpo: e.target.value },
                            })
                          }
                        >
                          <option value="">Mesma do template</option>
                          {FONTES_CORPO.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </Campo>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={s.grupo}>
              <span className={s.tituloGrupo}>Comportamento</span>
              <div className={s.marcas}>
                <Marca
                  ligado={t.numerarTitulo}
                  onChange={(v) => mudar({ numerarTitulo: v })}
                  titulo="Numerar o título"
                  nota="Põe 01-, 02- na cor de acento. Pula a capa e o CTA."
                />
                <Marca
                  ligado={t.destaqueCaixa}
                  onChange={(v) => mudar({ destaqueCaixa: v })}
                  titulo="Destaque em caixa"
                  nota="A palavra marcada vira retângulo cheio, tipo marca-texto."
                />
                <Marca
                  ligado={t.alternarFundo}
                  onChange={(v) => mudar({ alternarFundo: v })}
                  titulo="Alternar o fundo"
                  nota="Vira a cor de fundo a cada card. A capa fica de fora."
                />
                <Marca
                  ligado={t.capaIA}
                  onChange={(v) => mudar({ capaIA: v })}
                  titulo="Capa gerada por IA"
                  nota="Libera a capa em foto ou ilustração. Custa créditos ao usuário."
                />
              </div>
            </div>

            <div className={s.grupo}>
              <span className={s.tituloGrupo}>Conteúdo</span>
              <Campo rotulo="Selos sugeridos (separados por vírgula)">
                <input
                  className="field"
                  value={(t.selos || []).join(", ")}
                  onChange={(e) =>
                    mudar({
                      selos: e.target.value
                        .split(",")
                        .map((x) => x.trim().toUpperCase())
                        .filter(Boolean),
                    })
                  }
                />
              </Campo>
              <Campo rotulo="Cena da capa (vira o prompt da imagem)">
                <input
                  className="field"
                  value={t.cenaCapa}
                  onChange={(e) => mudar({ cenaCapa: e.target.value })}
                  placeholder="Ex.: mesa escura com um objeto iluminado, luz fria, minimalista"
                />
              </Campo>
            </div>

            <div className={s.grupo}>
              <span className={s.tituloGrupo}>Imagem da capa</span>
              <p className="hint">
                É a foto que aparece atrás do primeiro card na vitrine de templates. Sem ela, a
                capa usa o fundo abstrato gerado a partir da paleta.
              </p>

              {t.capaUrl && (
                <div className={s.capaAtual}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.capaUrl} alt="Capa atual do template" />
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => mudar({ capaUrl: "" })}
                  >
                    Remover
                  </button>
                </div>
              )}

              <div className={s.acoes} style={{ marginTop: 0 }}>
                <label className={`btn btn-sm ${capaOcupada ? s.desabilitado : ""}`}>
                  {capaOcupada === "upload" ? "Enviando…" : "Subir imagem"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    disabled={Boolean(capaOcupada)}
                    onChange={(e) => {
                      subirCapa(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-sm btn-dashed"
                  onClick={gerarCapa}
                  disabled={Boolean(capaOcupada)}
                >
                  {capaOcupada === "ia" ? "Gerando…" : "Gerar com IA"}
                </button>
              </div>
              <Campo rotulo="Título de exemplo">
                <input
                  className="field"
                  value={t.exemplo?.titulo || ""}
                  onChange={(e) => mudar({ exemplo: { ...t.exemplo, titulo: e.target.value } })}
                />
              </Campo>
              <Campo rotulo="Texto de exemplo">
                <textarea
                  className="field"
                  value={t.exemplo?.texto || ""}
                  onChange={(e) => mudar({ exemplo: { ...t.exemplo, texto: e.target.value } })}
                />
              </Campo>
            </div>

            <div className={s.acoes}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => salvar(true)}
                disabled={salvando}
              >
                {salvando ? "Salvando…" : "Publicar"}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => salvar(false)}
                disabled={salvando}
              >
                Salvar rascunho
              </button>
              {t.id && (
                <button type="button" className="btn" onClick={arquivar} disabled={salvando}>
                  Arquivar
                </button>
              )}
            </div>

            {erro && <p className={`${s.aviso} ${s.avisoErro}`}>{erro}</p>}
            {aviso && <p className={`${s.aviso} ${s.avisoOk}`}>{aviso}</p>}
          </div>

          <div className={`panel ${s.previa}`}>
            <span className={s.tituloGrupo}>Prévia</span>
            <div className={s.previaTira}>
              {cards.map((card, i) => (
                <div key={i} className={s.previaCard}>
                  <CardCanvas
                    card={card}
                    template={t}
                    paleta={t.paleta}
                    fontes={t.fontes}
                    tamanho="retrato"
                    indice={i}
                    total={cards.length}
                    handle="seu perfil"
                    imagem={i === 0 ? t.capaUrl || null : null}
                    ehCapa={i === 0}
                    escala={0.3}
                  />
                </div>
              ))}
            </div>
            <p className="hint" style={{ marginTop: 10 }}>
              {t.capaUrl
                ? "A capa está usando a imagem que você definiu."
                : "Sem imagem de capa, o primeiro card usa o fundo abstrato da paleta."}
            </p>
          </div>
        </div>

        <h2 className="page-title" style={{ fontSize: 22, marginTop: 34 }}>
          Templates do estúdio
        </h2>
        {salvos.length === 0 ? (
          <p className={s.vazio}>Nenhum ainda. O que você publicar aqui aparece nesta lista.</p>
        ) : (
          <div className={s.lista}>
            {salvos.map((item) => (
              <article key={item.id} className={`panel ${s.item}`}>
                <span className={s.itemNome}>{item.nome}</span>
                <span className={s.itemMeta}>
                  {item.layout} ·{" "}
                  {item.arquivado ? (
                    "arquivado"
                  ) : item.publicado ? (
                    "publicado"
                  ) : (
                    <span className={s.rascunho}>rascunho</span>
                  )}
                </span>
                <div className={s.acoes} style={{ marginTop: 6 }}>
                  <button type="button" className="btn btn-sm" onClick={() => setT(item)}>
                    Editar
                  </button>
                  <button type="button" className="btn btn-sm" onClick={() => duplicar(item)}>
                    Duplicar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <h2 className="page-title" style={{ fontSize: 22, marginTop: 34 }}>
          Partir de um do sistema
        </h2>
        <p className="hint">
          Os 19 templates do código não são editáveis — eles vivem no repositório. Duplique um
          para ter uma cópia sua, editável, no estúdio.
        </p>
        <div className={s.lista}>
          {TEMPLATES.map((item) => (
            <article key={item.id} className={`panel ${s.item}`}>
              <span className={s.itemNome}>{item.nome}</span>
              <span className={s.itemMeta}>{item.layout} · do sistema</span>
              <div className={s.acoes} style={{ marginTop: 6 }}>
                <button type="button" className="btn btn-sm" onClick={() => duplicar(item)}>
                  Duplicar
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      <Rodape />
    </>
  );
}
