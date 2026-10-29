// Conteúdo da apresentação Review 107 — Squad Beta.
// Cada item vira um slide navegável. O campo `tipo` define qual componente
// de slide renderiza; os demais campos são os dados daquele slide.
//
// Fonte: apresentação original (Review Iteração 107 - Squad Beta).
// Onde o arquivo não trazia números (ex.: distribuição de bugs por
// categoria), preferimos não inventar dados.

export const SLIDES = [
  // 1 — Capa
  {
    id: "capa",
    tipo: "capa",
    titulo: "Review",
    subtitulo: "Squad Beta",
    sprint: "Sprint 107",
    periodo: "12 a 23 de outubro",
  },

  // 2 — Divisória: A Equipe
  {
    id: "secao-equipe",
    tipo: "secao",
    titulo: "A Equipe",
  },

  // 3 — Equipe (grid de membros, reaproveita o componente já existente)
  {
    id: "equipe",
    tipo: "equipe",
  },

  // Divisória
  { id: "secao-dentro-1", tipo: "secao", titulo: "Fique por dentro" },

  // 6 — Indicadores (KPIs por frente, com faixas Acelerar/Meta/Mínimo)
  {
    id: "indicadores",
    oculto: true,
    tipo: "indicadores",
    titulo: "Indicadores",
    frentes: [
      {
        nome: "P+ Redação · CatLearning",
        kpis: [
          { rotulo: "SLA", valor: "90,29%", delta: "+0,82pp", up: true, faixas: "Acelerar ≥ 93% · Meta ≥ 90% · Mínimo ≥ 87%" },
          { rotulo: "SLA VIP", valor: "67,47%", delta: "+6,57pp", up: true, faixas: "Acelerar ≥ 69% · Meta ≥ 67% · Mínimo ≥ 65%" },
          { rotulo: "Taxa de chamados", valor: "-33,0%", delta: "-7,88pp", up: true, faixas: "Acelerar ≥ -30% · Meta ≥ -20% · Mínimo ≥ -10%" },
        ],
      },
      {
        nome: "Geral",
        kpis: [
          { rotulo: "SLA", valor: "90,53%", delta: "+0,17pp", up: true },
          { rotulo: "SLA VIP", valor: "73,39%", delta: "-0,81pp", up: false },
          { rotulo: "Taxa de chamados", valor: "-30,74%", delta: "-0,12pp", up: true },
        ],
      },
      {
        nome: "Outras frentes",
        kpis: [
          { rotulo: "SLA", valor: "88,18%", delta: "+0,44pp", up: true },
          { rotulo: "SLA VIP", valor: "62,50%", delta: "+0,68pp", up: true },
          { rotulo: "Taxa de chamados", valor: "-4,07%", delta: "-1,69pp", up: true },
        ],
      },
    ],
  },

  // 7 — CSAT destaque
  {
    id: "csat",
    oculto: true,
    tipo: "destaque",
    sobretitulo: "CSAT · 2025",
    valor: "71,97%",
    delta: "+4,14pp",
    emoji: "🎉",
    legenda: "Satisfação dos clientes em 2025",
  },

  // 8 — PI Planning
  {
    id: "pi-planning",
    oculto: true,
    tipo: "secao",
    titulo: "PI Planning",
    subtitulo: "P+ Redação",
  },

  // 10 — De olho no usuário (screenshot do produto)
  {
    id: "de-olho",
    oculto: true,
    tipo: "imagem",
    titulo: "De olho no usuário",
    imagem: "/slides/tela-disponibilizacao.png",
    legenda: "Configurações de disponibilização da proposta aos alunos",
    contain: true,
  },

  // Evolução do IQ (slide 9 do PPTX)
  {
    id: "iq-evolucao",
    tipo: "imagem",
    titulo: "Evolução do IQ",
    imagem: "/slides/iq-evolucao.png",
    legenda: "Índice de Qualidade por corretor ao longo do ano · IQ atual 14,44%",
    contain: true,
  },

  // 11 — Voz do Time
  { id: "voz-do-time", tipo: "secao", titulo: "Voz do Time" },

  // Incrementos entregues: UM SLIDE POR INCREMENTO (Review 107).
  // Cada item pode ter uma `imagem` (print do dev). Sem imagem, exibe só texto.
  {
    id: "inc-105102-tulio",
    tipo: "incremento",
    ref: "#105102",
    titulo: "Exibição de módulo nas solicitações — Aluno/Responsável",
    descricao:
      "A API passou a devolver o vínculo da proposta nos dois endpoints de solicitação: Listagem (GET /api/v1/request/Student) e Detalhes (GET /api/v1/request/{id}) agora retornam classType e className.",
    dev: "Túlio",
    ambiente: "PRD",
    imagem: "/slides/inc-105102-tulio.png",
  },
  {
    id: "inc-117164",
    tipo: "incremento",
    ref: "#117164",
    titulo: "Endpoint de alteração de classType",
    descricao:
      "Foi criado um novo endpoint para trocar o classType das propostas, de turma para módulo e vice-versa.",
    dev: "Túlio",
    ambiente: "PRD",
    imagem: "/slides/inc-117164.png",
  },
  {
    id: "inc-105099",
    tipo: "incremento",
    ref: "#105099",
    titulo: "Filtro de módulo em solicitações",
    descricao:
      "Criado o endpoint no BFF: GET /class/list-with-request-filters. Devolve as turmas e/ou módulos que tiveram solicitação de revisão/reescrita no ano selecionado (consome o list-with-request-filters da API, filtrando status = true).",
    dev: "Túlio",
    ambiente: "STAGING",
  },
  {
    id: "inc-105102-victor",
    tipo: "incremento",
    ref: "#105102",
    titulo: "Exibição de módulo nas solicitações — Aluno/Responsável",
    descricao:
      "Na Listagem de Solicitações, foi implementada a exibição do módulo vinculado à proposta nos cards, para os perfis Aluno e Responsável. Em Detalhes da Solicitação, o módulo também passa a ser exibido quando a proposta estiver vinculada a um módulo.",
    dev: "Victor",
    ambiente: "STAGING",
    imagem: "/slides/inc-105102-victor.png",
  },
  {
    id: "inc-105082-victor",
    tipo: "incremento",
    ref: "#105082",
    titulo: "Detalhes do Aluno — Identificação de Módulo(s) no Cabeçalho",
    descricao:
      "Na tela de Detalhes do Aluno, foi implementada a exibição dos Módulos vinculados ao estudante no cabeçalho, junto às informações de Ano/Série e Turma, permitindo identificar seus vínculos no ano letivo consultado.",
    dev: "Victor",
    ambiente: "STAGING",
    imagem: "/slides/inc-105082-victor.png",
  },
  {
    id: "inc-105077-maicon",
    tipo: "incremento",
    ref: "#105077",
    titulo: "Listagem de Alunos — Filtrar alunos por módulo",
    descricao:
      "Passou a permitir que a listagem de alunos retorne, em um único item, a turma regular e todos os módulos vinculados ao aluno, além de possibilitar a filtragem pelo campo classId, contemplando turmas e módulos.",
    dev: "Maicon",
    ambiente: "STAGING",
  },
  {
    id: "inc-105082-maicon",
    tipo: "incremento",
    ref: "#105082",
    titulo: "Detalhes do Aluno — Endpoint de turmas e módulos",
    descricao:
      "O endpoint foi atualizado para retornar uma coleção de turmas e módulos do aluno, incluindo a identificação do tipo (Turma Regular ou Módulo), possibilitando sua exibição no cabeçalho da aplicação.",
    dev: "Maicon",
    ambiente: "STAGING",
  },
  {
    id: "inc-111659",
    tipo: "incremento",
    ref: "#111659",
    titulo: "Média do grupo para alunos apenas em módulos",
    descricao:
      "Ao consultar “Todos”, a média do grupo podia deixar colegas dos módulos fora do cálculo. Ajustamos a API para considerar todos os módulos do aluno nos cards, gráfico e tabela na aba de Desempenho Geral, permitindo comparar o desempenho com o grupo correto.",
    dev: "Henrique",
    ambiente: "STAGING",
  },
  {
    id: "inc-112929",
    tipo: "incremento",
    ref: "#112929",
    titulo: "Investigação do tempo de correção",
    descricao:
      "Identificamos situações em que o tempo continua sendo contabilizado com o corretor fora da tela. Reproduzimos os cenários em staging e entregamos o diagnóstico com recomendações para melhorar o controle das sessões.",
    dev: "Henrique",
    ambiente: "STAGING",
    imagem: "/slides/inc-112929.png",
  },
  {
    id: "inc-114462",
    tipo: "incremento",
    ref: "#114462",
    titulo: "Inconsistência na associação e exibição de módulos nos detalhes",
    descricao:
      "O card da listagem mostrava a turma ou o módulo gravado na proposta. O filtro já usava a redação, então a lista filtrava certo e o card não exibia o módulo filtrado — estava buscando a informação na tabela errada.",
    dev: "Ronaldo",
    ambiente: "STAGING",
    imagem: "/slides/inc-114462.png",
  },
  {
    id: "inc-114461",
    tipo: "incremento",
    ref: "#114461",
    titulo: "Inconsistência na exibição de módulos e alunos vinculados na proposta",
    descricao:
      "O card da listagem mostrava a turma ou o módulo gravado na proposta. O filtro já usava a redação, então a lista filtrava certo e o card não exibia o módulo filtrado.",
    dev: "Ronaldo",
    ambiente: "STAGING",
    imagem: "/slides/inc-114461.png",
  },
  {
    id: "inc-117717",
    tipo: "incremento",
    ref: "#117717",
    titulo: "Detalhes do aluno exibindo turma não atual no cabeçalho",
    descricao:
      "Antes estava carregando uma turma à qual o aluno tinha vínculo antigo, mas que não estava mais vinculado.",
    dev: "Ronaldo",
    ambiente: "STAGING",
    imagem: "/slides/inc-117717.png",
  },
  {
    id: "inc-117506",
    tipo: "incremento",
    ref: "#117506",
    titulo: "Listagem de turmas nos filtros da redação",
    descricao:
      "Ajuste na listagem de turmas apresentada nos filtros da redação.",
    dev: "Ronaldo",
    ambiente: "STAGING",
    imagem: "/slides/inc-117506.png",
  },
  {
    id: "inc-118718",
    tipo: "incremento",
    ref: "#118718",
    titulo: "Correções SonarQube em check-legacy-policy.mjs",
    descricao:
      "Correção de issues SonarQube no arquivo .reversa/hooks/check-legacy-policy.mjs: String#replace() → String#replaceAll() e remoção de caractere de controle (regra S6324). Criado teste unitário para validar a correção, ampliando a cobertura de código.",
    dev: "Daniel Ralfes",
    ambiente: "STAGING",
    imagem: "/slides/inc-118718.png",
  },
  {
    id: "inc-114458",
    tipo: "incremento",
    ref: "#114458",
    titulo: "Filtros de Turmas impactando a visualização de alunos nos Módulos",
    descricao:
      "Corrigido o comportamento dos filtros no Step 3 (Alunos) do cadastro de propostas. Ao alternar entre Turmas e Módulos, os filtros aplicados anteriormente não interferem mais na listagem de alunos dos módulos.",
    dev: "Roberta",
    ambiente: "STAGING",
    imagem: "/slides/inc-114458.png",
  },
  {
    id: "inc-105077-roberta",
    tipo: "incremento",
    ref: "#105077",
    titulo: "Listagem de Alunos — Filtrar alunos por módulo",
    descricao:
      "Implementado o filtro de Módulos na Listagem de Alunos, permitindo buscar estudantes vinculados a um ou mais módulos. A tabela foi ajustada para exibir os vínculos dos alunos com Turmas e Módulos, incluindo um popup para consultar todos os vínculos quando houver mais de um.",
    dev: "Roberta",
    ambiente: "STAGING",
    imagem: "/slides/inc-105077-roberta.png",
  },
  {
    id: "inc-111644",
    tipo: "incremento",
    ref: "#111644",
    titulo: "Detalhes do Aluno — Desempenho Geral para Turma e Módulo(s)",
    descricao:
      "Implementada a seleção de Turma ou Módulo na área de Desempenho Geral, permitindo visualizar o desempenho do aluno de acordo com o vínculo selecionado. O gráfico, os textos de comparação e a legenda foram ajustados para refletir o contexto de Turma ou Módulo.",
    dev: "Roberta",
    ambiente: "STAGING",
    imagem: "/slides/inc-111644.png",
  },
  {
    id: "inc-iq-sonar",
    tipo: "incremento",
    ref: "#115535 +",
    titulo: "Melhorias de qualidade (IQ) no P+ Redação UI",
    descricao:
      "Durante a sprint, foram realizadas melhorias de qualidade no P+ Redação UI, com foco em acessibilidade e manutenibilidade apontadas pelo SonarQube: ajustes em componentes React para melhorar acessibilidade e navegação por teclado, além da consolidação e remoção de importações duplicadas, reduzindo code smells.",
    dev: "Roberta",
    ambiente: "STAGING",
    imagem: "/slides/inc-iq-sonar.png",
  },

  // 19 — Divisória: Qualidade
  { id: "secao-qualidade", tipo: "secao", titulo: "Qualidade" },

  // 20 — Indicadores de Qualidade (tabela + gráficos) — Review 107 (sprints 105-107)
  {
    id: "qualidade",
    tipo: "qualidade",
    titulo: "Indicadores de Qualidade",
    sprints: ["Sprint 105", "Sprint 106", "Sprint 107"],
    linhas: [
      { indicador: "Testes iniciais", valores: [70, 97, 77], notas: ["", "14 retroativo", "11 antecedentes"] },
      { indicador: "Retestes", valores: [10, 17, 8], notas: ["", "5 retroativo", ""] },
      { indicador: "Bugs", valores: [16, 8, 8], notas: ["5 retroativo · 2 reincidente", "1 reincidente", ""] },
      { indicador: "Pontos", valores: [10, 14, 14], notas: ["", "3 retroativo", "3 retroativo"] },
    ],
    totais: [
      { rotulo: "Total de testes iniciais", valor: 244 },
      { rotulo: "Total de retestes", valor: 35 },
      { rotulo: "Total de bugs", valor: 32 },
    ],
    execucoes: [80, 114, 85], // testes iniciais + retestes
    percRetestes: [0.13, 0.15, 0.09], // %
  },

  // 21 — Bugs por categoria (gráfico recriado do chart + insights)
  {
    id: "bugs-insights",
    tipo: "insights",
    titulo: "Bugs por categoria",
    // eixo X = sprints; séries = categorias de bug (como no gráfico original).
    // null = sem valor/N/A (não desenha barra), diferente de 0.
    series: ["Funcionalidade", "UI", "Negócio"],
    categorias: [
      { nome: "Sprint 105", valores: [12, 0, 5] },
      { nome: "Sprint 106", valores: [1, 1, 6] },
      { nome: "Sprint 107", valores: [6, null, 2] },
    ],
    itens: [
      { sprint: "Sprint 105", texto: "Forte concentração em Funcionalidade e Negócio. 2 bugs foram reincidentes." },
      { sprint: "Sprint 106", texto: "Forte concentração em Funcionalidade e Negócio. 2 bugs foram reincidentes." },
      { sprint: "Sprint 107", texto: "Principais desvios estiveram relacionados ao comportamento das funcionalidades implementadas." },
    ],
  },

  // 22 — Comparativo de Bugs entre Sprints (combo: testes + bugs + taxa)
  {
    id: "comparativo-bugs",
    tipo: "comparativo-bugs",
    titulo: "Comparativo de Bugs entre Sprints",
    sprints: ["Sprint 105", "Sprint 106", "Sprint 107"],
    testes: [70, 97, 77],
    bugs: [16, 8, 8],
    taxa: [22.86, 8.25, 10.39], // % de bugs sobre testes (Bugs / TestsCase)
  },

  // 23 — Divisória: Produtividade
  { id: "secao-produtividade", tipo: "secao", titulo: "Produtividade" },

  // 24 — Produtividade (DINÂMICA: dados ao vivo do Azure DevOps via /api/velocity)
  {
    id: "produtividade-v2",
    tipo: "produtividade-dinamica",
    titulo: "Velocity da Squad",
    legendaFormulas: [
      "% Estimado = Completed / Planned",
      "% Assumido = Completed / (Completed + Incomplete)",
    ],
  },

  // 25 — Encerramento
  {
    id: "obrigado",
    tipo: "destaque",
    valor: "Obrigado!",
    legenda: "Squad Beta · Sprint 107",
  },
];
