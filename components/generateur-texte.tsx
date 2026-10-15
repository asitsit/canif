"use client";

// Générateur de texte : un formulaire à gauche, le texte produit à droite,
// prêt à copier ou à ouvrir dans la messagerie. Utilisé par les outils de
// rédaction (invitation, remerciement, compte rendu, pitch, signature...).
// Le texte produit reste modifiable avant de le copier.

import { useEffect, useState } from "react";
import BoutonCopier from "@/components/bouton-copier";
import { useStockageLocal } from "@/lib/stockage";
import styles from "./generateur-texte.module.css";

export type Champ = {
  id: string;
  libelle: string;
  type?: "texte" | "zone" | "date" | "heure" | "choix" | "nombre";
  options?: string[]; // pour le type « choix »
  defaut?: string;
  aide?: string; // texte indicatif dans le champ
};

export type Valeurs = Record<string, string>;

type Props = {
  cle: string; // clé de stockage dans le navigateur
  champs: Champ[];
  generer: (v: Valeurs) => { texte: string; objet?: string };
  courriel?: boolean; // affiche « Ouvrir dans ma messagerie »
  apercu?: (v: Valeurs) => React.ReactNode; // aperçu visuel facultatif (signature...)
};

export default function GenerateurTexte({ cle, champs, generer, courriel = false, apercu }: Props) {
  const defauts = Object.fromEntries(champs.map((c) => [c.id, c.defaut ?? ""]));
  const [valeurs, setValeurs] = useStockageLocal<Valeurs>(cle, defauts);
  const v = { ...defauts, ...valeurs };
  const produit = generer(v);
  const [texte, setTexte] = useState(produit.texte);
  const [retouche, setRetouche] = useState(false);

  // Tant que le texte n'a pas été retouché à la main, il suit le formulaire.
  useEffect(() => {
    if (!retouche) setTexte(produit.texte);
  }, [produit.texte, retouche]);

  // Modifier le formulaire ne touche pas aux retouches faites à la main dans le texte
  // (elles ne sont abandonnées que par « Annuler mes retouches »).
  function modifier(id: string, valeur: string) {
    setValeurs((anciennes) => ({ ...defauts, ...anciennes, [id]: valeur }));
  }

  const lienCourriel = `mailto:?subject=${encodeURIComponent(produit.objet ?? "")}&body=${encodeURIComponent(texte)}`;

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Informations">
        {champs.map((c) => (
          <label key={c.id} className="champ">
            {c.libelle}
            {c.type === "zone" ? (
              <textarea rows={4} value={v[c.id]} placeholder={c.aide} onChange={(e) => modifier(c.id, e.target.value)} />
            ) : c.type === "choix" ? (
              <select value={v[c.id]} onChange={(e) => modifier(c.id, e.target.value)}>
                {c.options?.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                type={c.type === "date" ? "date" : c.type === "heure" ? "time" : c.type === "nombre" ? "number" : "text"}
                value={v[c.id]}
                placeholder={c.aide}
                onChange={(e) => modifier(c.id, e.target.value)}
              />
            )}
          </label>
        ))}
        <div>
          <button
            type="button"
            className="lien-bouton"
            onClick={() => {
              setValeurs(defauts);
              setRetouche(false);
            }}
          >
            Revenir à l'exemple
          </button>
        </div>
      </section>

      <div className="resultat">
        {produit.objet !== undefined && (
          <p className={styles.objet}>
            <strong>Objet :</strong> {produit.objet}
          </p>
        )}
        {apercu && <div className={styles.apercu}>{apercu(v)}</div>}
        <label className="champ">
          Texte (modifiable)
          <textarea
            className={styles.texte}
            rows={16}
            value={texte}
            onChange={(e) => {
              setTexte(e.target.value);
              setRetouche(true);
            }}
          />
        </label>
        {retouche && (
          <p className="discret">
            Vous avez retouché le texte : il ne suit plus le formulaire.{" "}
            <button type="button" className="lien-bouton" onClick={() => setRetouche(false)}>
              Annuler mes retouches
            </button>
          </p>
        )}
        <div className="commandes">
          <BoutonCopier texte={(produit.objet ? `Objet : ${produit.objet}\n\n` : "") + texte} libelle="Copier le texte" />
          {courriel && (
            <a className="bouton" href={lienCourriel}>
              Ouvrir dans ma messagerie
            </a>
          )}
        </div>
        <p className="discret">Les informations saisies restent dans ce navigateur uniquement.</p>
      </div>
    </div>
  );
}
