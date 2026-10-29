import { useCallback, useEffect, useState } from "react";

/**
 * Controla a navegação da apresentação: índice atual, ir p/ próximo/anterior,
 * teclado (setas, espaço, Home/End) e sincronização com o hash da URL (#n).
 */
export function useDeck(total) {
  const lerHash = () => {
    const n = parseInt(window.location.hash.replace("#", ""), 10);
    return Number.isFinite(n) && n >= 1 && n <= total ? n - 1 : 0;
  };

  const [index, setIndex] = useState(lerHash);

  const goTo = useCallback(
    (i) => setIndex(Math.max(0, Math.min(total - 1, i))),
    [total]
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // teclado
  useEffect(() => {
    const onKey = (e) => {
      if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        next();
      } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        goTo(0);
      } else if (e.key === "End") {
        goTo(total - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goTo, total]);

  // mantém o hash da URL em sincronia (permite link direto p/ um slide)
  useEffect(() => {
    const novo = "#" + (index + 1);
    if (window.location.hash !== novo) {
      history.replaceState(null, "", novo);
    }
  }, [index]);

  // responde ao usuário navegando no histórico
  useEffect(() => {
    const onHash = () => setIndex(lerHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  return { index, next, prev, goTo };
}
