import PageOutil, { metaOutil } from "@/components/page-outil";
import PartiesPrenantes from "./parties-prenantes";

// E7 : Cartographie des parties prenantes.

export const metadata = metaOutil("parties-prenantes", "Cartographier les parties prenantes d'un projet selon leur influence et leur intérêt. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="parties-prenantes">
      <PartiesPrenantes />
    </PageOutil>
  );
}
