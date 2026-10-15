"use client";

// Matrice RACI : qui Réalise, qui est Approbateur (responsable final), qui est
// Consulté, qui est Informé, pour chaque tâche. Un clic sur une case fait défiler
// R, A, C, I puis vide. Contrôles : une seule personne « A » et au moins un « R » par tâche.

import { useRef } from "react";
import BoutonsExport from "@/components/boutons-export";
import { nouvelId, useStockageLocal } from "@/lib/stockage";
import styles from "./raci.module.css";

type Role = "" | "R" | "A" | "C" | "I";
const CYCLE: Role[] = ["", "R", "A", "C", "I"];
const LEGENDE: Record<Exclude<Role, "">, string> = {
  R: "Réalise : fait le travail",
  A: "Approuve : rend des comptes, une seule personne",
  C: "Consulté : donne son avis avant",
  I: "Informé : tenu au courant après",
};

type Donnees = { taches: { id: string; nom: string }[]; personnes: { id: string; nom: string }[]; cases: Record<string, Role> };

function depart(): Donnees {
  const taches = ["Définir le besoin", "Choisir le prestataire", "Former les équipes", "Communiquer le changement"].map((nom) => ({ id: nouvelId(), nom }));
  const personnes = ["Direction", "Chef de projet", "Équipe métier", "Service informatique"].map((nom) => ({ id: nouvelId(), nom }));
  const grille: Role[][] = [
    ["A", "R", "C", "C"],
    ["A", "R", "C", "C"],
    ["I", "A", "R", "C"],
    ["A", "R", "I", "I"],
  ];
  const cases: Record<string, Role> = {};
  grille.forEach((ligne, i) => ligne.forEach((r, j) => (cases[`${taches[i].id}|${personnes[j].id}`] = r)));
  return { taches, personnes, cases };
}

export default function Raci() {
  const [d, setD] = useStockageLocal<Donnees>("raci", depart());
  const zone = useRef<HTMLDivElement>(null);
  const role = (t: string, p: string) => d.cases[`${t}|${p}`] ?? "";

  function suivant(t: string, p: string) {
    const actuel = role(t, p);
    const prochain = CYCLE[(CYCLE.indexOf(actuel) + 1) % CYCLE.length];
    setD((x) => ({ ...x, cases: { ...x.cases, [`${t}|${p}`]: prochain } }));
  }

  // Alertes par tâche
  function alertes(t: string) {
    const roles = d.personnes.map((p) => role(t, p.id));
    const a = roles.filter((r) => r === "A").length;
    const liste: string[] = [];
    if (a === 0) liste.push("aucun A");
    if (a > 1) liste.push(`${a} A (un seul attendu)`);
    if (!roles.includes("R")) liste.push("aucun R");
    return liste;
  }

  const renommer = (cle: "taches" | "personnes", id: string, nom: string) =>
    setD((x) => ({ ...x, [cle]: x[cle].map((e) => (e.id === id ? { ...e, nom } : e)) }));
  const retirer = (cle: "taches" | "personnes", id: string) => setD((x) => ({ ...x, [cle]: x[cle].filter((e) => e.id !== id) }));

  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1fr)" }}>
      <div ref={zone} className={styles.cadre}>
        <div className={styles.defilement}>
          <table className={styles.raci}>
            <thead>
              <tr>
                <th scope="col">Tâche</th>
                {d.personnes.map((p) => (
                  <th key={p.id} scope="col">
                    <input value={p.nom} maxLength={30} onChange={(e) => renommer("personnes", p.id, e.target.value)} aria-label={`Nom : ${p.nom}`} />
                    <button type="button" className={`${styles.retirer} pas-exporter pas-imprimer`} onClick={() => retirer("personnes", p.id)} aria-label={`Retirer ${p.nom}`}>
                      ×
                    </button>
                  </th>
                ))}
                <th scope="col">Contrôle</th>
              </tr>
            </thead>
            <tbody>
              {d.taches.map((t) => {
                const a = alertes(t.id);
                return (
                  <tr key={t.id}>
                    <th scope="row">
                      <span className={styles.tache}>
                        <input value={t.nom} maxLength={80} onChange={(e) => renommer("taches", t.id, e.target.value)} aria-label={`Tâche : ${t.nom}`} />
                        <button type="button" className={`${styles.retirer} pas-exporter pas-imprimer`} onClick={() => retirer("taches", t.id)} aria-label={`Retirer ${t.nom}`}>
                          ×
                        </button>
                      </span>
                    </th>
                    {d.personnes.map((p) => {
                      const r = role(t.id, p.id);
                      return (
                        <td key={p.id}>
                          <button
                            type="button"
                            className={`${styles.case} ${r ? styles[r] : ""}`}
                            onClick={() => suivant(t.id, p.id)}
                            aria-label={`${t.nom}, ${p.nom} : ${r ? LEGENDE[r] : "aucun rôle"}. Cliquer pour changer`}
                          >
                            {r}
                          </button>
                        </td>
                      );
                    })}
                    <td className={a.length ? styles.alerte : styles.ok}>{a.length ? a.join(", ") : "✓"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <ul className={styles.legende}>
          {(Object.keys(LEGENDE) as Exclude<Role, "">[]).map((r) => (
            <li key={r}>
              <span className={`${styles.case} ${styles[r]}`}>{r}</span> {LEGENDE[r]}
            </li>
          ))}
        </ul>
      </div>

      <div className="commandes pas-imprimer">
        <button type="button" className="bouton" onClick={() => setD((x) => ({ ...x, taches: [...x.taches, { id: nouvelId(), nom: "Nouvelle tâche" }] }))}>
          Ajouter une tâche
        </button>
        <button type="button" className="bouton" onClick={() => setD((x) => ({ ...x, personnes: [...x.personnes, { id: nouvelId(), nom: "Nouvelle personne" }] }))} disabled={d.personnes.length >= 12}>
          Ajouter une personne
        </button>
        <BoutonsExport cible={zone} nomFichier="matrice-raci" />
        <button type="button" className="bouton" onClick={() => window.confirm("Revenir à l'exemple ? Vos saisies seront perdues.") && setD(depart())}>
          Revenir à l'exemple
        </button>
      </div>
      <p className="discret pas-imprimer">Cliquez sur une case pour faire défiler R, A, C, I. Contenu gardé dans ce navigateur.</p>
    </div>
  );
}
