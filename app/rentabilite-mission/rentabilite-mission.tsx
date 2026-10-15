"use client";

// Rentabilité d'une mission : ce que la mission rapporte vraiment, une fois
// comptés les jours réellement passés (souvent plus que les jours vendus),
// les frais et la sous-traitance.

import { useStockageLocal } from "@/lib/stockage";
import { euros, lireNombre, nombre, pourcent } from "@/lib/nombres";
import styles from "@/components/calculateur.module.css";

const DEFAUT = {
  tjm: "700",
  joursVendus: "10",
  joursReels: "12",
  frais: "450",
  sousTraitance: "0",
  objectif: "600",
};

export default function RentabiliteMission() {
  const [v, setV] = useStockageLocal("rentabilite-mission", DEFAUT);
  const champ = (id: keyof typeof DEFAUT) => ({
    value: v[id],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...DEFAUT, ...v, [id]: e.target.value }),
  });

  const tjm = lireNombre(v.tjm);
  const vendus = lireNombre(v.joursVendus);
  const reels = Math.max(lireNombre(v.joursReels), 0);
  const frais = lireNombre(v.frais);
  const st = lireNombre(v.sousTraitance);
  const objectif = lireNombre(v.objectif);

  const ca = tjm * vendus;
  const marge = ca - frais - st;
  const tauxMarge = ca > 0 ? (marge / ca) * 100 : 0;
  const tjmEffectif = reels > 0 ? marge / reels : 0;
  const depassement = reels - vendus;

  const verdict =
    tjmEffectif >= objectif
      ? { classe: styles.bon, texte: "Mission rentable : votre gain par jour réellement passé atteint votre objectif." }
      : tjmEffectif >= objectif * 0.8
        ? { classe: styles.moyen, texte: "Rentabilité limite : vous êtes à moins de 20 % sous votre objectif journalier." }
        : { classe: styles.mauvais, texte: "Mission peu rentable : le gain par jour passé est nettement sous votre objectif." };

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Mission">
        <label className="champ">
          TJM vendu (€ HT)
          <input type="number" min={0} {...champ("tjm")} />
        </label>
        <label className="champ">
          Jours vendus
          <input type="number" min={0} step={0.5} {...champ("joursVendus")} />
        </label>
        <label className="champ">
          Jours réellement passés (préparation, réunions et reprises comprises)
          <input type="number" min={0} step={0.5} {...champ("joursReels")} />
        </label>
        <label className="champ">
          Frais non refacturés (€) : déplacements, matériel...
          <input type="number" min={0} {...champ("frais")} />
        </label>
        <label className="champ">
          Sous-traitance (€)
          <input type="number" min={0} {...champ("sousTraitance")} />
        </label>
        <label className="champ">
          Votre objectif de gain par jour (€)
          <input type="number" min={0} {...champ("objectif")} />
        </label>
        <div>
          <button type="button" className="lien-bouton" onClick={() => setV(DEFAUT)}>
            Revenir à l'exemple
          </button>
        </div>
      </section>

      <div className="resultat" aria-live="polite">
        <p className={styles.grand}>{euros(Math.round(tjmEffectif))}</p>
        <p className={styles.sousTitre}>gagnés par jour réellement passé (au lieu de {euros(tjm)} vendus)</p>
        <p className={`${styles.verdict} ${verdict.classe}`}>{verdict.texte}</p>

        <table className={styles.detail}>
          <tbody>
            <tr>
              <td>Chiffre d'affaires ({nombre(vendus)} j × {euros(tjm)})</td>
              <td>{euros(ca)}</td>
            </tr>
            <tr>
              <td>Frais</td>
              <td>- {euros(frais)}</td>
            </tr>
            <tr>
              <td>Sous-traitance</td>
              <td>- {euros(st)}</td>
            </tr>
            <tr className={styles.total}>
              <td>Marge</td>
              <td>{euros(marge)}</td>
            </tr>
            <tr>
              <td>Taux de marge</td>
              <td>{pourcent(tauxMarge)}</td>
            </tr>
            <tr>
              <td>Dépassement de temps</td>
              <td>
                {depassement > 0
                  ? `+ ${nombre(depassement)} j (${pourcent(vendus > 0 ? (depassement / vendus) * 100 : 0, 0)})`
                  : depassement < 0
                    ? `${nombre(depassement)} j (plus rapide que prévu)`
                    : "aucun"}
              </td>
            </tr>
          </tbody>
        </table>
        {depassement > 0 && tjm > 0 && (
          <p className="discret">
            Ce dépassement vous coûte l'équivalent de {euros(depassement * tjm)} de journées que vous auriez pu vendre
            ailleurs.
          </p>
        )}
        <p className="discret">Montants hors taxes. Vos réglages restent dans ce navigateur.</p>
      </div>
    </div>
  );
}
