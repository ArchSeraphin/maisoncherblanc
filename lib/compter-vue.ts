/**
 * Comptage d'une vue côté serveur, à appeler depuis une PAGE publique (jamais
 * depuis le layout, qui s'exécute aussi avant un `notFound()`) :
 *
 *   export default async function Page() {
 *     await compterVue("/carte-traiteur");
 *     ...
 *   }
 *
 * Ne compte que les chargements de document réellement servis : Next 16 masque
 * les en-têtes RSC/prefetch dans `headers()`, on s'appuie donc sur
 * `Sec-Fetch-Dest: document` (ou `Accept: text/html`). Préchargements et robots ignorés.
 */

import "server-only";
import { headers } from "next/headers";
import { enregistrerVue } from "./audience";

const RE_ROBOT =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|whatsapp|telegrambot|preview|lighthouse|headless|monitor|uptime|curl|wget|python-requests|httpclient|axios|node-fetch/i;

export async function compterVue(chemin: string): Promise<void> {
  try {
    const h = await headers();
    const but = `${h.get("sec-purpose") ?? ""} ${h.get("purpose") ?? ""}`.toLowerCase();
    if (but.includes("prefetch") || but.includes("prerender")) return;
    const dest = h.get("sec-fetch-dest");
    if (dest ? dest !== "document" : !(h.get("accept") ?? "").includes("text/html")) return;
    const ua = h.get("user-agent") ?? "";
    if (!ua || RE_ROBOT.test(ua)) return;
    enregistrerVue(chemin);
  } catch (err) {
    // La mesure d'audience ne doit jamais casser une page.
    console.error("[audience] compterVue :", err);
  }
}
