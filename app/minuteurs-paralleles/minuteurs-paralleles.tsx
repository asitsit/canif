"use client";

// Minuteurs parallèles : plusieurs comptes à rebours indépendants (un par
// sous-groupe), affichés côte à côte pour être projetés.
//
// Chaque minuteur retient son heure de fin quand il tourne, ou son temps
// restant quand il est arrêté : il reste juste même en arrière-plan.

import { useEffect, useRef, useState } from "react";
import BoutonPleinEcran from "@/components/bouton-plein-ecran";
import {
  useAjusterAuPleinEcran,
  useEcranAllume,
  useMaintenant,
  usePleinEcran,
  useRaccourcis,
} from "@/lib/hooks";
import { biper, preparerSon } from "@/lib/son";
import { formater, MINUTE } from "@/lib/temps";
import styles from "./minuteurs-paralleles.module.css";

type Minuteur = {
  id: number;
  nom: string;
  dureeMs: number; // durée choisie
  resteMs: number; // temps restant quand il est arrêté
  finMs: number | null; // heure de fin quand il tourne, sinon null
  aSonne: boolean; // le signal de fin a déjà retenti
};

const MAX_MINUTEURS = 12;

let prochainId = 1;
function nouveauMinuteur(nom: string, minutes: number): Minuteur {
  return { id: prochainId++, nom, dureeMs: minutes * MINUTE, resteMs: minutes * MINUTE, finMs: null, aSonne: false };
}

