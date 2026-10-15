# Canif : contexte pour Claude Code

Ce fichier est lu au début de chaque session. Il résume le projet et les règles à respecter. Le détail est dans `docs/`.

## Le projet en trois lignes

Canif (nom de travail) est un site public et gratuit regroupant 72 outils pour facilitateurs, consultants, chefs de projet et entrepreneurs. Il est hébergé sur Vercel, utilise Supabase pour les outils partagés (temps réel, jeu de cartes) et le code vit sur GitHub. Le porteur du projet code dans VS Code et n'est pas forcément développeur : le code doit rester simple, lisible et commenté en français.

## État actuel

- Phase 0 (fondations) : faite le 15/10/2026.
- Phases 1 et 5 (outils sans serveur) : faites le 15/10/2026. 62 outils sur 72 sont en ligne (champ `pret: true` dans `lib/catalogue.ts`).
- Restent à construire, et à valider avec le porteur avant de coder :
  - les 9 outils à mémoire serveur (B8, C14, C16, C17, C18, C19, C21, C25, C27) : schéma Supabase du moteur de session à faire valider (règle 7), décisions D2, D6, D7, D16, D17, D18 ;
  - C31 suppression de fond : bibliothèque d'IA à évaluer (licence, poids, qualité ; risque R3) avant tout engagement ;
  - le formulaire de suggestions d'outils et le vote « Je veux cet outil » : proposés au porteur, table Supabase à valider.
- Framework : Next.js 16 + TypeScript (décision P13, confirmée).
- Contenus rédigés pour Canif (questions B1, défis B6, cases B2, listes A2 et A6, rôles C15) : première série originale, à relire par le porteur (D19).

## Décisions prises (ne pas remettre en cause sans demander)

