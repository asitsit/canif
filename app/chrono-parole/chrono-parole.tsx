"use client";

// Chronomètre de parole avec programme d'intervenants.
//
// 1. L'animateur saisit le programme : un intervenant par ligne avec son temps
//    (« Jacques : 3 min »).
// 2. Pendant la séance, l'écran affiche l'intervenant en cours, son temps
//    restant, et passe du vert à l'orange puis au rouge. Après la fin, il
//    affiche le dépassement (« +00:15 »).
// 3. Un tableau montre pour chacun le temps prévu, le temps réel et l'écart
//    (avance ou retard), ainsi que l'avance ou le retard cumulé du programme.

import { useEffect, useRef, useState } from "react";
import { useChrono, useEcranAllume, usePleinEcran, useRaccourcis, useTitreOnglet } from "@/lib/hooks";
import { biper, preparerSon } from "@/lib/son";
import { formater, formaterDuree, SECONDE } from "@/lib/temps";
import { lireProgramme } from "./programme";
import styles from "./chrono-parole.module.css";

// Programme d'exemple proposé à la première visite.
const EXEMPLE = "Jacques : 3 min\nAlex : 7 min\nJean : 10 min";

// Le programme saisi est gardé dans ce navigateur uniquement (rien n'est envoyé).
const CLE_STOCKAGE = "canif.chrono-parole.programme";

// Moment du passage à l'orange, avant la fin (en secondes).
const ALERTES = [
  { libelle: "15 s avant", secondes: 15 },
  { libelle: "30 s avant", secondes: 30 },
  { libelle: "1 min avant", secondes: 60 },
  { libelle: "2 min avant", secondes: 120 },
];

// En dessous de cet écart, on considère que l'intervenant est « à l'heure ».
const TOLERANCE_MS = 5 * SECONDE;

type Couleur = "attente" | "vert" | "orange" | "rouge";

// Décrit un écart : négatif = avance, positif = retard.
function decrireEcart(ecartMs: number) {
  if (Math.abs(ecartMs) < TOLERANCE_MS) return { texte: "à l'heure", sens: "heure" as const };
  if (ecartMs < 0) return { texte: `${formaterDuree(ecartMs)} d'avance`, sens: "avance" as const };
  return { texte: `${formaterDuree(ecartMs)} de retard`, sens: "retard" as const };
}

