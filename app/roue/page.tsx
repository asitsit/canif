import type { Metadata } from "next";
import EnteteOutil from "@/components/entete-outil";
import Roue from "./roue";

// C8 : roue de noms. Tout se passe dans le navigateur.

export const metadata: Metadata = {
  title: "Roue de noms",
  description: "Roue de tirage au sort à projeter : saisissez les noms, faites tourner. Gratuit, sans compte.",
};

export default function PageRoue() {
  return (
    <article className="outil">
      <EnteteOutil slug="roue" />
      <Roue />
    </article>
  );
}
