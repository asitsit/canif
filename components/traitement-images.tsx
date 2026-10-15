"use client";

// Traitement d'images par lot : redimensionner, compresser, convertir.
// Utilisé par le compresseur (C32) et le convertisseur (C34) avec des réglages
// par défaut différents. Tout se fait dans le navigateur : rien n'est envoyé.

import { useEffect, useState } from "react";
import { chargerImage, dessiner, EXTENSIONS, type Format, sansExtension, taille, telecharger, versBlob } from "@/lib/images";
import styles from "./traitement-images.module.css";

type Resultat = { nom: string; avant: number; apres: number; largeur: number; hauteur: number; url: string; blob: Blob } | { nom: string; erreur: string };

type Props = {
  mode: "compresser" | "convertir";
};

const FORMATS: { valeur: Format | "origine"; libelle: string }[] = [
  { valeur: "origine", libelle: "Garder le format d'origine" },
  { valeur: "image/jpeg", libelle: "JPG (photos, le plus compatible)" },
  { valeur: "image/webp", libelle: "WebP (plus léger, sites web)" },
  { valeur: "image/png", libelle: "PNG (sans perte, transparence)" },
];

export default function TraitementImages({ mode }: Props) {
  const [fichiers, setFichiers] = useState<File[]>([]);
  const [format, setFormat] = useState<Format | "origine">(mode === "convertir" ? "image/jpeg" : "origine");
  const [maxCote, setMaxCote] = useState(mode === "compresser" ? "1920" : "");
  const [qualite, setQualite] = useState(mode === "compresser" ? 0.75 : 0.9);
  const [resultats, setResultats] = useState<Resultat[]>([]);
  const [enCours, setEnCours] = useState(false);
  const [survol, setSurvol] = useState(false);

  // Traitement relancé à chaque changement de fichiers ou de réglages.
  useEffect(() => {
    let annule = false;
    if (fichiers.length === 0) {
      setResultats([]);
      return;
    }
    setEnCours(true);
    (async () => {
      const liste: Resultat[] = [];
      for (const f of fichiers) {
        try {
          const img = await chargerImage(f);
          const sortie: Format = format === "origine" ? ((["image/jpeg", "image/png", "image/webp"].includes(f.type) ? f.type : "image/jpeg") as Format) : format;
          const cote = Number(maxCote) > 0 ? Number(maxCote) : null;
          const canevas = dessiner(img, cote, sortie === "image/jpeg");
          const blob = await versBlob(canevas, sortie, qualite);
          liste.push({ nom: `${sansExtension(f.name)}.${EXTENSIONS[sortie]}`, avant: f.size, apres: blob.size, largeur: canevas.width, hauteur: canevas.height, url: URL.createObjectURL(blob), blob });
        } catch {
          liste.push({ nom: f.name, erreur: "Format non lu par ce navigateur (par exemple HEIC hors Safari)." });
        }
      }
      if (!annule) {
        setResultats((anciens) => {
          anciens.forEach((r) => "url" in r && URL.revokeObjectURL(r.url));
          return liste;
        });
        setEnCours(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, [fichiers, format, maxCote, qualite]);

  function ajouter(liste: FileList | null) {
    if (!liste) return;
    const images = [...liste].filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name)).slice(0, 50);
    setFichiers(images);
  }

  const reussis = resultats.filter((r): r is Extract<Resultat, { blob: Blob }> => "blob" in r);
  const totalAvant = reussis.reduce((t, r) => t + r.avant, 0);
  const totalApres = reussis.reduce((t, r) => t + r.apres, 0);

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Images et réglages">
        <label
          className={`${styles.depot} ${survol ? styles.survol : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setSurvol(true);
          }}
          onDragLeave={() => setSurvol(false)}
          onDrop={(e) => {
            e.preventDefault();
            setSurvol(false);
            ajouter(e.dataTransfer.files);
          }}
        >
          <input type="file" accept="image/*" multiple onChange={(e) => ajouter(e.target.files)} className={styles.cache} />
          <strong>Choisir des images</strong>
          <span>ou les glisser ici (50 au maximum)</span>
        </label>

        <label className="champ">
          Format de sortie
          <select value={format} onChange={(e) => setFormat(e.target.value as Format | "origine")}>
            {FORMATS.map((f) => (
              <option key={f.valeur} value={f.valeur}>
                {f.libelle}
              </option>
            ))}
          </select>
        </label>
        <label className="champ">
          Plus grand côté, en pixels (vide = taille d'origine)
          <input type="number" min={16} max={10000} value={maxCote} onChange={(e) => setMaxCote(e.target.value)} placeholder="Taille d'origine" />
        </label>
        <div className="choix">
          {[800, 1200, 1920, 2560].map((n) => (
            <button key={n} type="button" className={`bouton ${maxCote === String(n) ? "bouton-actif" : ""}`} onClick={() => setMaxCote(String(n))}>
              {n} px
            </button>
          ))}
        </div>
        {format !== "image/png" && (
          <label className="champ">
            Qualité : {Math.round(qualite * 100)} %
            <input type="range" min={0.4} max={1} step={0.05} value={qualite} onChange={(e) => setQualite(Number(e.target.value))} />
          </label>
        )}
        <p className="discret">
          Les images sont traitées dans votre navigateur : elles ne sont envoyées sur aucun serveur. Les informations cachées
          des photos (lieu, appareil) ne sont pas recopiées.
        </p>
      </section>

      <div className="resultat" aria-live="polite">
        {fichiers.length === 0 && <p className="discret">Les images traitées apparaîtront ici.</p>}
        {enCours && <p>Traitement en cours...</p>}
        {reussis.length > 0 && (
          <p className={styles.bilan}>
            {reussis.length} image{reussis.length > 1 ? "s" : ""} : {taille(totalAvant)} → <strong>{taille(totalApres)}</strong>
            {totalAvant > 0 && (
              <span className={totalApres <= totalAvant ? styles.gain : styles.perte}>
                {" "}
                ({totalApres <= totalAvant ? "-" : "+"}
                {Math.abs(Math.round((1 - totalApres / totalAvant) * 100))} %)
              </span>
            )}
          </p>
        )}
        <ul className={styles.liste}>
          {resultats.map((r, i) =>
            "erreur" in r ? (
              <li key={i} className={styles.erreur}>
                {r.nom} : {r.erreur}
              </li>
            ) : (
              <li key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.url} alt="" className={styles.vignette} />
                <span className={styles.infos}>
                  <strong>{r.nom}</strong>
                  <span>
                    {r.largeur} × {r.hauteur} px, {taille(r.avant)} → {taille(r.apres)}
                  </span>
                </span>
                <button type="button" className="bouton" onClick={() => telecharger(r.blob, r.nom)}>
                  Télécharger
                </button>
              </li>
            ),
          )}
        </ul>
        {reussis.length > 1 && (
          <div className="commandes">
            <button
              type="button"
              className="bouton bouton-principal"
              onClick={() => reussis.forEach((r, i) => setTimeout(() => telecharger(r.blob, r.nom), i * 400))}
            >
              Tout télécharger
            </button>
          </div>
        )}
        {reussis.some((r) => r.apres > r.avant) && (
          <p className="note">
            Certaines images sont plus lourdes qu'avant (déjà très compressées, ou passage en PNG). Baissez la qualité ou
            choisissez JPG ou WebP.
          </p>
        )}
      </div>
    </div>
  );
}
