"use client";

// Chronomètre de parole : l'écran est vert, puis orange peu avant la fin du
// temps accordé, puis rouge quand le temps est dépassé. Le chronomètre continue
// après la fin et affiche le dépassement (« +00:15 »).

import { useEffect, useRef, useState } from "react";
import { useChrono, useEcranAllume, usePleinEcran, useRaccourcis, useTitreOnglet } from "@/lib/hooks";
import { biper, preparerSon } from "@/lib/son";
import { formater, MINUTE, SECONDE } from "@/lib/temps";
import styles from "./chrono-parole.module.css";

// Temps de parole proposés, en minutes.
const TEMPS_RAPIDES = [1, 2, 3, 5, 10];

// Moment du passage à l'orange, avant la fin (en secondes).
const ALERTES = [
  { libelle: "15 s avant", secondes: 15 },
  { libelle: "30 s avant", secondes: 30 },
  { libelle: "1 min avant", secondes: 60 },
  { libelle: "2 min avant", secondes: 120 },
];

type Couleur = "attente" | "vert" | "orange" | "rouge";

type Passage = { numero: number; dureeMs: number; tempsAccordeMs: number };

export default function ChronoParole() {
  const [tempsMs, setTempsMs] = useState(3 * MINUTE); // temps de parole accordé
  const [alerteSecondes, setAlerteSecondes] = useState(30);
  const [sonActif, setSonActif] = useState(true);
  const [saisieMinutes, setSaisieMinutes] = useState("3");
  const [passages, setPassages] = useState<Passage[]>([]);

  const chrono = useChrono();
  const pleinEcran = usePleinEcran<HTMLDivElement>();

  // L'alerte orange ne peut pas commencer avant le début : on la borne au temps accordé.
  const alerteMs = Math.min(alerteSecondes * SECONDE, tempsMs);
  const ecoule = chrono.ecouleMs;

  let couleur: Couleur = "attente";
  if (ecoule > 0 || chrono.enCours) {
    if (ecoule >= tempsMs) couleur = "rouge";
    else if (ecoule >= tempsMs - alerteMs) couleur = "orange";
    else couleur = "vert";
  }

  const depasse = ecoule >= tempsMs;
  const affichage = depasse ? `+${formater(ecoule - tempsMs, "bas")}` : formater(tempsMs - ecoule);

  // Un bip au moment exact où l'on passe au rouge.
  const couleurPrecedente = useRef<Couleur>("attente");
  useEffect(() => {
    if (couleur === "rouge" && couleurPrecedente.current === "orange" && sonActif) biper(1, 660);
    couleurPrecedente.current = couleur;
  }, [couleur, sonActif]);

  // --- Commandes ---

  function demarrerOuPause() {
    if (chrono.enCours) {
      chrono.mettreEnPause();
    } else {
      preparerSon();
      chrono.demarrer();
    }
  }

  // Range le passage en cours dans l'historique et prépare le suivant.
  function intervenantSuivant() {
    if (ecoule > 0) {
      setPassages((liste) => [...liste, { numero: liste.length + 1, dureeMs: ecoule, tempsAccordeMs: tempsMs }]);
    }
    chrono.reinitialiser();
  }

  function choisirTemps(ms: number) {
    setTempsMs(Math.max(ms, 10 * SECONDE));
  }

  function appliquerSaisie(evenement: React.FormEvent) {
    evenement.preventDefault();
    const minutes = Number(saisieMinutes.replace(",", ".")) || 0;
    choisirTemps(Math.round(minutes * 60) * SECONDE);
  }

  useTitreOnglet(chrono.enCours ? `${affichage} | Parole` : "");
  useEcranAllume(chrono.enCours);
  useRaccourcis({
    " ": demarrerOuPause,
    n: intervenantSuivant,
    f: () => pleinEcran.possible && pleinEcran.basculer(),
  });

  const messages: Record<Couleur, string> = {
    attente: "Prêt",
    vert: "À vous la parole",
    orange: "Il est temps de conclure",
    rouge: "Temps dépassé",
  };

  return (
    <div className="outil-temps">
      <div
        ref={pleinEcran.ref}
        className={`ecran ${styles[couleur]} ${pleinEcran.actif ? "ecran-plein" : ""}`}
      >
        <div role="timer" aria-label={depasse ? "Dépassement" : "Temps restant"} className="chiffres">
          {affichage}
        </div>

        <p className={`ecran-message ${styles.message}`} aria-live="polite">
          {chrono.enCours || ecoule === 0 ? messages[couleur] : "En pause"}
        </p>

        <div className="commandes">
          <button className="bouton bouton-principal" onClick={demarrerOuPause}>
            {chrono.enCours ? "Pause" : ecoule > 0 ? "Reprendre" : "Démarrer"}
          </button>
          <button className="bouton" onClick={intervenantSuivant} disabled={ecoule === 0}>
            Intervenant suivant
          </button>
          {pleinEcran.possible && (
            <button className="bouton" onClick={pleinEcran.basculer}>
              {pleinEcran.actif ? "Quitter le plein écran" : "Plein écran"}
            </button>
          )}
        </div>
      </div>

      <section className="reglages" aria-label="Réglages">
        <h2>Temps de parole</h2>
        <div className="choix">
          {TEMPS_RAPIDES.map((minutes) => (
            <button
              key={minutes}
              className={`bouton ${tempsMs === minutes * MINUTE ? "bouton-actif" : ""}`}
              onClick={() => choisirTemps(minutes * MINUTE)}
            >
              {minutes} min
            </button>
          ))}
        </div>

        <form className="champs" onSubmit={appliquerSaisie}>
          <label className="champ">
            Minutes
            <input
              type="text"
              inputMode="decimal"
              size={5}
              value={saisieMinutes}
              onChange={(e) => setSaisieMinutes(e.target.value)}
            />
          </label>
          <button type="submit" className="bouton">
            Appliquer
          </button>
          <label className="champ">
            Passage à l'orange
            <select value={alerteSecondes} onChange={(e) => setAlerteSecondes(Number(e.target.value))}>
              {ALERTES.map((a) => (
                <option key={a.secondes} value={a.secondes}>
                  {a.libelle}
                </option>
              ))}
            </select>
          </label>
        </form>

        <label className="option">
          <input type="checkbox" checked={sonActif} onChange={(e) => setSonActif(e.target.checked)} />
          Bip au passage au rouge
        </label>

        <p className="discret">
          Raccourcis clavier : Espace pour démarrer ou mettre en pause, N pour l'intervenant suivant
          {pleinEcran.possible ? ", F pour le plein écran" : ""}.
        </p>
      </section>

      {passages.length > 0 && (
        <section className="reglages" aria-label="Passages">
          <h2>Passages</h2>
          <ol className={styles.passages}>
            {passages.map((p) => {
              const ecart = p.dureeMs - p.tempsAccordeMs;
              return (
                <li key={p.numero}>
                  <span>Intervenant {p.numero}</span>
                  <strong>{formater(p.dureeMs, "bas")}</strong>
                  <span className={ecart > 0 ? styles.ecartDepasse : styles.ecartOk}>
                    {ecart > 0 ? `+${formater(ecart, "bas")}` : "dans le temps"}
                  </span>
                </li>
              );
            })}
          </ol>
          <div>
            <button className="bouton" onClick={() => setPassages([])}>
              Effacer l'historique
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
