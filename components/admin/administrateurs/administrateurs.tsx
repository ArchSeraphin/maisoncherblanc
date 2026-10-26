"use client";

/** Comptes d'accès : ajout, suppression (ni soi-même ni le dernier), son profil, son mot de passe. */

import { useState } from "react";
import {
  changerSonMotDePasseAction,
  creerAdminAction,
  modifierSonProfilAction,
  reinitialiserMotDePasseAction,
  supprimerAdminAction,
} from "@/lib/actions/admins";
import { attributsChamp, Champ, Etiquette } from "../champs";
import { useExecuter, useFormulaire } from "../executer";
import { Icone } from "../icones";
import { useConfirmer } from "../retours";

export type AdminListe = { id: number; email: string; name: string; creeLe: string; moi: boolean };

const AIDE_MDP = "12 caractères au moins. Astuce : une petite phrase facile à retenir, ex. « Jambon-persillé-du-dimanche ».";

function ChampMotDePasse({
  id,
  nom,
  libelle,
  erreur,
  aide,
  autoComplete,
}: {
  id: string;
  nom: string;
  libelle: string;
  erreur?: string;
  aide?: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <Champ id={id} libelle={libelle} aide={aide} erreur={erreur}>
      <div className="bo-mot-de-passe">
        <input
          {...attributsChamp(id, erreur, !!aide)}
          type={visible ? "text" : "password"}
          name={nom}
          className="bo-saisie"
          autoComplete={autoComplete}
          required
          minLength={nom === "actuel" || nom === "mon_mot_de_passe" ? undefined : 12}
        />
        <button
          type="button"
          className="bo-bouton-icone"
          style={{ width: 48, height: 48 }}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          <Icone nom={visible ? "masque" : "oeil"} />
        </button>
      </div>
    </Champ>
  );
}

