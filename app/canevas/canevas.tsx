"use client";

// Canevas : SWOT, persona, carte d'empathie, Business Model Canvas.
// Chaque modèle a son propre contenu, gardé séparément dans le navigateur.

import { useState } from "react";
import TableauZones, { type Zone } from "@/components/tableau-zones";

type Modele = {
  id: string;
  nom: string;
  description: string;
  zones: Zone[];
  disposition: string[];
  colonnes?: string;
  axes?: { horizontal?: [string, string]; vertical?: [string, string] };
};

const MODELES: Modele[] = [
  {
    id: "swot",
    nom: "SWOT",
    description: "Forces et faiblesses (internes), opportunités et menaces (externes).",
    zones: [
      { id: "forces", titre: "Forces", aide: "Ce qui fonctionne bien, nos atouts", couleur: "#bbf7d0" },
      { id: "faiblesses", titre: "Faiblesses", aide: "Ce qui nous freine", couleur: "#fecaca" },
      { id: "opportunites", titre: "Opportunités", aide: "Ce qui, dehors, peut nous servir", couleur: "#bfdbfe" },
      { id: "menaces", titre: "Menaces", aide: "Ce qui, dehors, peut nous nuire", couleur: "#fde68a" },
    ],
    disposition: ["forces faiblesses", "opportunites menaces"],
    axes: { horizontal: ["Positif", "Négatif"], vertical: ["Externe", "Interne"] },
  },
  {
    id: "persona",
    nom: "Persona",
    description: "Le portrait d'un utilisateur type, pour concevoir à partir de ses besoins.",
    zones: [
      { id: "identite", titre: "Qui est-ce ?", aide: "Prénom, âge, métier, situation", couleur: "#e9d5ff" },
      { id: "citation", titre: "Sa phrase", aide: "Une citation qui le résume", couleur: "#fde68a" },
      { id: "objectifs", titre: "Ses objectifs", aide: "Ce qu'il veut accomplir", couleur: "#bbf7d0" },
      { id: "frustrations", titre: "Ses frustrations", aide: "Ce qui le gêne aujourd'hui", couleur: "#fecaca" },
      { id: "habitudes", titre: "Ses habitudes", aide: "Outils, moments, lieux", couleur: "#bfdbfe" },
      { id: "besoins", titre: "Ce dont il a besoin de nous", aide: "Attentes envers le service", couleur: "#fed7aa" },
    ],
    disposition: ["identite citation citation", "objectifs frustrations habitudes", "besoins besoins besoins"],
  },
  {
    id: "empathie",
    nom: "Carte d'empathie",
    description: "Se mettre à la place d'une personne : ce qu'elle pense, voit, entend, dit et fait.",
    zones: [
      { id: "pense", titre: "Pense et ressent", aide: "Préoccupations, aspirations", couleur: "#e9d5ff" },
      { id: "voit", titre: "Voit", aide: "Son environnement, ce qu'on lui propose", couleur: "#bfdbfe" },
      { id: "entend", titre: "Entend", aide: "Ce que disent ses proches, ses collègues", couleur: "#a5f3fc" },
      { id: "dit", titre: "Dit et fait", aide: "Attitude en public, comportements", couleur: "#fde68a" },
      { id: "douleurs", titre: "Douleurs", aide: "Peurs, obstacles, frustrations", couleur: "#fecaca" },
      { id: "gains", titre: "Gains", aide: "Envies, besoins, mesures du succès", couleur: "#bbf7d0" },
    ],
    disposition: ["voit pense entend", "voit dit entend", "douleurs douleurs gains"],
  },
  {
    id: "bmc",
    nom: "Business Model Canvas",
    description: "Les neuf blocs d'un modèle économique, d'après Alexander Osterwalder.",
    zones: [
      { id: "partenaires", titre: "Partenaires clés", aide: "Avec qui travaille-t-on ?", couleur: "#e5e7eb" },
      { id: "activites", titre: "Activités clés", aide: "Ce qu'on doit faire très bien", couleur: "#fde68a" },
      { id: "ressources", titre: "Ressources clés", aide: "Ce dont on a besoin", couleur: "#fde68a" },
      { id: "valeur", titre: "Proposition de valeur", aide: "Quel problème résout-on, pour qui ?", couleur: "#fecaca" },
      { id: "relations", titre: "Relations clients", aide: "Quel lien avec chaque segment ?", couleur: "#bfdbfe" },
      { id: "canaux", titre: "Canaux", aide: "Comment les atteint-on ?", couleur: "#bfdbfe" },
      { id: "segments", titre: "Segments de clientèle", aide: "Pour qui crée-t-on de la valeur ?", couleur: "#bbf7d0" },
      { id: "couts", titre: "Structure de coûts", aide: "Les principaux coûts", couleur: "#e9d5ff" },
      { id: "revenus", titre: "Sources de revenus", aide: "Qui paie, combien, comment ?", couleur: "#e9d5ff" },
    ],
    disposition: [
      "partenaires partenaires activites activites valeur valeur relations relations segments segments",
      "partenaires partenaires ressources ressources valeur valeur canaux canaux segments segments",
      "couts couts couts couts couts revenus revenus revenus revenus revenus",
    ],
  },
];

export default function Canevas() {
  const [modeleId, setModeleId] = useState(MODELES[0].id);
  const modele = MODELES.find((m) => m.id === modeleId) ?? MODELES[0];

  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1fr)" }}>
      <div className="choix pas-imprimer" role="tablist" aria-label="Modèle de canevas">
        {MODELES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={m.id === modeleId}
            className={`bouton ${m.id === modeleId ? "bouton-actif" : ""}`}
            onClick={() => setModeleId(m.id)}
          >
            {m.nom}
          </button>
        ))}
      </div>
      <p className="discret pas-imprimer" style={{ margin: 0 }}>
        {modele.description}
      </p>
      {/* « key » : un tableau neuf (et sa propre mémoire) pour chaque modèle */}
      <TableauZones
        key={modele.id}
        cle={`canevas-${modele.id}`}
        nomFichier={`canevas-${modele.id}`}
        zones={modele.zones}
        disposition={modele.disposition}
        axes={modele.axes}
        libelleSujet={modele.id === "persona" || modele.id === "empathie" ? "Pour qui ?" : "Sujet"}
      />
    </div>
  );
}
