"use client";

// Tirage de lettre ou de thème (petit bac, jeux de mots, brainstorming contraint).
// Les lettres difficiles peuvent être exclues ; les thèmes sont modifiables.

import { useState } from "react";
import TirageCartes from "@/components/tirage-cartes";
import { lireListe } from "@/lib/hasard";
import { useStockageLocal } from "@/lib/stockage";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const DIFFICILES = ["K", "Q", "W", "X", "Y", "Z"];

// Thèmes proposés (liste rédigée pour Canif, modifiable).
const THEMES = [
  "Un animal",
  "Un pays",
  "Un métier",
  "Un fruit ou un légume",
  "Un objet du bureau",
  "Une ville",
  "Un sport",
  "Un instrument de musique",
  "Quelque chose qu'on trouve dans une cuisine",
  "Un moyen de transport",
  "Un vêtement",
  "Un outil",
  "Quelque chose qui fait du bruit",
  "Un mot qui rend heureux",
  "Une qualité d'équipe",
].join("\n");

export default function TirageLettre() {
  const [mode, setMode] = useState<"lettre" | "theme" | "les-deux">("lettre");
  const [sansDifficiles, setSansDifficiles] = useState(true);
  const [themes, setThemes] = useStockageLocal("tirage-lettre-themes", THEMES);

  const lettres = ALPHABET.filter((l) => !sansDifficiles || !DIFFICILES.includes(l));
  const listeThemes = lireListe(themes);

  // « Les deux » : une carte = un thème + une lettre (pour le petit bac).
  const cartes =
    mode === "lettre"
      ? lettres.map((l) => ({ texte: l }))
      : mode === "theme"
        ? listeThemes.map((t) => ({ texte: t }))
        : listeThemes.flatMap((t) => lettres.map((l) => ({ texte: `${t} en ${l}` })));

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Réglages">
        <div className="choix">
          {(
            [
              ["lettre", "Une lettre"],
              ["theme", "Un thème"],
              ["les-deux", "Thème + lettre"],
            ] as const
          ).map(([id, nom]) => (
            <button key={id} type="button" className={`bouton ${mode === id ? "bouton-actif" : ""}`} onClick={() => setMode(id)}>
              {nom}
            </button>
          ))}
        </div>
        {mode !== "theme" && (
          <label className="option">
            <input type="checkbox" checked={sansDifficiles} onChange={(e) => setSansDifficiles(e.target.checked)} />
            Exclure les lettres difficiles ({DIFFICILES.join(", ")})
          </label>
        )}
        {mode !== "lettre" && (
          <label className="champ">
            Thèmes, un par ligne (gardés dans ce navigateur)
            <textarea rows={8} value={themes} onChange={(e) => setThemes(e.target.value)} />
          </label>
        )}
      </section>
      <TirageCartes cartes={cartes} libelleBouton={mode === "lettre" ? "Tirer une lettre" : "Tirer"} tailleTexte={mode === "lettre" ? "geante" : "normale"} />
    </div>
  );
}
