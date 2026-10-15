// Bips sonores générés par le navigateur (aucun fichier audio à télécharger).
//
// Les navigateurs n'autorisent le son qu'après une action de la personne
// (un clic). Il faut donc appeler preparerSon() dans un clic, par exemple
// sur « Démarrer », avant de pouvoir appeler biper() plus tard.

let contexte: AudioContext | null = null;

export function preparerSon() {
  if (!contexte && typeof window !== "undefined" && "AudioContext" in window) {
    contexte = new AudioContext();
  }
  contexte?.resume();
}

// Joue `nombre` bips courts à la fréquence donnée (en hertz).
export function biper(nombre = 3, frequence = 880) {
  if (!contexte) return;
  for (let i = 0; i < nombre; i++) {
    const debut = contexte.currentTime + i * 0.45;
    const oscillateur = contexte.createOscillator();
    const volume = contexte.createGain();
    oscillateur.frequency.value = frequence;
    volume.gain.setValueAtTime(0.0001, debut);
    volume.gain.exponentialRampToValueAtTime(0.4, debut + 0.02);
    volume.gain.exponentialRampToValueAtTime(0.0001, debut + 0.35);
    oscillateur.connect(volume).connect(contexte.destination);
    oscillateur.start(debut);
    oscillateur.stop(debut + 0.4);
  }
}
