// Lecture du programme saisi par l'animateur, une ligne par intervenant.
//
// Formats acceptés (exemples) :
//   Jacques : 3min        Alex ; 7 mins        Jean - 10
//   Marie : 2:30          Paul : 1h30          Léa : 90s
//   Zoé 4 min             (sans séparateur, si la ligne finit par une durée)

export type Intervenant = { nom: string; prevuMs: number };

export type Programme = {
  intervenants: Intervenant[];
  lignesIllisibles: string[]; // lignes non comprises, à signaler
};

// Durée maximale par intervenant : 4 heures.
const DUREE_MAX_MS = 4 * 60 * 60 * 1000;

// Transforme un texte de durée en millisecondes (null si incompréhensible).
export function lireDuree(texte: string): number | null {
  const t = texte.toLowerCase().replace(/\s+/g, "").replace(",", ".");
  let m: RegExpMatchArray | null;
  let secondes: number | null = null;

  if ((m = t.match(/^(\d+)h(\d{1,2})?(min|mn|m)?$/))) {
    // 1h, 1h30, 1h30min
    secondes = Number(m[1]) * 3600 + Number(m[2] ?? 0) * 60;
  } else if ((m = t.match(/^(\d+):(\d{1,2})$/))) {
    // 2:30 (minutes:secondes)
    secondes = Number(m[1]) * 60 + Number(m[2]);
  } else if ((m = t.match(/^(\d+)(?:minutes?|mins?|mn|m|')(\d{1,2})(?:s|sec|secondes?|")?$/))) {
    // 3min30, 3m30s, 3'30
    secondes = Number(m[1]) * 60 + Number(m[2]);
  } else if ((m = t.match(/^(\d+)(?:s|sec|secondes?|")$/))) {
    // 90s
    secondes = Number(m[1]);
  } else if ((m = t.match(/^(\d+(?:\.\d+)?)(?:minutes?|mins?|mn|m|')?$/))) {
    // 3, 3min, 3 mins, 3.5 min (un nombre seul compte en minutes)
    secondes = Math.round(Number(m[1]) * 60);
  }

  if (secondes === null || secondes <= 0) return null;
  return Math.min(secondes * 1000, DUREE_MAX_MS);
}

// Un nom valable contient au moins une lettre ou un chiffre.
const nomValable = (nom: string) => /[\p{L}\p{N}]/u.test(nom);

// Découpe une ligne en « nom » et « durée ».
function lireLigne(ligne: string): Intervenant | null {
  // 1. Avec un séparateur : « Nom : durée », « Nom ; durée », « Nom - durée », « Nom = durée », tabulation.
  let m = ligne.match(/^(.+?)\s*[:;=\t]\s*(.+)$/) ?? ligne.match(/^(.+?)\s+[-–]\s+(.+)$/);
  // Cas « Marie : 2:30 » : le premier « : » sépare le nom, le reste est la durée.
  if (m) {
    const prevuMs = lireDuree(m[2]);
    const nom = m[1].trim();
    if (prevuMs && nomValable(nom)) return { nom, prevuMs };
  }
  // 2. Sans séparateur : « Zoé 4 min » (la durée est à la fin de la ligne).
  m = ligne.match(/^(.+?)\s+(\d[\d\s.,:'"hminsecode]*)$/i);
  if (m) {
    const prevuMs = lireDuree(m[2]);
    const nom = m[1].trim();
    if (prevuMs && nomValable(nom)) return { nom, prevuMs };
  }
  return null;
}

export function lireProgramme(texte: string): Programme {
  const intervenants: Intervenant[] = [];
  const lignesIllisibles: string[] = [];
  for (const brute of texte.split(/\r?\n/)) {
    const ligne = brute.trim();
    if (!ligne) continue;
    const intervenant = lireLigne(ligne);
    if (intervenant) intervenants.push({ ...intervenant, nom: intervenant.nom.slice(0, 60) });
    else lignesIllisibles.push(ligne);
  }
  return { intervenants, lignesIllisibles };
}
