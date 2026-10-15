"use client";

// Générateur d'agenda : à partir d'une heure de début et d'une liste d'étapes
// avec leur durée (« Accueil : 15 min »), calcule les horaires de chacune.
// Même lecture du programme que le minuteur d'étapes (lib/programme.ts).

import Link from "next/link";
import { useRef } from "react";
import BoutonCopier from "@/components/bouton-copier";
import BoutonsExport from "@/components/boutons-export";
import { lireProgramme } from "@/lib/programme";
import { dateEnLettres } from "@/lib/redaction";
import { useStockageLocal } from "@/lib/stockage";
import { formaterDuree } from "@/lib/temps";
import styles from "./agenda.module.css";

const DEFAUT = {
  titre: "Atelier : imaginer notre organisation de demain",
  date: "",
  debut: "09:00",
  etapes: "Accueil café : 15 min\nTour de table : 20 min\nPrésentation des enjeux : 20 min\nTravail en sous-groupes : 45 min\nPause : 15 min\nRestitution : 30 min\nPriorisation et décisions : 25 min\nConclusion : 10 min",
};

// « 9:00 » + minutes -> « 9 h 15 »
function horaire(base: string, ms: number) {
  const [h, m] = base.split(":").map(Number);
  const total = (h * 60 + m + Math.round(ms / 60_000)) % (24 * 60);
  return `${Math.floor(total / 60)} h ${String(total % 60).padStart(2, "0")}`;
}

export default function Agenda() {
  const [v, setV] = useStockageLocal("agenda", DEFAUT);
  const val = { ...DEFAUT, ...v };
  const zone = useRef<HTMLDivElement>(null);
  const { intervenants: etapes, lignesIllisibles } = lireProgramme(val.etapes);
  const debutValide = /^\d{1,2}:\d{2}$/.test(val.debut);

  let cumul = 0;
  const lignes = etapes.map((e) => {
    const de = cumul;
    cumul += e.prevuMs;
    return { nom: e.nom, de: horaire(val.debut, de), a: horaire(val.debut, cumul), duree: formaterDuree(e.prevuMs), pause: /pause|déjeuner|repas|café/i.test(e.nom) };
  });

  const texte = [val.titre, ...(val.date ? [dateEnLettres(val.date)] : []), "", ...lignes.map((l) => `${l.de} - ${l.a} : ${l.nom}`)].join("\n");

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Programme">
        <label className="champ">
          Titre
          <input type="text" value={val.titre} onChange={(e) => setV({ ...val, titre: e.target.value })} />
        </label>
        <div className="champs">
          <label className="champ">
            Date
            <input type="date" value={val.date} onChange={(e) => setV({ ...val, date: e.target.value })} />
          </label>
          <label className="champ">
            Heure de début
            <input type="time" value={val.debut} onChange={(e) => setV({ ...val, debut: e.target.value })} />
          </label>
        </div>
        <label className="champ">
          Étapes, une par ligne, avec leur durée
          <textarea rows={10} value={val.etapes} onChange={(e) => setV({ ...val, etapes: e.target.value })} spellCheck={false} />
        </label>
        {lignesIllisibles.length > 0 && <p className="note">Lignes sans durée : {lignesIllisibles.join(", ")}</p>}
        <p className="discret">
          Le jour J, le <Link href="/minuteur-etapes">minuteur d'étapes</Link> accepte le même format.
        </p>
      </section>

      <div className="resultat">
        <div ref={zone} className={styles.agenda}>
          <h2 className={styles.titre}>{val.titre}</h2>
          {val.date && <p className={styles.date}>{dateEnLettres(val.date)}</p>}
          {debutValide && (
            <ol className={styles.lignes}>
              {lignes.map((l, i) => (
                <li key={i} className={l.pause ? styles.pause : ""}>
                  <span className={styles.heures}>
                    {l.de} <span aria-hidden="true">-</span> {l.a}
                  </span>
                  <span className={styles.nom}>{l.nom}</span>
                  <span className={styles.duree}>{l.duree}</span>
                </li>
              ))}
            </ol>
          )}
          {debutValide && etapes.length > 0 && (
            <p className={styles.total}>
              Fin prévue à {horaire(val.debut, cumul)}, soit {formaterDuree(cumul)} au total.
            </p>
          )}
        </div>
        <div className="commandes">
          <BoutonCopier texte={texte} libelle="Copier l'agenda" />
          <BoutonsExport cible={zone} nomFichier="agenda" />
        </div>
      </div>
    </div>
  );
}
