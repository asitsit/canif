# Architecture : esquisse technique

> Version 0.1, 15 octobre 2026. Esquisse à valider avant la phase 2. Rien ici n'a été testé contre un vrai projet Supabase. Les noms de tables et de fonctions sont indicatifs.

## 1. Principes

1. **Aucun accès direct du navigateur aux tables.** Les participants passent par des fonctions serveur contrôlées (fonctions Postgres ou routes serveur). Le Row Level Security (RLS) est activé sur toutes les tables.
2. **Le serveur décide du temps.** Dates de création, d'expiration et de prolongation sont toujours calculées côté serveur.
3. **Expiration en deux temps** : suppression *logique* immédiate (un élément expiré n'est plus jamais servi), suppression *physique* ensuite par une tâche planifiée.
4. **Le participant ne reçoit que ce dont il a besoin** (une carte, pas le paquet entier). Raison : la sortie de données gratuite est de 5 Go par mois (voir `04-limites-offres-gratuites.md`).
5. **Secrets côté serveur uniquement.** La clé secrète ne quitte jamais le serveur.

## 2. Moteur de session commun (phases 2 et 3)

Huit outils partagent la même mécanique : B8 « Qui est qui ? », C16 buzzer, C17 sondage, C18 vote à points, C19 nuage de mots, C21 questions anonymes, C25 échelle, C27 oui/non.

| Table (indicative) | Contenu | Remarque |
|---|---|---|
| `rooms` | code court, type d'outil, état, empreinte du jeton d'animateur, création, expiration | Le jeton d'animateur n'est jamais stocké en clair |
| `participants` | salle, pseudo, identifiant aléatoire généré par le navigateur, date d'arrivée | Pseudonymes uniquement, pas d'e-mail |
| `events` | salle, participant, type (clic, vote, mot, question...), contenu libre (JSON), date serveur | Une ligne par action |

Chaque outil est une fine couche : il définit les types d'événements et la façon de les afficher. Le temps réel diffuse les nouveaux événements aux écrans connectés.

À vérifier avant de choisir : le mécanisme de temps réel de Supabase le mieux adapté (diffusion de messages ou écoute des changements de la base), et la façon dont les messages sont comptés dans la limite de 2 millions par mois.

**Durée de vie** (proposition, décision D7) : une salle expire 24 heures après sa dernière activité, 7 jours au maximum.

### Buzzer : ce que « premier » veut dire
L'ordre affiché est l'ordre d'**arrivée au serveur**, horodaté par le serveur. Il ne mesure pas l'instant exact du clic : un téléphone avec une mauvaise connexion peut être désavantagé. À écrire dans l'interface, et à tester avec 10 téléphones (risque R9).

## 3. Jeu de cartes en lien unique (C14)

### Règles
Voir `01-catalogue.md`, note C14 : 40 cartes maximum, 7 jours, fichiers de 5 Mo maximum à l'envoi, redimensionnement à 1200 px et recompression dans le navigateur, bouton « Prolonger de 7 jours ».

### Tables (indicatives)

| Table | Contenu |
|---|---|
| `decks` | identifiant public (code du lien), empreinte du jeton d'administration, titre, mode de tirage, date de création, date d'expiration, nombre de prolongations |
| `cards` | paquet, position, type (image ou texte), texte, chemin du fichier dans le stockage |
| `draws` | paquet, carte, identifiant de l'appareil, date du tirage |

### Deux liens par paquet
- **Lien participant** : ouvre la page de pioche.
- **Lien d'administration (secret)** : permet de voir la date d'expiration, de prolonger et de supprimer le paquet. À conserver par le créateur : sans compte, un lien perdu ne se récupère pas. Le texte de l'interface doit le dire.

### Flux de pioche
1. Le participant ouvre le lien. Le serveur vérifie que le paquet existe **et** qu'il n'a pas expiré.
2. Le participant appuie sur « Piocher ». Le serveur choisit **une** carte selon les règles du paquet (D6) et enregistre le tirage.
3. Le serveur renvoie **uniquement cette carte** (texte ou adresse de son image). Le participant ne reçoit jamais la liste complète.

Pourquoi : si chaque participant téléchargeait tout le paquet, la sortie de données gratuite serait épuisée en quelques ateliers (calcul dans `04`).

### Stockage des images
Proposition (décision D18) : fichiers dans un espace de stockage dont les chemins sont des identifiants aléatoires non devinables. Comme le participant ne connaît que le chemin de sa carte, les autres images ne sont pas exposées en pratique. Alternative plus stricte : adresses signées à durée limitée, générées côté serveur, plus de travail.

### Bouton « Prolonger de 7 jours » : logique côté serveur
1. Recevoir le code du paquet et le jeton d'administration.
2. Refuser si le paquet n'existe pas, a déjà expiré, ou si le jeton ne correspond pas à l'empreinte stockée.
3. Calculer la nouvelle expiration : le **plus petit** entre « maintenant + 7 jours » et « date de création + 30 jours » (plafond proposé, décision D16).
4. Refuser avec un message clair si la nouvelle date n'est pas postérieure à l'expiration actuelle (plafond atteint).
5. Enregistrer la nouvelle date et incrémenter le compteur de prolongations.
6. Renvoyer la nouvelle date à afficher.

Le navigateur n'envoie jamais de date : il demande seulement « prolonge ».

Interface : date d'expiration toujours visible côté administration, bandeau d'alerte à 48 heures ou moins, bouton désactivé avec explication une fois le plafond atteint.

## 4. Expiration et purge

| Élément | Règle |
|---|---|
| Lecture | Toute requête filtre sur « non expiré ». Un paquet expiré n'est plus servi, même avant la purge |
| Purge | Une tâche planifiée quotidienne supprime les paquets et salles expirés **et leurs fichiers** |
| Mécanisme | Route serveur protégée, appelée chaque jour par Vercel Cron (une exécution par jour au maximum sur Hobby). L'extension pg_cron de Supabase est une alternative, disponibilité sur le plan gratuit à vérifier |
| Fichiers | Suppression par l'API de stockage (d'après mes connaissances, supprimer des lignes SQL ne supprime pas toujours les fichiers : à vérifier) |

## 5. Maintien en vie de Supabase

Brouillons fournis : `.github/workflows/keepalive.yml` et `supabase/migrations/0001_keepalive.sql` (voir `03-guide-demarrage.md`, étapes 5 à 7). Second mécanisme à ajouter après le choix du framework : une route appelée par Vercel Cron qui lit la base une fois par jour. Aucun des deux n'est suffisant seul.

## 6. Texte de transparence (modèle)

À afficher sur chaque outil à mémoire :

> « Cet outil enregistre [telles données] sur nos serveurs pendant [durée], pour permettre le partage avec les participants. Elles sont supprimées automatiquement ensuite. »

Pour le jeu de cartes : « Les cartes sont conservées 7 jours après la création du paquet, prolongeables de 7 jours à partir du lien d'administration. Passé ce délai, le paquet et ses images sont supprimés et ne peuvent pas être récupérés. »

## 7. Points à valider avant de coder

- [ ] Choix du framework (D1).
- [ ] Mécanisme de temps réel (diffusion ou écoute de la base) et décompte des messages.
- [ ] Stockage public aléatoire ou adresses signées (D18).
- [ ] Plafond de prolongation (D16) et limite de paquets par jour (D17).
- [ ] Durée de vie des salles (D7).
- [ ] Disponibilité de pg_cron sur le plan gratuit, sinon purge par route serveur.
