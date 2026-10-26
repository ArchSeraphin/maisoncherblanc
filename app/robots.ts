import type { MetadataRoute } from "next";
import { estNoindex, urlSite } from "@/lib/env";

/**
 * robots.txt : ne mentionne JAMAIS le backoffice (un Disallow publierait le
 * chemin secret). Le noindex du BO passe par l'en-tête X-Robots-Tag du proxy.
 * NOINDEX=1 (préproduction) : tout est interdit.
 */
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  if (estNoindex()) return { rules: [{ userAgent: "*", disallow: "/" }] };
  const site = urlSite();
  return { rules: [{ userAgent: "*", allow: "/" }], sitemap: `${site}/sitemap.xml`, host: site };
}
