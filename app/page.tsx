import CatalogueFiltrable from "@/components/catalogue-filtrable";
import { tousLesOutils } from "@/lib/catalogue";

// Page d'accueil : la liste de tous les outils, classés par moment de l'atelier,
// avec une recherche par mots-clés.

export default function Accueil() {
  const enLigne = tousLesOutils.filter((o) => o.pret).length;

  return (
    <>
      <section className="intro">
        <h1>Tout pour préparer, animer et restituer un atelier</h1>
        <p>
          {tousLesOutils.length} outils gratuits, dans un seul onglet. Les participants rejoignent avec un lien,
          sans créer de compte.
        </p>
        <p className="discret">
          <span className="etiquette etiquette-en-ligne">
            <span className="pastille" aria-hidden="true" /> {enLigne} en ligne
          </span>{" "}
          Les autres arrivent au fur et à mesure.
        </p>
      </section>

      <CatalogueFiltrable />
    </>
  );
}
