// =====================================================================
// Camada de "reviews": lista os PPTX da pasta sincronizada (OneDrive) e
// extrai um review específico, classificando cada slide nos TIPOS que o
// site já sabe renderizar (capa, secao, equipe, incremento, imagem,
// destaque, qualidade, insights, comparativo-bugs, produtividade, texto).
//
// A extração crua vem de ./extrairPptx.js. Aqui fazemos a ponte cru -> bonito
// por heurística (ver classificarSlide) e copiamos os prints para a pasta
// pública, para o frontend conseguir exibi-los por URL.
// =====================================================================

import {
  readdirSync,
  existsSync,
  statSync,
  mkdirSync,
  copyFileSync,
  rmSync,
} from "node:fs";
import { join, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { extrair } from "./extrairPptx.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// pasta pública do Vite onde os prints ficam acessíveis por URL /slides-auto/...
const PUBLIC_DIR = join(__dirname, "..", "public", "slides-auto");

// ---------- utilidades ----------

// slug seguro para nome de pasta/URL a partir do nome do arquivo
export function slugify(nome) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // tira acentos
    .replace(/\.pptx$/i, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

// pasta configurada no .env
function pastaReviews() {
  const dir = process.env.REVIEW_PPTX_DIR;
  if (!dir) {
    const e = new Error("REVIEW_PPTX_DIR não configurado no .env.");
    e.status = 500;
    throw e;
  }
  if (!existsSync(dir)) {
    const e = new Error("Pasta REVIEW_PPTX_DIR não encontrada: " + dir);
    e.status = 500;
    throw e;
  }
  return dir;
}

// ---------- listagem ----------
export function listarReviews() {
  const dir = pastaReviews();
  return readdirSync(dir)
    .filter((f) => /\.pptx$/i.test(f) && !f.startsWith("~$"))
    .map((f) => {
      const full = join(dir, f);
      const st = statSync(full);
      return {
        arquivo: f,
        slug: slugify(f),
        tamanho: st.size,
        modificadoEm: st.mtime.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.modificadoEm) - new Date(a.modificadoEm));
}

// ---------- classificação cru -> tipo do site ----------

const RE_REF = /^#\s*[\d;#\s]+.*?:/; // "#105102:" ou "#115535; #118626: ..."
const RE_DEV = /^Dev:\s*(.+)$/i;
const RE_AMB = /^AMBIENTE:\s*(.+)$/i;

// remove linhas de template não preenchido
function ehTemplate(texto) {
  return texto.some((t) => /Título Exemplo do Incremento|Insira aqui/i.test(t));
}

// tenta achar "Sprint NNN (período)" numa linha
function parseSprint(linha) {
  const m = linha.match(/Sprint\s+(\d+)\s*\(([^)]+)\)/i);
  if (m) return { sprint: `Sprint ${m[1]}`, periodo: m[2].trim() };
  const m2 = linha.match(/Sprint\s+(\d+)/i);
  if (m2) return { sprint: `Sprint ${m2[1]}`, periodo: "" };
  return null;
}

// uma "linha" é valor numérico (int, %, decimal com vírgula) ou traço "-"
function ehValor(t) {
  return /^-$/.test(t) || /^\d+[.,]?\d*%?$/.test(t);
}

// Reconstrói a tabela de Indicadores de Qualidade a partir das linhas cruas.
// Formato esperado no PPTX (linha a linha):
//   Indicador, Sprint A, Sprint B, Sprint C,
//   <nome indicador>, <valor>, [nota], <valor>, [nota], <valor>, [nota], ...
//   TOTAL DE ... , <valor>, <legenda>, ...
// Retorna { sprints, linhas:[{indicador,valores,notas}], totais, percRetestes }
// ou null se o padrão não bater.
function parseQualidade(txt) {
  const i0 = txt.findIndex((t) => /^indicador$/i.test(t));
  if (i0 < 0) return null;

  // cabeçalho: as sprints vêm logo após "Indicador"
  const sprints = [];
  let i = i0 + 1;
  while (i < txt.length && /^sprint\s+\d+$/i.test(txt[i])) {
    sprints.push(txt[i]);
    i++;
  }
  if (sprints.length === 0) return null;
  const nSp = sprints.length;

  const INDICADORES = ["Testes iniciais", "Retestes", "Bugs", "Pontos"];

  // marca o fim da tabela principal (início da seção de totais)
  const ehInicioTotais = (t) => /^total de/i.test(t) || /^execuções totais/i.test(t);

  const linhas = [];

  // varre indicadores conhecidos
  while (i < txt.length && !ehInicioTotais(txt[i])) {
    const nome = INDICADORES.find((ind) => txt[i].toLowerCase().startsWith(ind.toLowerCase()));
    if (!nome) {
      i++;
      continue;
    }
    i++;
    // coleta todos os tokens até o próximo indicador / início dos totais
    const bloco = [];
    while (
      i < txt.length &&
      !ehInicioTotais(txt[i]) &&
      !INDICADORES.some((ind) => txt[i].toLowerCase().startsWith(ind.toLowerCase()))
    ) {
      bloco.push(txt[i++]);
    }
    // dentro do bloco: cada VALOR puro (número ou "-") abre uma sprint;
    // tokens de texto seguintes são notas daquela sprint (podem ser várias).
    // Um VALOR é sempre um número puro. O "-" NÃO é valor: representa uma
    // célula de nota vazia (sem anotação), então é ignorado. Tokens de texto
    // são notas da sprint (valor) corrente.
    const ehNumero = (t) => /^\d+[.,]?\d*%?$/.test(t);
    const valores = [];
    const notas = [];
    for (const tk of bloco) {
      if (ehNumero(tk)) {
        valores.push(Number(tk.replace("%", "").replace(",", ".")));
        notas.push("");
      } else if (/^-$/.test(tk)) {
        // célula de nota vazia: ignora (não é valor nem nota)
        continue;
      } else if (valores.length > 0) {
        notas[notas.length - 1] = [notas[notas.length - 1], tk].filter(Boolean).join(" · ");
      }
    }
    // garante exatamente nSp colunas (completa com null se faltar)
    while (valores.length < nSp) {
      valores.push(null);
      notas.push("");
    }
    linhas.push({ indicador: nome, valores: valores.slice(0, nSp), notas: notas.slice(0, nSp) });
  }
  if (linhas.length === 0) return null;

  // totais: "TOTAL DE X" seguido de valor (e uma legenda tipo "soma das sprints")
  const totais = [];
  for (let k = i; k < txt.length; k++) {
    if (/^total de/i.test(txt[k]) && k + 1 < txt.length && ehValor(txt[k + 1])) {
      totais.push({ rotulo: txt[k], valor: Number(txt[k + 1]) || txt[k + 1] });
    }
  }

  // % de retestes por sprint (pares "Sprint NNN", "0,NN%")
  const percRetestes = [];
  for (let k = 0; k < txt.length - 1; k++) {
    if (/^sprint\s+\d+$/i.test(txt[k]) && /^\d+[.,]\d+%$/.test(txt[k + 1])) {
      percRetestes.push(Number(txt[k + 1].replace("%", "").replace(",", ".")));
    }
  }

  return { sprints, linhas, totais, percRetestes };
}

// Reconstrói a performance por sprint do slide de Produtividade.
// Padrão: "XX% do Estimado", "YY% do Assumido", "Review NNN" (em qualquer ordem,
// agrupados de 3 em 3). Retorna { performance:[{iter, estimado, assumido}], formulas:[...] }.
function parseProdutividade(txt) {
  const formulas = txt.filter((t) => /%\s*(Estimado|Assumido)\s*=/.test(t));
  const performance = [];
  let estimado = null;
  let assumido = null;
  for (const t of txt) {
    let m;
    if ((m = t.match(/^(\d+)%\s*do\s*estimado$/i))) estimado = Number(m[1]);
    else if ((m = t.match(/^(\d+)%\s*do\s*assumido$/i))) assumido = Number(m[1]);
    else if ((m = t.match(/^review\s+(\d+)$/i))) {
      performance.push({ iter: `Review ${m[1]}`, estimado, assumido });
      estimado = null;
      assumido = null;
    }
  }
  if (performance.length === 0) return null;
  // mais recente primeiro no PPTX -> ordena por número crescente
  performance.sort((a, b) => parseInt(a.iter.replace(/\D/g, "")) - parseInt(b.iter.replace(/\D/g, "")));
  return { performance, formulas };
}

// nomes de seções/divisórias conhecidas (texto curto isolado)
const SECOES = [
  "A Equipe",
  "Fique por dentro",
  "Voz do Time",
  "Qualidade",
  "Produtividade",
  "PI Planning",
];

function classificarSlide(slide, printUrl) {
  const txt = slide.texto;
  const t0 = txt[0] || "";

  // ENCERRAMENTO
  if (/^obrigad/i.test(t0)) {
    return { tipo: "destaque", valor: t0, legenda: txt[1] || "" };
  }

  // CAPA: primeiro slide, começa com "Review"
  if (slide.numero === 1 && /review/i.test(t0)) {
    const sp = txt.map(parseSprint).find(Boolean) || {};
    return {
      tipo: "capa",
      titulo: "Review",
      subtitulo: "Squad Beta",
      sprint: sp.sprint || "",
      periodo: sp.periodo || "",
    };
  }

  // EQUIPE: muitos nomes + cargos. Heurística: muitas linhas curtas e
  // presença de cargos típicos.
  const temCargos = txt.filter((t) =>
    /(Dev|Desenvolvedor|QA|Tech Lead|Designer|Coordenador|Gerente|Arquiteto|Especialista|Produto|N2)/i.test(t)
  ).length;
  if (temCargos >= 6 && txt.length >= 12) {
    return { tipo: "equipe" };
  }

  // INCREMENTO: tem #ref no título e/ou Dev:/AMBIENTE:
  const linhaRef = txt.find((t) => RE_REF.test(t));
  const linhaDev = txt.find((t) => RE_DEV.test(t));
  const linhaAmb = txt.find((t) => RE_AMB.test(t));
  if ((linhaRef || linhaDev) && !ehTemplate(txt)) {
    const ref = linhaRef ? (linhaRef.match(/^(#[^:]+):/) || [])[1] || "" : "";
    const titulo = linhaRef ? linhaRef.replace(/^#[^:]+:\s*/, "").trim() : t0;
    const dev = linhaDev ? (linhaDev.match(RE_DEV) || [])[1]?.trim() || "" : "";
    const ambiente = linhaAmb ? (linhaAmb.match(RE_AMB) || [])[1]?.trim() || "" : "";
    // descrição = linhas que não são ref/dev/ambiente/título
    const descricao = txt
      .filter(
        (t) =>
          t !== linhaRef &&
          t !== linhaDev &&
          t !== linhaAmb &&
          t !== titulo &&
          !RE_REF.test(t)
      )
      .join(" ")
      .trim();
    return {
      tipo: "incremento",
      ref,
      titulo,
      descricao,
      dev,
      ambiente,
      imagem: printUrl || null,
    };
  }

  // QUALIDADE: tabela de indicadores. Tenta reconstruir a tabela estruturada
  // (mesmo formato do slide curado); se falhar, usa print ou texto.
  if (/indicadores de qualidade/i.test(t0)) {
    const q = parseQualidade(txt);
    if (q) {
      return { tipo: "qualidade", titulo: t0, ...q };
    }
    if (printUrl) {
      return { tipo: "imagem", titulo: t0, imagem: printUrl, legenda: "Indicadores de Qualidade", contain: true };
    }
    return { tipo: "texto", titulo: t0, paragrafos: txt.slice(1), imagem: null };
  }

  // BUGS POR CATEGORIA / COMPARATIVO: têm gráfico nativo (sem print).
  // Preserva o gráfico decodificado em `graficos` para o front plotar.
  if (slide.graficos.length && /bugs por categoria/i.test(t0)) {
    return { tipo: "grafico", titulo: t0, legenda: "Bugs por categoria", graficos: slide.graficos, texto: txt.slice(1) };
  }
  if (slide.graficos.length && /comparativo de bugs/i.test(t0)) {
    return { tipo: "grafico", titulo: t0, legenda: "Comparativo de Bugs entre Sprints", graficos: slide.graficos, texto: txt.slice(1) };
  }

  // SEÇÃO / DIVISÓRIA: texto curto, bate com a lista conhecida OU poucas linhas
  const ehSecaoConhecida = SECOES.some((s) => t0.toLowerCase().startsWith(s.toLowerCase()));
  if (ehSecaoConhecida && txt.length <= 3) {
    const subtitulo = txt[1] && txt[1] !== t0 ? txt[1] : undefined;
    return { tipo: "secao", titulo: t0, subtitulo };
  }

  // DESTAQUE (CSAT etc.): um número percentual grande + legenda
  const temPercentGrande = txt.some((t) => /^\d+[.,]\d+%$/.test(t));
  if (temPercentGrande && txt.length <= 6) {
    const valor = txt.find((t) => /^\d+[.,]\d+%$/.test(t)) || "";
    const delta = txt.find((t) => /^[+-]?\d+[.,]\d+pp$/.test(t)) || "";
    const emoji = txt.find((t) => /\p{Emoji}/u.test(t)) || "";
    const sobretitulo = txt.find((t) => !/%|pp/.test(t) && t !== emoji) || "";
    return { tipo: "destaque", sobretitulo, valor, delta, emoji, legenda: sobretitulo };
  }

  // PRODUTIVIDADE: fórmulas de % Estimado/Assumido + performance por sprint
  if (/%\s*(Estimado|Assumido)\s*=|Performance de Entregas/i.test(txt.join(" "))) {
    const p = parseProdutividade(txt);
    if (p) {
      return { tipo: "produtividade-auto", titulo: "Performance de Entregas da Squad", ...p, imagem: printUrl };
    }
  }

  // IMAGEM: tem print e título curto (ex.: "Evolução do IQ", "De olho no usuário")
  if (printUrl && txt.length <= 4) {
    return {
      tipo: "imagem",
      titulo: t0 || "",
      imagem: printUrl,
      legenda: txt.slice(1).join(" "),
      contain: true,
    };
  }

  // FALLBACK genérico: título + texto (+ print se houver)
  return {
    tipo: "texto",
    titulo: t0 || `Slide ${slide.numero}`,
    paragrafos: txt.slice(1),
    imagem: printUrl || null,
  };
}

// ---------- extração de um review ----------
export function extrairReview(arquivo) {
  const dir = pastaReviews();
  // evita path traversal: só aceita um nome de arquivo simples
  const nome = basename(arquivo);
  const full = join(dir, nome);
  if (!/\.pptx$/i.test(nome) || !existsSync(full)) {
    const e = new Error("Arquivo de review não encontrado: " + nome);
    e.status = 404;
    throw e;
  }

  const slug = slugify(nome);
  const { dir: tmpDir, mediaDir, slides } = extrair(full);

  // prepara a pasta pública de prints deste review (recria do zero)
  const destDir = join(PUBLIC_DIR, slug);
  rmSync(destDir, { recursive: true, force: true });
  mkdirSync(destDir, { recursive: true });

  // copia os prints e classifica
  const slidesClassificados = [];
  for (const s of slides) {
    if (s.oculto) continue; // respeita slides ocultos do PPTX

    let printUrl = null;
    if (s.printPrincipal && existsSync(join(mediaDir, s.printPrincipal))) {
      const ext = extname(s.printPrincipal) || ".png";
      const destNome = `slide${s.numero}${ext}`;
      copyFileSync(join(mediaDir, s.printPrincipal), join(destDir, destNome));
      printUrl = `/slides-auto/${slug}/${destNome}`;
    }

    const classificado = classificarSlide(s, printUrl);
    slidesClassificados.push({
      id: `s${s.numero}`,
      numeroOriginal: s.numero,
      ...classificado,
    });
  }

  // limpa a pasta temporária da extração (raiz descompactada)
  rmSync(tmpDir, { recursive: true, force: true });

  return {
    arquivo: nome,
    slug,
    geradoEm: new Date().toISOString(),
    total: slidesClassificados.length,
    slides: slidesClassificados,
  };
}
