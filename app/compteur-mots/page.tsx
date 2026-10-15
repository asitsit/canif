import PageOutil, { metaOutil } from "@/components/page-outil";
import CompteurMots from "./compteur-mots";

// G1 : Compteur de mots et de caractères.

export const metadata = metaOutil("compteur-mots", "Compter les mots, caractères, phrases, avec temps de lecture et de parole estimés. Gratuit, sans compte.");

export default function Page() {
  return (
    <PageOutil slug="compteur-mots">
      <CompteurMots />
    </PageOutil>
  );
}
