"use client";

// Matrice de décision pondérée : des options (colonnes) notées sur des critères
// (lignes) qui ont chacun un poids. Score d'une option = somme(poids × note),
// ramené en pourcentage du maximum possible. Utilisée par E4 et E5.

import { useRef } from "react";
import BoutonsExport from "@/components/boutons-export";
import { nombre } from "@/lib/nombres";
import { nouvelId, useStockageLocal } from "@/lib/stockage";
import styles from "./matrice-decision.module.css";

type Critere = { id: string; nom: string; poids: number };
type Option = { id: string; nom: string };
type Donnees = { criteres: Critere[]; options: Option[]; notes: Record<string, number> }; // clé de note : critère|option

type Props = {
  cle: string;
  depart: { criteres: [string, number][]; options: string[]; notes?: number[][] };
  libelleOption: string; // « Option », « Mission »...
  noteMax?: number;
  verdict?: (pourcentage: number) => { texte: string; classe: "bon" | "moyen" | "mauvais" };
  nomFichier: string;
};

function preparer(depart: Props["depart"]): Donnees {
  const criteres = depart.criteres.map(([nom, poids]) => ({ id: nouvelId(), nom, poids }));
  const options = depart.options.map((nom) => ({ id: nouvelId(), nom }));
  const notes: Record<string, number> = {};
  depart.notes?.forEach((ligne, i) => ligne.forEach((n, j) => (notes[`${criteres[i].id}|${options[j]?.id}`] = n)));
  return { criteres, options, notes };
}

export default function MatriceDecision({ cle, depart, libelleOption, noteMax = 5, verdict, nomFichier }: Props) {
  const [d, setD] = useStockageLocal<Donnees>(cle, preparer(depart));
  const zone = useRef<HTMLDivElement>(null);

  const note = (c: string, o: string) => d.notes[`${c}|${o}`] ?? 0;
  const poidsTotal = d.criteres.reduce((t, c) => t + c.poids, 0);
  const scores = d.options.map((o) => {
    const brut = d.criteres.reduce((t, c) => t + c.poids * note(c.id, o.id), 0);
    return { id: o.id, brut, pourcentage: poidsTotal > 0 ? (brut / (poidsTotal * noteMax)) * 100 : 0 };
  });
  const meilleur = Math.max(...scores.map((s) => s.brut), 0);

  const modifierCritere = (id: string, champ: Partial<Critere>) =>
    setD((x) => ({ ...x, criteres: x.criteres.map((c) => (c.id === id ? { ...c, ...champ } : c)) }));
  const modifierOption = (id: string, nom: string) => setD((x) => ({ ...x, options: x.options.map((o) => (o.id === id ? { ...o, nom } : o)) }));

  return (
    // minmax(0, 1fr) : le tableau défile dans son cadre au lieu d'élargir la page (téléphone).
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1fr)" }}>
      <div ref={zone} className={styles.cadre}>
        <div className={styles.defilement}>
          <table className={styles.matrice}>
            <thead>
              <tr>
                <th scope="col">Critère</th>
                <th scope="col" className={styles.poids}>
                  Poids
                </th>
                {d.options.map((o) => (
                  <th key={o.id} scope="col">
                    <input value={o.nom} maxLength={40} onChange={(e) => modifierOption(o.id, e.target.value)} aria-label={`Nom de : ${o.nom}`} className={styles.nomOption} />
                    {d.options.length > 1 && (
                      <button
                        type="button"
                        className={`${styles.retirer} pas-exporter pas-imprimer`}
                        onClick={() => setD((x) => ({ ...x, options: x.options.filter((y) => y.id !== o.id) }))}
                        aria-label={`Retirer ${o.nom}`}
                      >
                        ×
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.criteres.map((c) => (
                <tr key={c.id}>
                  <th scope="row">
                    <span className={styles.critere}>
                      <input value={c.nom} maxLength={60} onChange={(e) => modifierCritere(c.id, { nom: e.target.value })} aria-label={`Nom du critère : ${c.nom}`} />
                      {d.criteres.length > 1 && (
                        <button
                          type="button"
                          className={`${styles.retirer} pas-exporter pas-imprimer`}
                          onClick={() => setD((x) => ({ ...x, criteres: x.criteres.filter((y) => y.id !== c.id) }))}
                          aria-label={`Retirer le critère ${c.nom}`}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  </th>
                  <td className={styles.poids}>
                    <select value={c.poids} onChange={(e) => modifierCritere(c.id, { poids: Number(e.target.value) })} aria-label={`Poids de ${c.nom}`}>
                      {[1, 2, 3, 4, 5].map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </td>
                  {d.options.map((o) => (
                    <td key={o.id}>
                      <select
                        value={note(c.id, o.id)}
                        onChange={(e) => setD((x) => ({ ...x, notes: { ...x.notes, [`${c.id}|${o.id}`]: Number(e.target.value) } }))}
                        aria-label={`Note de ${o.nom} pour ${c.nom}`}
                        className={styles.note}
                        style={{ background: `color-mix(in srgb, #16a34a ${(note(c.id, o.id) / noteMax) * 35}%, white)` }}
                      >
                        {Array.from({ length: noteMax + 1 }, (_, n) => (
                          <option key={n}>{n}</option>
                        ))}
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={2}>
                  Score
                </th>
                {scores.map((s) => (
                  <td key={s.id} className={s.brut === meilleur && meilleur > 0 ? styles.gagnant : ""}>
                    <strong>{nombre(s.pourcentage, 0)} %</strong>
                    <span className={styles.brut}>{nombre(s.brut, 0)} pts</span>
                    {verdict && <span className={`${styles.verdict} ${styles[verdict(s.pourcentage).classe]}`}>{verdict(s.pourcentage).texte}</span>}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="commandes pas-imprimer">
        <button type="button" className="bouton" onClick={() => setD((x) => ({ ...x, criteres: [...x.criteres, { id: nouvelId(), nom: "Nouveau critère", poids: 3 }] }))}>
          Ajouter un critère
        </button>
        <button
          type="button"
          className="bouton"
          onClick={() => setD((x) => ({ ...x, options: [...x.options, { id: nouvelId(), nom: `${libelleOption} ${x.options.length + 1}` }] }))}
          disabled={d.options.length >= 8}
        >
          Ajouter : {libelleOption.toLowerCase()}
        </button>
        <BoutonsExport cible={zone} nomFichier={nomFichier} />
        <button type="button" className="bouton" onClick={() => window.confirm("Revenir à l'exemple ? Vos saisies seront perdues.") && setD(preparer(depart))}>
          Revenir à l'exemple
        </button>
      </div>
      <p className="discret pas-imprimer">
        Notes de 0 à {noteMax}, poids de 1 (secondaire) à 5 (essentiel). Score = somme des notes multipliées par les poids,
        en pourcentage du maximum. Le meilleur score est surligné. Contenu gardé dans ce navigateur.
      </p>
    </div>
  );
}
