import PageOutil, { metaOutil } from "@/components/page-outil";
import CompresseurImages from "./compresseur-images";

// C32 : Compresseur et redimensionneur d'images.

export const metadata = metaOutil("compresseur-images", "Compresser et redimensionner des images dans le navigateur, sans envoi. Gratuit, sans compte.");

export default function Page() {
  return (
    <PageOutil slug="compresseur-images">
      <CompresseurImages />
    </PageOutil>
  );
}
