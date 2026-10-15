# Journal des décisions

> Dernière mise à jour : 15 octobre 2026.
> Règle : toute nouvelle décision est ajoutée ici avec sa date. Les colonnes « Ma recommandation » sont des avis, pas des décisions.

## Décisions prises

| Réf | Décision | Date |
|---|---|---|
| P1 | Stack : code dans VS Code, GitHub, Vercel, Supabase | 15/10/2026 |
| P2 | Nom de travail « Canif ». Il n'est pas libre d'après le porteur, il sera remplacé | 15/10/2026 |
| P3 | Usage public, sans objectif commercial | 15/10/2026 |
| P4 | Transparence : tout outil gardant des données côté serveur l'indique (quoi, combien de temps) | 15/10/2026 |
| P5 | Lancement avec tous les outils retenus, **outils uniquement** (pas de briques transversales pour l'instant) | 15/10/2026 |
| P6 | Catalogue de 72 outils (voir `01-catalogue.md`), 22 retirés : A10, B3, B4, B5, C7, C22, C23, C24, C26, C30, D2, D3, D7, E14, E15, E16, F4, F6, F7, F9, G2, G3 | 15/10/2026 |
| P7 | E10 rétrospective : version simple (3 colonnes, sans serveur) | 15/10/2026 |
| P8 | B9 mots croisés : niveau 1 (générateur imprimable) | 15/10/2026 |
| P9 | C14 jeu de cartes : 40 cartes maximum, conservation 7 jours, fichiers de 5 Mo maximum à l'envoi, redimensionnement à 1200 px et recompression dans le navigateur (cible environ 300 Ko, plafond 500 Ko) | 15/10/2026 |
| P10 | C14 : bouton « Prolonger de 7 jours » (modalités à confirmer : voir D16) | 15/10/2026 |
| P11 | Contenus 100 % originaux, aucune reprise de « Le Bruit des Glaçons », des questions d'Augustin Trapenard ni d'un autre auteur | 15/10/2026 |
| P12 | Maintien en vie de Supabase par ping régulier (au moins deux mécanismes) | 15/10/2026 |
| P13 | D1 framework : **Next.js 16 (App Router) avec TypeScript**, CSS simple sans bibliothèque. Choisi par Claude Code sur la recommandation du cadrage, le porteur ayant demandé de se lancer. **À confirmer par le porteur** (revenir sur ce choix reste peu coûteux tant que les outils ne sont pas codés) | 15/10/2026 |
| P14 | D12 navigation : par moment de l'atelier, appliquée en phase 0 (recommandation du cadrage, à confirmer) | 15/10/2026 |
| P15 | Second mécanisme de maintien en vie : route `/api/keepalive` appelée chaque jour par Vercel Cron (`vercel.json`, 05:00 UTC), protégée par la variable `CRON_SECRET` | 15/10/2026 |
| P16 | Projet Supabase créé (`easpiqcsltbtwouzrjft`), clé de type « publishable » (`sb_publishable_...`). Le ping avec le seul en-tête `apikey` est accepté par l'API (vérifié le 15/10/2026) | 15/10/2026 |

## Décisions ouvertes

| Réf | Question | Ma recommandation | Urgence |
|---|---|---|---|
| D5 | Dépôt public (open source) ou privé | Privé au départ évite la règle des 60 jours de GitHub sur les workflows planifiés. Ouvrir plus tard est possible. Si public, choisir une licence | Avant le premier envoi sur GitHub |
| D8 | Niveau de code de la personne qui maintiendra le projet | À préciser, pour confirmer ou revoir P13 | Avant la phase 1 |
| D2 | Compte facilitateur | Aucun au départ : le lien d'administration secret fait office de clé (perdu = paquet perdu, à dire clairement) | Avant la phase 4 |
| D6 | Jeu de cartes : tirage avec ou sans remise, un tirage par appareil ou illimité | Réglable par le créateur du paquet, avec « une carte par appareil » par défaut | Avant la phase 4 |
| D7 | Durée de conservation des sessions en direct | 24 heures après la dernière activité, 7 jours au maximum | Avant la phase 2 |
| D16 | Prolongation : plafond de durée de vie totale | 30 jours après la création, bouton désactivé au-delà | Avant la phase 4 |
| D17 | Limite de paquets créés par personne et par jour | À fixer avec les premiers tests (par exemple 5 par jour et par appareil, valeur indicative) | Avant la phase 4 |
| D18 | Jeu de cartes : stockage des images public (adresses aléatoires) ou privé (adresses signées) | Public avec adresses aléatoires non devinables, plus simple. Les participants ne reçoivent que l'adresse de leur carte | Avant la phase 4 |
| D3 | Langue : français seul ou bilingue | Français seul au lancement | Avant la phase 6 |
| D9 | Charte graphique, logo, mode sombre | Charte minimale au départ, le reste après le nom définitif | Avant la phase 6 |
| D10 | Nom définitif et domaine | Vérifier disponibilité (domaine, marque) puis choisir. En attendant, l'adresse en `.vercel.app` suffit | Avant la phase 6 |
| D11 | Ajouter des ressources éditoriales (annuaire, comparatifs, blog) | Hors périmètre pour l'instant | Plus tard |
| D19 | Contenus à écrire (B1 questions, B2 cases de bingo, B6 défis) : qui rédige, quel volume | Je peux rédiger une première série originale, relue par le porteur | Avant la phase 6 |
