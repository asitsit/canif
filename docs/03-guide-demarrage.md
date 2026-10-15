# Guide de démarrage : VS Code, GitHub, Supabase, Vercel

> Ce guide liste ce qu'il faut faire, dans l'ordre. Les créations de comptes, mots de passe et clés doivent être faites par toi : personne d'autre (y compris Claude) ne doit les manipuler à ta place.
> Les noms de boutons et de menus sont donnés de mémoire et peuvent avoir changé : fie-toi à ce que tu vois à l'écran.

## Vue d'ensemble

| Étape | Ce que tu fais | Durée indicative |
|---|---|---|
| 0 | Installer les outils sur ton ordinateur | 15 min |
| 1 | Ouvrir le dossier dans VS Code et créer le dépôt local | 5 min |
| 2 | Créer le dépôt GitHub et envoyer le dossier | 10 min |
| 3 | Créer le projet Supabase | 10 min |
| 4 | Récupérer l'adresse et la clé publique | 5 min |
| 5 | Créer la table de maintien en vie | 5 min |
| 6 | Tester la requête depuis ton terminal | 5 min |
| 7 | Configurer GitHub Actions et tester | 10 min |
| 8 | Brancher Vercel | 10 min |
| 9 | Liste avant ouverture au public | plus tard |

---

## Étape 0 : installer les outils

- **VS Code** (éditeur).
- **Git** (suivi des versions). Test dans un terminal : `git --version`.
- **Node.js**, version « LTS » (nécessaire pour lancer le site en local). Test : `node --version`.
- Optionnel : l'extension Claude Code pour VS Code. Elle lit automatiquement `CLAUDE.md`.

## Étape 1 : ouvrir le dossier dans VS Code

1. Décompresse l'archive `canif-demarrage.zip` dans le dossier de ton choix.
2. Dans VS Code : Fichier, puis Ouvrir le dossier, et choisis `canif`.
3. Ouvre le terminal intégré (menu Terminal, Nouveau terminal) et tape :

```bash
git init -b main
git add .
git commit -m "Cadrage initial du projet"
```

Si Git te demande qui tu es, renseigne ton nom et ton adresse e-mail :

```bash
git config --global user.name "Ton Nom"
git config --global user.email "ton-adresse@exemple.fr"
```

## Étape 2 : créer le dépôt GitHub

1. Sur github.com, crée un compte ou connecte-toi, puis crée un **nouveau dépôt**.
2. Nom : `canif` pour l'instant (rien de définitif, il se renomme plus tard).
3. **Ne coche pas** « Add a README » ni « Add .gitignore » : ils existent déjà dans le dossier.
4. **Public ou privé** (décision D5) : si tu hésites, choisis **privé**. Un dépôt public inactif voit ses tâches planifiées désactivées après 60 jours (voir `04-limites-offres-gratuites.md`). Tu pourras le rendre public plus tard.
5. GitHub affiche alors des commandes. Les deux utiles sont :

```bash
git remote add origin https://github.com/TON-COMPTE/canif.git
git push -u origin main
```

(remplace `TON-COMPTE` par ton identifiant GitHub). VS Code ou Git peut te demander de t'authentifier dans le navigateur.

## Étape 3 : créer le projet Supabase

