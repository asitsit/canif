import PageOutil, { metaOutil } from "@/components/page-outil";
import FondVisio from "./fond-visio";

// A8 : Fond de visio personnalisé.

export const metadata = metaOutil("fond-visio", "Créer un fond de visio personnalisé (1920 × 1080) avec nom, fonction et logo. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="fond-visio">
      <FondVisio />
    </PageOutil>
  );
}
