import { TEAM } from "./data/team.js";

// As fotos são importadas como assets do bundle (ver src/data/team.js),
// então o Vite já versiona a URL com hash — não é preciso cache-bust manual.
export function fotoUrl(foto) {
  return foto;
}

export function initials(nome) {
  return nome
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// índice plano nome(normalizado) -> membro, montado uma vez a partir do TEAM
const _indiceDevs = (() => {
  const idx = new Map();
  for (const setor of TEAM) {
    for (const m of setor.membros) {
      idx.set(normalizarNome(m.nome), m);
    }
  }
  return idx;
})();

function normalizarNome(s) {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // sem acentos
    .trim()
    .toLowerCase();
}

// Resolve a foto de um dev pelo nome, tolerando variações:
//   "Túlio" -> Túlio ; "Daniel Ralfes" -> Daniel (casa pelo primeiro nome).
// Retorna { nome, cargo, foto } do membro, ou null se não encontrar.
export function membroPorNome(nome) {
  if (!nome) return null;
  const n = normalizarNome(nome);
  if (_indiceDevs.has(n)) return _indiceDevs.get(n);
  // tenta pelo primeiro nome (ex.: "Daniel Ralfes" -> "daniel")
  const primeiro = n.split(/\s+/)[0];
  if (_indiceDevs.has(primeiro)) return _indiceDevs.get(primeiro);
  // tenta por prefixo (algum membro cujo nome começa com o primeiro nome dado)
  for (const [chave, membro] of _indiceDevs) {
    if (chave.split(/\s+/)[0] === primeiro) return membro;
  }
  return null;
}

// Só a foto (ou null). Atalho conveniente.
export function fotoDoDev(nome) {
  return membroPorNome(nome)?.foto ?? null;
}