export default function ChronoParole() {
  const [texte, setTexte] = useState(EXEMPLE);
  const [alerteSecondes, setAlerteSecondes] = useState(30);
  const [sonActif, setSonActif] = useState(true);

  const [indexCourant, setIndexCourant] = useState(0);
  const [reels, setReels] = useState<number[]>([]); // temps réels des intervenants passés
  const [demarree, setDemarree] = useState(false); // la séance a commencé
  const [terminee, setTerminee] = useState(false); // tout le monde est passé

  const chrono = useChrono();
  const pleinEcran = usePleinEcran<HTMLDivElement>();

  const { intervenants, lignesIllisibles } = lireProgramme(texte);
  const courant = intervenants[indexCourant];
  const prochain = intervenants[indexCourant + 1];

  // --- Mémoire du programme dans le navigateur (facultative) ---

  useEffect(() => {
    try {
      const sauvegarde = localStorage.getItem(CLE_STOCKAGE);
      if (sauvegarde) setTexte(sauvegarde);
    } catch {
      // stockage indisponible (navigation privée...) : on garde l'exemple
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

  // --- Calculs pour l'intervenant en cours ---

  const ecoule = chrono.ecouleMs;
  const prevu = courant?.prevuMs ?? 0;
  const alerteMs = Math.min(alerteSecondes * SECONDE, prevu);
  const depasse = ecoule >= prevu;

  let couleur: Couleur = "attente";
  if (!terminee && courant && (ecoule > 0 || chrono.enCours)) {
    if (depasse) couleur = "rouge";
    else if (ecoule >= prevu - alerteMs) couleur = "orange";
    else couleur = "vert";
  }

  const affichage = terminee
    ? "Fin"
    : depasse && ecoule > 0
      ? `+${formater(ecoule - prevu, "bas")}`
      : formater(prevu - ecoule);

  // Écart cumulé du programme : intervenants passés + dépassement en cours.
  const ecartPasses = reels.reduce((total, reel, i) => total + reel - intervenants[i].prevuMs, 0);
  const ecartCumule = ecartPasses + (!terminee && depasse ? ecoule - prevu : 0);
  const totalPrevu = intervenants.reduce((total, i) => total + i.prevuMs, 0);
  const totalReel = reels.reduce((total, r) => total + r, 0) + (terminee ? 0 : ecoule);

  // Un bip au moment exact où l'on passe au rouge.
  const couleurPrecedente = useRef<Couleur>("attente");
  useEffect(() => {
    if (couleur === "rouge" && couleurPrecedente.current === "orange" && sonActif) biper(1, 660);
    couleurPrecedente.current = couleur;
  }, [couleur, sonActif]);

  // --- Commandes ---

  function demarrerOuPause() {
    if (terminee || !courant) return;
    if (chrono.enCours) {
      chrono.mettreEnPause();
    } else {
      preparerSon();
      setDemarree(true);
      chrono.demarrer();
    }
  }

  // Termine l'intervenant en cours et passe au suivant (le chrono continue s'il tournait).
  function suivant() {
    if (terminee || !courant || !demarree) return;
    setReels((liste) => [...liste, ecoule]);
    const tournait = chrono.enCours;
    chrono.reinitialiser();
    if (prochain) {
      setIndexCourant((i) => i + 1);
      if (tournait) chrono.demarrer();
    } else {
      setTerminee(true);
    }
  }

  function recommencer() {
    chrono.reinitialiser();
    setIndexCourant(0);
    setReels([]);
    setDemarree(false);
    setTerminee(false);
  }

  useTitreOnglet(chrono.enCours && courant ? `${affichage} ${courant.nom} | Parole` : "");
  useEcranAllume(chrono.enCours);
  useRaccourcis({
    " ": demarrerOuPause,
    n: suivant,
    f: () => pleinEcran.possible && pleinEcran.basculer(),
  });

  const messages: Record<Couleur, string> = {
    attente: "Prêt",
    vert: "À vous la parole",
    orange: "Il est temps de conclure",
    rouge: "Temps dépassé",
  };

  const cumul = decrireEcart(ecartCumule);

  return (
    <div className="outil-temps">
      {intervenants.length > 0 && (
        <div
          ref={pleinEcran.ref}
          className={`ecran ${styles[couleur]} ${pleinEcran.actif ? "ecran-plein" : ""}`}
        >
          <p className={styles.nom}>
            {terminee ? "Programme terminé" : courant.nom}
          </p>
          {!terminee && (
            <p className={styles.prevu}>
              Temps prévu : {formaterDuree(prevu)}
              {intervenants.length > 1 && ` (${indexCourant + 1} sur ${intervenants.length})`}
            </p>
          )}

          <div role="timer" aria-label={depasse ? "Dépassement" : "Temps restant"} className="chiffres">
            {affichage}
          </div>

          <p className={`ecran-message ${styles.message}`} aria-live="polite">
            {terminee
              ? "Merci à tous"
              : chrono.enCours || ecoule === 0
                ? messages[couleur]
                : "En pause"}
          </p>

          <div className={styles.infos}>
            {!terminee && prochain && <span>Ensuite : {prochain.nom}</span>}
            {demarree && (
              <span className={styles[cumul.sens]}>
                Programme : {cumul.texte}
              </span>
            )}
          </div>

          <div className="commandes">
            {!terminee && (
              <button className="bouton bouton-principal" onClick={demarrerOuPause}>
                {chrono.enCours ? "Pause" : ecoule > 0 ? "Reprendre" : "Démarrer"}
              </button>
            )}
            {!terminee && (
              <button className="bouton" onClick={suivant} disabled={!demarree}>
                {prochain ? "Intervenant suivant" : "Terminer"}
              </button>
            )}
            {demarree && (
              <button className="bouton" onClick={recommencer}>
                Recommencer
              </button>
            )}
            {pleinEcran.possible && (
              <button className="bouton" onClick={pleinEcran.basculer}>
                {pleinEcran.actif ? "Quitter le plein écran" : "Plein écran"}
              </button>
            )}
          </div>
        </div>
      )}

      {intervenants.length > 0 && (
        <section className="reglages" aria-label="Suivi des intervenants">
          <h2>Suivi</h2>
          <div className={styles.tableauConteneur}>
            <table className={styles.tableau}>
              <thead>
                <tr>
                  <th scope="col">Intervenant</th>
                  <th scope="col">Prévu</th>
                  <th scope="col">Réel</th>
                  <th scope="col">Écart</th>
                </tr>
              </thead>
              <tbody>
                {intervenants.map((intervenant, i) => {
                  const passe = i < reels.length;
                  const enCours = !terminee && i === indexCourant && demarree;
                  const reel = passe ? reels[i] : enCours ? ecoule : null;
                  // Pour l'intervenant en cours, on n'affiche un écart qu'en cas de dépassement.
                  const ecart = passe
                    ? decrireEcart(reels[i] - intervenant.prevuMs)
                    : enCours && depasse
                      ? decrireEcart(ecoule - intervenant.prevuMs)
                      : null;
                  return (
                    <tr key={i} className={enCours ? styles.ligneCourante : passe ? "" : styles.ligneAVenir}>
                      <td>{intervenant.nom}</td>
                      <td>{formater(intervenant.prevuMs, "bas")}</td>
                      <td>{reel !== null ? formater(reel, "bas") : ""}</td>
                      <td className={ecart ? styles[ecart.sens] : ""}>
                        {ecart ? ecart.texte : enCours ? "en cours" : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Total</th>
                  <td>{formater(totalPrevu, "bas")}</td>
                  <td>{demarree ? formater(totalReel, "bas") : ""}</td>
                  <td className={demarree ? styles[cumul.sens] : ""}>{demarree ? cumul.texte : ""}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}

      <section className="reglages" aria-label="Programme">
        <h2>Programme</h2>
        <label className="champ">
          Un intervenant par ligne, avec son temps de parole
          <textarea
            className={styles.saisie}
            rows={Math.max(4, Math.min(intervenants.length + lignesIllisibles.length + 1, 14))}
            value={texte}
            onChange={(e) => modifierTexte(e.target.value)}
            disabled={demarree}
            placeholder={EXEMPLE}
            spellCheck={false}
          />
        </label>
        {demarree && <p className="discret">Pour modifier le programme, cliquez sur « Recommencer ».</p>}
        {!demarree && (
          <p className="discret">
            Formats acceptés : « Jacques : 3 min », « Alex ; 7 », « Marie : 2:30 », « Paul : 1h30 ».
          </p>
        )}
        {intervenants.length === 0 && !lignesIllisibles.length && (
          <p className={styles.erreur}>Ajoutez au moins un intervenant pour commencer.</p>
        )}
        {lignesIllisibles.length > 0 && (
          <div className={styles.erreur} role="alert">
            Lignes non comprises (ajoutez un temps, par exemple « : 3 min ») :
            <ul>
              {lignesIllisibles.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </div>
        )}

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

        <label className="option">
          <input type="checkbox" checked={sonActif} onChange={(e) => setSonActif(e.target.checked)} />
          Bip au passage au rouge
        </label>

        <p className="discret">
          Raccourcis clavier : Espace pour démarrer ou mettre en pause, N pour l'intervenant suivant
          {pleinEcran.possible ? ", F pour le plein écran" : ""}. Le programme reste enregistré dans ce
          navigateur uniquement.
        </p>
      </section>
    </div>
  );
}
