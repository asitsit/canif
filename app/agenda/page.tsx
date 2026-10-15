import PageOutil, { metaOutil } from "@/components/page-outil";
import Agenda from "./agenda";

// A3 : Générateur d'agenda.

export const metadata = metaOutil("agenda", "Générer l'agenda d'un atelier avec les horaires calculés à partir des durées. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="agenda">
      <Agenda />
    </PageOutil>
  );
}
