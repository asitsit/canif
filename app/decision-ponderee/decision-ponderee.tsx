"use client";

// Matrice de décision pondérée : comparer plusieurs options sur des critères pondérés.

import MatriceDecision from "@/components/matrice-decision";

export default function DecisionPonderee() {
  return (
    <MatriceDecision
      cle="decision-ponderee"
      nomFichier="matrice-decision"
      libelleOption="Option"
      depart={{
        criteres: [
          ["Coût", 4],
          ["Délai de mise en place", 3],
          ["Facilité d'utilisation", 5],
          ["Évolutivité", 2],
        ],
        options: ["Outil A", "Outil B", "Outil C"],
        notes: [
          [3, 4, 2],
          [4, 2, 3],
          [3, 5, 4],
          [2, 3, 5],
        ],
      }}
    />
  );
}
