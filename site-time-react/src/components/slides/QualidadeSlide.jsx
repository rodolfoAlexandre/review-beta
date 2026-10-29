import GroupedBars from "../charts/GroupedBars.jsx";

const CORES_SPRINT = ["#38d4ff", "#4aa3ff", "#8b5cf6"];

export default function QualidadeSlide({ data }) {
  const grupos = data.sprints.map((s, i) => ({ nome: s, color: CORES_SPRINT[i] }));
  const categorias = data.linhas.map((l) => ({ nome: l.indicador, valores: l.valores }));

  return (
    <div className="slide slide--qualidade">
      <h2 className="slide__titulo">{data.titulo}</h2>

      <div className="qual-grid">
        <div className="qual-chart card">
          <div className="legenda-series">
            {grupos.map((g) => (
              <span key={g.nome} className="serie">
                <i style={{ background: g.color }} /> {g.nome}
              </span>
            ))}
          </div>
          <GroupedBars categorias={categorias} grupos={grupos} />
        </div>

        <div className="qual-tabela card">
          <table>
            <thead>
              <tr>
                <th>Indicador</th>
                {data.sprints.map((s) => (
                  <th key={s}>{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.linhas.map((l) => (
                <tr key={l.indicador}>
                  <td className="ind">{l.indicador}</td>
                  {l.valores.map((v, i) => (
                    <td key={i}>
                      <strong>{v}</strong>
                      {l.notas[i] && <span className="nota">{l.notas[i]}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="qual-totais">
        {data.totais.map((t) => (
          <div className="total-card card" key={t.rotulo}>
            <span className="total-card__valor">{t.valor}</span>
            <span className="total-card__rotulo">{t.rotulo}</span>
          </div>
        ))}
        <div className="total-card card">
          <span className="total-card__valor">
            {data.percRetestes[data.percRetestes.length - 1]}%
          </span>
          <span className="total-card__rotulo">% de retestes (última sprint)</span>
        </div>
      </div>
    </div>
  );
}
