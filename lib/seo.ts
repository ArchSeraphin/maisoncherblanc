/**
 * SEO : metadata par page et builders JSON-LD (schema.org).
 *
 * - `construireMetadata()` : titre (modèle « %s | Maison Cherblanc, Roanne »
 *   posé par le layout racine), description, canonical, Open Graph, Twitter,
 *   `noindex` automatique si NOINDEX=1. À appeler dans `generateMetadata()`
 *   (jamais `export const metadata`, figé au build).
 * - Builders JSON-LD purs (données en paramètre), à sérialiser avec
 *   `<JsonLd donnees={...} />` (components/ui/json-ld.tsx) qui échappe `<`.
 *
 * Aucune donnée inventée : pas de `geo` tant que `siteConfig.geo` est `null`,
 * pas de note ni d'`aggregateRating`.
 */

import type { Metadata } from "next";
import { JOURS, JOURS_SCHEMA_ORG, siteConfig, type HorairesSemaine } from "@/config/site";
import type { ArticleAvecCouverture } from "./articles";
import { compositionEnTexte } from "./composition";
import { estNoindex, urlSite } from "./env";
import type { HoraireExceptionnel } from "./horaires-exceptionnels";
import { texteBrut } from "./markdown";
import { choisirVariante, urlMedia, type ImageMedia } from "./media-url";
import type { MenuComplet } from "./menus";
import { montantSchema } from "./prix";

export type JsonLdDonnees = Record<string, unknown>;

