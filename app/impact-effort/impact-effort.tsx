"use client";

// Matrice impact / effort : prioriser des idées ou des actions.

import TableauZones from "@/components/tableau-zones";

export default function ImpactEffort() {
  return (
    <TableauZones
      cle="impact-effort"
      nomFichier="matrice-impact-effort"
      libelleSujet="Ce que l'on priorise"
      zones={[
        { id: "rapides", titre: "Gains rapides", aide: "Fort impact, effort faible : à lancer en premier", couleur: "#bbf7d0" },
        { id: "majeurs", titre: "Projets majeurs", aide: "Fort impact, effort fort : à planifier", couleur: "#bfdbfe" },
        { id: "petits", titre: "Petites tâches", aide: "Impact faible, effort faible : si le temps le permet", couleur: "#fde68a" },
        { id: "eviter", titre: "À éviter", aide: "Impact faible, effort fort", couleur: "#fecaca" },
      ]}
      disposition={["rapides majeurs", "petits eviter"]}
      axes={{ horizontal: ["Effort faible", "Effort fort"], vertical: ["Impact faible", "Impact fort"] }}
      exemple={{
        sujet: "Améliorer nos réunions",
        postIts: [
          { id: "i1", zone: "rapides", texte: "Envoyer l'ordre du jour la veille" },
          { id: "i2", zone: "majeurs", texte: "Former les animateurs" },
          { id: "i3", zone: "petits", texte: "Changer la salle habituelle" },
          { id: "i4", zone: "eviter", texte: "Changer d'outil de visio" },
        ],
      }}
    />
  );
}
