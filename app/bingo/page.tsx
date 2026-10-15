import PageOutil, { metaOutil } from "@/components/page-outil";
import Bingo from "./bingo";

// B2 : Bingo d'atelier imprimable.

export const metadata = metaOutil("bingo", "Créer des grilles de bingo d'atelier « Trouvez quelqu'un qui... », toutes différentes, à imprimer.");

export default function Page() {
  return (
    <PageOutil slug="bingo">
      <Bingo />
    </PageOutil>
  );
}
