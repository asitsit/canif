"use client";

// Matrice d'Eisenhower : trier les tâches selon leur urgence et leur importance.

import TableauZones from "@/components/tableau-zones";

export default function Eisenhower() {
  return (
    <TableauZones
      cle="eisenhower"
      nomFichier="matrice-eisenhower"
      libelleSujet="Périmètre (par exemple : ma semaine, le projet X)"
      zones={[
        { id: "faire", titre: "Faire maintenant", aide: "Urgent et important", couleur: "#fecaca" },
        { id: "planifier", titre: "Planifier", aide: "Important, pas urgent : bloquer un créneau", couleur: "#bbf7d0" },
        { id: "deleguer", titre: "Déléguer", aide: "Urgent, pas important : qui peut s'en charger ?", couleur: "#fde68a" },
        { id: "abandonner", titre: "Abandonner", aide: "Ni urgent ni important", couleur: "#e5e7eb" },
      ]}
      disposition={["faire planifier", "deleguer abandonner"]}
      axes={{ horizontal: ["Urgent", "Pas urgent"], vertical: ["Pas important", "Important"] }}
      exemple={{
        sujet: "Ma semaine",
        postIts: [
          { id: "e1", zone: "faire", texte: "Envoyer le devis attendu ce soir" },
          { id: "e2", zone: "planifier", texte: "Préparer l'atelier du mois prochain" },
          { id: "e3", zone: "deleguer", texte: "Réserver la salle" },
          { id: "e4", zone: "abandonner", texte: "Trier les anciens fichiers" },
        ],
      }}
    />
  );
}
