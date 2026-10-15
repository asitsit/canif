// Cadres de rôles connus, proposés comme point de départ.
// Les noms des cadres et des rôles sont ceux d'usage courant ; les descriptions
// courtes entre parenthèses sont rédigées pour Canif.

export type Cadre = { id: string; nom: string; description: string; roles: string[] };

export const CADRES: Cadre[] = [
  {
    id: "reunion",
    nom: "Rôles de réunion",
    description: "Les rôles classiques pour qu'une réunion reste efficace.",
    roles: ["Animation", "Gardien du temps", "Prise de notes", "Avocat du diable", "Observation", "Porte-parole"],
  },
  {
    id: "chapeaux",
    nom: "Six chapeaux de Bono",
    description: "Méthode d'Edward de Bono : chacun regarde le sujet sous un seul angle.",
    roles: [
      "Chapeau blanc (faits et informations)",
      "Chapeau rouge (émotions et intuitions)",
      "Chapeau noir (risques et prudence)",
      "Chapeau jaune (bénéfices et optimisme)",
      "Chapeau vert (idées nouvelles)",
      "Chapeau bleu (organisation du débat)",
    ],
  },
  {
    id: "disney",
    nom: "Stratégie Disney",
    description: "Trois regards successifs sur une idée, popularisés par Robert Dilts.",
    roles: [
      "Rêveur (imagine sans limite)",
      "Réaliste (cherche comment faire)",
      "Critique (repère ce qui peut échouer)",
    ],
  },
  {
    id: "belbin",
    nom: "Rôles d'équipe de Belbin",
    description: "Les neuf rôles d'équipe décrits par Meredith Belbin (traductions françaises variables).",
    roles: [
      "Concepteur (idées originales)",
      "Explorateur de ressources (contacts, opportunités)",
      "Coordinateur (clarifie les objectifs)",
      "Propulseur (donne l'élan)",
      "Évaluateur (analyse les options)",
      "Soutien (veille à l'entente)",
      "Organisateur (transforme en plan d'action)",
      "Perfectionneur (traque les erreurs)",
      "Spécialiste (apporte l'expertise)",
    ],
  },
  {
    id: "sous-groupe",
    nom: "Travail en sous-groupe",
    description: "Pour qu'un petit groupe s'organise seul pendant un exercice.",
    roles: ["Porte-parole", "Secrétaire", "Gardien du temps", "Facilitateur", "Gardien de la consigne"],
  },
];
