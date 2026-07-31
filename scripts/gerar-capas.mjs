#!/usr/bin/env node
//
// Gera as capas dos templates pela API do Gemini, em lote.
//
//   node scripts/gerar-capas.mjs pizzaria
//   node scripts/gerar-capas.mjs pizzaria hamburgueria restaurante
//   node scripts/gerar-capas.mjs --todas
//   node scripts/gerar-capas.mjs --todas --variacoes 4
//   node scripts/gerar-capas.mjs pizzaria --forcar
//
// Salva em public/templates/ como `<id>-1.png`, `<id>-2.png`... Você escolhe a
// melhor e renomeia para `<id>.png`, que é o nome que o template procura.
//
// Cada imagem é uma chamada paga na sua conta do Google. O script diz quantas
// vai gerar antes de começar.

import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { PROMPTS, promptDe } from "./prompts-capas.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DESTINO = join(RAIZ, "public", "templates");

/**
 * Node não lê .env.local sozinho — quem faz isso é o Next. Como o script roda
 * fora dele, a leitura é na mão. Só o necessário: chave = valor, sem aspas.
 */
function carregarEnv() {
  for (const arquivo of [".env.local", ".env"]) {
    const caminho = join(RAIZ, arquivo);
    if (!existsSync(caminho)) continue;
    for (const linha of readFileSync(caminho, "utf8").split("\n")) {
      const limpa = linha.trim();
      if (!limpa || limpa.startsWith("#")) continue;
      const corte = limpa.indexOf("=");
      if (corte < 1) continue;
      const chave = limpa.slice(0, corte).trim();
      const valor = limpa.slice(corte + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[chave]) process.env[chave] = valor;
    }
  }
}

function argumentos(argv) {
  const ids = [];
  let variacoes = 3;
  let todas = false;
  let forcar = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--todas") todas = true;
    else if (a === "--forcar") forcar = true;
    else if (a === "--variacoes") variacoes = Math.max(1, Number(argv[++i]) || 3);
    else if (!a.startsWith("--")) ids.push(a);
  }
  return { ids, variacoes, todas, forcar };
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  carregarEnv();

  if (!process.env.GEMINI_API_KEY) {
    console.error("Falta GEMINI_API_KEY no .env.local.");
    process.exit(1);
  }

  // Importado só agora: o módulo lê a variável de ambiente na chamada, e ela
  // precisa já estar carregada.
  const { gerarImagem, MODELO_IMAGEM } = await import("../lib/gemini.js");

  const { ids, variacoes, todas, forcar } = argumentos(process.argv.slice(2));
  const conhecidos = Object.keys(PROMPTS);

  let alvos = todas ? conhecidos : ids;
  if (!alvos.length) {
    console.error("Diga quais templates, ou use --todas.\n");
    console.error("Disponíveis:\n  " + conhecidos.join("\n  "));
    process.exit(1);
  }

  const desconhecidos = alvos.filter((id) => !PROMPTS[id]);
  if (desconhecidos.length) {
    console.error(`Sem prompt para: ${desconhecidos.join(", ")}`);
    process.exit(1);
  }

  if (!forcar) {
    const jaTem = alvos.filter((id) => existsSync(join(DESTINO, `${id}.png`)));
    if (jaTem.length) {
      console.log(`Pulando (já têm capa): ${jaTem.join(", ")}. Use --forcar pra refazer.`);
      alvos = alvos.filter((id) => !jaTem.includes(id));
    }
  }

  if (!alvos.length) {
    console.log("Nada a gerar.");
    return;
  }

  mkdirSync(DESTINO, { recursive: true });

  const total = alvos.length * variacoes;
  console.log(`Modelo: ${MODELO_IMAGEM}`);
  console.log(`${alvos.length} template(s) x ${variacoes} variação(ões) = ${total} imagens.`);
  console.log(`Destino: public/templates/\n`);

  let feitas = 0;
  let falhas = 0;

  for (const id of alvos) {
    for (let n = 1; n <= variacoes; n++) {
      const rotulo = `${id}-${n}`;
      process.stdout.write(`  ${rotulo} ... `);
      try {
        const { dados, midia } = await gerarImagem({ prompt: promptDe(id) });
        const extensao = midia.includes("jpeg") ? "jpg" : "png";
        const arquivo = join(DESTINO, `${rotulo}.${extensao}`);
        writeFileSync(arquivo, Buffer.from(dados, "base64"));
        const kb = Math.round(Buffer.from(dados, "base64").length / 1024);
        console.log(`ok (${kb} KB)`);
        feitas++;
      } catch (erro) {
        console.log(`FALHOU — ${erro.message?.slice(0, 120)}`);
        falhas++;
      }
      // Um respiro entre chamadas: o modelo de imagem tem limite por minuto, e
      // disparar em rajada é o jeito mais rápido de tomar 429.
      await espera(2000);
    }
  }

  console.log(`\n${feitas} imagem(ns) gerada(s), ${falhas} falha(s).`);
  if (feitas) {
    console.log("Escolha a melhor de cada e renomeie para <id>.png (sem o -1, -2).");
  }
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
