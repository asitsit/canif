"use client";

// Palette de couleurs : harmonies à partir d'une couleur, ou couleurs dominantes
// d'une image (traitée dans le navigateur). Pour chaque couleur : codes HEX et RVB,
// et lisibilité d'un texte noir ou blanc posé dessus (contraste WCAG).

import { useState } from "react";
import BoutonCopier from "@/components/bouton-copier";
import { contraste, couleursDominantes, harmonie, hexVersRvb } from "@/lib/couleurs";
import { chargerImage } from "@/lib/images";
import styles from "./palette.module.css";

const HARMONIES = [
  { id: "monochrome", nom: "Camaïeu" },
  { id: "analogue", nom: "Couleurs voisines" },
  { id: "complementaire", nom: "Complémentaire" },
  { id: "triadique", nom: "Triade" },
];

// Niveau de lisibilité d'un texte sur la couleur (seuils WCAG pour du texte courant).
function niveau(ratio: number) {
  return ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "gros texte" : "illisible";
}

export default function Palette() {
  const [mode, setMode] = useState<"harmonie" | "image">("harmonie");
  const [base, setBase] = useState("#c2410c");
  const [type, setType] = useState("analogue");
  const [extraites, setExtraites] = useState<string[]>([]);
  const [apercuImage, setApercuImage] = useState("");
  const [erreur, setErreur] = useState("");
  const [copie, setCopie] = useState("");

  const couleurs = mode === "harmonie" ? harmonie(base, type) : extraites;

  async function analyser(f: File | undefined) {
    if (!f) return;
    try {
      const img = await chargerImage(f);
      setExtraites(couleursDominantes(img, 6));
      setApercuImage((ancien) => {
        if (ancien) URL.revokeObjectURL(ancien);
        return URL.createObjectURL(f);
      });
      setErreur("");
    } catch {
      setErreur("Cette image n'a pas pu être lue.");
    }
  }

  async function copier(hex: string) {
    try {
      await navigator.clipboard.writeText(hex);
      setCopie(hex);
      setTimeout(() => setCopie(""), 1500);
    } catch {
      // copie refusée : sans gravité
    }
  }

  const css = `:root {\n${couleurs.map((c, i) => `  --couleur-${i + 1}: ${c};`).join("\n")}\n}`;

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Réglages">
        <div className="choix">
          <button type="button" className={`bouton ${mode === "harmonie" ? "bouton-actif" : ""}`} onClick={() => setMode("harmonie")}>
            À partir d'une couleur
          </button>
          <button type="button" className={`bouton ${mode === "image" ? "bouton-actif" : ""}`} onClick={() => setMode("image")}>
            À partir d'une image
          </button>
        </div>

        {mode === "harmonie" ? (
          <>
            <label className="champ">
              Couleur de départ
              <span className={styles.base}>
                <input type="color" value={base} onChange={(e) => setBase(e.target.value)} />
                <input type="text" value={base} maxLength={7} onChange={(e) => /^#[0-9a-f]{6}$/i.test(e.target.value) && setBase(e.target.value.toLowerCase())} aria-label="Code hexadécimal" />
              </span>
            </label>
            <fieldset className={styles.types}>
              <legend>Harmonie</legend>
              {HARMONIES.map((h) => (
                <label key={h.id} className="option">
                  <input type="radio" name="harmonie" checked={type === h.id} onChange={() => setType(h.id)} />
                  {h.nom}
                </label>
              ))}
            </fieldset>
          </>
        ) : (
          <>
            <label className="champ">
              Image (logo, photo, charte...)
              <input type="file" accept="image/*" onChange={(e) => analyser(e.target.files?.[0])} />
            </label>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {apercuImage && <img src={apercuImage} alt="Image analysée" className={styles.apercu} />}
            {erreur && <p className="note">{erreur}</p>}
            <p className="discret">L'image est analysée dans votre navigateur et n'est envoyée nulle part.</p>
          </>
        )}
      </section>

      <div className="resultat">
        {couleurs.length === 0 ? (
          <p className="discret">Choisissez une image pour en extraire les couleurs.</p>
        ) : (
          <ul className={styles.nuancier}>
            {couleurs.map((c, i) => {
              const surBlanc = contraste(c, "#ffffff");
              const surNoir = contraste(c, "#000000");
              const [r, v, b] = hexVersRvb(c);
              return (
                <li key={i}>
                  <button type="button" className={styles.pastille} style={{ background: c, color: surNoir > surBlanc ? "#000" : "#fff" }} onClick={() => copier(c)} aria-label={`Copier ${c}`}>
                    {copie === c ? "Copié !" : c.toUpperCase()}
                  </button>
                  <span className={styles.codes}>
                    RVB {r}, {v}, {b}
                  </span>
                  <span className={styles.codes}>
                    Texte blanc : {surBlanc.toFixed(1)} ({niveau(surBlanc)})
                  </span>
                  <span className={styles.codes}>
                    Texte noir : {surNoir.toFixed(1)} ({niveau(surNoir)})
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="discret">
          Cliquez sur une couleur pour copier son code. Lisibilité selon les règles d'accessibilité WCAG : AA à partir de 4,5,
          AAA à partir de 7 (texte courant) ; 3 suffit pour un gros texte.
        </p>
        {couleurs.length > 0 && (
          <div className="commandes">
            <BoutonCopier texte={couleurs.join(", ")} libelle="Copier les codes" />
            <BoutonCopier texte={css} libelle="Copier en variables CSS" />
          </div>
        )}
      </div>
    </div>
  );
}
