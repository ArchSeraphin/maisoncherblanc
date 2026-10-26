/** Helpers HTTP des Route Handlers du backoffice. */

/**
 * Origine de la requête identique à l'hôte servi (anti-CSRF des Route Handlers
 * POST du BO, en plus du cookie SameSite=Lax). Les Server Actions ont leur
 * propre contrôle d'origine intégré à Next.
 */
export function memeOrigine(req: Request): boolean {
  const origine = req.headers.get("origin");
  if (!origine) return false;
  const hote = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origine).host === hote;
  } catch {
    return false;
  }
}
