import PageOutil, { metaOutil } from "@/components/page-outil";
import Invitation from "./invitation";

// A7 : Message d'invitation.

export const metadata = metaOutil("invitation", "Rédiger un message d'invitation à un atelier ou une réunion, prêt à envoyer. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="invitation">
      <Invitation />
    </PageOutil>
  );
}
