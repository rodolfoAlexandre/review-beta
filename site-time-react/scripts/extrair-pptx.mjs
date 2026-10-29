#!/usr/bin/env node
// =====================================================================
// CLI de extração de PPTX para o padrão da apresentação Squad Beta.
//
// A lógica de parse mora em ../server/extrairPptx.js (reutilizada pelo
// backend). Este CLI só resolve o arquivo de entrada, chama o extrator e
// grava as saídas em disco (JSON + TXT + prints).
//
// Uso:
//   node scripts/extrair-pptx.mjs ["C:\\caminho\\Review.pptx"] [pastaSaida]
//
//   - Com caminho explícito: usa o arquivo informado.
//   - SEM caminho: lê REVIEW_PPTX_DIR do .env e pega o .pptx MAIS RECENTE
//     daquela pasta (fluxo quinzenal — o review novo é encontrado sozinho).
// =====================================================================

import { mkdirSync, readFileSync, readdirSync, existsSync, copyFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { extrair } from "../server/extrairPptx.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------- carrega o .env (parser simples, sem dependência) ----------
function carregarEnv() {
  try {
    const txt = readFileSync(join(__dirname, "..", ".env"), "utf8");
    for (const linha of txt.split(/\r?\n/)) {
      const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // sem .env: segue com variáveis de ambiente do processo
  }
}
carregarEnv();

// Retorna o caminho do .pptx mais recente dentro de uma pasta.
function pptxMaisRecente(pasta) {
  if (!existsSync(pasta)) {
    console.error("Pasta REVIEW_PPTX_DIR não encontrada:", pasta);
    process.exit(1);
  }
  const candidatos = readdirSync(pasta)
    .filter((f) => /\.pptx$/i.test(f) && !f.startsWith("~$"))
    .map((f) => {
      const full = join(pasta, f);
      return { full, mtime: statSync(full).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
  if (!candidatos.length) {
    console.error("Nenhum .pptx encontrado em:", pasta);
    process.exit(1);
  }
  return candidatos[0].full;
}

// ---------- args ----------
let pptxPath = process.argv[2];
const outDir = process.argv[3] || join(process.cwd(), "extraido");

if (!pptxPath) {
  const dirReview = process.env.REVIEW_PPTX_DIR;
  if (!dirReview) {
    console.error("Informe o caminho do .pptx ou defina REVIEW_PPTX_DIR no .env.");
    console.error("Uso: node scripts/extrair-pptx.mjs [<arquivo.pptx>] [pastaSaida]");
    process.exit(1);
  }
  pptxPath = pptxMaisRecente(dirReview);
  console.log("Usando o PPTX mais recente de REVIEW_PPTX_DIR:");
  console.log("  " + pptxPath);
}

if (!existsSync(pptxPath)) {
  console.error("Arquivo não encontrado:", pptxPath);
  process.exit(1);
}

// ---------- extrai (lógica compartilhada) ----------
const { mediaDir, slides } = extrair(pptxPath);

// ---------- grava saídas ----------
mkdirSync(outDir, { recursive: true });
const imgOut = join(outDir, "imagens");
mkdirSync(imgOut, { recursive: true });

for (const s of slides) {
  if (s.printPrincipal) {
    const ext = s.printPrincipal.split(".").pop();
    const destNome = `slide${s.numero}-print.${ext}`;
    copyFileSync(join(mediaDir, s.printPrincipal), join(imgOut, destNome));
    s.printSalvo = `imagens/${destNome}`;
  }
}

writeFileSync(join(outDir, "review-extraido.json"), JSON.stringify(slides, null, 2), "utf8");

const linhas = [];
for (const s of slides) {
  linhas.push(`===== SLIDE ${s.numero}${s.oculto ? " [OCULTO]" : ""} =====`);
  for (const t of s.texto) linhas.push("  " + t);
  if (s.printSalvo) linhas.push("  [print] " + s.printSalvo);
  for (const g of s.graficos) {
    linhas.push(`  [gráfico ${g.tipo}]`);
    for (const ser of g.series) {
      const pares = ser.categorias.map((c, k) => `${c}=${ser.valores[k] ?? "—"}`).join("  ");
      linhas.push(`    ${ser.nome}: ${pares}`);
    }
  }
  linhas.push("");
}
writeFileSync(join(outDir, "review-extraido.txt"), linhas.join("\n"), "utf8");

console.log(`OK — ${slides.length} slides extraídos.`);
console.log(`Saída: ${outDir}`);
console.log(`  review-extraido.json  (dados estruturados)`);
console.log(`  review-extraido.txt   (resumo legível)`);
console.log(`  imagens/              (prints principais por slide)`);
