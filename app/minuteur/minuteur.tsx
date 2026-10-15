"use client";

// Composant interactif du minuteur (s'exécute dans le navigateur).
//
// Principe : quand le minuteur tourne, on retient l'HEURE DE FIN, et on
// recalcule le temps restant plusieurs fois par seconde. Ainsi le minuteur
// reste juste même si le navigateur ralentit un onglet en arrière-plan.

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./minuteur.module.css";

// Durées proposées en un clic, en minutes.
const DUREES_RAPIDES = [1, 3, 5, 10, 15, 20];

// Durée maximale saisissable : 10 heures.
const DUREE_MAX_MS = 10 * 60 * 60 * 1000;

type Etat = "pret" | "en-cours" | "pause" | "termine";

// Transforme des millisecondes en texte « 04:59 » ou « 1:04:59 ».
function formater(ms: number) {
  const totalSecondes = Math.ceil(Math.max(ms, 0) / 1000);
  const heures = Math.floor(totalSecondes / 3600);
  const minutes = Math.floor((totalSecondes % 3600) / 60);
  const secondes = totalSecondes % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(secondes).padStart(2, "0");
  return heures > 0 ? `${heures}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function Minuteur() {
  const [dureeMs, setDureeMs] = useState(5 * 60 * 1000); // durée choisie
  const [resteMs, setResteMs] = useState(5 * 60 * 1000); // temps restant affiché
  const [etat, setEtat] = useState<Etat>("pret");
  const [sonActif, setSonActif] = useState(true);
  const [pleinEcranPossible, setPleinEcranPossible] = useState(false);
  const [pleinEcran, setPleinEcran] = useState(false);
  const [saisieMinutes, setSaisieMinutes] = useState("5");
  const [saisieSecondes, setSaisieSecondes] = useState("0");

  const finRef = useRef(0); // heure de fin (en millisecondes) quand le minuteur tourne
  const zoneRef = useRef<HTMLDivElement>(null); // zone affichée en plein écran
  const audioRef = useRef<AudioContext | null>(null);

  // --- Son de fin : trois bips générés par le navigateur (aucun fichier) ---

  // Les navigateurs n'autorisent le son qu'après un clic : on prépare donc
  // le moteur audio au moment où l'on appuie sur « Démarrer ».
  function preparerSon() {
    if (!audioRef.current && typeof window !== "undefined" && "AudioContext" in window) {
      audioRef.current = new AudioContext();
    }
    audioRef.current?.resume();
  }

  const sonner = useCallback(() => {
    const ctx = audioRef.current;
    if (!sonActif || !ctx) return;
    for (let i = 0; i < 3; i++) {
      const debut = ctx.currentTime + i * 0.45;
      const oscillateur = ctx.createOscillator();
      const volume = ctx.createGain();
      oscillateur.frequency.value = 880;
      volume.gain.setValueAtTime(0.0001, debut);
      volume.gain.exponentialRampToValueAtTime(0.4, debut + 0.02);
      volume.gain.exponentialRampToValueAtTime(0.0001, debut + 0.35);
      oscillateur.connect(volume).connect(ctx.destination);
      oscillateur.start(debut);
      oscillateur.stop(debut + 0.4);
    }
  }, [sonActif]);

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
    const borne = Math.min(Math.max(ms, 1000), DUREE_MAX_MS);
    setDureeMs(borne);
    setResteMs(borne);
    setEtat("pret");
  }

  function ajouterUneMinute() {
    if (etat === "en-cours") {
      finRef.current += 60_000;
      setResteMs(finRef.current - Date.now());
    } else if (etat === "termine") {
      setResteMs(60_000);
      setEtat("pause");
    } else {
      setResteMs((r) => Math.min(r + 60_000, DUREE_MAX_MS));
      if (etat === "pret") setDureeMs((d) => Math.min(d + 60_000, DUREE_MAX_MS));
    }
  }

  function appliquerSaisie(evenement: React.FormEvent) {
    evenement.preventDefault();
    const minutes = Number(saisieMinutes) || 0;
    const secondes = Number(saisieSecondes) || 0;
    choisirDuree((minutes * 60 + secondes) * 1000);
  }

  function basculerPleinEcran() {
    if (document.fullscreenElement) document.exitFullscreen();
    else zoneRef.current?.requestFullscreen();
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
        sonner();
      } else {
        setResteMs(reste);
      }
    }, 250);
    return () => clearInterval(intervalle);
  }, [etat, sonner]);

  // Temps restant affiché dans le titre de l'onglet.
  useEffect(() => {
    const titreInitial = document.title;
    if (etat === "en-cours" || etat === "pause") document.title = `${formater(resteMs)} | Minuteur`;
    if (etat === "termine") document.title = "Temps écoulé ! | Minuteur";
    return () => {
      document.title = titreInitial;
    };
  }, [etat, resteMs]);

  // Empêcher la mise en veille de l'écran pendant le décompte (si le navigateur le permet).
  useEffect(() => {
    if (etat !== "en-cours" || !("wakeLock" in navigator)) return;
    let verrou: WakeLockSentinel | null = null;
    navigator.wakeLock
      .request("screen")
      .then((v) => (verrou = v))
      .catch(() => {}); // refus possible (batterie faible, onglet caché) : sans gravité
    return () => {
      verrou?.release();
    };
  }, [etat]);

  // Plein écran : savoir s'il est disponible (pas sur iPhone) et s'il est actif.
  useEffect(() => {
    setPleinEcranPossible(document.fullscreenEnabled);
    const auChangement = () => setPleinEcran(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", auChangement);
    return () => document.removeEventListener("fullscreenchange", auChangement);
  }, []);

  // Raccourcis clavier : Espace (démarrer / pause), R (remise à zéro), F (plein écran).
  useEffect(() => {
    function auClavier(e: KeyboardEvent) {
      const cible = e.target as HTMLElement;
      if (cible.closest("input, button, select, textarea")) return; // ne pas gêner la saisie
      if (e.code === "Space") {
        e.preventDefault();
        if (etat === "en-cours") mettreEnPause();
        else demarrer();
      } else if (e.key === "r" || e.key === "R") {
        remettreAZero();
      } else if ((e.key === "f" || e.key === "F") && pleinEcranPossible) {
        basculerPleinEcran();
      }
    }
    window.addEventListener("keydown", auClavier);
    return () => window.removeEventListener("keydown", auClavier);
  });

  // --- Affichage ---

  // Couleur d'alerte : les 10 dernières secondes, ou les derniers 10 % pour une longue durée.
  const seuilAlerte = Math.max(10_000, dureeMs * 0.1);
  const enAlerte = etat === "en-cours" && resteMs <= seuilAlerte;
  const progression = dureeMs > 0 ? Math.min(resteMs / dureeMs, 1) : 0;

  const classesAffichage = [
    styles.affichage,
    enAlerte ? styles.alerte : "",
    etat === "termine" ? styles.termine : "",
  ].join(" ");

  return (
    <div className={styles.minuteur}>
      <div ref={zoneRef} className={`${styles.zone} ${pleinEcran ? styles.zonePleinEcran : ""}`}>
        <div role="timer" aria-label="Temps restant" className={classesAffichage}>
          {etat === "termine" ? "00:00" : formater(resteMs)}
        </div>

        <div className={styles.barre} aria-hidden="true">
          <div className={styles.barreRemplie} style={{ width: `${progression * 100}%` }} />
        </div>

        {/* Annonce pour les lecteurs d'écran, uniquement à la fin */}
        <p className={styles.message} aria-live="polite">
          {etat === "termine" ? "Temps écoulé !" : etat === "pause" ? "En pause" : " "}
        </p>

        <div className={styles.commandes}>
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
          {pleinEcranPossible && (
            <button className="bouton" onClick={basculerPleinEcran}>
              {pleinEcran ? "Quitter le plein écran" : "Plein écran"}
            </button>
          )}
        </div>
      </div>

      <section className={styles.reglages} aria-label="Réglages">
        <h2 className={styles.titreReglages}>Durée</h2>
        <div className={styles.durees}>
          {DUREES_RAPIDES.map((minutes) => (
            <button
              key={minutes}
              className={`bouton ${etat === "pret" && dureeMs === minutes * 60_000 ? "bouton-actif" : ""}`}
              onClick={() => choisirDuree(minutes * 60_000)}
            >
              {minutes} min
            </button>
          ))}
        </div>

        <form className={styles.saisie} onSubmit={appliquerSaisie}>
          <label>
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
          <label>
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

        <label className={styles.option}>
          <input type="checkbox" checked={sonActif} onChange={(e) => setSonActif(e.target.checked)} />
          Signal sonore à la fin
        </label>

        <p className="discret">
          Raccourcis clavier : Espace pour démarrer ou mettre en pause, R pour remettre à zéro
          {pleinEcranPossible ? ", F pour le plein écran" : ""}.
        </p>
      </section>
    </div>
  );
}
