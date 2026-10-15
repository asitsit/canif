"use client";

// Canevas de pitch de 2 minutes : cinq questions, un texte assemblé, et la durée
// estimée à l'oral (environ 130 mots par minute, moyenne indicative).

import GenerateurTexte, { type Valeurs } from "@/components/generateur-texte";
import { formaterDuree } from "@/lib/temps";
import { mots } from "@/lib/texte";

const MOTS_PAR_MINUTE = 130;
const CIBLE_MS = 2 * 60_000;

const champs = [
  { id: "accroche", libelle: "1. Accroche : une question ou un fait qui interpelle", type: "zone" as const, defaut: "Combien de réunions avez-vous quittées cette semaine sans savoir ce qui avait été décidé ?" },
  { id: "probleme", libelle: "2. Le problème : pour qui, et pourquoi c'est important", type: "zone" as const, defaut: "Les équipes passent des heures en réunion, mais les décisions se perdent et les mêmes sujets reviennent." },
  { id: "solution", libelle: "3. Votre solution, en une phrase simple", type: "zone" as const, defaut: "J'anime des ateliers courts qui se terminent toujours par des décisions écrites et un responsable pour chacune." },
  { id: "preuve", libelle: "4. Une preuve : un résultat, un chiffre, un exemple", type: "zone" as const, defaut: "Dans une équipe de quinze personnes, le nombre de réunions hebdomadaires a été divisé par deux en trois mois." },
  { id: "difference", libelle: "5. Ce qui vous rend différent", type: "zone" as const, defaut: "Je ne laisse pas un rapport : je forme l'équipe à animer elle-même ces ateliers." },
  { id: "appel", libelle: "6. Appel à l'action : ce que vous attendez de votre interlocuteur", type: "zone" as const, defaut: "Et si on testait un premier atelier avec votre équipe le mois prochain ?" },
];

function generer(v: Valeurs) {
  const texte = ["accroche", "probleme", "solution", "preuve", "difference", "appel"]
    .map((id) => v[id]?.trim())
    .filter(Boolean)
    .join("\n\n");
  return { texte };
}

function apercu(v: Valeurs) {
  const n = mots(generer(v).texte).length;
  const duree = (n / MOTS_PAR_MINUTE) * 60_000;
  const ratio = Math.min(duree / CIBLE_MS, 1.5);
  const couleur = duree > CIBLE_MS * 1.1 ? "var(--rouge)" : duree < CIBLE_MS * 0.6 ? "#a16207" : "var(--vert)";
  return (
    <div>
      <p style={{ margin: "0 0 6px", fontWeight: 700 }}>
        Durée estimée à l'oral : <span style={{ color: couleur }}>{n ? formaterDuree(duree) : "0 s"}</span> ({n} mots, objectif 2 min,
        soit environ {MOTS_PAR_MINUTE * 2} mots)
      </p>
      <div className="barre" style={{ margin: 0, maxWidth: "none" }} aria-hidden="true">
        <div className="barre-remplie" style={{ width: `${(ratio / 1.5) * 100}%`, background: couleur }} />
      </div>
      <p className="discret" style={{ margin: "6px 0 0" }}>
        {duree > CIBLE_MS * 1.1
          ? "Trop long : raccourcissez le problème ou la preuve."
          : duree < CIBLE_MS * 0.6
            ? "Plutôt court : vous avez de la place pour un exemple concret."
            : "Bonne longueur pour deux minutes."}
      </p>
    </div>
  );
}

export default function Pitch() {
  return <GenerateurTexte cle="pitch" champs={champs} generer={generer} apercu={apercu} />;
}
