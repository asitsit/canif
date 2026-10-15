import PageOutil, { metaOutil } from "@/components/page-outil";
import BriseGlace from "./brise-glace";

// B1 : Question brise-glace.

export const metadata = metaOutil("brise-glace", "Tirer une question brise-glace selon l'intention : faire connaissance, détendre, météo, clôturer.");

export default function Page() {
  return (
    <PageOutil slug="brise-glace">
      <BriseGlace />
    </PageOutil>
  );
}
