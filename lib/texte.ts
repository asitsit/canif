// Fonctions communes aux outils qui travaillent sur du texte.

// Minuscules sans accents, pour comparer des mots.
export function normaliser(texte: string) {
  return texte.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Découpe un texte en mots (lettres, chiffres, apostrophes et traits d'union internes).
export function mots(texte: string) {
  return texte.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? [];
}

// Mots très courants du français, ignorés dans les nuages de mots et les
// « mots les plus fréquents » (liste rédigée pour Canif).
export const MOTS_VIDES = new Set(
  normaliser(
    `a à afin ai aie aient ainsi alors as au aucun aucune aupres auquel aura aurai auraient aurais aurait aux avaient avais avait avant avec avez aviez avions avoir avons ayant
    c ca ça car ce ceci cela celle celles celui cependant ces cet cette ceux chacun chaque chez ci comme comment d dans de des deja déjà depuis dont donc du elle elles en encore
    entre es est et etaient etais etait etant ete été etre être eu eux fait faire fois font ici il ils j je jusqu l la le les leur leurs lors lorsque lui m ma mais me meme même
    mes moi moins mon n ne ni non nos notre nous on ont or ou où par parce pas peu peut plus pour pourquoi puis qu quand que quel quelle quelles quels qui quoi s sa sans se
    sera serait ses si sien soi soit son sont sous suis sur t ta tandis te tes toi ton tous tout toute toutes tres très tu un une unes uns vers via voici voila voilà vos votre
    vous y the and of to in is it that for on with as are this be at by or an`,
  ).split(/\s+/),
);

// Fréquence des mots d'un texte (hors mots vides et mots de moins de 3 lettres).
export function frequences(texte: string, exclus: Set<string> = new Set()) {
  const compte = new Map<string, { mot: string; n: number }>();
  for (const brut of mots(texte)) {
    const cle = normaliser(brut);
    if (cle.length < 3 || MOTS_VIDES.has(cle) || exclus.has(cle) || /^\d+$/.test(cle)) continue;
    const existant = compte.get(cle);
    if (existant) existant.n++;
    // On garde la première écriture rencontrée, en minuscules sauf sigles.
    else compte.set(cle, { mot: brut === brut.toUpperCase() && brut.length > 1 ? brut : brut.toLowerCase(), n: 1 });
  }
  return [...compte.values()].sort((a, b) => b.n - a.n || a.mot.localeCompare(b.mot, "fr"));
}