- Usage public, sans objectif commercial. Pas de publicité, pas de paiement. Les dons restent permis par les règles de Vercel Hobby.
- Lancement avec tous les outils retenus, outils uniquement (pas de mode Atelier, favoris, recherche, compte pour l'instant).
- Participants anonymes, sans compte. Facilitateur sans compte au départ (lien d'administration secret).
- Transparence : tout outil avec mémoire serveur affiche ce qui est stocké et pour combien de temps (voir phrase type dans le catalogue).
- Jeu de cartes (C14) : 40 cartes maximum, conservé 7 jours, bouton « Prolonger de 7 jours », images redimensionnées à 1200 px et recompressées dans le navigateur avant envoi (cible environ 300 Ko, plafond 500 Ko).
- Mots croisés (B9) : niveau 1 uniquement (générateur imprimable).
- Rétrospective (E10) : version simple, sans serveur.
- Contenus 100 % originaux. Ne reprendre aucun contenu de « Le Bruit des Glaçons », des questions d'Augustin Trapenard, ni d'un autre auteur.

## Règles de travail

1. **Honnêteté d'abord** : si un fait n'est pas vérifié (limite d'une offre gratuite, comportement d'une bibliothèque, nom d'une option dans une interface), le dire et le marquer « à vérifier ». Ne jamais inventer de source, d'URL, de chiffre ou de référence.
2. **Écriture** : ne jamais utiliser le tiret cadratin. Utiliser des parenthèses ou reformuler. Cela vaut pour le code (commentaires, textes affichés) et pour les documents.
3. **Sécurité** : aucune clé secrète dans le dépôt ni dans le code du navigateur. Activer le Row Level Security (RLS) sur toute table avant de l'exposer. La date d'expiration est toujours calculée côté serveur.
4. **Données** : minimales et temporaires. Toute donnée de session expire. Suppression logique immédiate (on ne sert plus un élément expiré), suppression physique ensuite.
5. **Mobile d'abord** pour les écrans des participants, grand écran lisible pour le facilitateur (projection).
6. **Un outil terminé avant d'en commencer un autre.** Critères de « terminé » dans `docs/00-cadrage.md`.
7. **Petits pas** : proposer un plan court avant d'écrire beaucoup de code, et demander validation sur toute décision structurante (framework, schéma de base de données, bibliothèque lourde).
8. **Journal** : toute décision nouvelle est ajoutée dans `docs/02-decisions.md` avec sa date.

## Points techniques à garder en tête

- Supabase gratuit : pause après 7 jours d'activité faible. La tâche `.github/workflows/keepalive.yml` doit rester fonctionnelle (voir `docs/03-guide-demarrage.md`).
- Bande passante sortante de Supabase gratuit : 5 Go par mois. Le jeu de cartes ne doit envoyer à un participant que la carte qu'il a piochée, jamais tout le paquet (voir `docs/05-architecture.md`).
- Vercel Hobby : tâches planifiées une fois par jour au maximum, avec une imprécision pouvant atteindre 59 minutes.
- Buzzer : l'ordre est celui de l'arrivée au serveur, pas de l'instant exact du clic. Le dire dans l'interface.

## Conventions de code

- Next.js 16, App Router, TypeScript, CSS simple dans `app/globals.css` (pas de Tailwind ni de bibliothèque d'interface).
- `lib/catalogue.ts` : liste des outils (copie de `docs/01-catalogue.md`, qui fait foi). Passer `pret: true` quand un outil est terminé.
- `app/[outil]/page.tsx` : page d'attente générique pour chaque outil non construit.
- **Un dossier par outil** : `app/<slug>/page.tsx` (par exemple `app/minuteur/`). Ce dossier prend automatiquement la priorité sur la page générique. Les composants propres à l'outil restent dans son dossier.
- Briques communes, à réutiliser avant d'en écrire de nouvelles :
  - `components/entete-outil.tsx` : en-tête de page d'outil (fil d'Ariane, nom), tiré du catalogue.
  - `lib/hooks.ts` : `useChrono` (temps écoulé avec pause), `useMaintenant`, `usePleinEcran`, `useEcranAllume`, `useTitreOnglet`, `useRaccourcis`.
  - `lib/temps.ts` (formatage des durées et des heures) et `lib/son.ts` (bips, sans fichier audio).
  - `lib/hasard.ts` : tirages équitables (`entierAleatoire`, `melanger`, `lireListe`), toujours via `crypto.getRandomValues`.
  - `components/liste-noms.tsx` : liste de noms partagée entre les outils de tirage (`useListeNoms`, `ChampNoms`).
  - `components/bouton-copier.tsx` : bouton « Copier le résultat ».
  - `components/bouton-plein-ecran.tsx` : bouton plein écran commun (« Quitter » fixé en haut à droite). `useAjusterAuPleinEcran` fait tenir une liste sur un écran.
  - `lib/programme.ts` : lecture d'un programme en texte (« Accueil : 10 min »), utilisée par C2 et C3.
  - `lib/equipes.ts` : répartitions en équipes (simple et avec critères), utilisées par C9 et C10.
  - `components/page-outil.tsx` : modèle de page d'outil (`metaOutil`, `PageOutil`).
  - `lib/stockage.ts` : `useStockageLocal` (mémoire dans le navigateur, préfixe `canif.`) et `nouvelId`.
  - `components/boutons-export.tsx` : « Télécharger en image » (html-to-image) et « Imprimer ou PDF ». Classes `pas-imprimer` et `pas-exporter` pour masquer un élément.
  - `components/tableau-zones.tsx` : tableau de post-its à zones (matrices, canevas, rétrospective, Ishikawa).
  - `components/generateur-texte.tsx` : formulaire vers texte modifiable (invitation, remerciement, compte rendu, pitch, synthèse).
  - `components/liste-cochable.tsx`, `components/matrice-decision.tsx`, `components/frise-gantt.tsx`, `components/tirage-cartes.tsx`, `components/traitement-images.tsx`.
  - `lib/dates.ts` (jours fériés, Pâques), `lib/nombres.ts` (euros, pourcentages), `lib/texte.ts` (mots, fréquences), `lib/redaction.ts`, `lib/couleurs.ts` (contraste WCAG), `lib/images.ts`.
- Bibliothèques externes (versions exactes, licence MIT), chargées seulement là où elles servent : `qrcode` (A1), `pdf-lib` (G4), `html-to-image` (export image).
  - `app/globals.css` : classes partagées (`.bouton`, `.champ`, `.ecran`, `.chiffres`, `.barre`, `.commandes`, `.reglages`...). Les styles propres à un outil vont dans son `*.module.css`.
- Chaque outil a un `README.md` de quelques lignes dans son dossier.
- `app/api/` : routes serveur (seul endroit où une clé secrète pourra être lue).
- Variables lues dans le navigateur : préfixe `NEXT_PUBLIC_` obligatoire. Jamais de clé secrète avec ce préfixe.
- Noms de fichiers et de dossiers en minuscules sans accents, textes de l'interface et commentaires en français.
- Vérifier avant chaque envoi : `npm run build` doit réussir.
