import { useState } from "react";
import { fotoUrl, initials } from "../utils.js";

// Rótulos do badge por cargo (quando diferem do próprio cargo).
const BADGE_LABELS = {
  "Especialista de Produto": "Especialista",
  "Coord. Designer": "Coordenador",
  "Gerente de Produto": "Produto",
  "Gerente de Engenharia": "Engenharia",
  "Especialista em Redação": "Especialista",
  Desenvolvedor: "DEV",
  Desenvolvedora: "DEV",
};

// Texto do badge sobre a foto (cargo), com rótulos customizados.
function badgeLabel(membro) {
  if (membro.lider) return "Lead";
  return BADGE_LABELS[membro.cargo] ?? membro.cargo;
}

export default function Member({ membro, onOpen, onClose }) {
  const [erro, setErro] = useState(false);

  const handleEnter = (e) => {
    const avatar = e.currentTarget.querySelector(".member__avatar");
    onOpen(membro, avatar || e.currentTarget);
  };

  return (
    <article
      className={"member" + (membro.lider ? " member--lead" : "")}
      tabIndex={0}
      onMouseEnter={handleEnter}
      onMouseLeave={onClose}
      onFocus={handleEnter}
      onBlur={onClose}
    >
      <div className={"member__avatar" + (erro ? " member__avatar--fallback" : "")}>
        {erro ? (
          initials(membro.nome)
        ) : (
          <img
            loading="lazy"
            alt={`${membro.nome} — ${membro.cargo}`}
            src={fotoUrl(membro.foto)}
            onError={() => setErro(true)}
          />
        )}
        <span className={"member__badge" + (membro.lider ? "" : " member__badge--role")}>
          {badgeLabel(membro)}
        </span>
      </div>
      <h3 className="member__name">{membro.nome}</h3>
    </article>
  );
}
