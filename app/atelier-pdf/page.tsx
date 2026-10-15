import PageOutil, { metaOutil } from "@/components/page-outil";
import AtelierPdf from "./atelier-pdf";

// G4 : Atelier PDF.

export const metadata = metaOutil("atelier-pdf", "Fusionner des PDF, extraire ou pivoter des pages, convertir des images en PDF, sans envoi.");

export default function Page() {
  return (
    <PageOutil slug="atelier-pdf">
      <AtelierPdf />
    </PageOutil>
  );
}
