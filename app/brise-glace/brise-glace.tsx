"use client";

// Tirage de question brise-glace par intention, avec ses propres questions en plus.

import { useState } from "react";
import TirageCartes from "@/components/tirage-cartes";
import { lireListe } from "@/lib/hasard";
import { useStockageLocal } from "@/lib/stockage";
import { INTENTIONS } from "./questions";

export default function BriseGlace() {
  const [choisies, setChoisies] = useState<string[]>([INTENTIONS[0].id]);
  const [perso, setPerso] = useStockageLocal("brise-glace-perso", "");

  const cartes = [
    ...INTENTIONS.filter((i) => choisies.includes(i.id)).flatMap((i) => i.questions.map((q) => ({ texte: q, etiquette: i.nom }))),
    ...lireListe(perso).map((q) => ({ texte: q, etiquette: "Mes questions" })),
  ];

  const basculer = (id: string) => setChoisies((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Intentions">
        <h2>Intention</h2>
        {INTENTIONS.map((i) => (
          <label key={i.id} className="option" style={{ alignItems: "flex-start" }}>
            <input type="checkbox" checked={choisies.includes(i.id)} onChange={() => basculer(i.id)} />
            <span>
              <strong>{i.nom}</strong> ({i.questions.length})<br />
              <span className="discret">{i.description}</span>
            </span>
          </label>
        ))}
        <label className="champ">
          Mes questions (une par ligne, gardées dans ce navigateur)
          <textarea rows={4} value={perso} onChange={(e) => setPerso(e.target.value)} />
        </label>
        <p className="note">Questions rédigées pour Canif (première série, à relire). Chacun peut toujours passer son tour.</p>
      </section>
      <TirageCartes cartes={cartes} libelleBouton="Tirer une question" vide="Cochez au moins une intention ou ajoutez vos questions." />
    </div>
  );
}
