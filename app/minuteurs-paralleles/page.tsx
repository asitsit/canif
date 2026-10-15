import type { Metadata } from "next";
import EnteteOutil from "@/components/entete-outil";
import MinuteursParalleles from "./minuteurs-paralleles";

// C6 : minuteurs parallèles (sous-groupes). Tout se passe dans le navigateur.

export const metadata: Metadata = {
  title: "Minuteurs parallèles",
  description: "Plusieurs comptes à rebours en même temps, un par sous-groupe, sur un seul écran. Gratuit, sans compte.",
};

export default function PageMinuteursParalleles() {
  return (
    <article className="outil">
      <EnteteOutil slug="minuteurs-paralleles" />
      <MinuteursParalleles />
    </article>
  );
}
