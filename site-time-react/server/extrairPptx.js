// =====================================================================
// Módulo de extração de PPTX (reutilizável por backend e CLI).
//
// Responsável por abrir o .pptx (que é um ZIP), extrair o TEXTO de cada
// slide, decodificar GRÁFICOS nativos, mapear IMAGENS e detectar slides
// ocultos. NÃO escreve em disco de saída — isso fica a cargo de quem chama
// (o CLI copia prints, o backend copia para a pasta pública).
//
// Sem dependências externas. Requer Node 18+ e, p/ descompactar, o utilitário
// `tar` (nativo no Windows 10+/Linux/macOS) ou `Expand-Archive` (PowerShell).
// =====================================================================

import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  existsSync,
  copyFileSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, basename } from "node:path";

// ---------- descompacta ----------
export function descompactar(pptx) {
  const dir = mkdtempSync(join(tmpdir(), "pptx-"));
  // tenta tar (bsdtar), presente no Windows 10+ e unix
  try {
    execFileSync("tar", ["-xf", pptx, "-C", dir], { stdio: "ignore" });
    if (existsSync(join(dir, "ppt"))) return dir;
  } catch {
    /* tenta PowerShell */
  }
  try {
    const zip = join(dir, "pkg.zip");
    copyFileSync(pptx, zip);
    execFileSync(
      "powershell",
      ["-NoProfile", "-Command", `Expand-Archive -Path "${zip}" -DestinationPath "${dir}" -Force`],
      { stdio: "ignore" }
    );
    return dir;
  } catch (e) {
    throw new Error("Falha ao descompactar o PPTX: " + e.message);
  }
}

// ---------- helpers de XML (regex simples, suficiente p/ OOXML) ----------
export function lerArquivo(p) {
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

// decodifica entidades XML básicas
export function unescapeXml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));
}

// junta os runs <a:t>...</a:t>, agrupando por parágrafo <a:p>
export function textoDoSlide(xml) {
  const paras = [];
  const pRe = /<a:p\b[\s\S]*?<\/a:p>/g;
  let mp;
  while ((mp = pRe.exec(xml))) {
    const runs = [...mp[0].matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((m) => unescapeXml(m[1]));
    const linha = runs.join("").trim();
    if (linha) paras.push(linha);
  }
  return paras;
}

export function slideOculto(xml) {
  return /<p:sld\b[^>]*\bshow="0"/.test(xml);
}

// ---------- charts ----------
export function lerChart(xml) {
  const tipoMatch = xml.match(/<c:(barChart|lineChart|pieChart|doughnutChart|areaChart)/);
  const tipo = tipoMatch ? tipoMatch[1] : "desconhecido";

  // pega só as séries "visíveis": <c:ser> que NÃO estão dentro de filteredBarSeries
  const semFiltradas = xml.replace(/<c15:filteredBarSeries[\s\S]*?<\/c15:filteredBarSeries>/g, "");

  const series = [];
  const serRe = /<c:ser>([\s\S]*?)<\/c:ser>/g;
  let ms;
  while ((ms = serRe.exec(semFiltradas))) {
    const bloco = ms[1];
    const nome =
      (bloco.match(/<c:tx>[\s\S]*?<c:v>([\s\S]*?)<\/c:v>/) || [])[1] || "(sem nome)";

    // categorias (eixo X)
    const catBloco = (bloco.match(/<c:cat>([\s\S]*?)<\/c:cat>/) || [])[1] || "";
    const categorias = [...catBloco.matchAll(/<c:pt[^>]*>\s*<c:v>([\s\S]*?)<\/c:v>/g)].map((m) =>
      unescapeXml(m[1])
    );

    // valores — preserva o idx p/ detectar lacunas (N/A = null)
    const valBloco = (bloco.match(/<c:val>([\s\S]*?)<\/c:val>/) || [])[1] || "";
    const ptCount = Number((valBloco.match(/<c:ptCount val="(\d+)"/) || [])[1] || 0);
    const pts = {};
    for (const m of valBloco.matchAll(/<c:pt idx="(\d+)"[^>]*>\s*<c:v>([\s\S]*?)<\/c:v>/g)) {
      pts[Number(m[1])] = Number(m[2]);
    }
    const n = ptCount || categorias.length;
    const valores = [];
    for (let i = 0; i < n; i++) valores.push(i in pts ? pts[i] : null); // null = N/A

    series.push({ nome: unescapeXml(nome), categorias, valores });
  }
  return { tipo, series };
}

// ---------- rels (imagens por slide) ----------
export function imagensDoSlide(dir, slideFile) {
  const rels = lerArquivo(join(dir, "ppt", "slides", "_rels", slideFile + ".rels"));
  const imgs = [];
  for (const m of rels.matchAll(/Target="([^"]*media\/[^"]+)"/g)) {
    imgs.push(basename(m[1]));
  }
  const charts = [...rels.matchAll(/Target="[^"]*charts\/(chart\d+\.xml)"/g)].map((m) => m[1]);
  return { imgs, charts };
}

// ---------- extração principal (sem escrita de saída) ----------
// Retorna { dir, media, slides: [...] }. `dir` é o diretório temporário
// descompactado; quem chama decide o que copiar de `media` (prints).
export function extrair(pptxPath) {
  const dir = descompactar(pptxPath);
  const slidesDir = join(dir, "ppt", "slides");
  const mediaDir = join(dir, "ppt", "media");

  const slideFiles = readdirSync(slidesDir)
    .filter((f) => /^slide\d+\.xml$/.test(f))
    .sort((a, b) => parseInt(a.replace(/\D/g, "")) - parseInt(b.replace(/\D/g, "")));

  const slides = [];
  for (let i = 0; i < slideFiles.length; i++) {
    const file = slideFiles[i];
    const xml = lerArquivo(join(slidesDir, file));
    const { imgs, charts } = imagensDoSlide(dir, file);

    // print principal = maior imagem do slide
    let printPrincipal = null;
    if (imgs.length) {
      const comTam = imgs
        .map((n) => ({
          n,
          size: existsSync(join(mediaDir, n)) ? statSync(join(mediaDir, n)).size : 0,
        }))
        .sort((a, b) => b.size - a.size);
      printPrincipal = comTam[0].n;
    }

    const graficos = charts.map((c) => ({
      arquivo: c,
      ...lerChart(lerArquivo(join(dir, "ppt", "charts", c))),
    }));

    slides.push({
      numero: i + 1,
      arquivo: file,
      oculto: slideOculto(xml),
      texto: textoDoSlide(xml),
      imagens: imgs,
      printPrincipal,
      graficos,
    });
  }

  return { dir, mediaDir, slides };
}
