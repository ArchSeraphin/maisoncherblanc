"use client";

/**
 * Dupliquer un menu pour l'année suivante (carte 2027 vers 2028, menu de fêtes
 * 2026 vers 2027) : la copie garde sections, plats et prix, sans PDF ni dates,
 * et reste masquée tant qu'elle n'est pas relue. On arrive ensuite dessus.
 */

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { dupliquerMenuAction } from "@/lib/actions/menus";
import { attributsChamp, Champ } from "../champs";
import { useLienAdmin } from "../contexte-admin";
import { useFormulaire } from "../executer";
import { Icone } from "../icones";
import { titreCopie } from "./etat-menu";

export function DupliquerMenu({ menuId, titre, petit = false }: { menuId: number; titre: string; petit?: boolean }) {
  const dialogue = useRef<HTMLDialogElement>(null);
  const lien = useLienAdmin();
  const router = useRouter();
  const { enCours, surSoumission, erreurs } = useFormulaire(dupliquerMenuAction.bind(null, menuId), {
    apresSucces: (r) => {
      dialogue.current?.close();
      if (r.id) router.push(lien(`/menus/${r.id}`));
    },
  });
  const id = `copie-${menuId}`;
  return (
    <>
      <button
        type="button"
        className={`bo-bouton bo-bouton-secondaire${petit ? " bo-bouton-petit" : ""}`}
        onClick={() => dialogue.current?.showModal()}
      >
        <Icone nom="copie" taille={18} />
        Dupliquer
      </button>
      <dialog ref={dialogue} className="bo-dialogue" aria-labelledby={`${id}-titre`}>
        <form onSubmit={surSoumission} className="bo-pile" noValidate>
          <h2 id={`${id}-titre`} className="bo-sous-titre">
            Dupliquer « {titre} »
          </h2>
          <p className="bo-discret">
            Tous les plats et les prix sont copiés. La copie reste <strong>masquée du site</strong> : vous pourrez changer les prix et les dates
            tranquillement, puis l’afficher.
          </p>
          <Champ id={id} libelle="Titre du nouveau menu" erreur={erreurs.titre}>
            <input {...attributsChamp(id, erreurs.titre)} name="titre" defaultValue={titreCopie(titre)} className="bo-saisie" required />
          </Champ>
          <div className="bo-dialogue-actions">
            <button type="button" className="bo-bouton bo-bouton-secondaire" onClick={() => dialogue.current?.close()}>
              Annuler
            </button>
            <button type="submit" className="bo-bouton bo-bouton-principal" disabled={enCours}>
              {enCours ? "Copie en cours…" : "Créer la copie"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
