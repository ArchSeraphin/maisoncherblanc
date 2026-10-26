"use client";

import { useActionState } from "react";
import { etatInitial, type EtatAction } from "@/lib/formulaire";

type Props = { action: (etat: EtatAction, fd: FormData) => Promise<EtatAction> };

/** Formulaire de connexion (fonctionne aussi sans JavaScript). */
export function FormulaireConnexion({ action }: Props) {
  const [etat, envoyer, enCours] = useActionState(action, etatInitial);
  return (
    <form action={envoyer} className="bo-pile" noValidate>
      <div className="bo-champ">
        <label htmlFor="email">Adresse e-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required defaultValue={etat.valeurs?.email} className="bo-saisie" />
      </div>
      <div className="bo-champ">
        <label htmlFor="mot_de_passe">Mot de passe</label>
        <input id="mot_de_passe" name="mot_de_passe" type="password" autoComplete="current-password" required className="bo-saisie" />
      </div>
      {etat.message ? (
        <p role="alert" className="bo-alerte bo-alerte-erreur">
          {etat.message}
        </p>
      ) : null}
      <button type="submit" disabled={enCours} className="bo-bouton bo-bouton-principal bo-bouton-large">
        {enCours ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
