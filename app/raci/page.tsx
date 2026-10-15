import PageOutil, { metaOutil } from "@/components/page-outil";
import Raci from "./raci";

// E6 : RACI.

export const metadata = metaOutil("raci", "Matrice RACI en ligne : qui réalise, approuve, est consulté ou informé. Contrôles automatiques.");

export default function Page() {
  return (
    <PageOutil slug="raci">
      <Raci />
    </PageOutil>
  );
}
