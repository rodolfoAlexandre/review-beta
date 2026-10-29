// Slides gerados automaticamente a partir do PPTX (review dinâmico).
// Cobrem os tipos que não têm um componente curado dedicado:
//   - "texto": título + parágrafos (fallback legível)
//   - "grafico": gráfico de barras agrupadas reaproveitando GroupedBars
//
// O backend entrega gráficos no formato "por série":
//   graficos: [{ tipo, series: [{ nome, categorias:[...], valores:[...] }] }]
// O GroupedBars espera "por categoria":
//   categorias: [{ nome, valores:[...] }] + grupos: [{ nome, color }]
// A função converterGrafico faz essa transposição.

import GroupedBars from "../charts/GroupedBars.jsx";

const CORES = ["#ee2252", "#1fb4c3", "#ffc000", "#7c4dff", "#00b894", "#fd9644"];

function converterGrafico(g) {
  const series = g.series || [];
  if (!series.length) return null;
  // eixo X = categorias da 1ª série (todas compartilham o mesmo eixo)
  const eixo = series[0].categorias || [];
  const categorias = eixo.map((nomeCat, ci) => ({
    nome: nomeCat,
    valores: series.map((s) => (s.valores ? s.valores[ci] ?? null : null)),
  }));
  const grupos = series.map((s, i) => ({ nome: s.nome, color: CORES[i % CORES.length] }));
  return { categorias, grupos };
}

export function TextoSlide({ data }) {
  return (
    <div className="slide slide--texto">
      {data.titulo && <h2 className="slide__titulo">{data.titulo}</h2>}
      <div className="texto-auto">
        {(data.paragrafos || []).map((p, i) => (
          <p key={i} className="texto-auto__linha">{p}</p>
        ))}
      </div>
      {data.imagem && (
        <div className="figura figura--contain" style={{ marginTop: 16 }}>
          <img src={data.imagem} alt={data.titulo || ""} />
        </div>
      )}
    </div>
  );
}

export function ProdutividadeAutoSlide({ data }) {
  const perf = data.performance || [];

  // gráfico: cada Review = 1 categoria no eixo X; 2 barras (Estimado/Assumido)
  const grupos = [
    { nome: "% Estimado", color: "#4aa3ff" },
    { nome: "% Assumido", color: "#7fe3ff" },
  ];
  const categorias = perf.map((p) => ({
    nome: p.iter,
    valores: [p.estimado ?? null, p.assumido ?? null],
  }));
  const temGrafico = categorias.length > 0;

  return (
    <div className="slide slide--prod-auto">
      <h2 className="slide__titulo">{data.titulo}</h2>

      <div className="prod-auto__cards">
        {perf.map((p) => (
          <div className="prod-card card" key={p.iter}>
            <span className="prod-card__iter">{p.iter}</span>
            <div className="prod-card__metricas">
              <div className="prod-metrica">
                <span className="prod-metrica__valor">{p.estimado != null ? p.estimado + "%" : "—"}</span>
                <span className="prod-metrica__rotulo">do Estimado</span>
              </div>
              <div className="prod-metrica">
                <span className="prod-metrica__valor">{p.assumido != null ? p.assumido + "%" : "—"}</span>
                <span className="prod-metrica__rotulo">do Assumido</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {temGrafico && (
        <div className="card" style={{ padding: 14, width: "100%", maxWidth: 820 }}>
          <div className="legenda-series">
            {grupos.map((g) => (
              <span key={g.nome} className="serie">
                <i style={{ background: g.color }} /> {g.nome}
              </span>
            ))}
          </div>
          <GroupedBars categorias={categorias} grupos={grupos} height={240} />
        </div>
      )}

      {data.formulas && data.formulas.length > 0 && (
        <div className="prod-auto__formulas">
          {data.formulas.map((f, i) => (
            <span key={i} className="prod-formula">{f}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function GraficoSlide({ data }) {
  const g = (data.graficos || [])[0];
  const conv = g ? converterGrafico(g) : null;

  return (
    <div className="slide slide--insights">
      <h2 className="slide__titulo">{data.titulo}</h2>
      {conv ? (
        <div className="card" style={{ padding: 14, marginBottom: 14 }}>
          <div className="legenda-series">
            {conv.grupos.map((gr) => (
              <span key={gr.nome} className="serie">
                <i style={{ background: gr.color }} /> {gr.nome}
              </span>
            ))}
          </div>
          <GroupedBars categorias={conv.categorias} grupos={conv.grupos} height={260} />
        </div>
      ) : (
        <p className="texto-auto__linha">Sem dados de gráfico neste slide.</p>
      )}
      {data.texto && data.texto.length > 0 && (
        <div className="insights">
          {data.texto.map((t, i) => (
            <div className="insight" key={i}>
              <p className="insight__texto">{t}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
