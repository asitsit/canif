import PageOutil, { metaOutil } from "@/components/page-outil";
import QrCode from "./qr-code";

// A1 : Générateur de QR code.

export const metadata = metaOutil("qr-code", "Générer un QR code (lien, Wi-Fi, e-mail, téléphone) avec couleurs et logo, en PNG ou SVG.");

export default function Page() {
  return (
    <PageOutil slug="qr-code">
      <QrCode />
    </PageOutil>
  );
}
