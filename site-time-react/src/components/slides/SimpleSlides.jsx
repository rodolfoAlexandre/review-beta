// Slides simples: capa, divisória de seção, imagem em destaque e número-destaque.

export function CapaSlide({ data }) {
  return (
    <div className="slide slide--capa">
      <span className="capa__kicker">Tribo Avaliações</span>
      <h1 className="capa__titulo">
        {data.titulo} <span>{data.subtitulo}</span>
      </h1>
      <div className="capa__meta">
        <span className="chip">{data.sprint}</span>
        <span className="chip chip--ghost">{data.periodo}</span>
      </div>
    </div>
  );
}

export function SecaoSlide({ data }) {
  return (
    <div className="slide slide--secao">
      <h2 className="secao__titulo">{data.titulo}</h2>
      {data.subtitulo && <p className="secao__sub">{data.subtitulo}</p>}
    </div>
  );
}

export function ImagemSlide({ data }) {
  return (
    <div className="slide slide--imagem">
      {data.titulo && <h2 className="slide__titulo">{data.titulo}</h2>}
      <div className={"figura" + (data.contain ? " figura--contain" : "")}>
        <img src={data.imagem} alt={data.titulo || ""} />
      </div>
      {data.legenda && <p className="figura__legenda">{data.legenda}</p>}
    </div>
  );
}

export function DestaqueSlide({ data }) {
  return (
    <div className="slide slide--destaque">
      {data.sobretitulo && <span className="destaque__sobre">{data.sobretitulo}</span>}
      <div className="destaque__valor">
        {data.valor}
        {data.emoji && <span className="destaque__emoji">{data.emoji}</span>}
      </div>
      {data.delta && <span className="destaque__delta">{data.delta}</span>}
      {data.legenda && <p className="destaque__legenda">{data.legenda}</p>}
    </div>
  );
}
