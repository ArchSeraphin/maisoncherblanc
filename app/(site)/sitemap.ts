import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { articlesPourSitemap } from "@/lib/articles";
import { estNoindex, urlSite } from "@/lib/env";

/**
 * Sitemap dynamique : pages fixes (config) + actualités en ligne (base).
 * Uniquement des URLs publiques : le backoffice n'y figure jamais.
 * Le lot SEO peut l'enrichir (dates de mise à jour des menus...).
 */
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  if (estNoindex()) return [];
  const site = urlSite();
  const fixes = siteConfig.pages.map((p) => ({
    url: `${site}${p.chemin === "/" ? "/" : p.chemin}`,
    changeFrequency: p.frequence,
    priority: p.priorite,
  }));
  const articles = articlesPourSitemap().map((a) => ({
    url: `${site}/actualites/${a.slug}`,
    lastModified: a.updated_at,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));
  return [...fixes, ...articles];
}
