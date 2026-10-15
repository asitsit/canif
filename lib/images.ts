// Traitement d'images dans le navigateur (aucun envoi) : chargement,
// redimensionnement, conversion de format, téléchargement.

export type Format = "image/jpeg" | "image/png" | "image/webp";

export const EXTENSIONS: Record<Format, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Charge un fichier image et renvoie l'élément <img> une fois décodé.
export function chargerImage(fichier: File | Blob): Promise<HTMLImageElement> {
  return new Promise((ok, erreur) => {
    const url = URL.createObjectURL(fichier);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      ok(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      erreur(new Error("Image illisible"));
    };
    img.src = url;
  });
}

// Dessine l'image dans un canevas, réduite si son plus grand côté dépasse maxCote
// (jamais agrandie). fondBlanc : pour le JPEG, qui ne gère pas la transparence.
export function dessiner(img: HTMLImageElement, maxCote: number | null, fondBlanc: boolean) {
  const ratio = maxCote ? Math.min(1, maxCote / Math.max(img.naturalWidth, img.naturalHeight)) : 1;
  const canevas = document.createElement("canvas");
  canevas.width = Math.max(1, Math.round(img.naturalWidth * ratio));
  canevas.height = Math.max(1, Math.round(img.naturalHeight * ratio));
  const ctx = canevas.getContext("2d")!;
  if (fondBlanc) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canevas.width, canevas.height);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canevas.width, canevas.height);
  return canevas;
}

export function versBlob(canevas: HTMLCanvasElement, format: Format, qualite: number): Promise<Blob> {
  return new Promise((ok, erreur) =>
    canevas.toBlob((b) => (b ? ok(b) : erreur(new Error("Conversion impossible"))), format, format === "image/png" ? undefined : qualite),
  );
}

// Déclenche le téléchargement d'un fichier.
export function telecharger(donnees: Blob | string, nom: string) {
  const url = typeof donnees === "string" ? donnees : URL.createObjectURL(donnees);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nom;
  lien.click();
  if (typeof donnees !== "string") setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// « 1,2 Mo », « 340 Ko »
export function taille(octets: number) {
  if (octets >= 1024 * 1024) return `${(octets / 1024 / 1024).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;
  return `${Math.max(1, Math.round(octets / 1024))} Ko`;
}

// Nom de fichier sans extension.
export function sansExtension(nom: string) {
  return nom.replace(/\.[^.]+$/, "");
}
