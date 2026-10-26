/**
 * Tâches récurrentes en process (pas de cron externe), au démarrage
 * (instrumentation.ts) puis toutes les 24 h :
 * - messages du formulaire > 12 mois (durée annoncée dans la politique) ;
 * - statistiques de pages vues > 25 mois ;
 * - horaires exceptionnels passés depuis plus de 60 jours ;
 * - médias orphelins (envois du BO jamais rattachés) > 24 h, bruts `tmp/` sans job > 24 h ;
 * - jetons de formulaire expirés.
 */

import { purgerVuesAnciennes } from "./audience";
import { purgerHorairesExceptionnelsPasses } from "./horaires-exceptionnels";
import { purgerJetonsExpires } from "./jeton-formulaire";
import { purgerBrutsOrphelins, purgerMediasOrphelins } from "./media";
import { purgerMessagesAnciens } from "./messages";

const JOUR_MS = 24 * 60 * 60 * 1000;
const etat = globalThis as unknown as { __cherblancMaintenance?: NodeJS.Timeout };

export function lancerMaintenance(): Record<string, number> {
  const r = {
    messages: purgerMessagesAnciens(),
    vues: purgerVuesAnciennes(),
    horaires: purgerHorairesExceptionnelsPasses(),
    medias: purgerMediasOrphelins(JOUR_MS).length,
    bruts: purgerBrutsOrphelins(JOUR_MS),
    jetons: purgerJetonsExpires(),
  };
  if (r.messages || r.vues || r.horaires || r.medias || r.bruts) {
    console.info(
      `[maintenance] purge : ${r.messages} message(s), ${r.vues} ligne(s) de stats, ${r.horaires} horaire(s) passé(s), ${r.medias} média(s) orphelin(s), ${r.bruts} brut(s)`,
    );
  }
  return r;
}

export function demarrerMaintenance(): void {
  if (etat.__cherblancMaintenance) return;
  const tour = () => {
    try {
      lancerMaintenance();
    } catch (err) {
      console.error("[maintenance]", err);
    }
  };
  tour();
  etat.__cherblancMaintenance = setInterval(tour, JOUR_MS);
  etat.__cherblancMaintenance.unref();
}
