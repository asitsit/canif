import PageOutil, { metaOutil } from "@/components/page-outil";
import Palette from "./palette";

// C33 : Palette de couleurs.

export const metadata = metaOutil("palette", "Créer une palette de couleurs harmonieuse ou extraire les couleurs d'une image, avec contrastes.");

export default function Page() {
  return (
    <PageOutil slug="palette">
      <Palette />
    </PageOutil>
  );
}
