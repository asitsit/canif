// Répartition d'une liste de noms en équipes équilibrées.

import { entierAleatoire, melanger } from "@/lib/hasard";

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

// --- Équipes avec critères (service, site, niveau...) ---

export type Personne = { nom: string; criteres: string[] };

// "melanger"   : chaque équipe mélange au mieux les valeurs des critères (mixité).
// "regrouper"  : les personnes qui partagent des valeurs se retrouvent ensemble.
export type ModeCriteres = "melanger" | "regrouper";

// Répartition en tenant compte des critères. Dans les deux modes, les tailles
// des équipes diffèrent au plus d'une personne.
export function repartirAvecCriteres(personnes: readonly Personne[], nbEquipes: number, mode: ModeCriteres) {
  if (nbEquipes < 1) return [];
  return mode === "melanger" ? melangerCriteres(personnes, nbEquipes) : regrouperCriteres(personnes, nbEquipes);
}

// Mode « regrouper » : on range les personnes par valeurs de critères (ordre des
// groupes et ordre à l'intérieur de chaque groupe tirés au sort), puis on découpe
// cette file en équipes consécutives de tailles équilibrées.
function regrouperCriteres(personnes: readonly Personne[], nbEquipes: number) {
  // Rang tiré au sort pour chaque valeur du premier critère, puis pour chaque
  // combinaison complète : on trie d'abord sur le premier critère, puis sur les suivants.
  const cle1 = (p: Personne) => (p.criteres[0] ?? "").toLowerCase();
  const cle = (p: Personne) => p.criteres.map((c) => c.toLowerCase()).join("|");
  const rang1 = new Map(melanger([...new Set(personnes.map(cle1))]).map((c, i) => [c, i]));
  const rang = new Map(melanger([...new Set(personnes.map(cle))]).map((c, i) => [c, i]));
  const file = melanger(personnes).sort(
    (a, b) => (rang1.get(cle1(a)) ?? 0) - (rang1.get(cle1(b)) ?? 0) || (rang.get(cle(a)) ?? 0) - (rang.get(cle(b)) ?? 0),
  );

  const equipes: Personne[][] = [];
  const base = Math.floor(file.length / nbEquipes);
  const enPlus = file.length % nbEquipes; // ces premières équipes ont une personne de plus
  let debut = 0;
  for (let i = 0; i < nbEquipes; i++) {
    const taille = base + (i < enPlus ? 1 : 0);
    equipes.push(file.slice(debut, debut + taille));
    debut += taille;
  }
  return equipes;
}

// Mode « melanger » : on place chaque personne dans une des équipes les moins
// remplies, en choisissant celle où elle a le moins de points communs (mêmes
// valeurs de critères). Égalités : tirage au sort.
function melangerCriteres(personnes: readonly Personne[], nbEquipes: number) {
  const equipes: Personne[][] = Array.from({ length: nbEquipes }, () => []);

  // Ordre de placement : les valeurs du premier critère les plus fréquentes
  // d'abord (elles ont le plus besoin d'être réparties), et les personnes d'une
  // même valeur à la suite (elles se répartissent alors une par équipe).
  const cle1 = (p: Personne) => (p.criteres[0] ?? "").toLowerCase();
  const frequence = new Map<string, number>();
  for (const p of personnes) frequence.set(cle1(p), (frequence.get(cle1(p)) ?? 0) + 1);
  const rangValeur = new Map(melanger([...frequence.keys()]).map((v, i) => [v, i]));
  const ordre = melanger(personnes).sort(
    (a, b) =>
      (frequence.get(cle1(b)) ?? 0) - (frequence.get(cle1(a)) ?? 0) ||
      (rangValeur.get(cle1(a)) ?? 0) - (rangValeur.get(cle1(b)) ?? 0),
  );

  // Le premier critère compte plus que le deuxième, qui compte plus que le troisième :
  // éviter un doublon de service passe avant éviter un doublon de site.
  const base = personnes.length + 1;
  const poids = [base * base, base, 1];

  for (const personne of ordre) {
    const tailleMin = Math.min(...equipes.map((e) => e.length));
    const candidates = equipes.map((_, i) => i).filter((i) => equipes[i].length === tailleMin);

    // Points communs : nombre de membres partageant chaque valeur de critère, pondéré.
    const points = (i: number) =>
      personne.criteres.reduce(
        (total, valeur, k) =>
          valeur
            ? total +
              poids[k] *
                equipes[i].filter((m) => (m.criteres[k] ?? "").toLowerCase() === valeur.toLowerCase()).length
            : total,
        0,
      );
    const scores = candidates.map(points);
    const meilleur = Math.min(...scores);
    const exAequo = candidates.filter((_, j) => scores[j] === meilleur);
    equipes[exAequo[entierAleatoire(exAequo.length)]].push(personne);
  }
  return equipes;
}

// Lit les lignes « Nom ; critère 1 ; critère 2 » (séparateurs : point-virgule,
// tabulation d'un copier-coller depuis un tableur, ou virgule).
export function lirePersonnes(texte: string): Personne[] {
  return texte
    .split(/\r?\n/)
    .map((ligne) => ligne.trim())
    .filter(Boolean)
    .slice(0, 200)
    .map((ligne) => {
      const separateur = ligne.includes(";") ? ";" : ligne.includes("\t") ? "\t" : ",";
      const [nom, ...criteres] = ligne.split(separateur).map((morceau) => morceau.trim().slice(0, 40));
      return { nom: nom.slice(0, 60), criteres: criteres.slice(0, 3) };
    })
    .filter((p) => p.nom);
}
