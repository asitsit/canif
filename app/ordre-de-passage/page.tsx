import type { Metadata } from "next";
import EnteteOutil from "@/components/entete-outil";
import OrdreDePassage from "./ordre-de-passage";

// C11 : ordre de passage. Tout se passe dans le navigateur.

export const metadata: Metadata = {
  title: "Ordre de passage",
  description: "Tirer au sort l'ordre de passage d'un groupe, d'un coup ou nom par nom. Gratuit, sans compte.",
};

export default function PageOrdreDePassage() {
  return (
    <article className="outil">
      <EnteteOutil slug="ordre-de-passage" />
      <OrdreDePassage />
    </article>
  );
}
