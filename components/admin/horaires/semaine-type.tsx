"use client";

/**
 * Semaine type : pour chaque jour, ouvert ou fermé, et une ou deux plages
 * (matin, après-midi). Enregistrée d'un bloc (champ caché `horaires` en JSON).
 */

import { useState } from "react";
import { JOURS, LIBELLES_JOURS, type CleJour, type HorairesSemaine, type Plage } from "@/config/site";
import { enregistrerHorairesAction } from "@/lib/actions/horaires";
import { useFormulaire } from "../executer";
import { Icone } from "../icones";

const PLAGE_DEFAUT: Plage = { ouverture: "08:00", fermeture: "12:30" };
const COUPURE_DEFAUT: Plage = { ouverture: "15:00", fermeture: "19:00" };

export function SemaineType({ horaires }: { horaires: HorairesSemaine }) {
  const [semaine, setSemaine] = useState<HorairesSemaine>(horaires);
  const { enCours, surSoumission, erreurs } = useFormulaire(enregistrerHorairesAction);
  const changer = (j: CleJour, plages: Plage[]) => setSemaine((s) => ({ ...s, [j]: plages }));

  return (
    <form onSubmit={surSoumission} className="bo-pile" noValidate>
      <input type="hidden" name="horaires" value={JSON.stringify(semaine)} />
      <div className="bo-jours">
        {JOURS.map((j) => {
          const plages = semaine[j];
          const ouvert = plages.length > 0;
          const erreur = erreurs[j];
          return (
            <fieldset
              key={j}
              className="bo-jour"
              data-ferme={ouvert ? undefined : "oui"}
              style={{ margin: 0 }}
              aria-describedby={erreur ? `erreur-${j}` : undefined}
            >
              <legend className="bo-invisible">{LIBELLES_JOURS[j]}</legend>
              <span className="bo-jour-nom" aria-hidden="true">
                {LIBELLES_JOURS[j]}
              </span>
              <label className="bo-interrupteur">
                <input type="checkbox" checked={ouvert} onChange={(e) => changer(j, e.target.checked ? [PLAGE_DEFAUT] : [])} />
                {ouvert ? "Ouvert" : "Fermé"}
                <span className="bo-invisible"> le {LIBELLES_JOURS[j].toLowerCase()}</span>
              </label>
              <div className="bo-plages">
                {ouvert ? (
                  <>
                    {plages.map((p, i) => (
                      <div key={i} className="bo-plage">
                        <label htmlFor={`${j}-${i}-o`} className="bo-discret">
                          {i === 0 ? "De" : "puis de"}
                        </label>
                        <input
                          id={`${j}-${i}-o`}
                          type="time"
                          className="bo-saisie"
                          value={p.ouverture}
                          aria-invalid={erreur ? true : undefined}
                          onChange={(e) =>
                            changer(
                              j,
                              plages.map((x, k) => (k === i ? { ...x, ouverture: e.target.value } : x)),
                            )
                          }
                        />
                        <label htmlFor={`${j}-${i}-f`} className="bo-discret">
                          à
                        </label>
                        <input
                          id={`${j}-${i}-f`}
                          type="time"
                          className="bo-saisie"
                          value={p.fermeture}
                          aria-invalid={erreur ? true : undefined}
                          onChange={(e) =>
                            changer(
                              j,
                              plages.map((x, k) => (k === i ? { ...x, fermeture: e.target.value } : x)),
                            )
                          }
                        />
                        {i === 1 ? (
                          <button type="button" className="bo-bouton bo-bouton-discret bo-bouton-petit" onClick={() => changer(j, [plages[0]])}>
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
                          onClick={() => changer(j, [plages[0], COUPURE_DEFAUT])}
                        >
                          <Icone nom="plus" taille={16} />
                          Ajouter l’après-midi (fermeture le midi)
                        </button>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <span className="bo-discret">Fermé toute la journée</span>
                )}
                {erreur ? (
                  <p id={`erreur-${j}`} className="bo-erreur" role="alert">
                    {erreur}
                  </p>
                ) : null}
              </div>
            </fieldset>
          );
        })}
      </div>
      <div>
        <button type="submit" className="bo-bouton bo-bouton-principal" disabled={enCours}>
          {enCours ? "Enregistrement…" : "Enregistrer les horaires de la semaine"}
        </button>
      </div>
    </form>
  );
}
