import PageOutil, { metaOutil } from "@/components/page-outil";
import Retrospective from "./retrospective";

// E10 : Rétrospective.

export const metadata = metaOutil("retrospective", "Rétrospective simple : commencer, arrêter, continuer. Sans compte, export image ou PDF.");

export default function Page() {
  return (
    <PageOutil slug="retrospective">
      <Retrospective />
    </PageOutil>
  );
}
