import type { Metadata } from "next";
import EnteteOutil from "@/components/entete-outil";
import Des from "./des";

// C12 : dés personnalisables. Tout se passe dans le navigateur.

export const metadata: Metadata = {
  title: "Dés personnalisables",
  description: "Lancer un ou plusieurs dés en ligne : 4 à 100 faces, ou faces personnalisées (mots, émojis). Gratuit, sans compte.",
};

export default function PageDes() {
  return (
    <article className="outil">
      <EnteteOutil slug="des" />
      <Des />
    </article>
  );
}
