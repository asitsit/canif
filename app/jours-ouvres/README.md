# G8 : Jours ouvrés entre deux dates

Adresse : `/jours-ouvres`.

- Mode « compter » : jours ouvrés (lundi à vendredi), ouvrables (lundi à samedi), calendaires, week-ends, liste des fériés en semaine.
- Mode « ajouter » : date atteinte après N jours ouvrés (jour de départ non compté).
- Jours fériés français calculés (Pâques par l'algorithme de Meeus, dans `lib/dates.ts`) ; options lundi de Pentecôte et Alsace-Moselle.
- Ponts et fermetures propres à une structure non pris en compte (dit dans l'outil).
