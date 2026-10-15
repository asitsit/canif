"use client";

// Pile ou face : la pièce tourne pendant un court instant, puis affiche le résultat.
// Le résultat est tiré AVANT l'animation : l'animation ne change rien au hasard.

import { useEffect, useState } from "react";
import { usePleinEcran, useRaccourcis } from "@/lib/hooks";
import { entierAleatoire } from "@/lib/hasard";
import styles from "./pile-ou-face.module.css";

type Face = "Pile" | "Face";

// Durée de l'animation de la pièce, en millisecondes.
const DUREE_ANIMATION = 900;

export default function PileOuFace() {
  const [resultat, setResultat] = useState<Face | null>(null);
  const [enLancer, setEnLancer] = useState(false);
  const [numeroLancer, setNumeroLancer] = useState(0); // relance l'animation à chaque lancer
  const [historique, setHistorique] = useState<Face[]>([]);

  const pleinEcran = usePleinEcran<HTMLDivElement>();

  function lancer() {
    if (enLancer) return;
    setEnLancer(true);
    setNumeroLancer((n) => n + 1);
  }

  // À la fin de l'animation : tirage révélé et ajouté à l'historique.
  useEffect(() => {
    if (!enLancer) return;
    const tirage: Face = entierAleatoire(2) === 0 ? "Pile" : "Face";
    const minuterie = setTimeout(() => {
      setResultat(tirage);
      setHistorique((h) => [tirage, ...h].slice(0, 100));
      setEnLancer(false);
    }, DUREE_ANIMATION);
    return () => clearTimeout(minuterie);
  }, [enLancer]);

  useRaccourcis({ " ": lancer, f: () => pleinEcran.possible && pleinEcran.basculer() });

  const nbPile = historique.filter((r) => r === "Pile").length;
  const nbFace = historique.length - nbPile;

  return (
    <div className="outil-temps">
      <div ref={pleinEcran.ref} className={`ecran ${pleinEcran.actif ? "ecran-plein" : ""}`}>
        <div className={styles.scene}>
          <div
            key={numeroLancer}
            className={`${styles.piece} ${enLancer ? styles.tourne : ""}`}
            aria-hidden="true"
          >
            {enLancer ? "" : resultat ?? "?"}
          </div>
        </div>

        <p className={styles.resultat} aria-live="polite">
          {enLancer ? " " : resultat ? `${resultat} !` : "Appuyez sur Lancer"}
        </p>

        <div className="commandes">
          <button className="bouton bouton-principal" onClick={lancer} disabled={enLancer}>
            Lancer
          </button>
          {pleinEcran.possible && (
            <button className="bouton" onClick={pleinEcran.basculer}>
              {pleinEcran.actif ? "Quitter le plein écran" : "Plein écran"}
            </button>
          )}
        </div>
      </div>

      {historique.length > 0 && (
        <section className="reglages" aria-label="Historique">
          <h2>Historique</h2>
          <p>
            {historique.length} lancer{historique.length > 1 ? "s" : ""} : <strong>{nbPile}</strong> pile,{" "}
            <strong>{nbFace}</strong> face.
          </p>
          <ol className={styles.historique} reversed>
            {historique.slice(0, 20).map((r, i) => (
              <li key={historique.length - i} className={r === "Pile" ? styles.pile : styles.face}>
                {r}
              </li>
            ))}
          </ol>
          <div>
            <button className="bouton" onClick={() => setHistorique([])}>
              Effacer l'historique
            </button>
          </div>
        </section>
      )}

      <p className="discret">
        Raccourci clavier : Espace pour lancer{pleinEcran.possible ? ", F pour le plein écran" : ""}. Le tirage
        utilise le générateur aléatoire sécurisé du navigateur : chaque côté a exactement une chance sur deux.
      </p>
    </div>
  );
}
