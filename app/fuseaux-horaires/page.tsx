import PageOutil, { metaOutil } from "@/components/page-outil";
import FuseauxHoraires from "./fuseaux-horaires";

// A9 : Convertisseur de fuseaux horaires.

export const metadata = metaOutil("fuseaux-horaires", "Convertir une heure entre villes du monde, avec heures de bureau et changements d'heure. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="fuseaux-horaires">
      <FuseauxHoraires />
    </PageOutil>
  );
}
