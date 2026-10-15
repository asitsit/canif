"use client";

// Tirage de rôles : chaque rôle de la liste est attribué au hasard à une personne.
// - Plus de personnes que de rôles : les autres sont « sans rôle particulier ».
// - Plus de rôles que de personnes : une alerte le signale ; au choix, les rôles
//   en trop restent non attribués, ou certaines personnes reçoivent plusieurs rôles.
// Des cadres connus (six chapeaux de Bono, Belbin...) aident à remplir la liste.

import { useEffect, useState } from "react";
import BoutonCopier from "@/components/bouton-copier";
import ChampNoms, { useListeNoms } from "@/components/liste-noms";
import { usePleinEcran, useRaccourcis } from "@/lib/hooks";
import { lireListe, melanger } from "@/lib/hasard";
import { CADRES } from "./cadres";
import styles from "./tirage-roles.module.css";

// Rôles proposés à la première visite.
const ROLES_EXEMPLE = "Animation\nGardien du temps\nPrise de notes\nAvocat du diable\nObservation";

const CLE_STOCKAGE = "canif.roles";

// Une ligne du résultat : un rôle (ou aucun) et la personne qui le reçoit.
type Attribution = { nom: string; role: string | null };

export default function TirageRoles() {
  const liste = useListeNoms();
  const [texteRoles, setTexteRoles] = useState(ROLES_EXEMPLE);
  const [cadreOuvert, setCadreOuvert] = useState(CADRES[0].id);
  const [plusieursRoles, setPlusieursRoles] = useState(false);
  const [attributions, setAttributions] = useState<Attribution[]>([]);
  const [rolesNonAttribues, setRolesNonAttribues] = useState<string[]>([]);

  const pleinEcran = usePleinEcran<HTMLDivElement>();
  const roles = lireListe(texteRoles);
  const nbPersonnes = liste.noms.length;
  const rolesEnTrop = Math.max(roles.length - nbPersonnes, 0);
  const cadre = CADRES.find((c) => c.id === cadreOuvert) ?? CADRES[0];

  // --- Liste des rôles, gardée dans le navigateur comme la liste des noms ---

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

  // Ajoute le rôle à la liste s'il n'y est pas, le retire sinon.
  function basculerRole(role: string) {
    if (roles.includes(role)) modifierRoles(roles.filter((r) => r !== role).join("\n"));
    else modifierRoles([...roles, role].join("\n"));
  }

  function ajouterTout() {
    modifierRoles([...roles, ...cadre.roles.filter((r) => !roles.includes(r))].join("\n"));
  }

  // --- Tirage ---

  function tirer() {
    if (nbPersonnes === 0 || roles.length === 0) return;
    const personnes = melanger(liste.noms);
    const rolesMelanges = melanger(roles);
    let resultat: Attribution[];

    if (rolesEnTrop > 0 && plusieursRoles) {
      // Tous les rôles sont distribués à tour de rôle : certains en ont deux (ou plus).
      resultat = rolesMelanges.map((role, i) => ({ role, nom: personnes[i % personnes.length] }));
      setRolesNonAttribues([]);
    } else {
      // Un rôle au plus par personne.
      resultat = personnes.map((nom, i) => ({ nom, role: rolesMelanges[i] ?? null }));
      setRolesNonAttribues(rolesMelanges.slice(personnes.length));
    }
    // Affichage dans l'ordre de la liste des rôles, les « sans rôle » à la fin.
    const rang = (role: string | null) => (role === null ? Infinity : roles.indexOf(role));
    resultat.sort((a, b) => rang(a.role) - rang(b.role));
    setAttributions(resultat);
  }

  const texteACopier = attributions
    .map((a) => `${a.role ?? "Sans rôle particulier"} : ${a.nom}`)
    .join("\n");

  useRaccourcis({ " ": tirer, f: () => pleinEcran.possible && pleinEcran.basculer() });

  return (
    <div className="mise-en-page-tirage">
      <section className="reglages" aria-label="Réglages">
        <ChampNoms texte={liste.texte} onChange={liste.modifier} nombre={nbPersonnes} />

        <label className="champ">
          Rôles, un par ligne
          <textarea
            rows={Math.max(4, Math.min(roles.length + 1, 10))}
            value={texteRoles}
            onChange={(e) => modifierRoles(e.target.value)}
            spellCheck={false}
          />
        </label>

        <div className={styles.cadres}>
          <label className="champ">
            Ajouter des rôles depuis un cadre connu
            <select value={cadreOuvert} onChange={(e) => setCadreOuvert(e.target.value)}>
              {CADRES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.panneau}>
            <p className="discret">{cadre.description} Cliquez sur un rôle pour l'ajouter ou le retirer.</p>
            <div className={styles.puces}>
              {cadre.roles.map((role) => {
                const present = roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    aria-pressed={present}
                    className={`${styles.puce} ${present ? styles.pucePresente : ""}`}
                    onClick={() => basculerRole(role)}
                  >
                    <span aria-hidden="true">{present ? "✓" : "+"}</span> {role}
                  </button>
                );
              })}
            </div>
            <div className={styles.actionsCadre}>
              <button type="button" className="lien-bouton" onClick={ajouterTout}>
                Ajouter tous les rôles de ce cadre
              </button>
              <button type="button" className="lien-bouton" onClick={() => modifierRoles(cadre.roles.join("\n"))}>
                Remplacer ma liste par ce cadre
              </button>
            </div>
          </div>
        </div>

        <p className="discret">
          {roles.length} rôle{roles.length > 1 ? "s" : ""} pour {nbPersonnes} personne{nbPersonnes > 1 ? "s" : ""}.
          {nbPersonnes > roles.length && roles.length > 0 && " Les autres n'auront pas de rôle particulier."}
        </p>

        {rolesEnTrop > 0 && nbPersonnes > 0 && (
          <div className={styles.alerte} role="status">
            <strong>
              Il y a plus de rôles que de personnes : {roles.length} rôles pour {nbPersonnes} personne
              {nbPersonnes > 1 ? "s" : ""}.
            </strong>
            <label className="option">
              <input type="checkbox" checked={plusieursRoles} onChange={(e) => setPlusieursRoles(e.target.checked)} />
              Attribuer tous les rôles (certaines personnes en auront plusieurs)
            </label>
            {!plusieursRoles && (
              <span>
                {rolesEnTrop > 1
                  ? `Sinon, ${rolesEnTrop} rôles tirés au hasard ne seront pas attribués.`
                  : "Sinon, 1 rôle tiré au hasard ne sera pas attribué."}
              </span>
            )}
          </div>
        )}

        <div>
          <button className="bouton bouton-principal" onClick={tirer} disabled={nbPersonnes === 0 || roles.length === 0}>
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
          <p className={styles.nonAttribues}>Non attribués, faute de personnes : {rolesNonAttribues.join(", ")}.</p>
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
