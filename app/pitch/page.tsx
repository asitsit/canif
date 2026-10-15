import PageOutil, { metaOutil } from "@/components/page-outil";
import Pitch from "./pitch";

// F5 : Canevas de pitch de 2 minutes.

export const metadata = metaOutil("pitch", "Construire un pitch de 2 minutes en six étapes, avec durée estimée à l'oral. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="pitch">
      <Pitch />
    </PageOutil>
  );
}
