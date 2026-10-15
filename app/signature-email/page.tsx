import PageOutil, { metaOutil } from "@/components/page-outil";
import SignatureEmail from "./signature-email";

// F10 : Signature d'e-mail.

export const metadata = metaOutil("signature-email", "Créer une signature d'e-mail soignée à coller dans Gmail ou Outlook. Gratuit, sans compte.");

export default function Page() {
  return (
    <PageOutil slug="signature-email">
      <SignatureEmail />
    </PageOutil>
  );
}
