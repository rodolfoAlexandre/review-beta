import { createPortal } from "react-dom";
import { fotoUrl } from "../utils.js";

export default function Preview({ active, pos, popRef }) {
  const membro = active?.membro;

  const className =
    "preview" +
    (active ? " is-visible" : "") +
    (pos.below ? " preview--below" : "") +
    (membro?.lider ? " preview--lead" : "");

  return createPortal(
    <div
      ref={popRef}
      className={className}
      style={{ left: pos.left, top: pos.top }}
      aria-hidden={!active}
    >
      {membro && (
        <>
          <div className="preview__frame">
            <img className="preview__img" alt="" src={fotoUrl(membro.foto)} />
          </div>
          <div className="preview__meta">
            <strong className="preview__name">{membro.nome}</strong>
            <span className="preview__role">{membro.cargo}</span>
          </div>
        </>
      )}
    </div>,
    document.body
  );
}
