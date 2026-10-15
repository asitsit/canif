"use client";

// Modèle de compte rendu de réunion ou d'atelier.
// Les actions se saisissent « Action ; Qui ; Quand », une par ligne.

import GenerateurTexte, { type Valeurs } from "@/components/generateur-texte";
import { dateEnLettres, paragraphes, puces } from "@/lib/redaction";

const champs = [
  { id: "titre", libelle: "Titre", defaut: "Atelier organisation" },
  { id: "date", libelle: "Date", type: "date" as const, defaut: "" },
  { id: "lieu", libelle: "Lieu", defaut: "Salle Horizon" },
  { id: "presents", libelle: "Présents (un nom par ligne)", type: "zone" as const, defaut: "Jacques\nSophie\nKarim\nLéa" },
  { id: "excuses", libelle: "Excusés (facultatif)", type: "zone" as const, defaut: "Thomas" },
  { id: "objectif", libelle: "Objectif de la séance", defaut: "Choisir trois pistes d'amélioration prioritaires" },
  { id: "points", libelle: "Points abordés (un par ligne)", type: "zone" as const, defaut: "Bilan des irritants actuels\nPistes proposées par les sous-groupes\nVote et priorisation" },
  { id: "decisions", libelle: "Décisions (une par ligne)", type: "zone" as const, defaut: "Les réunions d'équipe passent à 30 minutes\nUn tableau de suivi partagé est mis en place" },
  { id: "actions", libelle: "Actions : « Action ; Qui ; Quand », une par ligne", type: "zone" as const, defaut: "Créer le tableau de suivi ; Sophie ; 20 octobre\nRédiger la charte de réunion ; Karim ; fin octobre" },
  { id: "prochaine", libelle: "Prochaine réunion (facultatif)", defaut: "Mardi 18 novembre, 9 h 30" },
  { id: "redacteur", libelle: "Rédigé par", defaut: "Camille" },
];

function generer(v: Valeurs) {
  const actions = v.actions
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [quoi, qui, quand] = l.split(/\s*[;\t]\s*/);
      return `- ${quoi}${qui ? ` (responsable : ${qui}` : ""}${qui && quand ? `, échéance : ${quand})` : qui ? ")" : ""}`;
    })
    .join("\n");
  const entete = [`COMPTE RENDU : ${v.titre.toUpperCase()}`, [v.date && dateEnLettres(v.date), v.lieu].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join("\n");
  const texte = paragraphes(
    entete,
    v.presents.trim() && `Présents : ${v.presents.split(/\r?\n/).map((n) => n.trim()).filter(Boolean).join(", ")}`,
    v.excuses.trim() && `Excusés : ${v.excuses.split(/\r?\n/).map((n) => n.trim()).filter(Boolean).join(", ")}`,
    v.objectif.trim() && `OBJECTIF\n${v.objectif.trim()}`,
    v.points.trim() && `POINTS ABORDÉS\n${puces(v.points)}`,
    v.decisions.trim() && `DÉCISIONS\n${puces(v.decisions)}`,
    actions && `ACTIONS\n${actions}`,
    v.prochaine.trim() && `PROCHAINE RÉUNION\n${v.prochaine.trim()}`,
    v.redacteur.trim() && `Rédigé par ${v.redacteur.trim()}.`,
  );
  return { texte, objet: `Compte rendu : ${v.titre}${v.date ? ` du ${dateEnLettres(v.date)}` : ""}` };
}

export default function CompteRendu() {
  return <GenerateurTexte cle="compte-rendu" champs={champs} generer={generer} courriel />;
}
