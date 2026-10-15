# C32 : Compresseur et redimensionneur d'images

Adresse : `/compresseur-images`.

- Jusqu'à 50 images à la fois ; plus grand côté (1920 px par défaut), qualité (75 % par défaut), format.
- Poids avant / après, gain en pourcentage, aperçu, téléchargement image par image ou tout d'un coup.
- Traitement dans le navigateur (canvas) : aucune image envoyée ; métadonnées des photos (lieu, appareil) non recopiées.
- Moteur commun `components/traitement-images.tsx`, fonctions dans `lib/images.ts`.
