// Placement des mots d'une grille de mots croisés.
//
// Méthode : on place le mot le plus long au centre, puis chaque mot suivant à
// l'endroit où il croise le plus de lettres déjà posées (sans toucher un autre
// mot côte à côte). On recommence avec plusieurs ordres de mots tirés au hasard
// et on garde la meilleure grille : le plus de mots placés, puis la plus compacte.
// Un mot sans croisement possible est signalé comme non placé.

import { entierAleatoire, melanger } from "@/lib/hasard";

export type Entree = { mot: string; definition: string };
export type MotPlace = Entree & { x: number; y: number; horizontal: boolean; numero: number };
export type Grille = { mots: MotPlace[]; nonPlaces: Entree[]; largeur: number; hauteur: number };

type Case = { lettre: string; h: boolean; v: boolean };

// Mot de grille : majuscules, sans accents ni espaces, traits d'union ou apostrophes.
export function normaliserMot(mot: string) {
  return mot
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/Œ/gi, "OE")
    .replace(/Æ/gi, "AE")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

function essai(entrees: Entree[]): Omit<Grille, "largeur" | "hauteur"> & { aire: number } {
  const cases = new Map<string, Case>();
  const cle = (x: number, y: number) => `${x},${y}`;
  const places: Omit<MotPlace, "numero">[] = [];
  const nonPlaces: Entree[] = [];

  function possible(mot: string, x: number, y: number, horizontal: boolean) {
    const dx = horizontal ? 1 : 0;
    const dy = horizontal ? 0 : 1;
    // Cases juste avant et juste après le mot : vides.
    if (cases.has(cle(x - dx, y - dy)) || cases.has(cle(x + dx * mot.length, y + dy * mot.length))) return -1;
    let croisements = 0;
    for (let i = 0; i < mot.length; i++) {
      const cx = x + dx * i;
      const cy = y + dy * i;
      const c = cases.get(cle(cx, cy));
      if (c) {
        if (c.lettre !== mot[i] || (horizontal ? c.h : c.v)) return -1;
        croisements++;
      } else if (cases.has(cle(cx + dy, cy + dx)) || cases.has(cle(cx - dy, cy - dx))) {
        // Une case libre ne doit pas toucher latéralement une lettre existante.
        return -1;
      }
    }
    return croisements;
  }

  function poser(e: Entree, x: number, y: number, horizontal: boolean) {
    for (let i = 0; i < e.mot.length; i++) {
      const k = cle(x + (horizontal ? i : 0), y + (horizontal ? 0 : i));
      const c = cases.get(k) ?? { lettre: e.mot[i], h: false, v: false };
      if (horizontal) c.h = true;
      else c.v = true;
      cases.set(k, c);
    }
    places.push({ ...e, x, y, horizontal });
  }

  entrees.forEach((e, n) => {
    if (n === 0) {
      poser(e, 0, 0, true);
      return;
    }
    let meilleur: { x: number; y: number; horizontal: boolean; score: number } | null = null;
    for (const [k, c] of cases) {
      const [cx, cy] = k.split(",").map(Number);
      for (let i = 0; i < e.mot.length; i++) {
        if (e.mot[i] !== c.lettre) continue;
        for (const horizontal of [true, false]) {
          if (horizontal ? c.h : c.v) continue;
          const x = horizontal ? cx - i : cx;
          const y = horizontal ? cy : cy - i;
          const croisements = possible(e.mot, x, y, horizontal);
          if (croisements < 1) continue;
          const score = croisements * 10 + entierAleatoire(3); // un peu de hasard entre égaux
          if (!meilleur || score > meilleur.score) meilleur = { x, y, horizontal, score };
        }
      }
    }
    if (meilleur) poser(e, meilleur.x, meilleur.y, meilleur.horizontal);
    else nonPlaces.push(e);
  });

  const xs = [...cases.keys()].map((k) => Number(k.split(",")[0]));
  const ys = [...cases.keys()].map((k) => Number(k.split(",")[1]));
  const aire = (Math.max(...xs) - Math.min(...xs) + 1) * (Math.max(...ys) - Math.min(...ys) + 1);
  return { mots: places as MotPlace[], nonPlaces, aire };
}

export function genererGrille(entrees: Entree[], essais = 60): Grille {
  const valides = entrees.filter((e) => e.mot.length >= 2);
  if (valides.length === 0) return { mots: [], nonPlaces: entrees, largeur: 0, hauteur: 0 };

  let meilleur: ReturnType<typeof essai> | null = null;
  for (let t = 0; t < essais; t++) {
    // Le plus long d'abord, les autres dans un ordre au hasard (plus longs favorisés).
    const tries = [...valides].sort((a, b) => b.mot.length - a.mot.length);
    const ordre = [tries[0], ...melanger(tries.slice(1)).sort((a, b) => b.mot.length - a.mot.length + (entierAleatoire(5) - 2))];
    const r = essai(ordre);
    if (!meilleur || r.mots.length > meilleur.mots.length || (r.mots.length === meilleur.mots.length && r.aire < meilleur.aire)) meilleur = r;
  }

  // Recadrage en (0, 0) et numérotation dans l'ordre de lecture.
  const r = meilleur!;
  const minX = Math.min(...r.mots.map((m) => m.x));
  const minY = Math.min(...r.mots.map((m) => m.y));
  const mots = r.mots.map((m) => ({ ...m, x: m.x - minX, y: m.y - minY }));
  const largeur = Math.max(...mots.map((m) => m.x + (m.horizontal ? m.mot.length : 1)));
  const hauteur = Math.max(...mots.map((m) => m.y + (m.horizontal ? 1 : m.mot.length)));
  const debuts = [...new Set(mots.map((m) => `${m.y},${m.x}`))].sort((a, b) => {
    const [ya, xa] = a.split(",").map(Number);
    const [yb, xb] = b.split(",").map(Number);
    return ya - yb || xa - xb;
  });
  for (const m of mots) m.numero = debuts.indexOf(`${m.y},${m.x}`) + 1;
  return { mots, nonPlaces: [...r.nonPlaces, ...entrees.filter((e) => e.mot.length < 2)], largeur, hauteur };
}
