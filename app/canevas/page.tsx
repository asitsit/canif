import PageOutil, { metaOutil } from "@/components/page-outil";
import Canevas from "./canevas";

// E3 : Canevas.

export const metadata = metaOutil("canevas", "Canevas en ligne : SWOT, persona, carte d'empathie, Business Model Canvas. Gratuit, sans compte.");

export default function Page() {
  return (
    <PageOutil slug="canevas">
      <Canevas />
    </PageOutil>
  );
}
