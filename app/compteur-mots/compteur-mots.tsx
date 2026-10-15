"use client";

// Compteur de mots et de caractères, avec temps de lecture et de parole estimés.

import { useStockageLocal } from "@/lib/stockage";
import { formaterDuree } from "@/lib/temps";
import { frequences, mots } from "@/lib/texte";
import styles from "./compteur-mots.module.css";

// Vitesses moyennes couramment admises (estimations, elles varient selon les personnes).
const MOTS_LUS_PAR_MINUTE = 230;
const MOTS_DITS_PAR_MINUTE = 130;

export default function CompteurMots() {
  const [texte, setTexte] = useStockageLocal("compteur-mots", "");

  const listeMots = mots(texte);
  const nbMots = listeMots.length;
  const caracteres = [...texte].length;
  const sansEspaces = [...texte.replace(/\s/g, "")].length;
  const phrases = texte.trim() ? (texte.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) ?? []).filter((p) => p.trim()).length : 0;
  const paragraphes = texte.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const lecture = (nbMots / MOTS_LUS_PAR_MINUTE) * 60_000;
  const parole = (nbMots / MOTS_DITS_PAR_MINUTE) * 60_000;
  const frequents = frequences(texte).slice(0, 10);

  const stats = [
    { libelle: "Mots", valeur: nbMots },
    { libelle: "Caractères", valeur: caracteres },
    { libelle: "Caractères sans espaces", valeur: sansEspaces },
    { libelle: "Phrases", valeur: phrases },
    { libelle: "Paragraphes", valeur: paragraphes },
  ];

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Texte">
        <label className="champ">
          Collez ou tapez votre texte
          <textarea rows={16} value={texte} onChange={(e) => setTexte(e.target.value)} />
        </label>
        {texte && (
          <div>
            <button type="button" className="lien-bouton" onClick={() => setTexte("")}>
              Effacer le texte
            </button>
          </div>
        )}
      </section>

      <div className="resultat" aria-live="polite">
        <dl className={styles.stats}>
          {stats.map((s) => (
            <div key={s.libelle}>
              <dt>{s.libelle}</dt>
              <dd>{s.valeur.toLocaleString("fr-FR")}</dd>
            </div>
          ))}
          <div>
            <dt>Temps de lecture</dt>
            <dd>{nbMots ? formaterDuree(Math.max(lecture, 1000)) : "0 s"}</dd>
          </div>
          <div>
            <dt>Temps de parole</dt>
            <dd>{nbMots ? formaterDuree(Math.max(parole, 1000)) : "0 s"}</dd>
          </div>
        </dl>
        <p className="discret">
          Temps estimés sur une base de {MOTS_LUS_PAR_MINUTE} mots lus et {MOTS_DITS_PAR_MINUTE} mots prononcés par
          minute : ce sont des moyennes, à ajuster selon votre rythme.
        </p>
        {frequents.length > 0 && (
          <>
            <h2 className={styles.titre}>Mots les plus fréquents</h2>
            <ol className={styles.frequents}>
              {frequents.map((f) => (
                <li key={f.mot}>
                  {f.mot} <span className="discret">({f.n})</span>
                </li>
              ))}
            </ol>
          </>
        )}
        <p className="discret">Le texte reste dans ce navigateur uniquement.</p>
      </div>
    </div>
  );
}
