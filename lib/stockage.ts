// Mémoire locale des outils : les données restent dans le navigateur de la
// personne (localStorage), rien n'est envoyé au serveur.

import { useCallback, useEffect, useState } from "react";

// Comme useState, mais la valeur est gardée dans le navigateur sous la clé
// « canif.<cle> » et retrouvée à la visite suivante. Si le stockage est
// indisponible (navigation privée...), l'outil fonctionne quand même, sans mémoire.
export function useStockageLocal<T>(cle: string, defaut: T) {
  const cleComplete = `canif.${cle}`;
  const [valeur, setValeur] = useState<T>(defaut);

  // Lecture après le chargement de la page (la page est préparée sur le serveur,
  // qui ne connaît pas le navigateur).
  useEffect(() => {
    try {
      const sauvegarde = localStorage.getItem(cleComplete);
      if (sauvegarde !== null) setValeur(JSON.parse(sauvegarde) as T);
    } catch {
      // stockage indisponible ou contenu illisible : on garde la valeur par défaut
    }
  }, [cleComplete]);

  const modifier = useCallback(
    (nouvelle: T | ((ancienne: T) => T)) => {
      setValeur((ancienne) => {
        const resultat = typeof nouvelle === "function" ? (nouvelle as (a: T) => T)(ancienne) : nouvelle;
        try {
          localStorage.setItem(cleComplete, JSON.stringify(resultat));
        } catch {
          // sans gravité
        }
        return resultat;
      });
    },
    [cleComplete],
  );

  return [valeur, modifier] as const;
}

// Identifiant court et unique pour les éléments d'une liste (post-its, tâches...).
export function nouvelId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
