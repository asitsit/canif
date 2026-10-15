// « Hooks » React communs aux outils : des morceaux de comportement réutilisables.
// Ils ne fonctionnent que dans un composant marqué "use client".

import { type RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Chronomètre qui mesure le temps écoulé, avec pause et reprise.
// Il retient l'heure de départ et recalcule 4 fois par seconde : il reste
// donc juste même si le navigateur ralentit un onglet en arrière-plan.
export function useChrono() {
  const [ecouleMs, setEcouleMs] = useState(0);
  const [enCours, setEnCours] = useState(false);
  const ecouleRef = useRef(0); // copie de ecouleMs, lisible à tout moment
  const departRef = useRef(0); // heure de départ, décalée du temps déjà écoulé

  const mettreAJour = useCallback((valeur: number) => {
    ecouleRef.current = valeur;
    setEcouleMs(valeur);
  }, []);

  useEffect(() => {
    if (!enCours) return;
    const intervalle = setInterval(() => mettreAJour(Date.now() - departRef.current), 250);
    return () => clearInterval(intervalle);
  }, [enCours, mettreAJour]);

  const demarrer = useCallback(() => {
    departRef.current = Date.now() - ecouleRef.current;
    setEnCours(true);
  }, []);

  const mettreEnPause = useCallback(() => {
    mettreAJour(Date.now() - departRef.current);
    setEnCours(false);
  }, [mettreAJour]);

  const reinitialiser = useCallback(() => {
    setEnCours(false);
    mettreAJour(0);
  }, [mettreAJour]);

  return { ecouleMs, enCours, demarrer, mettreEnPause, reinitialiser };
}

// Heure actuelle, mise à jour régulièrement (par défaut 4 fois par seconde).
// Vaut 0 tant que la page n'est pas chargée dans le navigateur : les pages étant
// préparées à l'avance sur le serveur, l'heure du serveur n'aurait aucun sens.
export function useMaintenant(intervalleMs = 250) {
  const [maintenant, setMaintenant] = useState(0);
  useEffect(() => {
    setMaintenant(Date.now());
    const intervalle = setInterval(() => setMaintenant(Date.now()), intervalleMs);
    return () => clearInterval(intervalle);
  }, [intervalleMs]);
  return maintenant;
}

// Plein écran sur un élément de la page.
// `possible` est faux sur iPhone (Safari ne le permet pas) : masquer alors le bouton.
export function usePleinEcran<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [possible, setPossible] = useState(false);
  const [actif, setActif] = useState(false);

  useEffect(() => {
    setPossible(document.fullscreenEnabled);
    const auChangement = () => setActif(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", auChangement);
    return () => document.removeEventListener("fullscreenchange", auChangement);
  }, []);

  const basculer = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else ref.current?.requestFullscreen();
  }, []);

  return { ref, possible, actif, basculer };
}

// Fait tenir une liste sur un seul écran en plein écran, sans défilement.
// Essaie 1 à `maxColonnes` colonnes et, pour chacune, cherche la plus grande
// taille de texte qui tient ; garde la combinaison au texte le plus grand.
// En dessous de `tailleMin` pixels, on préfère laisser défiler (lisibilité).
// La liste doit utiliser la variable CSS --colonnes et des tailles en « em ».
export function useAjusterAuPleinEcran(
  conteneur: RefObject<HTMLElement | null>,
  liste: RefObject<HTMLElement | null>,
  actif: boolean,
  contenu: unknown, // recalcul quand le contenu change
  { maxColonnes = 4, tailleMin = 16, tailleMax = 72 } = {},
) {
  useLayoutEffect(() => {
    const el = liste.current;
    if (!actif || !el) return;

    function tient(colonnes: number, taille: number) {
      const c = conteneur.current;
      if (!c || !el) return false;
      el.style.setProperty("--colonnes", String(colonnes));
      el.style.fontSize = `${taille}px`;
      return c.scrollHeight <= c.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1;
    }

    function calculer() {
      let meilleur: { colonnes: number; taille: number } | null = null;
      for (let colonnes = 1; colonnes <= maxColonnes; colonnes++) {
        if (!tient(colonnes, tailleMin)) continue;
        // Recherche par dichotomie de la plus grande taille qui tient.
        let bas = tailleMin;
        let haut = tailleMax + 1;
        while (haut - bas > 1) {
          const milieu = Math.floor((bas + haut) / 2);
          if (tient(colonnes, milieu)) bas = milieu;
          else haut = milieu;
        }
        if (!meilleur || bas > meilleur.taille) meilleur = { colonnes, taille: bas };
      }
      // Rien ne tient, même au plus petit : taille minimale, nombre maximal de colonnes, et défilement.
      const choix = meilleur ?? { colonnes: maxColonnes, taille: tailleMin };
      tient(choix.colonnes, choix.taille);
    }

    calculer();
    window.addEventListener("resize", calculer);
    return () => {
      window.removeEventListener("resize", calculer);
      el.style.removeProperty("--colonnes");
      el.style.removeProperty("font-size");
    };
  }, [conteneur, liste, actif, contenu, maxColonnes, tailleMin, tailleMax]);
}

// Empêche la mise en veille de l'écran tant que `actif` est vrai
// (si le navigateur le permet ; un refus est sans gravité).
export function useEcranAllume(actif: boolean) {
  useEffect(() => {
    if (!actif || !("wakeLock" in navigator)) return;
    let verrou: WakeLockSentinel | null = null;
    navigator.wakeLock
      .request("screen")
      .then((v) => (verrou = v))
      .catch(() => {});
    return () => {
      verrou?.release();
    };
  }, [actif]);
}

// Affiche un texte dans le titre de l'onglet tant que `texte` n'est pas vide.
export function useTitreOnglet(texte: string) {
  useEffect(() => {
    if (!texte) return;
    const titreInitial = document.title;
    document.title = texte;
    return () => {
      document.title = titreInitial;
    };
  }, [texte]);
}

// Raccourcis clavier : `actions` associe une touche (" " pour Espace, "r", "f"...)
// à une fonction. Ignorés pendant la saisie dans un champ ou sur un bouton.
export function useRaccourcis(actions: Record<string, () => void>) {
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    function auClavier(e: KeyboardEvent) {
      const cible = e.target as HTMLElement;
      if (cible.closest("input, button, select, textarea")) return;
      const action = actionsRef.current[e.key.toLowerCase()];
      if (action) {
        e.preventDefault();
        action();
      }
    }
    window.addEventListener("keydown", auClavier);
    return () => window.removeEventListener("keydown", auClavier);
  }, []);
}
