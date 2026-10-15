// Mini-défis énergisants. Première série rédigée pour Canif (contenu original,
// à relire par le porteur : décision D19). Aucun défi n'impose de contact physique.

export type Defi = { texte: string; categorie: string; minutes: number; assis: boolean };

export const DEFIS: Defi[] = [
  // Bouger (doucement)
  { categorie: "Bouger", minutes: 1, assis: false, texte: "Tout le monde debout : étirez-vous comme au réveil pendant vingt secondes, puis rasseyez-vous ailleurs qu'à votre place." },
  { categorie: "Bouger", minutes: 2, assis: false, texte: "Changez de place avec une personne qui porte une couleur en commun avec vous." },
  { categorie: "Bouger", minutes: 3, assis: false, texte: "Sans parler, rangez-vous par ordre de mois d'anniversaire, de janvier à décembre." },
  { categorie: "Bouger", minutes: 2, assis: true, texte: "En cercle : une personne fait un geste, tout le monde le reproduit, puis la suivante en invente un autre." },
  { categorie: "Bouger", minutes: 2, assis: false, texte: "Marchez dans la salle ; au signal, arrêtez-vous et dites un mot positif à la personne la plus proche." },
  { categorie: "Bouger", minutes: 1, assis: true, texte: "Saluez trois personnes d'une façon que vous inventez, sans vous toucher." },
  // Réfléchir vite
  { categorie: "Réfléchir vite", minutes: 1, assis: true, texte: "En trente secondes, citez cinq objets de la salle qui commencent par la même lettre." },
  { categorie: "Réfléchir vite", minutes: 3, assis: true, texte: "Comptez jusqu'à vingt en groupe, une voix à la fois, sans ordre fixé : si deux personnes parlent ensemble, on repart de un." },
  { categorie: "Réfléchir vite", minutes: 2, assis: true, texte: "Trouvez trois points communs avec votre voisin ou voisine en une minute." },
  { categorie: "Réfléchir vite", minutes: 3, assis: true, texte: "En binôme, inventez le nom et le slogan d'un objet inutile mais génial." },
  { categorie: "Réfléchir vite", minutes: 2, assis: true, texte: "Racontez votre dernier repas uniquement avec des gestes ; les autres devinent." },
  { categorie: "Réfléchir vite", minutes: 2, assis: true, texte: "Chacun dit un mot à tour de rôle : ensemble, construisez une phrase qui a du sens." },
  // Coopérer
  { categorie: "Coopérer", minutes: 3, assis: false, texte: "Formez un carré parfait avec tout le groupe, sans parler." },
  { categorie: "Coopérer", minutes: 3, assis: true, texte: "Par trois, construisez la plus haute tour possible avec ce qui se trouve sur la table, en deux minutes." },
  { categorie: "Coopérer", minutes: 4, assis: true, texte: "Histoire collective : chacun ajoute une phrase qui commence alternativement par « Heureusement » et « Malheureusement »." },
  { categorie: "Coopérer", minutes: 3, assis: true, texte: "En sous-groupes, trouvez un nom et un cri de ralliement pour votre équipe, puis présentez-les." },
  // Se poser
  { categorie: "Se poser", minutes: 1, assis: true, texte: "Une minute de silence, les yeux fermés si vous le souhaitez : écoutez tous les sons autour de vous." },
  { categorie: "Se poser", minutes: 1, assis: true, texte: "Trois respirations lentes ensemble : inspirez sur quatre temps, expirez sur six." },
  { categorie: "Se poser", minutes: 2, assis: true, texte: "Écrivez sur un post-it une chose qui s'est bien passée depuis le début de la séance, puis lisez-la à voix haute si vous le souhaitez." },
];
