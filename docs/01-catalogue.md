# Canif : catalogue des outils, version 2

> Version 2.1, 15 octobre 2026. Ce fichier est la référence du périmètre. Il remplace la section 4 de l'ancien cadrage et la liste d'arbitrage (A à G, codes inchangés).
> Périmètre : **outils uniquement** (les briques transversales comme le mode projection, les favoris ou la recherche sont mises de côté pour le moment).
> **72 outils** retenus à ce stade, dont **9** avec mémoire côté serveur.

## Légende

- **Mém.** : « Oui » = des données sont stockées côté serveur (Supabase), à signaler clairement à l'utilisateur. « Non » = tout reste dans le navigateur.
- **Cplx** (estimation, à prendre avec prudence) : S = quelques heures, M = une à deux journées, L = plusieurs jours ou composant à risque.
- **⚠** : point de vigilance (abus, uploads, bibliothèque tierce).
- **Décision** : à remplir si tu veux encore arbitrer (O / P / N).

---

## A. Avant l'atelier

| Code | Outil | Mém. | Cplx | Décision |
|---|---|---|---|---|
| A1 | Générateur de QR code (couleur, logo, export PNG et SVG) | Non | S | |
| A2 | Checklist technique d'atelier | Non | S | |
| A3 | Générateur d'agenda (étapes, durées, horaires calculés) | Non | M | |
| A4 | Calculateur de durée d'un tour de table | Non | S | |
| A5 | Plan de salle | Non | M | |
| A6 | Liste de matériel à emporter | Non | S | |
| A7 | Générateur de message d'invitation | Non | S | |
| A8 | Fond de visio personnalisé | Non | M | |
| A9 | Convertisseur de fuseaux horaires | Non | S | |

## B. Briser la glace et jeux (contenus originaux)

| Code | Outil | Mém. | Cplx | Décision |
|---|---|---|---|---|
| B1 | Tirage de question brise-glace, par intention | Non | M | |
| B2 | Bingo d'atelier imprimable | Non | S | |
| B6 | Mini-défis énergisants | Non | S | |
| B7 | Tirage de lettre ou de thème | Non | S | |
| B8 | « Qui est qui ? » (chacun renseigne 3 faits, le groupe devine) | Oui | L | |
| B9 | **Mots croisés, niveau 1 : générateur imprimable** (décidé) | Non | M | |

### Note sur B9 : mots croisés

Trois niveaux possibles, à choisir :

