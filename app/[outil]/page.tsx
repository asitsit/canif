import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tousLesOutils, trouverOutil } from "@/lib/catalogue";

// Page d'attente commune à tous les outils pas encore construits.
//
// Quand un outil est construit, on crée son propre dossier (par exemple
// app/minuteur/page.tsx). Next.js donne alors la priorité à ce dossier
// sur cette page générique, sans rien changer d'autre.

type Props = { params: Promise<{ outil: string }> };

// Prépare à l'avance une page pour chaque outil du catalogue.
export function generateStaticParams() {
  return tousLesOutils.map((o) => ({ outil: o.slug }));
}

// Toute adresse absente du catalogue affiche la page « introuvable ».
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { outil } = await params;
  const trouve = trouverOutil(outil);
  return { title: trouve ? trouve.outil.nom : "Outil introuvable" };
}

export default async function PageOutil({ params }: Props) {
  const { outil: slug } = await params;
  const trouve = trouverOutil(slug);
  if (!trouve) notFound();

  const { outil, rubrique } = trouve;

  return (
    <article className="page-outil">
      <p className="fil">
        <Link href="/">Accueil</Link> / <Link href={`/#${rubrique.id}`}>{rubrique.titre}</Link>
      </p>

      <h1>{outil.nom}</h1>
      {outil.detail && <p className="discret">{outil.detail}</p>}

      <div className="encadre">
        <p>
          <strong>Cet outil est en cours de construction.</strong> Il sera disponible à l'ouverture du site.
        </p>
      </div>

      {outil.memoire && (
        <div className="encadre encadre-transparence">
          <p>
            <strong>Transparence.</strong> Une fois en service, cet outil enregistrera {outil.stockage} sur nos
            serveurs, uniquement pour permettre le partage avec les participants. Ces données seront supprimées
            automatiquement, après un délai qui sera indiqué ici.
          </p>
        </div>
      )}

      <p>
        <Link href="/">Retour à tous les outils</Link>
      </p>
    </article>
  );
}
