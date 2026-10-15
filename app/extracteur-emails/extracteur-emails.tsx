"use client";

// Extracteur d'adresses e-mail : retrouve toutes les adresses dans un texte
// (signature, export de tableur, fil de discussion...), sans doublons.

import { useState } from "react";
import BoutonCopier from "@/components/bouton-copier";

// Forme habituelle d'une adresse e-mail (volontairement simple : elle couvre les
// adresses courantes, pas tous les cas exotiques autorisés par la norme).
const MOTIF = /[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/gi;

const SEPARATEURS = { ligne: "\n", virgule: ", ", "point-virgule": "; " } as const;

export default function ExtracteurEmails() {
  const [texte, setTexte] = useState("");
  const [separateur, setSeparateur] = useState<keyof typeof SEPARATEURS>("ligne");
  const [trier, setTrier] = useState(false);
  const [domaine, setDomaine] = useState("");

  // Sans doublons (sans tenir compte des majuscules), dans l'ordre d'apparition.
  const vues = new Set<string>();
  let adresses: string[] = [];
  for (const a of texte.match(MOTIF) ?? []) {
    const cle = a.toLowerCase();
    if (!vues.has(cle)) {
      vues.add(cle);
      adresses.push(a.replace(/\.$/, ""));
    }
  }
  const nbTrouvees = adresses.length;
  // Filtre par domaine : « exemple.fr » garde aussi les sous-domaines (« paris.exemple.fr »).
  const filtre = domaine.trim().toLowerCase().replace(/^@/, "");
  if (filtre) {
    adresses = adresses.filter((a) => {
      const d = a.toLowerCase().split("@")[1];
      return d === filtre || d.endsWith("." + filtre);
    });
  }
  if (trier) adresses = [...adresses].sort((a, b) => a.localeCompare(b, "fr"));
  const resultat = adresses.join(SEPARATEURS[separateur]);

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Texte">
        <label className="champ">
          Collez le texte qui contient les adresses
          <textarea rows={14} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Par exemple un fil d'e-mails, une liste exportée, des signatures..." />
        </label>
        <label className="champ">
          Séparer les adresses par
          <select value={separateur} onChange={(e) => setSeparateur(e.target.value as keyof typeof SEPARATEURS)}>
            <option value="ligne">un retour à la ligne</option>
            <option value="virgule">une virgule</option>
            <option value="point-virgule">un point-virgule (Outlook)</option>
          </select>
        </label>
        <label className="champ">
          Garder seulement un domaine (facultatif)
          <input type="text" value={domaine} onChange={(e) => setDomaine(e.target.value)} placeholder="exemple.fr" />
        </label>
        <label className="option">
          <input type="checkbox" checked={trier} onChange={(e) => setTrier(e.target.checked)} />
          Trier par ordre alphabétique
        </label>
      </section>

      <div className="resultat">
        <p aria-live="polite">
          <strong>{adresses.length}</strong> adresse{adresses.length > 1 ? "s" : ""}
          {domaine.trim() && nbTrouvees !== adresses.length ? ` (sur ${nbTrouvees} trouvées)` : ""}, sans doublons.
        </p>
        <label className="champ">
          Résultat
          <textarea rows={12} readOnly value={resultat} />
        </label>
        <div className="commandes">
          <BoutonCopier texte={resultat} libelle="Copier les adresses" />
        </div>
        <p className="discret">
          Le texte est analysé dans votre navigateur et n'est envoyé nulle part. Pensez au RGPD : n'utilisez ces
          adresses que pour des personnes qui l'acceptent.
        </p>
      </div>
    </div>
  );
}
