import PageOutil, { metaOutil } from "@/components/page-outil";
import Roadmap from "./roadmap";

// E11 : Roadmap simple.

export const metadata = metaOutil("roadmap", "Roadmap simple : thèmes, périodes et éléments avec statut, export image. Gratuit, sans compte.");

export default function Page() {
  return (
    <PageOutil slug="roadmap">
      <Roadmap />
    </PageOutil>
  );
}
