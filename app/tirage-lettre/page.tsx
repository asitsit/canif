import PageOutil, { metaOutil } from "@/components/page-outil";
import TirageLettre from "./tirage-lettre";

// B7 : Tirage de lettre ou de thème.

export const metadata = metaOutil("tirage-lettre", "Tirer une lettre, un thème ou les deux au hasard (petit bac, jeux de mots). Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="tirage-lettre">
      <TirageLettre />
    </PageOutil>
  );
}
