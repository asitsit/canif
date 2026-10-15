import PageOutil, { metaOutil } from "@/components/page-outil";
import Ishikawa from "./ishikawa";

// E9 : Diagramme d'Ishikawa.

export const metadata = metaOutil("ishikawa", "Diagramme d'Ishikawa (6 M) pour analyser les causes d'un problème. Gratuit, sans compte.");

export default function Page() {
  return (
    <PageOutil slug="ishikawa">
      <Ishikawa />
    </PageOutil>
  );
}
