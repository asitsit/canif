"use client";

// Atelier PDF, entièrement dans le navigateur (bibliothèque pdf-lib, licence MIT,
// chargée seulement au moment du traitement) : aucun fichier n'est envoyé.
//   - Fusionner plusieurs PDF dans l'ordre choisi
//   - Garder ou retirer des pages, pivoter
//   - Transformer des images (JPG, PNG) en PDF
//   - Alléger : réécriture compacte du fichier (gain modeste, les images ne sont pas recompressées)

import { useState } from "react";
import { telecharger, taille } from "@/lib/images";
import { lireSelection } from "./pages";
import styles from "./atelier-pdf.module.css";

type Mode = "fusionner" | "pages" | "images" | "alleger";
type Fichier = { id: string; fichier: File; pages?: number };

const MODES: { id: Mode; nom: string; aide: string }[] = [
  { id: "fusionner", nom: "Fusionner", aide: "Assembler plusieurs PDF en un seul, dans l'ordre de la liste." },
  { id: "pages", nom: "Pages", aide: "Garder ou retirer certaines pages d'un PDF, et les pivoter." },
  { id: "images", nom: "Images en PDF", aide: "Une image JPG ou PNG par page, dans l'ordre de la liste." },
  { id: "alleger", nom: "Alléger", aide: "Réécrit le PDF de façon plus compacte. Le gain est souvent modeste : les images contenues ne sont pas recompressées." },
];

// Erreur due à la saisie de la personne : son message est affiché tel quel.
class ErreurSaisie extends Error {}

async function chargerPdf(f: File) {
  const { PDFDocument } = await import("pdf-lib");
  return PDFDocument.load(await f.arrayBuffer());
}

