"use client";

// Tirage de rôles : chaque rôle de la liste est attribué au hasard à une personne.
// - Plus de personnes que de rôles : les autres sont « sans rôle particulier ».
// - Plus de rôles que de personnes : les rôles en trop restent non attribués (signalés).

import { useEffect, useState } from "react";
import BoutonCopier from "@/components/bouton-copier";
import ChampNoms, { useListeNoms } from "@/components/liste-noms";
import { usePleinEcran, useRaccourcis } from "@/lib/hooks";
import { lireListe, melanger } from "@/lib/hasard";
import styles from "./tirage-roles.module.css";

// Rôles proposés à la première visite (classiques d'une réunion ou d'un atelier).
const ROLES_EXEMPLE = "Animation\nGardien du temps\nPrise de notes\nAvocat du diable\nObservation";

const CLE_STOCKAGE = "canif.roles";

type Attribution = { nom: string; role: string | null };

export default function TirageRoles() {
  const liste = useListeNoms();
  const [texteRoles, setTexteRoles] = useState(ROLES_EXEMPLE);
  const [attributions, setAttributions] = useState<Attribution[]>([]);
  const [rolesNonAttribues, setRolesNonAttribues] = useState<string[]>([]);

  const pleinEcran = usePleinEcran<HTMLDivElement>();
  const roles = lireListe(texteRoles);

  // Liste des rôles gardée dans le navigateur, comme la liste des noms.
  useEffect(() => {
    try {
      const sauvegarde = localStorage.getItem(CLE_STOCKAGE);
      if (sauvegarde !== null) setTexteRoles(sauvegarde);
    } catch {
      // sans gravité
    }
  }, []);

  function modifierRoles(valeur: string) {
    setTexteRoles(valeur);
    try {
      localStorage.setItem(CLE_STOCKAGE, valeur);
    } catch {
      // sans gravité
    }
  }

  function tirer() {
    if (liste.noms.length === 0 || roles.length === 0) return;
    const personnes = melanger(liste.noms);
    const rolesMelanges = melanger(roles);
    // Les rôles sont attribués aux premières personnes du mélange.
    const resultat = personnes.map((nom, i) => ({ nom, role: rolesMelanges[i] ?? null }));
    // Affichage : d'abord les personnes avec un rôle, dans l'ordre de la liste des rôles.
    resultat.sort((a, b) => rang(a.role) - rang(b.role));
    setAttributions(resultat);
    setRolesNonAttribues(rolesMelanges.slice(personnes.length));
  }

  function rang(role: string | null) {
    return role === null ? Infinity : roles.indexOf(role);
  }

  const texteACopier = attributions
    .map((a) => `${a.nom} : ${a.role ?? "sans rôle particulier"}`)
    .join("\n");

  useRaccourcis({ " ": tirer, f: () => pleinEcran.possible && pleinEcran.basculer() });

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Réglages">
        <ChampNoms texte={liste.texte} onChange={liste.modifier} nombre={liste.noms.length} />
        <label className="champ">
          Rôles, un par ligne
          <textarea
            rows={Math.max(4, Math.min(roles.length + 1, 10))}
            value={texteRoles}
            onChange={(e) => modifierRoles(e.target.value)}
            spellCheck={false}
          />
        </label>
        <p className="discret">
          {roles.length} rôle{roles.length > 1 ? "s" : ""} pour {liste.noms.length} personne
          {liste.noms.length > 1 ? "s" : ""}.
          {liste.noms.length > roles.length && roles.length > 0 && " Les autres n'auront pas de rôle particulier."}
          {roles.length > liste.noms.length && liste.noms.length > 0 && " Certains rôles ne seront pas attribués."}
        </p>
        <div>
          <button
            className="bouton bouton-principal"
            onClick={tirer}
            disabled={liste.noms.length === 0 || roles.length === 0}
          >
            {attributions.length ? "Nouveau tirage" : "Attribuer les rôles"}
          </button>
        </div>
      </section>

      <div ref={pleinEcran.ref} className={`resultat ${pleinEcran.actif ? "ecran-plein" : ""}`}>
        {attributions.length === 0 ? (
          <p className="discret">Saisissez les noms et les rôles puis cliquez sur « Attribuer les rôles ».</p>
        ) : (
          <ul className={styles.attributions} aria-live="polite">
            {attributions.map((a, i) => (
              <li key={i} className={a.role ? "" : styles.sansRole}>
                <span className={styles.role}>{a.role ?? "Sans rôle particulier"}</span>
                <span className={styles.nom}>{a.nom}</span>
              </li>
            ))}
          </ul>
        )}

        {rolesNonAttribues.length > 0 && (
          <p className={styles.alerte}>Non attribués, faute de personnes : {rolesNonAttribues.join(", ")}.</p>
        )}

        <div className="commandes">
          {attributions.length > 0 && <BoutonCopier texte={texteACopier} />}
          {pleinEcran.possible && (
            <button className="bouton" onClick={pleinEcran.basculer}>
              {pleinEcran.actif ? "Quitter le plein écran" : "Plein écran"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
