"use client";

/**
 * Horaires exceptionnels : fermetures (congés, jours fériés) et ouvertures
 * particulières (veilles de fêtes). Une ligne par date.
 */

import { useState } from "react";
import type { Plage } from "@/config/site";
import { creerHoraireExceptionnelAction, modifierHoraireExceptionnelAction, supprimerHoraireExceptionnelAction } from "@/lib/actions/horaires";
import { formaterJourLong } from "@/lib/dates";
import { formaterJour } from "@/lib/horaires";
import { attributsChamp, Champ, Etiquette } from "../champs";
import { useExecuter, useFormulaire } from "../executer";
import { Icone } from "../icones";
import { useConfirmer } from "../retours";

export type Exceptionnel = { id: number; date: string; libelle: string; plages: Plage[] | null; note: string; ferme: boolean };
type Mode = "ferme" | "horaires" | "note";

const modeDe = (e: Exceptionnel): Mode => (e.ferme ? "ferme" : e.plages === null ? "note" : "horaires");

function FormulaireExceptionnel({ existant, surFin }: { existant?: Exceptionnel; surFin?: () => void }) {
  const action = existant ? modifierHoraireExceptionnelAction.bind(null, existant.id) : creerHoraireExceptionnelAction;
  const [mode, setMode] = useState<Mode>(existant ? modeDe(existant) : "ferme");
  const [plages, setPlages] = useState<Plage[]>(existant?.plages?.length ? existant.plages : [{ ouverture: "08:00", fermeture: "12:00" }]);
  const { enCours, surSoumission, surChangement, erreurs } = useFormulaire(action, {
    viderApresSucces: !existant,
    apresSucces: () => {
      if (!existant) {
        setMode("ferme");
        setPlages([{ ouverture: "08:00", fermeture: "12:00" }]);
      }
      surFin?.();
    },
  });
  const p = existant ? `exc-${existant.id}` : "exc-nouveau";
  const changerPlage = (i: number, cle: keyof Plage, v: string) => setPlages((l) => l.map((x, k) => (k === i ? { ...x, [cle]: v } : x)));

  return (
    <form onSubmit={surSoumission} onChange={surChangement} className="bo-formulaire" noValidate>
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="plages" value={JSON.stringify(mode === "horaires" ? plages : [])} />
      <div className="bo-grille-2">
        <Champ id={`${p}-date`} libelle="Date" erreur={erreurs.date}>
          <input
            {...attributsChamp(`${p}-date`, erreurs.date)}
            type="date"
            name="date"
            defaultValue={existant?.date}
            className="bo-saisie"
            required
          />
        </Champ>
        <Champ id={`${p}-libelle`} libelle="Raison" aide="Affichée sur le site, ex. « Noël », « Congés d’été »" facultatif>
          <input
            {...attributsChamp(`${p}-libelle`, undefined, true)}
            name="libelle"
            defaultValue={existant?.libelle}
            className="bo-saisie"
            maxLength={120}
          />
        </Champ>
      </div>
      <fieldset className="bo-choix bo-choix-ligne">
        <legend>Ce jour-là, la boutique est…</legend>
        <label>
          <input type="radio" name={`${p}-mode`} checked={mode === "ferme"} onChange={() => setMode("ferme")} />
          <span>Fermée toute la journée</span>
        </label>
        <label>
          <input type="radio" name={`${p}-mode`} checked={mode === "horaires"} onChange={() => setMode("horaires")} />
          <span>Ouverte avec des horaires spéciaux</span>
        </label>
        <label>
          <input type="radio" name={`${p}-mode`} checked={mode === "note"} onChange={() => setMode("note")} />
          <span>
            Ouverte, horaires précisés dans la note
            <small>Ex. « Retrait des commandes avant 17h00 »</small>
          </span>
        </label>
      </fieldset>
      {mode === "horaires" ? (
        <div className="bo-plages">
          {plages.map((pl, i) => (
            <div key={i} className="bo-plage">
              <label htmlFor={`${p}-${i}-o`} className="bo-discret">
                {i === 0 ? "De" : "puis de"}
              </label>
              <input
                id={`${p}-${i}-o`}
                type="time"
                className="bo-saisie"
                value={pl.ouverture}
                onChange={(e) => changerPlage(i, "ouverture", e.target.value)}
              />
              <label htmlFor={`${p}-${i}-f`} className="bo-discret">
                à
              </label>
              <input
                id={`${p}-${i}-f`}
                type="time"
                className="bo-saisie"
                value={pl.fermeture}
                onChange={(e) => changerPlage(i, "fermeture", e.target.value)}
              />
              {i === 1 ? (
                <button type="button" className="bo-bouton bo-bouton-discret bo-bouton-petit" onClick={() => setPlages((l) => [l[0]])}>
                  Retirer
                </button>
              ) : null}
            </div>
          ))}
          {plages.length === 1 ? (
            <div>
              <button
                type="button"
                className="bo-bouton bo-bouton-discret bo-bouton-petit"
                onClick={() => setPlages((l) => [l[0], { ouverture: "15:00", fermeture: "19:00" }])}
              >
                <Icone nom="plus" taille={16} />
                Ajouter l’après-midi
              </button>
            </div>
          ) : null}
          {erreurs.plages ? (
            <p className="bo-erreur" role="alert">
              {erreurs.plages}
            </p>
          ) : null}
        </div>
      ) : null}
      <Champ
        id={`${p}-note`}
        libelle="Note"
        aide="Phrase affichée à côté de la date, ex. « Les commandes sont à récupérer avant 17h00. »"
        erreur={erreurs.note}
        facultatif={mode !== "note"}
      >
        <input {...attributsChamp(`${p}-note`, erreurs.note, true)} name="note" defaultValue={existant?.note} className="bo-saisie" maxLength={240} />
      </Champ>
      <div className="bo-actions-formulaire">
        <button type="submit" className="bo-bouton bo-bouton-principal" disabled={enCours}>
          {enCours ? "Enregistrement…" : existant ? "Enregistrer" : "Ajouter cette date"}
        </button>
        {surFin && existant ? (
          <button type="button" className="bo-bouton bo-bouton-discret" onClick={surFin}>
            Annuler
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function AjoutExceptionnel() {
  return <FormulaireExceptionnel />;
}

function resume(e: Exceptionnel): string {
  if (e.ferme) return "Fermé";
  if (e.plages === null) return e.note || "Ouvert";
  return `Ouvert ${formaterJour(e.plages)}`;
}

function LigneExceptionnel({ e }: { e: Exceptionnel }) {
  const [edition, setEdition] = useState(false);
  const [executer, enCours] = useExecuter();
  const confirmer = useConfirmer();
  return (
    <li className="bo-carte bo-exceptionnel">
      <div className="bo-exceptionnel-ligne">
        <div className="bo-pile" style={{ gap: "0.25rem" }}>
          <span className="bo-date-forte">
            {formaterJourLong(e.date).replace(/^./, (c) => c.toUpperCase())}
            {e.libelle ? <span className="bo-discret"> · {e.libelle}</span> : null}
          </span>
          <span className="bo-menu-infos">
            <Etiquette genre={e.ferme ? "attention" : "succes"}>{resume(e)}</Etiquette>
            {e.note && e.plages !== null ? <span className="bo-discret">{e.note}</span> : null}
          </span>
        </div>
        <div className="bo-actions-formulaire">
          <button
            type="button"
            className="bo-bouton bo-bouton-secondaire bo-bouton-petit"
            aria-expanded={edition}
            onClick={() => setEdition((v) => !v)}
          >
            <Icone nom="crayon" taille={18} />
            Modifier
          </button>
          <button
            type="button"
            className="bo-bouton bo-bouton-danger bo-bouton-petit"
            disabled={enCours}
            onClick={async () => {
              if (
                await confirmer({
                  titre: `Supprimer le ${formaterJourLong(e.date)} ?`,
                  message: "Cette date ne sera plus affichée sur le site.",
                  confirmer: "Supprimer",
                  danger: true,
                })
              )
                executer(() => supprimerHoraireExceptionnelAction(e.id));
            }}
          >
            <Icone nom="poubelle" taille={18} />
            Supprimer
          </button>
        </div>
      </div>
      {edition ? (
        <div className="bo-plat-details">
          <FormulaireExceptionnel existant={e} surFin={() => setEdition(false)} />
        </div>
      ) : null}
    </li>
  );
}

export function ListeExceptionnels({ elements, vide }: { elements: Exceptionnel[]; vide: string }) {
  if (!elements.length) return <p className="bo-discret">{vide}</p>;
  return (
    <ul className="bo-pile" style={{ listStyle: "none", margin: 0, padding: 0, gap: "0.6rem" }}>
      {elements.map((e) => (
        <LigneExceptionnel key={e.id} e={e} />
      ))}
    </ul>
  );
}
