// Estilo por PAPEL do card, não por posição.
//
// O roteiro já marca cada card como hook, conteudo ou cta — é o mesmo dado que
// a IA devolve. Amarrar o visual a isso resolve o problema de "quantos cards
// vão existir": três ou dez, o primeiro é capa, o último é CTA, o miolo é
// conteúdo.
//
// Cada cor de um papel pode ser:
//   ""            herda o comportamento padrão do template
//   "@fundo"      referência à paleta escolhida pelo cliente
//   "@texto"      idem
//   "@secundaria" idem
//   "@botoes"     idem (é a cor de marca do cliente)
//   "@contraste"  preto ou branco, escolhido pelo brilho do fundo já resolvido
//   "#rrggbb"     valor fixo, quando o template não quer que aquilo mude
//
// É a referência que faz um template servir para vários nichos: o card de CTA
// guarda "@botoes", não dourado. No advogado sai dourado, no nutricionista
// sai verde.

export const PAPEIS = [
  { id: "capa", nome: "Capa", nota: "O primeiro card. Costuma levar a foto." },
  { id: "conteudo", nome: "Conteúdo", nota: "Todos os cards do meio." },
  { id: "cta", nome: "CTA", nota: "O último card, o do convite." },
];

export const REFERENCIAS = [
  { id: "", nome: "Padrão do template" },
  { id: "@fundo", nome: "Fundo do cliente" },
  { id: "@texto", nome: "Texto do cliente" },
  { id: "@botoes", nome: "Acento do cliente" },
  { id: "@secundaria", nome: "Apoio do cliente" },
  { id: "@contraste", nome: "Contraste automático" },
  { id: "#", nome: "Cor fixa" },
];

export const CORES_DO_PAPEL = [
  { chave: "fundo", nome: "Fundo" },
  { chave: "titulo", nome: "Título" },
  { chave: "corpo", nome: "Corpo" },
  { chave: "acento", nome: "Acento" },
];

/** Preto ou branco conforme o brilho do fundo. Espelha o `contraste` do render. */
function contrasteDe(hex) {
  if (typeof hex !== "string" || !hex.startsWith("#")) return "#111111";
  const c = hex.replace("#", "");
  const n = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return "#111111";
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#111111" : "#ffffff";
}

/**
 * Resolve um valor do estilo. `fundoResolvido` só é usado por "@contraste",
 * e por isso o fundo é sempre resolvido primeiro.
 */
function resolver(valor, paleta, padrao, fundoResolvido) {
  if (!valor) return padrao;
  if (valor === "@contraste") return contrasteDe(fundoResolvido || paleta.fundo);
  if (valor.startsWith("@")) return paleta[valor.slice(1)] || padrao;
  if (valor.startsWith("#")) return valor;
  return padrao;
}

/** Qual papel este card ocupa. A capa ganha da marcação do roteiro. */
export function papelDoCard(card, ehCapa) {
  if (ehCapa) return "capa";
  if (card?.tipo === "cta") return "cta";
  return "conteudo";
}

function temAlgo(estilo) {
  if (!estilo) return false;
  return (
    Boolean(estilo.fundo || estilo.titulo || estilo.corpo || estilo.acento) ||
    Boolean(estilo.fontes?.titulo || estilo.fontes?.corpo)
  );
}

/**
 * Devolve a paleta e as fontes efetivas do card. Quando o template não define
 * estilo para aquele papel, devolve exatamente o que entrou — é isso que
 * mantém os 19 templates do código desenhando igual.
 */
export function aplicarEstilo({ template, paleta, fontes, card, ehCapa }) {
  const estilo = template?.estilos?.[papelDoCard(card, ehCapa)];
  if (!temAlgo(estilo)) return { paleta, fontes };

  const fundo = resolver(estilo.fundo, paleta, paleta.fundo);
  const titulo = resolver(estilo.titulo, paleta, paleta.texto, fundo);
  const corpo = resolver(estilo.corpo, paleta, titulo, fundo);
  const acento = resolver(estilo.acento, paleta, paleta.botoes, fundo);

  return {
    paleta: {
      ...paleta,
      fundo,
      // `texto` continua existindo porque o rodapé, o selo e o botão o usam;
      // título e corpo ganham chaves próprias.
      texto: titulo,
      tituloCor: titulo,
      corpoCor: corpo,
      botoes: acento,
    },
    fontes: {
      titulo: estilo.fontes?.titulo || fontes.titulo,
      corpo: estilo.fontes?.corpo || fontes.corpo,
    },
  };
}

/** Todas as famílias que o template pode pedir, para pré-carregar as webfonts. */
export function familiasDoTemplate(template, fontes) {
  const lista = [fontes?.titulo, fontes?.corpo];
  for (const papel of PAPEIS) {
    const f = template?.estilos?.[papel.id]?.fontes;
    if (f?.titulo) lista.push(f.titulo);
    if (f?.corpo) lista.push(f.corpo);
  }
  return lista.filter(Boolean);
}

/** Estilo em branco, para o estúdio começar de algum lugar. */
export function estiloVazio() {
  return { fundo: "", titulo: "", corpo: "", acento: "", fontes: { titulo: "", corpo: "" } };
}
