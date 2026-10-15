"use client";

// Dés personnalisables : dés à chiffres (4 à 100 faces) ou à faces écrites
// (mots, émojis). Les résultats sont tirés au moment du lancer ; l'animation
// qui suit ne fait que faire défiler des valeurs au hasard pour le spectacle.

import { useEffect, useState } from "react";
import BoutonPleinEcran from "@/components/bouton-plein-ecran";
import { usePleinEcran, useRaccourcis } from "@/lib/hooks";
import { entierAleatoire, lireListe } from "@/lib/hasard";
import styles from "./des.module.css";

const FACES_RAPIDES = [4, 6, 8, 10, 12, 20];
const FACES_EXEMPLE = "Oui\nNon\nPeut-être\nÀ toi de choisir\nDemande au groupe\nRelance";
const DUREE_ANIMATION = 700;

type Mode = "chiffres" | "perso";

// Position des points d'un dé à 6 faces, sur une grille de 3 x 3 cases (0 à 8).
const POINTS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export default function Des() {
  const [mode, setMode] = useState<Mode>("chiffres");
  const [nombreDes, setNombreDes] = useState(1);
  const [faces, setFaces] = useState(6);
  const [saisieFaces, setSaisieFaces] = useState("6");
  const [texteFaces, setTexteFaces] = useState(FACES_EXEMPLE);
  const [resultats, setResultats] = useState<number[]>([]); // indice de la face tirée, pour chaque dé
  const [affiches, setAffiches] = useState<number[]>([]); // valeurs affichées pendant l'animation
  const [enLancer, setEnLancer] = useState(false);
  const [historique, setHistorique] = useState<string[]>([]);

  const pleinEcran = usePleinEcran<HTMLDivElement>();
  const facesPerso = lireListe(texteFaces);
  const nbFaces = mode === "chiffres" ? faces : facesPerso.length;

  // Texte d'une face : le nombre (1 à N) ou le mot saisi.
  const texteFace = (indice: number) => (mode === "chiffres" ? String(indice + 1) : (facesPerso[indice] ?? "?"));

  function lancer() {
    if (enLancer || nbFaces < 2) return;
    const tirage = Array.from({ length: nombreDes }, () => entierAleatoire(nbFaces));
    setResultats(tirage);
    setEnLancer(true);
  }

  // Animation : des valeurs défilent, puis le vrai résultat s'affiche.
  useEffect(() => {
    if (!enLancer) return;
    const defilement = setInterval(() => {
      setAffiches(Array.from({ length: nombreDes }, () => entierAleatoire(nbFaces)));
    }, 70);
    const fin = setTimeout(() => {
      clearInterval(defilement);
      setAffiches(resultats);
      setEnLancer(false);
      const texte = resultats.map(texteFace).join(", ");
      const total = mode === "chiffres" && resultats.length > 1 ? ` (total ${somme(resultats)})` : "";
      setHistorique((h) => [texte + total, ...h].slice(0, 50));
    }, DUREE_ANIMATION);
    return () => {
      clearInterval(defilement);
      clearTimeout(fin);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enLancer]);

  function somme(liste: number[]) {
    return liste.reduce((t, i) => t + i + 1, 0);
  }

  function choisirFaces(n: number) {
    const borne = Math.min(Math.max(Math.round(n) || 2, 2), 100);
    setFaces(borne);
    setSaisieFaces(String(borne));
    setAffiches([]);
  }

  useRaccourcis({ " ": lancer, f: () => pleinEcran.possible && pleinEcran.basculer() });

  const valeurs = affiches.length === nombreDes ? affiches : [];
  const afficherPoints = mode === "chiffres" && faces === 6;

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Réglages">
        <label className="champ">
          Nombre de dés : {nombreDes}
          <input
            type="range"
            min={1}
            max={10}
            value={nombreDes}
            onChange={(e) => {
              setNombreDes(Number(e.target.value));
              setAffiches([]);
            }}
          />
        </label>

        <fieldset className={styles.mode}>
          <legend>Faces</legend>
          <label className="option">
            <input type="radio" name="mode" checked={mode === "chiffres"} onChange={() => { setMode("chiffres"); setAffiches([]); }} />
            Chiffres
          </label>
          <label className="option">
            <input type="radio" name="mode" checked={mode === "perso"} onChange={() => { setMode("perso"); setAffiches([]); }} />
            Faces personnalisées (mots, émojis...)
          </label>
        </fieldset>

        {mode === "chiffres" ? (
          <>
            <div className="choix">
              {FACES_RAPIDES.map((n) => (
                <button key={n} className={`bouton ${faces === n ? "bouton-actif" : ""}`} onClick={() => choisirFaces(n)}>
                  {n} faces
                </button>
              ))}
            </div>
            <label className="champ">
              Autre nombre de faces (2 à 100)
              <input
                type="number"
                inputMode="numeric"
                min={2}
                max={100}
                value={saisieFaces}
                onChange={(e) => setSaisieFaces(e.target.value)}
                onBlur={() => choisirFaces(Number(saisieFaces))}
                onKeyDown={(e) => e.key === "Enter" && choisirFaces(Number(saisieFaces))}
              />
            </label>
          </>
        ) : (
          <label className="champ">
            Une face par ligne ({facesPerso.length} face{facesPerso.length > 1 ? "s" : ""})
            <textarea
              rows={Math.max(4, Math.min(facesPerso.length + 1, 10))}
              value={texteFaces}
              onChange={(e) => {
                setTexteFaces(e.target.value);
                setAffiches([]);
              }}
              spellCheck={false}
            />
          </label>
        )}
        {nbFaces < 2 && <p className={styles.erreur}>Il faut au moins 2 faces.</p>}
      </section>

      <div ref={pleinEcran.ref} className={`resultat ${styles.zone} ${pleinEcran.actif ? "ecran-plein" : ""}`}>
        <div className={styles.des} aria-live="polite" aria-busy={enLancer}>
          {Array.from({ length: nombreDes }, (_, i) => {
            const v = valeurs[i];
            return (
              <div
                key={i}
                className={`${styles.de} ${enLancer ? styles.roule : ""} ${mode === "perso" ? styles.deTexte : ""}`}
                aria-label={v === undefined ? "Dé pas encore lancé" : `Dé ${i + 1} : ${texteFace(v)}`}
              >
                {v === undefined ? (
                  <span className={styles.vide}>?</span>
                ) : afficherPoints && POINTS[v + 1] ? (
                  <span className={styles.points} aria-hidden="true">
                    {Array.from({ length: 9 }, (_, c) => (
                      <span key={c} className={POINTS[v + 1].includes(c) ? styles.point : ""} />
                    ))}
                  </span>
                ) : (
                  <span aria-hidden="true">{texteFace(v)}</span>
                )}
              </div>
            );
          })}
        </div>

        <p className={styles.total}>
          {!enLancer && valeurs.length > 0 && mode === "chiffres" && nombreDes > 1 ? `Total : ${somme(valeurs)}` : " "}
        </p>

        <div className="commandes">
          <button className="bouton bouton-principal" onClick={lancer} disabled={enLancer || nbFaces < 2}>
            {nombreDes > 1 ? "Lancer les dés" : "Lancer le dé"}
          </button>
          <BoutonPleinEcran pleinEcran={pleinEcran} />
        </div>

        {historique.length > 0 && !pleinEcran.actif && (
          <div className={styles.historique}>
            <h2>Derniers lancers</h2>
            <ol reversed>
              {historique.slice(0, 10).map((h, i) => (
                <li key={historique.length - i}>{h}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
