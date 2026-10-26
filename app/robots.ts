import type { MetadataRoute } from "next";
import { estNoindex, urlSite } from "@/lib/env";

/**
 * robots.txt
 *
 * - Ne mentionne JAMAIS le backoffice (un Disallow publierait le chemin
 *   secret) : son noindex passe par l'en-tête X-Robots-Tag du proxy.
 * - NOINDEX=1 (préproduction) : tout est interdit, aucun sitemap annoncé.
 * - Production : tout est ouvert, robots des moteurs IA compris (GPTBot,
 *   OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended...),
 *   pour que le commerce puisse être cité par ChatGPT, Perplexity, Gemini et
 *   les AI Overviews (docs/COPY.md 1.5). Aucune règle spécifique : la règle
 *   `*` s'applique à tous. Présentation pour les IA : /llms.txt.
 */
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  if (estNoindex()) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return { rules: [{ userAgent: "*", allow: "/" }], sitemap: `${urlSite()}/sitemap.xml` };
}
