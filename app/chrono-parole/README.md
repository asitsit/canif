# C3 : Chronomètre de parole

Déroulé d'intervenants avec temps de parole. Adresse : `/chrono-parole`.

- Programme saisi en texte, un intervenant par ligne : « Jacques : 3 min », « Alex ; 7 », « Marie : 2:30 », « Paul : 1h30 ». Les lignes non comprises sont signalées. Lecture dans `programme.ts`.
- Écran projetable : nom de l'intervenant, temps restant, feu vert / orange / rouge, dépassement (« +00:15 »), intervenant suivant, avance ou retard cumulé du programme.
- « Intervenant suivant » enregistre le temps réel et enchaîne sur le suivant sans arrêter le chrono.
- Tableau de suivi : prévu, réel, écart (avance, à l'heure à 5 s près, retard), total.
- Bip optionnel au passage au rouge. Plein écran. Raccourcis : Espace, N, F.
- Le programme est gardé dans le navigateur (localStorage) pour la prochaine visite. Rien n'est envoyé au serveur.
