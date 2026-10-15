"use client";

// Rétro-planning : on part de l'échéance et on remonte le temps. Les étapes sont
// saisies dans l'ordre chronologique avec leur durée en jours ouvrés
// (« Étape : 5 »). La dernière étape se termine le jour de l'échéance ; chaque
// étape précédente se termine le jour ouvré qui précède le début de la suivante.

import { useEffect, useRef, useState } from "react";
import BoutonCopier from "@/components/bouton-copier";
import BoutonsExport from "@/components/boutons-export";
import FriseGantt from "@/components/frise-gantt";
import { ajouterJours, depuisIso, formaterDate, joursFeries, versIso } from "@/lib/dates";
import { useStockageLocal } from "@/lib/stockage";

const EXEMPLE = "Cadrage avec le client : 3\nConception de l'atelier : 5\nPréparation des supports : 4\nEnvoi des invitations : 1\nRépétition : 1";

const COULEURS = ["#c2410c", "#0f766e", "#1d4ed8", "#7e22ce", "#a16207", "#be123c", "#15803d", "#334155"];

// « Étape : 5 » (jours ouvrés). Séparateurs acceptés : deux-points, point-virgule, tabulation.
function lireEtapes(texte: string) {
  return texte
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/^(.+?)\s*[:;\t]\s*(\d+(?:[.,]5)?)\s*(?:j|jours?)?$/i);
      return m ? { nom: m[1], jours: Math.max(Math.ceil(Number(m[2].replace(",", "."))), 1), ligne: l } : { nom: "", jours: 0, ligne: l };
    });
}

export default function RetroPlanning() {
  const [texte, setTexte] = useStockageLocal("retro-planning", EXEMPLE);
  const [echeance, setEcheance] = useStockageLocal("retro-planning-echeance", "");
  const [feries, setFeries] = useState(true);
  const zone = useRef<HTMLDivElement>(null);

  // Échéance par défaut : dans six semaines (calculée dans le navigateur).
  useEffect(() => {
    const t = setTimeout(() => setEcheance((e) => e || versIso(ajouterJours(new Date(), 42))), 0);
    return () => clearTimeout(t);
  }, [setEcheance]);

  const etapes = lireEtapes(texte);
  const illisibles = etapes.filter((e) => !e.nom).map((e) => e.ligne);
  const valides = etapes.filter((e) => e.nom);
  const fin = depuisIso(echeance);

  const cache = new Map<number, Map<string, string>>();
  const ouvre = (d: Date) => {
    if (d.getDay() === 0 || d.getDay() === 6) return false;
    if (!feries) return true;
    if (!cache.has(d.getFullYear())) cache.set(d.getFullYear(), joursFeries(d.getFullYear()));
    return !cache.get(d.getFullYear())!.has(versIso(d));
  };
  // Jour ouvré précédent (ou le jour même s'il est ouvré et que « inclus » est vrai).
  const ouvrePrecedent = (d: Date, inclus: boolean) => {
    let x = inclus ? d : ajouterJours(d, -1);
    while (!ouvre(x)) x = ajouterJours(x, -1);
    return x;
  };

  // Calcul à rebours
  const planning: { nom: string; debut: Date; fin: Date; jours: number }[] = [];
  if (fin) {
    let finEtape = ouvrePrecedent(fin, true);
    for (let i = valides.length - 1; i >= 0; i--) {
      let debut = finEtape;
      for (let n = 1; n < valides[i].jours; n++) debut = ouvrePrecedent(debut, false);
      planning.unshift({ nom: valides[i].nom, debut, fin: finEtape, jours: valides[i].jours });
      finEtape = ouvrePrecedent(debut, false);
    }
  }
  const totalJours = valides.reduce((t, e) => t + e.jours, 0);
  const demarrage = planning[0]?.debut;
  const enRetard = demarrage && demarrage < new Date(new Date().setHours(0, 0, 0, 0));

  const texteACopier = planning.map((p) => `${p.nom} : du ${formaterDate(p.debut)} au ${formaterDate(p.fin)} (${p.jours} j)`).join("\n");

  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1fr)" }}>
      <div className="mise-en-page-tirage">
        <section className="reglages" aria-label="Échéance et étapes">
          <label className="champ">
            Date d'échéance (le jour où tout doit être prêt)
            <input type="date" value={echeance} onChange={(e) => setEcheance(e.target.value)} />
          </label>
          <label className="champ">
            Étapes dans l'ordre, avec leur durée en jours ouvrés
            <textarea rows={8} value={texte} onChange={(e) => setTexte(e.target.value)} spellCheck={false} />
          </label>
          {illisibles.length > 0 && <p className="note">Lignes non comprises (format attendu « Étape : 3 ») : {illisibles.join(", ")}</p>}
          <label className="option">
            <input type="checkbox" checked={feries} onChange={(e) => setFeries(e.target.checked)} />
            Sauter aussi les jours fériés (France)
          </label>
        </section>

        <div className="resultat" aria-live="polite">
          {demarrage ? (
            <>
              <p style={{ margin: 0, fontSize: "clamp(1.3rem, 4vw, 1.8rem)", fontWeight: 800, color: enRetard ? "var(--rouge)" : "var(--accent)" }}>
                Commencer le {formaterDate(demarrage)}
              </p>
              <p className="discret">
                {totalJours} jours ouvrés de travail avant l'échéance du {fin && formaterDate(fin)}.
                {enRetard && " Cette date est déjà passée : il faut raccourcir des étapes ou décaler l'échéance."}
              </p>
              <ol>
                {planning.map((p) => (
                  <li key={p.nom + p.debut.getTime()}>
                    <strong>{p.nom}</strong> : du {formaterDate(p.debut, true)} au {formaterDate(p.fin, true)} ({p.jours} j)
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className="discret">Choisissez une échéance et saisissez au moins une étape.</p>
          )}
          <div className="commandes">
            <BoutonCopier texte={texteACopier} libelle="Copier le planning" />
          </div>
        </div>
      </div>

      <div ref={zone} style={{ padding: 16, overflowX: "auto", background: "var(--surface)", border: "1px solid var(--bordure)", borderRadius: 12 }}>
        <FriseGantt
          barres={[
            ...planning.map((p, i) => ({ nom: p.nom, debut: p.debut, fin: p.fin, couleur: COULEURS[i % COULEURS.length] })),
            ...(fin && planning.length ? [{ nom: "Échéance", debut: fin, fin, jalon: true }] : []),
          ]}
          aujourdhui={new Date()}
        />
      </div>
      <div className="commandes pas-imprimer">
        <BoutonsExport cible={zone} nomFichier="retro-planning" />
      </div>
    </div>
  );
}
