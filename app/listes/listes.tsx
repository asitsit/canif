"use client";

// Traitement de listes : une liste (un élément par ligne) passe par les
// traitements cochés, dans l'ordre affiché, et le résultat se met à jour aussitôt.

import { useState } from "react";
import BoutonCopier from "@/components/bouton-copier";
import { melanger } from "@/lib/hasard";
import { normaliser } from "@/lib/texte";

type Casse = "inchangee" | "majuscules" | "minuscules" | "premiere" | "mots";
type Tri = "aucun" | "az" | "za" | "longueur" | "inverser" | "melanger";

export default function Listes() {
  const [texte, setTexte] = useState("");
  const [espaces, setEspaces] = useState(true);
  const [vides, setVides] = useState(true);
  const [casse, setCasse] = useState<Casse>("inchangee");
  const [doublons, setDoublons] = useState(false);
  const [doublonsStricts, setDoublonsStricts] = useState(false);
  const [tri, setTri] = useState<Tri>("aucun");
  const [numeroter, setNumeroter] = useState(false);
  const [, setGraineMelange] = useState(0); // sert seulement à relancer le mélange

  let lignes = texte.split(/\r?\n/);
  const nbDepart = lignes.filter((l) => l.trim()).length;

  // 1. Espaces superflus
  if (espaces) lignes = lignes.map((l) => l.trim().replace(/\s+/g, " "));
  // 2. Lignes vides
  if (vides) lignes = lignes.filter((l) => l.trim());
  // 3. Majuscules et minuscules
  const casses: Record<Casse, (l: string) => string> = {
    inchangee: (l) => l,
    majuscules: (l) => l.toLocaleUpperCase("fr-FR"),
    minuscules: (l) => l.toLocaleLowerCase("fr-FR"),
    premiere: (l) => l.charAt(0).toLocaleUpperCase("fr-FR") + l.slice(1).toLocaleLowerCase("fr-FR"),
    mots: (l) => l.toLocaleLowerCase("fr-FR").replace(/(^|[\s'’-])(\p{L})/gu, (_, a, b) => a + b.toLocaleUpperCase("fr-FR")),
  };
  lignes = lignes.map(casses[casse]);
  // 4. Doublons (par défaut sans tenir compte des majuscules ni des accents)
  let nbDoublons = 0;
  if (doublons) {
    const vues = new Set<string>();
    lignes = lignes.filter((l) => {
      const cle = doublonsStricts ? l : normaliser(l);
      if (vues.has(cle)) {
        nbDoublons++;
        return false;
      }
      vues.add(cle);
      return true;
    });
  }
  // 5. Ordre
  if (tri === "az") lignes = [...lignes].sort((a, b) => a.localeCompare(b, "fr", { numeric: true, sensitivity: "base" }));
  if (tri === "za") lignes = [...lignes].sort((a, b) => b.localeCompare(a, "fr", { numeric: true, sensitivity: "base" }));
  if (tri === "longueur") lignes = [...lignes].sort((a, b) => a.length - b.length);
  if (tri === "inverser") lignes = [...lignes].reverse();
  // Nouveau mélange à chaque affichage ; « Mélanger à nouveau » provoque un affichage.
  if (tri === "melanger") lignes = melanger(lignes);
  // 6. Numérotation
  if (numeroter) lignes = lignes.map((l, i) => `${i + 1}. ${l}`);

  const resultat = lignes.join("\n");
  const nbFin = lignes.filter((l) => l.trim()).length;

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Liste et traitements">
        <label className="champ">
          Votre liste, un élément par ligne
          <textarea rows={10} value={texte} onChange={(e) => setTexte(e.target.value)} />
        </label>

        <label className="option">
          <input type="checkbox" checked={espaces} onChange={(e) => setEspaces(e.target.checked)} />
          Retirer les espaces superflus
        </label>
        <label className="option">
          <input type="checkbox" checked={vides} onChange={(e) => setVides(e.target.checked)} />
          Retirer les lignes vides
        </label>
        <label className="option">
          <input type="checkbox" checked={doublons} onChange={(e) => setDoublons(e.target.checked)} />
          Retirer les doublons
        </label>
        {doublons && (
          <label className="option" style={{ paddingLeft: 28 }}>
            <input type="checkbox" checked={doublonsStricts} onChange={(e) => setDoublonsStricts(e.target.checked)} />
            Tenir compte des majuscules et des accents
          </label>
        )}
        <label className="champ">
          Majuscules
          <select value={casse} onChange={(e) => setCasse(e.target.value as Casse)}>
            <option value="inchangee">Ne rien changer</option>
            <option value="majuscules">TOUT EN MAJUSCULES</option>
            <option value="minuscules">tout en minuscules</option>
            <option value="premiere">Première lettre en majuscule</option>
            <option value="mots">Chaque Mot Avec Une Majuscule</option>
          </select>
        </label>
        <label className="champ">
          Ordre
          <select value={tri} onChange={(e) => setTri(e.target.value as Tri)}>
            <option value="aucun">Ne pas changer l'ordre</option>
            <option value="az">De A à Z</option>
            <option value="za">De Z à A</option>
            <option value="longueur">Du plus court au plus long</option>
            <option value="inverser">Inverser l'ordre</option>
            <option value="melanger">Mélanger au hasard</option>
          </select>
        </label>
        {tri === "melanger" && (
          <div>
            <button type="button" className="bouton" onClick={() => setGraineMelange((g) => g + 1)}>
              Mélanger à nouveau
            </button>
          </div>
        )}
        <label className="option">
          <input type="checkbox" checked={numeroter} onChange={(e) => setNumeroter(e.target.checked)} />
          Numéroter les lignes
        </label>
      </section>

      <div className="resultat">
        <p aria-live="polite">
          {nbDepart} élément{nbDepart > 1 ? "s" : ""} au départ, <strong>{nbFin}</strong> à l'arrivée
          {doublons && nbDoublons > 0 ? ` (${nbDoublons} doublon${nbDoublons > 1 ? "s" : ""} retiré${nbDoublons > 1 ? "s" : ""})` : ""}.
        </p>
        <label className="champ">
          Résultat
          <textarea rows={16} readOnly value={resultat} />
        </label>
        <div className="commandes">
          <BoutonCopier texte={resultat} />
          <button type="button" className="bouton" onClick={() => setTexte(resultat)} disabled={!resultat}>
            Remplacer ma liste par le résultat
          </button>
        </div>
      </div>
    </div>
  );
}
