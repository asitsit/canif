import PageOutil, { metaOutil } from "@/components/page-outil";
import DecisionPonderee from "./decision-ponderee";

// E4 : Matrice de décision pondérée.

export const metadata = metaOutil("decision-ponderee", "Matrice de décision pondérée : comparer des options sur des critères avec des poids. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="decision-ponderee">
      <DecisionPonderee />
    </PageOutil>
  );
}
