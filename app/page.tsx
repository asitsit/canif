import Link from "next/link";
import { rubriques, tousLesOutils } from "@/lib/catalogue";

// Page d'accueil : la liste de tous les outils, classés par moment de l'atelier.

export default function Accueil() {
  return (
    <>
      <section className="intro">
        <h1>Tout pour préparer, animer et restituer un atelier</h1>
        <p>
          {tousLesOutils.length} outils gratuits, dans un seul onglet. Les participants rejoignent avec un lien,
          sans créer de compte.
        </p>
      </section>

      <nav className="sommaire" aria-label="Rubriques">
        {rubriques.map((r) => (
          <a key={r.id} href={`#${r.id}`}>
            {r.titre}
          </a>
        ))}
      </nav>

      {rubriques.map((rubrique) => (
        <section key={rubrique.id} id={rubrique.id} className="rubrique">
          <h2>{rubrique.titre}</h2>
          <p className="discret">{rubrique.description}</p>

          <ul className="grille">
            {rubrique.outils.map((outil) => (
              <li key={outil.code}>
                <Link href={`/${outil.slug}`} className="carte">
                  <span className="carte-nom">{outil.nom}</span>
                  {outil.detail && <span className="carte-detail">{outil.detail}</span>}
                  <span className="carte-etiquettes">
                    {outil.memoire && <span className="etiquette etiquette-direct">En direct</span>}
                    {!outil.pret && <span className="etiquette">Bientôt</span>}
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
