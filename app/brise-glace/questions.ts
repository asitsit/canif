// Questions brise-glace, rangées par intention.
// Première série rédigée pour Canif (contenu original, à relire par le porteur : décision D19).

export type Intention = { id: string; nom: string; description: string; questions: string[] };

export const INTENTIONS: Intention[] = [
  {
    id: "connaissance",
    nom: "Faire connaissance",
    description: "Pour un groupe qui se connaît peu.",
    questions: [
      "Quel métier rêviez-vous de faire quand vous étiez enfant ?",
      "Quel objet de votre bureau raconte quelque chose de vous ?",
      "Quelle compétence avez-vous apprise en dehors du travail ?",
      "Quel est le dernier endroit qui vous a surpris ?",
      "Quel conseil donneriez-vous à une personne qui arrive dans votre équipe ?",
      "Qu'est-ce qui vous a amené à votre métier actuel ?",
      "Quelle chose peu connue sur vous acceptez-vous de partager ?",
      "Quel est votre rituel pour bien commencer une journée ?",
      "Quelle langue ou quel instrument aimeriez-vous apprendre ?",
      "Quelle personne vous a appris quelque chose d'important dans votre parcours ?",
    ],
  },
  {
    id: "detente",
    nom: "Détendre l'atmosphère",
    description: "Des questions légères pour faire sourire.",
    questions: [
      "Si cette réunion était un plat, lequel serait-ce ?",
      "Quel super-pouvoir très modeste vous rendrait service au quotidien ?",
      "Quelle chanson vous met de bonne humeur à coup sûr ?",
      "Si vous pouviez supprimer une seule tâche administrative, laquelle choisiriez-vous ?",
      "Quel émoji résume le mieux votre semaine ?",
      "Quel est votre en-cas préféré pour tenir une longue journée ?",
      "Si votre équipe était un groupe de musique, quel serait son nom ?",
      "Quelle application de votre téléphone utilisez-vous beaucoup trop ?",
      "Quelle petite chose vous a fait sourire ces derniers jours ?",
      "Quel objet emporteriez-vous sur une île déserte pour vous ennuyer le moins possible ?",
    ],
  },
  {
    id: "meteo",
    nom: "Météo intérieure",
    description: "Prendre la température du groupe en début de séance.",
    questions: [
      "Si votre énergie du moment était une météo, laquelle serait-ce ?",
      "De 1 à 10, quelle est votre disponibilité d'esprit pour cette séance ?",
      "Qu'est-ce qui occupe votre tête en arrivant, et pouvez-vous le poser le temps de l'atelier ?",
      "En un mot, comment arrivez-vous aujourd'hui ?",
      "Quelle couleur correspond à votre humeur du jour ?",
      "De quoi avez-vous besoin pour être pleinement présent pendant cette séance ?",
      "Quelle bonne nouvelle, même petite, pouvez-vous partager ?",
      "Quel paysage ressemble à votre état d'esprit ce matin ?",
    ],
  },
  {
    id: "projection",
    nom: "Se projeter",
    description: "Faire émerger les attentes et l'envie d'avancer.",
    questions: [
      "Qu'est-ce qui ferait de cet atelier un moment utile pour vous ?",
      "Quelle question aimeriez-vous voir résolue d'ici la fin de la séance ?",
      "Dans un an, de quoi aimeriez-vous être fier dans ce projet ?",
      "Quel titre de journal aimeriez-vous lire sur notre équipe dans six mois ?",
      "Qu'êtes-vous prêt à apporter au groupe aujourd'hui ?",
      "Quelle est votre plus grande crainte pour ce projet, et votre plus grand espoir ?",
      "Si vous aviez une baguette magique pour notre organisation, que changeriez-vous en premier ?",
      "Qu'aimeriez-vous emporter en sortant de cette salle ?",
    ],
  },
  {
    id: "equipe",
    nom: "Réfléchir au travail",
    description: "Ouvrir une discussion sur la façon de travailler ensemble.",
    questions: [
      "Quelle est la meilleure réunion à laquelle vous ayez participé, et pourquoi ?",
      "Qu'est-ce qui vous donne de l'énergie dans votre travail ?",
      "Quelle habitude de l'équipe faut-il absolument garder ?",
      "Quel petit changement améliorerait vraiment votre quotidien au travail ?",
      "À quel moment avez-vous appris beaucoup en peu de temps ?",
      "Quelle réussite récente de l'équipe mérite d'être célébrée ?",
      "Qu'est-ce qui vous aide à bien travailler avec une personne que vous connaissez peu ?",
      "Quelle erreur vous a le plus appris ?",
    ],
  },
  {
    id: "cloture",
    nom: "Clôturer",
    description: "Pour terminer une séance.",
    questions: [
      "En un mot, comment repartez-vous ?",
      "Que ferez-vous dès demain avec ce que nous avons produit ?",
      "Qu'avez-vous appris de quelqu'un dans ce groupe aujourd'hui ?",
      "Quel moment de la séance retenez-vous ?",
      "Quelle question reste ouverte pour vous ?",
      "Que diriez-vous à un collègue absent pour résumer cette séance ?",
    ],
  },
];
