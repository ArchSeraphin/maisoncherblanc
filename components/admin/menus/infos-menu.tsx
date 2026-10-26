"use client";

/** Informations d'un menu : titre, textes, dates de validité et de publication, affichage. */

import { useState } from "react";
import { modifierMenuAction } from "@/lib/actions/menus";
import { attributsChamp, Champ } from "../champs";
import { useFormulaire } from "../executer";

export type InfosMenuEditees = {
  id: number;
  type: "permanent" | "saison";
  titre: string;
  sous_titre: string;
  intro: string;
  note_bas: string;
  infos_commande: string;
  valable_du: string | null;
  valable_au: string | null;
  publie_du: string | null;
  publie_au: string | null;
  visible: boolean;
  estCarte: boolean;
};

export function InfosMenu({ menu: m }: { menu: InfosMenuEditees }) {
  const [type, setType] = useState(m.type);
  const { enCours, surSoumission, surChangement, erreurs } = useFormulaire(modifierMenuAction.bind(null, m.id));
  const a = (id: string, aide = false) => attributsChamp(id, erreurs[id], aide);
  return (
    <form onSubmit={surSoumission} onChange={surChangement} className="bo-formulaire" noValidate>
      <div className="bo-grille-2">
        <Champ id="titre" libelle="Titre" erreur={erreurs.titre}>
          <input {...a("titre")} name="titre" defaultValue={m.titre} className="bo-saisie" required />
        </Champ>
        <Champ id="sous_titre" libelle="Sous-titre" facultatif>
          <input {...a("sous_titre")} name="sous_titre" defaultValue={m.sous_titre} className="bo-saisie" />
        </Champ>
      </div>

      {m.estCarte ? (
        <input type="hidden" name="type" value="permanent" />
      ) : (
        <fieldset className="bo-choix bo-choix-ligne">
          <legend>Type de menu</legend>
          <label>
            <input type="radio" name="type" value="saison" checked={type === "saison"} onChange={() => setType("saison")} />
            <span>
              Menu de saison
              <small>Affiché sur la page Menus de fêtes pendant ses dates.</small>
            </span>
          </label>
          <label>
            <input type="radio" name="type" value="permanent" checked={type === "permanent"} onChange={() => setType("permanent")} />
            <span>
              Carte permanente
              <small>Peut remplacer la carte traiteur du site.</small>
            </span>
          </label>
        </fieldset>
      )}

      {type === "saison" ? (
        <fieldset className="bo-groupe">
          <legend>Dates d’affichage sur le site</legend>
          <p className="bo-aide" style={{ marginTop: "-0.3rem" }}>
            Le menu apparaît seul le premier jour et disparaît seul après le dernier. Laissez vide pour « dès maintenant » ou « sans fin ».
          </p>
          <div className="bo-grille-2">
            <Champ id="publie_du" libelle="Afficher à partir du" erreur={erreurs.publie_du} facultatif>
              <input {...a("publie_du")} type="date" name="publie_du" defaultValue={m.publie_du ?? ""} className="bo-saisie" />
            </Champ>
            <Champ id="publie_au" libelle="Jusqu’au (inclus)" erreur={erreurs.publie_au} facultatif>
              <input {...a("publie_au")} type="date" name="publie_au" defaultValue={m.publie_au ?? ""} className="bo-saisie" />
            </Champ>
          </div>
        </fieldset>
      ) : (
        <>
          <input type="hidden" name="publie_du" value={m.publie_du ?? ""} />
          <input type="hidden" name="publie_au" value={m.publie_au ?? ""} />
        </>
      )}

      <fieldset className="bo-groupe">
        <legend>Période de validité des prix</legend>
        <p className="bo-aide" style={{ marginTop: "-0.3rem" }}>
          Affichée sur le site, par exemple « Carte valable du 1er janvier au 31 décembre 2027 ».
        </p>
        <div className="bo-grille-2">
          <Champ id="valable_du" libelle="Valable du" erreur={erreurs.valable_du} facultatif>
            <input {...a("valable_du")} type="date" name="valable_du" defaultValue={m.valable_du ?? ""} className="bo-saisie" />
          </Champ>
          <Champ id="valable_au" libelle="Au" erreur={erreurs.valable_au} facultatif>
            <input {...a("valable_au")} type="date" name="valable_au" defaultValue={m.valable_au ?? ""} className="bo-saisie" />
          </Champ>
        </div>
      </fieldset>

      <Champ id="intro" libelle="Texte d’introduction" aide="Quelques lignes en haut du menu." facultatif>
        <textarea {...a("intro", true)} name="intro" defaultValue={m.intro} className="bo-saisie" rows={3} />
      </Champ>
      <Champ
        id="infos_commande"
        libelle="Informations de commande"
        aide="Ex. « Commandes jusqu’au 20 décembre, retrait le 24 avant 17h00 »."
        facultatif
      >
        <textarea {...a("infos_commande", true)} name="infos_commande" defaultValue={m.infos_commande} className="bo-saisie" rows={3} />
      </Champ>
      <Champ id="note_bas" libelle="Note en bas du menu" aide="Ex. allergènes, conditions." facultatif>
        <textarea {...a("note_bas", true)} name="note_bas" defaultValue={m.note_bas} className="bo-saisie" rows={2} />
      </Champ>

      <label className="bo-case">
        <input type="checkbox" name="visible" defaultChecked={m.visible} />
        <span>
          Afficher ce menu sur le site
          <small>
            {type === "saison"
              ? "Pendant ses dates d’affichage."
              : m.estCarte
                ? "C’est la carte traiteur du site."
                : "Une carte permanente s’affiche seulement si elle est la carte du site."}
          </small>
        </span>
      </label>

      <div>
        <button type="submit" className="bo-bouton bo-bouton-principal" disabled={enCours}>
          {enCours ? "Enregistrement…" : "Enregistrer les informations"}
        </button>
      </div>
    </form>
  );
}
