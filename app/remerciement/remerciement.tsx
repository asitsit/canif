"use client";

// Modèle d'e-mail de remerciement après un atelier.

import GenerateurTexte, { type Valeurs } from "@/components/generateur-texte";
import { dateEnLettres, paragraphes, puces } from "@/lib/redaction";

const champs = [
  { id: "ton", libelle: "Ton", type: "choix" as const, options: ["Chaleureux (vouvoiement)", "Chaleureux (tutoiement)", "Formel"], defaut: "Chaleureux (vouvoiement)" },
  { id: "titre", libelle: "Titre de l'atelier", defaut: "Imaginer notre organisation de demain" },
  { id: "date", libelle: "Date de l'atelier", type: "date" as const, defaut: "" },
  { id: "moments", libelle: "Ce qui a marqué la séance (une idée par ligne)", type: "zone" as const, defaut: "La qualité des échanges en sous-groupes\nLes trois pistes retenues ensemble" },
  { id: "suites", libelle: "Prochaines étapes (une par ligne)", type: "zone" as const, defaut: "Compte rendu partagé d'ici vendredi\nPoint d'étape dans un mois" },
  { id: "lien", libelle: "Lien vers les supports (facultatif)", defaut: "" },
  { id: "avis", libelle: "Lien vers un questionnaire de satisfaction (facultatif)", defaut: "" },
  { id: "signature", libelle: "Signature", defaut: "Camille" },
];

function generer(v: Valeurs) {
  const tu = v.ton.includes("tutoiement");
  const formel = v.ton === "Formel";
  const quand = v.date ? ` du ${dateEnLettres(v.date)}` : "";
  const texte = paragraphes(
    formel ? "Madame, Monsieur," : "Bonjour à toutes et à tous,",
    formel
      ? `Je tiens à vous remercier pour votre participation à l'atelier « ${v.titre} »${quand}.`
      : `Merci ${tu ? "à chacune et chacun" : "à toutes et à tous"} pour votre participation à l'atelier « ${v.titre} »${quand} !`,
    v.moments.trim() && `${formel ? "Je retiens en particulier :" : "Ce que je retiens :"}\n${puces(v.moments)}`,
    v.suites.trim() && `Les prochaines étapes :\n${puces(v.suites)}`,
    v.lien.trim() && `${tu ? "Tu trouveras" : "Vous trouverez"} les supports ici : ${v.lien.trim()}`,
    v.avis.trim() && `${tu ? "Ton avis" : "Votre avis"} m'aide à améliorer les prochains ateliers : ${v.avis.trim()} (deux minutes suffisent).`,
    `${formel ? "Bien cordialement," : "À très bientôt,"}\n${v.signature}`,
  );
  return { texte, objet: `Merci pour l'atelier « ${v.titre} »` };
}

export default function Remerciement() {
  return <GenerateurTexte cle="remerciement" champs={champs} generer={generer} courriel />;
}
