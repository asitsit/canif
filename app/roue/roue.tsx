"use client";

// Roue de noms.
//
// Le gagnant est tiré au sort AVANT l'animation (tirage équitable), puis on
// calcule l'angle final pour que la roue s'arrête sur sa part, sous la flèche
// en haut. L'animation est donc un spectacle : elle ne change rien au hasard.

import { useEffect, useState } from "react";
import BoutonPleinEcran from "@/components/bouton-plein-ecran";
import ChampNoms, { useListeNoms } from "@/components/liste-noms";
import { usePleinEcran, useRaccourcis } from "@/lib/hooks";
import { entierAleatoire } from "@/lib/hasard";
import { biper, preparerSon } from "@/lib/son";
import { couleurPart, couleurTexte, PALETTES, PERSO_DEPART } from "./couleurs";
import styles from "./roue.module.css";

// Durée de rotation : réglable de 1 à 20 secondes. Si le système demande
// moins d'animations, elle est limitée à 0,6 seconde.
const DUREE_DEFAUT_S = 4.5;
const DUREE_REDUITE_MS = 600;

// Réglages gardés dans le navigateur.
const CLE_STOCKAGE = "canif.roue.reglages";
type Reglages = { palette: string; perso: string[]; dureeS: number };
const REGLAGES_DEFAUT: Reglages = { palette: "canif", perso: PERSO_DEPART, dureeS: DUREE_DEFAUT_S };

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

