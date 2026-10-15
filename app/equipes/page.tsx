import type { Metadata } from "next";
import EnteteOutil from "@/components/entete-outil";
import Equipes from "./equipes";

// C9 : générateur d'équipes. Tout se passe dans le navigateur.

export const metadata: Metadata = {
  title: "Générateur d'équipes",
  description: "Répartir un groupe en équipes équilibrées au hasard, par nombre d'équipes ou par taille. Gratuit, sans compte.",
};

export default function PageEquipes() {
  return (
    <article className="outil">
      <EnteteOutil slug="equipes" />
      <Equipes />
    </article>
  );
}
