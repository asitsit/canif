import PageOutil, { metaOutil } from "@/components/page-outil";
import ExtracteurEmails from "./extracteur-emails";

// G5 : Extracteur d'adresses e-mail.

export const metadata = metaOutil("extracteur-emails", "Extraire toutes les adresses e-mail d'un texte, sans doublons, prêtes à coller. Gratuit, sans compte.");

export default function Page() {
  return (
    <PageOutil slug="extracteur-emails">
      <ExtracteurEmails />
    </PageOutil>
  );
}
