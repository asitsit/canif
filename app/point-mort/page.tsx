import PageOutil, { metaOutil } from "@/components/page-outil";
import PointMort from "./point-mort";

// F8 : Calcul du point mort.

export const metadata = metaOutil("point-mort", "Calculer le point mort (seuil de rentabilité) et sa date d'atteinte dans l'année. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="point-mort">
      <PointMort />
    </PageOutil>
  );
}
