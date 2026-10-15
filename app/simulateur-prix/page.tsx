import PageOutil, { metaOutil } from "@/components/page-outil";
import SimulateurPrix from "./simulateur-prix";

// F3 : Simulateur de prix.

export const metadata = metaOutil("simulateur-prix", "Comparer forfait et régie pour une mission, avec estimation à trois scénarios (PERT). Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="simulateur-prix">
      <SimulateurPrix />
    </PageOutil>
  );
}
