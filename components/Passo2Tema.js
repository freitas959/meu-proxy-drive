"use client";

import { useRef, useState } from "react";
import CardCanvas from "./CardCanvas";
import { CUSTOS } from "@/lib/store";
import s from "@/app/app/wizard.module.css";

const MIN_SLIDES = 3;
const MAX_SLIDES = 10;
const TAMANHO_MAX_ANEXO = 4 * 1024 * 1024;

const ESTILOS_CAPA = [
  { id: "foto", nome: "Foto realista", nota: "cena fotográfica, como no feed" },
  { id: "ilustracao", nome: "Ilustração", nota: "desenho vetorial na sua paleta" },
];

function lerComoDataURL(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () => reject(new Error("Não consegui ler o arquivo."));
    leitor.readAsDataURL(arquivo);
  });
}

export default function Passo2Tema({
  template,
  paleta,
  dados,
  atualizar,
  onVoltar,
  onTrocarTemplate,
  onGerarRoteiro,
  onImportar,
  carregando,
}) {
  const [avisoAnexo, setAvisoAnexo] = useState("");
  const inputCapa = useRef(null);
  const inputCard = useRef(null);
  const inputRefs = useRef(null);
  const alvoCard = useRef(0);

  const custoRoteiro = CUSTOS.roteiro + (dados.capaModo === "ia" ? CUSTOS.capaIA : 0);
  const podeGerar = Boolean(dados.tema.trim() || dados.link.trim());
  const podeImportar = dados.tema.trim().length >= 40;

  function mudarSlides(delta) {
    const novo = Math.min(MAX_SLIDES, Math.max(MIN_SLIDES, dados.slides + delta));
    if (novo === dados.slides) return;
    // Descarta as fotos dos cards que deixaram de existir.
    const imagens = { ...dados.imagens };
    for (const chave of Object.keys(imagens)) {
      if (Number(chave) >= novo) delete imagens[chave];
    }
    atualizar({ slides: novo, imagens });
  }

  async function receberFotoCard(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;
    if (arquivo.size > TAMANHO_MAX_ANEXO) {
      setAvisoAnexo("Imagem acima de 4 MB. Reduza antes de subir.");
      return;
    }
    setAvisoAnexo("");
    atualizar({
      imagens: { ...dados.imagens, [alvoCard.current]: await lerComoDataURL(arquivo) },
    });
  }

  async function receberCapa(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;
    if (arquivo.size > TAMANHO_MAX_ANEXO) {
      setAvisoAnexo("Imagem acima de 4 MB. Reduza antes de subir.");
      return;
    }
    setAvisoAnexo("");
    atualizar({
      capaModo: "upload",
      imagens: { ...dados.imagens, 0: await lerComoDataURL(arquivo) },
    });
  }

  async function adicionarReferencias(arquivos) {
    const aceitos = [];
    const recusados = [];

    for (const arquivo of arquivos) {
      const ehImagem = arquivo.type.startsWith("image/");
      const ehPdf = arquivo.type === "application/pdf";
      if (!ehImagem && !ehPdf) {
        recusados.push(`${arquivo.name} (formato não suportado)`);
        continue;
      }
      if (arquivo.size > TAMANHO_MAX_ANEXO) {
        recusados.push(`${arquivo.name} (acima de 4 MB)`);
        continue;
      }
      const dataUrl = await lerComoDataURL(arquivo);
      aceitos.push({
        nome: arquivo.name || (ehPdf ? "documento.pdf" : "imagem"),
        tipo: ehPdf ? "pdf" : "imagem",
        midia: arquivo.type,
        dados: dataUrl.split(",")[1],
      });
    }

    setAvisoAnexo(recusados.length ? `Ignorei: ${recusados.join(", ")}.` : "");
    if (aceitos.length) {
      atualizar({ referencias: [...dados.referencias, ...aceitos].slice(0, 6) });
    }
  }

  function colarReferencia(evento) {
    const arquivos = Array.from(evento.clipboardData?.files || []);
    if (!arquivos.length) return;
    evento.preventDefault();
    adicionarReferencias(arquivos);
  }

  return (
    <>
      <span className="step-pill">Passo 2 de 4</span>
      <h1 className="page-title">Sobre o que é o carrossel?</h1>
      <p className="page-sub">
        Escreva o tema, cole um texto ou <strong>o link de uma matéria</strong>, a IA lê o
        conteúdo e desenvolve o roteiro no visual do template.
      </p>

      <div className={`panel ${s.barraTemplate}`}>
        <span className={s.barraThumb}>
          <CardCanvas
            card={{
              titulo: template.exemplo.titulo,
              texto: "",
              selo: "",
            }}
            template={template}
            paleta={paleta}
            fontes={template.fontes}
            indice={0}
            total={dados.slides}
            ehCapa
            escala={0.05}
          />
        </span>
        <span className={s.barraNome}>
          Template: <strong>{template.nome}</strong>
        </span>
        <button type="button" className="btn btn-sm" onClick={onTrocarTemplate}>
          trocar
        </button>
      </div>

      <div className={`panel ${s.formulario}`}>
        <label className={`mono-label ${s.rotulo}`} htmlFor="tema">
          Tema do carrossel
        </label>
        <textarea
          id="tema"
          className="field"
          rows={5}
          value={dados.tema}
          onChange={(e) => atualizar({ tema: e.target.value })}
          placeholder="Ex.: A importância de beber água ao longo do dia, benefícios, quanto beber e dicas."
        />

        <label className={`mono-label ${s.rotulo}`} htmlFor="link">
          Link de matéria{" "}
          <span className={s.rotuloLeve}>(opcional), a IA lê a página e usa como base</span>
        </label>
        <input
          id="link"
          className="field"
          type="url"
          value={dados.link}
          onChange={(e) => atualizar({ link: e.target.value })}
          placeholder="https://exemplo.com/materia"
        />

        <div className={s.rotulo}>
          <div className={s.contador}>
            <span className={`mono-label ${s.contadorRotulo}`}>Slides</span>
            <button
              type="button"
              className={s.contadorBtn}
              onClick={() => mudarSlides(-1)}
              disabled={dados.slides <= MIN_SLIDES}
              aria-label="Menos um slide"
            >
              −
            </button>
            <span className={s.contadorValor} aria-live="polite">
              {dados.slides}
            </span>
            <button
              type="button"
              className={s.contadorBtn}
              onClick={() => mudarSlides(1)}
              disabled={dados.slides >= MAX_SLIDES}
              aria-label="Mais um slide"
            >
              +
            </button>
          </div>
        </div>

        <span className={`mono-label ${s.rotulo}`}>
          Imagens dos cards{" "}
          <span className={s.rotuloLeve}>
            (opcional), clique num quadradinho pra subir a foto daquele card
          </span>
        </span>
        <div className={s.quadradinhos}>
          {Array.from({ length: dados.slides }, (_, i) => {
            const foto = dados.imagens[i];
            const ehCapaIA = i === 0 && dados.capaModo === "ia";
            return (
              <button
                key={i}
                type="button"
                className={`${s.quadradinho} ${ehCapaIA ? s.quadradinhoCapa : ""}`}
                onClick={() => {
                  if (i === 0) {
                    inputCapa.current?.click();
                  } else {
                    alvoCard.current = i;
                    inputCard.current?.click();
                  }
                }}
                title={i === 0 ? "Capa do carrossel" : `Foto do card ${i + 1}`}
              >
                <span className={s.quadradinhoNum}>{i + 1}</span>
                {foto ? (
                  <>
                    {/* data URL local: next/image não tem o que otimizar aqui */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className={s.quadradinhoFoto} src={foto} alt="" />
                    <span
                      className={s.quadradinhoRemover}
                      role="button"
                      tabIndex={-1}
                      onClick={(e) => {
                        e.stopPropagation();
                        const imagens = { ...dados.imagens };
                        delete imagens[i];
                        atualizar(i === 0 ? { imagens, capaModo: "ia" } : { imagens });
                      }}
                      aria-label="Remover foto"
                    >
                      ×
                    </span>
                  </>
                ) : ehCapaIA ? (
                  <>✨ IA CAPA</>
                ) : (
                  "+"
                )}
              </button>
            );
          })}
        </div>
        <p className="hint" style={{ marginTop: 10 }}>
          A <strong>capa</strong> pode ser gerada por IA ou foto sua. Os demais cards aceitam{" "}
          <strong>upload</strong>: a foto entra pronta no carrossel final (e dá pra ajustar
          depois, card por card).
        </p>

        <span className={`mono-label ${s.rotulo}`}>Capa do carrossel</span>
        <div className={s.duasColunas}>
          <button
            type="button"
            className={`${s.capaBtn} ${dados.capaModo === "ia" ? s.capaBtnAtivo : ""}`}
            onClick={() => {
              const imagens = { ...dados.imagens };
              delete imagens[0];
              atualizar({ capaModo: "ia", imagens });
            }}
            aria-pressed={dados.capaModo === "ia"}
          >
            Gerar com IA
          </button>
          <button
            type="button"
            className={`${s.capaBtn} ${dados.capaModo === "upload" ? s.capaBtnAtivo : ""}`}
            onClick={() => inputCapa.current?.click()}
            aria-pressed={dados.capaModo === "upload"}
          >
            Subir minha capa
          </button>
        </div>

        {dados.capaModo === "ia" && (
          <>
            <span className={`mono-label ${s.rotulo}`}>Estilo da capa</span>
            <div className={s.duasColunas}>
              {ESTILOS_CAPA.map((estilo) => (
                <button
                  key={estilo.id}
                  type="button"
                  className={`${s.estiloBtn} ${
                    dados.capaEstilo === estilo.id ? s.estiloBtnAtivo : ""
                  }`}
                  onClick={() => atualizar({ capaEstilo: estilo.id })}
                  aria-pressed={dados.capaEstilo === estilo.id}
                >
                  <span className={s.estiloNome}>{estilo.nome}</span>
                  <span className={s.estiloNota}>{estilo.nota}</span>
                </button>
              ))}
            </div>

            <textarea
              className="field"
              style={{ marginTop: 12 }}
              rows={3}
              value={dados.capaPrompt}
              onChange={(e) => atualizar({ capaPrompt: e.target.value })}
              placeholder="Ex.: Neymar segurando a taça da copa do mundo de 2030"
            />
            <p className="hint" style={{ marginTop: 8 }}>
              Descreva a <strong>cena da capa</strong> do seu jeito. Se deixar vazio, a IA
              cria a cena a partir do tema.
            </p>
          </>
        )}

        <hr className="divider-dashed" />

        <div className={s.refsLinha}>
          <span className="mono-label">
            Referências <span className={s.rotuloLeve}>(opcional)</span>, a IA lê os arquivos ·
            cole imagens direto aqui (Ctrl+V)
          </span>
          <button type="button" className="btn btn-sm" onClick={() => inputRefs.current?.click()}>
            + Anexar PDF / imagens
          </button>
        </div>

        <div
          className={s.zonaColagem}
          tabIndex={0}
          onPaste={colarReferencia}
          role="button"
          aria-label="Área de colagem de referências"
        >
          Clique aqui e cole (Ctrl+V) uma imagem, ou use o botão acima. Até 6 arquivos, 4 MB
          cada.
        </div>

        {dados.referencias.length > 0 && (
          <div className={s.refsLista}>
            {dados.referencias.map((ref, i) => (
              <span key={i} className={s.refChip}>
                {ref.tipo === "pdf" ? "📄" : "🖼"} {ref.nome}
                <button
                  type="button"
                  onClick={() =>
                    atualizar({ referencias: dados.referencias.filter((_, j) => j !== i) })
                  }
                  aria-label={`Remover ${ref.nome}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {avisoAnexo && (
          <p className="hint" style={{ marginTop: 10, color: "#a81f12" }}>
            {avisoAnexo}
          </p>
        )}

        <input
          ref={inputCapa}
          type="file"
          accept="image/*"
          hidden
          onChange={receberCapa}
        />
        <input
          ref={inputCard}
          type="file"
          accept="image/*"
          hidden
          onChange={receberFotoCard}
        />
        <input
          ref={inputRefs}
          type="file"
          accept="image/*,application/pdf"
          multiple
          hidden
          onChange={(e) => {
            adicionarReferencias(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
      </div>

      <div className="step-actions">
        <button type="button" className="btn" onClick={onVoltar} disabled={carregando}>
          Voltar
        </button>
        <div className="step-actions-right">
          <button
            type="button"
            className="btn btn-dashed"
            onClick={onGerarRoteiro}
            disabled={!podeGerar || carregando}
          >
            {carregando ? "Gerando…" : "Gerar roteiro"}{" "}
            <span className={s.custo}>· {custoRoteiro} créd. ★</span>
          </button>
          <button
            type="button"
            className="btn"
            onClick={onImportar}
            disabled={!podeImportar || carregando}
            title="Usa o texto que você escreveu no campo Tema"
          >
            Já tenho o texto, importar <span className={s.custo}>· {CUSTOS.importar} créd.</span>
          </button>
        </div>
      </div>

      <p className={`hint ${s.dica}`}>
        {podeGerar
          ? "“Importar” usa o texto do campo Tema como está, sem reescrever."
          : "Escreva o tema (ou cole um link de matéria) pra liberar o “Gerar roteiro”."}
      </p>
    </>
  );
}
