// Répartition d'une liste de noms en équipes équilibrées.

import { melanger } from "@/lib/hasard";

export type Mode = "nombre-equipes" | "taille-equipe";

// Calcule le nombre d'équipes à former.
// - "nombre-equipes" : la valeur est le nombre d'équipes voulu.
// - "taille-equipe"  : la valeur est le nombre de personnes par équipe ; on arrondit
//   au nombre d'équipes le plus proche pour que les tailles restent proches de la cible.
export function nombreEquipes(nbPersonnes: number, mode: Mode, valeur: number) {
  if (nbPersonnes === 0 || valeur < 1) return 0;
  const n = mode === "nombre-equipes" ? valeur : Math.max(1, Math.round(nbPersonnes / valeur));
  return Math.min(n, nbPersonnes); // jamais d'équipe vide
}

// Mélange les noms puis les distribue comme des cartes : les tailles des
// équipes diffèrent au plus d'une personne.
export function repartir(noms: readonly string[], nbEquipes: number): string[][] {
  if (nbEquipes < 1) return [];
  const equipes: string[][] = Array.from({ length: nbEquipes }, () => []);
  melanger(noms).forEach((nom, i) => equipes[i % nbEquipes].push(nom));
  return equipes;
}
