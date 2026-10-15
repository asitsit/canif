"use client";

// Liste des outils de la page d'accueil, avec recherche par mots-clés
// et filtre « seulement les outils en ligne ».

import Link from "next/link";
import { useState } from "react";
import { rubriques, type Outil, type Rubrique } from "@/lib/catalogue";

// Met un texte en minuscules sans accents, pour comparer « équipe » et « EQUIPE ».
function normaliser(texte: string) {
  return texte.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Un outil correspond si CHAQUE mot recherché apparaît quelque part dans sa fiche.
function correspond(outil: Outil, rubrique: Rubrique, mots: string[]) {
  const fiche = normaliser(
    [outil.nom, outil.detail, outil.code, outil.motsCles, rubrique.titre, outil.memoire ? "direct partage" : ""].join(" "),
  );
  return mots.every((mot) => fiche.includes(mot));
}

export default function CatalogueFiltrable() {
  const [recherche, setRecherche] = useState("");
  const [enLigneSeulement, setEnLigneSeulement] = useState(false);

  const mots = normaliser(recherche).split(/\s+/).filter(Boolean);
  const filtre = mots.length > 0 || enLigneSeulement;

  const resultats = rubriques
    .map((rubrique) => ({
      ...rubrique,
      outils: rubrique.outils.filter(
        (o) => (!enLigneSeulement || o.pret) && (mots.length === 0 || correspond(o, rubrique, mots)),
      ),
    }))
    .filter((r) => r.outils.length > 0);

  const total = resultats.reduce((n, r) => n + r.outils.length, 0);

  return (
    <>
      <div className="recherche" role="search">
        <label className="champ">
          Rechercher un outil
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Par exemple : minuteur, hasard, équipes, vote..."
            autoComplete="off"
          />
        </label>
        <label className="option">
          <input type="checkbox" checked={enLigneSeulement} onChange={(e) => setEnLigneSeulement(e.target.checked)} />
          Seulement les outils en ligne
        </label>
        {filtre && (
          <p className="discret" aria-live="polite">
            {total === 0 ? "Aucun outil trouvé." : `${total} outil${total > 1 ? "s" : ""} trouvé${total > 1 ? "s" : ""}.`}
          </p>
        )}
      </div>

      {!filtre && (
        <nav className="sommaire" aria-label="Rubriques">
          {rubriques.map((r) => (
            <a key={r.id} href={`#${r.id}`}>
              {r.titre}
            </a>
          ))}
        </nav>
      )}

      {resultats.map((rubrique) => (
        <section key={rubrique.id} id={rubrique.id} className="rubrique">
          <h2>{rubrique.titre}</h2>
          <p className="discret">{rubrique.description}</p>

          <ul className="grille">
            {rubrique.outils.map((outil) => (
              <li key={outil.code}>
                <Link href={`/${outil.slug}`} className={`carte ${outil.pret ? "carte-en-ligne" : ""}`}>
                  <span className="carte-nom">{outil.nom}</span>
                  {outil.detail && <span className="carte-detail">{outil.detail}</span>}
                  <span className="carte-etiquettes">
                    {outil.pret ? (
                      <span className="etiquette etiquette-en-ligne">
                        <span className="pastille" aria-hidden="true" /> En ligne
                      </span>
                    ) : (
                      <span className="etiquette">Bientôt</span>
                    )}
                    {outil.memoire && <span className="etiquette etiquette-direct">En direct</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