export function ListeAdmins({ admins }: { admins: AdminListe[] }) {
  const [executer, enCours] = useExecuter();
  const confirmer = useConfirmer();
  const [reinit, setReinit] = useState<number | null>(null);
  const seul = admins.length <= 1;
  return (
    <table className="bo-tableau bo-tableau-cartes">
      <thead>
        <tr>
          <th scope="col">Nom</th>
          <th scope="col">Adresse e-mail</th>
          <th scope="col">Créé le</th>
          <th scope="col">
            <span className="bo-invisible">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {admins.map((a) => (
          <tr key={a.id}>
            <td data-libelle="Nom">
              <strong>{a.name || "Sans nom"}</strong> {a.moi ? <Etiquette genre="succes">Vous</Etiquette> : null}
            </td>
            <td data-libelle="Adresse e-mail" style={{ overflowWrap: "anywhere" }}>
              {a.email}
            </td>
            <td data-libelle="Créé le">{a.creeLe}</td>
            <td>
              {a.moi ? (
                <span className="bo-discret">Modifiez votre compte ci-dessous.</span>
              ) : (
                <div className="bo-pile" style={{ gap: "0.5rem" }}>
                  <div className="bo-actions-formulaire">
                    <button
                      type="button"
                      className="bo-bouton bo-bouton-secondaire bo-bouton-petit"
                      aria-expanded={reinit === a.id}
                      onClick={() => setReinit(reinit === a.id ? null : a.id)}
                    >
                      <Icone nom="cle" taille={18} />
                      Nouveau mot de passe
                    </button>
                    <button
                      type="button"
                      className="bo-bouton bo-bouton-danger bo-bouton-petit"
                      disabled={enCours || seul}
                      onClick={async () => {
                        if (
                          await confirmer({
                            titre: `Supprimer le compte de ${a.name || a.email} ?`,
                            message: "Cette personne ne pourra plus se connecter. Elle sera déconnectée immédiatement.",
                            confirmer: "Supprimer le compte",
                            danger: true,
                          })
                        )
                          executer(() => supprimerAdminAction(a.id));
                      }}
                    >
                      <Icone nom="poubelle" taille={18} />
                      Supprimer
                    </button>
                  </div>
                  {reinit === a.id ? <Reinitialiser id={a.id} fermer={() => setReinit(null)} /> : null}
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Ré-authentification : votre propre mot de passe, exigé pour créer un compte ou changer celui d'un autre. */
function ConfirmerAvecMonMotDePasse({ id, erreur }: { id: string; erreur?: string }) {
  return (
    <ChampMotDePasse
      id={id}
      nom="mon_mot_de_passe"
      libelle="Votre mot de passe, pour confirmer"
      aide="Par sécurité : celui que vous utilisez pour vous connecter."
      erreur={erreur}
      autoComplete="current-password"
    />
  );
}

function Reinitialiser({ id, fermer }: { id: number; fermer: () => void }) {
  const { enCours, surSoumission, surChangement, erreurs } = useFormulaire(reinitialiserMotDePasseAction.bind(null, id), { apresSucces: fermer });
  return (
    <form onSubmit={surSoumission} onChange={surChangement} className="bo-plat-details" noValidate>
      <ChampMotDePasse
        id={`reinit-${id}`}
        nom="nouveau"
        libelle="Nouveau mot de passe"
        aide={`${AIDE_MDP} Communiquez-le à la personne de vive voix.`}
        erreur={erreurs.nouveau}
        autoComplete="new-password"
      />
      <ConfirmerAvecMonMotDePasse id={`reinit-${id}-moi`} erreur={erreurs.mon_mot_de_passe} />
      <div>
        <button type="submit" className="bo-bouton bo-bouton-principal bo-bouton-petit" disabled={enCours}>
          Enregistrer le mot de passe
        </button>
      </div>
    </form>
  );
}

export function AjoutAdmin() {
  const { enCours, surSoumission, surChangement, erreurs } = useFormulaire(creerAdminAction, { viderApresSucces: true });
  return (
    <form onSubmit={surSoumission} onChange={surChangement} className="bo-formulaire" noValidate>
      <div className="bo-grille-2">
        <Champ id="nouvel-admin-nom" libelle="Prénom et nom" facultatif>
          <input id="nouvel-admin-nom" name="name" className="bo-saisie" autoComplete="off" maxLength={80} />
        </Champ>
        <Champ id="nouvel-admin-email" libelle="Adresse e-mail" erreur={erreurs.email}>
          <input
            {...attributsChamp("nouvel-admin-email", erreurs.email)}
            type="email"
            name="email"
            className="bo-saisie"
            autoComplete="off"
            required
          />
        </Champ>
      </div>
      <ChampMotDePasse
        id="nouvel-admin-mdp"
        nom="mot_de_passe"
        libelle="Mot de passe du nouveau compte"
        aide={AIDE_MDP}
        erreur={erreurs.mot_de_passe}
        autoComplete="new-password"
      />
      <ConfirmerAvecMonMotDePasse id="nouvel-admin-moi" erreur={erreurs.mon_mot_de_passe} />
      <div>
        <button type="submit" className="bo-bouton bo-bouton-principal" disabled={enCours}>
          <Icone nom="plus" taille={18} />
          {enCours ? "Création…" : "Créer le compte"}
        </button>
      </div>
    </form>
  );
}

export function MonProfil({ nom, email }: { nom: string; email: string }) {
  const { enCours, surSoumission, surChangement, erreurs } = useFormulaire(modifierSonProfilAction);
  return (
    <form onSubmit={surSoumission} onChange={surChangement} className="bo-formulaire" noValidate>
      <div className="bo-grille-2">
        <Champ id="profil-nom" libelle="Prénom et nom">
          <input id="profil-nom" name="name" defaultValue={nom} className="bo-saisie" autoComplete="name" maxLength={80} />
        </Champ>
        <Champ id="profil-email" libelle="Adresse e-mail (pour se connecter)" erreur={erreurs.email}>
          <input
            {...attributsChamp("profil-email", erreurs.email)}
            type="email"
            name="email"
            defaultValue={email}
            className="bo-saisie"
            autoComplete="email"
            required
          />
        </Champ>
      </div>
      <div>
        <button type="submit" className="bo-bouton bo-bouton-secondaire" disabled={enCours}>
          Enregistrer mon profil
        </button>
      </div>
    </form>
  );
}

export function MonMotDePasse() {
  const { enCours, surSoumission, surChangement, erreurs } = useFormulaire(changerSonMotDePasseAction, { viderApresSucces: true });
  return (
    <form onSubmit={surSoumission} onChange={surChangement} className="bo-formulaire" noValidate>
      <input type="text" name="username" autoComplete="username" hidden readOnly />
      <ChampMotDePasse id="mdp-actuel" nom="actuel" libelle="Mot de passe actuel" erreur={erreurs.actuel} autoComplete="current-password" />
      <div className="bo-grille-2">
        <ChampMotDePasse
          id="mdp-nouveau"
          nom="nouveau"
          libelle="Nouveau mot de passe"
          aide={AIDE_MDP}
          erreur={erreurs.nouveau}
          autoComplete="new-password"
        />
        <ChampMotDePasse
          id="mdp-confirmation"
          nom="confirmation"
          libelle="Nouveau mot de passe, encore une fois"
          erreur={erreurs.confirmation}
          autoComplete="new-password"
        />
      </div>
      <div>
        <button type="submit" className="bo-bouton bo-bouton-principal" disabled={enCours}>
          {enCours ? "Changement…" : "Changer mon mot de passe"}
        </button>
      </div>
    </form>
  );
}
