"use client";

// Export en image ou PDF (D5).
// 1. Rappel : l'export est intégré aux outils qui produisent un visuel (liens).
// 2. Petit outil autonome : mettre en page un texte (titres, listes) pour
//    l'imprimer, l'enregistrer en PDF ou le télécharger en image.
//    Mise en forme simple : « # » titre de partie, « - » puce, ligne vide = paragraphe.

import Link from "next/link";
import { useRef } from "react";
import BoutonsExport from "@/components/boutons-export";
import { trouverOutil } from "@/lib/catalogue";
import { useStockageLocal } from "@/lib/stockage";
import styles from "./export.module.css";

const OUTILS_AVEC_EXPORT = [
  "agenda", "eisenhower", "impact-effort", "canevas", "parties-prenantes", "ishikawa", "retrospective", "cinq-pourquoi",
  "decision-ponderee", "selection-mission", "raci", "roadmap", "gantt", "retro-planning", "nuage-depuis-texte",
  "tableau-blanc", "plan-de-salle", "mots-croises",
];

const EXEMPLE = {
  titre: "Synthèse de l'atelier",
  sousTitre: "Équipe projet, octobre",
  texte: "# Ce que nous avons décidé\n- Les réunions d'équipe durent 30 minutes\n- Un tableau de suivi est partagé\n\n# Prochaines étapes\nPoint d'étape dans un mois, avec un bilan des nouvelles habitudes.",
};

// Transforme le texte en blocs : titres, listes, paragraphes.
function blocs(texte: string) {
  const resultat: ({ type: "titre" | "paragraphe"; texte: string } | { type: "liste"; elements: string[] })[] = [];
  let paragraphe: string[] = [];
  const fermer = () => {
    if (paragraphe.length) resultat.push({ type: "paragraphe", texte: paragraphe.join(" ") });
    paragraphe = [];
  };
  for (const brute of texte.split(/\r?\n/)) {
    const ligne = brute.trim();
    if (!ligne) {
      fermer();
    } else if (ligne.startsWith("#")) {
      fermer();
      resultat.push({ type: "titre", texte: ligne.replace(/^#+\s*/, "") });
    } else if (/^[-*•]\s+/.test(ligne)) {
      fermer();
      const derniere = resultat[resultat.length - 1];
      const element = ligne.replace(/^[-*•]\s+/, "");
      if (derniere?.type === "liste") derniere.elements.push(element);
      else resultat.push({ type: "liste", elements: [element] });
    } else {
      paragraphe.push(ligne);
    }
  }
  fermer();
  return resultat;
}

export default function Export() {
  const [v, setV] = useStockageLocal("export-texte", EXEMPLE);
  const val = { ...EXEMPLE, ...v };
  const page = useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "minmax(0, 1fr)" }}>
      <section className="reglages pas-imprimer" aria-label="Outils avec export">
        <h2>Dans les outils</h2>
        <p style={{ margin: 0 }}>
          Les outils qui produisent un visuel ont des boutons « Télécharger en image » et « Imprimer ou PDF » (dans la
          fenêtre d'impression, choisissez « Enregistrer au format PDF ») :
        </p>
        <ul className={styles.liens}>
          {OUTILS_AVEC_EXPORT.map((slug) => (
            <li key={slug}>
              <Link href={`/${slug}`}>{trouverOutil(slug)?.outil.nom ?? slug}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Mettre en page un texte">
        <h2 className="pas-imprimer">Mettre en page un texte</h2>
        <div className="mise-en-page-tirage">
          <div className="reglages">
            <label className="champ">
              Titre
              <input type="text" value={val.titre} maxLength={100} onChange={(e) => setV({ ...val, titre: e.target.value })} />
            </label>
            <label className="champ">
              Sous-titre (facultatif)
              <input type="text" value={val.sousTitre} maxLength={120} onChange={(e) => setV({ ...val, sousTitre: e.target.value })} />
            </label>
            <label className="champ">
              Texte (« # » pour un titre de partie, « - » pour une puce)
              <textarea rows={12} value={val.texte} onChange={(e) => setV({ ...val, texte: e.target.value })} />
            </label>
          </div>
          <div className="resultat">
            <div ref={page} className={styles.page}>
              <h1 className={styles.titre}>{val.titre}</h1>
              {val.sousTitre && <p className={styles.sousTitre}>{val.sousTitre}</p>}
              {blocs(val.texte).map((b, i) =>
                b.type === "titre" ? (
                  <h2 key={i} className={styles.partie}>
                    {b.texte}
                  </h2>
                ) : b.type === "liste" ? (
                  <ul key={i}>
                    {b.elements.map((e, j) => (
                      <li key={j}>{e}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={i}>{b.texte}</p>
                ),
              )}
            </div>
            <div className="commandes pas-imprimer" style={{ marginTop: 12 }}>
              <BoutonsExport cible={page} nomFichier="document" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