1. Sur supabase.com, crée un compte (la connexion avec GitHub est possible) puis une organisation si on te le demande.
2. **New project**. Nom : `canif`. Plan : **Free**.
3. **Mot de passe de la base** : génère-en un long et range-le dans ton gestionnaire de mots de passe. Tu ne pourras pas toujours le revoir.
4. **Région** : choisis une région en **Europe** (la liste exacte est à vérifier sur l'écran, je ne la connais pas avec certitude). C'est utile pour le RGPD et la rapidité.
5. Attends la fin de la création du projet (quelques minutes).

Rappel : le plan gratuit permet **2 projets actifs** au maximum. Si tu en as déjà deux, il faudra en mettre un en pause ou en supprimer un.

## Étape 4 : récupérer l'adresse et la clé publique

Dans Supabase, ouvre les réglages du projet puis la section **API** (ou « API Keys » : l'intitulé varie selon les versions).

| Élément | Où il sert | Public ? |
|---|---|---|
| **Project URL** (forme `https://xxxx.supabase.co`) | Partout | Oui |
| **Clé publique** (« anon » ou « publishable ») | Navigateur et GitHub Actions | Oui, protégée par les règles RLS |
| **Clé secrète** (« service_role » ou « secret ») | Serveur uniquement | **Non, jamais** |

**Règle absolue** : la clé secrète ne va ni dans GitHub, ni dans le code du navigateur, ni dans un message, ni dans une capture d'écran.

Crée un fichier `.env.local` à la racine (copie de `.env.example`) et remplis-le. Il est ignoré par Git.

## Étape 5 : créer la table de maintien en vie

1. Dans Supabase, ouvre **SQL Editor**.
2. Copie le contenu de `supabase/migrations/0001_keepalive.sql` et exécute-le (**Run**).
3. Vérifie dans **Table Editor** : la table `keepalive` doit exister avec une ligne `id = 1`.

Ce fichier SQL est un **brouillon non testé** contre un vrai projet. S'il renvoie une erreur, copie le message et demande de l'aide plutôt que de le modifier au hasard.

## Étape 6 : tester la requête depuis ton terminal

```bash
curl -i -H "apikey: TA-CLE-PUBLIQUE" "https://TON-PROJET.supabase.co/rest/v1/keepalive?select=id&limit=1"
```

Résultat attendu : une réponse `HTTP/2 200` et un contenu proche de `[{"id":1}]`.
Si tu obtiens une autre réponse (401, 404...), ne passe pas à l'étape suivante : note le message et fais-le corriger. En particulier, selon le type de clé, il est possible qu'un en-tête supplémentaire soit nécessaire (non vérifié).

## Étape 7 : configurer GitHub Actions et tester

1. Sur GitHub, dans ton dépôt : **Settings**, puis **Secrets and variables**, puis **Actions**, puis **New repository secret**.
2. Crée deux secrets : `SUPABASE_URL` et `SUPABASE_ANON_KEY` (clé **publique**).
3. Ouvre l'onglet **Actions**, choisis **keepalive-supabase**, puis **Run workflow**.
4. Le résultat doit être une coche verte. Une croix rouge signifie que la requête a échoué : ouvre le détail pour lire le message.
5. Vérifie dans tes réglages de notification GitHub que tu reçois un e-mail en cas d'échec d'un workflow (à vérifier, c'est un comportement habituel mais pas garanti).

Le déclenchement automatique a lieu tous les 3 jours environ. Ce mécanisme **seul** ne suffit pas : le second (Vercel Cron) est activé à l'étape 8 et contrôler au bout de deux semaines que le projet n'a pas été mis en pause.

## Étape 8 : brancher Vercel

La phase 0 est en place : le site Next.js est dans le dépôt, `vercel.json` déclare la tâche planifiée. Il reste à créer le projet sur Vercel.

### 8.1 Préparer les valeurs

| Variable | Valeur | Sensible ? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://easpiqcsltbtwouzrjft.supabase.co` | Non |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ta clé `sb_publishable_...` | Non (protégée par RLS) |
| `CRON_SECRET` | un mot de passe aléatoire, par exemple le résultat de `node -e "console.log(require('crypto').randomUUID())"` | **Oui** |

Ne mets **pas** la clé secrète Supabase pour l'instant : aucun code ne l'utilise.

### 8.2 Créer le projet

1. Sur vercel.com, connecte-toi avec ton compte GitHub (plan **Hobby**).
2. **Add New**, puis **Project**, puis importe le dépôt `canif` (autorise Vercel à lire le dépôt si on te le demande).
3. Vercel doit détecter **Next.js** tout seul. Laisse les réglages de compilation par défaut (`npm run build`).
4. Avant de cliquer sur **Deploy**, déplie **Environment Variables** et ajoute les trois variables du tableau ci-dessus (pour tous les environnements). Coche « Sensitive » pour `CRON_SECRET` si l'option est proposée.
5. **Deploy**. Au bout d'une à deux minutes, Vercel affiche l'adresse du site (en `.vercel.app`).

Si tu ajoutes ou modifies une variable après le premier déploiement, il faut **redéployer** (onglet Deployments, menu du dernier déploiement, Redeploy) pour qu'elle soit prise en compte.

### 8.3 Vérifier

1. Ouvre l'adresse du site : la liste des 72 outils doit s'afficher.
2. Dans le projet Vercel, onglet **Settings** puis **Cron Jobs** (intitulé à vérifier à l'écran) : la tâche `/api/keepalive` doit apparaître, avec l'horaire `0 5 * * *` (chaque jour vers 05:00 UTC, à 59 minutes près sur Hobby).
3. Depuis cet écran, un bouton permet en général de lancer la tâche à la main (**Run**, à vérifier). Le résultat se lit dans l'onglet **Logs** (journaux conservés 1 heure sur Hobby). Une réponse `{"ok":true}` signifie que Supabase a bien été lu.
4. Ouvrir `https://ton-site.vercel.app/api/keepalive` dans un navigateur doit répondre « Non autorisé » : c'est normal, seule la tâche Vercel connaît `CRON_SECRET`.

Prérequis : la table `keepalive` doit exister (étape 5), sinon la route répond `{"ok":false,"statut":404}`.

### 8.4 Ensuite

- À chaque envoi sur la branche `main`, Vercel republie le site. Chaque autre branche reçoit une adresse de prévisualisation.
- Rappel sur l'usage : plan Hobby = non commercial. Pas de publicité, pas de paiement, prudence avec les appels à acheter tes prestations (voir `04-limites-offres-gratuites.md`).
- Vercel propose une intégration Supabase qui peut renseigner les variables automatiquement. Non vérifiée : si tu l'utilises, contrôle que les noms des variables créées correspondent à ceux du tableau ci-dessus.

## Travailler en local

```bash
npm install        # une seule fois, installe les dépendances
npm run dev        # lance le site sur http://localhost:3000
npm run build      # vérifie que tout compile, à faire avant chaque envoi
```

Le fichier `.env.local` (copie de `.env.example`, ignorée par Git) contient les variables locales.

## Étape 9 : avant d'ouvrir au public

- [ ] Nom vérifié (domaine, base de marques de l'INPI) et domaine acheté si souhaité.
- [ ] Mentions légales et page de transparence (quoi est stocké, combien de temps, qui contacter).
- [ ] Adresse de contact pour signaler un contenu, et moyen de supprimer un paquet signalé.
- [ ] Conditions d'utilisation du jeu de cartes (droits sur les images, interdits).
- [ ] Test du buzzer avec 10 téléphones.
- [ ] Vérification que le projet Supabase n'a pas été mis en pause pendant la phase de tests.
- [ ] Relecture juridique des textes (RGPD). Je ne suis pas juriste.

## Ce que seul toi peux faire

Créer les comptes GitHub, Supabase et Vercel, choisir et ranger les mots de passe, récupérer les clés, acheter un domaine, valider les textes légaux. Dès que le dépôt est en ligne, Claude Code dans VS Code peut ensuite construire la phase 0 à partir de `CLAUDE.md`.
