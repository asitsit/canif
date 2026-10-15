"use client";

// Compresseur et redimensionneur d'images : réglages par défaut orientés « poids »
// (plus grand côté 1920 px, qualité 75 %). Moteur commun : components/traitement-images.tsx.

import TraitementImages from "@/components/traitement-images";

export default function CompresseurImages() {
  return <TraitementImages mode="compresser" />;
}
