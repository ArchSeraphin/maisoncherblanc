"use client";

/** Création d'un menu (titre + type), puis ouverture de son édition. */

import { useRouter } from "next/navigation";
import { creerMenuAction } from "@/lib/actions/menus";
import { attributsChamp, Champ } from "../champs";
import { useLienAdmin } from "../contexte-admin";
import { useFormulaire } from "../executer";
import { Icone } from "../icones";

export function NouveauMenu() {
  const lien = useLienAdmin();
  const router = useRouter();
  const { enCours, surSoumission, surChangement, erreurs } = useFormulaire(creerMenuAction, {
    apresSucces: (r) => r.id && router.push(lien(`/menus/${r.id}`)),
  });
  return (
    <details className="bo-replie">
      <summary>
        <Icone nom="plus" />
        Créer un nouveau menu
      </summary>
      <div className="bo-replie-corps">
        <form onSubmit={surSoumission} onChange={surChangement} className="bo-formulaire" noValidate>
          <p className="bo-discret">
            Pour reprendre un menu existant (par exemple le menu de fêtes de l’an dernier), utilisez plutôt le bouton « Dupliquer » de ce menu.
          </p>
          <Champ id="nouveau-titre" libelle="Titre du menu" aide="Exemple : Menu de Pâques 2027" erreur={erreurs.titre}>
            <input {...attributsChamp("nouveau-titre", erreurs.titre, true)} name="titre" className="bo-saisie" required />
          </Champ>
          <fieldset className="bo-choix bo-choix-ligne">
            <legend>Type de menu</legend>
            <label>
              <input type="radio" name="type" value="saison" defaultChecked />
              <span>
                Menu de saison
                <small>Fêtes, Pâques… affiché sur la page Menus de fêtes, pendant les dates choisies.</small>
              </span>
            </label>
            <label>
              <input type="radio" name="type" value="permanent" />
              <span>
                Carte permanente
                <small>Une nouvelle carte traiteur, à mettre en ligne quand elle est prête.</small>
              </span>
            </label>
          </fieldset>
          <div>
            <button type="submit" className="bo-bouton bo-bouton-principal" disabled={enCours}>
              {enCours ? "Création…" : "Créer le menu"}
            </button>
          </div>
        </form>
      </div>
    </details>
  );
}
