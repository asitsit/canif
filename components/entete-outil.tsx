import Link from "next/link";
import { notFound } from "next/navigation";
import { trouverOutil } from "@/lib/catalogue";

// En-tête commun à toutes les pages d'outil : fil d'Ariane, nom, précision.
// Les informations viennent du catalogue (lib/catalogue.ts), à partir de l'adresse.

export default function EnteteOutil({ slug }: { slug: string }) {
  const trouve = trouverOutil(slug);
  if (!trouve) notFound();

  const { outil, rubrique } = trouve;

  return (
    <header className="entete-outil">
      <p className="fil">
        <Link href="/">Accueil</Link> / <Link href={`/#${rubrique.id}`}>{rubrique.titre}</Link>
      </p>
      <h1>{outil.nom}</h1>
      {outil.detail && <p className="discret">{outil.detail}</p>}
    </header>
  );
}
