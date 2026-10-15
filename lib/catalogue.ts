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
//  - pret      : true quand l'outil est construit et utilisable (pastille « En ligne »)
//  - motsCles  : synonymes utilisés par la recherche (« timer » trouve le minuteur)

export type Outil = {
  code: string;
  slug: string;
  nom: string;
  detail?: string;
  memoire?: boolean;
  stockage?: string;
  pret?: boolean;
  motsCles?: string;
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
      { code: "A1", slug: "qr-code", nom: "Générateur de QR code", detail: "Couleur, logo, export PNG et SVG", motsCles: "flashcode lien code barre" },
      { code: "A2", slug: "checklist-technique", nom: "Checklist technique d'atelier", motsCles: "liste vérification matériel préparation", pret: true },
      { code: "A3", slug: "agenda", nom: "Générateur d'agenda", detail: "Étapes, durées, horaires calculés", motsCles: "programme déroulé ordre du jour planning horaires", pret: true },
      { code: "A4", slug: "tour-de-table", nom: "Durée d'un tour de table", motsCles: "présentation durée calcul", pret: true },
      { code: "A5", slug: "plan-de-salle", nom: "Plan de salle", motsCles: "disposition tables chaises" },
      { code: "A6", slug: "liste-materiel", nom: "Liste de matériel à emporter", motsCles: "fournitures checklist", pret: true },
      { code: "A7", slug: "invitation", nom: "Message d'invitation", motsCles: "email mail convocation", pret: true },
      { code: "A8", slug: "fond-visio", nom: "Fond de visio personnalisé", motsCles: "teams zoom meet arrière-plan", pret: true },
      { code: "A9", slug: "fuseaux-horaires", nom: "Convertisseur de fuseaux horaires", motsCles: "heure international décalage", pret: true },
    ],
  },
  {
    id: "jeux",
    titre: "Briser la glace et jeux",
    description: "Lancer la dynamique du groupe.",
    outils: [
      { code: "B1", slug: "brise-glace", nom: "Question brise-glace", detail: "Tirage par intention", motsCles: "icebreaker inclusion question", pret: true },
      { code: "B2", slug: "bingo", nom: "Bingo d'atelier imprimable", motsCles: "jeu imprimable", pret: true },
      { code: "B6", slug: "mini-defis", nom: "Mini-défis énergisants", motsCles: "énergiseur energizer jeu", pret: true },
      { code: "B7", slug: "tirage-lettre", nom: "Tirage de lettre ou de thème", motsCles: "hasard aléatoire thème", pret: true },
      {
        code: "B8",
        slug: "qui-est-qui",
        motsCles: "jeu devinette connaissance",
        nom: "Qui est qui ?",
        detail: "Chacun renseigne 3 faits, le groupe devine",
        memoire: true,
        stockage: "les pseudos et les faits saisis",
      },
      { code: "B9", slug: "mots-croises", nom: "Mots croisés", detail: "Générateur de grille imprimable", motsCles: "grille jeu vocabulaire", pret: true },
    ],
  },
  {
    id: "pendant",
    titre: "Pendant l'atelier",
    description: "Temps, groupes, interaction en direct, création visuelle.",
    outils: [
      // Temps et rythme
      { code: "C1", slug: "minuteur", nom: "Minuteur", detail: "Compte à rebours", pret: true, motsCles: "timer compte à rebours chrono temps" },
      { code: "C2", slug: "minuteur-etapes", nom: "Minuteur d'étapes enchaînées", motsCles: "timer séquence enchaînement temps", pret: true },
      { code: "C3", slug: "chrono-parole", nom: "Chronomètre de parole", detail: "Temps par intervenant, avance ou retard", pret: true, motsCles: "timer temps de parole intervenants orateurs avance retard" },
      { code: "C4", slug: "pause", nom: "Écran de pause projetable", pret: true, motsCles: "café break reprise" },
      { code: "C5", slug: "pomodoro", nom: "Pomodoro", pret: true, motsCles: "timer concentration focus travail" },
      { code: "C6", slug: "minuteurs-paralleles", nom: "Minuteurs parallèles", detail: "Pour les sous-groupes", motsCles: "sous-groupes timer plusieurs", pret: true },
      // Groupes et tirage
      { code: "C8", slug: "roue", nom: "Roue de noms", pret: true, motsCles: "hasard aléatoire tirage au sort spinner" },
      { code: "C9", slug: "equipes", nom: "Générateur d'équipes", pret: true, motsCles: "groupes hasard aléatoire répartition" },
      { code: "C10", slug: "equipes-parametres", nom: "Équipes avec paramètres", detail: "Service, niveau, site", motsCles: "groupes critères mixité", pret: true },
      { code: "C11", slug: "ordre-de-passage", nom: "Ordre de passage", pret: true, motsCles: "hasard aléatoire tirage au sort ordre" },
      { code: "C12", slug: "des", nom: "Dés personnalisables", motsCles: "dé hasard aléatoire jeu", pret: true },
      { code: "C13", slug: "pile-ou-face", nom: "Pile ou face", pret: true, motsCles: "pièce hasard aléatoire" },
      {
        code: "C14",
        slug: "jeu-de-cartes",
        motsCles: "cartes pioche photolangage",
        nom: "Jeu de cartes en lien unique",
        detail: "40 cartes maximum, conservé 7 jours",
        memoire: true,
        stockage: "le paquet de cartes et ses images",
      },
      { code: "C15", slug: "tirage-roles", nom: "Tirage de rôles", pret: true, motsCles: "hasard aléatoire rôles chapeaux bono belbin" },
      // Interaction en direct
      { code: "C16", slug: "buzzer", nom: "Buzzer", memoire: true, stockage: "les pseudos et l'heure d'arrivée de chaque buzz", motsCles: "jeu quiz rapidité" },
      { code: "C17", slug: "sondage", nom: "Sondage express", memoire: true, stockage: "la question et les votes", motsCles: "vote question réponse" },
      { code: "C18", slug: "vote-a-points", nom: "Vote à points", memoire: true, stockage: "les options et les votes", motsCles: "priorisation dot voting gommettes" },
      { code: "C19", slug: "nuage-de-mots", nom: "Nuage de mots en direct", memoire: true, stockage: "les mots saisis", motsCles: "word cloud mots" },
      { code: "C20", slug: "nuage-depuis-texte", nom: "Nuage de mots depuis un texte", motsCles: "word cloud fréquence", pret: true },
      { code: "C21", slug: "questions-anonymes", nom: "Questions anonymes", memoire: true, stockage: "les questions et les votes", motsCles: "q&a questions réponses" },
      { code: "C25", slug: "echelle", nom: "Échelle de position", detail: "Curseur de 0 à 10", memoire: true, stockage: "les valeurs saisies", motsCles: "curseur position note" },
      { code: "C27", slug: "oui-non", nom: "Vote oui / non", memoire: true, stockage: "les votes", motsCles: "vote accord" },
      // Création visuelle
      { code: "C28", slug: "dessin", nom: "Page blanche de dessin", motsCles: "croquis paint", pret: true },
      { code: "C29", slug: "tableau-blanc", nom: "Tableau blanc simple", detail: "Formes, texte, flèches", motsCles: "whiteboard schéma", pret: true },
      { code: "C31", slug: "suppression-fond", nom: "Suppression de fond", detail: "Dans le navigateur", motsCles: "détourage photo image" },
      { code: "C32", slug: "compresseur-images", nom: "Compresseur et redimensionneur d'images", motsCles: "réduire poids photo", pret: true },
      { code: "C33", slug: "palette", nom: "Palette de couleurs", motsCles: "couleurs charte", pret: true },
      { code: "C34", slug: "convertisseur-images", nom: "Convertisseur d'images", detail: "PNG, JPG, WebP", motsCles: "format photo jpg png webp", pret: true },
    ],
  },
  {
    id: "apres",
    titre: "Après l'atelier",
    description: "Restituer et remercier.",
    outils: [
      { code: "D1", slug: "compte-rendu", nom: "Modèle de compte rendu", motsCles: "cr synthèse réunion", pret: true },
      { code: "D4", slug: "synthese", nom: "Synthèse structurée", detail: "Règles simples, sans IA", motsCles: "résumé", pret: true },
      { code: "D5", slug: "export", nom: "Export en image ou PDF", motsCles: "pdf image" },
      { code: "D6", slug: "remerciement", nom: "E-mail de remerciement", motsCles: "email mail merci", pret: true },
    ],
  },
  {
    id: "projet",
    titre: "Consultant et chef de projet",
    description: "Prioriser, décider, planifier.",
    outils: [
      { code: "E1", slug: "eisenhower", nom: "Matrice d'Eisenhower", motsCles: "priorisation urgent important", pret: true },
      { code: "E2", slug: "impact-effort", nom: "Matrice impact / effort", motsCles: "priorisation matrice", pret: true },
      { code: "E3", slug: "canevas", nom: "Canevas", detail: "SWOT, persona, carte d'empathie, Business Model Canvas", motsCles: "swot persona empathie business model canvas", pret: true },
      { code: "E4", slug: "decision-ponderee", nom: "Matrice de décision pondérée", motsCles: "critères choix", pret: true },
      { code: "E5", slug: "selection-mission", nom: "Matrice de sélection de mission", motsCles: "choix client", pret: true },
      { code: "E6", slug: "raci", nom: "RACI", motsCles: "responsabilités rôles", pret: true },
      { code: "E7", slug: "parties-prenantes", nom: "Cartographie des parties prenantes", motsCles: "stakeholders acteurs", pret: true },
      { code: "E8", slug: "cinq-pourquoi", nom: "Arbre des 5 pourquoi", motsCles: "5 pourquoi cause racine", pret: true },
      { code: "E9", slug: "ishikawa", nom: "Diagramme d'Ishikawa", motsCles: "arête de poisson causes", pret: true },
      { code: "E10", slug: "retrospective", nom: "Rétrospective", detail: "Commencer, arrêter, continuer", motsCles: "rétro agile commencer arrêter continuer", pret: true },
      { code: "E11", slug: "roadmap", nom: "Roadmap simple", motsCles: "feuille de route", pret: true },
      { code: "E12", slug: "gantt", nom: "Gantt simple", motsCles: "planning projet", pret: true },
      { code: "E13", slug: "retro-planning", nom: "Rétro-planning", motsCles: "planning échéances", pret: true },
    ],
  },
  {
    id: "entrepreneur",
    titre: "Entrepreneur",
    description: "Chiffrer et présenter son activité.",
    outils: [
      { code: "F1", slug: "tjm", nom: "Calculateur de TJM", motsCles: "taux journalier freelance tarif", pret: true },
      { code: "F2", slug: "rentabilite-mission", nom: "Rentabilité de mission", motsCles: "marge", pret: true },
      { code: "F3", slug: "simulateur-prix", nom: "Simulateur de prix", detail: "Forfait ou régie", motsCles: "tarif devis forfait régie", pret: true },
      { code: "F5", slug: "pitch", nom: "Canevas de pitch de 2 minutes", motsCles: "présentation elevator", pret: true },
      { code: "F8", slug: "point-mort", nom: "Calcul du point mort", motsCles: "seuil de rentabilité", pret: true },
      { code: "F10", slug: "signature-email", nom: "Signature d'e-mail", motsCles: "mail signature", pret: true },
    ],
  },
  {
    id: "utilitaires",
    titre: "Utilitaires",
    description: "Petits outils du quotidien.",
    outils: [
      { code: "G1", slug: "compteur-mots", nom: "Compteur de mots et de caractères", motsCles: "caractères texte", pret: true },
      { code: "G4", slug: "atelier-pdf", nom: "Atelier PDF", detail: "Fusion, compression", motsCles: "fusionner compresser" },
      { code: "G5", slug: "extracteur-emails", nom: "Extracteur d'adresses e-mail", motsCles: "adresses mail", pret: true },
      { code: "G6", slug: "listes", nom: "Traitement de listes", detail: "Tri, doublons, majuscules", motsCles: "tri doublons", pret: true },
      { code: "G7", slug: "texte-de-test", nom: "Générateur de texte de test", motsCles: "lorem ipsum", pret: true },
      { code: "G8", slug: "jours-ouvres", nom: "Jours ouvrés entre deux dates", motsCles: "dates calendrier", pret: true },
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
