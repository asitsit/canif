import PageOutil, { metaOutil } from "@/components/page-outil";
import TexteDeTest from "./texte-de-test";

// G7 : Générateur de texte de test.

export const metadata = metaOutil("texte-de-test", "Générer du faux texte (Lorem ipsum ou faux français) pour une maquette. Gratuit, sans compte.");

export default function Page() {
  return (
    <PageOutil slug="texte-de-test">
      <TexteDeTest />
    </PageOutil>
  );
}
