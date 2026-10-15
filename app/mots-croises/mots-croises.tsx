"use client";

// Générateur de mots croisés imprimable (niveau 1 décidé : P8).
// Saisie « MOT : définition », une ligne par mot ; grille vide ou avec solutions ;
// impression ou export en image.

import { useRef, useState } from "react";
import BoutonsExport from "@/components/boutons-export";
import { useStockageLocal } from "@/lib/stockage";
import { genererGrille, normaliserMot, type Entree, type Grille } from "./placement";
import styles from "./mots-croises.module.css";

const EXEMPLE = [
  "ATELIER : Séance de travail collective et animée",
  "OBJECTIF : Ce que l'on veut atteindre à la fin",
  "PAUSE : Moment pour souffler",
  "ECOUTE : Qualité essentielle de l'animateur",
  "IDEE : Elle naît parfois d'un post-it",
  "VOTE : Permet de choisir ensemble",
  "MINUTEUR : Il garde le rythme",
  "EQUIPE : Groupe qui travaille ensemble",
  "CONSIGNE : Ce que l'on explique avant chaque exercice",
  "BILAN : On le fait à la fin",
].join("\n");

function lire(texte: string): Entree[] {
  return texte
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 40)
    .map((l) => {
      const [mot, ...reste] = l.split(/\s*[:;\t]\s*/);
      return { mot: normaliserMot(mot).slice(0, 20), definition: reste.join(" : ").trim() };
    })
    .filter((e) => e.mot);
}

export default function MotsCroises() {
  const [texte, setTexte] = useStockageLocal("mots-croises", EXEMPLE);
  const [titre, setTitre] = useStockageLocal("mots-croises-titre", "Mots croisés de l'atelier");
  const [grille, setGrille] = useState<Grille | null>(null);
  const [solutions, setSolutions] = useState(false);
  const zone = useRef<HTMLDivElement>(null);

  const entrees = lire(texte);
  const sansDefinition = entrees.filter((e) => !e.definition).length;

  // Cases de la grille : lettre et éventuel numéro.
  const cases = new Map<string, { lettre: string; numero?: number }>();
  grille?.mots.forEach((m) => {
    for (let i = 0; i < m.mot.length; i++) {
      const k = `${m.x + (m.horizontal ? i : 0)},${m.y + (m.horizontal ? 0 : i)}`;
      cases.set(k, { lettre: m.mot[i], numero: cases.get(k)?.numero ?? (i === 0 ? m.numero : undefined) });
    }
    const k0 = `${m.x},${m.y}`;
    cases.set(k0, { ...cases.get(k0)!, numero: m.numero });
  });
  const horizontaux = grille?.mots.filter((m) => m.horizontal).sort((a, b) => a.numero - b.numero) ?? [];
  const verticaux = grille?.mots.filter((m) => !m.horizontal).sort((a, b) => a.numero - b.numero) ?? [];

  return (
    <div style={{ display: "grid", gap: 20, gridTemplateColumns: "minmax(0, 1fr)" }}>
      <div className="mise-en-page-tirage pas-imprimer">
        <section className="reglages" aria-label="Mots">
          <label className="champ">
            Titre
            <input type="text" value={titre} maxLength={60} onChange={(e) => setTitre(e.target.value)} />
          </label>
          <label className="champ">
            Un mot par ligne : MOT : définition ({entrees.length} mots, 40 au maximum)
            <textarea rows={12} value={texte} onChange={(e) => setTexte(e.target.value)} spellCheck={false} />
          </label>
          <p className="discret">
            Les accents, espaces et traits d'union sont retirés des mots, comme dans les grilles habituelles.
            {sansDefinition > 0 && ` ${sansDefinition} mot(s) sans définition.`}
          </p>
          <div className="commandes" style={{ justifyContent: "flex-start" }}>
            <button type="button" className="bouton bouton-principal" onClick={() => setGrille(genererGrille(entrees))} disabled={entrees.length < 2}>
              {grille ? "Générer une autre grille" : "Générer la grille"}
            </button>
          </div>
        </section>
        <section className="reglages" aria-label="Conseils">
          <h2>Bon à savoir</h2>
          <ul>
            <li>Plus les mots ont de lettres en commun, plus ils se croisent facilement.</li>
            <li>Chaque clic sur « Générer » essaie une nouvelle disposition.</li>
            <li>Un mot qui ne croise aucun autre ne peut pas être placé : il est signalé sous la grille.</li>
          </ul>
          {grille && (
            <label className="option">
              <input type="checkbox" checked={solutions} onChange={(e) => setSolutions(e.target.checked)} />
              Afficher les solutions
            </label>
          )}
        </section>
      </div>

      {grille && grille.mots.length > 0 && (
        <>
          <div ref={zone} className={styles.feuille}>
            <h2 className={styles.titre}>{titre}</h2>
            <div className={styles.defilement}>
              <div className={styles.grille} style={{ gridTemplateColumns: `repeat(${grille.largeur}, 2em)` }} role="img" aria-label={`Grille de ${grille.largeur} sur ${grille.hauteur}`}>
                {Array.from({ length: grille.hauteur }, (_, y) =>
                  Array.from({ length: grille.largeur }, (_, x) => {
                    const c = cases.get(`${x},${y}`);
                    return (
                      <div key={`${x},${y}`} className={c ? styles.case : styles.vide}>
                        {c?.numero && <span className={styles.numero}>{c.numero}</span>}
                        {c && solutions && <span className={styles.lettre}>{c.lettre}</span>}
                      </div>
                    );
                  }),
                )}
              </div>
            </div>
            <div className={styles.definitions}>
              <div>
                <h3>Horizontalement</h3>
                <ol>
                  {horizontaux.map((m) => (
                    <li key={m.mot + m.numero} value={m.numero}>
                      {m.definition || "(sans définition)"} <span className={styles.longueur}>({m.mot.length})</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3>Verticalement</h3>
                <ol>
                  {verticaux.map((m) => (
                    <li key={m.mot + m.numero} value={m.numero}>
                      {m.definition || "(sans définition)"} <span className={styles.longueur}>({m.mot.length})</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
          {grille.nonPlaces.length > 0 && (
            <p className="note pas-imprimer">
              Non placés ({grille.nonPlaces.length}) : {grille.nonPlaces.map((e) => e.mot || "?").join(", ")}. Essayez une autre
              grille, ou ajoutez des mots qui partagent des lettres avec eux.
            </p>
          )}
          <div className="commandes pas-imprimer">
            <BoutonsExport cible={zone} nomFichier={solutions ? "mots-croises-solutions" : "mots-croises"} />
          </div>
          <p className="discret pas-imprimer">Astuce : imprimez la grille vide pour les participants, puis cochez « Afficher les solutions » et imprimez le corrigé.</p>
        </>
      )}
    </div>
  );
}
