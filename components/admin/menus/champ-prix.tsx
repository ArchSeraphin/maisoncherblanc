"use client";

/**
 * Saisie d'un prix (détail d'un plat, ajout d'un plat, « Changer un prix ») :
 * un montant au clavier numérique (« 3,4 » devient « 3,40 € » à l'enregistrement),
 * ou, case « Prix sur demande » cochée, un texte choisi dans une courte liste
 * (« Sur devis », « Selon arrivage »…). Le serveur refuse tout le reste
 * (lib/prix.ts, `validerPrix`) ; l'erreur s'affiche sous le champ.
 */

import { useId, useState } from "react";
import { AIDE_PRIX, prixSurDemande, PRIX_SUR_DEMANDE } from "@/lib/prix";
import { attributsChamp } from "../champs";

export function ChampPrix({
  id,
  defaut = "",
  erreur,
  className,
  libelle = "Prix",
  libelleInvisible = false,
}: {
  id: string;
  defaut?: string;
  erreur?: string;
  className?: string;
  libelle?: string;
  /** Libellé lu par les lecteurs d'écran seulement (ligne compacte « Changer un prix »). */
  libelleInvisible?: boolean;
}) {
  const texteInitial = prixSurDemande(defaut);
  const [surDemande, setSurDemande] = useState(!!texteInitial);
  const idCase = `${useId()}-sur-demande`;
  return (
    <div className={`bo-champ bo-champ-prix${className ? ` ${className}` : ""}`}>
      <label htmlFor={id} className={libelleInvisible ? "bo-invisible" : undefined}>
        {libelle}
      </label>
      {surDemande ? (
        <select {...attributsChamp(id, erreur)} name="prix" defaultValue={texteInitial ?? PRIX_SUR_DEMANDE[0]} className="bo-saisie">
          {PRIX_SUR_DEMANDE.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...attributsChamp(id, erreur)}
          name="prix"
          defaultValue={texteInitial ? "" : defaut}
          className="bo-saisie"
          inputMode="decimal"
          autoComplete="off"
          placeholder="ex. 12,50"
          title={AIDE_PRIX}
        />
      )}
      <label className="bo-case bo-case-compacte" htmlFor={idCase}>
        <input id={idCase} type="checkbox" checked={surDemande} onChange={(e) => setSurDemande(e.target.checked)} />
        <span>Prix sur demande</span>
      </label>
      {erreur ? (
        <p id={`${id}-erreur`} className="bo-erreur" role="alert">
          {erreur}
        </p>
      ) : null}
    </div>
  );
}
