"use client";

// Générateur d'équipes : répartit la liste de noms au hasard en équipes équilibrées.

import { useRef, useState } from "react";
import BoutonCopier from "@/components/bouton-copier";
import BoutonPleinEcran from "@/components/bouton-plein-ecran";
import ChampNoms, { useListeNoms } from "@/components/liste-noms";
import { useAjusterAuPleinEcran, usePleinEcran, useRaccourcis } from "@/lib/hooks";
import { nombreEquipes, repartir, type Mode } from "./repartition";
import styles from "./equipes.module.css";

export default function Equipes() {
  const liste = useListeNoms();
  const [mode, setMode] = useState<Mode>("nombre-equipes");
  const [saisieValeur, setSaisieValeur] = useState("2");
  const [equipes, setEquipes] = useState<string[][]>([]);

  const pleinEcran = usePleinEcran<HTMLDivElement>();
  const grilleRef = useRef<HTMLDivElement>(null);

  const valeur = Math.max(1, Math.round(Number(saisieValeur)) || 1);
  const nbEquipes = nombreEquipes(liste.noms.length, mode, valeur);

  function former() {
    setEquipes(repartir(liste.noms, nbEquipes));
  }

  const texteACopier = equipes.map((e, i) => `Équipe ${i + 1} : ${e.join(", ")}`).join("\n");

  // En plein écran, toutes les équipes tiennent sur un seul écran, en restant lisibles.
  useAjusterAuPleinEcran(pleinEcran.ref, grilleRef, pleinEcran.actif, equipes, { maxColonnes: 6 });

  useRaccourcis({ " ": former, f: () => pleinEcran.possible && pleinEcran.basculer() });

  // Aperçu des tailles, par exemple « 3 équipes de 3 ou 4 personnes ».
  let apercu = "";
  if (nbEquipes > 0) {
    const petite = Math.floor(liste.noms.length / nbEquipes);
    const grande = Math.ceil(liste.noms.length / nbEquipes);
    const taille = petite === grande ? `${petite}` : `${petite} ou ${grande}`;
    apercu = `${nbEquipes} équipe${nbEquipes > 1 ? "s" : ""} de ${taille} personne${grande > 1 ? "s" : ""}`;
  }

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Réglages">
        <ChampNoms texte={liste.texte} onChange={liste.modifier} nombre={liste.noms.length} />

        <fieldset className={styles.mode}>
          <legend>Former</legend>
          <label className="option">
            <input
              type="radio"
              name="mode"
              checked={mode === "nombre-equipes"}
              onChange={() => setMode("nombre-equipes")}
            />
            un nombre d'équipes
          </label>
          <label className="option">
            <input
              type="radio"
              name="mode"
              checked={mode === "taille-equipe"}
              onChange={() => setMode("taille-equipe")}
            />
            des équipes d'une taille donnée
          </label>
        </fieldset>

        <label className="champ">
          {mode === "nombre-equipes" ? "Nombre d'équipes" : "Personnes par équipe"}
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={100}
            value={saisieValeur}
            onChange={(e) => setSaisieValeur(e.target.value)}
          />
        </label>

        {apercu && <p className="discret">{apercu}.</p>}

        <p className="discret">
          <span className="badge">100 % aléatoire</span> Chaque personne a exactement la même chance de se retrouver
          dans chaque équipe : ni l'ordre de la liste ni les noms n'influencent le tirage. Le hasard vient du
          générateur sécurisé du navigateur.
        </p>

        <div>
          <button className="bouton bouton-principal" onClick={former} disabled={nbEquipes === 0}>
            {equipes.length ? "Refaire les équipes" : "Former les équipes"}
          </button>
        </div>
      </section>

      <div ref={pleinEcran.ref} className={`resultat ${pleinEcran.actif ? "ecran-plein" : ""}`}>
        {equipes.length === 0 ? (
          <p className="discret">Saisissez les noms, choisissez le nombre d'équipes puis cliquez sur « Former les équipes ».</p>
        ) : (
          <p className={styles.mention}>
            <span className="badge">Répartition 100 % aléatoire</span>
          </p>
        )}
        {equipes.length > 0 && (
          <div ref={grilleRef} className={styles.grille} aria-live="polite">
            {equipes.map((membres, i) => (
              <section key={i} className={styles.equipe} style={{ borderTopColor: `var(--equipe-${i % 8})` }}>
                <h3>
                  Équipe {i + 1} <span className="discret">({membres.length})</span>
                </h3>
                <ul>
                  {membres.map((nom, j) => (
                    <li key={j}>{nom}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <div className="commandes">
          {equipes.length > 0 && !pleinEcran.actif && <BoutonCopier texte={texteACopier} />}
          <BoutonPleinEcran pleinEcran={pleinEcran} />
        </div>
      </div>
    </div>
  );
}
