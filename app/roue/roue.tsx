"use client";

// Roue de noms.
//
// Le gagnant est tiré au sort AVANT l'animation (tirage équitable), puis on
// calcule l'angle final pour que la roue s'arrête sur sa part, sous la flèche
// en haut. L'animation est donc un spectacle : elle ne change rien au hasard.

import { useEffect, useState } from "react";
import ChampNoms, { useListeNoms } from "@/components/liste-noms";
import { usePleinEcran, useRaccourcis } from "@/lib/hooks";
import { entierAleatoire } from "@/lib/hasard";
import { biper, preparerSon } from "@/lib/son";
import styles from "./roue.module.css";

// Durée de rotation, en millisecondes (plus courte si l'on a demandé moins d'animations).
const DUREE_ROTATION = 4500;
const DUREE_ROTATION_REDUITE = 600;

// Dimensions du dessin (unités SVG).
const TAILLE = 400;
const CENTRE = TAILLE / 2;
const RAYON = 190;

// Point du cercle à un angle donné (en degrés, mesuré depuis le haut dans le sens horaire).
function point(angle: number, rayon = RAYON) {
  const radians = (angle * Math.PI) / 180;
  return { x: CENTRE + rayon * Math.sin(radians), y: CENTRE - rayon * Math.cos(radians) };
}

// Tracé d'une part de la roue entre deux angles.
function tracePart(debut: number, fin: number) {
  const a = point(debut);
  const b = point(fin);
  const grandArc = fin - debut > 180 ? 1 : 0;
  return `M ${CENTRE} ${CENTRE} L ${a.x} ${a.y} A ${RAYON} ${RAYON} 0 ${grandArc} 1 ${b.x} ${b.y} Z`;
}

// Couleur d'une part (évite deux parts voisines de même couleur entre la dernière et la première).
function couleur(index: number, total: number) {
  let n = index % 8;
  if (index === total - 1 && total > 1 && n === 0) n = 1;
  return `var(--equipe-${n})`;
}

