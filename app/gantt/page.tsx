import PageOutil, { metaOutil } from "@/components/page-outil";
import Gantt from "./gantt";

// E12 : Gantt simple.

export const metadata = metaOutil("gantt", "Diagramme de Gantt simple en ligne : tâches, jalons, frise datée, export image. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="gantt">
      <Gantt />
    </PageOutil>
  );
}
