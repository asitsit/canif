import PageOutil, { metaOutil } from "@/components/page-outil";
import MotsCroises from "./mots-croises";

// B9 : Mots croisés.

export const metadata = metaOutil("mots-croises", "Générer une grille de mots croisés imprimable à partir de mots et de définitions. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="mots-croises">
      <MotsCroises />
    </PageOutil>
  );
}
