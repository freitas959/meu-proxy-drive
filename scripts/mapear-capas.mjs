#!/usr/bin/env node
//
// Varre public/templates/ e escreve lib/capas.js com o que encontrou.
//
//   npm run capas:mapear
//
// Rode depois de escolher e renomear as imagens. Só entra arquivo cujo nome
// seja exatamente o id de um template — `pizzaria.png` entra, `pizzaria-1.png`
// não, porque as numeradas são as variações que você ainda vai descartar.

import { readdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const PASTA = join(RAIZ, "public", "templates");
const SAIDA = join(RAIZ, "lib", "capas.js");

const EXTENSOES = new Set([".png", ".jpg", ".jpeg", ".webp"]);

/**
 * Lê os ids direto do texto do catálogo. Importar o módulo seria mais elegante,
 * mas ele acabaria puxando `lib/capas.js` — o arquivo que este script escreve.
 */
function idsConhecidos() {
  const texto = readFileSync(join(RAIZ, "lib", "templates.js"), "utf8");
  return new Set([...texto.matchAll(/^\s{4}id: "([^"]+)"/gm)].map((m) => m[1]));
}

function main() {
  if (!existsSync(PASTA)) {
    console.error("public/templates/ não existe.");
    process.exit(1);
  }

  const ids = idsConhecidos();
  const achados = {};
  const ignorados = [];

  for (const arquivo of readdirSync(PASTA)) {
    const ext = extname(arquivo).toLowerCase();
    if (!EXTENSOES.has(ext)) continue;

    const id = basename(arquivo, ext);
    if (ids.has(id)) achados[id] = `/templates/${arquivo}`;
    else ignorados.push(arquivo);
  }

  const linhas = Object.keys(achados)
    .sort()
    .map((id) => `  "${id}": "${achados[id]}",`)
    .join("\n");

  writeFileSync(
    SAIDA,
    `// Capas presentes em public/templates/, mapeadas por id de template.
//
// GERADO por \`npm run capas:mapear\` — não edite à mão.
//
// Existe para o app saber quais capas existem sem precisar tentar carregar um
// arquivo que talvez não esteja lá: um \`capaUrl\` chutado para todo template
// encheria o console de 404 na primeira visita à vitrine.

export const CAPAS = {${linhas ? `\n${linhas}\n` : ""}};
`
  );

  const total = Object.keys(achados).length;
  console.log(`${total} capa(s) mapeada(s):`);
  for (const id of Object.keys(achados).sort()) console.log(`  ${id}`);

  if (ignorados.length) {
    console.log(`\nIgnorados (nome não é o id de um template):`);
    for (const a of ignorados.sort()) console.log(`  ${a}`);
    console.log(`\nAs variações numeradas ficam aqui até você escolher uma e renomear.`);
  }
}

main();
