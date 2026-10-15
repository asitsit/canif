"use client";

// Tirage au sort d'une carte de texte (question, défi, lettre, thème...) dans une
// pioche, sans remise : une carte ne ressort pas avant que toutes soient passées.
// Affichage en grand, plein écran, historique. Utilisé par B1, B6 et B7.

import { useEffect, useRef, useState } from "react";
import BoutonPleinEcran from "@/components/bouton-plein-ecran";
import { usePleinEcran, useRaccourcis } from "@/lib/hooks";
import { entierAleatoire } from "@/lib/hasard";
import styles from "./tirage-cartes.module.css";

export type Carte = { texte: string; detail?: string; etiquette?: string };

type Props = {
  cartes: Carte[]; // la pioche (déjà filtrée par l'outil)
  libelleBouton?: string;
  vide?: string; // message quand la pioche est vide
  tailleTexte?: "normale" | "geante"; // géante : une lettre
};

export default function TirageCartes({ cartes, libelleBouton = "Tirer", vide = "Aucune carte disponible.", tailleTexte = "normale" }: Props) {
  const [carte, setCarte] = useState<Carte | null>(null);
  const [dejaTirees, setDejaTirees] = useState<string[]>([]);
  const [numero, setNumero] = useState(0); // relance l'animation d'apparition
  const pleinEcran = usePleinEcran<HTMLDivElement>();

  // Quand la pioche change (filtres), on repart de zéro.
  const signature = cartes.map((c) => c.texte).join("|");
  const precedente = useRef(signature);
  useEffect(() => {
    if (precedente.current !== signature) {
      precedente.current = signature;
      setDejaTirees([]);
      setCarte(null);
    }
  }, [signature]);

  const restantes = cartes.filter((c) => !dejaTirees.includes(c.texte));

  function tirer() {
    if (cartes.length === 0) return;
    // Pioche épuisée : on la remélange (toutes les cartes redeviennent possibles).
    const pioche = restantes.length > 0 ? restantes : cartes.filter((c) => c.texte !== carte?.texte);
    const choisie = (pioche.length ? pioche : cartes)[entierAleatoire(pioche.length || cartes.length)];
    setCarte(choisie);
    setDejaTirees((d) => (restantes.length > 0 ? [...d, choisie.texte] : [choisie.texte]));
    setNumero((n) => n + 1);
  }

  useRaccourcis({ " ": tirer, f: () => pleinEcran.possible && pleinEcran.basculer() });

  return (
    <div ref={pleinEcran.ref} className={`ecran ${styles.zone} ${pleinEcran.actif ? "ecran-plein" : ""}`}>
      <div key={numero} className={`${styles.carte} ${carte ? styles.apparition : ""}`} aria-live="polite">
        {carte ? (
          <>
            {carte.etiquette && <span className={styles.etiquette}>{carte.etiquette}</span>}
            <p className={tailleTexte === "geante" ? styles.geant : styles.texte}>{carte.texte}</p>
            {carte.detail && <p className={styles.detail}>{carte.detail}</p>}
          </>
        ) : (
          <p className={styles.attente}>{cartes.length ? `Appuyez sur « ${libelleBouton} »` : vide}</p>
        )}
      </div>
      <div className="commandes">
        <button type="button" className="bouton bouton-principal" onClick={tirer} disabled={cartes.length === 0}>
          {libelleBouton}
        </button>
        <BoutonPleinEcran pleinEcran={pleinEcran} />
      </div>
      <p className={styles.compteur}>
        {cartes.length > 0 &&
          (restantes.length > 0
            ? `${restantes.length} sur ${cartes.length} pas encore tirée${restantes.length > 1 ? "s" : ""}`
            : "Toutes les cartes sont passées : le prochain tirage remélange la pioche")}
      </p>
    </div>
  );
}
