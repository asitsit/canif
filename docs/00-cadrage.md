# Canif : cadrage du projet

> Version 1.0, 15 octobre 2026. Remplace le brouillon 0.1.
> Les limites des offres gratuites ont été vérifiées sur les pages officielles le 15 octobre 2026 (voir `04-limites-offres-gratuites.md`). Tout ce qui reste « à vérifier » est signalé comme tel.

---

## 1. Vision

**Canif** (nom de travail) est une boîte à outils web gratuite pour les facilitateurs, consultants, chefs de projet et entrepreneurs. Un outil, une page, un usage : on ouvre, on s'en sert, on partage un lien.

### Promesse (à tester auprès d'utilisateurs réels)
> « Tout ce dont j'ai besoin pour préparer, animer et restituer un atelier, dans un seul onglet, sans publicité, et sans compte pour les participants. »

### Ce qui peut différencier Canif (hypothèses)
1. **Tout-en-un** : un seul endroit au lieu d'une dizaine de sites, chacun avec sa publicité ou son paywall.
2. **Les participants rejoignent avec un lien ou un code**, sans inscription.
3. **Pensé pour la facilitation** : lisible en projection, utilisable sur téléphone.
4. **En français d'abord.**
5. **Le temps réel multi-participants** (buzzer, sondage, vote) et le **lien unique de pioche** d'un paquet de cartes. D'après la page « Outils » du site de Ronan Broussier (seule source de benchmark consultée, page lue le 15 octobre 2026), ces deux usages n'y figurent pas. Je n'ai pas fait de benchmark plus large : ce n'est pas une garantie d'unicité sur le marché.

### Public visé
- Utilisateur principal : le porteur du projet et ses équipes.
- Utilisateurs secondaires : tout facilitateur, formateur, consultant ou entrepreneur.
- Participants : n'importe qui, sur téléphone ou ordinateur.

---

## 2. Principes de conception

1. **Zéro friction** : aucun compte pour utiliser un outil ou rejoindre une session.
2. **Mobile d'abord pour les participants**, grand écran d'abord pour le facilitateur.
3. **Un outil, un but** : des versions simples, pas des clones complets des géants du marché.
4. **Données minimales et temporaires** : on ne stocke que le nécessaire, et tout expire.
5. **Transparence** : un outil qui garde des données côté serveur le dit clairement (quoi, combien de temps).
6. **Autonomie** : code simple, lisible, modifiable par une personne non experte.
7. **Contenus originaux** : rien n'est repris d'un autre auteur.

---

## 3. Périmètre

- **72 outils** retenus, listés dans `01-catalogue.md` (catégories A à G), dont **9** avec mémoire côté serveur.
- **Outils uniquement.** Sont mis de côté pour l'instant : mode Atelier (enchaîner des outils), mode projection global, favoris, recherche, comptes, mode sombre, version bilingue, page de ressources éditoriales, installation sur mobile (PWA), statistiques d'audience.
- **Lancement avec tous les outils retenus** (décision du porteur). Voir le risque R1.

### Critères de « terminé » pour un outil
- Fonctionne sur mobile et ordinateur.
- Utilisable sans mode d'emploi.
- Si l'outil garde des données : texte de transparence affiché, expiration automatique testée.
- Testé avec au moins 3 personnes réelles.
- Décrit en quelques lignes dans le dépôt.

---

## 4. Stack technique

| Couche | Choix | Remarque |
|---|---|---|
| Code | VS Code + Git | |
| Dépôt | GitHub | Public ou privé : décision D5 |
| Hébergement | Vercel, plan Hobby | Usage non commercial uniquement (voir R8) |
| Base, temps réel, fichiers | Supabase, plan Free | Pause après 7 jours d'activité faible (voir R2) |
| Framework | **À décider (D1)** | Next.js ou Astro en tête |

### Choix du framework (D1)
Avec 72 outils, une structure à mise en page commune est indispensable (le HTML simple devient vite ingérable). Les deux candidats :

| Option | Pour | Contre |
|---|---|---|
| **Next.js** | Très répandu, très bien intégré à Vercel, routes serveur pour la purge et le maintien en vie | Plus de concepts à apprendre, plus lourd |
| **Astro** | Léger, pensé pour les sites avec quelques zones interactives, pages rapides | Moins de ressources que Next.js, la partie serveur est moins directe |

