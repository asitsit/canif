"use client";

// Roadmap simple : des thèmes (lignes) et des périodes (colonnes). Dans chaque
// case, des éléments avec un statut (prévu, en cours, fait). Un clic sur la
// pastille d'un élément fait défiler son statut.

import { useRef, useState } from "react";
import BoutonsExport from "@/components/boutons-export";
import { nouvelId, useStockageLocal } from "@/lib/stockage";
import styles from "./roadmap.module.css";

type Statut = "prevu" | "encours" | "fait";
const STATUTS: Record<Statut, string> = { prevu: "Prévu", encours: "En cours", fait: "Fait" };
const SUIVANT: Record<Statut, Statut> = { prevu: "encours", encours: "fait", fait: "prevu" };

type Element = { id: string; theme: string; periode: string; texte: string; statut: Statut };
type Donnees = { titre: string; themes: { id: string; nom: string }[]; periodes: { id: string; nom: string }[]; elements: Element[] };

function depart(): Donnees {
  const themes = ["Produit", "Équipe", "Communication"].map((nom) => ({ id: nouvelId(), nom }));
  const periodes = ["Trimestre 1", "Trimestre 2", "Trimestre 3", "Trimestre 4"].map((nom) => ({ id: nouvelId(), nom }));
  const el = (t: number, p: number, texte: string, statut: Statut): Element => ({ id: nouvelId(), theme: themes[t].id, periode: periodes[p].id, texte, statut });
  return {
    titre: "Feuille de route de l'année",
    themes,
    periodes,
    elements: [
      el(0, 0, "Version d'essai", "fait"),
      el(0, 1, "Retours des premiers utilisateurs", "encours"),
      el(0, 2, "Nouvelle version", "prevu"),
      el(1, 0, "Recrutement d'un chef de projet", "fait"),
      el(1, 2, "Formation de l'équipe", "prevu"),
      el(2, 1, "Lancement du site", "encours"),
      el(2, 3, "Bilan public", "prevu"),
    ],
  };
}

