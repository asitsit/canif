"use client";

// Générateur de QR code : lien, texte, Wi-Fi, e-mail ou téléphone ; couleurs,
// logo au centre, export PNG et SVG. Bibliothèque « qrcode » (licence MIT),
// chargée seulement sur cette page. Tout reste dans le navigateur (y compris
// un éventuel mot de passe Wi-Fi).

import { useEffect, useRef, useState } from "react";
import { contraste } from "@/lib/couleurs";
import { telecharger } from "@/lib/images";
import { useStockageLocal } from "@/lib/stockage";
import styles from "./qr-code.module.css";

type Type = "lien" | "texte" | "wifi" | "email" | "telephone";

const DEFAUT = {
  type: "lien" as Type,
  lien: "https://exemple.fr",
  texte: "",
  ssid: "",
  motDePasse: "",
  securite: "WPA",
  email: "",
  objet: "",
  telephone: "",
  couleur: "#111827",
  fond: "#ffffff",
};

// Échappement des caractères spéciaux du format Wi-Fi.
const echapperWifi = (t: string) => t.replace(/([\\;,:"])/g, "\\$1");

function contenu(v: typeof DEFAUT) {
  switch (v.type) {
    case "lien":
      return v.lien.trim() && !/^[a-z]+:/i.test(v.lien.trim()) ? `https://${v.lien.trim()}` : v.lien.trim();
    case "texte":
      return v.texte;
    case "wifi":
      return v.ssid ? `WIFI:T:${v.securite};S:${echapperWifi(v.ssid)};P:${v.securite === "nopass" ? "" : echapperWifi(v.motDePasse)};;` : "";
    case "email":
      return v.email ? `mailto:${v.email}${v.objet ? `?subject=${encodeURIComponent(v.objet)}` : ""}` : "";
    case "telephone":
      return v.telephone ? `tel:${v.telephone.replace(/[^\d+]/g, "")}` : "";
  }
}

export default function QrCode() {
  const [s, setS] = useStockageLocal("qr-code", DEFAUT);
  const v = { ...DEFAUT, ...s };
  const [logo, setLogo] = useState<string>(""); // image en data URL
  const [taille, setTaille] = useState(1024);
  const [erreur, setErreur] = useState("");
  const canevas = useRef<HTMLCanvasElement>(null);
  const texte = contenu(v);
  const ecart = contraste(v.couleur, v.fond);
  const inverse = contraste(v.couleur, "#000000") > contraste(v.fond, "#000000"); // code plus clair que le fond

  // Dessin du QR code (et du logo) à chaque changement.
  useEffect(() => {
    let annule = false;
    (async () => {
      const c = canevas.current;
      if (!c) return;
      if (!texte) {
        c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
        return;
      }
      try {
        const QR = (await import("qrcode")).default;
        if (annule) return;
        // Niveau de correction H (30 %) avec un logo, qui masque une partie du code.
        await QR.toCanvas(c, texte, { width: taille, margin: 2, errorCorrectionLevel: logo ? "H" : "M", color: { dark: v.couleur, light: v.fond } });
        if (logo) {
          const img = new Image();
          img.onload = () => {
            const ctx = c.getContext("2d")!;
            const cote = c.width * 0.22;
            const x = (c.width - cote) / 2;
            ctx.fillStyle = v.fond;
            ctx.fillRect(x - cote * 0.08, x - cote * 0.08, cote * 1.16, cote * 1.16);
            const r = Math.min(cote / img.naturalWidth, cote / img.naturalHeight);
            ctx.drawImage(img, (c.width - img.naturalWidth * r) / 2, (c.width - img.naturalHeight * r) / 2, img.naturalWidth * r, img.naturalHeight * r);
          };
          img.src = logo;
        }
        setErreur("");
      } catch {
        setErreur("Contenu trop long pour un QR code : raccourcissez-le.");
      }
    })();
    return () => {
      annule = true;
    };
  }, [texte, v.couleur, v.fond, logo, taille]);

  async function telechargerSvg() {
    const QR = (await import("qrcode")).default;
    let svg = await QR.toString(texte, { type: "svg", margin: 2, errorCorrectionLevel: logo ? "H" : "M", color: { dark: v.couleur, light: v.fond } });
    if (logo) {
      // Logo ajouté au centre du SVG (le code mesure n × n unités, lu dans le viewBox).
      const n = Number(svg.match(/viewBox="0 0 (\d+)/)?.[1] ?? 0);
      const cote = n * 0.22;
      const x = (n - cote) / 2;
      svg = svg.replace(
        "</svg>",
        `<rect x="${x - cote * 0.08}" y="${x - cote * 0.08}" width="${cote * 1.16}" height="${cote * 1.16}" fill="${v.fond}"/><image href="${logo}" x="${x}" y="${x}" width="${cote}" height="${cote}" preserveAspectRatio="xMidYMid meet"/></svg>`,
      );
    }
    telecharger(new Blob([svg], { type: "image/svg+xml" }), "qr-code.svg");
  }

  const maj = (champ: Partial<typeof DEFAUT>) => setS({ ...v, ...champ });

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Contenu">
        <label className="champ">
          Le QR code ouvre
          <select value={v.type} onChange={(e) => maj({ type: e.target.value as Type })}>
            <option value="lien">un lien (site, formulaire, document)</option>
            <option value="texte">un texte</option>
            <option value="wifi">un accès Wi-Fi</option>
            <option value="email">un e-mail à envoyer</option>
            <option value="telephone">un appel téléphonique</option>
          </select>
        </label>
        {v.type === "lien" && (
          <label className="champ">
            Adresse
            <input type="url" value={v.lien} onChange={(e) => maj({ lien: e.target.value })} placeholder="https://..." />
          </label>
        )}
        {v.type === "texte" && (
          <label className="champ">
            Texte
            <textarea rows={4} value={v.texte} onChange={(e) => maj({ texte: e.target.value })} />
          </label>
        )}
        {v.type === "wifi" && (
          <>
            <label className="champ">
              Nom du réseau (SSID)
              <input type="text" value={v.ssid} onChange={(e) => maj({ ssid: e.target.value })} />
            </label>
            <label className="champ">
              Sécurité
              <select value={v.securite} onChange={(e) => maj({ securite: e.target.value })}>
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Aucune</option>
              </select>
            </label>
            {v.securite !== "nopass" && (
              <label className="champ">
                Mot de passe
                <input type="text" value={v.motDePasse} onChange={(e) => maj({ motDePasse: e.target.value })} autoComplete="off" />
              </label>
            )}
          </>
        )}
        {v.type === "email" && (
          <>
            <label className="champ">
              Adresse e-mail
              <input type="email" value={v.email} onChange={(e) => maj({ email: e.target.value })} />
            </label>
            <label className="champ">
              Objet (facultatif)
              <input type="text" value={v.objet} onChange={(e) => maj({ objet: e.target.value })} />
            </label>
          </>
        )}
        {v.type === "telephone" && (
          <label className="champ">
            Numéro
            <input type="tel" value={v.telephone} onChange={(e) => maj({ telephone: e.target.value })} />
          </label>
        )}

        <div className="champs">
          <label className="champ">
            Couleur
            <input type="color" value={v.couleur} onChange={(e) => maj({ couleur: e.target.value })} className={styles.couleur} />
          </label>
          <label className="champ">
            Fond
            <input type="color" value={v.fond} onChange={(e) => maj({ fond: e.target.value })} className={styles.couleur} />
          </label>
        </div>
        {(ecart < 4 || inverse) && (
          <p className="note">
            {inverse
              ? "Code plus clair que le fond : beaucoup de lecteurs ne le reconnaîtront pas. Préférez un code foncé sur fond clair."
              : "Contraste faible entre le code et le fond : la lecture risque d'échouer."}
          </p>
        )}
        <label className="champ">
          Logo au centre (facultatif)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const lecteur = new FileReader();
              lecteur.onload = () => setLogo(String(lecteur.result));
              lecteur.readAsDataURL(f);
            }}
          />
        </label>
        {logo && (
          <button type="button" className="lien-bouton" onClick={() => setLogo("")} style={{ justifySelf: "start" }}>
            Retirer le logo
          </button>
        )}
        {v.type === "wifi" && <p className="discret">Le mot de passe reste dans votre navigateur ; il est inscrit en clair dans le QR code.</p>}
      </section>

      <div className="resultat">
        <canvas ref={canevas} className={styles.apercu} role="img" aria-label="QR code" hidden={!texte} />
        {!texte && <p className="discret">Remplissez le contenu pour voir le QR code.</p>}
        {erreur && <p className="note">{erreur}</p>}
        {texte && !erreur && (
          <>
            <label className="champ">
              Taille du PNG
              <select value={taille} onChange={(e) => setTaille(Number(e.target.value))}>
                <option value={512}>512 px (écran)</option>
                <option value={1024}>1024 px (impression A4)</option>
                <option value={2048}>2048 px (affiche)</option>
              </select>
            </label>
            <div className="commandes" style={{ marginTop: 12 }}>
              <button type="button" className="bouton bouton-principal" onClick={() => canevas.current?.toBlob((b) => b && telecharger(b, "qr-code.png"), "image/png")}>
                Télécharger en PNG
              </button>
              <button type="button" className="bouton" onClick={telechargerSvg}>
                Télécharger en SVG
              </button>
            </div>
            <p className="discret">Testez toujours le QR code avec un téléphone avant de l'imprimer, surtout avec un logo ou des couleurs.</p>
          </>
        )}
      </div>
    </div>
  );
}
