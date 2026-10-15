import type { Metadata } from "next";
import EnteteOutil from "@/components/entete-outil";
import EcranPause from "./ecran-pause";

// C4 : écran de pause projetable. Tout se passe dans le navigateur.

export const metadata: Metadata = {
  title: "Écran de pause",
  description: "Écran de pause à projeter : heure de reprise, compte à rebours et message. Gratuit, sans compte.",
};

export default function PagePause() {
  return (
    <article className="outil">
      <EnteteOutil slug="pause" />
      <EcranPause />
    </article>
  );
}
