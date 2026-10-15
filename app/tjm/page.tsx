import PageOutil, { metaOutil } from "@/components/page-outil";
import Tjm from "./tjm";

// F1 : Calculateur de TJM.

export const metadata = metaOutil("tjm", "Calculer son TJM d'indépendant à partir du revenu visé, des frais et des jours facturables. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="tjm">
      <Tjm />
    </PageOutil>
  );
}
