import PageOutil, { metaOutil } from "@/components/page-outil";
import CinqPourquoi from "./cinq-pourquoi";

// E8 : Arbre des 5 pourquoi.

export const metadata = metaOutil("cinq-pourquoi", "Méthode des 5 pourquoi pour remonter à la cause racine d'un problème. Gratuit, sans compte.");

export default function Page() {
  return (
    <PageOutil slug="cinq-pourquoi">
      <CinqPourquoi />
    </PageOutil>
  );
}
