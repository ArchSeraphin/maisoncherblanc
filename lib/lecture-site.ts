/**
 * Lectures complémentaires pour les pages publiques (lot A), sans écriture ni
 * changement de schéma : tout passe par les modules existants.
 */

import "server-only";
import { chargerEmplacements, EMPLACEMENTS } from "./emplacements";
import { listerRealisationsPubliques } from "./realisations";

/** Vrai si les notifications e-mail du formulaire passent par Brevo (clé configurée). */
export function notificationEmailActive(): boolean {
  return Boolean(process.env.BREVO_API_KEY?.trim());
}

/**
 * Vrai si au moins un visuel provisoire (illustration générée, à remplacer)
 * est publié sur le site : emplacements des pages ou galerie.
 */
export function visuelsProvisoiresPublies(): boolean {
  const images = chargerEmplacements(EMPLACEMENTS.map((e) => e.cle));
  if (Object.values(images).some((i) => i?.provisoire)) return true;
  return listerRealisationsPubliques().some((r) => r.image.provisoire);
}