export default function MinuteursParalleles() {
  const [minuteurs, setMinuteurs] = useState<Minuteur[]>(() =>
    [1, 2, 3, 4].map((n) => nouveauMinuteur(`Groupe ${n}`, 10)),
  );
  const [sonActif, setSonActif] = useState(true);
  const maintenant = useMaintenant();
  const pleinEcran = usePleinEcran<HTMLDivElement>();
  const grilleRef = useRef<HTMLDivElement>(null);

  // Temps restant d'un minuteur à l'instant présent.
  const reste = (m: Minuteur) => (m.finMs !== null ? Math.max(m.finMs - Date.now(), 0) : m.resteMs);

  function modifier(id: number, changement: (m: Minuteur) => Partial<Minuteur>) {
    setMinuteurs((liste) => liste.map((m) => (m.id === id ? { ...m, ...changement(m) } : m)));
  }

  // --- Commandes d'un minuteur ---

  function demarrer(m: Minuteur) {
    if (m.finMs !== null || m.resteMs <= 0) return {};
    return { finMs: Date.now() + m.resteMs, aSonne: false };
  }
  function pause(m: Minuteur) {
    return m.finMs === null ? {} : { finMs: null, resteMs: Math.max(m.finMs - Date.now(), 0) };
  }
  function remettre(m: Minuteur) {
    return { finMs: null, resteMs: m.dureeMs, aSonne: false };
  }
  function plusUneMinute(m: Minuteur) {
    if (m.finMs !== null) return { finMs: Math.max(m.finMs, Date.now()) + MINUTE };
    return { resteMs: m.resteMs + MINUTE, aSonne: false };
  }

  function basculer(id: number) {
    preparerSon();
    modifier(id, (m) => (m.finMs !== null ? pause(m) : demarrer(m)));
  }

  // --- Commandes globales ---

  const toutes = (action: (m: Minuteur) => Partial<Minuteur>) =>
    setMinuteurs((liste) => liste.map((m) => ({ ...m, ...action(m) })));

  function toutDemarrer() {
    preparerSon();
    toutes(demarrer);
  }

  function ajouter() {
    if (minuteurs.length >= MAX_MINUTEURS) return;
    const derniere = minuteurs[minuteurs.length - 1];
    setMinuteurs((liste) => [
      ...liste,
      nouveauMinuteur(`Groupe ${liste.length + 1}`, derniere ? derniere.dureeMs / MINUTE : 10),
    ]);
  }

  // Signal de fin : une seule fois par minuteur ; le minuteur s'arrête à 00:00.
  useEffect(() => {
    const finis = minuteurs.filter((m) => m.finMs !== null && m.finMs <= maintenant && !m.aSonne);
    if (finis.length === 0) return;
    if (sonActif) biper(3);
    setMinuteurs((liste) =>
      liste.map((m) => (finis.some((f) => f.id === m.id) ? { ...m, finMs: null, resteMs: 0, aSonne: true } : m)),
    );
  }, [maintenant, minuteurs, sonActif]);

  const unEnCours = minuteurs.some((m) => m.finMs !== null);
  useEcranAllume(unEnCours);
  useAjusterAuPleinEcran(pleinEcran.ref, grilleRef, pleinEcran.actif, minuteurs.length, {
    maxColonnes: 4,
    tailleMax: 48,
  });
  useRaccourcis({
    " ": () => (unEnCours ? toutes(pause) : toutDemarrer()),
    f: () => pleinEcran.possible && pleinEcran.basculer(),
  });

  return (
    <div className="outil-temps">
      <div ref={pleinEcran.ref} className={`resultat ${pleinEcran.actif ? "ecran-plein" : ""}`}>
        <div ref={grilleRef} className={styles.grille}>
          {minuteurs.map((m) => {
            const r = reste(m);
            const enCours = m.finMs !== null;
            const fini = r <= 0;
            return (
              <section
                key={m.id}
                className={`${styles.carte} ${fini ? styles.fini : enCours ? styles.enCours : ""}`}
                aria-label={m.nom}
              >
                <input
                  className={styles.nom}
                  value={m.nom}
                  maxLength={30}
                  onChange={(e) => modifier(m.id, () => ({ nom: e.target.value }))}
                  aria-label="Nom du minuteur"
                />
                <div role="timer" className={`${styles.chiffres} ${fini ? "clignote" : ""}`}>
                  {fini ? "Fini !" : formater(r)}
                </div>
                <div className={styles.actions}>
                  <button
                    className={`${styles.petit} ${styles.principal}`}
                    onClick={() => basculer(m.id)}
                    disabled={fini}
                  >
                    {enCours ? "Pause" : r < m.dureeMs ? "Reprendre" : "Démarrer"}
                  </button>
                  <button className={styles.petit} onClick={() => modifier(m.id, plusUneMinute)}>
                    +1 min
                  </button>
                  <button className={styles.petit} onClick={() => modifier(m.id, remettre)} aria-label={`Remettre ${m.nom} à zéro`}>
                    ↺
                  </button>
                </div>
                {!enCours && !pleinEcran.actif && (
                  <div className={styles.reglage}>
                    <label>
                      Durée (min)
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={600}
                        value={Math.round(m.dureeMs / MINUTE)}
                        onChange={(e) => {
                          const minutes = Math.min(Math.max(Math.round(Number(e.target.value)) || 1, 1), 600);
                          modifier(m.id, () => ({ dureeMs: minutes * MINUTE, resteMs: minutes * MINUTE, aSonne: false }));
                        }}
                      />
                    </label>
                    {minuteurs.length > 1 && (
                      <button
                        className="lien-bouton"
                        onClick={() => setMinuteurs((liste) => liste.filter((x) => x.id !== m.id))}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <div className={`commandes ${styles.commandes}`}>
          <button className="bouton bouton-principal" onClick={toutDemarrer}>
            Tout démarrer
          </button>
          <button className="bouton" onClick={() => toutes(pause)} disabled={!unEnCours}>
            Tout mettre en pause
          </button>
          <button className="bouton" onClick={() => toutes(remettre)}>
            Tout remettre à zéro
          </button>
          <BoutonPleinEcran pleinEcran={pleinEcran} />
        </div>
      </div>

      <section className="reglages" aria-label="Réglages">
        <div className="choix">
          <button className="bouton" onClick={ajouter} disabled={minuteurs.length >= MAX_MINUTEURS}>
            Ajouter un minuteur
          </button>
          <button
            className="bouton"
            onClick={() =>
              toutes(() => ({ finMs: null, aSonne: false, dureeMs: minuteurs[0].dureeMs, resteMs: minuteurs[0].dureeMs }))
            }
          >
            Appliquer la durée du premier à tous
          </button>
        </div>
        <label className="option">
          <input type="checkbox" checked={sonActif} onChange={(e) => setSonActif(e.target.checked)} />
          Signal sonore quand un minuteur se termine
        </label>
        <p className="discret">
          Cliquez sur le nom d'un minuteur pour le modifier. Raccourcis clavier : Espace pour tout démarrer ou
          tout mettre en pause{pleinEcran.possible ? ", F pour le plein écran" : ""}.
        </p>
      </section>
    </div>
  );
}
