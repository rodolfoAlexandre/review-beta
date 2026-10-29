import GroupedBars from "../charts/GroupedBars.jsx";

// Comparativo entre sprints: barras de Testes e Bugs por sprint + taxa de bugs.
export default function ComparativoBugsSlide({ data }) {
  // eixo X = sprints; duas séries (Testes, Bugs)
  const categorias = data.sprints.map((s, i) => ({
    nome: s,
    valores: [data.testes[i], data.bugs[i]],
  }));
  const grupos = [
    { nome: "Testes", color: "#38d4ff" },
    { nome: "Bugs", color: "#ee2252" },
  ];

  return (
    <div className="slide slide--qualidade">
      <h2 className="slide__titulo">{data.titulo}</h2>

      <div className="card" style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
        <div className="legenda-series">
          {grupos.map((g) => (
            <span key={g.nome} className="serie">
              <i style={{ background: g.color }} /> {g.nome}
            </span>
          ))}
        </div>
        <GroupedBars categorias={categorias} grupos={grupos} height={240} />
      </div>

      <div className="qual-totais" style={{ maxWidth: 900, margin: "16px auto 0" }}>
        {data.sprints.map((s, i) => (
          <div className="total-card card" key={s}>
            <span className="total-card__valor">{data.bugs[i]}</span>
            <span className="total-card__rotulo">
              {s} · {data.testes[i]} testes · {data.taxa[i]}% bugs
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
