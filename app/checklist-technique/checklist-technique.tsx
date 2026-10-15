"use client";

// Checklist technique d'atelier (liste rédigée pour Canif, modifiable).

import ListeCochable, { type Section } from "@/components/liste-cochable";

const SECTIONS: Section[] = [
  {
    titre: "Une semaine avant",
    elements: [
      "Salle réservée et réservation confirmée",
      "Lien de visio créé et testé (si atelier à distance ou hybride)",
      "Invitation envoyée avec horaires, lieu et objectif",
      "Supports prêts (présentation, documents à distribuer)",
      "Besoins d'accessibilité demandés aux participants",
      "Matériel commandé ou réservé",
    ],
  },
  {
    titre: "La veille",
    elements: [
      "Ordinateur chargé, chargeur dans le sac",
      "Présentation copiée sur une clé USB et en ligne",
      "Adaptateurs vidéo (HDMI, USB-C) dans le sac",
      "Liste des participants à portée de main",
      "Itinéraire, accès et code d'entrée vérifiés",
    ],
  },
  {
    titre: "Sur place, une heure avant",
    elements: [
      "Vidéoprojecteur ou écran testé (image et son)",
      "Wi-Fi testé, code d'accès noté et affiché",
      "Micro testé (grande salle)",
      "Tables et chaises disposées selon le format",
      "Paperboard, feutres et post-its en place",
      "Eau et café prévus",
      "Température et lumière réglées",
      "Sorties de secours et toilettes repérées",
    ],
  },
  {
    titre: "Visio et hybride",
    elements: [
      "Partage d'écran testé",
      "Son de la salle audible à distance (tester avec une personne)",
      "Caméra cadrée sur la salle",
      "Co-animateur désigné pour suivre le chat",
      "Liens des outils collaboratifs prêts à partager",
    ],
  },
  {
    titre: "Juste avant de commencer",
    elements: [
      "Téléphone en silencieux",
      "Minuteur prêt",
      "Objectifs et programme affichés",
      "Horaires des pauses annoncés",
    ],
  },
];

export default function ChecklistTechnique() {
  return <ListeCochable cle="checklist-technique" sections={SECTIONS} />;
}
