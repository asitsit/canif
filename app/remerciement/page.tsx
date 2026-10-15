import PageOutil, { metaOutil } from "@/components/page-outil";
import Remerciement from "./remerciement";

// D6 : E-mail de remerciement.

export const metadata = metaOutil("remerciement", "Rédiger l'e-mail de remerciement après un atelier : temps forts, suites, supports. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="remerciement">
      <Remerciement />
    </PageOutil>
  );
}
