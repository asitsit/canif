"use client";

// Tableau à zones : des post-its rangés dans des zones (quadrants d'une matrice,
// colonnes d'une rétrospective, blocs d'un canevas...). Utilisé par plusieurs outils
// (Eisenhower, impact / effort, SWOT, Business Model Canvas, Ishikawa...).
//
// - Ajouter : champ en bas de chaque zone (Entrée pour valider).
// - Modifier : clic sur le texte d'un post-it.
// - Déplacer : glisser-déposer à la souris, ou menu « Déplacer » (téléphone, clavier).
// - Tout est gardé dans le navigateur.

import { useRef, useState } from "react";
import BoutonsExport from "@/components/boutons-export";
import { nouvelId, useStockageLocal } from "@/lib/stockage";
import styles from "./tableau-zones.module.css";

export type Zone = {
  id: string;
  titre: string;
  aide?: string; // courte question qui guide le remplissage
  couleur?: string; // couleur des post-its de la zone
};

type PostIt = { id: string; zone: string; texte: string };

type Donnees = { sujet: string; postIts: PostIt[] };

type Props = {
  cle: string; // clé de stockage, une par outil (et par modèle)
  zones: Zone[];
  // Disposition sur grand écran, en « grid-template-areas » CSS (une chaîne par ligne).
  // Les noms des aires sont les identifiants des zones. Sur téléphone : une colonne.
  disposition: string[];
  colonnes?: string; // grid-template-columns sur grand écran
  axes?: { horizontal?: [string, string]; vertical?: [string, string] }; // libellés d'axes (matrices)
  libelleSujet?: string;
  nomFichier: string;
  exemple?: Donnees; // contenu proposé à la première visite
};

