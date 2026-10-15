import PageOutil, { metaOutil } from "@/components/page-outil";
import SelectionMission from "./selection-mission";

// E5 : Matrice de sélection de mission.

export const metadata = metaOutil("selection-mission", "Évaluer une mission avant de l'accepter : critères pondérés et verdict Go / À discuter / Non.");

export default function Page() {
  return (
    <PageOutil slug="selection-mission">
      <SelectionMission />
    </PageOutil>
  );
}
