"use client";

// Générateur de message d'invitation (atelier, réunion, formation...).

import GenerateurTexte, { type Valeurs } from "@/components/generateur-texte";
import { dateEnLettres, heureEnLettres, paragraphes, puces } from "@/lib/redaction";

const champs = [
  { id: "type", libelle: "Type d'événement", type: "choix" as const, options: ["atelier", "réunion", "formation", "séminaire", "webinaire"], defaut: "atelier" },
  { id: "ton", libelle: "Ton", type: "choix" as const, options: ["Chaleureux (tutoiement)", "Chaleureux (vouvoiement)", "Formel"], defaut: "Chaleureux (vouvoiement)" },
  { id: "titre", libelle: "Titre", defaut: "Imaginer notre organisation de demain" },
  { id: "date", libelle: "Date", type: "date" as const, defaut: "" },
  { id: "debut", libelle: "Heure de début", type: "heure" as const, defaut: "09:30" },
  { id: "fin", libelle: "Heure de fin", type: "heure" as const, defaut: "12:00" },
  { id: "lieu", libelle: "Lieu ou lien de visio", defaut: "Salle Horizon, 2e étage" },
  { id: "objectif", libelle: "Objectif (ce que l'on aura à la fin)", type: "zone" as const, defaut: "Repartir avec trois pistes concrètes et un responsable pour chacune." },
  { id: "preparer", libelle: "À préparer (une idée par ligne, facultatif)", type: "zone" as const, defaut: "Venir avec un exemple de situation qui vous a fait perdre du temps" },
  { id: "reponse", libelle: "Merci de répondre avant le (facultatif)", type: "date" as const, defaut: "" },
  { id: "signature", libelle: "Signature", defaut: "Camille" },
];

function generer(v: Valeurs) {
  const tu = v.ton.includes("tutoiement");
  const formel = v.ton === "Formel";
  const evt = v.type;
  const quand = [v.date && dateEnLettres(v.date), v.debut && v.fin ? `de ${heureEnLettres(v.debut)} à ${heureEnLettres(v.fin)}` : v.debut && `à ${heureEnLettres(v.debut)}`]
    .filter(Boolean)
    .join(", ");
  const salut = formel ? "Madame, Monsieur," : tu ? "Bonjour à toutes et à tous," : "Bonjour à toutes et à tous,";
  const invite = formel
    ? `J'ai le plaisir de vous convier au ${evt} « ${v.titre} »${quand ? `, le ${quand}` : ""}${v.lieu ? `, ${v.lieu.startsWith("http") ? "en visio : " + v.lieu : "lieu : " + v.lieu}` : ""}.`
    : `${tu ? "Je t'invite" : "Je vous invite"} au ${evt} « ${v.titre} »${quand ? `, le ${quand}` : ""}${v.lieu ? `, ${v.lieu.startsWith("http") ? "en visio : " + v.lieu : "à " + v.lieu}` : ""}.`;
  const objectif = v.objectif && `${formel ? "Objectif de cette séance" : "Notre objectif"} : ${v.objectif.trim()}`;
  const prep = v.preparer.trim() && `${tu ? "Pour bien démarrer, je te propose de :" : "Pour bien démarrer, je vous propose de :"}\n${puces(v.preparer)}`;
  const rep = v.reponse && `${tu ? "Peux-tu me confirmer ta présence" : formel ? "Je vous remercie de bien vouloir confirmer votre présence" : "Pouvez-vous me confirmer votre présence"} avant le ${dateEnLettres(v.reponse)} ?`;
  const fin = formel ? "Je vous prie d'agréer, Madame, Monsieur, mes salutations distinguées." : tu ? "Au plaisir de te retrouver," : "Au plaisir de vous retrouver,";
  const texte = paragraphes(salut, invite, objectif, prep, rep, `${fin}\n${v.signature}`);
  const objet = `Invitation : ${v.titre}${v.date ? ` le ${dateEnLettres(v.date).replace(/ \d{4}$/, "")}` : ""}`;
  return { texte, objet };
}

export default function Invitation() {
  return <GenerateurTexte cle="invitation" champs={champs} generer={generer} courriel />;
}
