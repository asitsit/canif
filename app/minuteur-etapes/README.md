# C2 : Minuteur d'étapes enchaînées

Déroulé d'atelier minuté. Adresse : `/minuteur-etapes`.

- Étapes saisies en texte, une par ligne : « Accueil : 10 min » (même lecture que le chronomètre de parole, `lib/programme.ts`).
- Compte à rebours par étape ; passage automatique à l'étape suivante avec signal sonore (désactivable : l'outil attend alors un clic).
- Écran projetable : étape en cours, étape suivante, heure de fin prévue recalculée en direct.
- Liste du déroulé avec l'heure de début estimée de chaque étape à venir.
- +1 min sur l'étape en cours, passer une étape, recommencer. Raccourcis : Espace, N, F.
- Déroulé gardé dans le navigateur. Aucune donnée envoyée au serveur.
