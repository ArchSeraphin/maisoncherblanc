/**
 * Démarrage du serveur (une fois par process Node) : reprise des jobs médias
 * bloqués + worker, puis maintenance récurrente (purges RGPD, médias orphelins).
 * Jamais pendant `next build` (aucune base ne doit être ouverte au build).
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  try {
    const { demarrerWorkerMedias } = await import("./lib/media-pipeline");
    const { demarrerMaintenance } = await import("./lib/maintenance");
    demarrerWorkerMedias();
    demarrerMaintenance();
  } catch (err) {
    console.error("[instrumentation] démarrage des tâches de fond impossible :", err);
  }
}
