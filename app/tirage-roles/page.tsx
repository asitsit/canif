import type { Metadata } from "next";
import EnteteOutil from "@/components/entete-outil";
import TirageRoles from "./tirage-roles";

// C15 : tirage de rôles. Tout se passe dans le navigateur.

export const metadata: Metadata = {
  title: "Tirage de rôles",
  description: "Attribuer des rôles au hasard aux participants d'une réunion ou d'un atelier. Gratuit, sans compte.",
};

export default function PageTirageRoles() {
  return (
    <article className="outil">
      <EnteteOutil slug="tirage-roles" />
      <TirageRoles />
    </article>
  );
}
