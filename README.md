# Review · Tribo Avaliações — Squad Beta

Repositório da apresentação navegável das Reviews quinzenais da Squad Beta e
dos materiais de apoio (fotos da equipe e textos-fonte das sprints).

## Estrutura

```
.
├── site-time-react/     # aplicação React + Vite + backend Node (o deck da Review)
├── fotos-equipe/        # fotos da equipe (fonte única usada pelo deck via junction)
├── membros.md           # mapa pessoa → cargo → foto (slide "A Equipe")
├── review_107_texto.txt # texto-fonte extraído da Review da Sprint 107
└── _slides_catalogo.txt # catálogo de slides da apresentação
```

## Aplicação (deck da Review)

O site fica em [`site-time-react/`](site-time-react) — React 18 + Vite 5, com um
backend Node que puxa a velocity ao vivo do Azure DevOps. Veja o
[README do projeto](site-time-react/README.md) para rodar em desenvolvimento,
gerar o build e atualizar a Review a cada sprint.

```bash
cd site-time-react
npm install
node server/index.js   # backend (porta 8787)
npm run dev            # frontend (porta 5500)
```

## Fotos da equipe

As imagens em [`fotos-equipe/`](fotos-equipe) são a **fonte única** das fotos do
deck. O projeto React as consome por uma *junction* em
`site-time-react/public/fotos-equipe`, sem duplicar arquivos. A junction **não é
versionada** (ver `.gitignore`); ela é recriada localmente apontando para esta
pasta. Para trocar uma foto, substitua o arquivo correspondente aqui.

## Segredos

As credenciais do backend (PAT do Azure DevOps) ficam em
`site-time-react/.env`, que **não é versionado**. Use
`site-time-react/.env.example` como referência para criar o seu `.env` local.
