import PageOutil, { metaOutil } from "@/components/page-outil";
import TourDeTable from "./tour-de-table";

// A4 : Durée d'un tour de table.

export const metadata = metaOutil("tour-de-table", "Calculer la durée d'un tour de table, ou le temps de parole par personne. Gratuit, sans compte.");

export default function Page() {
  return (
    <PageOutil slug="tour-de-table">
      <TourDeTable />
    </PageOutil>
  );
}
