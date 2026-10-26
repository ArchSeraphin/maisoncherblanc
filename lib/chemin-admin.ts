/**
 * Chemin public du backoffice, construit depuis l'env `ADMIN_PATH` (runtime).
 *
 * SEULE source des liens et redirections du backoffice côté serveur. Côté
 * client, le layout admin expose la même valeur par contexte
 * (`components/admin/contexte-admin.tsx`, hook `useLienAdmin()`).
 * Jamais de `"/admin"` ni de `"/bo"` en dur, jamais de `NEXT_PUBLIC_ADMIN_PATH`.
 */

import "server-only";
import { notFound } from "next/navigation";
import { segmentAdmin } from "./env";

/** `"/" + ADMIN_PATH` ; 404 si ADMIN_PATH n'est pas configuré. */
export function cheminAdmin(): string {
  const s = segmentAdmin();
  if (!s) notFound();
  return `/${s}`;
}

/** lienAdmin() -> "/<secret>", lienAdmin("/menus") -> "/<secret>/menus". */
export function lienAdmin(sous = ""): string {
  const base = cheminAdmin();
  if (!sous || sous === "/") return base;
  return `${base}${sous.startsWith("/") ? sous : `/${sous}`}`;
}
