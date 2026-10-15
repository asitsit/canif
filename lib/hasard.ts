// Tirages au sort communs aux outils (roue, équipes, ordre de passage, rôles...).
//
// On utilise le générateur cryptographique du navigateur (crypto.getRandomValues)
// plutôt que Math.random : il est imprévisible et sans biais, ce qui compte
// quand un tirage doit être équitable devant un groupe.

// Nombre entier au hasard entre 0 et max - 1.
export function entierAleatoire(max: number) {
  if (max <= 1) return 0;
  // Rejet des valeurs qui créeraient un biais (méthode classique).
  const limite = Math.floor(0x100000000 / max) * max;
  const tampon = new Uint32Array(1);
  let valeur: number;
  do {
    crypto.getRandomValues(tampon);
    valeur = tampon[0];
  } while (valeur >= limite);
  return valeur % max;
}

// Renvoie une copie mélangée du tableau (mélange de Fisher-Yates).
export function melanger<T>(tableau: readonly T[]): T[] {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = entierAleatoire(i + 1);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

// Transforme un texte (un élément par ligne) en liste propre :
// lignes vides ignorées, espaces retirés, 60 caractères et 200 éléments au plus.
export function lireListe(texte: string) {
  return texte
    .split(/\r?\n/)
    .map((ligne) => ligne.trim().slice(0, 60))
    .filter(Boolean)
    .slice(0, 200);
}
