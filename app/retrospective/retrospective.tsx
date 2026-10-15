"use client";

// Rétrospective, version simple (décision P7) : trois colonnes fixes, saisie par
// l'animateur, sans serveur. Sauvegarde dans le navigateur, export image ou PDF.

import TableauZones from "@/components/tableau-zones";

export default function Retrospective() {
  return (
    <TableauZones
      cle="retrospective"
      nomFichier="retrospective"
      libelleSujet="Période ou projet"
      zones={[
        { id: "commencer", titre: "Commencer", aide: "Ce que l'on devrait essayer", couleur: "#bbf7d0" },
        { id: "arreter", titre: "Arrêter", aide: "Ce qui ne nous sert plus", couleur: "#fecaca" },
        { id: "continuer", titre: "Continuer", aide: "Ce qui marche, à garder", couleur: "#bfdbfe" },
      ]}
      disposition={["commencer arreter continuer"]}
    />
  );
}
