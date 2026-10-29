import { useEffect, useState } from "react";

// Lista os PPTX disponíveis na pasta sincronizada (backend /api/reviews).
// Retorna { reviews, loading, erro, recarregar }.
export function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let vivo = true;
    setLoading(true);
    setErro(null);

    fetch("/api/reviews")
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) throw new Error(body?.detalhe || body?.erro || `HTTP ${r.status}`);
        return body;
      })
      .then((body) => {
        if (vivo) setReviews(body.reviews || []);
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
  }, [tick]);

  return { reviews, loading, erro, recarregar: () => setTick((t) => t + 1) };
}

// Extrai um review específico (backend /api/review?arquivo=...).
// Enquanto `arquivo` for null/undefined, não busca nada.
// Retorna { data, loading, erro }.
export function useReview(arquivo) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!arquivo) {
      setData(null);
      setErro(null);
      setLoading(false);
      return;
    }
    let vivo = true;
    setLoading(true);
    setErro(null);

    const url = "/api/review?arquivo=" + encodeURIComponent(arquivo);
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
  }, [arquivo]);

  return { data, loading, erro };
}
