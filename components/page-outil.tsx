import type { Metadata } from "next";
import EnteteOutil from "@/components/entete-outil";
import { trouverOutil } from "@/lib/catalogue";

// Modèle de page commun aux outils : titre de l'onglet tiré du catalogue,
// en-tête (fil d'Ariane, nom), puis le contenu de l'outil.

export function metaOutil(slug: string, description: string): Metadata {
  return { title: trouverOutil(slug)?.outil.nom ?? "Outil", description };
}

export default function PageOutil({ slug, children }: { slug: string; children: React.ReactNode }) {
  return (
    <article className="outil">
      <EnteteOutil slug={slug} />
      {children}
    </article>
  );
}
