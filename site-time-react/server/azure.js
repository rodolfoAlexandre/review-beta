// Acesso ao Azure DevOps via Analytics (OData) para montar a velocity da squad.
// Usa fetch nativo do Node 20+. O PAT vem de AZURE_DEVOPS_PAT (nunca exposto
// ao frontend). Sem dependências externas.
//
// Por que Analytics + AreaSK: a entidade WorkItems do Analytics, filtrada por
// IterationSK, traz itens de TODAS as squads que compartilham a iteração. O
// filtro por AreaSK (área do time) é o que reproduz o widget de velocity.

const ORG = "poliedro";
const PROJECT = "Tribo Inovação";
const TEAM = "Squad Beta - Pmais Redacao e Catlearning";
const AREA_NAME = "Squad Beta";

const REST_BASE = "https://poliedro.visualstudio.com";
const ANALYTICS = `https://analytics.dev.azure.com/${ORG}/${encodeURIComponent(PROJECT)}/_odata/v4.0-preview`;

const DONE_STATES = "'Completed'"; // StateCategory de itens concluídos

function authHeader(pat) {
  return `Basic ${Buffer.from(`:${pat}`).toString("base64")}`;
}
function enc(s) {
  return encodeURIComponent(s);
}

async function odata(pat, path) {
  const res = await fetch(`${ANALYTICS}/${path}`, {
    headers: { Authorization: authHeader(pat), Accept: "application/json" },
  });
  if (!res.ok) {
    const corpo = await res.text().catch(() => "");
    const err = new Error(`Analytics ${res.status} :: ${corpo.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function rest(pat, url) {
  const res = await fetch(url, {
    headers: { Authorization: authHeader(pat), Accept: "application/json" },
  });
  if (!res.ok) {
    const corpo = await res.text().catch(() => "");
    const err = new Error(`REST ${res.status} :: ${corpo.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// soma de StoryPoints para um filtro OData (retorna número)
async function somaSP(pat, filtro) {
  const path = `WorkItems?$apply=filter(${enc(filtro)})/aggregate(StoryPoints with sum as SP)`;
  const data = await odata(pat, path);
  return Number(data.value?.[0]?.SP ?? 0) || 0;
}

// AreaSK da Squad Beta (cacheado em memória do processo)
let _areaSK = null;
async function areaSK(pat) {
  if (_areaSK) return _areaSK;
  const data = await odata(
    pat,
    `Areas?$filter=AreaName eq '${AREA_NAME}'&$select=AreaSK,AreaName`
  );
  _areaSK = data.value?.[0]?.AreaSK ?? null;
  if (!_areaSK) throw new Error(`Área '${AREA_NAME}' não encontrada no Analytics`);
  return _areaSK;
}

// Iterações do time (REST — já respeita a atribuição ao time), ordenadas por data.
async function listarIteracoes(pat) {
  const url =
    `${REST_BASE}/${enc(PROJECT)}/${enc(TEAM)}` +
    `/_apis/work/teamsettings/iterations?api-version=7.0`;
  const data = await rest(pat, url);
  return (data.value || [])
    .map((it) => ({
      id: it.id,
      name: it.name,
      start: it.attributes?.startDate ?? null,
      finish: it.attributes?.finishDate ?? null,
      timeFrame: it.attributes?.timeFrame ?? null, // "past" | "current" | "future"
    }))
    .sort((a, b) => new Date(a.start || 0) - new Date(b.start || 0));
}

// datas em YYYY-MM-DD (UTC) para filtros do Analytics
function diaUTC(iso) {
  return new Date(iso).toISOString().slice(0, 10);
}

// velocity de uma iteração via Analytics
async function velocityDaIteracao(pat, area, iter) {
  const baseFiltro = `IterationSK eq ${iter.id} and AreaSK eq ${area} and StoryPoints ne null`;
  // o fim "oficial" vai até o dia seguinte 00:00Z para abarcar o último dia
  const fimExclusivo = new Date(iter.finish);
  fimExclusivo.setUTCDate(fimExclusivo.getUTCDate() + 1);
  const fimStr = fimExclusivo.toISOString().slice(0, 10);

  const planned = await somaSP(pat, baseFiltro);
  const completedTotal = await somaSP(pat, `${baseFiltro} and StateCategory eq ${DONE_STATES}`);
  const completedLate = await somaSP(
    pat,
    `${baseFiltro} and StateCategory eq ${DONE_STATES} and CompletedDate ge ${fimStr}T00:00:00Z`
  );

  const completed = Math.max(0, completedTotal - completedLate); // "no prazo"
  const incomplete = Math.max(0, planned - completedTotal);

  return {
    iter: iter.name,
    start: iter.start,
    finish: iter.finish,
    timeFrame: iter.timeFrame,
    planned,
    completed, // concluído dentro da sprint
    completedLate, // concluído após o fim
    incomplete,
    completedTotal,
    plannedInicio: 0, // preenchido depois via somaSnapshot
    addedDuringSprint: 0,
  };
}

// snapshot usa a entidade WorkItemSnapshot (não WorkItems)
async function somaSnapshot(pat, filtro) {
  const path = `WorkItemSnapshot?$apply=filter(${enc(filtro)})/aggregate(StoryPoints with sum as SP)`;
  const data = await odata(pat, path);
  return Number(data.value?.[0]?.SP ?? 0) || 0;
}

export async function obterVelocity(pat, n = 5, alvo = null) {
  const area = await areaSK(pat);
  const iteracoes = await listarIteracoes(pat);

  // janela: N iterações até a sprint-alvo (inclusive).
  // Se `alvo` for informado (ex.: "Iteration 106"), a janela termina nela;
  // senão, termina na iteração corrente.
  let fim = -1;
  if (alvo) {
    fim = iteracoes.findIndex((i) => i.name === alvo);
    if (fim >= 0) fim = fim + 1;
  }
  if (fim < 0) {
    fim = iteracoes.findIndex((i) => i.timeFrame === "current");
    if (fim >= 0) fim = fim + 1;
    else {
      const ultimaIniciada = iteracoes.reduce(
        (acc, it, i) => (it.timeFrame !== "future" ? i : acc),
        -1
      );
      fim = ultimaIniciada >= 0 ? ultimaIniciada + 1 : iteracoes.length;
    }
  }
  const janela = iteracoes.slice(Math.max(0, fim - n), fim);

  const velocity = [];
  for (const it of janela) {
    const v = await velocityDaIteracao(pat, area, it);
    const inicio = diaUTC(it.start);
    // snapshot do dia 1 (entidade WorkItemSnapshot) — é o "Planned" do widget
    const plannedInicio = await somaSnapshot(
      pat,
      `IterationSK eq ${it.id} and AreaSK eq ${area} and StoryPoints ne null ` +
        `and DateValue ge ${inicio}T00:00:00Z and DateValue lt ${inicio}T23:59:59Z`
    ).catch(() => 0);

    v.plannedAtual = v.planned; // SP na sprint hoje (estado atual)
    v.plannedInicio = plannedInicio; // SP no primeiro dia
    v.planned = plannedInicio; // o gráfico usa o Planned do dia 1 (como o Azure)
    v.addedDuringSprint = Math.max(0, v.plannedAtual - plannedInicio);
    velocity.push(v);
  }

  const concluido = velocity.map((v) => v.completedTotal);
  const media =
    concluido.length > 0
      ? Math.round(concluido.reduce((a, b) => a + b, 0) / concluido.length)
      : 0;

  const atual = velocity.length ? velocity[velocity.length - 1] : null;
  const snapshot = atual
    ? { iter: atual.iter, plannedInicio: atual.plannedInicio, addedDuringSprint: atual.addedDuringSprint }
    : null;

  // performance só da sprint atual (Planned = snapshot do dia 1, como o widget)
  const perf = atual
    ? [
        {
          iter: atual.iter,
          estimado: atual.planned > 0 ? Math.round((atual.completedTotal / atual.planned) * 100) : 0,
          assumido:
            atual.completedTotal + atual.incomplete > 0
              ? Math.round((atual.completedTotal / (atual.completedTotal + atual.incomplete)) * 100)
              : 0,
        },
      ]
    : [];

  return {
    team: TEAM,
    project: PROJECT,
    geradoEm: new Date().toISOString(),
    velocityMedia: media,
    temCompletedLate: true, // agora via Analytics
    atual,
    snapshot,
    performance: perf,
    velocity,
  };
}
