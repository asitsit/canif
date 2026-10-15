import type { Metadata } from "next";
import EnteteOutil from "@/components/entete-outil";
import ChronoParole from "./chrono-parole";

// C3 : chronomètre de parole (vert, orange, rouge). Tout se passe dans le navigateur.

export const metadata: Metadata = {
  title: "Chronomètre de parole",
  description: "Temps de parole avec feu vert, orange, rouge, lisible de loin. Gratuit, sans compte.",
};

export default function PageChronoParole() {
  return (
    <article className="outil">
      <EnteteOutil slug="chrono-parole" />
      <ChronoParole />
    </article>
  );
}
