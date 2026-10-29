import { useMemo, useState } from "react";
import { SLIDES as TODOS_SLIDES } from "./data/slides.js";
import { useDeck } from "./hooks/useDeck.js";
import { useVelocity } from "./hooks/useVelocity.js";
import { useReviews, useReview } from "./hooks/useReviews.js";
import TeamBoard from "./components/TeamBoard.jsx";
import {
  CapaSlide,
  SecaoSlide,
  ImagemSlide,
  DestaqueSlide,
} from "./components/slides/SimpleSlides.jsx";
import {
  IndicadoresSlide,
  IncrementoSlide,
  InsightsSlide,
} from "./components/slides/ContentSlides.jsx";
import { TextoSlide, GraficoSlide, ProdutividadeAutoSlide } from "./components/slides/AutoSlides.jsx";
import QualidadeSlide from "./components/slides/QualidadeSlide.jsx";
import ComparativoBugsSlide from "./components/slides/ComparativoBugsSlide.jsx";
import ProdutividadeDinamicaSlide from "./components/slides/ProdutividadeDinamicaSlide.jsx";

// slides do review curado (estático), ignorando os marcados com `oculto: true`
const SLIDES_CURADOS = TODOS_SLIDES.filter((s) => !s.oculto);

function renderSlide(data, velocity) {
  switch (data.tipo) {
    case "capa":
      return <CapaSlide data={data} />;
    case "secao":
      return <SecaoSlide data={data} />;
    case "imagem":
      return <ImagemSlide data={data} />;
    case "destaque":
      return <DestaqueSlide data={data} />;
    case "indicadores":
      return <IndicadoresSlide data={data} />;
    case "incremento":
      return <IncrementoSlide data={data} />;
    case "insights":
      return <InsightsSlide data={data} />;
    case "qualidade":
      return <QualidadeSlide data={data} />;
    case "comparativo-bugs":
      return <ComparativoBugsSlide data={data} />;
    case "produtividade-dinamica":
      return <ProdutividadeDinamicaSlide data={data} velocity={velocity} />;
    case "equipe":
      return (
        <div className="slide slide--equipe">
          <TeamBoard />
        </div>
      );
    // tipos vindos do review dinâmico (PPTX)
    case "texto":
      return <TextoSlide data={data} />;
    case "grafico":
      return <GraficoSlide data={data} />;
    case "produtividade-auto":
      return <ProdutividadeAutoSlide data={data} />;
    default:
      return null;
  }
}

// Atalhos do cabeçalho -> id do slide de cada área principal (review curado).
const ATALHOS = [
  { rotulo: "Início", alvo: "capa" },
  { rotulo: "Equipe", alvo: "equipe" },
  { rotulo: "Indicadores", alvo: "indicadores" },
  { rotulo: "Entregas", alvo: "voz-do-time" },
  { rotulo: "Qualidade", alvo: "secao-qualidade" },
  { rotulo: "Produtividade", alvo: "secao-produtividade" },
];

// valor especial do combo que representa o review curado (estático)
const CURADO = "__curado__";

