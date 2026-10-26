/** Réordonnancement (module PUR, importable côté client). */

/** Échange `id` avec son voisin dans une liste ordonnée (flèches haut/bas). */
export function echangerDansListe(ids: number[], id: number, sens: "haut" | "bas"): number[] {
  const i = ids.indexOf(id);
  const j = sens === "haut" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return ids;
  const copie = [...ids];
  [copie[i], copie[j]] = [copie[j], copie[i]];
  return copie;
}
