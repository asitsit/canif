import PageOutil, { metaOutil } from "@/components/page-outil";
import JoursOuvres from "./jours-ouvres";

// G8 : Jours ouvrés entre deux dates.

export const metadata = metaOutil("jours-ouvres", "Compter les jours ouvrés entre deux dates, jours fériés français inclus, ou ajouter des jours ouvrés. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="jours-ouvres">
      <JoursOuvres />
    </PageOutil>
  );
}
