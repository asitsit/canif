import PageOutil, { metaOutil } from "@/components/page-outil";
import Synthese from "./synthese";

// D4 : Synthèse structurée.

export const metadata = metaOutil("synthese", "Transformer des notes en vrac en synthèse structurée, avec des règles simples et sans IA.");

export default function Page() {
  return (
    <PageOutil slug="synthese">
      <Synthese />
    </PageOutil>
  );
}
