# C10 : Équipes avec paramètres

Équipes selon des critères (service, site, niveau). Adresse : `/equipes-parametres`.

- Une personne par ligne : « Nom ; critère 1 ; critère 2 » (jusqu'à 3 critères), ou colonnes collées depuis un tableur.
- Mode « Mélanger » : chaque personne rejoint l'équipe la moins remplie où elle a le moins de points communs (mixité). Le premier critère est prioritaire sur le deuxième, lui-même prioritaire sur le troisième.
- Mode « Regrouper » : personnes triées par critères puis découpées en équipes consécutives.
- Dans les deux modes, tailles équilibrées (au plus une personne d'écart) ; égalités départagées au hasard. Logique dans `lib/equipes.ts`.
- Bilan par équipe (par exemple « Service : Marketing 1 · RH 1 »). Copier, plein écran ajusté à l'écran.
- Liste gardée dans le navigateur. Aucune donnée envoyée au serveur.
