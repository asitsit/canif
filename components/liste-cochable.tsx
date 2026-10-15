"use client";

// Liste à cocher par sections (checklist technique, liste de matériel...).
// On peut cocher, ajouter ou retirer des éléments ; tout reste dans le navigateur.

import { useState } from "react";
import { nouvelId, useStockageLocal } from "@/lib/stockage";
import styles from "./liste-cochable.module.css";

export type Section = { titre: string; elements: string[] };

type Element = { id: string; texte: string; coche: boolean };
type SectionEnregistree = { titre: string; elements: Element[] };

function preparer(sections: Section[]): SectionEnregistree[] {
  return sections.map((s) => ({
    titre: s.titre,
    elements: s.elements.map((texte) => ({ id: nouvelId(), texte, coche: false })),
  }));
}

export default function ListeCochable({ cle, sections }: { cle: string; sections: Section[] }) {
  const [liste, setListe] = useStockageLocal<SectionEnregistree[]>(cle, preparer(sections));
  const [saisies, setSaisies] = useState<Record<number, string>>({});

  const total = liste.reduce((n, s) => n + s.elements.length, 0);
  const coches = liste.reduce((n, s) => n + s.elements.filter((e) => e.coche).length, 0);

  const modifierSection = (i: number, f: (e: Element[]) => Element[]) =>
    setListe((l) => l.map((s, j) => (j === i ? { ...s, elements: f(s.elements) } : s)));

  return (
    <div className={styles.outil}>
      <div className={styles.progression} aria-live="polite">
        <strong>
          {coches} / {total}
        </strong>{" "}
        élément{total > 1 ? "s" : ""} prêt{coches > 1 ? "s" : ""}
        <div className="barre" aria-hidden="true">
          <div className="barre-remplie" style={{ width: total ? `${(coches / total) * 100}%` : 0, background: "var(--vert)" }} />
        </div>
      </div>

      <div className={styles.sections}>
        {liste.map((section, i) => (
          <section key={i} className={styles.section}>
            <h2>{section.titre}</h2>
            <ul>
              {section.elements.map((e) => (
                <li key={e.id} className={e.coche ? styles.coche : ""}>
                  <label>
                    <input
                      type="checkbox"
                      checked={e.coche}
                      onChange={() => modifierSection(i, (els) => els.map((x) => (x.id === e.id ? { ...x, coche: !x.coche } : x)))}
                    />
                    <span>{e.texte}</span>
                  </label>
                  <button
                    type="button"
                    className={`${styles.retirer} pas-imprimer`}
                    onClick={() => modifierSection(i, (els) => els.filter((x) => x.id !== e.id))}
                    aria-label={`Retirer « ${e.texte} »`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <form
              className={`${styles.ajout} pas-imprimer`}
              onSubmit={(ev) => {
                ev.preventDefault();
                const texte = (saisies[i] ?? "").trim();
                if (!texte) return;
                modifierSection(i, (els) => [...els, { id: nouvelId(), texte: texte.slice(0, 120), coche: false }]);
                setSaisies((s) => ({ ...s, [i]: "" }));
              }}
            >
              <input
                type="text"
                value={saisies[i] ?? ""}
                onChange={(ev) => setSaisies((s) => ({ ...s, [i]: ev.target.value }))}
                placeholder="Ajouter un élément..."
                aria-label={`Ajouter dans ${section.titre}`}
              />
              <button type="submit" className="bouton">
                Ajouter
              </button>
            </form>
          </section>
        ))}
      </div>

      <div className="commandes pas-imprimer">
        <button type="button" className="bouton" onClick={() => window.print()}>
          Imprimer
        </button>
        <button
          type="button"
          className="bouton"
          onClick={() => setListe((l) => l.map((s) => ({ ...s, elements: s.elements.map((e) => ({ ...e, coche: false })) })))}
        >
          Tout décocher
        </button>
        <button
          type="button"
          className="bouton"
          onClick={() => window.confirm("Revenir à la liste d'origine ? Vos ajouts seront perdus.") && setListe(preparer(sections))}
        >
          Revenir à la liste d'origine
        </button>
      </div>
      <p className="discret pas-imprimer">Votre liste et vos coches restent enregistrées dans ce navigateur uniquement.</p>
    </div>
  );
}