/** URL absolue à partir d'un chemin (ou URL déjà absolue). */
export function urlAbsolue(cheminOuUrl: string): string {
  if (/^https?:\/\//i.test(cheminOuUrl)) return cheminOuUrl;
  return `${urlSite()}${cheminOuUrl.startsWith("/") ? "" : "/"}${cheminOuUrl}`;
}

/** Titre complet tel qu'affiché (modèle appliqué). */
export function titreComplet(titre?: string): string {
  return titre ? siteConfig.modeleTitre.replace("%s", titre) : siteConfig.titreParDefaut;
}

export type ImagePartage = { url: string; width?: number; height?: number; alt?: string };

export type EntreeMetadata = {
  /** Titre court (le modèle ajoute « | Maison Cherblanc, Roanne »). */
  titre?: string;
  /** Titre absolu, sans modèle (accueil). */
  titreAbsolu?: string;
  description?: string;
  /** Chemin canonique, ex. "/carte-traiteur". */
  chemin: string;
  /** Image de partage : image média (ex. `imageEmplacement("og-defaut")`), objet, chemin ou URL. */
  image?: string | ImagePartage | ImageMedia | null;
  noindex?: boolean;
  type?: "website" | "article";
  /** Article : date de publication ISO. */
  publieLe?: string | null;
};

function resoudreImage(image: EntreeMetadata["image"]): ImagePartage {
  const def = siteConfig.imagePartageParDefaut;
  if (!image) return { url: urlAbsolue(def.chemin), width: def.largeur, height: def.hauteur, alt: def.alt };
  if (typeof image === "string") return { url: urlAbsolue(image) };
  if ("variantes" in image) {
    const v = choisirVariante(image, 1600);
    return { url: urlAbsolue(urlMedia(v.chemin)), width: v.largeur, height: v.hauteur, alt: image.alt };
  }
  return { ...image, url: urlAbsolue(image.url) };
}

/** Metadata Next.js d'une page publique. */
export function construireMetadata(e: EntreeMetadata): Metadata {
  const description = e.description ?? siteConfig.description;
  const titreTexte = e.titreAbsolu ?? titreComplet(e.titre);
  const og = resoudreImage(e.image);
  const noindex = e.noindex || estNoindex();
  return {
    title: e.titreAbsolu ? { absolute: e.titreAbsolu } : (e.titre ?? { absolute: siteConfig.titreParDefaut }),
    description,
    alternates: { canonical: e.chemin },
    openGraph: {
      type: e.type ?? "website",
      locale: siteConfig.locale,
      siteName: siteConfig.nom,
      title: titreTexte,
      description,
      url: e.chemin,
      images: [og],
      ...(e.type === "article" && e.publieLe ? { publishedTime: e.publieLe } : {}),
    },
    twitter: { card: "summary_large_image", title: titreTexte, description, images: [og.alt ? { url: og.url, alt: og.alt } : og.url] },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

// ---------------------------------------------------------------------------
// JSON-LD
// ---------------------------------------------------------------------------

/** Sérialisation sûre pour <script type="application/ld+json">. */
export function serialiserJsonLd(d: JsonLdDonnees | JsonLdDonnees[]): string {
  return JSON.stringify(d).replace(/</g, "\\u003c");
}

export const idCommerce = () => `${urlSite()}/#commerce`;
export const idSiteWeb = () => `${urlSite()}/#site`;
export const idCarteTraiteur = () => `${urlSite()}/carte-traiteur#carte`;

function adressePostale(): JsonLdDonnees {
  const a = siteConfig.adresse;
  return {
    "@type": "PostalAddress",
    streetAddress: a.rue,
    postalCode: a.codePostal,
    addressLocality: a.ville,
    addressRegion: a.region,
    addressCountry: a.pays,
  };
}

/** Semaine type -> openingHoursSpecification (jours aux plages identiques regroupés). */
export function specificationHoraires(h: HorairesSemaine): JsonLdDonnees[] {
  const groupes = new Map<string, { jours: string[]; ouverture: string; fermeture: string }>();
  for (const j of JOURS) {
    for (const p of h[j]) {
      const cle = `${p.ouverture}-${p.fermeture}`;
      const g = groupes.get(cle) ?? { jours: [], ouverture: p.ouverture, fermeture: p.fermeture };
      g.jours.push(JOURS_SCHEMA_ORG[j]);
      groupes.set(cle, g);
    }
  }
  return [...groupes.values()].map((g) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: g.jours, opens: g.ouverture, closes: g.fermeture }));
}

/**
 * Horaires exceptionnels -> specialOpeningHoursSpecification. Fermé : opens =
 * closes = "00:00" (convention Google). Horaires précisés seulement en note
 * (`plages = null`) : non publiés (aucune heure inventée).
 */
export function specificationHorairesExceptionnels(liste: HoraireExceptionnel[]): JsonLdDonnees[] {
  const out: JsonLdDonnees[] = [];
  for (const h of liste) {
    if (h.plages === null) continue;
    const plages = h.plages.length ? h.plages : [{ ouverture: "00:00", fermeture: "00:00" }];
    for (const p of plages) {
      out.push({ "@type": "OpeningHoursSpecification", validFrom: h.date, validThrough: h.date, opens: p.ouverture, closes: p.fermeture });
    }
  }
  return out;
}

/** Le commerce (boucherie-charcuterie et traiteur). Horaires lus en base par l'appelant. */
export function commerceJsonLd(e: {
  horaires: HorairesSemaine;
  exceptionnels?: HoraireExceptionnel[];
  images?: (ImageMedia | string)[];
}): JsonLdDonnees {
  const site = urlSite();
  const images = (e.images ?? [])
    .map((i) => (typeof i === "string" ? urlAbsolue(i) : urlAbsolue(urlMedia(choisirVariante(i, 1600).chemin))))
    .filter(Boolean);
  const editeur = siteConfig.legal.editeur;
  const donnees: JsonLdDonnees = {
    "@context": "https://schema.org",
    "@type": ["Store", "FoodEstablishment"],
    "@id": idCommerce(),
    name: siteConfig.nom,
    description: siteConfig.description,
    url: `${site}/`,
    telephone: siteConfig.telephones.boutique.e164,
    email: siteConfig.email,
    image: images.length ? images : [urlAbsolue(siteConfig.imagePartageParDefaut.chemin)],
    logo: urlAbsolue("/icons/icon-512.png"),
    address: adressePostale(),
    areaServed: siteConfig.zone.map((name) => ({ "@type": "Place", name })),
    openingHoursSpecification: specificationHoraires(e.horaires),
    hasMenu: { "@type": "Menu", "@id": idCarteTraiteur(), url: urlAbsolue("/carte-traiteur") },
    hasMap: siteConfig.itineraire,
    sameAs: [siteConfig.reseaux.facebook, siteConfig.reseaux.instagram],
    founder: { "@type": "Person", name: siteConfig.dirigeant },
  };
  if (editeur.denomination) donnees.legalName = editeur.denomination;
  if (editeur.tva) donnees.vatID = editeur.tva;
  const speciaux = specificationHorairesExceptionnels(e.exceptionnels ?? []);
  if (speciaux.length) donnees.specialOpeningHoursSpecification = speciaux;
  if (siteConfig.geo) donnees.geo = { "@type": "GeoCoordinates", latitude: siteConfig.geo.latitude, longitude: siteConfig.geo.longitude };
  return donnees;
}

export function siteWebJsonLd(): JsonLdDonnees {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": idSiteWeb(),
    url: `${urlSite()}/`,
    name: siteConfig.nom,
    inLanguage: "fr-FR",
    publisher: { "@id": idCommerce() },
  };
}

