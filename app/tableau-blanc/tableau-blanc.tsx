"use client";

// Tableau blanc simple : formes (rectangle, ellipse), flèches, texte et crayon,
// dessinés en SVG. Outil « Sélection » pour déplacer ou supprimer un élément
// (double-clic sur un texte pour le modifier). Annuler, export image ou SVG.
// Le tableau est gardé dans le navigateur (localStorage).

import { useRef, useState } from "react";
import BoutonsExport from "@/components/boutons-export";
import { telecharger } from "@/lib/images";
import { nouvelId, useStockageLocal } from "@/lib/stockage";
import { useRaccourcis } from "@/lib/hooks";
import styles from "./tableau-blanc.module.css";

const L = 1600;
const H = 900;
const COULEURS = ["#111827", "#c2410c", "#1d4ed8", "#15803d", "#7e22ce", "#be123c"];

type Outil = "selection" | "rect" | "ellipse" | "fleche" | "texte" | "trait";
type Objet = {
  id: string;
  type: Exclude<Outil, "selection">;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  points?: [number, number][];
  texte?: string;
  couleur: string;
  epaisseur: number;
};

const OUTILS: { id: Outil; nom: string; touche: string }[] = [
  { id: "selection", nom: "Sélection", touche: "v" },
  { id: "rect", nom: "Rectangle", touche: "r" },
  { id: "ellipse", nom: "Ellipse", touche: "e" },
  { id: "fleche", nom: "Flèche", touche: "a" },
  { id: "texte", nom: "Texte", touche: "t" },
  { id: "trait", nom: "Crayon", touche: "p" },
];

// Pointe de flèche : triangle au bout du segment.
function pointe(o: Objet) {
  const angle = Math.atan2(o.y2 - o.y1, o.x2 - o.x1);
  const t = 10 + o.epaisseur * 3;
  const p = (a: number) => `${o.x2 - t * Math.cos(angle + a)},${o.y2 - t * Math.sin(angle + a)}`;
  return `${o.x2},${o.y2} ${p(0.45)} ${p(-0.45)}`;
}

function rendu(o: Objet, selectionne: boolean) {
  const commun = { stroke: o.couleur, strokeWidth: o.epaisseur, fill: "none" };
  const x = Math.min(o.x1, o.x2);
  const y = Math.min(o.y1, o.y2);
  const w = Math.abs(o.x2 - o.x1);
  const h = Math.abs(o.y2 - o.y1);
  const halo = selectionne ? { filter: "drop-shadow(0 0 4px #f59e0b)" } : undefined;
  switch (o.type) {
    case "rect":
      return <rect x={x} y={y} width={w} height={h} rx={8} {...commun} style={halo} />;
    case "ellipse":
      return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...commun} style={halo} />;
    case "fleche":
      return (
        <g style={halo}>
          <line x1={o.x1} y1={o.y1} x2={o.x2} y2={o.y2} {...commun} strokeLinecap="round" />
          <polygon points={pointe(o)} fill={o.couleur} />
        </g>
      );
    case "trait":
      return <polyline points={(o.points ?? []).map((p) => p.join(",")).join(" ")} {...commun} strokeLinecap="round" strokeLinejoin="round" style={halo} />;
    case "texte":
      return (
        <text x={o.x1} y={o.y1} fill={o.couleur} fontSize={16 + o.epaisseur * 6} fontWeight={600} dominantBaseline="hanging" style={halo}>
          {(o.texte ?? "").split("\n").map((ligne, i) => (
            <tspan key={i} x={o.x1} dy={i === 0 ? 0 : "1.2em"}>
              {ligne || " "}
            </tspan>
          ))}
        </text>
      );
  }
}

