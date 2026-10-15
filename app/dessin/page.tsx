import PageOutil, { metaOutil } from "@/components/page-outil";
import Dessin from "./dessin";

// C28 : Page blanche de dessin.

export const metadata = metaOutil("dessin", "Page blanche pour dessiner à la souris, au doigt ou au stylet, en plein écran. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="dessin">
      <Dessin />
    </PageOutil>
  );
}
