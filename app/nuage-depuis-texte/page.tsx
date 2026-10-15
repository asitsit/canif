import PageOutil, { metaOutil } from "@/components/page-outil";
import NuageDepuisTexte from "./nuage-depuis-texte";

// C20 : Nuage de mots depuis un texte.

export const metadata = metaOutil("nuage-depuis-texte", "Transformer un texte en nuage de mots : les mots les plus fréquents en plus gros. Gratuit, sans compte.");

export default function Page() {
  return (
    <PageOutil slug="nuage-depuis-texte">
      <NuageDepuisTexte />
    </PageOutil>
  );
}
