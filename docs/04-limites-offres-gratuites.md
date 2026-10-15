# Limites des offres gratuites (vérifiées le 15 octobre 2026)

> Ces chiffres ont été relus sur les pages officielles listées en bas de ce fichier, le 15 octobre 2026. Ils peuvent changer : les revérifier avant chaque décision structurante.

## Supabase, plan Free

| Élément | Limite affichée | Source |
|---|---|---|
| Base de données | 500 Mo par projet | Page tarifs |
| Stockage de fichiers | 1 Go | Page tarifs |
| Taille maximale d'un fichier | 50 Mo | Page tarifs |
| Sortie de données (egress) | 5 Go inclus | Page tarifs |
| Connexions temps réel simultanées | 200 | Page tarifs |
| Messages temps réel | 2 millions par mois | Page tarifs |
| Projets actifs | 2 | Page tarifs |
| Mise en pause | « Free projects are paused after 1 week of inactivity. » | Page tarifs |

**Détail de la mise en pause** (page de documentation « Project Pausing ») :
- Un projet est mis en pause quand il montre une activité faible sur 7 jours. Aucun seuil chiffré n'est donné, seulement l'exemple « a few user requests to the database each day ».
- Compte comme activité : visiter le projet depuis le tableau de bord, ou faire des appels API vers le projet.
- Deux e-mails sont envoyés au propriétaire : un avertissement environ une semaine avant, puis une confirmation.
- Un projet en pause se restaure depuis le tableau de bord (« Resume project »). Le texte de la page indique une restauration possible jusqu'à 1 an, alors qu'une ancre de la même page mentionne 90 jours : **incohérence à vérifier**. Les sauvegardes ne sont conservées que pour une durée limitée.
- Les projets payants ne sont pas mis en pause.

## Vercel, plan Hobby

| Élément | Limite | Source |
|---|---|---|
| Usage autorisé | « restricts users to non-commercial, personal use only » | Page Hobby, règles d'usage équitable |
| Transfert rapide de données | 100 Go inclus | Page Hobby |
| Invocations de fonctions | 1 000 000 inclus | Page Hobby |
| Projets | 200 | Page Hobby |
| Déploiements par jour | 100 | Page Hobby |
| Journaux d'exécution | 1 heure | Page Hobby |
| Tâches planifiées (cron) | 100 par projet, **une fois par jour au maximum**, précision à l'heure près (jusqu'à 59 minutes de décalage) | Page cron |
| Dépassement des limites | Attendre 30 jours pour réutiliser la fonction concernée dans la plupart des cas | Page Hobby |

### Ce que Vercel appelle « usage commercial »
Selon les règles d'usage équitable (relues le 15 octobre 2026), l'usage commercial désigne tout déploiement utilisé dans un but de **gain financier de n'importe quelle personne impliquée dans une partie de la production du projet, y compris un salarié ou un consultant qui écrit le code**. Exemples cités : demander ou traiter un paiement, **faire la publicité de la vente d'un produit ou d'un service**, être payé pour créer, mettre à jour ou héberger le site, liens d'affiliation, publicités. Demander des dons n'en fait **pas** partie.

**Ce que cela implique pour Canif (mon interprétation, pas un avis juridique)** :
- Pas de publicité, pas de paiement, pas d'affiliation.
- Prudence sur tout bouton ou texte qui fait la promotion de tes prestations de conseil ou de facilitation (« réservez un atelier », « mes offres »). Cela pourrait relever de « la publicité de la vente d'un service ». Le plus sûr est de ne pas en mettre, ou de passer au plan Pro. La page Hobby indique 20 $ par utilisateur et par mois pour un siège développeur sur Pro.
- Si le doute persiste, Vercel invite à contacter son support : c'est la seule réponse qui fait foi.

## GitHub Actions

« In a public repository, scheduled workflows are automatically disabled when no repository activity has occurred in 60 days. » Les dépôts publics forkés ont aussi leurs workflows planifiés désactivés par défaut. La page consultée ne mentionne pas les dépôts privés pour cette règle.

## Ce que cela implique pour Canif (calculs avec mes hypothèses de taille)

Hypothèses : une carte image pèse environ 300 Ko (cible fixée), un paquet de 40 cartes environ 12 Mo (20 Mo au pire).

| Sujet | Calcul | Conclusion |
|---|---|---|
| Stockage | 1 Go divisé par 12 à 20 Mo, soit 50 à 85 paquets en même temps | Suffisant au départ, mais la prolongation jusqu'à 30 jours réduit le renouvellement. Surveiller |
| Sortie de données si chaque participant reçoit **tout** le paquet | 30 participants x 12 Mo = 360 Mo par atelier, soit une quinzaine d'ateliers par mois pour 5 Go | **Insuffisant.** À éviter |
| Sortie de données si chaque participant reçoit **seulement sa carte** | 30 x 0,3 Mo = 9 Mo par atelier | Largement suffisant. **Règle d'architecture à respecter** |
| Connexions temps réel | 200 simultanées au maximum | Un grand atelier passe. Plusieurs événements en même temps risquent de dépasser. Comportement exact à la limite : non vérifié |
| Projets Supabase | 2 actifs au maximum | Vérifier que le compte du porteur n'en a pas déjà deux |
| Tâches Vercel | Une par jour au maximum | Suffisant pour la purge quotidienne et un ping de secours |

## Reste à vérifier (non confirmé)

- Liste des régions Supabase disponibles et choix d'une région européenne.
- Nom actuel des clés dans l'interface Supabase (« anon » ou « publishable », « service_role » ou « secret »).
- Façon dont Supabase compte les messages temps réel (un message envoyé à 30 personnes compte-t-il pour 1 ou 30 ?).
- Disponibilité de l'extension pg_cron sur le plan gratuit.
- Suppression des fichiers du stockage : d'après mes connaissances, supprimer des lignes SQL ne supprime pas forcément les fichiers, il faut passer par l'API de stockage.
- Seuil exact d'« activité faible » pour la mise en pause.

## Sources consultées le 15 octobre 2026

- Supabase, tarifs : https://supabase.com/pricing
- Supabase, mise en pause des projets gratuits : https://supabase.com/docs/guides/platform/free-project-pausing
- Vercel, plan Hobby : https://vercel.com/docs/plans/hobby
- Vercel, tâches planifiées (usage et tarifs) : https://vercel.com/docs/cron-jobs/usage-and-pricing
- Vercel, règles d'usage équitable : https://vercel.com/docs/limits/fair-use-guidelines
- GitHub, désactiver et activer des workflows : https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows
