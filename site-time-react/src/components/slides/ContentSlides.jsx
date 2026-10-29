// Slides de conteúdo: indicadores (KPIs), incrementos entregues e insights.

import { useState } from "react";
import { createPortal } from "react-dom";
import GroupedBars from "../charts/GroupedBars.jsx";
import DevBadge from "./DevBadge.jsx";

export function IndicadoresSlide({ data }) {
  return (
    <div className="slide slide--indicadores">
      <h2 className="slide__titulo">{data.titulo}</h2>
      <div className="frentes">
        {data.frentes.map((f) => (
          <div className="frente" key={f.nome}>
            <h3 className="frente__nome">{f.nome}</h3>
            <div className="kpis">
              {f.kpis.map((k) => (
                <div className="kpi" key={k.rotulo}>
                  <span className="kpi__rotulo">{k.rotulo}</span>
                  <span className="kpi__valor">{k.valor}</span>
                  <span className={"kpi__delta " + (k.up ? "is-up" : "is-down")}>
                    {k.up ? "▲" : "▼"} {k.delta}
                  </span>
                  {k.faixas && <span className="kpi__faixas">{k.faixas}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function IncrementoSlide({ data }) {
  const temImagem = Boolean(data.imagem);
  const [aberto, setAberto] = useState(false);

  return (
    <div className={"slide slide--incremento" + (temImagem ? "" : " slide--incremento-sem-img")}>
      <div className="inc-info">
        <header className="inc-info__head">
          <span className="inc-info__ref">{data.ref}</span>
          <span className={"inc-card__amb amb--" + data.ambiente.toLowerCase()}>
            {data.ambiente}
          </span>
        </header>
        <h2 className="inc-info__titulo">{data.titulo}</h2>
        <p className="inc-info__desc">{data.descricao}</p>
        <DevBadge nome={data.dev} />
      </div>
      {temImagem && (
        <>
          <figure className="inc-figura" onClick={() => setAberto(true)}>
            <img src={data.imagem} alt={data.titulo} />
            <span className="inc-figura__hint">🔍 clique para ampliar</span>
          </figure>

          {aberto &&
            createPortal(
              <div className="lightbox" onClick={() => setAberto(false)}>
                <img src={data.imagem} alt={data.titulo} />
              </div>,
              document.body
            )}
        </>
      )}
    </div>
  );
}

export function InsightsSlide({ data }) {
  // cores das categorias de bug (séries): Funcionalidade, UI, Negócio
  const CORES = ["#ee2252", "#1fb4c3", "#ffc000"];
  const temGrafico = Boolean(data.categorias && data.series);
  const grupos = temGrafico ? data.series.map((s, i) => ({ nome: s, color: CORES[i] })) : [];

  return (
    <div className="slide slide--insights">
      <h2 className="slide__titulo">{data.titulo}</h2>

      {temGrafico && (
        <div className="card" style={{ padding: 14, marginBottom: 14 }}>
          <div className="legenda-series">
            {grupos.map((g) => (
              <span key={g.nome} className="serie">
                <i style={{ background: g.color }} /> {g.nome}
              </span>
            ))}
          </div>
          <GroupedBars categorias={data.categorias} grupos={grupos} height={220} />
        </div>
      )}

      <div className="insights">
        {data.itens.map((it) => (
          <div className="insight" key={it.sprint}>
            <span className="insight__sprint">{it.sprint}</span>
            <p className="insight__texto">{it.texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
