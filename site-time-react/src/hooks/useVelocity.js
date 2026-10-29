import { useEffect, useState } from "react";

// Busca a velocity ao vivo do backend (/api/velocity).
// Retorna { data, loading, erro, recarregar }.
export function useVelocity(n = 5, alvo = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let vivo = true;
    setLoading(true);
    setErro(null);

    const url = `/api/velocity?n=${n}` + (alvo ? `&alvo=${encodeURIComponent(alvo)}` : "");
    fetch(url)
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) throw new Error(body?.detalhe || body?.erro || `HTTP ${r.status}`);
        return body;
      })
      .then((body) => {
        if (vivo) setData(body);
      })
      .catch((e) => {
        if (vivo) setErro(String(e.message || e));
      })
      .finally(() => {
        if (vivo) setLoading(false);
      });

    return () => {
      vivo = false;
    };
  }, [n, alvo, tick]);

  return { data, loading, erro, recarregar: () => setTick((t) => t + 1) };
}
