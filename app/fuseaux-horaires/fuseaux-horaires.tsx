"use client";

// Convertisseur de fuseaux horaires : une date et une heure dans une ville de
// référence, et l'heure correspondante partout ailleurs. Les changements d'heure
// (été / hiver) sont gérés par le navigateur (base officielle des fuseaux).

import { useEffect, useState } from "react";
import BoutonCopier from "@/components/bouton-copier";
import { versIso } from "@/lib/dates";
import { useStockageLocal } from "@/lib/stockage";
import styles from "./fuseaux-horaires.module.css";

// Villes proposées (identifiant officiel du fuseau, nom affiché).
const VILLES: [string, string][] = [
  ["Europe/Paris", "Paris"],
  ["Europe/London", "Londres"],
  ["Europe/Lisbon", "Lisbonne"],
  ["Europe/Berlin", "Berlin"],
  ["Europe/Athens", "Athènes"],
  ["Europe/Istanbul", "Istanbul"],
  ["Africa/Casablanca", "Casablanca"],
  ["Africa/Algiers", "Alger"],
  ["Africa/Tunis", "Tunis"],
  ["Africa/Dakar", "Dakar"],
  ["Africa/Abidjan", "Abidjan"],
  ["Africa/Lagos", "Lagos, Kinshasa"],
  ["Africa/Johannesburg", "Johannesburg"],
  ["Asia/Dubai", "Dubaï"],
  ["Asia/Kolkata", "Bombay, New Delhi"],
  ["Asia/Bangkok", "Bangkok"],
  ["Asia/Singapore", "Singapour"],
  ["Asia/Shanghai", "Pékin, Shanghai"],
  ["Asia/Tokyo", "Tokyo"],
  ["Australia/Sydney", "Sydney"],
  ["Pacific/Noumea", "Nouméa"],
  ["Pacific/Tahiti", "Tahiti"],
  ["America/Martinique", "Martinique, Guadeloupe"],
  ["America/Cayenne", "Cayenne"],
  ["Indian/Reunion", "La Réunion"],
  ["America/Sao_Paulo", "São Paulo"],
  ["America/New_York", "New York"],
  ["America/Toronto", "Montréal, Toronto"],
  ["America/Chicago", "Chicago"],
  ["America/Mexico_City", "Mexico"],
  ["America/Los_Angeles", "Los Angeles, San Francisco"],
];
const NOMS = new Map(VILLES);
const PAR_DEFAUT = ["Europe/Paris", "Europe/London", "America/New_York", "America/Toronto", "Africa/Dakar", "Asia/Dubai", "Asia/Singapore"];

