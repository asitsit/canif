import PageOutil, { metaOutil } from "@/components/page-outil";
import Listes from "./listes";

// G6 : Traitement de listes.

export const metadata = metaOutil("listes", "Trier une liste, retirer les doublons, changer les majuscules, numéroter. Gratuit, sans compte.");

export default function Page() {
  return (
    <PageOutil slug="listes">
      <Listes />
    </PageOutil>
  );
}
