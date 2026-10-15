"use client";

// Équipes avec paramètres : chaque personne a un ou plusieurs critères
// (service, site, niveau...). On forme des équipes mixtes (critères mélangés)
// ou homogènes (critères regroupés), de tailles équilibrées.

import { useEffect, useRef, useState } from "react";
import BoutonCopier from "@/components/bouton-copier";
import BoutonPleinEcran from "@/components/bouton-plein-ecran";
import {
  lirePersonnes,
  nombreEquipes,
  repartirAvecCriteres,
  type Mode,
  type ModeCriteres,
  type Personne,
} from "@/lib/equipes";
import { useAjusterAuPleinEcran, usePleinEcran, useRaccourcis } from "@/lib/hooks";
import styles from "./equipes-parametres.module.css";

const EXEMPLE = [
  "Jacques ; Marketing ; Paris",
  "Sophie ; Finance ; Lyon",
  "Karim ; Marketing ; Lyon",
  "Léa ; RH ; Paris",
  "Thomas ; Finance ; Paris",
  "Inès ; Informatique ; Lyon",
  "Hugo ; RH ; Lyon",
  "Nadia ; Informatique ; Paris",
  "Paul ; Marketing ; Paris",
  "Camille ; Finance ; Lyon",
  "Yanis ; Informatique ; Paris",
  "Emma ; RH ; Lyon",
].join("\n");

const CLE_STOCKAGE = "canif.equipes-parametres";