1. **Générateur imprimable** : tu saisis des couples mot + définition, l'outil place les mots dans une grille et exporte en PDF ou en image. Complexité M. Point à connaître : un algorithme de placement ne garantit pas que tous les mots trouvent leur place dans une grille compacte, il faudra des essais et un message clair si certains mots restent en dehors.
2. **Grille jouable en ligne avec lien** : en plus, les participants remplissent la grille dans leur navigateur. Idée sans serveur : encoder la grille dans le lien lui-même (je ne suis pas certain de la longueur maximale pratique d'un lien, à tester). Contrepartie : les réponses seraient techniquement lisibles par quelqu'un qui décode le lien. Acceptable pour un usage de formation, pas pour un vrai concours.
3. **Mode collectif en direct** (grille remplie à plusieurs en temps réel, comme un mur partagé) : complexité L, nécessite Supabase.

**Décision (15 octobre 2026) : niveau 1 retenu.** Les niveaux 2 et 3 sont reportés.
Usage typique en formation : révision de vocabulaire, de notions clés, de règles de méthode.

## C. Pendant l'atelier

### C-1. Temps et rythme

| Code | Outil | Mém. | Cplx | Décision |
|---|---|---|---|---|
| C1 | Minuteur / compte à rebours | Non | S | |
| C2 | Minuteur d'étapes enchaînées | Non | M | |
| C3 | Chronomètre de parole (vert, orange, rouge) | Non | S | |
| C4 | Écran de pause projetable | Non | S | |
| C5 | Pomodoro | Non | S | |
| C6 | Minuteurs parallèles (sous-groupes) | Non | M | |

### C-2. Groupes et tirage

| Code | Outil | Mém. | Cplx | Décision |
|---|---|---|---|---|
| C8 | Roue de noms | Non | M | |
| C9 | Générateur d'équipes | Non | S | |
| C10 | Équipes avec paramètres (service, niveau, site) | Non | M | |
| C11 | Ordre de passage | Non | S | |
| C12 | Dés personnalisables | Non | M | |
| C13 | Pile ou face | Non | S | |
| C14 | **Jeu de cartes en lien unique** (max 40 cartes, conservé 7 jours, prolongeable, voir note) ⚠ (uploads) | **Oui** | L | |
| C15 | Tirage de rôles | Non | S | |

### Note sur C14 : règles du jeu de cartes (décidées le 15 octobre 2026)

- **Nombre de cartes** : 40 maximum par paquet.
- **Durée de conservation** : 7 jours après la création du paquet, puis suppression automatique du paquet, des images et du lien.
- **Formats acceptés** : JPG, PNG, WebP. Les cartes texte seul sont aussi possibles.
- **Taille à l'envoi** : 5 Mo maximum par fichier.
- **Traitement dans le navigateur avant envoi** : redimensionnement à 1200 pixels maximum sur le plus grand côté et recompression (cible d'environ 300 Ko par carte, plafond dur de 500 Ko).
- **Poids d'un paquet** : 20 Mo au maximum théorique (40 x 500 Ko), environ 12 Mo en pratique.

Pourquoi ces valeurs (mon raisonnement, pas une règle imposée par un service) :
- Une image de 1200 pixels est nette sur un écran de téléphone et se charge vite.
- Le stockage gratuit de Supabase est limité (je crois à 1 Go, à vérifier). À 20 Mo par paquet, cela représente au pire environ 50 paquets en même temps. La durée de 7 jours protège donc aussi le quota.

#### Bouton « Prolonger de 7 jours » (décidé le 15 octobre 2026)

La décision est de proposer ce bouton. Les modalités ci-dessous sont mes propositions, à confirmer ou corriger.

- **Où** : sur la page d'administration du paquet (accessible par le lien secret du créateur). Les participants ne voient pas ce bouton.
- **Effet** : un clic repousse l'expiration à 7 jours après le moment du clic. Exemple : paquet créé le 1er, clic le 6, nouvelle expiration le 13. (Alternative écartée : ajouter 7 jours à la date existante, moins intuitive.)
- **Plafond (proposition, non décidée)** : durée de vie totale limitée à 30 jours après la création. Au-delà, le bouton est désactivé avec un message. Cela évite qu'un paquet vive indéfiniment (stockage, abus). Valeur modifiable.
- **Visibilité** : la date d'expiration est affichée sur la page d'administration, avec un bandeau d'alerte quand il reste 48 heures ou moins. Les participants voient « ce paquet expire le [date] » (à confirmer).
- **Pas de rappel automatique** : sans compte ni e-mail, Canif ne peut pas prévenir le créateur. La date visible et le bandeau sont la seule protection. À dire dans le texte de transparence.
- **Après expiration** : paquet, images et lien sont supprimés et ne sont pas récupérables.
- **Technique** : la nouvelle date est toujours calculée côté serveur (le navigateur ne choisit jamais la date). Voir `05-architecture.md`.

Point encore à décider :
- Une limite du nombre de paquets créés par personne et par jour (anti-abus).

### C-3. Interaction en direct

| Code | Outil | Mém. | Cplx | Décision |
|---|---|---|---|---|
| C16 | **Buzzer** | **Oui** | L | |
| C17 | Sondage express | Oui | M | |
| C18 | Vote à points | Oui | M | |
| C19 | Nuage de mots en direct | Oui | L | |
| C20 | Nuage de mots depuis un texte | Non | S | |
| C21 | Questions anonymes | Oui | L | |
| C25 | Échelle de position (curseur de 0 à 10) | Oui | M | |
| C27 | Vote oui / non | Oui | S | |

### C-4. Création visuelle

| Code | Outil | Mém. | Cplx | Décision |
|---|---|---|---|---|
| C28 | Page blanche de dessin | Non | M | |
| C29 | Tableau blanc simple (formes, texte, flèches) | Non | L | |
| C31 | Suppression de fond (dans le navigateur) ⚠ (bibliothèque tierce, qualité à tester) | Non | L | |
| C32 | Compresseur / redimensionneur d'images | Non | S | |
| C33 | Palette de couleurs | Non | M | |
| C34 | Convertisseur d'images (PNG, JPG, WebP) | Non | S | |

## D. Après l'atelier

| Code | Outil | Mém. | Cplx | Décision |
|---|---|---|---|---|
| D1 | Modèle de compte rendu | Non | S | |
| D4 | Générateur de synthèse structurée (règles simples, sans IA) | Non | M | |
| D5 | Export en image / PDF (commun aux outils) | Non | M | |
| D6 | Modèle d'e-mail de remerciement | Non | S | |

## E. Consultant et chef de projet

| Code | Outil | Mém. | Cplx | Décision |
|---|---|---|---|---|
| E1 | Matrice d'Eisenhower | Non | M | |
| E2 | Matrice impact / effort | Non | M | |
| E3 | Canevas (SWOT, persona, carte d'empathie, Business Model Canvas) | Non | L | |
| E4 | Matrice de décision pondérée | Non | M | |
| E5 | Matrice de sélection de mission | Non | S | |
| E6 | RACI | Non | M | |
| E7 | Cartographie des parties prenantes | Non | M | |
| E8 | Arbre des « 5 pourquoi » | Non | S | |
| E9 | Diagramme d'Ishikawa | Non | M | |
| E10 | **Rétrospective, version KISS** (voir note) | Non | M | |
| E11 | Roadmap simple | Non | M | |
| E12 | Gantt simple | Non | L | |
| E13 | Rétro-planning | Non | M | |

### Note sur E10 : rétrospective en version KISS

- 3 colonnes fixes : Commencer / Arrêter / Continuer.
- Un seul écran, les post-its sont saisis par l'animateur (ou projetés pendant que le groupe dicte).
- Pas de temps réel, pas de compte, pas de stockage serveur.
- Sauvegarde dans le navigateur, export image ou texte.
- La version collaborative en direct (chacun écrit depuis son téléphone) est écartée pour l'instant.

## F. Entrepreneur

| Code | Outil | Mém. | Cplx | Décision |
|---|---|---|---|---|
| F1 | Calculateur de TJM | Non | M | |
| F2 | Calculateur de rentabilité de mission | Non | S | |
| F3 | Simulateur de prix (forfait ou régie) | Non | M | |
| F5 | Canevas de pitch de 2 minutes | Non | S | |
| F8 | Calcul du point mort | Non | S | |
| F10 | Générateur de signature d'e-mail | Non | S | |

## G. Utilitaires

| Code | Outil | Mém. | Cplx | Décision |
|---|---|---|---|---|
| G1 | Compteur de mots et de caractères | Non | S | |
| G4 | Atelier PDF (fusion, compression) | Non | L | |
| G5 | Extracteur d'adresses e-mail | Non | S | |
| G6 | Traitement de listes (tri, doublons, majuscules) | Non | S | |
| G7 | Générateur de texte de test | Non | S | |
| G8 | Calcul de jours ouvrés entre deux dates | Non | S | |

---

## Outils retirés (historique des décisions)

A10, B3, B4, B5, C7, C22, C23, C24, C26, C30, D2, D3, D7, E14, E15, E16, F4, F6, F7, F9, G2, G3.

Conséquences :
- Plus aucun outil de devis, de CRM ni de photos uploadées : les risques juridiques et d'abus sont fortement réduits.
- Les trois plus gros outils temps réel de type « collaboration » (mur de post-its, tableau blanc partagé, rétrospective en direct) sont retirés.

## Outils qui gardent une mémoire serveur (9)

| Code | Outil | À stocker | Durée à prévoir (à décider) |
|---|---|---|---|
| B8 | Qui est qui ? | Pseudos, faits saisis | Session |
| C14 | Jeu de cartes en lien unique | Paquet de cartes, images | 7 jours, prolongeable par le créateur (plafond de 30 jours proposé) |
| C16 | Buzzer | Pseudos, horodatages | Session |
| C17 | Sondage express | Question, votes | Session |
| C18 | Vote à points | Options, votes | Session |
| C19 | Nuage de mots en direct | Mots saisis | Session |
| C21 | Questions anonymes | Questions, votes | Session |
| C25 | Échelle de position | Valeurs saisies | Session |
| C27 | Vote oui / non | Votes | Session |

### Insight d'architecture

Les outils C16, C17, C18, C19, C21, C25, C27 et B8 partagent la même base : une **salle** avec un code, des **participants anonymes** et des **messages en temps réel**. Je propose de construire **un seul moteur de session commun**, puis d'en faire de fines couches par outil (buzzer, sondage, etc.). Cela évite de réécrire huit fois la même plomberie, et rend le lancement avec tous les outils plus réaliste.

Phrase de transparence (proposition) à afficher sur chaque outil à mémoire :
> « Cet outil enregistre [telles données] sur nos serveurs pendant [durée], pour permettre le partage avec les participants. Elles sont supprimées automatiquement ensuite. »

## Questions encore ouvertes

1. **C31 suppression de fond** : à garder, mais elle dépend d'une bibliothèque tierce dont la qualité, le poids et la licence sont à tester avant de s'y engager.
2. **C14 jeu de cartes** : limite du nombre de paquets par personne et par jour, et validation du plafond de 30 jours pour la prolongation (voir la note C14).
3. **Contenus à écrire** : B1 (questions brise-glace), B6 (mini-défis), B2 (cases de bingo). À rédiger en original.
