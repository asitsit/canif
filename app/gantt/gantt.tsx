"use client";

// Gantt simple : une liste de tâches (nom, début, fin) affichée en frise.
// Une tâche dont la fin est égale au début peut être marquée comme jalon.

import { useEffect, useRef, useState } from "react";
import BoutonsExport from "@/components/boutons-export";
import FriseGantt from "@/components/frise-gantt";
import { ajouterJours, depuisIso, versIso } from "@/lib/dates";
import { nouvelId, useStockageLocal } from "@/lib/stockage";
import styles from "./gantt.module.css";

type Tache = { id: string; nom: string; debut: string; fin: string; jalon: boolean; couleur: string };

const COULEURS = ["#c2410c", "#0f766e", "#1d4ed8", "#7e22ce", "#a16207", "#be123c", "#15803d", "#334155"];

function exemple(): Tache[] {
  const auj = new Date();
  const d = (n: number) => versIso(ajouterJours(auj, n));
  return [
    { id: nouvelId(), nom: "Cadrage", debut: d(0), fin: d(6), jalon: false, couleur: COULEURS[0] },
    { id: nouvelId(), nom: "Ateliers utilisateurs", debut: d(7), fin: d(20), jalon: false, couleur: COULEURS[1] },
    { id: nouvelId(), nom: "Comité de validation", debut: d(21), fin: d(21), jalon: true, couleur: COULEURS[7] },
    { id: nouvelId(), nom: "Déploiement", debut: d(22), fin: d(45), jalon: false, couleur: COULEURS[2] },
  ];
}

export default function Gantt() {
  const [taches, setTaches] = useStockageLocal<Tache[]>("gantt", []);
  const [pret, setPret] = useState(false);
  const zone = useRef<HTMLDivElement>(null);

  // Exemple daté par rapport à aujourd'hui, créé dans le navigateur à la première visite.
  useEffect(() => {
    const t = setTimeout(() => {
      setTaches((liste) => (liste.length ? liste : exemple()));
      setPret(true);
    }, 0);
    return () => clearTimeout(t);
  }, [setTaches]);

  const modifier = (id: string, champ: Partial<Tache>) => setTaches((l) => l.map((t) => (t.id === id ? { ...t, ...champ } : t)));
  const deplacer = (i: number, sens: -1 | 1) =>
    setTaches((l) => {
      const n = [...l];
      const j = i + sens;
      if (j < 0 || j >= n.length) return l;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  const barres = taches
    .map((t) => ({ t, d: depuisIso(t.debut), f: depuisIso(t.jalon ? t.debut : t.fin) }))
    .filter((x) => x.d && x.f && x.f >= x.d)
    .map(({ t, d, f }) => ({ nom: t.nom, debut: d!, fin: f!, jalon: t.jalon, couleur: t.couleur }));
  const invalides = taches.filter((t) => !t.jalon && depuisIso(t.debut) && depuisIso(t.fin) && depuisIso(t.fin)! < depuisIso(t.debut)!);

  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1fr)" }}>
      <section className="reglages pas-imprimer" aria-label="Tâches">
        <h2>Tâches</h2>
        <div className={styles.taches}>
          {taches.map((t, i) => (
            <div key={t.id} className={styles.tache}>
              <input className={styles.nom} value={t.nom} maxLength={60} onChange={(e) => modifier(t.id, { nom: e.target.value })} aria-label="Nom de la tâche" />
              <label>
                Début
                <input type="date" value={t.debut} onChange={(e) => modifier(t.id, { debut: e.target.value })} />
              </label>
              {!t.jalon && (
                <label>
                  Fin
                  <input type="date" value={t.fin} onChange={(e) => modifier(t.id, { fin: e.target.value })} />
                </label>
              )}
              <label className={styles.case}>
                <input type="checkbox" checked={t.jalon} onChange={(e) => modifier(t.id, { jalon: e.target.checked })} />
                Jalon
              </label>
              <input type="color" value={t.couleur} onChange={(e) => modifier(t.id, { couleur: e.target.value })} aria-label="Couleur" className={styles.couleur} />
              <span className={styles.ordre}>
                <button type="button" onClick={() => deplacer(i, -1)} disabled={i === 0} aria-label="Monter">
                  ↑
                </button>
                <button type="button" onClick={() => deplacer(i, 1)} disabled={i === taches.length - 1} aria-label="Descendre">
                  ↓
                </button>
                <button type="button" onClick={() => setTaches((l) => l.filter((x) => x.id !== t.id))} aria-label={`Supprimer ${t.nom}`}>
                  ×
                </button>
              </span>
            </div>
          ))}
        </div>
        {invalides.length > 0 && <p className="note">La fin de « {invalides[0].nom} » est avant son début : la tâche n'est pas affichée.</p>}
        <div className="commandes" style={{ justifyContent: "flex-start" }}>
          <button
            type="button"
            className="bouton"
            onClick={() => {
              const derniere = taches[taches.length - 1];
              const depart = derniere ? depuisIso(derniere.jalon ? derniere.debut : derniere.fin) : new Date();
              const debut = versIso(ajouterJours(depart ?? new Date(), 1));
              setTaches((l) => [...l, { id: nouvelId(), nom: "Nouvelle tâche", debut, fin: versIso(ajouterJours(depuisIso(debut)!, 6)), jalon: false, couleur: COULEURS[l.length % COULEURS.length] }]);
            }}
          >
            Ajouter une tâche
          </button>
        </div>
      </section>

      <div ref={zone} className={styles.cadre}>
        {pret && <FriseGantt barres={barres} aujourdhui={new Date()} />}
      </div>
      <div className="commandes pas-imprimer">
        <BoutonsExport cible={zone} nomFichier="gantt" />
        <button type="button" className="bouton" onClick={() => window.confirm("Remplacer par l'exemple ? Vos tâches seront perdues.") && setTaches(exemple())}>
          Revenir à l'exemple
        </button>
      </div>
      <p className="discret pas-imprimer">Tâches gardées dans ce navigateur. Survolez une barre pour voir ses dates.</p>
    </div>
  );
}
