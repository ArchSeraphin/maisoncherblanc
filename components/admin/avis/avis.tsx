"use client";

/** Avis clients recopiés à la main (Google ou reçus en direct) : ajout, modification, ordre, masquer, supprimer. */

import { useState } from "react";
import { basculerAvisVisibleAction, creerAvisAction, modifierAvisAction, ordonnerAvisAction, supprimerAvisAction } from "@/lib/actions/avis";
import { formaterJourLong } from "@/lib/dates";
import { attributsChamp, Champ, Etiquette } from "../champs";
import { useExecuter, useFormulaire } from "../executer";
import { Icone } from "../icones";
import { ListeTriable } from "../liste-triable";
import { useConfirmer } from "../retours";

export type AvisEdite = {
  id: number;
  auteur: string;
  texte: string;
  note: number;
  source: "google" | "direct";
  date: string | null;
  visible: boolean;
};

const SOURCES = { google: "Avis Google", direct: "Reçu en direct" } as const;

function etoiles(n: number) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function FormulaireAvis({ existant, surFin }: { existant?: AvisEdite; surFin?: () => void }) {
  const action = existant ? modifierAvisAction.bind(null, existant.id) : creerAvisAction;
  const { enCours, surSoumission, surChangement, erreurs } = useFormulaire(action, { viderApresSucces: !existant, apresSucces: () => surFin?.() });
  const p = existant ? `avis-${existant.id}` : "avis-nouveau";
  return (
    <form onSubmit={surSoumission} onChange={surChangement} className="bo-formulaire" noValidate>
      <div className="bo-grille-2">
        <Champ id={`${p}-auteur`} libelle="Nom de la personne" aide="Comme il apparaît sur l’avis, ex. « Marie D. »" erreur={erreurs.auteur}>
          <input
            {...attributsChamp(`${p}-auteur`, erreurs.auteur, true)}
            name="auteur"
            defaultValue={existant?.auteur}
            className="bo-saisie"
            maxLength={80}
            required
          />
        </Champ>
        <Champ id={`${p}-date`} libelle="Date de l’avis" erreur={erreurs.date} facultatif>
          <input {...attributsChamp(`${p}-date`, erreurs.date)} type="date" name="date" defaultValue={existant?.date ?? ""} className="bo-saisie" />
        </Champ>
      </div>
      <fieldset className="bo-notes" aria-describedby={erreurs.note ? `${p}-note-erreur` : undefined}>
        <legend>Note</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n}>
            <input type="radio" name="note" value={n} defaultChecked={(existant?.note ?? 5) === n} />
            {n} ★<span className="bo-invisible"> sur 5</span>
          </label>
        ))}
        {erreurs.note ? (
          <p id={`${p}-note-erreur`} className="bo-erreur" role="alert" style={{ width: "100%" }}>
            {erreurs.note}
          </p>
        ) : null}
      </fieldset>
      <fieldset className="bo-choix bo-choix-ligne">
        <legend>Provenance</legend>
        {(Object.keys(SOURCES) as (keyof typeof SOURCES)[]).map((s) => (
          <label key={s}>
            <input type="radio" name="source" value={s} defaultChecked={(existant?.source ?? "google") === s} />
            <span>{SOURCES[s]}</span>
          </label>
        ))}
      </fieldset>
      <Champ id={`${p}-texte`} libelle="Texte de l’avis" aide="Recopiez l’avis tel quel, sans le modifier." erreur={erreurs.texte}>
        <textarea
          {...attributsChamp(`${p}-texte`, erreurs.texte, true)}
          name="texte"
          defaultValue={existant?.texte}
          className="bo-saisie"
          rows={4}
          maxLength={1500}
          required
        />
      </Champ>
      {!existant ? (
        <label className="bo-case">
          <input type="checkbox" name="masquer" />
          <span>
            Ne pas l’afficher tout de suite
            <small>Il restera masqué jusqu’à ce que vous l’affichiez.</small>
          </span>
        </label>
      ) : null}
      <div className="bo-actions-formulaire">
        <button type="submit" className="bo-bouton bo-bouton-principal" disabled={enCours}>
          {enCours ? "Enregistrement…" : existant ? "Enregistrer l’avis" : "Ajouter l’avis"}
        </button>
        {existant && surFin ? (
          <button type="button" className="bo-bouton bo-bouton-discret" onClick={surFin}>
            Annuler
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function AjoutAvis() {
  return <FormulaireAvis />;
}

function CarteAvis({ a, controles }: { a: AvisEdite; controles: React.ReactNode }) {
  const [edition, setEdition] = useState(false);
  const [executer, enCours] = useExecuter();
  const confirmer = useConfirmer();
  return (
    <div className="bo-carte bo-avis" data-masquee={a.visible ? undefined : "oui"}>
      <div className="bo-avis-tete">
        <strong>{a.auteur}</strong>
        <span className="bo-etoiles" aria-label={`${a.note} sur 5`}>
          {etoiles(a.note)}
        </span>
        <span className="bo-discret">
          {SOURCES[a.source]}
          {a.date ? `, ${formaterJourLong(a.date)}` : ""}
        </span>
        {!a.visible ? <Etiquette genre="attention">Masqué du site</Etiquette> : null}
      </div>
      <blockquote>{a.texte}</blockquote>
      <div className="bo-plat-pied">
        {controles}
        <div className="bo-plat-boutons">
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
            className="bo-bouton bo-bouton-secondaire bo-bouton-petit"
            disabled={enCours}
            onClick={() => executer(() => basculerAvisVisibleAction(a.id, !a.visible))}
          >
            <Icone nom={a.visible ? "masque" : "oeil"} taille={18} />
            {a.visible ? "Masquer" : "Afficher"}
          </button>
          <button
            type="button"
            className="bo-bouton bo-bouton-danger bo-bouton-petit"
            disabled={enCours}
            onClick={async () => {
              if (
                await confirmer({
                  titre: `Supprimer l’avis de ${a.auteur} ?`,
                  message: "Il sera effacé définitivement.",
                  confirmer: "Supprimer l’avis",
                  danger: true,
                })
              )
                executer(() => supprimerAvisAction(a.id));
            }}
          >
            <Icone nom="poubelle" taille={18} />
            Supprimer
          </button>
        </div>
      </div>
      {edition ? (
        <div className="bo-plat-details">
          <FormulaireAvis existant={a} surFin={() => setEdition(false)} />
        </div>
      ) : null}
    </div>
  );
}

export function ListeAvis({ avis }: { avis: AvisEdite[] }) {
  return (
    <ListeTriable
      elements={avis}
      idDe={(a) => a.id}
      nomDe={(a) => `Avis de ${a.auteur}`}
      surReordonner={ordonnerAvisAction}
      libelle="Avis clients"
      rendu={(a, c) => <CarteAvis a={a} controles={c.controles} />}
    />
  );
}
