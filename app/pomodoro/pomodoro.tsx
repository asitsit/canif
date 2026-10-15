"use client";

// Pomodoro : des périodes de travail séparées par des pauses courtes,
// avec une pause longue après un certain nombre de cycles.
// Par défaut : 25 min de travail, 5 min de pause, 15 min de pause longue tous les 4 cycles.

import { useEffect, useState } from "react";
import BoutonPleinEcran from "@/components/bouton-plein-ecran";
import { useChrono, useEcranAllume, usePleinEcran, useRaccourcis, useTitreOnglet } from "@/lib/hooks";
import { biper, preparerSon } from "@/lib/son";
import { formater, MINUTE } from "@/lib/temps";
import styles from "./pomodoro.module.css";

type Phase = "travail" | "pause-courte" | "pause-longue";

const NOMS: Record<Phase, string> = {
  travail: "Travail",
  "pause-courte": "Pause courte",
  "pause-longue": "Pause longue",
};

// Lit un nombre entier saisi, borné entre min et max (valeur par défaut si vide).
function lireEntier(texte: string, min: number, max: number, defaut: number) {
  const n = Math.round(Number(texte));
  if (!texte.trim() || Number.isNaN(n)) return defaut;
  return Math.min(Math.max(n, min), max);
}

export default function Pomodoro() {
  // Réglages (gardés en texte pour laisser la saisie libre, convertis plus bas).
  const [saisieTravail, setSaisieTravail] = useState("25");
  const [saisiePause, setSaisiePause] = useState("5");
  const [saisiePauseLongue, setSaisiePauseLongue] = useState("15");
  const [saisieCycles, setSaisieCycles] = useState("4");
  const [enchainer, setEnchainer] = useState(true);
  const [sonActif, setSonActif] = useState(true);

  const [phase, setPhase] = useState<Phase>("travail");
  const [cyclesFaits, setCyclesFaits] = useState(0); // périodes de travail terminées

  const chrono = useChrono();
  const pleinEcran = usePleinEcran<HTMLDivElement>();

  const minutesTravail = lireEntier(saisieTravail, 1, 180, 25);
  const minutesPause = lireEntier(saisiePause, 1, 60, 5);
  const minutesPauseLongue = lireEntier(saisiePauseLongue, 1, 120, 15);
  const cyclesAvantPauseLongue = lireEntier(saisieCycles, 1, 12, 4);

  const dureesMs: Record<Phase, number> = {
    travail: minutesTravail * MINUTE,
    "pause-courte": minutesPause * MINUTE,
    "pause-longue": minutesPauseLongue * MINUTE,
  };

  const dureeMs = dureesMs[phase];
  const resteMs = Math.max(dureeMs - chrono.ecouleMs, 0);
  const progression = dureeMs > 0 ? resteMs / dureeMs : 0;

  // Passe à l'étape suivante. `terminee` : la période est allée jusqu'au bout
  // (un travail interrompu par « Passer » n'est pas compté comme un cycle).
  function etapeSuivante(terminee: boolean, relancer: boolean) {
    let prochaine: Phase = "travail";
    if (phase === "travail") {
      const total = terminee ? cyclesFaits + 1 : cyclesFaits;
      if (terminee) setCyclesFaits(total);
      prochaine = terminee && total % cyclesAvantPauseLongue === 0 ? "pause-longue" : "pause-courte";
    }
    setPhase(prochaine);
    chrono.reinitialiser();
    if (relancer) chrono.demarrer();
  }

  // Fin d'une période : signal sonore puis étape suivante.
  useEffect(() => {
    if (chrono.enCours && chrono.ecouleMs >= dureeMs) {
      if (sonActif) biper(phase === "travail" ? 3 : 2, phase === "travail" ? 880 : 660);
      etapeSuivante(true, enchainer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chrono.ecouleMs]);

  // --- Commandes ---

  function demarrerOuPause() {
    if (chrono.enCours) {
      chrono.mettreEnPause();
    } else {
      preparerSon();
      chrono.demarrer();
    }
  }

  function toutReinitialiser() {
    chrono.reinitialiser();
    setPhase("travail");
    setCyclesFaits(0);
  }

  useTitreOnglet(chrono.ecouleMs > 0 || chrono.enCours ? `${formater(resteMs)} ${NOMS[phase]} | Pomodoro` : "");
  useEcranAllume(chrono.enCours);
  useRaccourcis({
    " ": demarrerOuPause,
    s: () => etapeSuivante(false, chrono.enCours),
    f: () => pleinEcran.possible && pleinEcran.basculer(),
  });

  // Position dans la série en cours (par exemple « cycle 2 sur 4 »).
  const cycleCourant = (cyclesFaits % cyclesAvantPauseLongue) + (phase === "travail" ? 1 : 0);
  const pointsRemplis = phase === "pause-longue" ? cyclesAvantPauseLongue : cyclesFaits % cyclesAvantPauseLongue;

  return (
    <div className="outil-temps">
      <div
        ref={pleinEcran.ref}
        className={`ecran ${phase === "travail" ? "" : styles.ecranPause} ${pleinEcran.actif ? "ecran-plein" : ""}`}
      >
        <p className={`${styles.phase} ${phase === "travail" ? styles.phaseTravail : styles.phasePause}`} aria-live="polite">
          {NOMS[phase]}
        </p>

        <div role="timer" aria-label="Temps restant" className="chiffres">
          {formater(resteMs)}
        </div>

        <div className="barre" aria-hidden="true">
          <div
            className={`barre-remplie ${phase === "travail" ? "" : styles.barrePause}`}
            style={{ width: `${progression * 100}%` }}
          />
        </div>

        <div className={styles.cycles}>
          <span className={styles.points} aria-hidden="true">
            {Array.from({ length: cyclesAvantPauseLongue }, (_, i) => (
              <span key={i} className={i < pointsRemplis ? styles.pointRempli : styles.point} />
            ))}
          </span>
          <span>
            {phase === "travail"
              ? `Cycle ${cycleCourant} sur ${cyclesAvantPauseLongue}`
              : `${cyclesFaits} cycle${cyclesFaits > 1 ? "s" : ""} de travail terminé${cyclesFaits > 1 ? "s" : ""}`}
          </span>
        </div>

        <div className="commandes">
          <button className="bouton bouton-principal" onClick={demarrerOuPause}>
            {chrono.enCours ? "Pause" : chrono.ecouleMs > 0 ? "Reprendre" : "Démarrer"}
          </button>
          <button className="bouton" onClick={() => etapeSuivante(false, chrono.enCours)}>
            Passer
          </button>
          <button className="bouton" onClick={toutReinitialiser}>
            Tout recommencer
          </button>
          <BoutonPleinEcran pleinEcran={pleinEcran} />
        </div>
      </div>

      <section className="reglages" aria-label="Réglages">
        <h2>Réglages</h2>
        <div className="champs">
          <label className="champ">
            Travail (min)
            <input type="number" inputMode="numeric" min={1} max={180} value={saisieTravail} onChange={(e) => setSaisieTravail(e.target.value)} />
          </label>
          <label className="champ">
            Pause courte (min)
            <input type="number" inputMode="numeric" min={1} max={60} value={saisiePause} onChange={(e) => setSaisiePause(e.target.value)} />
          </label>
          <label className="champ">
            Pause longue (min)
            <input type="number" inputMode="numeric" min={1} max={120} value={saisiePauseLongue} onChange={(e) => setSaisiePauseLongue(e.target.value)} />
          </label>
          <label className="champ">
            Pause longue tous les
            <input type="number" inputMode="numeric" min={1} max={12} value={saisieCycles} onChange={(e) => setSaisieCycles(e.target.value)} />
          </label>
        </div>

        <label className="option">
          <input type="checkbox" checked={enchainer} onChange={(e) => setEnchainer(e.target.checked)} />
          Enchaîner automatiquement les étapes
        </label>
        <label className="option">
          <input type="checkbox" checked={sonActif} onChange={(e) => setSonActif(e.target.checked)} />
          Signal sonore à chaque fin d'étape
        </label>

        <p className="discret">
          Raccourcis clavier : Espace pour démarrer ou mettre en pause, S pour passer à l'étape suivante
          {pleinEcran.possible ? ", F pour le plein écran" : ""}.
        </p>
      </section>
    </div>
  );
}
