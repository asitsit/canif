// Palettes de couleurs de la roue, et choix automatique de la couleur du texte.

export type Palette = { nom: string; couleurs: string[] };

export const PALETTES: Record<string, Palette> = {
  canif: {
    nom: "Canif",
    couleurs: ["#c2410c", "#0f766e", "#1d4ed8", "#7e22ce", "#a16207", "#be123c", "#15803d", "#334155"],
  },
  "arc-en-ciel": {
    nom: "Arc-en-ciel",
    couleurs: ["#dc2626", "#ea580c", "#eab308", "#16a34a", "#0891b2", "#2563eb", "#7c3aed", "#db2777"],
  },
  pastel: {
    nom: "Pastel",
    couleurs: ["#fbcfe8", "#bfdbfe", "#bbf7d0", "#fde68a", "#ddd6fe", "#fed7aa", "#a5f3fc", "#e5e7eb"],
  },
  ocean: {
    nom: "Océan",
    couleurs: ["#0c4a6e", "#0369a1", "#0891b2", "#0d9488", "#155e75", "#1e40af"],
  },
  sobre: {
    nom: "Sobre",
    couleurs: ["#1f2937", "#6b7280", "#d1d5db"],
  },
};

// Couleurs proposées au départ pour la palette personnalisée.
export const PERSO_DEPART = ["#c2410c", "#1d4ed8", "#15803d", "#eab308"];

// Couleur d'une part : on tourne dans la palette, en évitant que la dernière
// part ait la même couleur que la première (elles sont voisines sur la roue).
export function couleurPart(couleurs: string[], index: number, total: number) {
  const n = couleurs.length;
  let c = couleurs[index % n];
  if (index === total - 1 && total > 1 && c === couleurs[0] && n > 2) c = couleurs[(index + 1) % n];
  return c;
}

// Noir ou blanc, selon ce qui se lit le mieux sur la couleur de fond
// (calcul de luminance des règles d'accessibilité WCAG).
export function couleurTexte(fond: string) {
  const hex = fond.replace("#", "");
  if (hex.length !== 6) return "#ffffff";
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.179 ? "#111827" : "#ffffff";
}
