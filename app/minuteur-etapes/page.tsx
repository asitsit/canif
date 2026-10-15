import type { Metadata } from "next";
import EnteteOutil from "@/components/entete-outil";
import MinuteurEtapes from "./minuteur-etapes";

// C2 : minuteur d'étapes enchaînées. Tout se passe dans le navigateur.

export const metadata: Metadata = {
  title: "Minuteur d'étapes enchaînées",
  description: "Déroulé d'atelier minuté : les étapes s'enchaînent, avec l'heure de fin prévue. Gratuit, sans compte.",
};

export default function PageMinuteurEtapes() {
  return (
    <article className="outil">
      <EnteteOutil slug="minuteur-etapes" />
      <MinuteurEtapes />
    </article>
  );
}
