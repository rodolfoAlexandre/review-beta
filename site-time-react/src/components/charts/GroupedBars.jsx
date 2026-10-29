// Barras agrupadas em SVG puro: cada categoria (indicador) tem N barras
// (uma por sprint). Usado no slide de Qualidade.

export default function GroupedBars({ categorias, grupos, height = 300 }) {
  const padL = 34;
  const padB = 56;
  const padT = 12;
  const width = 820;
  const chartH = height - padB - padT;
  const chartW = width - padL - 16;
  const catW = chartW / categorias.length;

  // ignora null/undefined (N/A) no cálculo do máximo
  const todos = categorias.flatMap((c) => c.valores).filter((v) => v != null);
  const topo = todos.length ? Math.max(...todos) : 0;
  // passo de arredondamento do topo: 2 p/ valores pequenos (ex.: bugs), 20 p/ grandes
  const passo = topo <= 20 ? 2 : 20;
  const yMax = Math.ceil(topo / passo) * passo || passo;
  const y = (v) => padT + chartH - (v / yMax) * chartH;
  const ticks = Array.from({ length: 5 }, (_, i) => Math.round((yMax / 4) * i));

  const nBars = grupos.length;
  const barW = Math.min(30, (catW * 0.62) / nBars);
  const gap = 4;
  const clusterW = nBars * barW + (nBars - 1) * gap;

  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" preserveAspectRatio="xMidYMid meet">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={width - 16} y1={y(t)} y2={y(t)} className="chart__grid" />
          <text x={padL - 8} y={y(t) + 4} className="chart__axis" textAnchor="end">{t}</text>
        </g>
      ))}

      {categorias.map((c, ci) => {
        const base = padL + ci * catW + (catW - clusterW) / 2;
        return (
          <g key={c.nome}>
            {c.valores.map((v, gi) => {
              const x = base + gi * (barW + gap);
              if (v == null) return null; // N/A: não desenha barra nem rótulo
              const h = (v / yMax) * chartH;
              return (
                <g key={gi}>
                  <rect x={x} y={y(v)} width={barW} height={h} rx="3" fill={grupos[gi].color} />
                  <text x={x + barW / 2} y={y(v) - 5} className="chart__value" textAnchor="middle">{v}</text>
                </g>
              );
            })}
            <text x={padL + ci * catW + catW / 2} y={height - padB + 22} className="chart__label" textAnchor="middle">
              {c.nome}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
