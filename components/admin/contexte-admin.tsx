"use client";

/**
 * Chemin secret du backoffice exposé aux composants CLIENT du BO.
 * Valeur fournie par le layout admin (app/(admin)/bo/layout.tsx), lue au
 * runtime dans l'env : jamais en dur, jamais en NEXT_PUBLIC_*.
 *
 *   const lien = useLienAdmin();
 *   <Link href={lien("/menus")}>Carte & menus</Link>
 *   fetch(lien("/api/upload"), { method: "POST", body })
 */

import { createContext, useCallback, useContext } from "react";

const ContexteCheminAdmin = createContext<string | null>(null);

export function FournisseurCheminAdmin({ base, children }: { base: string; children: React.ReactNode }) {
  return <ContexteCheminAdmin.Provider value={base}>{children}</ContexteCheminAdmin.Provider>;
}

/** "/<secret>" */
export function useCheminAdmin(): string {
  const base = useContext(ContexteCheminAdmin);
  if (!base) throw new Error("useCheminAdmin() doit être utilisé sous le layout admin.");
  return base;
}

/** Fabrique de liens : lien() -> "/<secret>", lien("/menus") -> "/<secret>/menus". */
export function useLienAdmin(): (sous?: string) => string {
  const base = useCheminAdmin();
  return useCallback((sous = "") => (!sous || sous === "/" ? base : `${base}${sous.startsWith("/") ? sous : `/${sous}`}`), [base]);
}
