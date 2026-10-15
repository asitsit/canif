"use client";

// Matrice de sélection de mission : faut-il accepter cette mission ?
// Critères préréglés (modifiables), verdict selon le score :
// 70 % et plus « Go », de 50 à 70 % « À discuter », moins de 50 % « Non ».

import MatriceDecision from "@/components/matrice-decision";

export default function SelectionMission() {
  return (
    <MatriceDecision
      cle="selection-mission"
      nomFichier="selection-mission"
      libelleOption="Mission"
      depart={{
        criteres: [
          ["Intérêt du sujet", 4],
          ["Rémunération par rapport à mon TJM cible", 5],
          ["Lien avec mon expertise", 4],
          ["Qualité de la relation avec le client", 3],
          ["Délai réaliste", 3],
          ["Potentiel de suite ou de recommandation", 3],
          ["Compatible avec ma charge actuelle", 4],
        ],
        options: ["Mission 1", "Mission 2"],
        notes: [
          [4, 2],
          [3, 5],
          [5, 3],
          [4, 2],
          [3, 2],
          [4, 1],
          [4, 3],
        ],
      }}
      verdict={(p) => (p >= 70 ? { texte: "Go", classe: "bon" } : p >= 50 ? { texte: "À discuter", classe: "moyen" } : { texte: "Non", classe: "mauvais" })}
    />
  );
}
