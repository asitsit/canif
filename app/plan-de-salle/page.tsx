import PageOutil, { metaOutil } from "@/components/page-outil";
import PlanDeSalle from "./plan-de-salle";

// A5 : Plan de salle.

export const metadata = metaOutil("plan-de-salle", "Dessiner un plan de salle (îlots, U, cabaret, théâtre...) et y placer les participants.");

export default function Page() {
  return (
    <PageOutil slug="plan-de-salle">
      <PlanDeSalle />
    </PageOutil>
  );
}
