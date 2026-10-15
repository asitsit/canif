"use client";

// Calculateur de TJM (taux journalier moyen) pour une activité indépendante.
//
// Modèle volontairement simple et transparent :
//   chiffre d'affaires nécessaire = (revenu net visé + frais annuels) / (1 - taux de prélèvements)
//   jours facturés = jours ouvrés de l'année - congés - jours non facturables, × taux d'occupation
//   TJM = chiffre d'affaires nécessaire / jours facturés
// Le taux de prélèvements (cotisations + impôts) dépend du statut et change chaque
// année : c'est à la personne de le saisir. La valeur proposée n'est qu'une hypothèse.

import { useStockageLocal } from "@/lib/stockage";
import { euros, lireNombre, nombre, pourcent } from "@/lib/nombres";
import styles from "@/components/calculateur.module.css";

const DEFAUT = {
  revenu: "45000",
  frais: "6000",
  taux: "40",
  conges: "25",
  feries: "8",
  nonFacturables: "40",
  occupation: "80",
};

// Jours du lundi au vendredi dans une année (moyenne arrondie).
const JOURS_OUVRES_AN = 261;

export default function Tjm() {
  const [v, setV] = useStockageLocal("tjm", DEFAUT);
  const champ = (id: keyof typeof DEFAUT) => ({
    value: v[id],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...DEFAUT, ...v, [id]: e.target.value }),
  });

  const revenu = lireNombre(v.revenu);
  const frais = lireNombre(v.frais);
  const taux = Math.min(Math.max(lireNombre(v.taux), 0), 90) / 100;
  const disponibles = Math.max(JOURS_OUVRES_AN - lireNombre(v.conges) - lireNombre(v.feries) - lireNombre(v.nonFacturables), 0);
  const occupation = Math.min(Math.max(lireNombre(v.occupation), 1), 100) / 100;
  const factures = disponibles * occupation;

  const caNecessaire = (revenu + frais) / (1 - taux);
  const tjm = factures > 0 ? caNecessaire / factures : 0;

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Hypothèses">
        <h2>Ce que vous visez</h2>
        <label className="champ">
          Revenu net annuel souhaité (€)
          <input type="number" min={0} {...champ("revenu")} />
        </label>
        <label className="champ">
          Frais professionnels annuels (€) : logiciels, matériel, assurance, déplacements...
          <input type="number" min={0} {...champ("frais")} />
        </label>
        <label className="champ">
          Taux de prélèvements estimé (%) : cotisations sociales et impôts
          <input type="number" min={0} max={90} {...champ("taux")} />
        </label>
        <p className="note">
          Ce taux dépend de votre statut (micro-entreprise, société...), de vos revenus et de l'année. La valeur proposée
          est une simple hypothèse d'exemple : vérifiez le vôtre auprès de l'Urssaf ou de votre expert-comptable.
        </p>

        <h2>Votre temps</h2>
        <label className="champ">
          Jours de congés par an
          <input type="number" min={0} {...champ("conges")} />
        </label>
        <label className="champ">
          Jours fériés tombant en semaine
          <input type="number" min={0} {...champ("feries")} />
        </label>
        <label className="champ">
          Jours non facturables par an : prospection, administration, formation
          <input type="number" min={0} {...champ("nonFacturables")} />
        </label>
        <label className="champ">
          Taux d'occupation (%) : part des jours restants réellement vendus
          <input type="number" min={1} max={100} {...champ("occupation")} />
        </label>
        <div>
          <button type="button" className="lien-bouton" onClick={() => setV(DEFAUT)}>
            Revenir à l'exemple
          </button>
        </div>
      </section>

      <div className="resultat" aria-live="polite">
        <p className={styles.grand}>{factures > 0 ? euros(Math.ceil(tjm)) : "Impossible"}</p>
        <p className={styles.sousTitre}>TJM minimum hors taxes pour atteindre votre objectif</p>

        <table className={styles.detail}>
          <tbody>
            <tr>
              <td>Revenu net visé + frais</td>
              <td>{euros(revenu + frais)}</td>
            </tr>
            <tr>
              <td>Prélèvements estimés ({pourcent(taux * 100, 0)} du chiffre d'affaires)</td>
              <td>{euros(caNecessaire - revenu - frais)}</td>
            </tr>
            <tr className={styles.total}>
              <td>Chiffre d'affaires annuel nécessaire</td>
              <td>{euros(caNecessaire)}</td>
            </tr>
            <tr>
              <td>Jours ouvrés dans l'année</td>
              <td>{JOURS_OUVRES_AN}</td>
            </tr>
            <tr>
              <td>Jours disponibles (après congés, fériés, non facturables)</td>
              <td>{nombre(disponibles, 0)}</td>
            </tr>
            <tr className={styles.total}>
              <td>Jours facturés (× {pourcent(occupation * 100, 0)})</td>
              <td>{nombre(factures, 0)}</td>
            </tr>
          </tbody>
        </table>

        <h3 className={styles.titre}>Si votre taux d'occupation change</h3>
        <table className={styles.detail}>
          <thead>
            <tr>
              <th>Occupation</th>
              <th>Jours facturés</th>
              <th>TJM nécessaire</th>
            </tr>
          </thead>
          <tbody>
            {[50, 60, 70, 80, 90, 100].map((o) => (
              <tr key={o} className={Math.round(occupation * 100) === o ? styles.actif : ""}>
                <td>{o} %</td>
                <td>{nombre((disponibles * o) / 100, 0)}</td>
                <td>{disponibles > 0 ? euros(Math.ceil(caNecessaire / ((disponibles * o) / 100))) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="discret">
          Estimation indicative, hors TVA, qui ne remplace pas l'avis d'un expert-comptable. Vos réglages restent dans ce
          navigateur.
        </p>
      </div>
    </div>
  );
}
