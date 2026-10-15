"use client";

// Cartographie des parties prenantes : influence et intérêt de chacun,
// et la façon de l'impliquer qui en découle.

import TableauZones from "@/components/tableau-zones";

export default function PartiesPrenantes() {
  return (
    <TableauZones
      cle="parties-prenantes"
      nomFichier="parties-prenantes"
      libelleSujet="Projet"
      zones={[
        { id: "satisfaire", titre: "Satisfaire", aide: "Forte influence, intérêt faible : les tenir satisfaits sans les surcharger", couleur: "#fde68a" },
        { id: "associer", titre: "Associer étroitement", aide: "Forte influence, fort intérêt : décider avec eux", couleur: "#fecaca" },
        { id: "surveiller", titre: "Surveiller", aide: "Influence et intérêt faibles : un suivi léger suffit", couleur: "#e5e7eb" },
        { id: "informer", titre: "Informer", aide: "Intérêt fort, influence faible : les tenir au courant, les écouter", couleur: "#bfdbfe" },
      ]}
      disposition={["satisfaire associer", "surveiller informer"]}
      axes={{ horizontal: ["Intérêt faible", "Intérêt fort"], vertical: ["Influence faible", "Influence forte"] }}
      exemple={{
        sujet: "Nouvel outil de planification",
        postIts: [
          { id: "p1", zone: "associer", texte: "Direction des opérations" },
          { id: "p2", zone: "satisfaire", texte: "Direction financière" },
          { id: "p3", zone: "informer", texte: "Chefs d'équipe" },
          { id: "p4", zone: "surveiller", texte: "Prestataire informatique actuel" },
        ],
      }}
    />
  );
}
