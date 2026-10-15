"use client";

// Minuteur d'étapes enchaînées : un compte à rebours par étape du déroulé,
// qui passe automatiquement à l'étape suivante (avec un signal sonore).
// L'heure de fin prévue est recalculée en direct (pauses, minutes ajoutées).

import { useEffect, useState } from "react";
import BoutonPleinEcran from "@/components/bouton-plein-ecran";
import { useChrono, useEcranAllume, usePleinEcran, useRaccourcis, useTitreOnglet } from "@/lib/hooks";
import { lireProgramme, type Intervenant as Etape } from "@/lib/programme";
import { biper, preparerSon } from "@/lib/son";
import { formater, formaterDuree, formaterHeure, MINUTE } from "@/lib/temps";
import styles from "./minuteur-etapes.module.css";

const EXEMPLE =
  "Accueil et inclusion : 10 min\nPrésentation du sujet : 15 min\nTravail en sous-groupes : 25 min\nPause : 10 min\nRestitution : 20 min\nConclusion : 5 min";

// Le déroulé saisi est gardé dans ce navigateur uniquement.
const CLE_STOCKAGE = "canif.minuteur-etapes.programme";

export default function MinuteurEtapes() {
  const [texte, setTexte] = useState(EXEMPLE);
  const [enchainer, setEnchainer] = useState(true);
  const [sonActif, setSonActif] = useState(true);
  const [seance, setSeance] = useState<Etape[] | null>(null); // copie du déroulé au démarrage
  const [index, setIndex] = useState(0);
  const [termine, setTermine] = useState(false);

  const chrono = useChrono();
  const pleinEcran = usePleinEcran<HTMLDivElement>();

  const { intervenants: etapesSaisies, lignesIllisibles } = lireProgramme(texte);
  const etapes = seance ?? etapesSaisies;
  const demarre = seance !== null;
  const etape = etapes[index];
  const suivante = etapes[index + 1];
  const resteMs = etape ? etape.prevuMs - chrono.ecouleMs : 0;
  const etapeFinie = !!etape && resteMs <= 0;

  // --- Mémoire du déroulé dans le navigateur ---

  useEffect(() => {
    try {
      const sauvegarde = localStorage.getItem(CLE_STOCKAGE);
      if (sauvegarde) setTexte(sauvegarde);
    } catch {
      // stockage indisponible : on garde l'exemple
    }
  }, []);

  function modifierTexte(valeur: string) {
    setTexte(valeur);
    try {
      localStorage.setItem(CLE_STOCKAGE, valeur);
    } catch {
      // sans gravité
    }
  }

  // --- Commandes ---

  function demarrerOuPause() {
    if (termine || !etape) return;
    if (chrono.enCours) {
      chrono.mettreEnPause();
      return;
    }
    if (etapeFinie) {
      etapeSuivante();
      return;
    }
    preparerSon();
    if (!demarre) setSeance(etapesSaisies);
    chrono.demarrer();
  }

  // Passe à l'étape suivante (le minuteur continue s'il tournait ou si l'étape venait de finir).
  function etapeSuivante(relancer = chrono.enCours || etapeFinie) {
    if (!demarre || termine) return;
    chrono.reinitialiser();
    if (suivante) {
      setIndex((i) => i + 1);
      if (relancer) chrono.demarrer();
    } else {
      setTermine(true);
    }
  }

  // Ajoute une minute à l'étape en cours.
  function ajouterUneMinute() {
    if (!demarre || termine) return;
    setSeance((liste) => liste && liste.map((e, i) => (i === index ? { ...e, prevuMs: e.prevuMs + MINUTE } : e)));
    if (etapeFinie && !chrono.enCours) chrono.demarrer();
  }

  function recommencer() {
    chrono.reinitialiser();
    setSeance(null);
    setIndex(0);
    setTermine(false);
  }

  // Fin d'une étape : signal, puis étape suivante si l'enchaînement est activé.
  useEffect(() => {
    if (!chrono.enCours || resteMs > 0) return;
    if (sonActif) biper(suivante ? 2 : 3, suivante ? 880 : 660);
    if (enchainer || !suivante) etapeSuivante(true);
    else chrono.mettreEnPause(); // on attend un clic sur « Étape suivante »
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chrono.enCours, resteMs <= 0]);

  // --- Heures prévues (recalculées à chaque affichage) ---

  const maintenant = Date.now();
  const restantApres = etapes.slice(index + 1).reduce((t, e) => t + e.prevuMs, 0);
  const finPrevue = maintenant + Math.max(resteMs, 0) + restantApres;
  const totalMs = etapes.reduce((t, e) => t + e.prevuMs, 0);

  // Heure de début estimée de chaque étape à venir.
  function debutEstime(i: number) {
    let t = maintenant + Math.max(resteMs, 0);
    for (let j = index + 1; j < i; j++) t += etapes[j].prevuMs;
    return t;
  }

  useTitreOnglet(
    termine ? "Terminé | Étapes" : chrono.enCours && etape ? `${formater(resteMs)} ${etape.nom} | Étapes` : "",
  );
  useEcranAllume(chrono.enCours);
  useRaccourcis({
    " ": demarrerOuPause,
    n: () => etapeSuivante(),
    f: () => pleinEcran.possible && pleinEcran.basculer(),
  });

  const progression = etape && !termine ? Math.min(Math.max(resteMs, 0) / etape.prevuMs, 1) : 0;

  return (
    <div className="outil-temps">
      {etapes.length > 0 && (
        <div ref={pleinEcran.ref} className={`ecran ${pleinEcran.actif ? "ecran-plein" : ""}`}>
          <p className={styles.etape}>{termine ? "Déroulé terminé" : etape.nom}</p>
          {!termine && (
            <p className="discret">
              Étape {index + 1} sur {etapes.length} · {formaterDuree(etape.prevuMs)}
            </p>
          )}

          <div
            role="timer"
            aria-label="Temps restant de l'étape"
            className={`chiffres ${etapeFinie && !termine ? "clignote " + styles.finie : ""}`}
          >
            {termine ? "Fin" : formater(Math.max(resteMs, 0))}
          </div>

          <div className="barre" aria-hidden="true">
            <div className="barre-remplie" style={{ width: `${progression * 100}%` }} />
          </div>

          <p className="ecran-message" aria-live="polite">
            {termine
              ? "Merci à tous !"
              : etapeFinie
                ? "Étape terminée"
                : demarre && !chrono.enCours
                  ? "En pause"
                  : suivante
                    ? `Ensuite : ${suivante.nom}`
                    : "Dernière étape"}
          </p>

          <p className={styles.fin}>
            {demarre && !termine
              ? `Fin prévue à ${formaterHeure(new Date(finPrevue))}`
              : !demarre
                ? `Durée totale : ${formaterDuree(totalMs)}`
                : " "}
          </p>

          <div className="commandes">
            {!termine && (
              <button className="bouton bouton-principal" onClick={demarrerOuPause}>
                {chrono.enCours ? "Pause" : etapeFinie ? "Étape suivante" : demarre ? "Reprendre" : "Démarrer"}
              </button>
            )}
            {demarre && !termine && !etapeFinie && (
              <button className="bouton" onClick={() => etapeSuivante()}>
                {suivante ? "Passer à l'étape suivante" : "Terminer"}
              </button>
            )}
            {demarre && !termine && (
              <button className="bouton" onClick={ajouterUneMinute}>
                +1 min
              </button>
            )}
            {demarre && (
              <button className="bouton" onClick={recommencer}>
                Recommencer
              </button>
            )}
            <BoutonPleinEcran pleinEcran={pleinEcran} />
          </div>
        </div>
      )}

      {etapes.length > 0 && (
        <section className="reglages" aria-label="Déroulé">
          <h2>Déroulé</h2>
          <ol className={styles.deroule}>
            {etapes.map((e, i) => {
              const statut = termine || i < index ? "passee" : i === index && demarre ? "courante" : "avenir";
              return (
                <li key={i} className={styles[statut]}>
                  <span className={styles.numero}>{statut === "passee" ? "✓" : i + 1}</span>
                  <span className={styles.nomEtape}>{e.nom}</span>
                  <span className={styles.duree}>{formaterDuree(e.prevuMs)}</span>
                  <span className={styles.heure}>
                    {statut === "courante"
                      ? "en cours"
                      : statut === "avenir" && demarre
                        ? `vers ${formaterHeure(new Date(debutEstime(i)))}`
                        : ""}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <section className="reglages" aria-label="Réglages">
        <h2>Étapes</h2>
        <label className="champ">
          Une étape par ligne, avec sa durée
          <textarea
            rows={Math.max(4, Math.min(etapesSaisies.length + lignesIllisibles.length + 1, 14))}
            value={texte}
            onChange={(e) => modifierTexte(e.target.value)}
            disabled={demarre}
            spellCheck={false}
          />
        </label>
        <p className="discret">
          {demarre
            ? "Pour modifier le déroulé, cliquez sur « Recommencer »."
            : "Formats acceptés : « Accueil : 10 min », « Pause ; 5 », « Atelier : 1h30 », « Jeu : 2:30 »."}
        </p>
        {lignesIllisibles.length > 0 && (
          <div className={styles.erreur} role="alert">
            Lignes non comprises (ajoutez une durée, par exemple « : 10 min ») :
            <ul>
              {lignesIllisibles.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </div>
        )}

        <label className="option">
          <input type="checkbox" checked={enchainer} onChange={(e) => setEnchainer(e.target.checked)} />
          Enchaîner automatiquement les étapes
        </label>
        <label className="option">
          <input type="checkbox" checked={sonActif} onChange={(e) => setSonActif(e.target.checked)} />
          Signal sonore à chaque fin d'étape
        </label>
        <p className="discret">
          Raccourcis clavier : Espace pour démarrer ou mettre en pause, N pour l'étape suivante
          {pleinEcran.possible ? ", F pour le plein écran" : ""}. Le déroulé reste enregistré dans ce navigateur
          uniquement.
        </p>
      </section>
    </div>
  );
}
