// Fonctions communes aux outils de temps (minuteur, chronomètre, pause, Pomodoro).

// Transforme des millisecondes en texte « 04:59 » ou « 1:04:59 ».
// arrondi "haut" pour un compte à rebours (on affiche 00:01 jusqu'à la toute fin),
// arrondi "bas" pour un temps écoulé (on affiche 00:00 pendant la première seconde).
export function formater(ms: number, arrondi: "haut" | "bas" = "haut") {
  const secondesExactes = Math.max(ms, 0) / 1000;
  const totalSecondes = arrondi === "haut" ? Math.ceil(secondesExactes) : Math.floor(secondesExactes);
  const heures = Math.floor(totalSecondes / 3600);
  const minutes = Math.floor((totalSecondes % 3600) / 60);
  const secondes = totalSecondes % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(secondes).padStart(2, "0");
  return heures > 0 ? `${heures}:${mm}:${ss}` : `${mm}:${ss}`;
}

// Affiche une heure « 10:45 » à partir d'une date.
export function formaterHeure(date: Date) {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

// Quelques constantes pour lire le code plus facilement.
export const SECONDE = 1000;
export const MINUTE = 60 * SECONDE;
export const HEURE = 60 * MINUTE;
