# Canif

> Nom de travail. « Canif » n'est pas libre d'après le porteur du projet, il sera remplacé (voir `docs/02-decisions.md`, décision D10).

Boîte à outils web gratuite pour les facilitateurs, consultants, chefs de projet et entrepreneurs : 72 outils au total, dont le minuteur, la roue de noms, le jeu de cartes en lien unique, le buzzer, les mots croisés, des canevas et des calculateurs, sans compte pour les participants.

**Statut : 62 outils sur 72 en ligne** (tous les outils sans serveur). Restent les 9 outils en direct (buzzer, sondage, jeu de cartes...), qui demandent la base Supabase, et la suppression de fond. Voir `CLAUDE.md`.

## Contenu de ce dossier

| Fichier | Rôle |
|---|---|
| `CLAUDE.md` | Contexte et règles de travail pour Claude Code dans VS Code |
| `docs/00-cadrage.md` | Vision, principes, périmètre, risques, roadmap |
| `docs/01-catalogue.md` | **Référence du périmètre : 72 outils**, codes, complexité, mémoire serveur, règles du jeu de cartes |
| `docs/02-decisions.md` | Journal des décisions prises et des décisions encore ouvertes |
| `docs/03-guide-demarrage.md` | Pas à pas pour brancher VS Code, GitHub, Supabase et Vercel |
| `docs/04-limites-offres-gratuites.md` | Limites vérifiées le 15 octobre 2026, avec sources officielles |
| `docs/05-architecture.md` | Esquisse technique : moteur de session, jeu de cartes, expiration, prolongation |
| `app/` | Pages du site (Next.js). Un dossier par outil une fois construit |
| `app/api/keepalive/route.ts` | Route appelée chaque jour par Vercel Cron pour garder Supabase actif |
| `lib/catalogue.ts` | Liste des outils utilisée par le site |
| `vercel.json` | Déclaration de la tâche planifiée Vercel |
| `.github/workflows/keepalive.yml` | Tâche GitHub qui empêche Supabase de se mettre en pause (premier mécanisme) |
| `supabase/migrations/0001_keepalive.sql` | Brouillon de la table utilisée par cette tâche |
| `.env.example` | Modèle des variables d'environnement (sans aucune valeur) |

## Démarrage rapide

1. `npm install` puis `npm run dev`, et ouvrir http://localhost:3000.
2. Créer la table de maintien en vie dans Supabase (`docs/03-guide-demarrage.md`, étape 5).
3. Déployer sur Vercel (`docs/03-guide-demarrage.md`, étape 8).
4. Relire les contenus rédigés pour Canif (questions, défis, bingo) et valider le schéma Supabase des outils en direct (phase 2).

## Règles à ne jamais oublier

- Aucune clé secrète dans le dépôt (le fichier `.gitignore` bloque `.env*`, sauf `.env.example`).
- Tout outil qui garde des données côté serveur le dit clairement et les supprime automatiquement.
- Les contenus (questions, défis, modèles) sont originaux. Rien n'est repris d'un autre auteur.
