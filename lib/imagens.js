"use client";

// As imagens dos cards vivem no IndexedDB, não no localStorage: uma capa em
// foto passa de 1 MB em data URL e estouraria a cota de 5 MB com dois ou três
// projetos. Aqui cabem centenas.

const BANCO = "carrosseia";
const DEPOSITO = "imagens";
const VERSAO = 1;

let promessaDb = null;

function abrir() {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  if (promessaDb) return promessaDb;

  promessaDb = new Promise((resolve) => {
    const req = indexedDB.open(BANCO, VERSAO);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DEPOSITO)) {
        db.createObjectStore(DEPOSITO);
      }
    };
    req.onsuccess = () => resolve(req.result);
    // Modo privado ou cota bloqueada: seguimos sem persistir imagens em vez de
    // derrubar o app.
    req.onerror = () => resolve(null);
  });

  return promessaDb;
}

function transacao(db, modo) {
  return db.transaction(DEPOSITO, modo).objectStore(DEPOSITO);
}

export async function salvarImagens(projetoId, imagens) {
  const db = await abrir();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const req = transacao(db, "readwrite").put(imagens, projetoId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function carregarImagens(projetoId) {
  const db = await abrir();
  if (!db) return {};
  return new Promise((resolve) => {
    try {
      const req = transacao(db, "readonly").get(projetoId);
      req.onsuccess = () => resolve(req.result || {});
      req.onerror = () => resolve({});
    } catch {
      resolve({});
    }
  });
}

export async function apagarImagens(projetoId) {
  const db = await abrir();
  if (!db) return;
  try {
    transacao(db, "readwrite").delete(projetoId);
  } catch {
    // nada a fazer: o projeto já saiu da lista de qualquer forma
  }
}
