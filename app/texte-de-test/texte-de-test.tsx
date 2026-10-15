"use client";

// Générateur de texte de test : faux texte pour remplir une maquette.
// Deux styles : le « Lorem ipsum » traditionnel des imprimeurs, ou un faux
// texte en français composé au hasard à partir d'un vocabulaire d'atelier
// (rédigé pour Canif ; les phrases n'ont volontairement pas de sens).

import { useState } from "react";
import BoutonCopier from "@/components/bouton-copier";
import { entierAleatoire } from "@/lib/hasard";

const LOREM =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(
    " ",
  );

const FRANCAIS =
  "atelier équipe idée projet groupe tableau question réponse objectif étape matin semaine solution échange regard chemin envie méthode carte couleur parole temps rythme cercle salle fenêtre lumière horizon jardin voyage ensemble avance propose partage écoute construit découvre imagine prépare relie ouvre simple claire nouvelle douce vive commune utile légère patiente souvent parfois toujours bientôt doucement autour devant après avant pendant depuis vers avec sans pour".split(
    " ",
  );

const DEBUT_LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

function phrase(vocabulaire: string[]) {
  const longueur = 6 + entierAleatoire(10);
  const choisis = Array.from({ length: longueur }, () => vocabulaire[entierAleatoire(vocabulaire.length)]);
  // Une virgule de temps en temps, pour que le texte ait l'air naturel.
  if (longueur > 9) choisis[3 + entierAleatoire(longueur - 6)] += ",";
  const texte = choisis.join(" ");
  return texte.charAt(0).toUpperCase() + texte.slice(1) + ".";
}

function generer(style: "lorem" | "francais", paragraphes: number, phrasesParParagraphe: number, debutClassique: boolean) {
  const vocabulaire = style === "lorem" ? LOREM : FRANCAIS;
  return Array.from({ length: paragraphes }, (_, p) => {
    const phrases = Array.from({ length: phrasesParParagraphe }, () => phrase(vocabulaire));
    if (p === 0 && style === "lorem" && debutClassique) phrases[0] = DEBUT_LOREM;
    return phrases.join(" ");
  }).join("\n\n");
}

export default function TexteDeTest() {
  const [style, setStyle] = useState<"lorem" | "francais">("lorem");
  const [paragraphes, setParagraphes] = useState(3);
  const [phrases, setPhrases] = useState(5);
  const [debutClassique, setDebutClassique] = useState(true);
  const [texte, setTexte] = useState("");

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Réglages">
        <label className="champ">
          Style
          <select value={style} onChange={(e) => setStyle(e.target.value as "lorem" | "francais")}>
            <option value="lorem">Lorem ipsum (faux latin des imprimeurs)</option>
            <option value="francais">Faux texte en français</option>
          </select>
        </label>
        <label className="champ">
          Paragraphes : {paragraphes}
          <input type="range" min={1} max={20} value={paragraphes} onChange={(e) => setParagraphes(Number(e.target.value))} />
        </label>
        <label className="champ">
          Phrases par paragraphe : {phrases}
          <input type="range" min={1} max={15} value={phrases} onChange={(e) => setPhrases(Number(e.target.value))} />
        </label>
        {style === "lorem" && (
          <label className="option">
            <input type="checkbox" checked={debutClassique} onChange={(e) => setDebutClassique(e.target.checked)} />
            Commencer par « Lorem ipsum dolor sit amet »
          </label>
        )}
        <div>
          <button type="button" className="bouton bouton-principal" onClick={() => setTexte(generer(style, paragraphes, phrases, debutClassique))}>
            Générer
          </button>
        </div>
      </section>

      <div className="resultat">
        <label className="champ">
          Texte
          <textarea rows={18} readOnly value={texte} placeholder="Réglez puis cliquez sur « Générer »." />
        </label>
        <div className="commandes">
          <BoutonCopier texte={texte} libelle="Copier le texte" />
        </div>
        {texte && (
          <p className="discret">
            {texte.split(/\s+/).length} mots, {texte.length} caractères.
          </p>
        )}
      </div>
    </div>
  );
}
