# C8 : Roue de noms

Roue de tirage au sort à projeter. Adresse : `/roue`.

- Noms saisis un par ligne (liste partagée avec les autres outils de tirage, gardée dans le navigateur).
- Le gagnant est tiré avant l'animation (générateur sécurisé du navigateur), puis la roue est calculée pour s'arrêter sur lui.
- Option « Retirer le nom tiré » : il quitte la roue au tour suivant.
- « Ordre des choix » : liste numérotée des noms tirés ; « Recommencer avec tous les noms » pour repartir.
- Couleurs : 5 palettes ou palette personnalisée (2 à 8 couleurs). Texte noir ou blanc choisi automatiquement pour rester lisible (`couleurs.ts`).
- Durée de l'animation réglable de 1 à 20 s. Réglages gardés dans le navigateur.
- Signal sonore optionnel à l'arrêt. Plein écran. Raccourcis : Espace, F.
- Animation raccourcie si le système demande moins d'animations.
- Aucune donnée envoyée au serveur.
