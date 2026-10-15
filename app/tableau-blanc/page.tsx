import PageOutil, { metaOutil } from "@/components/page-outil";
import TableauBlanc from "./tableau-blanc";

// C29 : Tableau blanc simple.

export const metadata = metaOutil("tableau-blanc", "Tableau blanc simple : rectangles, ellipses, flèches, texte et crayon, export image ou SVG.");

export default function Page() {
  return (
    <PageOutil slug="tableau-blanc">
      <TableauBlanc />
    </PageOutil>
  );
}
