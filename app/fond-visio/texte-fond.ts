// Couleur de texte (noir ou blanc) la plus lisible sur un fond d'une ou deux couleurs.

import { contraste } from "@/lib/couleurs";

export function couleurTexteSurFond(c1: string, c2: string) {
  // On retient le pire des deux cas : le texte doit rester lisible partout.
  const blanc = Math.min(contraste(c1, "#ffffff"), contraste(c2, "#ffffff"));
  const noir = Math.min(contraste(c1, "#111827"), contraste(c2, "#111827"));
  return blanc >= noir ? "#ffffff" : "#111827";
}
