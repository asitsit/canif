"use client";

// Nuage de mots depuis un texte : les mots les plus fréquents, en plus gros.
// Les mots très courants (« le », « de », « et »...) sont ignorés.

import { useMemo, useRef, useState } from "react";
import BoutonPleinEcran from "@/components/bouton-plein-ecran";
import BoutonsExport from "@/components/boutons-export";
import { usePleinEcran } from "@/lib/hooks";
import { melanger } from "@/lib/hasard";
import { useStockageLocal } from "@/lib/stockage";
import { frequences, normaliser } from "@/lib/texte";
import styles from "./nuage-depuis-texte.module.css";

const COULEURS = ["#c2410c", "#0f766e", "#1d4ed8", "#7e22ce", "#a16207", "#be123c", "#15803d", "#334155"];

export default function NuageDepuisTexte() {
  const [texte, setTexte] = useStockageLocal("nuage-texte", "");
  const [exclusTexte, setExclusTexte] = useState("");
  const [nombre, setNombre] = useState(40);
  const [ordre, setOrdre] = useState(0); // change la disposition
  const zone = useRef<HTMLDivElement>(null);
  const pleinEcran = usePleinEcran<HTMLDivElement>();

  const exclus = new Set(exclusTexte.split(/[,\n;]/).map((m) => normaliser(m.trim())).filter(Boolean));
  const liste = frequences(texte, exclus).slice(0, nombre);
  const max = liste[0]?.n ?? 1;
  const min = liste[liste.length - 1]?.n ?? 1;
  const cleListe = liste.map((m) => m.mot + m.n).join("|");

  // Disposition au hasard, recalculée seulement si les mots changent ou sur demande.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const disposes = useMemo(() => melanger(liste.map((m, i) => ({ ...m, couleur: COULEURS[i % COULEURS.length] }))), [cleListe, ordre]);

  // Taille entre 1 et 4,5 fois la taille de base, selon la fréquence.
  const taille = (n: number) => (max === min ? 2 : 1 + ((n - min) / (max - min)) * 3.5);

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Texte">
        <label className="champ">
          Collez votre texte (verbatims, réponses, compte rendu...)
          <textarea rows={12} value={texte} onChange={(e) => setTexte(e.target.value)} />
        </label>
        <label className="champ">
          Mots à ignorer, séparés par des virgules
          <input type="text" value={exclusTexte} onChange={(e) => setExclusTexte(e.target.value)} placeholder="projet, équipe..." />
        </label>
        <label className="champ">
          Nombre de mots au maximum : {nombre}
          <input type="range" min={10} max={100} step={5} value={nombre} onChange={(e) => setNombre(Number(e.target.value))} />
        </label>
      </section>

      <div ref={pleinEcran.ref} className={`resultat ${pleinEcran.actif ? "ecran-plein" : ""}`}>
        <div ref={zone} className={styles.nuage} aria-label="Nuage de mots">
          {disposes.length === 0 ? (
            <p className="discret">Le nuage apparaîtra ici dès que vous aurez collé un texte.</p>
          ) : (
            disposes.map((m) => (
              <span key={m.mot} style={{ fontSize: `${taille(m.n)}em`, color: m.couleur }} title={`${m.n} fois`}>
                {m.mot}
              </span>
            ))
          )}
        </div>
        <div className="commandes">
          <button type="button" className="bouton" onClick={() => setOrdre((o) => o + 1)} disabled={!disposes.length}>
            Autre disposition
          </button>
          <BoutonsExport cible={zone} nomFichier="nuage-de-mots" />
          <BoutonPleinEcran pleinEcran={pleinEcran} />
        </div>
        {liste.length > 0 && !pleinEcran.actif && (
          <details className={styles.details}>
            <summary>Voir le décompte des mots</summary>
            <ol>
              {liste.map((m) => (
                <li key={m.mot}>
                  {m.mot} : {m.n}
                </li>
              ))}
            </ol>
          </details>
        )}
        <p className="discret">Le texte est analysé dans votre navigateur et n'est envoyé nulle part.</p>
      </div>
    </div>
  );
}
