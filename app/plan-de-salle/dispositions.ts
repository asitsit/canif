// Géométrie des dispositions de salle. Chaque disposition renvoie les sièges
// (position, et sens dans lequel la personne regarde) et les tables à dessiner.
// Unités : 1 = environ 1 cm sur le plan (un siège tous les 60 environ).

export type Siege = { x: number; y: number };
export type Table = { type: "rect"; x: number; y: number; l: number; h: number } | { type: "rond"; x: number; y: number; r: number };
export type Plan = { sieges: Siege[]; tables: Table[]; ecran: boolean };

export type Disposition = { id: string; nom: string; usage: string };

export const DISPOSITIONS: Disposition[] = [
  { id: "cercle", nom: "Cercle de chaises", usage: "Échanges égalitaires, partage d'expériences, sans tables." },
  { id: "u", nom: "En U", usage: "Discussion en grand groupe avec un support projeté ; l'animateur circule au centre." },
  { id: "ilots", nom: "Îlots", usage: "Travail en sous-groupes : une table par groupe." },
  { id: "cabaret", nom: "Cabaret", usage: "Alternance d'écoute (tout le monde voit l'écran) et de travail par table." },
  { id: "classe", nom: "Classe", usage: "Formation avec prise de notes ; peu propice aux échanges." },
  { id: "theatre", nom: "Théâtre", usage: "Présentation à un grand groupe, sans prise de notes." },
  { id: "reunion", nom: "Réunion", usage: "Une grande table pour un petit groupe qui décide ensemble." },
];

const PAS = 60; // espace entre deux sièges

export function calculer(id: string, n: number, parTable: number): Plan {
  const sieges: Siege[] = [];
  const tables: Table[] = [];

  if (id === "cercle") {
    const r = Math.max(120, (n * PAS) / (2 * Math.PI));
    for (let i = 0; i < n; i++) sieges.push({ x: r * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), y: r * Math.sin((2 * Math.PI * i) / n - Math.PI / 2) });
    return { sieges, tables, ecran: false };
  }

  if (id === "u") {
    // Répartition : fond du U et deux branches, sièges à l'extérieur des tables.
    const fond = Math.max(2, Math.round(n / 3));
    const cote = Math.ceil((n - fond) / 2);
    const largeur = fond * PAS;
    const longueur = cote * PAS;
    tables.push({ type: "rect", x: -largeur / 2 - 40, y: 0, l: 40, h: longueur }); // branche gauche
    tables.push({ type: "rect", x: largeur / 2, y: 0, l: 40, h: longueur }); // branche droite
    tables.push({ type: "rect", x: -largeur / 2 - 40, y: longueur, l: largeur + 80, h: 40 }); // fond
    let restant = n;
    for (let i = 0; i < cote && restant > 0; i++, restant--) sieges.push({ x: -largeur / 2 - 70, y: PAS / 2 + i * PAS });
    for (let i = 0; i < fond && restant > 0; i++, restant--) sieges.push({ x: -largeur / 2 + PAS / 2 + i * PAS, y: longueur + 70 });
    for (let i = cote - 1; i >= 0 && restant > 0; i--, restant--) sieges.push({ x: largeur / 2 + 70, y: PAS / 2 + i * PAS });
    return { sieges, tables, ecran: true };
  }

  if (id === "ilots" || id === "cabaret") {
    const g = Math.max(2, parTable);
    const nbTables = Math.ceil(n / g);
    const colonnes = Math.ceil(Math.sqrt(nbTables * 1.5));
    const r = Math.max(45, (g * PAS) / (2 * Math.PI) - 25);
    const espace = (r + 60) * 2 + 40;
    let restant = n;
    for (let t = 0; t < nbTables; t++) {
      const cx = (t % colonnes) * espace;
      const cy = Math.floor(t / colonnes) * espace;
      tables.push({ type: "rond", x: cx, y: cy, r });
      const ici = Math.min(g, restant);
      restant -= ici;
      // Cabaret : sièges sur le demi-cercle opposé à l'écran (tout le monde le voit).
      const debut = id === "cabaret" ? 0.15 * Math.PI : 0;
      const etendue = id === "cabaret" ? 0.7 * Math.PI : 2 * Math.PI;
      for (let i = 0; i < ici; i++) {
        const a = debut + (id === "cabaret" ? (etendue * (i + 0.5)) / ici : (etendue * i) / ici - Math.PI / 2);
        sieges.push({ x: cx + (r + 28) * Math.cos(a), y: cy + (r + 28) * Math.sin(a) });
      }
    }
    return { sieges, tables, ecran: true };
  }

  if (id === "classe") {
    // Tables de deux, en rangées face à l'écran.
    const tablesNecessaires = Math.ceil(n / 2);
    const parRang = Math.max(1, Math.min(4, Math.ceil(Math.sqrt(tablesNecessaires))));
    let restant = n;
    for (let t = 0; t < tablesNecessaires; t++) {
      const x = (t % parRang) * (2 * PAS + 50);
      const y = Math.floor(t / parRang) * 110;
      tables.push({ type: "rect", x, y, l: 2 * PAS, h: 36 });
      for (let i = 0; i < 2 && restant > 0; i++, restant--) sieges.push({ x: x + PAS / 2 + i * PAS, y: y + 60 });
    }
    return { sieges, tables, ecran: true };
  }

  if (id === "theatre") {
    const parRang = Math.max(4, Math.ceil(Math.sqrt(n * 2)));
    for (let i = 0; i < n; i++) {
      const rang = Math.floor(i / parRang);
      const dansRang = Math.min(parRang, n - rang * parRang);
      const pos = i % parRang;
      sieges.push({ x: (pos - (dansRang - 1) / 2) * PAS, y: rang * 70 });
    }
    return { sieges, tables, ecran: true };
  }

  // Réunion : une grande table, sièges des deux côtés et aux deux bouts.
  const bouts = n >= 6 ? 2 : 0;
  const parCote = Math.ceil((n - bouts) / 2);
  const longueur = Math.max(parCote, 1) * PAS;
  tables.push({ type: "rect", x: -longueur / 2, y: -45, l: longueur, h: 90 });
  let restant = n;
  for (let i = 0; i < parCote && restant > 0; i++, restant--) sieges.push({ x: -longueur / 2 + PAS / 2 + i * PAS, y: -75 });
  for (let i = 0; i < parCote && restant > 0; i++, restant--) sieges.push({ x: -longueur / 2 + PAS / 2 + i * PAS, y: 75 });
  if (restant > 0) {
    sieges.push({ x: -longueur / 2 - 30, y: 0 });
    restant--;
  }
  if (restant > 0) sieges.push({ x: longueur / 2 + 30, y: 0 });
  return { sieges, tables, ecran: true };
}