/** Fil d'Ariane. L'accueil est ajouté automatiquement en tête. */
export function filArianeJsonLd(elements: { nom: string; chemin: string }[]): JsonLdDonnees {
  const tous = [{ nom: "Accueil", chemin: "/" }, ...elements.filter((e) => e.chemin !== "/")];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: tous.map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.nom, item: urlAbsolue(e.chemin) })),
  };
}

export function faqJsonLd(questions: { question: string; reponse: string }[]): JsonLdDonnees {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({ "@type": "Question", name: q.question, acceptedAnswer: { "@type": "Answer", text: q.reponse } })),
  };
}

/** Menu schema.org depuis un menu complet (sections visibles). */
export function menuJsonLd(menu: MenuComplet, chemin: string): JsonLdDonnees {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": menu.slug === "carte-traiteur" ? idCarteTraiteur() : `${urlAbsolue(chemin)}#${menu.slug}`,
    name: menu.titre,
    ...(menu.intro ? { description: menu.intro } : {}),
    inLanguage: "fr-FR",
    url: urlAbsolue(chemin),
    hasMenuSection: menu.sections.map((s) => ({
      "@type": "MenuSection",
      name: s.titre,
      ...(s.note ? { description: s.note } : {}),
      hasMenuItem: s.plats.map((p) => {
        const montant = montantSchema(p.prix);
        return {
          "@type": "MenuItem",
          name: p.nom,
          ...(p.description ? { description: compositionEnTexte(p.description) } : {}),
          ...(p.badge === "Végétarien" ? { suitableForDiet: "https://schema.org/VegetarianDiet" } : {}),
          ...(montant ? { offers: { "@type": "Offer", price: montant, priceCurrency: "EUR", ...(p.unite ? { description: p.unite } : {}) } } : {}),
        };
      }),
    })),
  };
}

export function articleJsonLd(a: ArticleAvecCouverture): JsonLdDonnees {
  const chemin = `/actualites/${a.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.titre,
    description: a.description_seo || a.chapo || texteBrut(a.corps, 160),
    url: urlAbsolue(chemin),
    mainEntityOfPage: urlAbsolue(chemin),
    inLanguage: "fr-FR",
    ...(a.publie_le ? { datePublished: a.publie_le } : {}),
    dateModified: a.updated_at,
    ...(a.couverture ? { image: [urlAbsolue(urlMedia(choisirVariante(a.couverture, 1600).chemin))] } : {}),
    author: { "@type": "Organization", name: siteConfig.nom, url: `${urlSite()}/` },
    publisher: { "@id": idCommerce() },
  };
}
