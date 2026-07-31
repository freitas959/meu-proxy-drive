"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Cabecalho, Trilha, Rodape } from "@/components/Chrome";
import Passo1Templates from "@/components/Passo1Templates";
import Passo2Tema from "@/components/Passo2Tema";
import Passo3Roteiro from "@/components/Passo3Roteiro";
import Passo4Imagens from "@/components/Passo4Imagens";
import ModalProjetos from "@/components/ModalProjetos";
import { novoId, salvarProjeto } from "@/lib/store";
import { anunciarSaldo } from "@/lib/conta";
import { salvarImagens } from "@/lib/imagens";
import { acharTemplate } from "@/lib/catalogo";
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
  if (!resposta.ok) {
    const falha = new Error(dados?.erro || `Falha na requisição (${resposta.status}).`);
    falha.status = resposta.status;
    throw falha;
  }
  // O saldo volta em toda geração bem-sucedida; o cabeçalho escuta isso.
  if (typeof dados?.saldo === "number") anunciarSaldo(dados.saldo);
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
  // Nome e foto que aparecem dentro do card no template de post.
  const [perfil, setPerfil] = useState({ nome: "", foto: "" });
  const [capaIA, setCapaIA] = useState(true);

  const [gerandoCapa, setGerandoCapa] = useState(false);
  const [erroCapa, setErroCapa] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const [projetosAberto, setProjetosAberto] = useState(false);
  const projetoId = useRef(novoId());

  useEffect(() => {
    // Outras páginas linkam pra /app?projetos=1; abrimos o modal e limpamos a
    // URL pra um F5 não reabrir sozinho.
    const params = new URLSearchParams(window.location.search);
    if (params.get("projetos") === "1") {
      setProjetosAberto(true);
      window.history.replaceState({}, "", "/app");
    }
  }, []);

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

  /** Manda para o login quando a sessão caiu no meio do caminho. */
  function tratarFalha(falha, aplicar) {
    if (falha.status === 401) {
      window.location.href = "/entrar";
      return;
    }
    aplicar(falha.message);
  }

  /** Passo 2 → 3: lê a matéria (se houver link) e pede o roteiro à IA. */
  async function gerarRoteiro() {
    // O débito acontece dentro da rota, no banco. O cliente não faz mais conta
    // de crédito nenhuma — só reage ao que o servidor responde.
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
      tratarFalha(falha, setErro);
    } finally {
      setCarregando(false);
    }
  }

  /** Caminho barato: o texto já é do usuário, a IA só distribui nos cards. */
  async function importarTexto() {
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
      tratarFalha(falha, setErro);
    } finally {
      setCarregando(false);
    }
  }

  function aplicarRoteiro(resultado) {
    // O servidor já normaliza a lista, mas se um dia escapar algo fora do
    // formato o usuário merece uma frase legível em vez de "slides.map is not
    // a function" — que foi exatamente o que apareceu na tela quando o modelo
    // devolveu os cards serializados como texto.
    if (!Array.isArray(resultado?.slides) || !resultado.slides.length) {
      throw new Error("A IA devolveu o roteiro num formato inesperado. Tente gerar de novo.");
    }

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
      tratarFalha(falha, setErroCapa);
    } finally {
      setGerandoCapa(false);
    }
  }

  /** Restaura um projeto salvo direto no passo 4, pronto pra baixar de novo. */
  async function abrirProjeto(projeto) {
    const tpl = await acharTemplate(projeto.templateId);
    if (!tpl || !projeto.roteiro?.length) return;

    projetoId.current = projeto.id;
    setTemplate(tpl);
    setPaleta(projeto.paleta || tpl.paleta);
    setFontes(projeto.fontes || tpl.fontes);
    setTamanho(projeto.tamanho || "retrato");
    setHandle(projeto.handle || "");
    setPerfil(projeto.perfil || { nome: "", foto: "" });
    setRoteiro(projeto.roteiro);
    setLegenda(projeto.legenda || "");
    setCapaIA(false);
    setErroCapa("");
    setErro("");
    setDados((atual) => ({
      ...atual,
      slides: projeto.roteiro.length,
      imagens: projeto.imagens || {},
      capaEstilo: projeto.capaEstilo || "foto",
    }));
    setProjetosAberto(false);
    setMaxAlcancado(4);
    setPasso(4);
    window.scrollTo({ top: 0 });
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
    setPerfil({ nome: "", foto: "" });
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
      perfil,
      roteiro,
      legenda,
      capaEstilo: dados.capaEstilo,
    });
    // As imagens vão pro IndexedDB: em data URL elas estouram a cota do
    // localStorage, e sem elas o "Abrir" perderia a capa já gerada.
    salvarImagens(projetoId.current, dados.imagens);
  }, [passo, template, roteiro, paleta, fontes, tamanho, handle, perfil, legenda, dados.tema, dados.imagens, dados.capaEstilo]);

  return (
    <>
      <Cabecalho paginaAtual="app" onProjetos={() => setProjetosAberto(true)} />
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
            perfil={perfil}
            setPerfil={setPerfil}
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
            perfil={perfil}
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

      {projetosAberto && (
        <ModalProjetos
          onFechar={() => setProjetosAberto(false)}
          onAbrir={abrirProjeto}
        />
      )}

      <Rodape />
    </>
  );
}
