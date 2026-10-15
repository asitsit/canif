// Lecture d'une sélection de pages saisie à la main : « 1-3, 5, 8-10 ».
// Renvoie les numéros de pages (à partir de 1), dans l'ordre saisi, sans doublons,
// ou null si la saisie est invalide.

export function lireSelection(texte: string, total: number): number[] | null {
  const resultat: number[] = [];
  for (const morceau of texte.split(/[,;]/).map((m) => m.trim()).filter(Boolean)) {
    const m = morceau.match(/^(\d+)\s*(?:-\s*(\d+))?$/);
    if (!m) return null;
    const debut = Number(m[1]);
    const fin = m[2] ? Number(m[2]) : debut;
    if (debut < 1 || fin < 1 || debut > total || fin > total) return null;
    const pas = debut <= fin ? 1 : -1;
    for (let p = debut; pas > 0 ? p <= fin : p >= fin; p += pas) if (!resultat.includes(p)) resultat.push(p);
  }
  return resultat.length ? resultat : null;
}
