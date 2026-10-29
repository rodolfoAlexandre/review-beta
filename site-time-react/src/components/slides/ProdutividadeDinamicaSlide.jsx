import StackedBars from "../charts/StackedBars.jsx";

const SERIES = [
  { key: "completed", label: "Completed", color: "#1f8f3a" },
  { key: "completedLate", label: "Completed Late", color: "#7bc043" },
  { key: "incomplete", label: "Incomplete", color: "#1e6fd6" },
];

// A velocity é carregada no App (no start) e chega via props em `velocity`.
export default function ProdutividadeDinamicaSlide({ data, velocity }) {
  const { data: live, loading, erro, recarregar } = velocity;

  return (
    <div className="slide slide--produtividade">
      <h2 className="slide__titulo">{data.titulo}</h2>

      {loading && <Estado texto="Carregando dados do Azure DevOps…" />}

      {erro && (
        <Estado erro texto={`Não foi possível carregar: ${erro}`}>
          <button className="btn-retry" onClick={recarregar}>
            Tentar novamente
          </button>
        </Estado>
      )}

      {live && !loading && !erro && <Conteudo live={live} />}
    </div>
  );
}

function Conteudo({ live }) {
  const chartData = live.velocity.map((v) => ({
    label: v.iter.replace("Iteration ", "Iter. "),
    planned: v.planned,
    completed: v.completed,
    completedLate: v.completedLate,
    incomplete: v.incomplete,
  }));

  // séries exibidas: oculta "Completed Late" se o backend não fornecer
  const series = live.temCompletedLate
    ? SERIES
    : SERIES.filter((s) => s.key !== "completedLate");

  const geradoEm = new Date(live.geradoEm).toLocaleString("pt-BR");
  const perf = live.performance || [];
  const atual = live.atual;

  return (
    <div className="prod-grid">
      {/* Performance de entregas: sprint atual + quadro de valores (estilo Azure) */}
      <div className="prod-reviews">
        {perf.map((p, i) => (
          <div className="review-card card" key={p.iter}>
            <h3>
              {p.iter.replace("Iteration ", "Sprint ")}
              {i === 0 && <span className="review-tag">atual</span>}
            </h3>
            <div className="review-metricas">
              <Gauge valor={p.estimado} rotulo="do Estimado" />
              <Gauge valor={p.assumido} rotulo="do Assumido" />
            </div>
          </div>
        ))}

        {atual && (
          <div className="iter-legenda card">
            <h4>{atual.iter}</h4>
            <ul>
              <li><i style={{ background: "#9ad8ec" }} /> Planned <b>{atual.planned}</b></li>
              <li><i style={{ background: "#1f8f3a" }} /> Completed <b>{atual.completed}</b></li>
              <li><i style={{ background: "#7bc043" }} /> Completed Late <b>{atual.completedLate}</b></li>
              <li><i style={{ background: "#1e6fd6" }} /> Incomplete <b>{atual.incomplete}</b></li>
            </ul>

          </div>
        )}

        <ul className="formulas">
          <li>% Estimado = Completed / Planned</li>
          <li>% Assumido = Completed / (Completed + Incomplete)</li>
        </ul>
      </div>

      {/* Velocity */}
      <div className="prod-velocity card">
        <div className="velocity-head">
          <div className="legenda-series">
            <span className="serie"><i style={{ background: "#9ad8ec" }} /> Planned</span>
            {series.map((s) => (
              <span className="serie" key={s.key}>
                <i style={{ background: s.color }} /> {s.label}
              </span>
            ))}
          </div>
          <div className="velocity-media">
            <span className="velocity-media__valor">{live.velocityMedia}</span>
            <span className="velocity-media__rotulo">Average Velocity</span>
          </div>
        </div>

        <StackedBars data={chartData} series={series} />

        <div className="live-meta">
          <span>Atualizado em {geradoEm}</span>
        </div>
      </div>
    </div>
  );
}

function Gauge({ valor, rotulo }) {
  const pct = Math.min(100, valor);
  return (
    <div className="gauge">
      <div className="gauge__ring" style={{ "--pct": pct }}>
        <span className="gauge__valor">{valor}%</span>
      </div>
      <span className="gauge__rotulo">{rotulo}</span>
    </div>
  );
}

function Estado({ texto, erro, children }) {
  return (
    <div className={"estado" + (erro ? " estado--erro" : "")}>
      {!erro && <span className="estado__spinner" aria-hidden="true" />}
      <p>{texto}</p>
      {children}
    </div>
  );
}
