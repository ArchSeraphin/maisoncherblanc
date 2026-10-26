import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { listerArticlesPublies } from "@/lib/articles";
import { chargerEmplacements, EMPLACEMENTS, type CleEmplacement } from "@/lib/emplacements";
import { estNoindex } from "@/lib/env";
import { choisirVariante, urlMedia, type ImageMedia } from "@/lib/media-url";
import { carteTraiteur, menusDeSaisonEnCours } from "@/lib/menus";
import { urlAbsolue, urlCanonique } from "@/lib/seo";

/**
 * Sitemap dynamique (/sitemap.xml) :
 * - pages fixes de `siteConfig.pages` ;
 * - articles en ligne (date de dernière modification réelle) ;
 * - /carte-traiteur et /menus-de-fetes datées par leurs menus (menus de saison
 *   en cours seulement) ; /actualites par son article le plus récent ;
 * - images des pages (emplacements renseignés, vraies photos uniquement : les
 *   visuels provisoires IA ne sont pas proposés à Google Images).
 * Aucune date inventée : une page sans date connue n'a pas de `lastModified`.
 * Uniquement des URLs publiques : le backoffice n'y figure JAMAIS.
 * NOINDEX=1 : sitemap vide.
 */
export const dynamic = "force-dynamic";

function plusRecente(...dates: (string | null | undefined)[]): string | undefined {
  return dates.filter((d): d is string => !!d).sort().at(-1);
}

function urlsImages(images: (ImageMedia | null | undefined)[]): string[] {
  const urls = images.filter((i): i is ImageMedia => !!i && !i.provisoire).map((i) => urlAbsolue(urlMedia(choisirVariante(i, 1600).chemin)));
  return [...new Set(urls)];
}

export default function sitemap(): MetadataRoute.Sitemap {
  if (estNoindex()) return [];

  // Images par page, depuis les emplacements (champ `page` de chaque clé).
  const cles = EMPLACEMENTS.filter((e) => e.page).map((e) => e.cle) as CleEmplacement[];
  const images = chargerEmplacements(cles);
  const imagesParPage = new Map<string, (ImageMedia | null)[]>();
  for (const e of EMPLACEMENTS) {
    if (!e.page) continue;
    imagesParPage.set(e.page, [...(imagesParPage.get(e.page) ?? []), images[e.cle as CleEmplacement]]);
  }

  // Dates réelles connues.
  const carte = carteTraiteur();
  const saison = menusDeSaisonEnCours();
  const articles = listerArticlesPublies({ limite: 200 });
  const dates: Record<string, string | undefined> = {
    "/carte-traiteur": carte?.updated_at,
    "/menus-de-fetes": plusRecente(...saison.map((m) => m.updated_at)),
    "/actualites": plusRecente(...articles.map((a) => a.updated_at)),
  };
  const imagesMenus: Record<string, (ImageMedia | null)[]> = {
    "/carte-traiteur": [carte?.couverture ?? null],
    "/menus-de-fetes": saison.map((m) => m.couverture),
  };

  const fixes: MetadataRoute.Sitemap = siteConfig.pages.map((p) => {
    const imgs = urlsImages([...(imagesParPage.get(p.chemin) ?? []), ...(imagesMenus[p.chemin] ?? [])]);
    const date = dates[p.chemin];
    return {
      url: urlCanonique(p.chemin),
      ...(date ? { lastModified: date } : {}),
      changeFrequency: p.frequence,
      priority: p.priorite,
      ...(imgs.length ? { images: imgs } : {}),
    };
  });

  const pagesArticles: MetadataRoute.Sitemap = articles.map((a) => {
    const imgs = urlsImages([a.couverture]);
    return {
      url: urlCanonique(`/actualites/${a.slug}`),
      lastModified: a.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      ...(imgs.length ? { images: imgs } : {}),
    };
  });

  return [...fixes, ...pagesArticles];
}