Mon avis, avec réserve : **Next.js** si le projet doit surtout évoluer avec l'aide d'un assistant de code (beaucoup d'exemples existent), **Astro** si tu préfères un site léger. Je ne peux pas trancher sans connaître ton niveau de code (D8).

---

## 5. Navigation (proposition, décision D12)

Organisation par **moment de l'atelier**, plus parlante qu'un classement technique :

| Rubrique | Catalogue |
|---|---|
| Avant l'atelier | A |
| Briser la glace et jeux | B |
| Pendant l'atelier | C (temps, groupes, interaction en direct, création visuelle) |
| Après l'atelier | D |
| Consultant et chef de projet | E |
| Entrepreneur | F |
| Utilitaires | G |

Chaque outil a une adresse claire (par exemple `/minuteur`, `/roue`, `/buzzer`).

---

## 6. Roadmap proposée

Le lancement public a lieu quand l'ensemble est prêt, mais la construction avance par étapes pour garder un site testable à chaque fois.

| Phase | Contenu | Résultat attendu |
|---|---|---|
| **0. Fondations** | Dépôt, projets Vercel et Supabase, mise en page, navigation, maintien en vie de Supabase | Site vide en ligne, ping qui fonctionne |
| **1. Outils sans serveur, partie simple** | Tous les outils de complexité S ou M sans mémoire (minuteurs, tirages, QR code, calculateurs, modèles) | Une quarantaine d'outils utilisables |
| **2. Moteur de session commun** | Salles, participants anonymes, temps réel, expiration, texte de transparence | Socle des 8 outils en direct |
| **3. Outils en direct** | Buzzer, sondage, vote à points, nuage de mots, questions anonymes, échelle, oui/non, « Qui est qui ? » | Interaction en direct |
| **4. Jeu de cartes** | Envoi d'images, lien unique, pioche, expiration, bouton « Prolonger de 7 jours » | Premier outil avec fichiers |
| **5. Outils lourds** | Canevas, Gantt, tableau blanc simple, atelier PDF, suppression de fond (après prototype) | Catalogue complet |
| **6. Contenus et lancement** | Contenus originaux (B1, B2, B6), pages légales, tests, vérification du nom | Ouverture au public |

Chaque phase se termine par un test avec de vrais utilisateurs.

---

## 7. Risques et points de vigilance

| # | Risque | Impact | Piste |
|---|---|---|---|
| R1 | **Trop d'outils pour un lancement unique** : 72 outils, projet jamais terminé | Élevé | Construction par phases, moteur de session commun, une date de gel du périmètre, et la liberté de retirer des outils (colonne « Décision » du catalogue) |
| R2 | **Pause du projet Supabase** (7 jours d'activité faible, source officielle) | Élevé | Ping tous les 3 jours par GitHub Actions + second mécanisme (Vercel Cron, une fois par jour au maximum) + export régulier de la base |
| R3 | **Suppression de fond dans le navigateur** : qualité, poids et licence de la bibliothèque non testés | Moyen | Prototype séparé avant de promettre l'outil |
| R4 | **Limites de l'offre gratuite Supabase** : 1 Go de fichiers, 5 Go de sortie par mois, 200 connexions temps réel simultanées | Moyen à élevé | Voir `04-limites-offres-gratuites.md` : le jeu de cartes n'envoie que la carte piochée, tailles bornées, expiration |
| R5 | **Abus du jeu de cartes** (images illicites, saturation du stockage) | Élevé | Limites de taille et de nombre, expiration, limite de paquets par personne et par jour (à décider), contact de signalement et moyen de supprimer un paquet |
| R6 | **RGPD** (pseudos de participants) | Moyen | Région européenne pour Supabase, données minimales, pas de traceurs, mentions légales et page de transparence. Je ne suis pas juriste : à faire relire |
| R7 | **Droits sur les images envoyées** | Moyen | Conditions d'utilisation : l'utilisateur garantit avoir les droits |
| R8 | **Usage commercial et Vercel Hobby** : « restreint à un usage personnel non commercial » (source officielle) | Moyen | Pas de publicité, pas de paiement, **pas d'appel à acheter tes prestations sur le site** (voir détail dans `04`). En cas de doute, contacter le support Vercel |
| R9 | **Équité du buzzer** : l'ordre est celui d'arrivée au serveur, pas l'instant du clic | Moyen | Le dire dans l'interface, tester avec 10 téléphones |
| R10 | **Maintenance** : qui s'en occupe dans six mois ? | Moyen | Code simple, `CLAUDE.md`, journal des décisions |
| R11 | **Nom déjà utilisé** | Moyen | Vérifier domaine et marque (base de l'INPI en France) avant tout lancement public |
| R12 | **GitHub désactive les workflows planifiés d'un dépôt public inactif depuis 60 jours** (source officielle) | Moyen | Dépôt privé, ou activité régulière, ou second mécanisme de ping |
| R13 | **Contenus à écrire** (questions, défis, cases de bingo) | Moyen | Série originale rédigée avec le porteur, relue par lui |

---

## 8. Décisions

Toutes les décisions, prises et ouvertes, sont dans `02-decisions.md`.

## 9. Sources

Une seule source de benchmark consultée : la page « Outils » de ronanbroussier.fr (15 octobre 2026), utilisée pour des idées de fonctionnalités, pas pour des contenus. Les sources des limites techniques sont listées dans `04-limites-offres-gratuites.md`.
