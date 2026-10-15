"use client";

// Liste de noms partagée par les outils de tirage (roue, équipes, ordre, rôles).
// Elle est gardée dans le navigateur : saisie une fois, elle est retrouvée
// dans les autres outils et lors de la prochaine visite. Rien n'est envoyé.

import { useEffect, useState } from "react";
import { lireListe } from "@/lib/hasard";

const CLE_STOCKAGE = "canif.noms";

export const NOMS_EXEMPLE = "Jacques\nSophie\nKarim\nLéa\nThomas\nInès\nHugo\nNadia";

// Renvoie le texte saisi, la fonction pour le modifier et la liste des noms.
export function useListeNoms() {
  const [texte, setTexte] = useState(NOMS_EXEMPLE);

  useEffect(() => {
    try {
      const sauvegarde = localStorage.getItem(CLE_STOCKAGE);
      if (sauvegarde !== null) setTexte(sauvegarde);
    } catch {
      // stockage indisponible (navigation privée...) : on garde l'exemple
    }
  }, []);

  function modifier(valeur: string) {
    setTexte(valeur);
    try {
      localStorage.setItem(CLE_STOCKAGE, valeur);
    } catch {
      // sans gravité
    }
  }

  return { texte, modifier, noms: lireListe(texte) };
}

type Props = {
  texte: string;
  onChange: (valeur: string) => void;
  nombre: number; // nombre de noms lus, affiché sous le champ
  libelle?: string;
};

// Champ de saisie des noms, un par ligne.
export default function ChampNoms({ texte, onChange, nombre, libelle = "Participants, un nom par ligne" }: Props) {
  return (
    <div className="champ-liste">
      <label className="champ">
        {libelle}
        <textarea
          rows={Math.max(5, Math.min(nombre + 1, 12))}
          value={texte}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
      </label>
      <p className="discret">
        {nombre} nom{nombre > 1 ? "s" : ""}. La liste est gardée dans ce navigateur et partagée entre les outils de
        tirage.{" "}
        {texte && (
          <button type="button" className="lien-bouton" onClick={() => onChange("")}>
            Vider la liste
          </button>
        )}
      </p>
    </div>
  );
}