export default function Roadmap() {
  const [d, setD] = useStockageLocal<Donnees>("roadmap", depart());
  const [ajout, setAjout] = useState<{ cle: string; texte: string } | null>(null);
  const zone = useRef<HTMLDivElement>(null);

  const renommer = (cle: "themes" | "periodes", id: string, nom: string) => setD((x) => ({ ...x, [cle]: x[cle].map((e) => (e.id === id ? { ...e, nom } : e)) }));
  const retirer = (cle: "themes" | "periodes", id: string) =>
    setD((x) => ({ ...x, [cle]: x[cle].filter((e) => e.id !== id), elements: x.elements.filter((e) => (cle === "themes" ? e.theme : e.periode) !== id) }));

  function valider(theme: string, periode: string) {
    const texte = ajout?.texte.trim();
    if (texte) setD((x) => ({ ...x, elements: [...x.elements, { id: nouvelId(), theme, periode, texte: texte.slice(0, 120), statut: "prevu" }] }));
    setAjout(null);
  }

  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1fr)" }}>
      <div ref={zone} className={styles.cadre}>
        <input className={styles.titre} value={d.titre} maxLength={80} onChange={(e) => setD({ ...d, titre: e.target.value })} aria-label="Titre de la roadmap" />
        <div className={styles.defilement}>
          <div className={styles.grille} style={{ gridTemplateColumns: `minmax(160px, 200px) repeat(${d.periodes.length}, minmax(150px, 1fr))` }}>
            <div />
            {d.periodes.map((p) => (
              <div key={p.id} className={styles.periode}>
                <input value={p.nom} maxLength={30} onChange={(e) => renommer("periodes", p.id, e.target.value)} aria-label={`Période : ${p.nom}`} />
                {d.periodes.length > 1 && (
                  <button type="button" className={`${styles.x} pas-exporter pas-imprimer`} onClick={() => retirer("periodes", p.id)} aria-label={`Retirer ${p.nom}`}>
                    ×
                  </button>
                )}
              </div>
            ))}
            {d.themes.map((t) => (
              <div key={t.id} className={styles.ligne}>
                <div className={styles.theme}>
                  <input value={t.nom} maxLength={30} onChange={(e) => renommer("themes", t.id, e.target.value)} aria-label={`Thème : ${t.nom}`} />
                  {d.themes.length > 1 && (
                    <button type="button" className={`${styles.x} pas-exporter pas-imprimer`} onClick={() => retirer("themes", t.id)} aria-label={`Retirer ${t.nom}`}>
                      ×
                    </button>
                  )}
                </div>
                {d.periodes.map((p) => {
                  const cle = `${t.id}|${p.id}`;
                  return (
                    <div key={p.id} className={styles.case}>
                      {d.elements
                        .filter((e) => e.theme === t.id && e.periode === p.id)
                        .map((e) => (
                          <div key={e.id} className={`${styles.element} ${styles[e.statut]}`}>
                            <button
                              type="button"
                              className={styles.statut}
                              onClick={() => setD((x) => ({ ...x, elements: x.elements.map((y) => (y.id === e.id ? { ...y, statut: SUIVANT[y.statut] } : y)) }))}
                              aria-label={`Statut : ${STATUTS[e.statut]}. Cliquer pour changer`}
                              title={STATUTS[e.statut]}
                            />
                            <span>{e.texte}</span>
                            <button
                              type="button"
                              className={`${styles.x} pas-exporter pas-imprimer`}
                              onClick={() => setD((x) => ({ ...x, elements: x.elements.filter((y) => y.id !== e.id) }))}
                              aria-label={`Supprimer ${e.texte}`}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      {ajout?.cle === cle ? (
                        <form
                          onSubmit={(ev) => {
                            // Entrée : on quitte le champ, et c'est la perte de focus qui enregistre
                            // (un seul chemin d'enregistrement, donc pas de double ajout).
                            ev.preventDefault();
                            (document.activeElement as HTMLElement | null)?.blur();
                          }}
                        >
                          <input
                            autoFocus
                            className={styles.saisie}
                            value={ajout.texte}
                            onChange={(ev) => setAjout({ cle, texte: ev.target.value })}
                            onBlur={() => valider(t.id, p.id)}
                            aria-label={`Nouvel élément : ${t.nom}, ${p.nom}`}
                          />
                        </form>
                      ) : (
                        <button type="button" className={`${styles.ajouter} pas-exporter pas-imprimer`} onClick={() => setAjout({ cle, texte: "" })} aria-label={`Ajouter dans ${t.nom}, ${p.nom}`}>
                          +
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <p className={styles.legende}>
          {(Object.keys(STATUTS) as Statut[]).map((s) => (
            <span key={s} className={styles[s]}>
              <span className={styles.statut} /> {STATUTS[s]}
            </span>
          ))}
        </p>
      </div>

      <div className="commandes pas-imprimer">
        <button type="button" className="bouton" onClick={() => setD((x) => ({ ...x, themes: [...x.themes, { id: nouvelId(), nom: "Nouveau thème" }] }))}>
          Ajouter un thème
        </button>
        <button type="button" className="bouton" onClick={() => setD((x) => ({ ...x, periodes: [...x.periodes, { id: nouvelId(), nom: "Nouvelle période" }] }))} disabled={d.periodes.length >= 12}>
          Ajouter une période
        </button>
        <BoutonsExport cible={zone} nomFichier="roadmap" />
        <button type="button" className="bouton" onClick={() => window.confirm("Revenir à l'exemple ? Votre roadmap sera perdue.") && setD(depart())}>
          Revenir à l'exemple
        </button>
      </div>
      <p className="discret pas-imprimer">
        Cliquez sur la pastille d'un élément pour changer son statut (prévu, en cours, fait). Noms des thèmes et périodes
        modifiables. Contenu gardé dans ce navigateur.
      </p>
    </div>
  );
}