export default function Roue() {
  const liste = useListeNoms();
  const [retirerTire, setRetirerTire] = useState(false);
  const [sonActif, setSonActif] = useState(true);
  const [reglages, setReglages] = useState<Reglages>(REGLAGES_DEFAUT);
  const [exclus, setExclus] = useState<number[]>([]); // positions des noms retirés de la roue
  const [choix, setChoix] = useState<number[]>([]); // ordre des noms tirés (positions dans la liste)
  const [rotation, setRotation] = useState(0); // angle total de la roue, en degrés
  const [enRotation, setEnRotation] = useState(false);
  const [gagnant, setGagnant] = useState<number | null>(null); // position du nom tiré dans la liste
  // Nom à retirer au prochain tour : seulement s'il a été tiré pendant que l'option était cochée.
  const [aRetirer, setARetirer] = useState<number | null>(null);
  const [mouvementReduit, setMouvementReduit] = useState(false);

  const pleinEcran = usePleinEcran<HTMLDivElement>();

  // --- Réglages : lecture et enregistrement dans le navigateur ---

  useEffect(() => {
    setMouvementReduit(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    try {
      const sauvegarde = localStorage.getItem(CLE_STOCKAGE);
      if (sauvegarde) setReglages({ ...REGLAGES_DEFAUT, ...JSON.parse(sauvegarde) });
    } catch {
      // réglages illisibles ou stockage indisponible : réglages par défaut
    }
  }, []);

  function modifierReglages(modif: Partial<Reglages>) {
    const nouveaux = { ...reglages, ...modif };
    setReglages(nouveaux);
    try {
      localStorage.setItem(CLE_STOCKAGE, JSON.stringify(nouveaux));
    } catch {
      // sans gravité
    }
  }

  function modifierCouleurPerso(index: number, valeur: string) {
    modifierReglages({ perso: reglages.perso.map((c, i) => (i === index ? valeur : c)) });
  }

  // Si la liste change, on repart d'une roue complète.
  useEffect(() => {
    setExclus([]);
    setChoix([]);
    setGagnant(null);
    setARetirer(null);
  }, [liste.texte]);

  // --- Calculs ---

  const couleurs =
    reglages.palette === "perso"
      ? reglages.perso
      : (PALETTES[reglages.palette] ?? PALETTES.canif).couleurs;

  // Positions (dans la liste) des noms présents sur la roue.
  const presents = liste.noms.map((_, i) => i).filter((i) => !exclus.includes(i));
  const angle = presents.length > 0 ? 360 / presents.length : 360;
  const duree = mouvementReduit ? DUREE_REDUITE_MS : reglages.dureeS * 1000;

  // --- Commandes ---

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

    // 2. Angle final : plusieurs tours complets (plus si l'animation est longue),
    //    puis arrêt au milieu de la part gagnante, avec un léger décalage aléatoire.
    const decalage = ((entierAleatoire(61) - 30) / 100) * anglePart; // entre -30 % et +30 % de la part
    const arret = 360 - (part + 0.5) * anglePart + decalage;
    const nombreTours = Math.max(3, Math.round(duree / 900));
    const toursComplets = Math.ceil(rotation / 360) * 360 + nombreTours * 360;
    setRotation(toursComplets + arret);

    const retirer = retirerTire;
    setGagnant(null);
    setEnRotation(true);
    setTimeout(() => {
      setGagnant(surLaRoue[part]);
      setChoix((c) => [...c, surLaRoue[part]]);
      if (retirer) setARetirer(surLaRoue[part]);
      setEnRotation(false);
    }, duree);
  }

  // Petit signal sonore quand la roue s'arrête.
  useEffect(() => {
    if (gagnant !== null && sonActif) biper(1, 990);
  }, [gagnant, sonActif]);

  // Remet tous les noms sur la roue et efface l'ordre des choix.
  function recommencer() {
    setExclus([]);
    setChoix([]);
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

        <label className="champ">
          Durée de l'animation : {reglages.dureeS.toLocaleString("fr-FR")} s
          <input
            type="range"
            min={1}
            max={20}
            step={0.5}
            value={reglages.dureeS}
            onChange={(e) => modifierReglages({ dureeS: Number(e.target.value) })}
          />
        </label>
        {mouvementReduit && (
          <p className="discret">
            Votre appareil demande de réduire les animations : la roue s'arrête en moins d'une seconde.
          </p>
        )}

        <fieldset className={styles.palettes}>
          <legend>Couleurs</legend>
          {Object.entries(PALETTES).map(([id, palette]) => (
            <label key={id} className={styles.palette}>
              <input
                type="radio"
                name="palette"
                checked={reglages.palette === id}
                onChange={() => modifierReglages({ palette: id })}
              />
              <span className={styles.nuancier} aria-hidden="true">
                {palette.couleurs.map((c, i) => (
                  <span key={i} style={{ background: c }} />
                ))}
              </span>
              {palette.nom}
            </label>
          ))}
          <label className={styles.palette}>
            <input
              type="radio"
              name="palette"
              checked={reglages.palette === "perso"}
              onChange={() => modifierReglages({ palette: "perso" })}
            />
            <span className={styles.nuancier} aria-hidden="true">
              {reglages.perso.map((c, i) => (
                <span key={i} style={{ background: c }} />
              ))}
            </span>
            Personnalisée
          </label>

          {reglages.palette === "perso" && (
            <div className={styles.perso}>
              {reglages.perso.map((c, i) => (
                <span key={i} className={styles.persoCouleur}>
                  <input
                    type="color"
                    value={c}
                    onChange={(e) => modifierCouleurPerso(i, e.target.value)}
                    aria-label={`Couleur ${i + 1}`}
                  />
                  {reglages.perso.length > 2 && (
                    <button
                      type="button"
                      className={styles.retirer}
                      onClick={() => modifierReglages({ perso: reglages.perso.filter((_, j) => j !== i) })}
                      aria-label={`Retirer la couleur ${i + 1}`}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
              {reglages.perso.length < 8 && (
                <button
                  type="button"
                  className="lien-bouton"
                  onClick={() => modifierReglages({ perso: [...reglages.perso, "#64748b"] })}
                >
                  Ajouter une couleur
                </button>
              )}
            </div>
          )}
        </fieldset>
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
                {presents.map((position, i) => {
                  const fond = couleurPart(couleurs, i, presents.length);
                  return presents.length === 1 ? (
                    <circle key={position} cx={CENTRE} cy={CENTRE} r={RAYON} fill={fond} />
                  ) : (
                    <path
                      key={position}
                      d={tracePart(i * angle, (i + 1) * angle)}
                      fill={fond}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  );
                })}
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
                      fill={couleurTexte(couleurPart(couleurs, i, presents.length))}
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
          <BoutonPleinEcran pleinEcran={pleinEcran} />
        </div>

        {choix.length > 0 && (
          <div className={styles.choix}>
            <h2 className={styles.titreChoix}>Ordre des choix</h2>
            <ol className={styles.listeChoix}>
              {choix.map((position, i) => (
                <li key={i}>
                  <span className={styles.numero}>{i + 1}</span>
                  {liste.noms[position]}
                </li>
              ))}
            </ol>
            <button type="button" className="lien-bouton" onClick={recommencer}>
              {exclus.length > 0 ? "Recommencer avec tous les noms" : "Effacer l'ordre des choix"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
