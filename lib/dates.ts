// Fonctions de dates communes (jours ouvrés, rétro-planning, Gantt...).
// Les dates « du jour » sont manipulées à midi heure locale pour éviter les
// surprises des changements d'heure.

// « 2026-10-15 » à partir d'une date (heure locale).
export function versIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Date (à midi, heure locale) à partir de « 2026-10-15 ». null si invalide.
export function depuisIso(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function ajouterJours(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// Nombre de jours entre deux dates (b - a), en jours entiers.
export function ecartJours(a: Date, b: Date) {
  return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86_400_000);
}

// « jeudi 15 octobre 2026 » ou, en version courte, « jeu. 15 oct. »
export function formaterDate(d: Date, court = false) {
  return d.toLocaleDateString(
    "fr-FR",
    court ? { weekday: "short", day: "numeric", month: "short" } : { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );
}

// Date de Pâques (calendrier grégorien), algorithme de Meeus / Jones / Butcher.
export function paques(annee: number) {
  const a = annee % 19;
  const b = Math.floor(annee / 100);
  const c = annee % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mois = Math.floor((h + l - 7 * m + 114) / 31);
  const jour = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(annee, mois - 1, jour, 12);
}

// Jours fériés en France métropolitaine (et options Alsace-Moselle).
// Renvoie une table « 2026-05-01 » -> « Fête du Travail ».
export function joursFeries(annee: number, { alsaceMoselle = false, pentecote = true } = {}) {
  const p = paques(annee);
  const liste: [Date, string][] = [
    [new Date(annee, 0, 1, 12), "Jour de l'an"],
    [ajouterJours(p, 1), "Lundi de Pâques"],
    [new Date(annee, 4, 1, 12), "Fête du Travail"],
    [new Date(annee, 4, 8, 12), "Victoire 1945"],
    [ajouterJours(p, 39), "Ascension"],
    [new Date(annee, 6, 14, 12), "Fête nationale"],
    [new Date(annee, 7, 15, 12), "Assomption"],
    [new Date(annee, 10, 1, 12), "Toussaint"],
    [new Date(annee, 10, 11, 12), "Armistice 1918"],
    [new Date(annee, 11, 25, 12), "Noël"],
  ];
  // Le lundi de Pentecôte est férié mais souvent travaillé (journée de solidarité).
  if (pentecote) liste.push([ajouterJours(p, 50), "Lundi de Pentecôte"]);
  if (alsaceMoselle) {
    liste.push([ajouterJours(p, -2), "Vendredi saint (Alsace-Moselle)"]);
    liste.push([new Date(annee, 11, 26, 12), "Saint-Étienne (Alsace-Moselle)"]);
  }
  return new Map(liste.map(([d, nom]) => [versIso(d), nom]));
}
