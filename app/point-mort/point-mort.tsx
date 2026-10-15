"use client";

// Point mort (seuil de rentabilité) : le chiffre d'affaires à partir duquel les
// ventes couvrent toutes les charges.
//   marge sur coût variable par vente = prix - coût variable
//   nombre de ventes au point mort = charges fixes / marge par vente
//   date du point mort : si le chiffre d'affaires est réparti également sur l'année

import { useStockageLocal } from "@/lib/stockage";
import { euros, lireNombre, nombre, pourcent } from "@/lib/nombres";
import styles from "@/components/calculateur.module.css";

const DEFAUT = { fixes: "30000", prix: "700", variable: "50", unite: "jour", caPrevu: "90000" };

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export default function PointMort() {
  const [v, setV] = useStockageLocal("point-mort", DEFAUT);
  const champ = (id: keyof typeof DEFAUT) => ({
    value: v[id],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV({ ...DEFAUT, ...v, [id]: e.target.value }),
  });

  const fixes = lireNombre(v.fixes);
  const prix = lireNombre(v.prix);
  const variable = lireNombre(v.variable);
  const caPrevu = lireNombre(v.caPrevu);
  const margeUnitaire = prix - variable;
  const tauxMarge = prix > 0 ? margeUnitaire / prix : 0;
  const possible = margeUnitaire > 0;
  const quantite = possible ? fixes / margeUnitaire : 0;
  const caSeuil = quantite * prix;
  const unite = v.unite === "jour" ? "jours facturés" : v.unite === "vente" ? "ventes" : "prestations";

  // Date du point mort si le chiffre d'affaires prévu est réparti également sur 12 mois.
  let date = "";
  if (possible && caPrevu > 0) {
    if (caSeuil > caPrevu) date = "jamais atteint avec ce chiffre d'affaires prévu";
    else {
      const jourAnnee = (caSeuil / caPrevu) * 365;
      const d = new Date(2026, 0, 1);
      d.setDate(d.getDate() + Math.ceil(jourAnnee));
      date = `vers le ${d.getDate()} ${MOIS[d.getMonth()]}`;
    }
  }

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Données">
        <label className="champ">
          Charges fixes annuelles (€) : loyer, assurances, logiciels, votre rémunération...
          <input type="number" min={0} {...champ("fixes")} />
        </label>
        <label className="champ">
          Vous vendez
          <select {...champ("unite")}>
            <option value="jour">des jours (TJM)</option>
            <option value="vente">des produits</option>
            <option value="prestation">des prestations</option>
          </select>
        </label>
        <label className="champ">
          Prix de vente unitaire (€ HT)
          <input type="number" min={0} {...champ("prix")} />
        </label>
        <label className="champ">
          Coût variable unitaire (€) : ce que coûte chaque vente en plus
          <input type="number" min={0} {...champ("variable")} />
        </label>
        <label className="champ">
          Chiffre d'affaires prévu sur l'année (€, facultatif)
          <input type="number" min={0} {...champ("caPrevu")} />
        </label>
        <div>
          <button type="button" className="lien-bouton" onClick={() => setV(DEFAUT)}>
            Revenir à l'exemple
          </button>
        </div>
      </section>

      <div className="resultat" aria-live="polite">
        {possible ? (
          <>
            <p className={styles.grand}>{euros(Math.ceil(caSeuil))}</p>
            <p className={styles.sousTitre}>
              de chiffre d'affaires pour couvrir vos charges, soit {nombre(Math.ceil(quantite), 0)} {unite}.
            </p>
            {date && (
              <p className={`${styles.verdict} ${caSeuil > caPrevu ? styles.mauvais : styles.bon}`}>
                Point mort atteint {date}.
              </p>
            )}
            <table className={styles.detail}>
              <tbody>
                <tr>
                  <td>Marge par vente (prix - coût variable)</td>
                  <td>{euros(margeUnitaire, true)}</td>
                </tr>
                <tr>
                  <td>Taux de marge sur coût variable</td>
                  <td>{pourcent(tauxMarge * 100)}</td>
                </tr>
                <tr>
                  <td>Charges fixes à couvrir</td>
                  <td>{euros(fixes)}</td>
                </tr>
                {caPrevu > 0 && (
                  <tr className={styles.total}>
                    <td>Marge de sécurité (CA prévu - point mort)</td>
                    <td>{euros(caPrevu - caSeuil)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        ) : (
          <p className={`${styles.verdict} ${styles.mauvais}`}>
            Le coût variable dépasse le prix de vente : chaque vente fait perdre de l'argent, le point mort ne peut pas
            être atteint.
          </p>
        )}
        <p className="discret">
          Calcul indicatif, hors TVA, avec un chiffre d'affaires supposé régulier sur l'année. Vos données restent dans ce
          navigateur.
        </p>
      </div>
    </div>
  );
}
