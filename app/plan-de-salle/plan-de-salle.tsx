"use client";

// Plan de salle : choisir une disposition et un nombre de personnes, voir le plan,
// y placer des prénoms (liste partagée avec les outils de tirage), l'imprimer.

import { useRef, useState } from "react";
import BoutonsExport from "@/components/boutons-export";
import ChampNoms, { useListeNoms } from "@/components/liste-noms";
import { melanger } from "@/lib/hasard";
import { calculer, DISPOSITIONS } from "./dispositions";
import styles from "./plan-de-salle.module.css";

export default function PlanDeSalle() {
  const liste = useListeNoms();
  const [disposition, setDisposition] = useState("ilots");
  const [nombre, setNombre] = useState(16);
  const [parTable, setParTable] = useState(5);
  const [avecNoms, setAvecNoms] = useState(false);
  const [ordreNoms, setOrdreNoms] = useState<string[] | null>(null); // noms mélangés, ou null pour l'ordre de la liste
  const zone = useRef<HTMLDivElement>(null);

  const n = avecNoms ? Math.max(liste.noms.length, 1) : Math.min(Math.max(nombre, 1), 200);
  const plan = calculer(disposition, n, parTable);
  const noms = avecNoms ? (ordreNoms && ordreNoms.length === liste.noms.length ? ordreNoms : liste.noms) : [];
  const info = DISPOSITIONS.find((d) => d.id === disposition)!;

  // Cadre du dessin : tous les sièges et tables, plus une marge et la place de l'écran.
  const xs = [...plan.sieges.map((s) => s.x), ...plan.tables.flatMap((t) => (t.type === "rond" ? [t.x - t.r, t.x + t.r] : [t.x, t.x + t.l]))];
  const ys = [...plan.sieges.map((s) => s.y), ...plan.tables.flatMap((t) => (t.type === "rond" ? [t.y - t.r, t.y + t.r] : [t.y, t.y + t.h]))];
  const marge = 70;
  const minX = Math.min(...xs) - marge;
  const maxX = Math.max(...xs) + marge;
  const minY = Math.min(...ys) - marge - (plan.ecran ? 90 : 0);
  const maxY = Math.max(...ys) + marge;
  const nbTables = plan.tables.length;

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Réglages">
        <label className="champ">
          Disposition
          <select value={disposition} onChange={(e) => setDisposition(e.target.value)}>
            {DISPOSITIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nom}
              </option>
            ))}
          </select>
        </label>
        <p className="discret">{info.usage}</p>
        {!avecNoms && (
          <label className="champ">
            Nombre de personnes
            <input type="number" min={1} max={200} value={nombre} onChange={(e) => setNombre(Math.round(Number(e.target.value)) || 1)} />
          </label>
        )}
        {(disposition === "ilots" || disposition === "cabaret") && (
          <label className="champ">
            Personnes par table : {parTable}
            <input type="range" min={3} max={10} value={parTable} onChange={(e) => setParTable(Number(e.target.value))} />
          </label>
        )}
        <label className="option">
          <input type="checkbox" checked={avecNoms} onChange={(e) => setAvecNoms(e.target.checked)} />
          Placer des prénoms sur le plan
        </label>
        {avecNoms && (
          <>
            <ChampNoms texte={liste.texte} onChange={liste.modifier} nombre={liste.noms.length} />
            <div className="choix">
              <button type="button" className="bouton" onClick={() => setOrdreNoms(melanger(liste.noms))}>
                Placer au hasard
              </button>
              <button type="button" className="bouton" onClick={() => setOrdreNoms(null)}>
                Ordre de la liste
              </button>
            </div>
          </>
        )}
      </section>

      <div className="resultat">
        <div ref={zone} className={styles.plan}>
          <p className={styles.resume}>
            {info.nom} : {n} personne{n > 1 ? "s" : ""}
            {nbTables > 0 && `, ${nbTables} table${nbTables > 1 ? "s" : ""}`}
          </p>
          <svg viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} className={styles.svg} role="img" aria-label={`Plan de salle : ${info.nom}, ${n} places`}>
            {plan.ecran && (
              <g>
                <rect x={(minX + maxX) / 2 - 120} y={minY + 20} width={240} height={14} rx={4} fill="#334155" />
                <text x={(minX + maxX) / 2} y={minY + 56} textAnchor="middle" fontSize={18} fill="#334155">
                  Écran ou paperboard
                </text>
              </g>
            )}
            {plan.tables.map((t, i) =>
              t.type === "rond" ? (
                <circle key={i} cx={t.x} cy={t.y} r={t.r} fill="#fde68a" stroke="#a16207" strokeWidth={2} />
              ) : (
                <rect key={i} x={t.x} y={t.y} width={t.l} height={t.h} rx={6} fill="#fde68a" stroke="#a16207" strokeWidth={2} />
              ),
            )}
            {plan.sieges.map((s, i) => (
              <g key={i}>
                <circle cx={s.x} cy={s.y} r={20} fill="#ffffff" stroke="#c2410c" strokeWidth={3} />
                <text x={s.x} y={s.y} textAnchor="middle" dominantBaseline="central" fontSize={noms[i] ? 11 : 14} fontWeight={700} fill="#1f2328">
                  {noms[i] ? (noms[i].length > 9 ? noms[i].slice(0, 8) + "." : noms[i]) : i + 1}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <div className="commandes">
          <BoutonsExport cible={zone} nomFichier="plan-de-salle" />
        </div>
        <p className="discret">Plan indicatif, sans échelle exacte : il sert à préparer la salle et à placer les personnes.</p>
      </div>
    </div>
  );
}
