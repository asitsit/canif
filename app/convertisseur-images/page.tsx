import PageOutil, { metaOutil } from "@/components/page-outil";
import ConvertisseurImages from "./convertisseur-images";

// C34 : Convertisseur d'images.

export const metadata = metaOutil("convertisseur-images", "Convertir des images en PNG, JPG ou WebP dans le navigateur, sans envoi. Gratuit.");

export default function Page() {
  return (
    <PageOutil slug="convertisseur-images">
      <ConvertisseurImages />
    </PageOutil>
  );
}
