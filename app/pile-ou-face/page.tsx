import type { Metadata } from "next";
import EnteteOutil from "@/components/entete-outil";
import PileOuFace from "./pile-ou-face";

// C13 : pile ou face. Tout se passe dans le navigateur.

export const metadata: Metadata = {
  title: "Pile ou face",
  description: "Lancer une pièce en ligne, tirage équitable, historique des lancers. Gratuit, sans compte.",
};

export default function PagePileOuFace() {
  return (
    <article className="outil">
      <EnteteOutil slug="pile-ou-face" />
      <PileOuFace />
    </article>
  );
}
