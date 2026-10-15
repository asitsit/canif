"use client";

// Fond de visio personnalisé : image de 1920 × 1080 pixels (format des fonds
// virtuels de Teams, Zoom, Meet) avec nom, fonction, structure et logo.
// Tout est dessiné dans le navigateur ; les images choisies ne sont pas envoyées.

import { useEffect, useRef, useState } from "react";
import { couleurTexteSurFond } from "./texte-fond";
import { chargerImage, telecharger } from "@/lib/images";
import { useStockageLocal } from "@/lib/stockage";
import styles from "./fond-visio.module.css";

const L = 1920;
const H = 1080;

type Reglages = {
  nom: string;
  fonction: string;
  structure: string;
  fond: "uni" | "degrade";
  couleur1: string;
  couleur2: string;
  position: "haut-gauche" | "haut-droite" | "bas-gauche" | "bas-droite";
};

const DEFAUT: Reglages = {
  nom: "Camille Martin",
  fonction: "Facilitatrice",
  structure: "Atelier Exemple",
  fond: "degrade",
  couleur1: "#0f766e",
  couleur2: "#1e3a8a",
  position: "haut-droite",
};

export default function FondVisio() {
  const [r, setR] = useStockageLocal<Reglages>("fond-visio", DEFAUT);
  const v = { ...DEFAUT, ...r };
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const canevas = useRef<HTMLCanvasElement>(null);

  // Dessin du fond à chaque changement de réglage.
  useEffect(() => {
    const c = canevas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    // 1. Fond
    if (photo) {
      // La photo couvre tout le cadre (recadrée au centre si besoin).
      const ratio = Math.max(L / photo.naturalWidth, H / photo.naturalHeight);
      const w = photo.naturalWidth * ratio;
      const h = photo.naturalHeight * ratio;
      ctx.drawImage(photo, (L - w) / 2, (H - h) / 2, w, h);
    } else if (v.fond === "degrade") {
      const g = ctx.createLinearGradient(0, 0, L, H);
      g.addColorStop(0, v.couleur1);
      g.addColorStop(1, v.couleur2);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, L, H);
    } else {
      ctx.fillStyle = v.couleur1;
      ctx.fillRect(0, 0, L, H);
    }

    // 2. Bloc de texte dans un coin (la personne filmée occupe le centre).
    const droite = v.position.endsWith("droite");
    const haut = v.position.startsWith("haut");
    const marge = 80;
    const x = droite ? L - marge : marge;
    let y = haut ? marge + 70 : H - marge - (v.structure ? 150 : 90);
    const teinte = photo ? "#ffffff" : couleurTexteSurFond(v.couleur1, v.fond === "degrade" ? v.couleur2 : v.couleur1);
    ctx.textAlign = droite ? "right" : "left";
    ctx.fillStyle = teinte;
    ctx.shadowColor = photo ? "rgba(0,0,0,0.6)" : "transparent";
    ctx.shadowBlur = photo ? 12 : 0;
    ctx.font = "700 72px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
    if (v.nom) ctx.fillText(v.nom, x, y);
    y += 60;
    ctx.font = "400 44px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
    if (v.fonction) ctx.fillText(v.fonction, x, y);
    y += 56;
    ctx.globalAlpha = 0.85;
    if (v.structure) ctx.fillText(v.structure, x, y);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // 3. Logo dans le coin opposé verticalement, du même côté.
    if (logo) {
      const hauteur = 140;
      const largeur = (logo.naturalWidth / logo.naturalHeight) * hauteur;
      const lx = droite ? L - marge - largeur : marge;
      const ly = haut ? H - marge - hauteur : marge;
      ctx.drawImage(logo, lx, ly, largeur, hauteur);
    }
  }, [v.nom, v.fonction, v.structure, v.fond, v.couleur1, v.couleur2, v.position, photo, logo]);

  async function choisir(f: File | undefined, quoi: "photo" | "logo") {
    if (!f) return;
    try {
      const img = await chargerImage(f);
      if (quoi === "photo") setPhoto(img);
      else setLogo(img);
    } catch {
      window.alert("Cette image n'a pas pu être lue.");
    }
  }

  const champ = (id: "nom" | "fonction" | "structure", libelle: string) => (
    <label className="champ">
      {libelle}
      <input type="text" maxLength={50} value={v[id]} onChange={(e) => setR({ ...v, [id]: e.target.value })} />
    </label>
  );

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Réglages">
        {champ("nom", "Nom")}
        {champ("fonction", "Fonction")}
        {champ("structure", "Structure")}
        <label className="champ">
          Position du texte
          <select value={v.position} onChange={(e) => setR({ ...v, position: e.target.value as Reglages["position"] })}>
            <option value="haut-gauche">En haut à gauche</option>
            <option value="haut-droite">En haut à droite</option>
            <option value="bas-gauche">En bas à gauche</option>
            <option value="bas-droite">En bas à droite</option>
          </select>
        </label>
        <fieldset className={styles.groupe} disabled={!!photo}>
          <legend>Fond {photo && "(remplacé par la photo)"}</legend>
          <label className="option">
            <input type="radio" name="fond" checked={v.fond === "uni"} onChange={() => setR({ ...v, fond: "uni" })} />
            Couleur unie
          </label>
          <label className="option">
            <input type="radio" name="fond" checked={v.fond === "degrade"} onChange={() => setR({ ...v, fond: "degrade" })} />
            Dégradé
          </label>
          <span className={styles.couleurs}>
            <input type="color" value={v.couleur1} onChange={(e) => setR({ ...v, couleur1: e.target.value })} aria-label="Couleur 1" />
            {v.fond === "degrade" && <input type="color" value={v.couleur2} onChange={(e) => setR({ ...v, couleur2: e.target.value })} aria-label="Couleur 2" />}
          </span>
        </fieldset>
        <label className="champ">
          Photo de fond (facultatif)
          <input type="file" accept="image/*" onChange={(e) => choisir(e.target.files?.[0], "photo")} />
        </label>
        {photo && (
          <button type="button" className="lien-bouton" onClick={() => setPhoto(null)} style={{ justifySelf: "start" }}>
            Retirer la photo
          </button>
        )}
        <label className="champ">
          Logo (facultatif, de préférence PNG transparent)
          <input type="file" accept="image/*" onChange={(e) => choisir(e.target.files?.[0], "logo")} />
        </label>
        {logo && (
          <button type="button" className="lien-bouton" onClick={() => setLogo(null)} style={{ justifySelf: "start" }}>
            Retirer le logo
          </button>
        )}
      </section>

      <div className="resultat">
        <canvas ref={canevas} width={L} height={H} className={styles.apercu} aria-label="Aperçu du fond de visio" role="img" />
        <div className="commandes" style={{ marginTop: 12 }}>
          <button
            type="button"
            className="bouton bouton-principal"
            onClick={() => canevas.current?.toBlob((b) => b && telecharger(b, "fond-visio.png"), "image/png")}
          >
            Télécharger le fond (1920 × 1080)
          </button>
        </div>
        <p className="discret">
          Dans votre outil de visio, ajoutez cette image comme arrière-plan personnalisé. Votre propre aperçu peut apparaître
          inversé comme dans un miroir : les autres participants voient le texte à l'endroit. Les images choisies restent dans
          votre navigateur.
        </p>
      </div>
    </div>
  );
}
