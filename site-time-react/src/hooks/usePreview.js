import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * Gerencia o preview (popover) exibido ao passar o mouse/focar um membro.
 * Retorna o membro ativo, a posição calculada e handlers para abrir/fechar.
 */
export function usePreview() {
  const [active, setActive] = useState(null); // { membro, anchor }
  const [pos, setPos] = useState({ left: 0, top: 0, below: false });
  const popRef = useRef(null);

  const open = useCallback((membro, anchorEl) => {
    setActive({ membro, anchor: anchorEl });
  }, []);

  const close = useCallback(() => setActive(null), []);

  // calcula a posição depois que o popover é renderizado (p/ saber o tamanho real)
  useLayoutEffect(() => {
    if (!active || !popRef.current) return;

    const place = () => {
      const pop = popRef.current;
      if (!pop || !active.anchor) return;
      const r = active.anchor.getBoundingClientRect();
      const pw = pop.offsetWidth;
      const ph = pop.offsetHeight;
      const gap = 14;
      const margin = 8;

      let left = r.left + r.width / 2 - pw / 2;
      let top = r.top - ph - gap;
      let below = false;

      if (top < margin) {
        top = r.bottom + gap;
        below = true;
      }
      left = Math.max(margin, Math.min(left, window.innerWidth - pw - margin));

      setPos({ left: left + window.scrollX, top: top + window.scrollY, below });
    };

    place();

    const onScroll = () => place();
    const onResize = () => close();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [active, close]);

  return { active, pos, popRef, open, close };
}
