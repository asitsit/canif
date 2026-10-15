import PageOutil, { metaOutil } from "@/components/page-outil";
import ChecklistTechnique from "./checklist-technique";

// A2 : Checklist technique d'atelier.

export const metadata = metaOutil("checklist-technique", "Checklist technique d'atelier à cocher : salle, visio, matériel, de la veille au jour J. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="checklist-technique">
      <ChecklistTechnique />
    </PageOutil>
  );
}
