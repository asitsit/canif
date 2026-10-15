// Catalogue des outils, recopié depuis docs/01-catalogue.md (qui fait foi).
// Si un outil est ajouté, retiré ou renommé, modifier les deux fichiers.
//
// Chaque outil a :
//  - code      : le code du catalogue (A1, C14...)
//  - slug      : l'adresse de sa page (par exemple "minuteur" donne /minuteur),
//                en minuscules, sans accents ni espaces
//  - nom       : le nom affiché
//  - detail    : une précision facultative
//  - memoire   : true si l'outil garde des données sur le serveur (Supabase)
//  - stockage  : pour les outils à mémoire, ce qui est enregistré
//  - pret      : true quand l'outil est construit et utilisable

export type Outil = {
  code: string;
  slug: string;
  nom: string;
  detail?: string;
  memoire?: boolean;
  stockage?: string;
  pret?: boolean;
};

export type Rubrique = {
  id: string;
  titre: string;
  description: string;
  outils: Outil[];
};

// Navigation par moment de l'atelier (proposition D12 du cadrage).
export const rubriques: Rubrique[] = [
  {
    id: "avant",
    titre: "Avant l'atelier",
    description: "Préparer, inviter, organiser la salle.",
    outils: [
      { code: "A1", slug: "qr-code", nom: "Générateur de QR code", detail: "Couleur, logo, export PNG et SVG" },
      { code: "A2", slug: "checklist-technique", nom: "Checklist technique d'atelier" },
      { code: "A3", slug: "agenda", nom: "Générateur d'agenda", detail: "Étapes, durées, horaires calculés" },
      { code: "A4", slug: "tour-de-table", nom: "Durée d'un tour de table" },
      { code: "A5", slug: "plan-de-salle", nom: "Plan de salle" },
      { code: "A6", slug: "liste-materiel", nom: "Liste de matériel à emporter" },
      { code: "A7", slug: "invitation", nom: "Message d'invitation" },
      { code: "A8", slug: "fond-visio", nom: "Fond de visio personnalisé" },
      { code: "A9", slug: "fuseaux-horaires", nom: "Convertisseur de fuseaux horaires" },
    ],
  },
  {
    id: "jeux",
    titre: "Briser la glace et jeux",
    description: "Lancer la dynamique du groupe.",
    outils: [
      { code: "B1", slug: "brise-glace", nom: "Question brise-glace", detail: "Tirage par intention" },
      { code: "B2", slug: "bingo", nom: "Bingo d'atelier imprimable" },
      { code: "B6", slug: "mini-defis", nom: "Mini-défis énergisants" },
      { code: "B7", slug: "tirage-lettre", nom: "Tirage de lettre ou de thème" },
      {
        code: "B8",
        slug: "qui-est-qui",
        nom: "Qui est qui ?",
        detail: "Chacun renseigne 3 faits, le groupe devine",
        memoire: true,
        stockage: "les pseudos et les faits saisis",
      },
      { code: "B9", slug: "mots-croises", nom: "Mots croisés", detail: "Générateur de grille imprimable" },
    ],
  },
  {
    id: "pendant",
    titre: "Pendant l'atelier",
    description: "Temps, groupes, interaction en direct, création visuelle.",
    outils: [
      // Temps et rythme
      { code: "C1", slug: "minuteur", nom: "Minuteur", detail: "Compte à rebours", pret: true },
      { code: "C2", slug: "minuteur-etapes", nom: "Minuteur d'étapes enchaînées" },
      { code: "C3", slug: "chrono-parole", nom: "Chronomètre de parole", detail: "Vert, orange, rouge" },
      { code: "C4", slug: "pause", nom: "Écran de pause projetable" },
      { code: "C5", slug: "pomodoro", nom: "Pomodoro" },
      { code: "C6", slug: "minuteurs-paralleles", nom: "Minuteurs parallèles", detail: "Pour les sous-groupes" },
      // Groupes et tirage
      { code: "C8", slug: "roue", nom: "Roue de noms" },
      { code: "C9", slug: "equipes", nom: "Générateur d'équipes" },
      { code: "C10", slug: "equipes-parametres", nom: "Équipes avec paramètres", detail: "Service, niveau, site" },
      { code: "C11", slug: "ordre-de-passage", nom: "Ordre de passage" },
      { code: "C12", slug: "des", nom: "Dés personnalisables" },
      { code: "C13", slug: "pile-ou-face", nom: "Pile ou face" },
      {
        code: "C14",
        slug: "jeu-de-cartes",
        nom: "Jeu de cartes en lien unique",
        detail: "40 cartes maximum, conservé 7 jours",
        memoire: true,
        stockage: "le paquet de cartes et ses images",
      },
      { code: "C15", slug: "tirage-roles", nom: "Tirage de rôles" },
      // Interaction en direct
      { code: "C16", slug: "buzzer", nom: "Buzzer", memoire: true, stockage: "les pseudos et l'heure d'arrivée de chaque buzz" },
      { code: "C17", slug: "sondage", nom: "Sondage express", memoire: true, stockage: "la question et les votes" },
      { code: "C18", slug: "vote-a-points", nom: "Vote à points", memoire: true, stockage: "les options et les votes" },
      { code: "C19", slug: "nuage-de-mots", nom: "Nuage de mots en direct", memoire: true, stockage: "les mots saisis" },
      { code: "C20", slug: "nuage-depuis-texte", nom: "Nuage de mots depuis un texte" },
      { code: "C21", slug: "questions-anonymes", nom: "Questions anonymes", memoire: true, stockage: "les questions et les votes" },
      { code: "C25", slug: "echelle", nom: "Échelle de position", detail: "Curseur de 0 à 10", memoire: true, stockage: "les valeurs saisies" },
      { code: "C27", slug: "oui-non", nom: "Vote oui / non", memoire: true, stockage: "les votes" },
      // Création visuelle
      { code: "C28", slug: "dessin", nom: "Page blanche de dessin" },
      { code: "C29", slug: "tableau-blanc", nom: "Tableau blanc simple", detail: "Formes, texte, flèches" },
      { code: "C31", slug: "suppression-fond", nom: "Suppression de fond", detail: "Dans le navigateur" },
      { code: "C32", slug: "compresseur-images", nom: "Compresseur et redimensionneur d'images" },
      { code: "C33", slug: "palette", nom: "Palette de couleurs" },
      { code: "C34", slug: "convertisseur-images", nom: "Convertisseur d'images", detail: "PNG, JPG, WebP" },
    ],
  },
  {
    id: "apres",
    titre: "Après l'atelier",
    description: "Restituer et remercier.",
    outils: [
      { code: "D1", slug: "compte-rendu", nom: "Modèle de compte rendu" },
      { code: "D4", slug: "synthese", nom: "Synthèse structurée", detail: "Règles simples, sans IA" },
      { code: "D5", slug: "export", nom: "Export en image ou PDF" },
      { code: "D6", slug: "remerciement", nom: "E-mail de remerciement" },
    ],
  },
  {
    id: "projet",
    titre: "Consultant et chef de projet",
    description: "Prioriser, décider, planifier.",
    outils: [
      { code: "E1", slug: "eisenhower", nom: "Matrice d'Eisenhower" },
      { code: "E2", slug: "impact-effort", nom: "Matrice impact / effort" },
      { code: "E3", slug: "canevas", nom: "Canevas", detail: "SWOT, persona, carte d'empathie, Business Model Canvas" },
      { code: "E4", slug: "decision-ponderee", nom: "Matrice de décision pondérée" },
      { code: "E5", slug: "selection-mission", nom: "Matrice de sélection de mission" },
      { code: "E6", slug: "raci", nom: "RACI" },
      { code: "E7", slug: "parties-prenantes", nom: "Cartographie des parties prenantes" },
      { code: "E8", slug: "cinq-pourquoi", nom: "Arbre des 5 pourquoi" },
      { code: "E9", slug: "ishikawa", nom: "Diagramme d'Ishikawa" },
      { code: "E10", slug: "retrospective", nom: "Rétrospective", detail: "Commencer, arrêter, continuer" },
      { code: "E11", slug: "roadmap", nom: "Roadmap simple" },
      { code: "E12", slug: "gantt", nom: "Gantt simple" },
      { code: "E13", slug: "retro-planning", nom: "Rétro-planning" },
    ],
  },
  {
    id: "entrepreneur",
    titre: "Entrepreneur",
    description: "Chiffrer et présenter son activité.",
    outils: [
      { code: "F1", slug: "tjm", nom: "Calculateur de TJM" },
      { code: "F2", slug: "rentabilite-mission", nom: "Rentabilité de mission" },
      { code: "F3", slug: "simulateur-prix", nom: "Simulateur de prix", detail: "Forfait ou régie" },
      { code: "F5", slug: "pitch", nom: "Canevas de pitch de 2 minutes" },
      { code: "F8", slug: "point-mort", nom: "Calcul du point mort" },
      { code: "F10", slug: "signature-email", nom: "Signature d'e-mail" },
    ],
  },
  {
    id: "utilitaires",
    titre: "Utilitaires",
    description: "Petits outils du quotidien.",
    outils: [
      { code: "G1", slug: "compteur-mots", nom: "Compteur de mots et de caractères" },
      { code: "G4", slug: "atelier-pdf", nom: "Atelier PDF", detail: "Fusion, compression" },
      { code: "G5", slug: "extracteur-emails", nom: "Extracteur d'adresses e-mail" },
      { code: "G6", slug: "listes", nom: "Traitement de listes", detail: "Tri, doublons, majuscules" },
      { code: "G7", slug: "texte-de-test", nom: "Générateur de texte de test" },
      { code: "G8", slug: "jours-ouvres", nom: "Jours ouvrés entre deux dates" },
    ],
  },
];

// Liste à plat de tous les outils (pratique pour chercher par adresse).
export const tousLesOutils: Outil[] = rubriques.flatMap((r) => r.outils);

// Retrouve un outil et sa rubrique à partir de son adresse.
export function trouverOutil(slug: string) {
  for (const rubrique of rubriques) {
    const outil = rubrique.outils.find((o) => o.slug === slug);
    if (outil) return { outil, rubrique };
  }
  return null;
}
