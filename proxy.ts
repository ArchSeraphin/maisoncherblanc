/**
 * Proxy Next 16 (ex-middleware.ts : NE PAS recréer de middleware.ts, il serait
 * ignoré silencieusement au build).
 *
 * 1. Ferme la porte de derrière : tout accès DIRECT au segment interne `/bo`
 *    (ou `/__bo`) répond un 404 ordinaire. Next ne ré-exécute pas le proxy sur
 *    sa propre réécriture : tester `pathname` suffit.
 * 2. Réécrit `/${ADMIN_PATH}/*` vers `/bo/*` (lu au runtime : le chemin se
 *    change par l'environnement + redémarrage, sans rebuild) et pose les
 *    en-têtes de protection sur tout le sous-arbre admin (noindex, no-store,
 *    Referrer-Policy same-origin : sans elle, un clic sortant fuiterait l'URL secrète).
 * 3. En-têtes de sécurité (public et BO, jamais `/media/*` qui pose les siens).
 * 4. `NOINDEX=1` : `X-Robots-Tag: noindex, nofollow` sur toutes les réponses.
 * 5. Corps > 2 Mo hors route d'envoi : 413 (filet ; la vraie barrière est server.js).
 *
 * Obscurité != sécurité : chaque page/action/route du BO appelle quand même
 * `requireUser()` / `lireUtilisateur()`.
 */

import { NextResponse, type NextRequest } from "next/server";
import { estNoindex, segmentAdmin } from "@/lib/env";

/** Segments internes fermés en accès direct. */
const SEGMENTS_FERMES = ["/bo", "/__bo", "/%5f%5fbo"];

/** Chemin inexistant : sa réécriture rend la page 404 standard du site. */
const CHEMIN_404 = "/introuvable-404";

/** Même valeur que `serverActions.bodySizeLimit` (next.config.ts) et MAX_CORPS (server.js). */
const CORPS_MAX = 2 * 1024 * 1024;

const PERMISSIONS = "camera=(), microphone=(), geolocation=(), payment=()";

/** CSP minimale sans nonce (Next injecte des scripts en ligne) : seulement les vecteurs inutilisés ici. */
function csp(cadres: "'self'" | "'none'"): string {
  return `object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors ${cadres}`;
}

function hsts(): boolean {
  return process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "0";
}

function sous(chemin: string, prefixe: string): boolean {
  const p = chemin.toLowerCase();
  return p === prefixe || p.startsWith(`${prefixe}/`);
}

function avecEnTetes(res: NextResponse, admin: boolean): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Permissions-Policy", PERMISSIONS);
  if (admin) {
    res.headers.set("Referrer-Policy", "same-origin");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("Content-Security-Policy", csp("'none'"));
  } else {
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    res.headers.set("Content-Security-Policy", csp("'self'"));
  }
  if (hsts()) res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  if (admin || estNoindex()) res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

function introuvable(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = CHEMIN_404;
  url.search = "";
  return avecEnTetes(NextResponse.rewrite(url), false);
}

function tropLourd(req: NextRequest, cheminEnvoi: string | null): boolean {
  if (req.method === "GET" || req.method === "HEAD") return false;
  if (cheminEnvoi && req.nextUrl.pathname === cheminEnvoi) return false;
  return Number(req.headers.get("content-length") ?? 0) > CORPS_MAX;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const segment = segmentAdmin();

  if (tropLourd(req, segment ? `/${segment}/api/upload` : null)) {
    return avecEnTetes(new NextResponse("Requête trop volumineuse.", { status: 413 }), false);
  }

  if (SEGMENTS_FERMES.some((s) => sous(pathname, s))) return introuvable(req);

  if (segment && (pathname === `/${segment}` || pathname.startsWith(`/${segment}/`))) {
    const url = req.nextUrl.clone();
    url.pathname = `/bo${pathname.slice(segment.length + 1)}`;
    const res = avecEnTetes(NextResponse.rewrite(url), true);
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  }

  const res = NextResponse.next();
  // `/media/*` pose ses propres en-têtes (CSP sandbox) : on n'y touche pas.
  if (pathname.startsWith("/media/")) {
    if (estNoindex()) res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }
  return avecEnTetes(res, false);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