export default function EquipesParametres() {
  const [texte, setTexte] = useState(EXEMPLE);
  const [nomsCriteres, setNomsCriteres] = useState(["Service", "Site", "Niveau"]);
  const [modeCriteres, setModeCriteres] = useState<ModeCriteres>("melanger");
  const [mode, setMode] = useState<Mode>("nombre-equipes");
  const [saisieValeur, setSaisieValeur] = useState("3");
  const [equipes, setEquipes] = useState<Personne[][]>([]);

  const pleinEcran = usePleinEcran<HTMLDivElement>();
  const grilleRef = useRef<HTMLDivElement>(null);

  const personnes = lirePersonnes(texte);
  const nbCriteres = Math.max(0, ...personnes.map((p) => p.criteres.length));
  const valeur = Math.max(1, Math.round(Number(saisieValeur)) || 1);
  const nbEquipes = nombreEquipes(personnes.length, mode, valeur);

  // --- Mémoire dans le navigateur ---

  useEffect(() => {
    try {
      const sauvegarde = localStorage.getItem(CLE_STOCKAGE);
      if (sauvegarde) {
        const { texte: t, nomsCriteres: n } = JSON.parse(sauvegarde);
        if (typeof t === "string") setTexte(t);
        if (Array.isArray(n)) setNomsCriteres(n);
      }
    } catch {
      // sans gravité
    }
  }, []);

  function enregistrer(t: string, n: string[]) {
    try {
      localStorage.setItem(CLE_STOCKAGE, JSON.stringify({ texte: t, nomsCriteres: n }));
    } catch {
      // sans gravité
    }
  }

  function modifierTexte(t: string) {
    setTexte(t);
    enregistrer(t, nomsCriteres);
  }

  function modifierNomCritere(i: number, nom: string) {
    const n = nomsCriteres.map((x, j) => (j === i ? nom : x));
    setNomsCriteres(n);
    enregistrer(texte, n);
  }

  function former() {
    if (nbEquipes > 0) setEquipes(repartirAvecCriteres(personnes, nbEquipes, modeCriteres));
  }

  // Décompte des valeurs d'un critère dans une équipe, par exemple « Marketing 2 · RH 1 ».
  function decompte(membres: Personne[], k: number) {
    const compte = new Map<string, number>();
    for (const m of membres) {
      const v = m.criteres[k];
      if (v) compte.set(v, (compte.get(v) ?? 0) + 1);
    }
    return [...compte.entries()].sort((a, b) => b[1] - a[1]);
  }

  const texteACopier = equipes
    .map(
      (e, i) =>
        `Équipe ${i + 1} : ` +
        e.map((p) => (p.criteres.length ? `${p.nom} (${p.criteres.filter(Boolean).join(", ")})` : p.nom)).join(", "),
    )
    .join("\n");

  useAjusterAuPleinEcran(pleinEcran.ref, grilleRef, pleinEcran.actif, equipes, { maxColonnes: 6 });
  useRaccourcis({ " ": former, f: () => pleinEcran.possible && pleinEcran.basculer() });

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Réglages">
        <label className="champ">
          Une personne par ligne : nom ; critère 1 ; critère 2
          <textarea
            rows={Math.max(6, Math.min(personnes.length + 1, 14))}
            value={texte}
            onChange={(e) => modifierTexte(e.target.value)}
            spellCheck={false}
          />
        </label>
        <p className="discret">
          {personnes.length} personne{personnes.length > 1 ? "s" : ""}. Séparez par des points-virgules, ou collez
          directement des colonnes depuis un tableur. Liste gardée dans ce navigateur.
        </p>

        {nbCriteres > 0 && (
          <div className="champs">
            {Array.from({ length: nbCriteres }, (_, i) => (
              <label key={i} className="champ">
                Nom du critère {i + 1}
                <input type="text" maxLength={20} value={nomsCriteres[i] ?? ""} onChange={(e) => modifierNomCritere(i, e.target.value)} />
              </label>
            ))}
          </div>
        )}

        <fieldset className={styles.groupe}>
          <legend>Critères</legend>
          <label className="option">
            <input type="radio" name="criteres" checked={modeCriteres === "melanger"} onChange={() => setModeCriteres("melanger")} />
            Mélanger : des équipes les plus variées possible
          </label>
          <label className="option">
            <input type="radio" name="criteres" checked={modeCriteres === "regrouper"} onChange={() => setModeCriteres("regrouper")} />
            Regrouper : les mêmes critères ensemble
          </label>
        </fieldset>

        <fieldset className={styles.groupe}>
          <legend>Former</legend>
          <label className="option">
            <input type="radio" name="mode" checked={mode === "nombre-equipes"} onChange={() => setMode("nombre-equipes")} />
            un nombre d'équipes
          </label>
          <label className="option">
            <input type="radio" name="mode" checked={mode === "taille-equipe"} onChange={() => setMode("taille-equipe")} />
            des équipes d'une taille donnée
          </label>
        </fieldset>

        <label className="champ">
          {mode === "nombre-equipes" ? "Nombre d'équipes" : "Personnes par équipe"}
          <input type="number" inputMode="numeric" min={1} max={100} value={saisieValeur} onChange={(e) => setSaisieValeur(e.target.value)} />
        </label>

        <p className="discret">
          Les tailles des équipes diffèrent au plus d'une personne. Le premier critère est prioritaire sur le
          deuxième. Le hasard départage tous les cas où les critères ne suffisent pas à décider.
        </p>

        <div>
          <button className="bouton bouton-principal" onClick={former} disabled={nbEquipes === 0}>
            {equipes.length ? "Refaire les équipes" : "Former les équipes"}
          </button>
        </div>
      </section>

      <div ref={pleinEcran.ref} className={`resultat ${pleinEcran.actif ? "ecran-plein" : ""}`}>
        {equipes.length === 0 ? (
          <p className="discret">Saisissez les personnes et leurs critères, puis cliquez sur « Former les équipes ».</p>
        ) : (
          <div ref={grilleRef} className={styles.grille} aria-live="polite">
            {equipes.map((membres, i) => (
              <section key={i} className={styles.equipe} style={{ borderTopColor: `var(--equipe-${i % 8})` }}>
                <h3>
                  Équipe {i + 1} <span className="discret">({membres.length})</span>
                </h3>
                <ul>
                  {membres.map((p, j) => (
                    <li key={j}>
                      <span className={styles.nom}>{p.nom}</span>
                      {p.criteres.filter(Boolean).length > 0 && (
                        <span className={styles.criteres}>{p.criteres.filter(Boolean).join(" · ")}</span>
                      )}
                    </li>
                  ))}
                </ul>
                {nbCriteres > 0 && (
                  <dl className={styles.bilan}>
                    {Array.from({ length: nbCriteres }, (_, k) => (
                      <div key={k}>
                        <dt>{nomsCriteres[k] || `Critère ${k + 1}`}</dt>
                        <dd>{decompte(membres, k).map(([v, n]) => `${v} ${n}`).join(" · ") || "aucun"}</dd>
                      </div>
                    ))}
                  </dl>
                )}
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
