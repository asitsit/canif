"use client";

// Diagramme d'Ishikawa (arête de poisson) : les causes possibles d'un problème,
// rangées selon les « 6 M ».

import TableauZones from "@/components/tableau-zones";

export default function Ishikawa() {
  return (
    <TableauZones
      cle="ishikawa"
      nomFichier="diagramme-ishikawa"
      libelleSujet="Problème étudié (l'effet)"
      zones={[
        { id: "methodes", titre: "Méthodes", aide: "Procédures, règles, façons de faire", couleur: "#bfdbfe" },
        { id: "materiel", titre: "Matériel", aide: "Équipements, outils, logiciels", couleur: "#bfdbfe" },
        { id: "main", titre: "Main-d'œuvre", aide: "Compétences, effectifs, formation", couleur: "#bfdbfe" },
        { id: "effet", titre: "Effet", aide: "Les symptômes observés, précisément", couleur: "#fecaca" },
        { id: "milieu", titre: "Milieu", aide: "Environnement, contexte, organisation", couleur: "#bbf7d0" },
        { id: "matieres", titre: "Matières", aide: "Informations, fournitures, données d'entrée", couleur: "#bbf7d0" },
        { id: "mesure", titre: "Mesure", aide: "Indicateurs, contrôles, suivi", couleur: "#bbf7d0" },
      ]}
      disposition={["methodes materiel main effet", "milieu matieres mesure effet"]}
      colonnes="1fr 1fr 1fr 1.2fr"
      exemple={{
        sujet: "Les comptes rendus arrivent en retard",
        postIts: [
          { id: "k1", zone: "effet", texte: "Envoyés une semaine après la réunion en moyenne" },
          { id: "k2", zone: "methodes", texte: "Pas de modèle commun" },
          { id: "k3", zone: "main", texte: "Personne n'est désigné pour les rédiger" },
          { id: "k4", zone: "mesure", texte: "Aucun suivi des délais" },
        ],
      }}
    />
  );
}