export default function App() {
  const { reviews } = useReviews();
  // arquivo selecionado no combo; CURADO = usa os slides estáticos
  const [selecionado, setSelecionado] = useState(CURADO);

  // review dinâmico (só busca quando um arquivo real está selecionado)
  const arquivoAtivo = selecionado === CURADO ? null : selecionado;
  const { data: reviewData, loading: reviewLoading, erro: reviewErro } = useReview(arquivoAtivo);

  // slides em uso: curados (estáticos) ou os do PPTX selecionado
  const SLIDES = useMemo(() => {
    if (selecionado === CURADO) return SLIDES_CURADOS;
    return reviewData?.slides ?? [];
  }, [selecionado, reviewData]);

  const total = SLIDES.length;
  const { index, next, prev, goTo } = useDeck(total);
  const atual = SLIDES[index];

  // carrega a velocity UMA vez, no start do app (usada só no review curado).
  const SPRINT_ALVO = "Iteration 106";
  const velocity = useVelocity(5, SPRINT_ALVO);

  // Atalhos do topo:
  //  - modo curado: ids fixos conhecidos (ATALHOS).
  //  - modo dinâmico (PPTX): monta a partir dos slides de SEÇÃO do próprio
  //    arquivo (divisores "A Equipe", "Voz do Time"...), + Início (capa) e
  //    Entregas (1º incremento). Assim cada sprint mostra o que realmente tem.
  const ATALHOS_IDX = useMemo(() => {
    if (selecionado === CURADO) {
      return ATALHOS.map((a) => ({ ...a, idx: SLIDES.findIndex((s) => s.id === a.alvo) })).filter(
        (a) => a.idx >= 0
      );
    }
    const itens = [];
    const idxCapa = SLIDES.findIndex((s) => s.tipo === "capa");
    if (idxCapa >= 0) itens.push({ rotulo: "Início", alvo: SLIDES[idxCapa].id, idx: idxCapa });

    // cada slide de seção vira um atalho (rótulo = título do divisor)
    SLIDES.forEach((s, idx) => {
      if (s.tipo === "secao" && s.titulo) {
        itens.push({ rotulo: s.titulo, alvo: s.id, idx });
      }
    });

    // "Entregas" aponta para o primeiro incremento, se ainda não houver um
    // atalho de seção imediatamente antes dele
    const idxInc = SLIDES.findIndex((s) => s.tipo === "incremento");
    if (idxInc >= 0 && !itens.some((a) => a.idx === idxInc)) {
      itens.push({ rotulo: "Entregas", alvo: SLIDES[idxInc].id, idx: idxInc });
    }

    // ordena pela posição no deck e remove duplicatas de índice
    const vistos = new Set();
    return itens
      .sort((a, b) => a.idx - b.idx)
      .filter((a) => (vistos.has(a.idx) ? false : vistos.add(a.idx)));
  }, [selecionado, SLIDES]);

  const atalhoAtivo = ATALHOS_IDX.reduce(
    (acc, a) => (index >= a.idx ? a.alvo : acc),
    null
  );

  // estado de carregamento/erro do review dinâmico
  const carregandoReview = selecionado !== CURADO && reviewLoading;
  const semSlides = !carregandoReview && total === 0;

  return (
    <>
      <div className="bg-aurora" aria-hidden="true" />
      <div className="bg-watermark" aria-hidden="true" />

      <div className="deck">
        {/* topo: marca + atalhos + seletor de review + progresso */}
        <header className="deck__top">
          <span className="deck__brand">
            <img className="deck__logo" src="/marca/poliedro-simbolo-cor.png" alt="Poliedro" />
            Tribo Avaliações · Squad Beta
          </span>

          <nav className="deck__atalhos" aria-label="Ir para seção">
            {ATALHOS_IDX.map((a) => (
              <button
                key={a.alvo}
                className={"atalho" + (atalhoAtivo === a.alvo ? " is-active" : "")}
                onClick={() => goTo(a.idx)}
                aria-current={atalhoAtivo === a.alvo}
              >
                {a.rotulo}
              </button>
            ))}
          </nav>

          <div className="deck__direita">
            {/* combo de seleção do arquivo (sprint) a apresentar */}
            <label className="deck__seletor">
              <span className="deck__seletor-rotulo">Review</span>
              <select
                className="deck__select"
                value={selecionado}
                onChange={(e) => {
                  setSelecionado(e.target.value);
                  goTo(0);
                }}
              >
                <option value={CURADO}>Curado (Sprint 107)</option>
                {reviews.map((r) => (
                  <option key={r.slug} value={r.arquivo}>
                    {r.arquivo.replace(/\.pptx$/i, "")}
                  </option>
                ))}
              </select>
            </label>

            <span className="deck__counter">
              {total ? index + 1 : 0} / {total}
            </span>
          </div>
        </header>

        {/* palco do slide */}
        <main className="deck__stage">
          {carregandoReview && (
            <div className="deck__estado">Extraindo o review do PowerPoint…</div>
          )}
          {reviewErro && selecionado !== CURADO && (
            <div className="deck__estado deck__estado--erro">
              Falha ao carregar o review: {reviewErro}
            </div>
          )}
          {semSlides && !reviewErro && (
            <div className="deck__estado">Nenhum slide para exibir.</div>
          )}
          {!carregandoReview && atual && (
            <div key={(reviewData?.slug || "curado") + ":" + atual.id} className="deck__slide">
              {renderSlide(atual, velocity)}
            </div>
          )}
        </main>

        {/* controles */}
        <nav className="deck__nav" aria-label="Navegação da apresentação">
          <button className="deck__btn" onClick={prev} disabled={index === 0} aria-label="Anterior">
            ‹
          </button>
          <div className="deck__dots">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                className={"dot" + (i === index ? " is-active" : "")}
                onClick={() => goTo(i)}
                aria-label={`Ir para o slide ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>
          <button
            className="deck__btn"
            onClick={next}
            disabled={total === 0 || index === total - 1}
            aria-label="Próximo"
          >
            ›
          </button>
        </nav>
      </div>
    </>
  );
}
