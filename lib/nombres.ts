// Nombres et montants communs aux calculateurs.

// Lit un nombre saisi à la française (« 1 250,50 ») ; 0 si vide ou invalide.
export function lireNombre(texte: string) {
  const n = Number(texte.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

// « 1 250 € » (sans centimes par défaut).
export function euros(n: number, centimes = false) {
  return n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: centimes ? 2 : 0,
    maximumFractionDigits: centimes ? 2 : 0,
  });
}

// « 12,5 % »
export function pourcent(n: number, decimales = 1) {
  return `${n.toLocaleString("fr-FR", { maximumFractionDigits: decimales })} %`;
}

// « 12,5 »
export function nombre(n: number, decimales = 1) {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: decimales });
}
