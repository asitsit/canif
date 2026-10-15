"use client";

// Bouton qui copie un texte dans le presse-papiers, avec confirmation « Copié ! ».

import { useState } from "react";

export default function BoutonCopier({ texte, libelle = "Copier le résultat" }: { texte: string; libelle?: string }) {
  const [etat, setEtat] = useState<"" | "ok" | "erreur">("");

  async function copier() {
    try {
      await navigator.clipboard.writeText(texte);
      setEtat("ok");
    } catch {
      setEtat("erreur"); // refus du navigateur (page non sécurisée, permission...)
    }
    setTimeout(() => setEtat(""), 2000);
  }

  return (
    <button type="button" className="bouton" onClick={copier} aria-live="polite">
      {etat === "ok" ? "Copié !" : etat === "erreur" ? "Copie impossible" : libelle}
    </button>
  );
}
