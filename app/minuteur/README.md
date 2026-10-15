# C1 : Minuteur

Compte à rebours lisible en projection. Adresse : `/minuteur`.

- Durées en un clic (1 à 20 min) ou saisie libre (jusqu'à 10 heures).
- Démarrer, pause, reprendre, +1 min, remise à zéro.
- Plein écran (indisponible sur iPhone, le bouton est alors masqué).
- Fin : chiffres rouges clignotants, trois bips (désactivables), « Temps écoulé ! » dans l'onglet.
- Raccourcis : Espace, R, F.
- Aucune donnée envoyée au serveur.

Fonctionnement : le minuteur retient l'heure de fin et recalcule le temps restant 4 fois par seconde. Il reste donc juste même si l'onglet est en arrière-plan. En revanche, dans un onglet en arrière-plan, le son peut arriver avec un peu de retard (les navigateurs ralentissent ces onglets).

Fichiers : `page.tsx` (page et titre), `minuteur.tsx` (logique et affichage), `minuteur.module.css` (styles).