export default function AtelierPdf() {
  const [mode, setMode] = useState<Mode>("fusionner");
  const [fichiers, setFichiers] = useState<Fichier[]>([]);
  const [selection, setSelection] = useState("");
  const [action, setAction] = useState<"garder" | "retirer">("garder");
  const [rotation, setRotation] = useState(0);
  const [message, setMessage] = useState("");
  const [enCours, setEnCours] = useState(false);

  const accepte = mode === "images" ? "image/jpeg,image/png" : "application/pdf";
  const multiple = mode === "fusionner" || mode === "images";

  async function ajouter(liste: FileList | null) {
    if (!liste) return;
    setMessage("");
    const nouveaux: Fichier[] = [];
    for (const f of [...liste].slice(0, 30)) {
      const item: Fichier = { id: Math.random().toString(36).slice(2), fichier: f };
      if (mode !== "images") {
        try {
          item.pages = (await chargerPdf(f)).getPageCount();
        } catch {
          setMessage(`« ${f.name} » n'a pas pu être ouvert (fichier abîmé ou protégé par un mot de passe).`);
          continue;
        }
      }
      nouveaux.push(item);
    }
    setFichiers((l) => (multiple ? [...l, ...nouveaux] : nouveaux.slice(0, 1)));
  }

  function changerMode(m: Mode) {
    setMode(m);
    setFichiers([]);
    setMessage("");
  }

  function deplacer(i: number, sens: -1 | 1) {
    setFichiers((l) => {
      const n = [...l];
      const j = i + sens;
      if (j < 0 || j >= n.length) return l;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  }

  async function lancer() {
    setEnCours(true);
    setMessage("");
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      let sortie: Uint8Array;
      let nom = "document.pdf";

      if (mode === "fusionner") {
        const doc = await PDFDocument.create();
        for (const f of fichiers) {
          const source = await chargerPdf(f.fichier);
          const pages = await doc.copyPages(source, source.getPageIndices());
          pages.forEach((p) => doc.addPage(p));
        }
        sortie = await doc.save();
        nom = "fusion.pdf";
      } else if (mode === "pages") {
        const f = fichiers[0];
        const source = await chargerPdf(f.fichier);
        const total = source.getPageCount();
        const choisies = selection.trim() ? lireSelection(selection, total) : Array.from({ length: total }, (_, i) => i + 1);
        if (!choisies) throw new ErreurSaisie(`Sélection invalide : utilisez par exemple « 1-3, 5 » (pages de 1 à ${total}).`);
        const gardees = action === "garder" ? choisies : Array.from({ length: total }, (_, i) => i + 1).filter((p) => !choisies.includes(p));
        if (gardees.length === 0) throw new ErreurSaisie("Aucune page ne resterait dans le document.");
        const doc = await PDFDocument.create();
        const pages = await doc.copyPages(source, gardees.map((p) => p - 1));
        pages.forEach((p) => {
          if (rotation) p.setRotation(degrees((p.getRotation().angle + rotation) % 360));
          doc.addPage(p);
        });
        sortie = await doc.save();
        nom = f.fichier.name.replace(/\.pdf$/i, "") + "-pages.pdf";
      } else if (mode === "images") {
        const doc = await PDFDocument.create();
        for (const f of fichiers) {
          const octets = await f.fichier.arrayBuffer();
          const image = f.fichier.type === "image/png" ? await doc.embedPng(octets) : await doc.embedJpg(octets);
          const page = doc.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        }
        sortie = await doc.save();
        nom = "images.pdf";
      } else {
        const f = fichiers[0];
        const source = await chargerPdf(f.fichier);
        source.setProducer("");
        source.setCreator("");
        sortie = await source.save({ useObjectStreams: true });
        nom = f.fichier.name.replace(/\.pdf$/i, "") + "-allege.pdf";
        const avant = f.fichier.size;
        setMessage(
          sortie.length < avant
            ? `Fichier allégé : ${taille(avant)} → ${taille(sortie.length)}.`
            : `Pas de gain possible ici (${taille(avant)}) : le poids vient sans doute des images. Le fichier réécrit est tout de même proposé.`,
        );
      }
      telecharger(new Blob([sortie as BlobPart], { type: "application/pdf" }), nom);
      if (mode !== "alleger") setMessage(`Terminé : « ${nom} » (${taille(sortie.length)}) a été téléchargé.`);
    } catch (e) {
      setMessage(e instanceof ErreurSaisie ? e.message : "Le traitement a échoué : un fichier est peut-être protégé ou abîmé.");
    }
    setEnCours(false);
  }

  const pret = mode === "fusionner" ? fichiers.length >= 2 : fichiers.length >= 1;
  const courant = MODES.find((m) => m.id === mode)!;

  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1fr)" }}>
      <div className="choix" role="tablist" aria-label="Opération">
        {MODES.map((m) => (
          <button key={m.id} type="button" role="tab" aria-selected={mode === m.id} className={`bouton ${mode === m.id ? "bouton-actif" : ""}`} onClick={() => changerMode(m.id)}>
            {m.nom}
          </button>
        ))}
      </div>
      <p className="discret" style={{ margin: 0 }}>
        {courant.aide}
      </p>

      <div className="mise-en-page-tirage">
        <section className="reglages" aria-label="Fichiers">
          <label className={styles.depot}>
            <input type="file" accept={accepte} multiple={multiple} onChange={(e) => { ajouter(e.target.files); e.target.value = ""; }} className={styles.cache} />
            <strong>{mode === "images" ? "Choisir des images" : multiple ? "Choisir des PDF" : "Choisir un PDF"}</strong>
            <span>{multiple ? "plusieurs fichiers possibles" : "un seul fichier"}</span>
          </label>
          {fichiers.length > 0 && (
            <ol className={styles.liste}>
              {fichiers.map((f, i) => (
                <li key={f.id}>
                  <span className={styles.nom}>
                    {f.fichier.name}
                    <small>
                      {taille(f.fichier.size)}
                      {f.pages ? `, ${f.pages} page${f.pages > 1 ? "s" : ""}` : ""}
                    </small>
                  </span>
                  {multiple && (
                    <>
                      <button type="button" onClick={() => deplacer(i, -1)} disabled={i === 0} aria-label="Monter">
                        ↑
                      </button>
                      <button type="button" onClick={() => deplacer(i, 1)} disabled={i === fichiers.length - 1} aria-label="Descendre">
                        ↓
                      </button>
                    </>
                  )}
                  <button type="button" onClick={() => setFichiers((l) => l.filter((x) => x.id !== f.id))} aria-label={`Retirer ${f.fichier.name}`}>
                    ×
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>

        <div className="resultat">
          {mode === "pages" && (
            <>
              <div className="choix">
                <button type="button" className={`bouton ${action === "garder" ? "bouton-actif" : ""}`} onClick={() => setAction("garder")}>
                  Garder ces pages
                </button>
                <button type="button" className={`bouton ${action === "retirer" ? "bouton-actif" : ""}`} onClick={() => setAction("retirer")}>
                  Retirer ces pages
                </button>
              </div>
              <label className="champ" style={{ marginTop: 12 }}>
                Pages (par exemple « 1-3, 5 » ; vide = toutes)
                <input type="text" value={selection} onChange={(e) => setSelection(e.target.value)} placeholder="1-3, 5" />
              </label>
              <label className="champ" style={{ marginTop: 12 }}>
                Pivoter les pages
                <select value={rotation} onChange={(e) => setRotation(Number(e.target.value))}>
                  <option value={0}>Ne pas pivoter</option>
                  <option value={90}>Un quart de tour à droite</option>
                  <option value={180}>Un demi-tour</option>
                  <option value={270}>Un quart de tour à gauche</option>
                </select>
              </label>
            </>
          )}
          <div className="commandes" style={{ marginTop: 12 }}>
            <button type="button" className="bouton bouton-principal" onClick={lancer} disabled={!pret || enCours}>
              {enCours ? "Traitement..." : "Créer le PDF"}
            </button>
          </div>
          {!pret && <p className="discret">{mode === "fusionner" ? "Ajoutez au moins deux PDF." : "Ajoutez un fichier."}</p>}
          <p aria-live="polite">{message}</p>
          <p className="discret">
            Les fichiers sont traités dans votre navigateur et ne sont envoyés sur aucun serveur. Les PDF protégés par un mot
            de passe ne peuvent pas être modifiés.
          </p>
        </div>
      </div>
    </div>
  );
}
