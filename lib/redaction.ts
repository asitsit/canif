// Petites aides de rédaction communes aux générateurs de texte.

import { depuisIso, formaterDate } from "@/lib/dates";

// « jeudi 15 octobre 2026 » à partir de « 2026-10-15 » (ou le texte tel quel).
export function dateEnLettres(iso: string) {
  const d = depuisIso(iso);
  return d ? formaterDate(d) : iso;
}

// « 9 h 30 » à partir de « 09:30 ».
export function heureEnLettres(h: string) {
  const m = h.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return h;
  return `${Number(m[1])} h${m[2] === "00" ? "" : " " + m[2]}`;
}

// Transforme un texte (un élément par ligne) en liste à puces.
export function puces(texte: string, puce = "- ") {
  return texte
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => puce + l.replace(/^[-*•]\s*/, ""))
    .join("\n");
}

// Assemble des paragraphes en ignorant les vides.
export function paragraphes(...blocs: (string | false | undefined)[]) {
  return blocs.filter((b): b is string => !!b && !!b.trim()).join("\n\n");
}
