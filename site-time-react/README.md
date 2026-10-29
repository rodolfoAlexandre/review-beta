# Squad Beta · Review / Apresentação (React + Vite + Node)

Apresentação navegável da Review da Squad Beta em **React 18 + Vite 5**,
com um **backend Node** que puxa a produtividade (velocity) ao vivo do
**Azure DevOps** via Analytics OData.

## Requisitos
- Node.js 18+ (testado com v20.12.2)
- npm 10+
- Um **PAT do Azure DevOps** com escopo de *Work Items* + *Analytics*
  (só é necessário para o slide de produtividade dinâmica).

## Rodar em desenvolvimento
```bash
npm install

# 1) backend (produtividade do Azure) — porta 8787
node server/index.js

# 2) frontend (Vite) — porta 5500
npm run dev
```
O Vite sobe em http://localhost:5500 e abre o navegador automaticamente.
O **hot reload (HMR)** já vem embutido — edite qualquer arquivo em `src/`
(ou troque uma imagem em `public/`) e a página atualiza sozinha, sem F5.
As chamadas `/api/*` são encaminhadas pelo proxy do Vite para o backend
(porta 8787), evitando CORS.

### PAT do Azure DevOps
O backend lê o token da variável `AZURE_DEVOPS_PAT` em um arquivo `.env`
na raiz do projeto (o `.env` está no `.gitignore` — nunca comite o token):
```
AZURE_DEVOPS_PAT=xxxxxxxxxxxxxxxxxxxx
```

## Build de produção
```bash
npm run build      # gera a pasta dist/
npm run preview    # serve o build para conferência
```

## Navegação do deck
- Setas ←/→ (ou PageUp/PageDown) trocam de slide.
- Clique nos prints abre o lightbox com zoom.
- A produtividade é carregada automaticamente ao abrir o deck.

## Slide alvo da sprint
A sprint apresentada no slide de produtividade é fixada pela constante
`SPRINT_ALVO` em `src/App.jsx` (ex.: `"Iteration 106"`). Para apresentar
outra sprint, troque o valor; use `null` para usar a sprint **corrente**.

---

## 🛠️ Atualizar a Review a cada sprint (script de extração de PPTX)

Para não garimpar o PowerPoint na mão a cada sprint, o projeto traz um
extrator em **Node puro, sem dependências**:

```
scripts/extrair-pptx.mjs
```

### Uso
```bash
node scripts/extrair-pptx.mjs "C:\caminho\Review Iteração 108 - Squad Beta.pptx" [pastaSaida]
```
- `pastaSaida` é opcional (padrão: `./extraido`).

### O que ele faz
Automatiza exatamente a garimpagem que era feita manualmente:
- Descompacta o `.pptx` (que é um ZIP) usando `tar` nativo (Windows 10+/
  Linux/macOS) com fallback para `Expand-Archive`.
- Extrai o **texto** de cada slide, juntando os *runs* picotados do PowerPoint.
- Detecta **slides ocultos** (`show="0"`).
- Lê os **gráficos nativos** (`ppt/charts/chartN.xml`): séries, categorias e
  valores — tratando célula vazia como `null` (N/A, não desenha barra) em vez
  de `0`, e **ignorando séries filtradas** (`filteredBarSeries`).
- Mapeia as **imagens** de cada slide e marca a **maior** como o
  *print principal* (heurística: ícones são pequenos, prints são grandes).

### Saídas (na pasta de saída)
- `review-extraido.json` — dados estruturados (texto, charts, ocultos, prints)
  para montar os slides.
- `review-extraido.txt` — resumo legível para revisão rápida.
- `imagens/slideN-print.<ext>` — os prints principais copiados.

### Fluxo recomendado na próxima review
1. ~10 min antes, baixe o PPTX novo da sprint.
2. Rode o script apontando para esse PPTX.
3. Passe o `review-extraido.json` / `.txt` para montar/ajustar os slides em
   `src/` dentro dos padrões do projeto.
4. Troque `SPRINT_ALVO` em `src/App.jsx` para a sprint da vez.

---

## Imagens
- **Prints da review**: ficam em `public/` (servidos na raiz, ex.: `/slides/...`)
  e são atualizados pelo extrator.
- **Fotos da equipe**: fonte única fora do projeto em `../fotos-equipe`
  (junction em `public/fotos-equipe`), sem cópia duplicada. Para trocar uma
  foto, substitua o arquivo correspondente em `../fotos-equipe`
  (mapa pessoa→arquivo em `src/data/team.js`).

## Estrutura (resumo)
```
index.html              # ponto de entrada (monta #root)
vite.config.js          # config do Vite (porta 5500, proxy /api -> 8787)
scripts/
  extrair-pptx.mjs      # extrator de PPTX (texto, charts, ocultos, prints)
server/
  index.js              # backend Node (porta 8787, /api/velocity)
  azure.js              # Analytics OData do Azure DevOps (filtro por AreaSK)
src/
  main.jsx              # bootstrap React + import do CSS
  App.jsx               # layout do deck + SPRINT_ALVO
  data/                 # dados do deck (slides, time, etc.)
  components/           # slides, charts SVG, header/footer, lightbox
  hooks/                # useDeck e afins
```
