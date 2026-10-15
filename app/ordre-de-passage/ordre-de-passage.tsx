"use client";

// Ordre de passage : mélange la liste de noms. L'ordre peut être affiché
// d'un coup, ou révélé nom par nom (pour garder le suspense devant le groupe).

import { useRef, useState } from "react";
import BoutonCopier from "@/components/bouton-copier";
import BoutonPleinEcran from "@/components/bouton-plein-ecran";
import ChampNoms, { useListeNoms } from "@/components/liste-noms";
import { useAjusterAuPleinEcran, usePleinEcran, useRaccourcis } from "@/lib/hooks";
import { melanger } from "@/lib/hasard";
import styles from "./ordre-de-passage.module.css";

export default function OrdreDePassage() {
  const liste = useListeNoms();
  const [ordre, setOrdre] = useState<string[]>([]);
  const [unParUn, setUnParUn] = useState(false);
  const [reveles, setReveles] = useState(0); // nombre de noms affichés (mode un par un)

  const pleinEcran = usePleinEcran<HTMLDivElement>();
  const listeRef = useRef<HTMLOListElement>(null);

  function tirer() {
    if (liste.noms.length === 0) return;
    setOrdre(melanger(liste.noms));
    setReveles(unParUn ? 0 : liste.noms.length);
  }

  function revelerSuivant() {
    setReveles((n) => Math.min(n + 1, ordre.length));
  }

  const toutRevele = reveles >= ordre.length;
  const visibles = ordre.slice(0, reveles);
  const texteACopier = ordre.map((nom, i) => `${i + 1}. ${nom}`).join("\n");

  // En plein écran, toute la liste tient sur un seul écran, en restant lisible.
  useAjusterAuPleinEcran(pleinEcran.ref, listeRef, pleinEcran.actif, reveles);

  useRaccourcis({
    " ": () => (ordre.length > 0 && !toutRevele ? revelerSuivant() : tirer()),
    f: () => pleinEcran.possible && pleinEcran.basculer(),
  });

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Réglages">
        <ChampNoms texte={liste.texte} onChange={liste.modifier} nombre={liste.noms.length} />
        <label className="option">
          <input type="checkbox" checked={unParUn} onChange={(e) => setUnParUn(e.target.checked)} />
          Révéler les noms un par un
        </label>
        <div>
          <button className="bouton bouton-principal" onClick={tirer} disabled={liste.noms.length === 0}>
            {ordre.length ? "Tirer un nouvel ordre" : "Tirer l'ordre"}
          </button>
        </div>
      </section>

      <div ref={pleinEcran.ref} className={`resultat ${pleinEcran.actif ? "ecran-plein" : ""}`}>
        <h2 className={styles.titre}>Ordre de passage</h2>

        {ordre.length === 0 && <p className="discret">Saisissez les noms puis cliquez sur « Tirer l'ordre ».</p>}

        {ordre.length > 0 && (
          <>
            <ol ref={listeRef} className={styles.ordre} aria-live="polite">
              {visibles.map((nom, i) => (
                <li key={i} className={i === reveles - 1 && !toutRevele ? styles.dernier : ""}>
                  <span className={styles.numero}>{i + 1}</span>
                  <span>{nom}</span>
                </li>
              ))}
            </ol>
            {!toutRevele && (
              <p className="discret">
                {ordre.length - reveles} nom{ordre.length - reveles > 1 ? "s" : ""} restant
                {ordre.length - reveles > 1 ? "s" : ""}.
              </p>
            )}
          </>
        )}

        <div className="commandes">
          {ordre.length > 0 && !toutRevele && (
            <button className="bouton bouton-principal" onClick={revelerSuivant}>
              {reveles === 0 ? "Révéler le premier" : "Révéler le suivant"}
            </button>
          )}
          {ordre.length > 0 && !toutRevele && (
            <button className="bouton" onClick={() => setReveles(ordre.length)}>
              Tout révéler
            </button>
          )}
          {ordre.length > 0 && toutRevele && !pleinEcran.actif && <BoutonCopier texte={texteACopier} />}
          <BoutonPleinEcran pleinEcran={pleinEcran} />
        </div>
      </div>
    </div>
  );
}
