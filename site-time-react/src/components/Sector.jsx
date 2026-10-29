import Member from "./Member.jsx";

export default function Sector({ setor, index, onOpen, onClose }) {
  // setores com 3+ membros ocupam 2 colunas para as fotos não ficarem apertadas
  const span = setor.destaque ? 4 : setor.membros.length >= 3 ? 2 : 1;
  return (
    <section
      className={"sector" + (setor.destaque ? " sector--wide" : "")}
      style={{ "--i": index, "--span": span }}
    >
      <div className="sector__head">
        <h2 className="sector__title">{setor.setor}</h2>
      </div>
      <div className="sector__grid">
        {setor.membros.map((m) => (
          <Member key={m.nome} membro={m} onOpen={onOpen} onClose={onClose} />
        ))}
      </div>
    </section>
  );
}
