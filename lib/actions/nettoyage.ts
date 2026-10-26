/**
 * Nettoyage des fichiers après une action du backoffice (module sans "use server").
 *
 * Délègue à la règle unique de lib/media.ts : un média envoyé depuis le BO
 * (`source` nul) qui ne sert plus nulle part est supprimé avec ses fichiers ;
 * un média importé par le seed reste dans la médiathèque.
 */

import { supprimerMediaSiOrphelinHorsSeed } from "@/lib/media";

export function nettoyerMedia(mediaId: number | null | undefined): void {
  supprimerMediaSiOrphelinHorsSeed(mediaId);
}
