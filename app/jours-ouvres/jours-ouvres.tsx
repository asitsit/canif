"use client";

// Jours ouvrés : compte les jours de travail entre deux dates (hors week-ends
// et jours fériés français), ou calcule la date atteinte après N jours ouvrés.
// Rappel : jours ouvrés = du lundi au vendredi ; jours ouvrables = du lundi au samedi.

import { useEffect, useState } from "react";
import { ajouterJours, depuisIso, ecartJours, formaterDate, joursFeries, versIso } from "@/lib/dates";
import styles from "./jours-ouvres.module.css";

type Options = { feries: boolean; alsace: boolean; pentecote: boolean };

// Le jour est-il travaillé ? (samedi compté seulement pour les jours ouvrables)
function estTravaille(d: Date, opt: Options, avecSamedi: boolean, cache: Map<number, Map<string, string>>) {
  const jour = d.getDay();
  if (jour === 0 || (jour === 6 && !avecSamedi)) return false;
  if (!opt.feries) return true;
  const annee = d.getFullYear();
  if (!cache.has(annee)) cache.set(annee, joursFeries(annee, { alsaceMoselle: opt.alsace, pentecote: opt.pentecote }));
  return !cache.get(annee)!.has(versIso(d));
}

export default function JoursOuvres() {
  const [mode, setMode] = useState<"compter" | "ajouter">("compter");
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");
  const [nbJours, setNbJours] = useState("10");
  const [inclureFin, setInclureFin] = useState(true);
  const [opt, setOpt] = useState<Options>({ feries: true, alsace: false, pentecote: true });

  // Dates par défaut : aujourd'hui et dans un mois (calculées dans le navigateur).
  useEffect(() => {
    const auj = new Date();
    setDebut(versIso(auj));
    setFin(versIso(ajouterJours(auj, 30)));
  }, []);

  const d1 = depuisIso(debut);
  const d2 = depuisIso(fin);
  const cache = new Map<number, Map<string, string>>();

  // --- Mode « compter » ---
  let resultat: null | { calendaires: number; ouvres: number; ouvrables: number; weekEnds: number; feries: [string, string][] } = null;
  if (mode === "compter" && d1 && d2 && ecartJours(d1, d2) >= 0 && ecartJours(d1, d2) < 365 * 20) {
    const total = ecartJours(d1, d2) + (inclureFin ? 1 : 0);
    let ouvres = 0;
    let ouvrables = 0;
    let weekEnds = 0;
    const feries: [string, string][] = [];
    for (let i = 0; i < total; i++) {
      const d = ajouterJours(d1, i);
      if (d.getDay() === 0 || d.getDay() === 6) weekEnds++;
      if (estTravaille(d, opt, false, cache)) ouvres++;
      if (estTravaille(d, opt, true, cache)) ouvrables++;
      const nom = opt.feries ? cache.get(d.getFullYear())?.get(versIso(d)) : undefined;
      if (nom && d.getDay() !== 0 && d.getDay() !== 6) feries.push([formaterDate(d), nom]);
    }
    resultat = { calendaires: total, ouvres, ouvrables, weekEnds, feries };
  }

  // --- Mode « ajouter » : date atteinte après N jours ouvrés (le jour de départ ne compte pas) ---
  let dateAtteinte: Date | null = null;
  const n = Math.min(Math.max(Math.round(Number(nbJours)) || 0, 0), 2000);
  if (mode === "ajouter" && d1) {
    let d = d1;
    let restants = n;
    while (restants > 0) {
      d = ajouterJours(d, 1);
      if (estTravaille(d, opt, false, cache)) restants--;
    }
    dateAtteinte = d;
  }

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Réglages">
        <div className="choix" role="radiogroup" aria-label="Calcul">
          <button type="button" className={`bouton ${mode === "compter" ? "bouton-actif" : ""}`} onClick={() => setMode("compter")}>
            Compter entre deux dates
          </button>
          <button type="button" className={`bouton ${mode === "ajouter" ? "bouton-actif" : ""}`} onClick={() => setMode("ajouter")}>
            Ajouter des jours ouvrés
          </button>
        </div>

        <div className="champs">
          <label className="champ">
            {mode === "compter" ? "Du" : "À partir du"}
            <input type="date" value={debut} onChange={(e) => setDebut(e.target.value)} />
          </label>
          {mode === "compter" ? (
            <label className="champ">
              Au
              <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} />
            </label>
          ) : (
            <label className="champ">
              Nombre de jours ouvrés
              <input type="number" min={0} max={2000} value={nbJours} onChange={(e) => setNbJours(e.target.value)} />
            </label>
          )}
        </div>

        {mode === "compter" && (
          <label className="option">
            <input type="checkbox" checked={inclureFin} onChange={(e) => setInclureFin(e.target.checked)} />
            Compter le dernier jour (du 1er au 5 = 5 jours)
          </label>
        )}
        <label className="option">
          <input type="checkbox" checked={opt.feries} onChange={(e) => setOpt({ ...opt, feries: e.target.checked })} />
          Exclure les jours fériés (France)
        </label>
        {opt.feries && (
          <>
            <label className="option">
              <input type="checkbox" checked={opt.pentecote} onChange={(e) => setOpt({ ...opt, pentecote: e.target.checked })} />
              Lundi de Pentecôte non travaillé
            </label>
            <label className="option">
              <input type="checkbox" checked={opt.alsace} onChange={(e) => setOpt({ ...opt, alsace: e.target.checked })} />
              Alsace-Moselle (Vendredi saint, 26 décembre)
            </label>
          </>
        )}
      </section>

      <div className="resultat" aria-live="polite">
        {mode === "compter" && !resultat && <p className="discret">Choisissez une date de fin postérieure à la date de début.</p>}
        {resultat && (
          <>
            <dl className={styles.chiffres}>
              <div className={styles.principal}>
                <dt>Jours ouvrés</dt>
                <dd>{resultat.ouvres}</dd>
              </div>
              <div>
                <dt>Jours ouvrables</dt>
                <dd>{resultat.ouvrables}</dd>
              </div>
              <div>
                <dt>Jours calendaires</dt>
                <dd>{resultat.calendaires}</dd>
              </div>
              <div>
                <dt>Jours de week-end</dt>
                <dd>{resultat.weekEnds}</dd>
              </div>
            </dl>
            <p className="discret">Ouvrés : du lundi au vendredi. Ouvrables : du lundi au samedi. Jours fériés exclus des deux.</p>
            {resultat.feries.length > 0 && (
              <>
                <h2 className={styles.titre}>Jours fériés tombant en semaine</h2>
                <ul>
                  {resultat.feries.map(([date, nom]) => (
                    <li key={date}>
                      {date} : {nom}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
        {dateAtteinte && (
          <>
            <p className={styles.date}>{formaterDate(dateAtteinte)}</p>
            <p className="discret">
              Date atteinte après {n} jour{n > 1 ? "s" : ""} ouvré{n > 1 ? "s" : ""}, sans compter le jour de départ.
            </p>
          </>
        )}
        <p className="discret">
          Jours fériés nationaux calculés automatiquement (y compris Pâques, l'Ascension et la Pentecôte). Les ponts et
          les jours de fermeture propres à votre structure ne sont pas pris en compte.
        </p>
      </div>
    </div>
  );
}
