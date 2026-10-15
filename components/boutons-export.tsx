"use client";

// Boutons d'export communs (D5) : télécharger une zone de la page en image PNG,
// ou l'imprimer (et donc l'enregistrer en PDF via la fenêtre d'impression).
// À l'impression, les menus, réglages et boutons sont masqués (voir globals.css).

import { type RefObject, useState } from "react";

type Props = {
  cible: RefObject<HTMLElement | null>; // zone à exporter en image
  nomFichier: string; // sans extension, par exemple "matrice-eisenhower"
};

export default function BoutonsExport({ cible, nomFichier }: Props) {
  const [etat, setEtat] = useState<"" | "en-cours" | "erreur">("");

  async function telechargerImage() {
    if (!cible.current) return;
    setEtat("en-cours");
    try {
      // Bibliothèque chargée seulement au moment du clic (page plus légère).
      const { toPng } = await import("html-to-image");
      const donnees = await toPng(cible.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2, // image nette, y compris en projection
        filter: (noeud) => !(noeud instanceof HTMLElement && noeud.classList.contains("pas-exporter")),
      });
      const lien = document.createElement("a");
      lien.href = donnees;
      lien.download = `${nomFichier}.png`;
      lien.click();
      setEtat("");
    } catch {
      setEtat("erreur");
    }
  }

  return (
    <>
      <button type="button" className="bouton" onClick={telechargerImage} disabled={etat === "en-cours"}>
        {etat === "en-cours" ? "Préparation..." : etat === "erreur" ? "Image impossible, réessayer" : "Télécharger en image"}
      </button>
      <button type="button" className="bouton" onClick={() => window.print()}>
        Imprimer ou PDF
      </button>
    </>
  );
}
