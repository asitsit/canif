"use client";

// Bingo d'atelier imprimable : des grilles « Trouvez quelqu'un qui... », toutes
// différentes (cases mélangées), à imprimer. Cases rédigées pour Canif, modifiables.

import { useState } from "react";
import { lireListe, melanger } from "@/lib/hasard";
import { useStockageLocal } from "@/lib/stockage";
import styles from "./bingo.module.css";

// Première série rédigée pour Canif (contenu original, à relire : décision D19).
const CASES = [
  "parle au moins trois langues",
  "a dormi sous une tente cette année",
  "joue d'un instrument",
  "est arrivé dans l'équipe il y a moins de six mois",
  "est né le même mois que vous",
  "a déjà changé complètement de métier",
  "cuisine un plat d'un autre pays",
  "a marché plus de dix kilomètres en une journée",
  "lit un livre en ce moment",
  "n'a jamais pris l'avion",
  "a un animal de compagnie original",
  "a déjà animé un atelier",
  "se lève avant six heures",
  "connaît une blague à raconter tout de suite",
  "a grandi à la campagne",
  "pratique un sport d'équipe",
  "a déjà parlé devant plus de cent personnes",
  "collectionne quelque chose",
  "a appris une nouvelle compétence cette année",
  "est venu à pied ou à vélo aujourd'hui",
  "a travaillé dans un autre pays",
  "sait faire un nœud de marin",
  "a un prénom qui commence par la même lettre que le vôtre",
  "a déjà gagné un concours",
  "fait du bénévolat",
  "préfère le thé au café",
  "a visité plus de cinq pays",
  "dessine ou peint",
  "jardine",
  "a déjà monté un meuble sans la notice",
].join("\n");

export default function Bingo() {
  const [texte, setTexte] = useStockageLocal("bingo-cases", CASES);
  const [titre, setTitre] = useStockageLocal("bingo-titre", "Trouvez quelqu'un qui...");
  const [taille, setTaille] = useState(4);
  const [centreLibre, setCentreLibre] = useState(true);
  const [nombre, setNombre] = useState(1);
  const [grilles, setGrilles] = useState<string[][]>([]);

  const cases = lireListe(texte);
  const libreAuCentre = centreLibre && taille % 2 === 1;
  const necessaires = taille * taille - (libreAuCentre ? 1 : 0);
  const assez = cases.length >= necessaires;

  function generer() {
    if (!assez) return;
    setGrilles(
      Array.from({ length: nombre }, () => {
        const tirees = melanger(cases).slice(0, necessaires);
        if (libreAuCentre) tirees.splice(Math.floor((taille * taille) / 2), 0, "CASE LIBRE");
        return tirees;
      }),
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div className="mise-en-page-tirage pas-imprimer">
        <section className="reglages" aria-label="Réglages">
          <label className="champ">
            Titre des grilles
            <input type="text" value={titre} maxLength={60} onChange={(e) => setTitre(e.target.value)} />
          </label>
          <div className="choix">
            {[3, 4, 5].map((t) => (
              <button key={t} type="button" className={`bouton ${taille === t ? "bouton-actif" : ""}`} onClick={() => setTaille(t)}>
                {t} × {t}
              </button>
            ))}
          </div>
          {taille % 2 === 1 && (
            <label className="option">
              <input type="checkbox" checked={centreLibre} onChange={(e) => setCentreLibre(e.target.checked)} />
              Case libre au centre
            </label>
          )}
          <label className="champ">
            Nombre de grilles (une par participant) : {nombre}
            <input type="range" min={1} max={40} value={nombre} onChange={(e) => setNombre(Number(e.target.value))} />
          </label>
          <div>
            <button type="button" className="bouton bouton-principal" onClick={generer} disabled={!assez}>
              Générer {nombre > 1 ? `les ${nombre} grilles` : "la grille"}
            </button>
          </div>
        </section>
        <section className="reglages" aria-label="Cases">
          <label className="champ">
            Cases, une par ligne ({cases.length}, il en faut au moins {necessaires})
            <textarea rows={12} value={texte} onChange={(e) => setTexte(e.target.value)} />
          </label>
          {!assez && <p className="note">Ajoutez des cases ou choisissez une grille plus petite.</p>}
          <p className="note">Cases rédigées pour Canif (première série, à relire). Vous pouvez les remplacer par les vôtres : thème de la formation, jargon d'une réunion...</p>
        </section>
      </div>

      {grilles.length > 0 && (
        <>
          <div className="commandes pas-imprimer">
            <button type="button" className="bouton bouton-principal" onClick={() => window.print()}>
              Imprimer (une grille par page)
            </button>
          </div>
          <div className={styles.grilles}>
            {grilles.map((g, i) => (
              <section key={i} className={styles.page}>
                <h2 className={styles.titre}>{titre}</h2>
                <div className={styles.grille} style={{ gridTemplateColumns: `repeat(${taille}, 1fr)` }}>
                  {g.map((c, j) => (
                    <div key={j} className={`${styles.case} ${c === "CASE LIBRE" ? styles.libre : ""}`}>
                      <span>{c === "CASE LIBRE" ? "Case libre" : c}</span>
                      {c !== "CASE LIBRE" && <span className={styles.signature}>Prénom : ..........</span>}
                    </div>
                  ))}
                </div>
                <p className={styles.consigne}>Complétez une ligne, une colonne ou une diagonale, puis criez « Bingo ! ». Une même personne ne peut signer qu'une case.</p>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