// Décalage d'un fuseau par rapport à l'heure universelle, à un instant donné (en ms).
function decalage(instant: number, fuseau: string) {
  const parties = new Intl.DateTimeFormat("en-US", {
    timeZone: fuseau,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(new Date(instant));
  const v = (t: string) => Number(parties.find((p) => p.type === t)?.value);
  return Date.UTC(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"), v("second")) - Math.floor(instant / 1000) * 1000;
}

// Instant correspondant à une date et une heure « murales » dans un fuseau.
function instantDepuis(dateIso: string, heure: string, fuseau: string) {
  const [a, mo, j] = dateIso.split("-").map(Number);
  const [h, mi] = heure.split(":").map(Number);
  if ([a, mo, j, h, mi].some(Number.isNaN)) return null;
  const naif = Date.UTC(a, mo - 1, j, h, mi);
  const premier = naif - decalage(naif, fuseau);
  const second = naif - decalage(premier, fuseau); // corrige près d'un changement d'heure
  return second;
}

function libelleDecalage(ms: number) {
  const minutes = Math.round(ms / 60_000);
  const signe = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  return `UTC${signe}${Math.floor(abs / 60)}${abs % 60 ? ":" + String(abs % 60).padStart(2, "0") : ""}`;
}

export default function FuseauxHoraires() {
  const [villes, setVilles] = useStockageLocal<string[]>("fuseaux", PAR_DEFAUT);
  const [reference, setReference] = useState("Europe/Paris");
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("10:00");
  const [ajout, setAjout] = useState("");

  // Date du jour et fuseau de l'appareil, connus seulement dans le navigateur.
  useEffect(() => {
    const maintenant = new Date();
    setDate(versIso(maintenant));
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (NOMS.has(local)) setReference(local);
  }, []);

  function maintenant() {
    const parties = new Intl.DateTimeFormat("fr-CA", {
      timeZone: reference,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());
    const v = (t: string) => parties.find((p) => p.type === t)?.value ?? "";
    setDate(`${v("year")}-${v("month")}-${v("day")}`);
    setHeure(`${v("hour")}:${v("minute")}`);
  }

  const instant = date ? instantDepuis(date, heure, reference) : null;
  const jourRef = date;

  const lignes =
    instant === null
      ? []
      : [reference, ...villes.filter((v) => v !== reference)].map((fuseau) => {
          const d = new Date(instant);
          const heureLocale = d.toLocaleTimeString("fr-FR", { timeZone: fuseau, hour: "2-digit", minute: "2-digit" });
          const jourIso = new Intl.DateTimeFormat("fr-CA", { timeZone: fuseau }).format(d);
          const jourTexte = d.toLocaleDateString("fr-FR", { timeZone: fuseau, weekday: "short", day: "numeric", month: "short" });
          const h = Number(new Intl.DateTimeFormat("en-US", { timeZone: fuseau, hour: "numeric", hourCycle: "h23" }).format(d));
          const periode = h >= 9 && h < 18 ? "bureau" : (h >= 7 && h < 9) || (h >= 18 && h < 21) ? "limite" : "nuit";
          const ecart = jourIso === jourRef ? "" : jourIso > jourRef ? "lendemain" : "veille";
          return { fuseau, nom: NOMS.get(fuseau) ?? fuseau, heureLocale, jourTexte, periode, ecart, utc: libelleDecalage(decalage(instant, fuseau)) };
        });

  const texteACopier = lignes.map((l) => `${l.nom} : ${l.heureLocale} (${l.jourTexte})`).join("\n");
  const disponibles = VILLES.filter(([id]) => !villes.includes(id));

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Heure de référence">
        <label className="champ">
          Ville de référence
          <select value={reference} onChange={(e) => setReference(e.target.value)}>
            {VILLES.map(([id, nom]) => (
              <option key={id} value={id}>
                {nom}
              </option>
            ))}
          </select>
        </label>
        <div className="champs">
          <label className="champ">
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="champ">
            Heure
            <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} />
          </label>
        </div>
        <div>
          <button type="button" className="bouton" onClick={maintenant}>
            Maintenant
          </button>
        </div>
        <label className="champ">
          Ajouter une ville
          <select
            value={ajout}
            onChange={(e) => {
              if (e.target.value) setVilles((v) => [...v, e.target.value]);
              setAjout("");
            }}
          >
            <option value="">Choisir...</option>
            {disponibles.map(([id, nom]) => (
              <option key={id} value={id}>
                {nom}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="resultat">
        <ul className={styles.lignes} aria-live="polite">
          {lignes.map((l, i) => (
            <li key={l.fuseau} className={`${styles[l.periode]} ${i === 0 ? styles.reference : ""}`}>
              <span className={styles.nom}>
                {l.nom}
                <small>{l.utc}</small>
              </span>
              <span className={styles.heure}>{l.heureLocale}</span>
              <span className={styles.jour}>
                {l.jourTexte}
                {l.ecart && <small>{l.ecart}</small>}
              </span>
              {i > 0 ? (
                <button type="button" className={styles.retirer} onClick={() => setVilles((v) => v.filter((x) => x !== l.fuseau))} aria-label={`Retirer ${l.nom}`}>
                  ×
                </button>
              ) : (
                <span className={styles.badgeRef}>référence</span>
              )}
            </li>
          ))}
        </ul>
        <p className={styles.legende}>
          <span className={styles.bureau}>9 h à 18 h</span> <span className={styles.limite}>7 h à 9 h, 18 h à 21 h</span>{" "}
          <span className={styles.nuit}>nuit</span>
        </p>
        <div className="commandes">
          <BoutonCopier texte={texteACopier} libelle="Copier les horaires" />
        </div>
      </div>
    </div>
  );
}
