"use client";

// Arbre des « 5 pourquoi » : on part d'un problème et on demande « pourquoi ? »
// jusqu'à remonter à une cause sur laquelle on peut agir (souvent vers le 5e).

import { useRef } from "react";
import BoutonsExport from "@/components/boutons-export";
import { useStockageLocal } from "@/lib/stockage";
import styles from "./cinq-pourquoi.module.css";

type Donnees = { probleme: string; reponses: string[]; action: string };

const VIDE: Donnees = { probleme: "", reponses: ["", "", "", "", ""], action: "" };
const EXEMPLE: Donnees = {
  probleme: "Les ateliers commencent souvent avec 15 minutes de retard",
  reponses: [
    "Les participants arrivent en retard",
    "La réunion précédente déborde",
    "Les réunions sont enchaînées sans pause",
    "Les agendas sont remplis par créneaux d'une heure pile",
    "",
  ],
  action: "Fixer la durée par défaut des réunions à 50 minutes",
};

export default function CinqPourquoi() {
  const [d, setD] = useStockageLocal<Donnees>("cinq-pourquoi", EXEMPLE);
  const zone = useRef<HTMLDivElement>(null);

  // La cause racine : la dernière réponse remplie.
  const derniere = [...d.reponses].reverse().find((r) => r.trim()) ?? "";

  function modifierReponse(i: number, valeur: string) {
    setD({ ...d, reponses: d.reponses.map((r, j) => (j === i ? valeur : r)) });
  }

  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1fr)" }}>
      <div ref={zone} className={styles.arbre}>
        <label className={`champ ${styles.probleme}`}>
          Le problème
          <input type="text" value={d.probleme} maxLength={200} onChange={(e) => setD({ ...d, probleme: e.target.value })} placeholder="Décrivez un fait observable" />
        </label>

        <ol className={styles.chaine}>
          {d.reponses.map((r, i) => {
            const precedent = i === 0 ? d.probleme : d.reponses[i - 1];
            return (
              <li key={i}>
                <span className={styles.question}>
                  Pourquoi {precedent.trim() ? `« ${precedent.trim().replace(/[.?!]$/, "").charAt(0).toLowerCase() + precedent.trim().replace(/[.?!]$/, "").slice(1)} » ?` : "?"}
                </span>
                <input
                  type="text"
                  value={r}
                  maxLength={200}
                  onChange={(e) => modifierReponse(i, e.target.value)}
                  aria-label={`Réponse au pourquoi numéro ${i + 1}`}
                  placeholder="Parce que..."
                />
              </li>
            );
          })}
        </ol>

        {derniere && (
          <p className={styles.racine}>
            <strong>Cause racine probable :</strong> {derniere}
          </p>
        )}

        <label className="champ">
          Action pour agir sur cette cause
          <input type="text" value={d.action} maxLength={200} onChange={(e) => setD({ ...d, action: e.target.value })} />
        </label>
      </div>

      <div className="commandes pas-imprimer">
        <button type="button" className="bouton" onClick={() => setD({ ...d, reponses: [...d.reponses, ""] })} disabled={d.reponses.length >= 8}>
          Un pourquoi de plus
        </button>
        <BoutonsExport cible={zone} nomFichier="cinq-pourquoi" />
        <button type="button" className="bouton" onClick={() => window.confirm("Tout effacer ?") && setD(VIDE)}>
          Tout effacer
        </button>
      </div>
      <p className="discret pas-imprimer">
        Conseil : répondez par des faits, pas par des personnes (« la procédure n'existe pas » plutôt que « Paul a
        oublié »). Arrêtez-vous quand la réponse devient une cause sur laquelle vous pouvez agir. Contenu gardé dans ce
        navigateur.
      </p>
    </div>
  );
}
