"use client";

// Simulateur de prix : vendre une mission au forfait ou en régie ?
//
// - Régie : le client paie les jours réellement passés.
// - Forfait : prix fixe ; on l'estime à partir de trois scénarios (optimiste,
//   probable, pessimiste) avec la formule PERT, (optimiste + 4 × probable + pessimiste) / 6,
//   puis on ajoute une marge de risque.
// Le tableau montre ce que chaque mode rapporte selon le temps réellement passé.

import { useStockageLocal } from "@/lib/stockage";
import { euros, lireNombre, nombre } from "@/lib/nombres";
import styles from "@/components/calculateur.module.css";

const DEFAUT = { tjm: "700", optimiste: "8", probable: "10", pessimiste: "15", risque: "15" };

export default function SimulateurPrix() {
  const [v, setV] = useStockageLocal("simulateur-prix", DEFAUT);
  const champ = (id: keyof typeof DEFAUT) => ({
    value: v[id],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...DEFAUT, ...v, [id]: e.target.value }),
  });

  const tjm = lireNombre(v.tjm);
  const o = Math.max(lireNombre(v.optimiste), 0);
  const p = Math.max(lireNombre(v.probable), 0);
  const pe = Math.max(lireNombre(v.pessimiste), 0);
  const risque = Math.max(lireNombre(v.risque), 0) / 100;
  const coherent = o <= p && p <= pe && pe > 0;

  const pert = (o + 4 * p + pe) / 6;
  const forfait = Math.ceil((pert * (1 + risque) * tjm) / 50) * 50; // arrondi aux 50 € supérieurs
  const joursForfait = tjm > 0 ? forfait / tjm : 0;

  const scenarios = [
    { nom: "Optimiste", jours: o },
    { nom: "Probable", jours: p },
    { nom: "Pessimiste", jours: pe },
  ];

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Estimation">
        <label className="champ">
          Votre TJM (€ HT)
          <input type="number" min={0} {...champ("tjm")} />
        </label>
        <h2>Combien de jours, selon vous ?</h2>
        <label className="champ">
          Scénario optimiste (tout se passe bien)
          <input type="number" min={0} step={0.5} {...champ("optimiste")} />
        </label>
        <label className="champ">
          Scénario le plus probable
          <input type="number" min={0} step={0.5} {...champ("probable")} />
        </label>
        <label className="champ">
          Scénario pessimiste (imprévus, allers-retours)
          <input type="number" min={0} step={0.5} {...champ("pessimiste")} />
        </label>
        <label className="champ">
          Marge de risque sur le forfait (%)
          <input type="number" min={0} max={100} {...champ("risque")} />
        </label>
        {!coherent && <p className="note">Il faut optimiste ≤ probable ≤ pessimiste, avec au moins un jour.</p>}
      </section>

      <div className="resultat" aria-live="polite">
        {coherent && (
          <>
            <p className={styles.grand}>{euros(forfait)}</p>
            <p className={styles.sousTitre}>
              Forfait conseillé : {nombre(pert)} jours estimés (PERT) + {nombre(risque * 100, 0)} % de marge de risque,
              soit l'équivalent de {nombre(joursForfait)} jours.
            </p>

            <h3 className={styles.titre}>Ce que vous gagnez selon le temps réellement passé</h3>
            <table className={styles.detail}>
              <thead>
                <tr>
                  <th>Scénario</th>
                  <th>Régie</th>
                  <th>Forfait</th>
                  <th>Gain par jour au forfait</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s) => (
                  <tr key={s.nom}>
                    <td>
                      {s.nom} ({nombre(s.jours)} j)
                    </td>
                    <td>{euros(s.jours * tjm)}</td>
                    <td>{euros(forfait)}</td>
                    <td className={s.jours > 0 && forfait / s.jours < tjm ? styles.mauvais : styles.bon}>
                      {s.jours > 0 ? euros(Math.round(forfait / s.jours)) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 className={styles.titre}>Comment choisir</h3>
            <ul>
              <li>
                <strong>Régie</strong> : vous ne prenez aucun risque sur le temps, mais le client voit chaque jour passer.
                Adaptée quand le périmètre est flou.
              </li>
              <li>
                <strong>Forfait</strong> : le client connaît le prix d'avance ; vous gagnez plus si vous allez vite et
                perdez si la mission déborde. Adapté quand le périmètre est clair et écrit.
              </li>
              <li>
                Écart entre optimiste et pessimiste : {nombre(pe - o)} jours.{" "}
                {pe > o * 1.5 ? "Incertitude forte : la régie, ou un forfait par étapes, est plus prudente." : "Incertitude modérée : un forfait est envisageable."}
              </li>
            </ul>
          </>
        )}
        <p className="discret">Montants hors taxes. Vos réglages restent dans ce navigateur.</p>
      </div>
    </div>
  );
}
