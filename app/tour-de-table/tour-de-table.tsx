"use client";

// Durée d'un tour de table : combien de temps va-t-il durer ? Ou, à l'inverse,
// combien de temps donner à chacun pour tenir dans le créneau disponible ?

import Link from "next/link";
import { useState } from "react";
import { formaterDuree, formaterHeure, MINUTE, SECONDE } from "@/lib/temps";
import styles from "./tour-de-table.module.css";

export default function TourDeTable() {
  const [mode, setMode] = useState<"duree" | "temps">("duree");
  const [personnes, setPersonnes] = useState("12");
  const [parPersonne, setParPersonne] = useState("1"); // minutes
  const [transition, setTransition] = useState("10"); // secondes
  const [intro, setIntro] = useState("2"); // minutes
  const [disponible, setDisponible] = useState("20"); // minutes
  const [debut, setDebut] = useState("");

  const n = Math.max(Math.round(Number(personnes)) || 0, 0);
  const t = Math.max(Number(transition.replace(",", ".")) || 0, 0) * SECONDE;
  const i = Math.max(Number(intro.replace(",", ".")) || 0, 0) * MINUTE;

  let total = 0;
  let parTete = 0;
  if (mode === "duree") {
    parTete = Math.max(Number(parPersonne.replace(",", ".")) || 0, 0) * MINUTE;
    total = i + n * parTete + Math.max(n - 1, 0) * t;
  } else {
    total = Math.max(Number(disponible.replace(",", ".")) || 0, 0) * MINUTE;
    parTete = n > 0 ? Math.max((total - i - Math.max(n - 1, 0) * t) / n, 0) : 0;
    // Arrondi à la seconde inférieure : le tour doit tenir dans le créneau.
    parTete = Math.floor(parTete / SECONDE) * SECONDE;
  }

  let fin = "";
  if (debut) {
    const [h, m] = debut.split(":").map(Number);
    const d = new Date(2000, 0, 1, h, m);
    fin = formaterHeure(new Date(d.getTime() + total));
  }

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Réglages">
        <div className="choix">
          <button type="button" className={`bouton ${mode === "duree" ? "bouton-actif" : ""}`} onClick={() => setMode("duree")}>
            Combien de temps va-t-il durer ?
          </button>
          <button type="button" className={`bouton ${mode === "temps" ? "bouton-actif" : ""}`} onClick={() => setMode("temps")}>
            Combien de temps par personne ?
          </button>
        </div>
        <label className="champ">
          Nombre de personnes
          <input type="number" min={0} max={500} value={personnes} onChange={(e) => setPersonnes(e.target.value)} />
        </label>
        {mode === "duree" ? (
          <label className="champ">
            Temps par personne (minutes)
            <input type="number" min={0} step={0.5} value={parPersonne} onChange={(e) => setParPersonne(e.target.value)} />
          </label>
        ) : (
          <label className="champ">
            Temps disponible pour le tour (minutes)
            <input type="number" min={0} value={disponible} onChange={(e) => setDisponible(e.target.value)} />
          </label>
        )}
        <label className="champ">
          Transition entre deux personnes (secondes)
          <input type="number" min={0} value={transition} onChange={(e) => setTransition(e.target.value)} />
        </label>
        <label className="champ">
          Consigne de l'animateur au début (minutes)
          <input type="number" min={0} step={0.5} value={intro} onChange={(e) => setIntro(e.target.value)} />
        </label>
        <label className="champ">
          Heure de début (facultatif)
          <input type="time" value={debut} onChange={(e) => setDebut(e.target.value)} />
        </label>
      </section>

      <div className="resultat" aria-live="polite">
        {mode === "duree" ? (
          <>
            <p className={styles.grand}>{formaterDuree(total)}</p>
            <p>pour le tour de table complet{fin && `, fin vers ${fin}`}.</p>
          </>
        ) : (
          <>
            <p className={styles.grand}>{parTete >= SECONDE ? formaterDuree(parTete) : "Impossible"}</p>
            <p>
              {parTete >= SECONDE
                ? `par personne, pour tenir en ${formaterDuree(total)}${fin ? ` (fin à ${fin})` : ""}.`
                : "Le temps disponible ne suffit pas, même sans temps de parole."}
            </p>
          </>
        )}
        <p className="discret">
          Détail : {formaterDuree(i) === "0 s" ? "pas de consigne" : `consigne ${formaterDuree(i)}`}, {n} × {formaterDuree(parTete)} de
          parole, {Math.max(n - 1, 0)} transition{n > 2 ? "s" : ""} de {formaterDuree(t)}.
        </p>
        <p className="discret">
          Astuce : le <Link href="/chrono-parole">chronomètre de parole</Link> aide chacun à tenir son temps.
        </p>
      </div>
    </div>
  );
}
