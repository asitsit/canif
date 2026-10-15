"use client";

// Bouton « Plein écran » commun à tous les outils.
// En plein écran, il devient « Quitter le plein écran » et reste fixé en haut
// à droite : toujours visible, même si le contenu est long.

type PleinEcran = { possible: boolean; actif: boolean; basculer: () => void };

export default function BoutonPleinEcran({ pleinEcran }: { pleinEcran: PleinEcran }) {
  // Plein écran indisponible (par exemple sur iPhone) : pas de bouton.
  if (!pleinEcran.possible) return null;

  if (pleinEcran.actif) {
    return (
      <button type="button" className="bouton bouton-quitter-plein-ecran" onClick={pleinEcran.basculer}>
        Quitter le plein écran <span className="touche">Échap</span>
      </button>
    );
  }

  return (
    <button type="button" className="bouton" onClick={pleinEcran.basculer}>
      Plein écran
    </button>
  );
}
