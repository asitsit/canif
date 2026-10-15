"use client";

// Composant interactif du minuteur (s'exécute dans le navigateur).
//
// Principe : quand le minuteur tourne, on retient l'HEURE DE FIN, et on
// recalcule le temps restant plusieurs fois par seconde. Ainsi le minuteur
// reste juste même si le navigateur ralentit un onglet en arrière-plan.

import { useEffect, useRef, useState } from "react";
import BoutonPleinEcran from "@/components/bouton-plein-ecran";
import { useEcranAllume, usePleinEcran, useRaccourcis, useTitreOnglet } from "@/lib/hooks";
import { biper, preparerSon } from "@/lib/son";
import { formater, HEURE, MINUTE, SECONDE } from "@/lib/temps";
import styles from "./minuteur.module.css";

// Durées proposées en un clic, en minutes.
const DUREES_RAPIDES = [1, 3, 5, 10, 15, 20];

// Durée maximale saisissable : 10 heures.
const DUREE_MAX_MS = 10 * HEURE;

type Etat = "pret" | "en-cours" | "pause" | "termine";

export default function Minuteur() {
  const [dureeMs, setDureeMs] = useState(5 * MINUTE); // durée choisie
  const [resteMs, setResteMs] = useState(5 * MINUTE); // temps restant affiché
  const [etat, setEtat] = useState<Etat>("pret");
  const [sonActif, setSonActif] = useState(true);
  const [saisieMinutes, setSaisieMinutes] = useState("5");
  const [saisieSecondes, setSaisieSecondes] = useState("0");

  const finRef = useRef(0); // heure de fin (en millisecondes) quand le minuteur tourne
  const sonActifRef = useRef(sonActif);
  sonActifRef.current = sonActif;

  const pleinEcran = usePleinEcran<HTMLDivElement>();

  // --- Commandes ---

  function demarrer() {
    preparerSon();
    if (resteMs <= 0) return;
    finRef.current = Date.now() + resteMs;
    setEtat("en-cours");
  }

  function mettreEnPause() {
    setResteMs(Math.max(finRef.current - Date.now(), 0));
    setEtat("pause");
  }

  function remettreAZero() {
    setResteMs(dureeMs);
    setEtat("pret");
  }

  function choisirDuree(ms: number) {
    const borne = Math.min(Math.max(ms, SECONDE), DUREE_MAX_MS);
    setDureeMs(borne);
    setResteMs(borne);
    setEtat("pret");
  }

  function ajouterUneMinute() {
    if (etat === "en-cours") {
      finRef.current += MINUTE;
      setResteMs(finRef.current - Date.now());
    } else if (etat === "termine") {
      setResteMs(MINUTE);
      setEtat("pause");
    } else {
      setResteMs((r) => Math.min(r + MINUTE, DUREE_MAX_MS));
      if (etat === "pret") setDureeMs((d) => Math.min(d + MINUTE, DUREE_MAX_MS));
    }
  }

  function appliquerSaisie(evenement: React.FormEvent) {
    evenement.preventDefault();
    const minutes = Number(saisieMinutes) || 0;
    const secondes = Number(saisieSecondes) || 0;
    choisirDuree((minutes * 60 + secondes) * SECONDE);
  }

  // --- Effets (ce qui se passe automatiquement) ---

  // Pendant que le minuteur tourne : recalcul du temps restant 4 fois par seconde.
  useEffect(() => {
    if (etat !== "en-cours") return;
    const intervalle = setInterval(() => {
      const reste = finRef.current - Date.now();
      if (reste <= 0) {
        setResteMs(0);
        setEtat("termine");
        if (sonActifRef.current) biper();
      } else {
        setResteMs(reste);
      }
    }, 250);
    return () => clearInterval(intervalle);
  }, [etat]);

  useTitreOnglet(
    etat === "termine"
      ? "Temps écoulé ! | Minuteur"
      : etat === "pret"
        ? ""
        : `${formater(resteMs)} | Minuteur`,
  );
  useEcranAllume(etat === "en-cours");
  useRaccourcis({
    " ": () => (etat === "en-cours" ? mettreEnPause() : demarrer()),
    r: remettreAZero,
    f: () => pleinEcran.possible && pleinEcran.basculer(),
  });

  // --- Affichage ---

  // Couleur d'alerte : les 10 dernières secondes, ou les derniers 10 % pour une longue durée.
  const seuilAlerte = Math.max(10 * SECONDE, dureeMs * 0.1);
  const enAlerte = etat === "en-cours" && resteMs <= seuilAlerte;
  const progression = dureeMs > 0 ? Math.min(resteMs / dureeMs, 1) : 0;

  const classesChiffres = [
    "chiffres",
    enAlerte ? styles.alerte : "",
    etat === "termine" ? "clignote " + styles.termine : "",
  ].join(" ");

  return (
    <div className="outil-temps">
      <div ref={pleinEcran.ref} className={`ecran ${pleinEcran.actif ? "ecran-plein" : ""}`}>
        <div role="timer" aria-label="Temps restant" className={classesChiffres}>
          {etat === "termine" ? "00:00" : formater(resteMs)}
        </div>

        <div className="barre" aria-hidden="true">
          <div className="barre-remplie" style={{ width: `${progression * 100}%` }} />
        </div>

        {/* Annonce pour les lecteurs d'écran, uniquement à la fin */}
        <p className="ecran-message" aria-live="polite">
          {etat === "termine" ? "Temps écoulé !" : etat === "pause" ? "En pause" : " "}
        </p>

        <div className="commandes">
          {etat === "en-cours" ? (
            <button className="bouton bouton-principal" onClick={mettreEnPause}>
              Pause
            </button>
          ) : (
            <button className="bouton bouton-principal" onClick={demarrer} disabled={etat === "termine"}>
              {etat === "pause" ? "Reprendre" : "Démarrer"}
            </button>
          )}
          <button className="bouton" onClick={ajouterUneMinute}>
            +1 min
          </button>
          <button className="bouton" onClick={remettreAZero}>
            Remettre à zéro
          </button>
          <BoutonPleinEcran pleinEcran={pleinEcran} />
        </div>
      </div>

      <section className="reglages" aria-label="Réglages">
        <h2>Durée</h2>
        <div className="choix">
          {DUREES_RAPIDES.map((minutes) => (
            <button
              key={minutes}
              className={`bouton ${etat === "pret" && dureeMs === minutes * MINUTE ? "bouton-actif" : ""}`}
              onClick={() => choisirDuree(minutes * MINUTE)}
            >
              {minutes} min
            </button>
          ))}
        </div>

        <form className="champs" onSubmit={appliquerSaisie}>
          <label className="champ">
            Minutes
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={600}
              value={saisieMinutes}
              onChange={(e) => setSaisieMinutes(e.target.value)}
            />
          </label>
          <label className="champ">
            Secondes
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={59}
              value={saisieSecondes}
              onChange={(e) => setSaisieSecondes(e.target.value)}
            />
          </label>
          <button type="submit" className="bouton">
            Appliquer
          </button>
        </form>

        <label className="option">
          <input type="checkbox" checked={sonActif} onChange={(e) => setSonActif(e.target.checked)} />
          Signal sonore à la fin
        </label>

        <p className="discret">
          Raccourcis clavier : Espace pour démarrer ou mettre en pause, R pour remettre à zéro
          {pleinEcran.possible ? ", F pour le plein écran" : ""}.
        </p>
      </section>
    </div>
  );
}
