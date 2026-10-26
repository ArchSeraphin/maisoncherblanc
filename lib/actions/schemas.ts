/**
 * Schémas zod des paramètres LIÉS des Server Actions du backoffice
 * (`action.bind(null, id)`, appels directs depuis un composant client).
 *
 * Les arguments liés transitent par le navigateur : ils sont revalidés ici
 * avant tout accès à la base. Les champs de formulaire passent par
 * lib/formulaire.ts puis par les validateurs métier de lib/<entité>.ts.
 * Module sans "use server" (il n'exporte pas d'action).
 */

import { z } from "zod";

export const schemaId = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
export const schemaSens = z.enum(["haut", "bas"]);
export const schemaBooleen = z.boolean();
export const schemaIds = z.array(schemaId).max(2000);

/** IDs valides (sinon `null`) : `ids(menuId, platId)`. */
export function idsValides(...valeurs: unknown[]): number[] | null {
  const r = z.array(schemaId).safeParse(valeurs);
  return r.success ? r.data : null;
}

/** Liste d'IDs pour un réordonnancement (sinon `null`). */
export function listeIds(v: unknown): number[] | null {
  const r = schemaIds.safeParse(v);
  return r.success ? r.data : null;
}

export function sens(v: unknown): "haut" | "bas" | null {
  const r = schemaSens.safeParse(v);
  return r.success ? r.data : null;
}

export function booleen(v: unknown): boolean | null {
  const r = schemaBooleen.safeParse(v);
  return r.success ? r.data : null;
}
