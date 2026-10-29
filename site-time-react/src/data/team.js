// Dados do time — Tribo Avaliações | Squad Beta
//
// FONTE ÚNICA das fotos: a pasta ../fotos-equipe (originais extraídas do slide).
// Dentro do projeto há um junction public/fotos-equipe -> ../fotos-equipe,
// então as fotos são servidas em /fotos-equipe/* sem cópia duplicada.
//
// Mapa pessoa -> arquivo (para referência ao editar):
//   Kaique=image7  Rafael=image5  Mayara=image9  Tinoco=image10
//   Guilherme=image8  Lucas=image21  Luciano=image4  Rodolfo=image6
//   Túlio=image3  Roberta=image11  Victor=image12  Ronaldo=image17
//   Maicon=image18  Daniel=image19  Henrique=image20  Rita=image2
//   Pamela=image16  Luana=image1  Priscila=image13  Mariana=image14
//   Rafaella=image15

const F = "/fotos-equipe";

export const TEAM = [
  {
    setor: "Produto",
    membros: [
      { nome: "Kaique", cargo: "Especialista de Produto", foto: `${F}/image7.png` },
    ],
  },
  {
    setor: "Arquitetura",
    membros: [
      { nome: "Rafael", cargo: "Arquiteto", foto: `${F}/image5.png` },
    ],
  },
  {
    setor: "Design",
    membros: [
      { nome: "Mayara", cargo: "Designer", foto: `${F}/image9.png` },
      { nome: "Tinoco", cargo: "Coord. Designer", foto: `${F}/image10.jpeg` },
    ],
  },
  {
    setor: "Gerência",
    membros: [
      { nome: "Guilherme", cargo: "Gerente de Produto", foto: `${F}/image8.png` },
      { nome: "Lucas", cargo: "Gerente de Engenharia", foto: `${F}/image21.jpeg` },
    ],
  },
  {
    setor: "Engenharia",
    destaque: true, // setor largo (linha inteira)
    membros: [
      { nome: "Luciano", cargo: "Coordenador", foto: `${F}/image4.png` },
      { nome: "Rodolfo", cargo: "Tech Lead", foto: `${F}/image6.png`, lider: true },
      { nome: "Túlio", cargo: "Desenvolvedor", foto: `${F}/image3.png` },
      { nome: "Roberta", cargo: "Desenvolvedora", foto: `${F}/image11.png` },
      { nome: "Victor", cargo: "Desenvolvedor", foto: `${F}/image12.jpeg` },
      { nome: "Ronaldo", cargo: "Desenvolvedor", foto: `${F}/image17.jpeg` },
      { nome: "Maicon", cargo: "Desenvolvedor", foto: `${F}/image18.jpeg` },
      { nome: "Daniel", cargo: "Desenvolvedor", foto: `${F}/image19.jpeg` },
      { nome: "Henrique", cargo: "Desenvolvedor", foto: `${F}/image20.jpeg` },
    ],
  },
  {
    setor: "Qualidade",
    membros: [
      { nome: "Rita", cargo: "QA", foto: `${F}/image2.png` },
      { nome: "Pamela", cargo: "QA", foto: `${F}/image16.jpeg` },
    ],
  },
  {
    setor: "Suporte / Sustentação",
    membros: [
      { nome: "Luana", cargo: "N2", foto: `${F}/image1.jpeg` },
      { nome: "Priscila", cargo: "N2", foto: `${F}/image13.jpeg` },
      { nome: "Mariana", cargo: "N2", foto: `${F}/image14.jpeg` },
    ],
  },
  {
    setor: "Área de redação",
    membros: [
      { nome: "Rafaella", cargo: "Especialista em Redação", foto: `${F}/image15.jpeg` },
    ],
  },
];
