"use client";

// Générateur de synthèse structurée, SANS intelligence artificielle : des notes
// en vrac sont classées par des règles simples et visibles.
//
// Règles (une ligne de notes = un élément) :
//   commence par « D : », « Décision », « Décidé »            -> Décisions
//   commence par « A : », « Action », « À faire », « TODO »    -> Actions
//   commence par « ! », « Attention », « Risque », « Alerte »  -> Points d'attention
//   se termine par « ? » ou commence par « Q : »               -> Questions ouvertes
//   sinon                                                      -> Points clés
// Les préfixes sont retirés dans la synthèse.

import GenerateurTexte, { type Valeurs } from "@/components/generateur-texte";
import { paragraphes } from "@/lib/redaction";

type Categorie = "decisions" | "actions" | "attention" | "questions" | "cles";

const REGLES: [Categorie, RegExp][] = [
  ["decisions", /^(d\s*:|décision\s*:?|décidé\s*:?)\s*/i],
  ["actions", /^(a\s*:|action\s*:?|à faire\s*:?|todo\s*:?)\s*/i],
  ["attention", /^(!+|attention\s*:?|risque\s*:?|alerte\s*:?)\s*/i],
  ["questions", /^(q\s*:|question\s*:)\s*/i],
];

const TITRES: Record<Categorie, string> = {
  decisions: "DÉCISIONS",
  actions: "ACTIONS",
  attention: "POINTS D'ATTENTION",
  questions: "QUESTIONS OUVERTES",
  cles: "POINTS CLÉS",
};

export function classer(notes: string) {
  const resultat: Record<Categorie, string[]> = { cles: [], decisions: [], actions: [], attention: [], questions: [] };
  for (const brute of notes.split(/\r?\n/)) {
    let ligne = brute.trim().replace(/^[-*•]\s*/, "");
    if (!ligne) continue;
    let categorie: Categorie = "cles";
    for (const [cat, motif] of REGLES) {
      if (motif.test(ligne)) {
        categorie = cat;
        ligne = ligne.replace(motif, "");
        break;
      }
    }
    if (categorie === "cles" && ligne.endsWith("?")) categorie = "questions";
    if (ligne) resultat[categorie].push(ligne.charAt(0).toUpperCase() + ligne.slice(1));
  }
  return resultat;
}

const champs = [
  { id: "titre", libelle: "Titre de la synthèse", defaut: "Synthèse de l'atelier" },
  {
    id: "notes",
    libelle: "Vos notes, une idée par ligne",
    type: "zone" as const,
    defaut:
      "Les réunions durent trop longtemps\nD : les réunions d'équipe passent à 30 minutes\nA : Sophie crée le tableau de suivi\nQui anime la prochaine séance ?\n! Le budget formation est déjà engagé\nLes outils actuels sont mal connus",
  },
];

function generer(v: Valeurs) {
  const c = classer(v.notes);
  const ordre: Categorie[] = ["cles", "decisions", "actions", "attention", "questions"];
  const texte = paragraphes(
    v.titre.toUpperCase(),
    ...ordre.map((cat) => c[cat].length > 0 && `${TITRES[cat]}\n${c[cat].map((l) => `- ${l}`).join("\n")}`),
  );
  return { texte };
}

function apercu(v: Valeurs) {
  const c = classer(v.notes);
  return (
    <div>
      <p style={{ margin: "0 0 6px" }}>
        <strong>Règles de tri</strong> (sans IA) : commencez une ligne par <code>D :</code> pour une décision,{" "}
        <code>A :</code> pour une action, <code>!</code> pour un point d'attention ; finissez-la par <code>?</code> pour
        une question. Le reste devient un point clé.
      </p>
      <p className="discret" style={{ margin: 0 }}>
        {c.cles.length} point(s) clé(s), {c.decisions.length} décision(s), {c.actions.length} action(s), {c.attention.length}{" "}
        point(s) d'attention, {c.questions.length} question(s).
      </p>
    </div>
  );
}

export default function Synthese() {
  return <GenerateurTexte cle="synthese" champs={champs} generer={generer} apercu={apercu} />;
}
