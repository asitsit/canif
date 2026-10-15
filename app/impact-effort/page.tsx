import PageOutil, { metaOutil } from "@/components/page-outil";
import ImpactEffort from "./impact-effort";

// E2 : Matrice impact / effort.

export const metadata = metaOutil("impact-effort", "Matrice impact / effort pour prioriser idées et actions, avec export image. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="impact-effort">
      <ImpactEffort />
    </PageOutil>
  );
}
