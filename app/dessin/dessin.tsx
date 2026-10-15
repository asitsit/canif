"use client";

// Page blanche de dessin : crayon, couleurs, épaisseurs, gomme, annuler,
// plein écran et téléchargement en PNG. Souris, doigt et stylet (Pointer Events).

import { useCallback, useEffect, useRef, useState } from "react";
import BoutonPleinEcran from "@/components/bouton-plein-ecran";
import { usePleinEcran, useRaccourcis } from "@/lib/hooks";
import { telecharger } from "@/lib/images";
import styles from "./dessin.module.css";

const COULEURS = ["#111827", "#c2410c", "#1d4ed8", "#15803d", "#7e22ce", "#eab308", "#be123c", "#ffffff"];
const EPAISSEURS = [3, 6, 12, 24];
const MAX_ANNULATIONS = 30;

export default function Dessin() {
  const canevas = useRef<HTMLCanvasElement>(null);
  const historique = useRef<ImageData[]>([]);
  const dernier = useRef<{ x: number; y: number } | null>(null);
  const [couleur, setCouleur] = useState(COULEURS[0]);
  const [epaisseur, setEpaisseur] = useState(EPAISSEURS[1]);
  const [gomme, setGomme] = useState(false);
  const [peutAnnuler, setPeutAnnuler] = useState(false);
  const pleinEcran = usePleinEcran<HTMLDivElement>();

  const contexte = () => canevas.current?.getContext("2d") ?? null;

  // Taille du canevas = taille affichée × densité de l'écran (trait net),
  // en conservant le dessin existant lors d'un redimensionnement.
  const ajuster = useCallback(() => {
    const c = canevas.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = c.getBoundingClientRect();
    const copie = document.createElement("canvas");
    copie.width = c.width;
    copie.height = c.height;
    copie.getContext("2d")?.drawImage(c, 0, 0);
    c.width = Math.round(width * ratio);
    c.height = Math.round(height * ratio);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(copie, 0, 0);
  }, []);

  useEffect(() => {
    ajuster();
    window.addEventListener("resize", ajuster);
    return () => window.removeEventListener("resize", ajuster);
  }, [ajuster, pleinEcran.actif]);

  function position(e: React.PointerEvent) {
    const c = canevas.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  }

  function memoriser() {
    const c = canevas.current;
    const ctx = contexte();
    if (!c || !ctx) return;
    historique.current.push(ctx.getImageData(0, 0, c.width, c.height));
    if (historique.current.length > MAX_ANNULATIONS) historique.current.shift();
    setPeutAnnuler(true);
  }

  function trait(de: { x: number; y: number }, a: { x: number; y: number }, pression: number) {
    const ctx = contexte();
    if (!ctx) return;
    const ratio = window.devicePixelRatio || 1;
    ctx.strokeStyle = gomme ? "#ffffff" : couleur;
    // Stylet : l'épaisseur suit la pression ; souris et doigt : épaisseur fixe.
    ctx.lineWidth = epaisseur * ratio * (gomme ? 2.5 : pression > 0 && pression !== 0.5 ? 0.5 + pression : 1);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(de.x, de.y);
    ctx.lineTo(a.x, a.y);
    ctx.stroke();
  }

  function annuler() {
    const ctx = contexte();
    const image = historique.current.pop();
    if (ctx && image) ctx.putImageData(image, 0, 0);
    setPeutAnnuler(historique.current.length > 0);
  }

  function effacer() {
    const c = canevas.current;
    const ctx = contexte();
    if (!c || !ctx) return;
    memoriser();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
  }

  useRaccourcis({
    z: annuler,
    g: () => setGomme((x) => !x),
    f: () => pleinEcran.possible && pleinEcran.basculer(),
  });

  return (
    <div ref={pleinEcran.ref} className={`${styles.outil} ${pleinEcran.actif ? styles.plein : ""}`}>
      <div className={styles.barre} role="toolbar" aria-label="Outils de dessin">
        <div className={styles.couleurs}>
          {COULEURS.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.couleur} ${!gomme && couleur === c ? styles.actif : ""}`}
              style={{ background: c }}
              onClick={() => {
                setCouleur(c);
                setGomme(false);
              }}
              aria-label={`Couleur ${c}`}
              aria-pressed={!gomme && couleur === c}
            />
          ))}
          <input type="color" value={couleur} onChange={(e) => { setCouleur(e.target.value); setGomme(false); }} aria-label="Autre couleur" className={styles.autre} />
        </div>
        <div className={styles.epaisseurs}>
          {EPAISSEURS.map((ep) => (
            <button key={ep} type="button" className={`${styles.epaisseur} ${epaisseur === ep ? styles.actif : ""}`} onClick={() => setEpaisseur(ep)} aria-label={`Épaisseur ${ep}`} aria-pressed={epaisseur === ep}>
              <span style={{ width: Math.min(ep, 22), height: Math.min(ep, 22) }} />
            </button>
          ))}
        </div>
        <button type="button" className={`bouton ${gomme ? "bouton-actif" : ""}`} onClick={() => setGomme((x) => !x)} aria-pressed={gomme}>
          Gomme
        </button>
        <button type="button" className="bouton" onClick={annuler} disabled={!peutAnnuler}>
          Annuler
        </button>
        <button type="button" className="bouton" onClick={() => window.confirm("Effacer tout le dessin ?") && effacer()}>
          Tout effacer
        </button>
        <button type="button" className="bouton" onClick={() => canevas.current?.toBlob((b) => b && telecharger(b, "dessin.png"), "image/png")}>
          Télécharger
        </button>
        <BoutonPleinEcran pleinEcran={pleinEcran} />
      </div>

      <canvas
        ref={canevas}
        className={styles.canevas}
        aria-label="Zone de dessin"
        role="img"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          memoriser();
          dernier.current = position(e);
          trait(dernier.current, dernier.current, e.pressure);
        }}
        onPointerMove={(e) => {
          if (!dernier.current) return;
          const p = position(e);
          trait(dernier.current, p, e.pressure);
          dernier.current = p;
        }}
        onPointerUp={() => (dernier.current = null)}
        onPointerCancel={() => (dernier.current = null)}
      />
      {!pleinEcran.actif && (
        <p className="discret">
          Raccourcis : Z pour annuler, G pour la gomme{pleinEcran.possible ? ", F pour le plein écran" : ""}. Le dessin
          n'est pas enregistré : pensez à le télécharger.
        </p>
      )}
    </div>
  );
}
