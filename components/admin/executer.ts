"use client";

/**
 * Exécution des Server Actions depuis le backoffice, avec retour visuel.
 *
 * - `useExecuter()` : appels directs (masquer, flèches, supprimer…) ;
 * - `useFormulaire(action)` : formulaires d'édition. La saisie n'est jamais
 *   effacée en cas d'erreur, le premier champ en erreur reçoit le focus et une
 *   notification confirme l'enregistrement (« Prix enregistré »).
 */

import { useCallback, useState, useTransition } from "react";
import type { EtatAction } from "@/lib/formulaire";
import { useNotifier } from "./retours";

const ERREUR_RESEAU = "La connexion a échoué. Vérifiez le réseau puis réessayez.";

/** Redirection Next (fin de session, création suivie d'une redirection) : à laisser passer. */
export function estRedirection(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export type OptionsExecution = { succes?: string; apres?: (r: EtatAction | void) => void };

export function useExecuter() {
  const notifier = useNotifier();
  const [enCours, demarrer] = useTransition();

  const executer = useCallback(
    (fn: () => Promise<EtatAction | void>, opts: OptionsExecution = {}) => {
      demarrer(async () => {
        try {
          const r = await fn();
          if (r && !r.ok) notifier(r.message ?? "L’opération n’a pas abouti.", "erreur");
          else {
            const texte = (r && r.message) || opts.succes;
            if (texte) notifier(texte);
          }
          opts.apres?.(r);
        } catch (err) {
          if (estRedirection(err)) throw err;
          notifier(ERREUR_RESEAU, "erreur");
        }
      });
    },
    [notifier],
  );

  return [executer, enCours] as const;
}

type ActionFormulaire = (prec: EtatAction, fd: FormData) => Promise<EtatAction>;

export function useFormulaire(
  action: ActionFormulaire,
  opts: {
    succes?: string;
    viderApresSucces?: boolean;
    /** Ne pas afficher de notification en cas de succès (l'écran le montre déjà). */
    silencieux?: boolean;
    apresSucces?: (r: EtatAction, formulaire: HTMLFormElement) => void;
  } = {},
) {
  const notifier = useNotifier();
  const [etat, setEtat] = useState<EtatAction>({ ok: false });
  const [enCours, demarrer] = useTransition();

  const surSoumission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formulaire = e.currentTarget;
    const soumetteur = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const fd = new FormData(formulaire, soumetteur && formulaire.contains(soumetteur) ? soumetteur : undefined);
    demarrer(async () => {
      try {
        const r = await action(etat, fd);
        if (!r) return; // redirection prise en charge par Next
        setEtat(r);
        if (r.ok) {
          const texte = r.message || opts.succes;
          if (texte && !opts.silencieux) notifier(texte);
          if (opts.viderApresSucces) formulaire.reset();
          opts.apresSucces?.(r, formulaire);
        } else {
          notifier(r.message ?? "Certains champs sont à corriger.", "erreur");
          requestAnimationFrame(() => formulaire.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
        }
      } catch (err) {
        if (estRedirection(err)) throw err;
        notifier(ERREUR_RESEAU, "erreur");
      }
    });
  };

  /** À poser sur `<form onChange>` : efface l'erreur d'un champ dès qu'on le corrige. */
  const surChangement = (e: React.FormEvent<HTMLFormElement>) => {
    const nom = (e.target as EventTarget & { name?: unknown }).name;
    if (typeof nom === "string" && etat.erreurs?.[nom]) {
      setEtat((s) => {
        const erreurs = { ...(s.erreurs ?? {}) };
        delete erreurs[nom];
        return { ...s, erreurs };
      });
    }
  };

  return { etat, enCours, surSoumission, surChangement, erreurs: etat.erreurs ?? {} };
}
