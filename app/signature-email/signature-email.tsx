"use client";

// Générateur de signature d'e-mail : aperçu, puis copie « mise en forme »
// (à coller directement dans Gmail, Outlook...) ou en texte simple.
// La signature est construite en tableau HTML avec styles en ligne : c'est la
// forme que les messageries affichent le plus fidèlement.

import { useState } from "react";
import { useStockageLocal } from "@/lib/stockage";

const DEFAUT = {
  nom: "Camille Martin",
  fonction: "Facilitatrice et consultante",
  structure: "Atelier Exemple",
  telephone: "06 00 00 00 00",
  email: "camille@exemple.fr",
  site: "www.exemple.fr",
  linkedin: "",
  couleur: "#c2410c",
  mention: "",
};

type Valeurs = typeof DEFAUT;

// Échappe les caractères spéciaux HTML d'un texte saisi.
function echapper(t: string) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Ajoute https:// si l'adresse n'en a pas.
function url(t: string) {
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

function html(v: Valeurs) {
  const c = /^#[0-9a-f]{6}$/i.test(v.couleur) ? v.couleur : "#c2410c";
  const lignes: string[] = [];
  if (v.telephone) lignes.push(`<a href="tel:${echapper(v.telephone.replace(/\s/g, ""))}" style="color:#333333;text-decoration:none;">${echapper(v.telephone)}</a>`);
  if (v.email) lignes.push(`<a href="mailto:${echapper(v.email)}" style="color:#333333;text-decoration:none;">${echapper(v.email)}</a>`);
  if (v.site) lignes.push(`<a href="${echapper(url(v.site))}" style="color:${c};text-decoration:none;">${echapper(v.site.replace(/^https?:\/\//, ""))}</a>`);
  if (v.linkedin) lignes.push(`<a href="${echapper(url(v.linkedin))}" style="color:${c};text-decoration:none;">LinkedIn</a>`);
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.4;color:#333333;">
<tr><td style="border-left:4px solid ${c};padding-left:12px;">
<div style="font-size:16px;font-weight:bold;color:#111111;">${echapper(v.nom)}</div>
${v.fonction || v.structure ? `<div style="color:#555555;">${echapper([v.fonction, v.structure].filter(Boolean).join(" · "))}</div>` : ""}
${lignes.length ? `<div style="margin-top:6px;">${lignes.join(' <span style="color:#bbbbbb;">|</span> ')}</div>` : ""}
${v.mention ? `<div style="margin-top:6px;font-size:12px;color:#888888;">${echapper(v.mention)}</div>` : ""}
</td></tr></table>`;
}

function texteSimple(v: Valeurs) {
  return [
    "--",
    v.nom,
    [v.fonction, v.structure].filter(Boolean).join(" · "),
    [v.telephone, v.email].filter(Boolean).join(" | "),
    [v.site, v.linkedin && url(v.linkedin)].filter(Boolean).join(" | "),
    v.mention,
  ]
    .filter(Boolean)
    .join("\n");
}

export default function SignatureEmail() {
  const [v, setV] = useStockageLocal<Valeurs>("signature-email", DEFAUT);
  const [message, setMessage] = useState("");
  const valeurs = { ...DEFAUT, ...v };
  const code = html(valeurs);

  const champs: [keyof Valeurs, string, string?][] = [
    ["nom", "Prénom et nom"],
    ["fonction", "Fonction"],
    ["structure", "Structure"],
    ["telephone", "Téléphone"],
    ["email", "E-mail"],
    ["site", "Site web"],
    ["linkedin", "Adresse LinkedIn (facultatif)", "linkedin.com/in/..."],
    ["mention", "Mention facultative", "Par exemple : je travaille du lundi au jeudi"],
  ];

  async function copierMiseEnForme() {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([code], { type: "text/html" }),
          "text/plain": new Blob([texteSimple(valeurs)], { type: "text/plain" }),
        }),
      ]);
      setMessage("Signature copiée : collez-la dans les réglages de signature de votre messagerie.");
    } catch {
      setMessage("Copie impossible dans ce navigateur : sélectionnez l'aperçu à la souris puis copiez-le (Ctrl+C).");
    }
  }

  async function copier(texte: string, ok: string) {
    try {
      await navigator.clipboard.writeText(texte);
      setMessage(ok);
    } catch {
      setMessage("Copie impossible dans ce navigateur.");
    }
  }

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Informations">
        {champs.map(([id, libelle, aide]) => (
          <label key={id} className="champ">
            {libelle}
            <input type="text" value={valeurs[id]} placeholder={aide} onChange={(e) => setV({ ...valeurs, [id]: e.target.value })} />
          </label>
        ))}
        <label className="champ">
          Couleur
          <input type="color" value={valeurs.couleur} onChange={(e) => setV({ ...valeurs, couleur: e.target.value })} style={{ width: 80, height: 40, padding: 2 }} />
        </label>
        <div>
          <button type="button" className="lien-bouton" onClick={() => setV(DEFAUT)}>
            Revenir à l'exemple
          </button>
        </div>
      </section>

      <div className="resultat">
        <h2>Aperçu</h2>
        <div style={{ padding: 20, background: "#ffffff", border: "1px solid var(--bordure)", borderRadius: 8, overflowX: "auto" }} dangerouslySetInnerHTML={{ __html: code }} />
        <div className="commandes" style={{ marginTop: 16 }}>
          <button type="button" className="bouton bouton-principal" onClick={copierMiseEnForme}>
            Copier la signature
          </button>
          <button type="button" className="bouton" onClick={() => copier(texteSimple(valeurs), "Version texte copiée.")}>
            Copier en texte simple
          </button>
          <button type="button" className="bouton" onClick={() => copier(code, "Code HTML copié.")}>
            Copier le code HTML
          </button>
        </div>
        <p aria-live="polite">{message}</p>
        <p className="discret">
          Dans Gmail : Paramètres, Signature, puis collez. Dans Outlook : Paramètres, Courrier, Signatures, puis collez. (Noms
          de menus indicatifs, ils peuvent varier selon les versions.) Vos informations restent dans ce navigateur.
        </p>
      </div>
    </div>
  );
}
