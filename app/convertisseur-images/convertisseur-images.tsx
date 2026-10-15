"use client";

// Convertisseur d'images (PNG, JPG, WebP) : réglages par défaut orientés « format »
// (taille d'origine, qualité 90 %). Moteur commun : components/traitement-images.tsx.

import TraitementImages from "@/components/traitement-images";

export default function ConvertisseurImages() {
  return <TraitementImages mode="convertir" />;
}
