// Badge do dev responsável pela task: foto (quando houver) + rótulo + nome.
// A foto é resolvida pelo nome via TEAM (ver utils.membroPorNome). Se não
// houver foto ou ela falhar, cai para as iniciais do nome.

import { useState } from "react";
import { fotoDoDev, initials } from "../../utils.js";

export default function DevBadge({ nome }) {
  const [erro, setErro] = useState(false);
  if (!nome) return null;

  const foto = fotoDoDev(nome);
  const mostrarFoto = foto && !erro;

  return (
    <div className="inc-info__dev">
      <span className={"dev-badge__avatar" + (mostrarFoto ? "" : " dev-badge__avatar--fallback")}>
        {mostrarFoto ? (
          <img src={foto} alt={nome} loading="lazy" onError={() => setErro(true)} />
        ) : (
          initials(nome)
        )}
      </span>
      <span className="inc-info__dev-rotulo">Dev</span>
      <span className="inc-info__dev-nome">{nome}</span>
    </div>
  );
}
