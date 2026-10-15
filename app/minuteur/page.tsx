import type { Metadata } from "next";
import EnteteOutil from "@/components/entete-outil";
import Minuteur from "./minuteur";

// C1 : minuteur / compte à rebours. Tout se passe dans le navigateur.

export const metadata: Metadata = {
  title: "Minuteur",
  description: "Compte à rebours gratuit, lisible en projection, avec signal de fin. Sans compte.",
};

export default function PageMinuteur() {
  return (
    <article className="outil">
      <EnteteOutil slug="minuteur" />
      <Minuteur />
    </article>
  );
}
