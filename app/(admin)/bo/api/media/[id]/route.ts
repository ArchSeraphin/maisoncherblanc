/**
 * Statut d'un média (suivi du traitement dans le BO) :
 * GET /${ADMIN_PATH}/api/media/<id> -> { ok, id, statut: "pending"|"processing"|"ready"|"error", erreur }
 */

import { lireUtilisateur } from "@/lib/auth";
import { statutMedia } from "@/lib/media";
import { relancerWorker } from "@/lib/media-pipeline";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: RouteContext<"/bo/api/media/[id]">) {
  if (!(await lireUtilisateur())) return Response.json({ ok: false, erreur: "Non connecté." }, { status: 401 });
  const { id } = await ctx.params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return Response.json({ ok: false }, { status: 404 });
  const s = statutMedia(n);
  if (!s) return Response.json({ ok: false }, { status: 404 });
  if (s.statut === "pending") relancerWorker();
  return Response.json({ ok: true, ...s }, { headers: { "Cache-Control": "no-store" } });
}
