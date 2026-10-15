import PageOutil, { metaOutil } from "@/components/page-outil";
import RentabiliteMission from "./rentabilite-mission";

// F2 : Rentabilité de mission.

export const metadata = metaOutil("rentabilite-mission", "Mesurer la rentabilité réelle d'une mission : gain par jour réellement passé, marge, dépassement.");

export default function Page() {
  return (
    <PageOutil slug="rentabilite-mission">
      <RentabiliteMission />
    </PageOutil>
  );
}