export default function Roue() {
  const liste = useListeNoms();
  const [retirerTire, setRetirerTire] = useState(false);
  const [sonActif, setSonActif] = useState(true);
  const [exclus, setExclus] = useState<number[]>([]); // positions des noms retirés de la roue
  const [rotation, setRotation] = useState(0); // angle total de la roue, en degrés
  const [enRotation, setEnRotation] = useState(false);
  const [gagnant, setGagnant] = useState<number | null>(null); // position du nom tiré dans la liste
  // Nom à retirer au prochain tour : seulement s'il a été tiré pendant que l'option était cochée.
  const [aRetirer, setARetirer] = useState<number | null>(null);
  const [mouvementReduit, setMouvementReduit] = useState(false);

  const pleinEcran = usePleinEcran<HTMLDivElement>();

  // Si la liste change, on repart d'une roue complète.
  useEffect(() => {
    setExclus([]);
    setGagnant(null);
    setARetirer(null);
  }, [liste.texte]);

  useEffect(() => {
    setMouvementReduit(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Positions (dans la liste) des noms présents sur la roue.
  const presents = liste.noms.map((_, i) => i).filter((i) => !exclus.includes(i));
  const angle = presents.length > 0 ? 360 / presents.length : 360;
  const duree = mouvementReduit ? DUREE_ROTATION_REDUITE : DUREE_ROTATION;

  function tourner() {
    if (enRotation) return;
    preparerSon();

    // Option « retirer le nom tiré » : il quitte la roue au tour suivant.
    let surLaRoue = presents;
    if (retirerTire && aRetirer !== null) {
      const nouveauxExclus = [...exclus, aRetirer];
      setExclus(nouveauxExclus);
      surLaRoue = liste.noms.map((_, i) => i).filter((i) => !nouveauxExclus.includes(i));
    }
    setARetirer(null);
    if (surLaRoue.length === 0) return;

    // 1. Tirage du gagnant.
    const part = entierAleatoire(surLaRoue.length);
    const anglePart = 360 / surLaRoue.length;

    // 2. Angle final : plusieurs tours complets, puis arrêt au milieu de la part
    //    gagnante (avec un léger décalage aléatoire pour paraître naturel).
    const decalage = ((entierAleatoire(61) - 30) / 100) * anglePart; // entre -30 % et +30 % de la part
    const arret = 360 - (part + 0.5) * anglePart + decalage;
    const toursComplets = Math.ceil(rotation / 360) * 360 + 5 * 360;
    setRotation(toursComplets + arret);

    setGagnant(null);
    setEnRotation(true);
    setTimeout(() => {
      setGagnant(surLaRoue[part]);
      if (retirerTire) setARetirer(surLaRoue[part]);
      setEnRotation(false);
    }, duree);
  }

  // Petit signal sonore quand la roue s'arrête.
  useEffect(() => {
    if (gagnant !== null && sonActif) biper(1, 990);
  }, [gagnant, sonActif]);

  function remettreTousLesNoms() {
    setExclus([]);
    setGagnant(null);
    setARetirer(null);
  }

  useRaccourcis({ " ": tourner, f: () => pleinEcran.possible && pleinEcran.basculer() });

  // Taille du texte selon le nombre de parts.
  const tailleTexte = presents.length > 24 ? 9 : presents.length > 12 ? 12 : 16;

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Réglages">
        <ChampNoms texte={liste.texte} onChange={liste.modifier} nombre={liste.noms.length} />
        <label className="option">
          <input type="checkbox" checked={retirerTire} onChange={(e) => setRetirerTire(e.target.checked)} />
          Retirer le nom tiré pour les tours suivants
        </label>
        <label className="option">
          <input type="checkbox" checked={sonActif} onChange={(e) => setSonActif(e.target.checked)} />
          Signal sonore à l'arrêt
        </label>
        {exclus.length > 0 && (
          <p className="discret">
            Déjà tirés : {exclus.map((i) => liste.noms[i]).join(", ")}.{" "}
            <button type="button" className="lien-bouton" onClick={remettreTousLesNoms}>
              Remettre tous les noms
            </button>
          </p>
        )}
      </section>

      <div ref={pleinEcran.ref} className={`resultat ${styles.zone} ${pleinEcran.actif ? "ecran-plein" : ""}`}>
        {presents.length === 0 ? (
          <p className="discret">
            {liste.noms.length === 0 ? "Ajoutez des noms pour remplir la roue." : "Tous les noms ont été tirés."}
          </p>
        ) : (
          <div className={styles.cadre}>
            <div className={styles.fleche} aria-hidden="true" />
            <div
              className={styles.disque}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: enRotation ? `transform ${duree}ms cubic-bezier(0.15, 0.6, 0.1, 1)` : "none",
              }}
            >
              <svg viewBox={`0 0 ${TAILLE} ${TAILLE}`} role="img" aria-label={`Roue de ${presents.length} noms`}>
                {presents.length === 1 ? (
                  <circle cx={CENTRE} cy={CENTRE} r={RAYON} fill={couleur(0, 1)} />
                ) : (
                  presents.map((position, i) => (
                    <path
                      key={position}
                      d={tracePart(i * angle, (i + 1) * angle)}
                      fill={couleur(i, presents.length)}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))
                )}
                {presents.map((position, i) => {
                  const milieu = (i + 0.5) * angle;
                  const nom = liste.noms[position];
                  // Les noms se lisent du centre vers le bord (la roue tourne : aucun sens
                  // ne reste « à l'endroit », c'est la convention habituelle des roues).
                  return (
                    <text
                      key={position}
                      x={CENTRE + RAYON * 0.6}
                      y={CENTRE}
                      transform={`rotate(${milieu - 90} ${CENTRE} ${CENTRE})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontSize={tailleTexte}
                      fontWeight={700}
                    >
                      {nom.length > 16 ? nom.slice(0, 15) + "…" : nom}
                    </text>
                  );
                })}
                <circle cx={CENTRE} cy={CENTRE} r={18} fill="#ffffff" stroke="var(--bordure)" strokeWidth={2} />
              </svg>
            </div>
          </div>
        )}

        <p className={styles.gagnant} aria-live="polite">
          {gagnant !== null ? liste.noms[gagnant] : " "}
        </p>

        <div className="commandes">
          <button className="bouton bouton-principal" onClick={tourner} disabled={enRotation || presents.length === 0}>
            {enRotation ? "La roue tourne..." : "Faire tourner"}
          </button>
          {pleinEcran.possible && (
            <button className="bouton" onClick={pleinEcran.basculer}>
              {pleinEcran.actif ? "Quitter le plein écran" : "Plein écran"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
