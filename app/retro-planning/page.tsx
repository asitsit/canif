import PageOutil, { metaOutil } from "@/components/page-outil";
import RetroPlanning from "./retro-planning";

// E13 : Rétro-planning.

export const metadata = metaOutil("retro-planning", "Rétro-planning : partir de l'échéance et calculer quand commencer chaque étape. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="retro-planning">
      <RetroPlanning />
    </PageOutil>
  );
}
