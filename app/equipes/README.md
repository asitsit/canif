# C9 : Générateur d'équipes

Répartition au hasard en équipes équilibrées. Adresse : `/equipes`.

- Par nombre d'équipes, ou par nombre de personnes par équipe (arrondi au nombre d'équipes le plus proche).
- Les tailles diffèrent au plus d'une personne (distribution comme des cartes après mélange). Logique dans `lib/equipes.ts`.
- Tirage 100 % aléatoire, affiché dans l'outil : ni l'ordre de la liste ni les noms n'influencent la répartition.
- Copier le résultat, plein écran. Raccourcis : Espace (refaire), F.
- Liste de noms partagée avec les autres outils de tirage. Aucune donnée envoyée au serveur.
