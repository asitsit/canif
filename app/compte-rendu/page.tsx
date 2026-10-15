import PageOutil, { metaOutil } from "@/components/page-outil";
import CompteRendu from "./compte-rendu";

// D1 : Modèle de compte rendu.

export const metadata = metaOutil("compte-rendu", "Modèle de compte rendu de réunion : présents, décisions, actions avec responsables. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="compte-rendu">
      <CompteRendu />
    </PageOutil>
  );
}
