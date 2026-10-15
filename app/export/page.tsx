import PageOutil, { metaOutil } from "@/components/page-outil";
import Export from "./export";

// D5 : Export en image ou PDF.

export const metadata = metaOutil("export", "Exporter en image ou PDF : outils concernés, et mise en page d'un texte à imprimer.");

export default function Page() {
  return (
    <PageOutil slug="export">
      <Export />
    </PageOutil>
  );
}
