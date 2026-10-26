/**
 * Nettoyage des fichiers après une action du backoffice (module sans "use server").
 *
 * Un média envoyé depuis le BO (`source` nul) qui ne sert plus nulle part est
 * supprimé avec ses fichiers disque. Les médias importés par le seed (photos
 * réelles, PDF d'origine) restent dans la médiathèque : ils peuvent resservir.
 */

import { lireMedia, supprimerMediaSiOrphelin } from "@/lib/media";

export function nettoyerMedia(mediaId: number | null | undefined): void {
  if (!mediaId) return;
  const m = lireMedia(mediaId);
  if (m && !m.source) supprimerMediaSiOrphelin(m.id);
}
