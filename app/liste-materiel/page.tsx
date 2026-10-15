import PageOutil, { metaOutil } from "@/components/page-outil";
import ListeMateriel from "./liste-materiel";

// A6 : Liste de matériel à emporter.

export const metadata = metaOutil("liste-materiel", "Liste de matériel d'animation à emporter, à cocher et à compléter. Gratuit, sans compte.");

export default function Page() {
  return (
    <PageOutil slug="liste-materiel">
      <ListeMateriel />
    </PageOutil>
  );
}
