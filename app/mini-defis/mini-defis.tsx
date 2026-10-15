"use client";

// Mini-défis énergisants : tirage d'un défi court, filtré par catégorie, durée
// et accessibilité (« possible assis »).

import Link from "next/link";
import { useState } from "react";
import TirageCartes from "@/components/tirage-cartes";
import { DEFIS } from "./defis";

const CATEGORIES = [...new Set(DEFIS.map((d) => d.categorie))];

export default function MiniDefis() {
  const [categories, setCategories] = useState<string[]>(CATEGORIES);
  const [assisSeulement, setAssisSeulement] = useState(false);
  const [dureeMax, setDureeMax] = useState(5);

  const cartes = DEFIS.filter((d) => categories.includes(d.categorie) && (!assisSeulement || d.assis) && d.minutes <= dureeMax).map((d) => ({
    texte: d.texte,
    etiquette: d.categorie,
    detail: `Environ ${d.minutes} min${d.assis ? " · possible assis" : ""}`,
  }));

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Filtres">
        <h2>Catégories</h2>
        {CATEGORIES.map((c) => (
          <label key={c} className="option">
            <input type="checkbox" checked={categories.includes(c)} onChange={() => setCategories((l) => (l.includes(c) ? l.filter((x) => x !== c) : [...l, c]))} />
            {c}
          </label>
        ))}
        <label className="option">
          <input type="checkbox" checked={assisSeulement} onChange={(e) => setAssisSeulement(e.target.checked)} />
          Seulement les défis possibles assis
        </label>
        <label className="champ">
          Durée maximale : {dureeMax} min
          <input type="range" min={1} max={5} value={dureeMax} onChange={(e) => setDureeMax(Number(e.target.value))} />
        </label>
        <p className="note">
          Défis rédigés pour Canif (première série, à relire). Aucun n'impose de contact ; proposez toujours de participer à sa
          façon. Pour minuter : le <Link href="/minuteur">minuteur</Link>.
        </p>
      </section>
      <TirageCartes cartes={cartes} libelleBouton="Tirer un défi" vide="Aucun défi ne correspond à ces filtres." />
    </div>
  );
}
