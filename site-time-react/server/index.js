// Backend de desenvolvimento (Node nativo, sem dependências).
// Lê AZURE_DEVOPS_PAT do .env, consulta o Azure DevOps e expõe /api/velocity.
// O PAT nunca é enviado ao frontend — só os dados agregados.

import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { obterVelocity } from "./azure.js";
import { listarReviews, extrairReview } from "./reviews.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8787;

// --- carrega o .env (parser simples, sem dependência) ---
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

const PAT = process.env.AZURE_DEVOPS_PAT;

// cache simples em memória (evita martelar a API a cada refresh)
let cache = { data: null, ts: 0 };
const TTL = 60_000; // 1 min

// cache do último review extraído (extração de PPTX é custosa)
let reviewCache = { arquivo: null, data: null, ts: 0 };
const REVIEW_TTL = 10 * 60_000; // 10 min

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
  });
  res.end(payload);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/health") {
    return json(res, 200, {
      ok: true,
      temPat: Boolean(PAT),
      temPastaReviews: Boolean(process.env.REVIEW_PPTX_DIR),
    });
  }

  if (url.pathname === "/api/velocity") {
    if (!PAT) {
      return json(res, 500, {
        erro: "AZURE_DEVOPS_PAT não configurado no .env do servidor.",
      });
    }
    const n = Number(url.searchParams.get("n")) || 5;
    const alvo = url.searchParams.get("alvo") || null; // ex.: "Iteration 106"
    const refresh = url.searchParams.get("refresh") === "1";
    const agora = Date.now();
    if (!refresh && cache.data && agora - cache.ts < TTL && cache.n === n && cache.alvo === alvo) {
      return json(res, 200, { ...cache.data, cache: true });
    }
    try {
      const data = await obterVelocity(PAT, n, alvo);
      cache = { data, ts: agora, n, alvo };
      return json(res, 200, { ...data, cache: false });
    } catch (e) {
      const status = e.status === 401 ? 401 : 502;
      return json(res, status, {
        erro: "Falha ao consultar o Azure DevOps.",
        detalhe: String(e.message || e).slice(0, 300),
      });
    }
  }

  // ---- Reviews (PPTX da pasta sincronizada) ----
  if (url.pathname === "/api/reviews") {
    try {
      const lista = listarReviews();
      return json(res, 200, { reviews: lista });
    } catch (e) {
      return json(res, e.status || 500, {
        erro: "Falha ao listar os reviews.",
        detalhe: String(e.message || e).slice(0, 300),
      });
    }
  }

  if (url.pathname === "/api/review") {
    const arquivo = url.searchParams.get("arquivo");
    if (!arquivo) {
      return json(res, 400, { erro: "Informe ?arquivo=<nome.pptx>." });
    }
    const refresh = url.searchParams.get("refresh") === "1";
    const agora = Date.now();
    if (
      !refresh &&
      reviewCache.arquivo === arquivo &&
      reviewCache.data &&
      agora - reviewCache.ts < REVIEW_TTL
    ) {
      return json(res, 200, { ...reviewCache.data, cache: true });
    }
    try {
      const data = extrairReview(arquivo);
      reviewCache = { arquivo, data, ts: agora };
      return json(res, 200, { ...data, cache: false });
    } catch (e) {
      return json(res, e.status || 502, {
        erro: "Falha ao extrair o review.",
        detalhe: String(e.message || e).slice(0, 300),
      });
    }
  }

  json(res, 404, { erro: "rota não encontrada" });
});

server.listen(PORT, () => {
  console.log(`[backend] API em http://localhost:${PORT}  (PAT: ${PAT ? "ok" : "AUSENTE"})`);
});
