"use client";

// Écran de pause : on choisit une durée (ou une heure de reprise) et un message,
// puis on projette. L'écran affiche le message, l'heure de reprise et le temps restant.

import { useEffect, useRef, useState } from "react";
import BoutonPleinEcran from "@/components/bouton-plein-ecran";
import { useEcranAllume, useMaintenant, usePleinEcran, useRaccourcis, useTitreOnglet } from "@/lib/hooks";
import { biper, preparerSon } from "@/lib/son";
import { formater, formaterHeure, MINUTE } from "@/lib/temps";
import styles from "./ecran-pause.module.css";

// Durées de pause proposées, en minutes.
const DUREES_RAPIDES = [5, 10, 15, 20, 30, 45, 60];

export default function EcranPause() {
  const [finMs, setFinMs] = useState<number | null>(null); // heure de reprise (null = pas de pause en cours)
  const [message, setMessage] = useState("Pause");
  const [saisieHeure, setSaisieHeure] = useState("");
  const [erreur, setErreur] = useState("");
  const [sonActif, setSonActif] = useState(true);

  const maintenant = useMaintenant();
  const pleinEcran = usePleinEcran<HTMLDivElement>();

  const enPause = finMs !== null;
  // Date.now() plutôt que `maintenant` : juste après un clic, `maintenant` peut
  // avoir un quart de seconde de retard (on afficherait 05:01 au lieu de 05:00).
  const resteMs = enPause ? finMs - Date.now() : 0;
  const terminee = enPause && resteMs <= 0;

  // Un signal sonore au moment de la reprise (une seule fois).
  const aSonne = useRef(false);
  useEffect(() => {
    if (terminee && !aSonne.current) {
      aSonne.current = true;
      if (sonActif) biper();
    }
    if (!terminee) aSonne.current = false;
  }, [terminee, sonActif]);

  // --- Commandes ---

  function lancerPour(minutes: number) {
    preparerSon();
    setErreur("");
    setFinMs(Date.now() + minutes * MINUTE);
  }

  // Lance la pause jusqu'à l'heure saisie (format « 10:45 »).
  function lancerJusqua(evenement: React.FormEvent) {
    evenement.preventDefault();
    const [heures, minutes] = saisieHeure.split(":").map(Number);
    if (Number.isNaN(heures) || Number.isNaN(minutes)) {
      setErreur("Indiquez une heure de reprise.");
      return;
    }
    const reprise = new Date();
    reprise.setHours(heures, minutes, 0, 0);
    if (reprise.getTime() <= Date.now()) {
      setErreur("Cette heure est déjà passée.");
      return;
    }
    preparerSon();
    setErreur("");
    setFinMs(reprise.getTime());
  }

  function prolonger(minutes: number) {
    // Après la fin, la prolongation repart de maintenant.
    setFinMs((fin) => Math.max(fin ?? Date.now(), Date.now()) + minutes * MINUTE);
  }

  function arreter() {
    setFinMs(null);
  }

  useTitreOnglet(enPause ? (terminee ? "Reprise ! | Pause" : `${formater(resteMs)} | Pause`) : "");
  useEcranAllume(enPause && !terminee);
  useRaccourcis({ f: () => pleinEcran.possible && pleinEcran.basculer() });

  return (
    <div className="outil-temps">
      <div ref={pleinEcran.ref} className={`ecran ${styles.ecran} ${pleinEcran.actif ? "ecran-plein" : ""}`}>
        <p className={styles.horloge}>{maintenant > 0 ? `Il est ${formaterHeure(new Date(maintenant))}` : " "}</p>

        <p className={styles.titre}>{message || "Pause"}</p>

        {!enPause && <p className={styles.consigne}>Choisissez une durée ci-dessous pour lancer la pause.</p>}

        {enPause && !terminee && (
          <>
            <p className={styles.reprise}>Reprise à {formaterHeure(new Date(finMs))}</p>
            <div role="timer" aria-label="Temps restant avant la reprise" className={`chiffres ${styles.decompte}`}>
              {formater(resteMs)}
            </div>
          </>
        )}

        {terminee && (
          <p className={`${styles.reprise} ${styles.fin} clignote`} aria-live="polite">
            C'est l'heure de reprendre !
          </p>
        )}

        {enPause && (
          <div className="commandes">
            <button className="bouton" onClick={() => prolonger(5)}>
              +5 min
            </button>
            <button className="bouton" onClick={arreter}>
              Terminer la pause
            </button>
            <BoutonPleinEcran pleinEcran={pleinEcran} />
          </div>
        )}
      </div>

      <section className="reglages" aria-label="Réglages">
        <label className="champ">
          Message affiché
          <input
            type="text"
            maxLength={80}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Pause café, déjeuner..."
          />
        </label>

        <h2>Durée de la pause</h2>
        <div className="choix">
          {DUREES_RAPIDES.map((minutes) => (
            <button key={minutes} className="bouton" onClick={() => lancerPour(minutes)}>
              {minutes} min
            </button>
          ))}
        </div>

        <form className="champs" onSubmit={lancerJusqua}>
          <label className="champ">
            Ou reprise à
            <input type="time" value={saisieHeure} onChange={(e) => setSaisieHeure(e.target.value)} />
          </label>
          <button type="submit" className="bouton">
            Lancer
          </button>
        </form>
        {erreur && (
          <p className={styles.erreur} role="alert">
            {erreur}
          </p>
        )}

        <label className="option">
          <input type="checkbox" checked={sonActif} onChange={(e) => setSonActif(e.target.checked)} />
          Signal sonore à l'heure de reprise
        </label>

        <p className="discret">
          Astuce : lancez la pause puis passez en plein écran{pleinEcran.possible ? " (touche F)" : ""} sur
          l'écran projeté.
        </p>
      </section>
    </div>
  );
}