export default function TableauZones({
  cle,
  zones,
  disposition,
  colonnes,
  axes,
  libelleSujet = "Sujet",
  nomFichier,
  exemple,
}: Props) {
  const [donnees, setDonnees] = useStockageLocal<Donnees>(cle, exemple ?? { sujet: "", postIts: [] });
  const [saisies, setSaisies] = useState<Record<string, string>>({});
  const [enEdition, setEnEdition] = useState<string | null>(null);
  const [survol, setSurvol] = useState<string | null>(null);
  const zoneExport = useRef<HTMLDivElement>(null);

  const modifierPostIts = (f: (liste: PostIt[]) => PostIt[]) => setDonnees((d) => ({ ...d, postIts: f(d.postIts) }));

  function ajouter(zone: string) {
    const texte = (saisies[zone] ?? "").trim();
    if (!texte) return;
    modifierPostIts((liste) => [...liste, { id: nouvelId(), zone, texte: texte.slice(0, 300) }]);
    setSaisies((s) => ({ ...s, [zone]: "" }));
  }

  function deplacer(id: string, zone: string) {
    // Le post-it déplacé passe en fin de zone.
    modifierPostIts((liste) => {
      const p = liste.find((x) => x.id === id);
      return p ? [...liste.filter((x) => x.id !== id), { ...p, zone }] : liste;
    });
  }

  function toutEffacer() {
    if (window.confirm("Effacer tous les post-its et le sujet ? Cette action est définitive.")) {
      setDonnees({ sujet: "", postIts: [] });
    }
  }

  const grille = {
    "--zones-aires": disposition.map((ligne) => `"${ligne}"`).join(" "),
    "--zones-colonnes": colonnes ?? `repeat(${disposition[0].split(/\s+/).length}, minmax(0, 1fr))`,
  } as React.CSSProperties;

  return (
    <div className={styles.outil}>
      <div ref={zoneExport} className={styles.export}>
        <label className={`champ ${styles.sujet}`}>
          {libelleSujet}
          <input
            type="text"
            maxLength={120}
            value={donnees.sujet}
            onChange={(e) => setDonnees((d) => ({ ...d, sujet: e.target.value }))}
            placeholder="Écrivez ici le sujet traité"
          />
        </label>

        <div className={styles.cadreAxes}>
          {axes?.vertical && (
            <div className={styles.axeVertical} aria-hidden="true">
              {/* Texte tourné d'un demi-tour : le premier libellé s'affiche en bas */}
              <span>{axes.vertical[0]}</span>
              <span>{axes.vertical[1]}</span>
            </div>
          )}
          <div className={styles.grille} style={grille}>
            {zones.map((zone) => {
              const postIts = donnees.postIts.filter((p) => p.zone === zone.id);
              return (
                <section
                  key={zone.id}
                  className={`${styles.zone} ${survol === zone.id ? styles.survol : ""}`}
                  style={{ gridArea: zone.id, "--couleur-zone": zone.couleur ?? "#fef3c7" } as React.CSSProperties}
                  aria-label={zone.titre}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setSurvol(zone.id);
                  }}
                  onDragLeave={() => setSurvol(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setSurvol(null);
                    const id = e.dataTransfer.getData("text/plain");
                    if (id) deplacer(id, zone.id);
                  }}
                >
                  <h3 className={styles.titreZone}>
                    {zone.titre} {postIts.length > 0 && <span className={styles.compte}>{postIts.length}</span>}
                  </h3>
                  {zone.aide && <p className={styles.aide}>{zone.aide}</p>}

                  <ul className={styles.postIts}>
                    {postIts.map((p) => (
                      <li
                        key={p.id}
                        className={styles.postIt}
                        draggable={enEdition !== p.id}
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", p.id)}
                      >
                        {enEdition === p.id ? (
                          <textarea
                            className={styles.edition}
                            autoFocus
                            defaultValue={p.texte}
                            maxLength={300}
                            aria-label="Modifier le post-it"
                            onBlur={(e) => {
                              const texte = e.target.value.trim();
                              modifierPostIts((liste) =>
                                texte ? liste.map((x) => (x.id === p.id ? { ...x, texte } : x)) : liste.filter((x) => x.id !== p.id),
                              );
                              setEnEdition(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) (e.target as HTMLTextAreaElement).blur();
                              if (e.key === "Escape") setEnEdition(null);
                            }}
                          />
                        ) : (
                          <button type="button" className={styles.texte} onClick={() => setEnEdition(p.id)} title="Cliquer pour modifier">
                            {p.texte}
                          </button>
                        )}
                        <div className={`${styles.actions} pas-exporter`}>
                          <select
                            aria-label="Déplacer vers"
                            value=""
                            onChange={(e) => e.target.value && deplacer(p.id, e.target.value)}
                          >
                            <option value="">Déplacer</option>
                            {zones
                              .filter((z) => z.id !== zone.id)
                              .map((z) => (
                                <option key={z.id} value={z.id}>
                                  {z.titre}
                                </option>
                              ))}
                          </select>
                          <button
                            type="button"
                            className={styles.supprimer}
                            onClick={() => modifierPostIts((liste) => liste.filter((x) => x.id !== p.id))}
                            aria-label={`Supprimer « ${p.texte} »`}
                          >
                            ×
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <form
                    className={`${styles.ajout} pas-exporter`}
                    onSubmit={(e) => {
                      e.preventDefault();
                      ajouter(zone.id);
                    }}
                  >
                    <input
                      type="text"
                      value={saisies[zone.id] ?? ""}
                      onChange={(e) => setSaisies((s) => ({ ...s, [zone.id]: e.target.value }))}
                      placeholder="Ajouter..."
                      aria-label={`Ajouter dans ${zone.titre}`}
                      maxLength={300}
                    />
                    <button type="submit" aria-label={`Valider l'ajout dans ${zone.titre}`}>
                      +
                    </button>
                  </form>
                </section>
              );
            })}
          </div>
        </div>
        {axes?.horizontal && (
          <div className={styles.axeHorizontal} aria-hidden="true">
            <span>{axes.horizontal[0]}</span>
            <span>{axes.horizontal[1]}</span>
          </div>
        )}
      </div>

      <div className="commandes pas-imprimer">
        <BoutonsExport cible={zoneExport} nomFichier={nomFichier} />
        <button type="button" className="bouton" onClick={toutEffacer}>
          Tout effacer
        </button>
      </div>
      <p className="discret pas-imprimer">
        Cliquez sur un post-it pour le modifier, glissez-le pour le déplacer. Le contenu reste enregistré dans ce
        navigateur uniquement.
      </p>
    </div>
  );
}
