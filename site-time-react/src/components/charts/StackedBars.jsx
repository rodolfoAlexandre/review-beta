// Gráfico de barras agrupadas/empilhadas em SVG puro (sem dependências).
// Usado no slide de produtividade (velocity por iteração).
// Mostra um tooltip com o valor ao passar o mouse sobre cada barra/segmento.

import { useState } from "react";

export default function StackedBars({ data, series, max, height = 320 }) {
  const padL = 34;
  const padB = 46;
  const padT = 10;
  const width = 820;
  const chartH = height - padB - padT;
  const chartW = width - padL - 16;
  const groupW = chartW / data.length;
  const barW = Math.min(46, groupW * 0.5);

  const topo = max ?? Math.max(...data.flatMap((d) => series.map((s) => d[s.key])));
  const yMax = Math.ceil(topo / 5) * 5;
  const y = (v) => padT + chartH - (v / yMax) * chartH;
  const ticks = Array.from({ length: yMax / 5 + 1 }, (_, i) => i * 5);

  // tooltip: { xPct, yPct, titulo, itens:[{label,valor,color}] }
  const [tip, setTip] = useState(null);

  // mostra tooltip posicionado (coordenadas em % do viewBox p/ acompanhar o scale)
  const mostrar = (svgX, svgY, titulo, itens) => {
    setTip({ left: (svgX / width) * 100, top: (svgY / height) * 100, titulo, itens });
  };

  return (
    <div className="chart-wrap" onMouseLeave={() => setTip(null)}>
      <svg
        className="chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        preserveAspectRatio="xMidYMid meet"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={width - 16} y1={y(t)} y2={y(t)} className="chart__grid" />
            <text x={padL - 8} y={y(t) + 4} className="chart__axis" textAnchor="end">
              {t}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const gx = padL + i * groupW;
          const cx = gx + groupW / 2;
          const plannedX = cx - barW - 3;
          const stackX = cx + 3;
          let acc = 0;

          // itens da pilha (p/ tooltip do grupo)
          const itensGrupo = [
            { label: "Planned", valor: d.planned, color: "#9ad8ec" },
            ...series.map((s) => ({ label: s.label, valor: d[s.key], color: s.color })),
          ];

          return (
            <g key={d.label}>
              {/* planned */}
              <rect
                x={plannedX}
                y={y(d.planned)}
                width={barW}
                height={padT + chartH - y(d.planned)}
                rx="3"
                className="chart__bar chart__bar--planned"
                onMouseMove={() =>
                  mostrar(plannedX + barW / 2, y(d.planned), d.label, [
                    { label: "Planned", valor: d.planned, color: "#9ad8ec" },
                  ])
                }
                onMouseEnter={() =>
                  mostrar(plannedX + barW / 2, y(d.planned), d.label, [
                    { label: "Planned", valor: d.planned, color: "#9ad8ec" },
                  ])
                }
              />
              {/* pilha completed/late/incomplete */}
              {series.map((s) => {
                const v = d[s.key];
                if (!v) return null;
                const h = (v / yMax) * chartH;
                const yy = padT + chartH - acc - h;
                acc += h;
                return (
                  <rect
                    key={s.key}
                    x={stackX}
                    y={yy}
                    width={barW}
                    height={h}
                    rx="2"
                    fill={s.color}
                    onMouseEnter={() =>
                      mostrar(stackX + barW / 2, yy, d.label, itensGrupo.filter((it) => it.valor))
                    }
                    onMouseMove={() =>
                      mostrar(stackX + barW / 2, yy, d.label, itensGrupo.filter((it) => it.valor))
                    }
                  />
                );
              })}
              <text x={cx} y={height - padB + 20} className="chart__label" textAnchor="middle">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {tip && (
        <div
          className="chart-tip"
          style={{ left: `${tip.left}%`, top: `${tip.top}%` }}
        >
          <strong>{tip.titulo}</strong>
          {tip.itens.map((it) => (
            <span key={it.label}>
              <i style={{ background: it.color }} />
              {it.label}: <b>{it.valor}</b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
