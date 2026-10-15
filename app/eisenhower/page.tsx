import PageOutil, { metaOutil } from "@/components/page-outil";
import Eisenhower from "./eisenhower";

// E1 : Matrice d'Eisenhower.

export const metadata = metaOutil("eisenhower", "Matrice d'Eisenhower en ligne : trier ses tâches par urgence et importance. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="eisenhower">
      <Eisenhower />
    </PageOutil>
  );
}
