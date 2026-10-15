"use client";

// Frise de Gantt (affichage seul) : une barre par tâche, sur une échelle de dates
// avec les mois, les débuts de semaine et la date du jour. Utilisée par le Gantt
// (E12) et le rétro-planning (E13).

import { ajouterJours, ecartJours, formaterDate } from "@/lib/dates";
import styles from "./frise-gantt.module.css";

export type BarreGantt = { nom: string; debut: Date; fin: Date; couleur?: string; jalon?: boolean; groupe?: string };

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

export default function FriseGantt({ barres, aujourdhui }: { barres: BarreGantt[]; aujourdhui?: Date }) {
  if (barres.length === 0) return <p className="discret">Ajoutez des tâches pour afficher la frise.</p>;

  const debut = barres.reduce((m, b) => (b.debut < m ? b.debut : m), barres[0].debut);
  const fin = barres.reduce((m, b) => (b.fin > m ? b.fin : m), barres[0].fin);
  const total = Math.max(ecartJours(debut, fin) + 1, 1);
  const position = (d: Date) => (ecartJours(debut, d) / total) * 100;

  // Repères : premier jour de chaque mois, et lundis si la période est courte.
  const mois: { gauche: number; texte: string }[] = [];
  const lundis: number[] = [];
  for (let i = 0; i < total; i++) {
    const d = ajouterJours(debut, i);
    if (d.getDate() === 1 || i === 0) mois.push({ gauche: position(d), texte: `${MOIS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}` });
    if (d.getDay() === 1 && total <= 120) lundis.push(position(d));
  }
  const ligneJour = aujourdhui && aujourdhui >= debut && aujourdhui <= fin ? position(aujourdhui) : null;

  return (
    <div className={styles.frise}>
      <div className={styles.entete}>
        <div className={styles.colNom} />
        <div className={styles.echelle}>
          {mois.map((m) => (
            <span key={m.gauche} className={styles.mois} style={{ left: `${m.gauche}%` }}>
              {m.texte}
            </span>
          ))}
        </div>
      </div>
      {barres.map((b, i) => {
        const g = position(b.debut);
        const l = Math.max(((ecartJours(b.debut, b.fin) + 1) / total) * 100, 0.6);
        const jours = ecartJours(b.debut, b.fin) + 1;
        return (
          <div key={i} className={styles.ligne}>
            <div className={styles.colNom} title={b.nom}>
              {b.groupe && <small>{b.groupe}</small>}
              {b.nom}
            </div>
            <div className={styles.piste}>
              {lundis.map((x) => (
                <span key={x} className={styles.lundi} style={{ left: `${x}%` }} />
              ))}
              {ligneJour !== null && <span className={styles.aujourdhui} style={{ left: `${ligneJour}%` }} />}
              {b.jalon ? (
                <span className={styles.jalon} style={{ left: `${g}%`, background: b.couleur }} title={`${b.nom} : ${formaterDate(b.debut)}`} />
              ) : (
                <span
                  className={styles.barre}
                  style={{ left: `${g}%`, width: `${l}%`, background: b.couleur ?? "var(--accent)" }}
                  title={`${b.nom} : du ${formaterDate(b.debut)} au ${formaterDate(b.fin)} (${jours} jour${jours > 1 ? "s" : ""})`}
                />
              )}
            </div>
          </div>
        );
      })}
      {ligneJour !== null && <p className={styles.legende}>Trait rouge : aujourd'hui.</p>}
    </div>
  );
}
