"use client";

// Liste de matériel à emporter (liste rédigée pour Canif, modifiable).

import ListeCochable, { type Section } from "@/components/liste-cochable";

const SECTIONS: Section[] = [
  {
    titre: "Animation",
    elements: [
      "Feutres pour paperboard, plusieurs couleurs",
      "Post-its de plusieurs couleurs et tailles",
      "Gommettes pour les votes",
      "Pâte adhésive ou ruban de masquage",
      "Paperboard ou rouleau de papier kraft",
      "Ciseaux",
      "Étiquettes pour les prénoms",
      "Minuteur (ou téléphone)",
    ],
  },
  {
    titre: "Technique",
    elements: [
      "Ordinateur et chargeur",
      "Adaptateurs vidéo (HDMI, USB-C)",
      "Rallonge et multiprise",
      "Télécommande de présentation",
      "Clé USB avec les supports",
      "Enceinte portable",
    ],
  },
  {
    titre: "Documents",
    elements: ["Programme imprimé", "Feuille d'émargement", "Supports à distribuer", "Questionnaire de satisfaction"],
  },
  {
    titre: "Confort",
    elements: ["Bouteilles d'eau", "Mouchoirs", "Quelques encas", "Pansements"],
  },
];

export default function ListeMateriel() {
  return <ListeCochable cle="liste-materiel" sections={SECTIONS} />;
}
