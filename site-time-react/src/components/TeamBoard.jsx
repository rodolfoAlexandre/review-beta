import { TEAM } from "../data/team.js";
import Sector from "./Sector.jsx";
import Preview from "./Preview.jsx";
import { usePreview } from "../hooks/usePreview.js";

// Grid de membros por setor (a "página da equipe"), usada como um slide.
export default function TeamBoard() {
  const { active, pos, popRef, open, close } = usePreview();

  return (
    <div className="team">
      <section className="board" aria-label="Membros do time por setor">
        {TEAM.map((s, i) => (
          <Sector key={s.setor} setor={s} index={i} onOpen={open} onClose={close} />
        ))}
      </section>
      <Preview active={active} pos={pos} popRef={popRef} />
    </div>
  );
}
