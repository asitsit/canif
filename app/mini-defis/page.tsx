import PageOutil, { metaOutil } from "@/components/page-outil";
import MiniDefis from "./mini-defis";

// B6 : Mini-défis énergisants.

export const metadata = metaOutil("mini-defis", "Tirer un mini-défi énergisant pour relancer un groupe : bouger, réfléchir vite, coopérer, se poser.");

export default function Page() {
  return (
    <PageOutil slug="mini-defis">
      <MiniDefis />
    </PageOutil>
  );
}
