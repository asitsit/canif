import type { Metadata } from "next";
import EnteteOutil from "@/components/entete-outil";
import EquipesParametres from "./equipes-parametres";

// C10 : équipes avec paramètres (service, niveau, site). Tout se passe dans le navigateur.

export const metadata: Metadata = {
  title: "Équipes avec paramètres",
  description: "Former des équipes mixtes ou homogènes selon des critères (service, site, niveau). Gratuit, sans compte.",
};

export default function PageEquipesParametres() {
  return (
    <article className="outil">
      <EnteteOutil slug="equipes-parametres" />
      <EquipesParametres />
    </article>
  );
}