export default function TableauBlanc() {
  const [objets, setObjets] = useStockageLocal<Objet[]>("tableau-blanc", []);
  const [outil, setOutil] = useState<Outil>("rect");
  const [couleur, setCouleur] = useState(COULEURS[0]);
  const [epaisseur, setEpaisseur] = useState(3);
  const [selection, setSelection] = useState<string | null>(null);
  const [edition, setEdition] = useState<{ id: string; texte: string } | null>(null);
  const [encours, setEncours] = useState<Objet | null>(null);
  const historique = useRef<Objet[][]>([]);
  const glisse = useRef<{ id: string; x: number; y: number } | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const zone = useRef<HTMLDivElement>(null);

  function memoriser() {
    historique.current.push(objets);
    if (historique.current.length > 50) historique.current.shift();
  }

  function annuler() {
    const precedent = historique.current.pop();
    if (precedent) setObjets(precedent);
    setSelection(null);
  }

  function supprimer() {
    if (!selection) return;
    memoriser();
    setObjets((l) => l.filter((o) => o.id !== selection));
    setSelection(null);
  }

  // Coordonnées du pointeur dans le repère du dessin (1600 × 900).
  function point(e: React.PointerEvent | React.MouseEvent) {
    const s = svg.current!;
    const r = s.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * L, y: ((e.clientY - r.top) / r.height) * H };
  }

  function debut(e: React.PointerEvent<SVGSVGElement>) {
    if (edition) return;
    const p = point(e);
    const cible = (e.target as Element).closest("[data-id]")?.getAttribute("data-id") ?? null;
    if (outil === "selection") {
      setSelection(cible);
      if (cible) {
        memoriser();
        glisse.current = { id: cible, x: p.x, y: p.y };
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      return;
    }
    if (outil === "texte") {
      // Empêche le navigateur de retirer le focus du champ de saisie qui va s'ouvrir.
      e.preventDefault();
      memoriser();
      const id = nouvelId();
      setObjets((l) => [...l, { id, type: "texte", x1: p.x, y1: p.y, x2: p.x, y2: p.y, texte: "", couleur, epaisseur }]);
      setEdition({ id, texte: "" });
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    setEncours({ id: nouvelId(), type: outil, x1: p.x, y1: p.y, x2: p.x, y2: p.y, points: outil === "trait" ? [[p.x, p.y]] : undefined, couleur, epaisseur });
  }

  function mouvement(e: React.PointerEvent<SVGSVGElement>) {
    const p = point(e);
    if (glisse.current) {
      const { id, x, y } = glisse.current;
      const dx = p.x - x;
      const dy = p.y - y;
      glisse.current = { id, x: p.x, y: p.y };
      setObjets((l) =>
        l.map((o) =>
          o.id === id
            ? { ...o, x1: o.x1 + dx, y1: o.y1 + dy, x2: o.x2 + dx, y2: o.y2 + dy, points: o.points?.map(([a, b]) => [a + dx, b + dy] as [number, number]) }
            : o,
        ),
      );
      return;
    }
    if (encours) setEncours({ ...encours, x2: p.x, y2: p.y, points: encours.points ? [...encours.points, [p.x, p.y]] : undefined });
  }

  function fin() {
    glisse.current = null;
    if (!encours) return;
    const assezGrand = encours.type === "trait" ? (encours.points?.length ?? 0) > 2 : Math.hypot(encours.x2 - encours.x1, encours.y2 - encours.y1) > 8;
    if (assezGrand) {
      memoriser();
      setObjets((l) => [...l, encours]);
    }
    setEncours(null);
  }

  function validerTexte() {
    if (!edition) return;
    const texte = edition.texte.trim();
    setObjets((l) => (texte ? l.map((o) => (o.id === edition.id ? { ...o, texte } : o)) : l.filter((o) => o.id !== edition.id)));
    setEdition(null);
  }

  function telechargerSvg() {
    if (!svg.current) return;
    const code = new XMLSerializer().serializeToString(svg.current);
    telecharger(new Blob([code], { type: "image/svg+xml" }), "tableau-blanc.svg");
  }

  useRaccourcis({
    ...Object.fromEntries(OUTILS.map((o) => [o.touche, () => setOutil(o.id)])),
    delete: supprimer,
    backspace: supprimer,
    z: annuler,
  });

  const objetEdite = edition ? objets.find((o) => o.id === edition.id) : null;

  return (
    <div style={{ display: "grid", gap: 10, gridTemplateColumns: "minmax(0, 1fr)" }}>
      <div className={styles.barre} role="toolbar" aria-label="Outils">
        {OUTILS.map((o) => (
          <button key={o.id} type="button" className={`bouton ${outil === o.id ? "bouton-actif" : ""}`} onClick={() => setOutil(o.id)} aria-pressed={outil === o.id} title={`Touche ${o.touche.toUpperCase()}`}>
            {o.nom}
          </button>
        ))}
        <span className={styles.couleurs}>
          {COULEURS.map((c) => (
            <button key={c} type="button" className={`${styles.couleur} ${couleur === c ? styles.actif : ""}`} style={{ background: c }} onClick={() => setCouleur(c)} aria-label={`Couleur ${c}`} aria-pressed={couleur === c} />
          ))}
        </span>
        <label className={styles.epaisseur}>
          Épaisseur
          <input type="range" min={1} max={8} value={epaisseur} onChange={(e) => setEpaisseur(Number(e.target.value))} />
        </label>
      </div>

      <div ref={zone} className={styles.cadre}>
        <svg
          ref={svg}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${L} ${H}`}
          className={`${styles.svg} ${styles[outil] ?? ""}`}
          onPointerDown={debut}
          onPointerMove={mouvement}
          onPointerUp={fin}
          onPointerCancel={fin}
          onDoubleClick={(e) => {
            const id = (e.target as Element).closest("[data-id]")?.getAttribute("data-id");
            const o = objets.find((x) => x.id === id);
            if (o?.type === "texte") {
              memoriser();
              setEdition({ id: o.id, texte: o.texte ?? "" });
            }
          }}
          role="img"
          aria-label={`Tableau blanc, ${objets.length} élément${objets.length > 1 ? "s" : ""}`}
        >
          <rect width={L} height={H} fill="#ffffff" />
          {objets.map((o) => (
            <g key={o.id} data-id={o.id} style={{ cursor: outil === "selection" ? "move" : undefined }}>
              {/* zone de clic élargie pour attraper les traits fins */}
              {o.type !== "texte" && (
                <rect
                  x={Math.min(o.x1, o.x2) - 6}
                  y={Math.min(o.y1, o.y2) - 6}
                  width={Math.abs(o.x2 - o.x1) + 12}
                  height={Math.abs(o.y2 - o.y1) + 12}
                  fill="transparent"
                  pointerEvents={outil === "selection" ? "all" : "none"}
                />
              )}
              {rendu(o, o.id === selection)}
            </g>
          ))}
          {encours && rendu(encours, false)}
        </svg>
        {objetEdite && edition && (
          <textarea
            autoFocus
            className={styles.edition}
            style={{ left: `${(objetEdite.x1 / L) * 100}%`, top: `${(objetEdite.y1 / H) * 100}%`, color: objetEdite.couleur }}
            value={edition.texte}
            onChange={(e) => setEdition({ ...edition, texte: e.target.value })}
            onBlur={validerTexte}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                (e.target as HTMLTextAreaElement).blur();
              }
            }}
            aria-label="Texte"
            placeholder="Votre texte"
          />
        )}
      </div>

      <div className="commandes">
        <button type="button" className="bouton" onClick={annuler}>
          Annuler
        </button>
        <button type="button" className="bouton" onClick={supprimer} disabled={!selection}>
          Supprimer la sélection
        </button>
        <BoutonsExport cible={zone} nomFichier="tableau-blanc" />
        <button type="button" className="bouton" onClick={telechargerSvg}>
          Télécharger en SVG
        </button>
        <button
          type="button"
          className="bouton"
          onClick={() => {
            if (window.confirm("Effacer tout le tableau ?")) {
              memoriser();
              setObjets([]);
            }
          }}
        >
          Tout effacer
        </button>
      </div>
      <p className="discret">
        Choisissez un outil puis tracez sur le tableau. Avec « Sélection », cliquez sur un élément pour le déplacer ou le
        supprimer (touche Suppr) ; double-cliquez sur un texte pour le modifier. Raccourcis : V, R, E, A (flèche), T, P
        (crayon), Z pour annuler. Le tableau reste enregistré dans ce navigateur.
      </p>
    </div>
  );
}
