"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Cabecalho, Trilha, Rodape } from "@/components/Chrome";
import Passo1Templates from "@/components/Passo1Templates";
import Passo2Tema from "@/components/Passo2Tema";
import Passo3Roteiro from "@/components/Passo3Roteiro";
import Passo4Imagens from "@/components/Passo4Imagens";
import { CUSTOS, debitar, estornar, getCreditos, novoId, salvarProjeto } from "@/lib/store";
import s from "./wizard.module.css";

const DADOS_INICIAIS = {
  tema: "",
  link: "",
  slides: 6,
  imagens: {},
  capaModo: "ia",
  capaEstilo: "foto",
  capaPrompt: "",
  referencias: [],
};

async function postar(rota, corpo) {
  const resposta = await fetch(rota, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados?.erro || `Falha na requisição (${resposta.status}).`);
  return dados;
}

export default function AppCarrossel() {
  const [passo, setPasso] = useState(1);
  const [maxAlcancado, setMaxAlcancado] = useState(1);

  const [template, setTemplate] = useState(null);
  const [paleta, setPaleta] = useState(null);
  const [fontes, setFontes] = useState(null);

  const [dados, setDados] = useState(DADOS_INICIAIS);
  const [roteiro, setRoteiro] = useState([]);
  const [legenda, setLegenda] = useState("");

  const [tamanho, setTamanho] = useState(null);
  const [handle, setHandle] = useState("");
  const [capaIA, setCapaIA] = useState(true);

  const [gerandoCapa, setGerandoCapa] = useState(false);
  const [erroCapa, setErroCapa] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const projetoId = useRef(novoId());

  const avancar = useCallback((destino) => {
    setPasso(destino);
    setMaxAlcancado((max) => Math.max(max, destino));
    setErro("");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const atualizarDados = useCallback((patch) => {
    setDados((atual) => ({ ...atual, ...patch }));
  }, []);

  function escolherTemplate(escolhido, paletaEscolhida) {
    setTemplate(escolhido);
    setPaleta(paletaEscolhida);
    setFontes(escolhido.fontes);
    setCapaIA(escolhido.capaIA);
    setDados((atual) => ({
      ...atual,
      capaModo: escolhido.capaIA ? "ia" : "upload",
      imagens: {},
    }));
    avancar(2);
  }

  /** Passo 2 → 3: lê a matéria (se houver link) e pede o roteiro à IA. */
  async function gerarRoteiro() {
    const custo = CUSTOS.roteiro;
    if (!debitar(custo)) {
      setErro(`Créditos insuficientes: você tem ${getCreditos()} e essa geração custa ${custo}.`);
      return;
    }

    setCarregando(true);
    setErro("");
    try {
      let materia = "";
      if (dados.link.trim()) {
        try {
          materia = (await postar("/api/materia", { link: dados.link.trim() })).texto || "";
        } catch (falha) {
          // Link ilegível não deve abortar: a IA segue com o tema escrito.
          setErro(`Não consegui ler o link (${falha.message}). Segui só com o tema.`);
        }
      }

      const resultado = await postar("/api/roteiro", {
        tema: dados.tema,
        link: dados.link,
        materia,
        slides: dados.slides,
        templateId: template.id,
        anexos: dados.referencias,
      });

      aplicarRoteiro(resultado);
      avancar(3);
    } catch (falha) {
      estornar(custo);
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  }

  /** Caminho barato: o texto já é do usuário, a IA só distribui nos cards. */
  async function importarTexto() {
    const custo = CUSTOS.importar;
    if (!debitar(custo)) {
      setErro(`Créditos insuficientes: você tem ${getCreditos()} e importar custa ${custo}.`);
      return;
    }

    setCarregando(true);
    setErro("");
    try {
      const resultado = await postar("/api/importar", {
        texto: dados.tema,
        slides: dados.slides,
        templateId: template.id,
      });
      aplicarRoteiro(resultado);
      avancar(3);
    } catch (falha) {
      estornar(custo);
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  }

  function aplicarRoteiro(resultado) {
    const promptCapa = dados.capaPrompt.trim() || resultado.promptCapa || template.cenaCapa || "";
    setRoteiro(
      resultado.slides.map((slide, i) => ({
        tipo: slide.tipo || (i === 0 ? "hook" : "conteudo"),
        selo: (slide.selo || "").toUpperCase(),
        titulo: slide.titulo || "",
        texto: slide.texto || "",
        botao: slide.botao || "",
        ...(i === 0
          ? { palavraImpacto: (resultado.palavraImpacto || "").toUpperCase(), promptCapa }
          : {}),
      }))
    );
    setLegenda(resultado.legenda || "");
  }

  /** Passo 3 → 4: entra no resultado e, se pedido, desenha a capa em paralelo. */
  async function gerarImagens() {
    const usaCapaIA = capaIA && dados.capaModo === "ia";

    if (usaCapaIA && !debitar(CUSTOS.capaIA)) {
      setErro(
        `Créditos insuficientes: você tem ${getCreditos()} e a capa da IA custa ${CUSTOS.capaIA}.`
      );
      return;
    }

    setErroCapa("");
    avancar(4);

    if (!usaCapaIA) return;

    setGerandoCapa(true);
    try {
      const { imagem } = await postar("/api/capa", {
        cena: roteiro[0]?.promptCapa || "",
        tema: dados.tema,
        paleta,
        estilo: dados.capaEstilo,
        tamanho: tamanho || "retrato",
      });
      atualizarDados({ imagens: { ...dados.imagens, 0: imagem } });
    } catch (falha) {
      estornar(CUSTOS.capaIA);
      setErroCapa(falha.message);
    } finally {
      setGerandoCapa(false);
    }
  }

  function novoCarrossel() {
    projetoId.current = novoId();
    setTemplate(null);
    setPaleta(null);
    setFontes(null);
    setDados(DADOS_INICIAIS);
    setRoteiro([]);
    setLegenda("");
    setTamanho(null);
    setCapaIA(true);
    setErroCapa("");
    setErro("");
    setMaxAlcancado(1);
    setPasso(1);
    window.scrollTo({ top: 0 });
  }

  // Guarda o projeto ao chegar no resultado. As imagens ficam de fora de
  // propósito: data URLs estouram a cota do localStorage num carrossel só.
  useEffect(() => {
    if (passo !== 4 || !template || !roteiro.length) return;
    salvarProjeto({
      id: projetoId.current,
      titulo: roteiro[0]?.titulo || dados.tema.slice(0, 60) || "Carrossel sem título",
      templateId: template.id,
      paleta,
      fontes,
      tamanho,
      handle,
      roteiro,
      legenda,
    });
  }, [passo, template, roteiro, paleta, fontes, tamanho, handle, legenda, dados.tema]);

  return (
    <>
      <Cabecalho paginaAtual="app" />
      <Trilha atual={passo} maxAlcancado={maxAlcancado} onIr={setPasso} />

      <main className={`wrap ${s.main}`}>
        {erro && <p className={s.erro}>{erro}</p>}

        {passo === 1 && <Passo1Templates onEscolher={escolherTemplate} />}

        {passo === 2 && template && (
          <Passo2Tema
            template={template}
            paleta={paleta}
            dados={dados}
            atualizar={atualizarDados}
            onVoltar={() => setPasso(1)}
            onTrocarTemplate={() => setPasso(1)}
            onGerarRoteiro={gerarRoteiro}
            onImportar={importarTexto}
            carregando={carregando}
          />
        )}

        {passo === 3 && template && roteiro.length > 0 && (
          <Passo3Roteiro
            template={template}
            paleta={paleta}
            setPaleta={setPaleta}
            fontes={fontes}
            setFontes={setFontes}
            tamanho={tamanho}
            setTamanho={setTamanho}
            handle={handle}
            setHandle={setHandle}
            roteiro={roteiro}
            setRoteiro={setRoteiro}
            capaIA={capaIA}
            setCapaIA={setCapaIA}
            capaEstilo={dados.capaEstilo}
            temUploadCapa={dados.capaModo === "upload"}
            onVoltar={() => setPasso(2)}
            onGerar={gerarImagens}
            carregando={carregando}
          />
        )}

        {passo === 4 && template && roteiro.length > 0 && (
          <Passo4Imagens
            template={template}
            paleta={paleta}
            fontes={fontes}
            tamanho={tamanho || "retrato"}
            handle={handle}
            roteiro={roteiro}
            imagens={dados.imagens}
            gerandoCapa={gerandoCapa}
            erroCapa={erroCapa}
            capaEstilo={dados.capaEstilo}
            legenda={legenda}
            onVoltar={() => setPasso(3)}
            onNovo={novoCarrossel}
          />
        )}
      </main>

      <Rodape />
    </>
  );
}
