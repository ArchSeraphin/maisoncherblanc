/**
 * SEO : metadata par page et builders JSON-LD (schema.org).
 *
 * - `construireMetadata()` : title, description, canonical ABSOLU (SITE_URL),
 *   Open Graph, Twitter, robots (`noindex` automatique si NOINDEX=1), locale
 *   fr_FR. Les pages fixes n'ont qu'à passer `chemin` : title et description
 *   exacts viennent de `siteConfig.seo.pages` (docs/COPY.md section 18).
 *   À appeler dans `generateMetadata()` (jamais `export const metadata`, figé au build).
 * - Builders JSON-LD purs (données en paramètre), à sérialiser avec
 *   `<JsonLd donnees={...} />` (components/ui/json-ld.tsx) qui échappe `<`.
 *   Quel builder sur quelle page : docs/FONDATION.md section 14.
 *
 * Type de l'entité commerce : `["Store", "FoodEstablishment"]` + `additionalType`
 * Wikidata (boucherie, charcuterie, traiteur). schema.org n'a ni `ButcherShop`
 * ni `Caterer` ; `Store` (commerce de détail : la boutique) et
 * `FoodEstablishment` (préparation de plats : le traiteur, porteur de `hasMenu`)
 * sont deux sous-types valides de `LocalBusiness`, combinables en JSON-LD.
 *
 * Aucune donnée inventée : pas de note, pas d'`aggregateRating`, pas d'avis,
 * pas de `priceRange` (aucune fourchette fournie par le client), pas de
 * moyens de paiement (question client n° 30).
 */

import type { Metadata } from "next";
import { JOURS, JOURS_SCHEMA_ORG, LIBELLES_JOURS, siteConfig, type CleJour, type HorairesSemaine, type Plage } from "@/config/site";
import type { ArticleAvecCouverture } from "./articles";
import { compositionEnTexte } from "./composition";
import { estNoindex, urlSite } from "./env";
import type { HoraireExceptionnel } from "./horaires-exceptionnels";
import { formaterHeure } from "./horaires";
import { texteBrut } from "./markdown";
import { choisirVariante, urlMedia, type ImageMedia } from "./media-url";
import type { Menu, MenuComplet } from "./menus";
import { montantSchema } from "./prix";

export type JsonLdDonnees = Record<string, unknown>;

const CONTEXTE = "https://schema.org";
const DEMI_CADRATIN = "–";

/** URL absolue à partir d'un chemin (ou URL déjà absolue). */
export function urlAbsolue(cheminOuUrl: string): string {
  if (/^https?:\/\//i.test(cheminOuUrl)) return cheminOuUrl;
  return `${urlSite()}${cheminOuUrl.startsWith("/") ? "" : "/"}${cheminOuUrl}`;
}

/**
 * URL canonique d'un chemin, sans barre finale, accueil compris
 * (« https://maisoncherblanc.fr ») : c'est la forme que Next écrit dans
 * `<link rel="canonical">` ; le sitemap, le fil d'Ariane et le JSON-LD utilisent
 * la même, pour une seule forme d'URL partout.
 */
export function urlCanonique(chemin: string): string {
  const propre = chemin.replace(/\/+$/, "");
  return propre ? urlAbsolue(propre) : urlSite();
}

/** Titre complet tel qu'affiché (modèle appliqué) pour un titre court sans entrée dans `seo.pages`. */
export function titreComplet(titre?: string): string {
  return titre ? siteConfig.modeleTitre.replace("%s", titre) : siteConfig.titreParDefaut;
}

/** Title, description et libellé de fil d'Ariane d'une page fixe (docs/COPY.md section 18), ou `null`. */
export function seoPage(chemin: string): { titre: string; description: string; ariane: string } | null {
  return siteConfig.seo.pages[chemin] ?? null;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export type ImagePartage = { url: string; width?: number; height?: number; alt?: string; type?: string };

export type EntreeMetadata = {
  /** Chemin canonique, ex. "/carte-traiteur". Suffit pour les pages fixes (title et meta de `siteConfig.seo.pages`). */
  chemin: string;
  /** Titre court : le modèle « %s | Maison Cherblanc » est ajouté. */
  titre?: string;
  /** Titre absolu, sans modèle (prioritaire). */
  titreAbsolu?: string;
  description?: string;
  /**
   * Image de partage : image média (ex. `imageEmplacement("traiteur-hero")`),
   * objet, chemin ou URL. Absente : carte générée `/opengraph-image`
   * (qui reprend la photo `og-defaut` si elle est renseignée).
   */
  image?: string | ImagePartage | ImageMedia | null;
  noindex?: boolean;
  type?: "website" | "article";
  /** Article : dates ISO. */
  publieLe?: string | null;
  modifieLe?: string | null;
};

/**
 * Image média -> image de partage. On sert l'ORIGINAL ré-encodé (JPEG ou PNG,
 * lu par tous les réseaux, contrairement au WebP) s'il reste raisonnable,
 * sinon la variante 1600.
 */
export function imagePartageDepuisMedia(image: ImageMedia): ImagePartage {
  const o = image.variantes.original;
  if (o && Math.max(o.largeur, o.hauteur) <= 2400) {
    const type = o.chemin.endsWith(".png") ? "image/png" : "image/jpeg";
    return { url: urlAbsolue(urlMedia(o.chemin)), width: o.largeur, height: o.hauteur, alt: image.alt, type };
  }
  const v = choisirVariante(image, 1600);
  return { url: urlAbsolue(urlMedia(v.chemin)), width: v.largeur, height: v.hauteur, alt: image.alt, type: "image/webp" };
}

function resoudreImage(image: EntreeMetadata["image"]): ImagePartage {
  const def = siteConfig.imagePartageParDefaut;
  if (!image) return { url: urlAbsolue(def.chemin), width: def.largeur, height: def.hauteur, alt: def.alt, type: "image/jpeg" };
  if (typeof image === "string") return { url: urlAbsolue(image) };
  if ("variantes" in image) return imagePartageDepuisMedia(image);
  return { ...image, url: urlAbsolue(image.url) };
}

/** Metadata Next.js d'une page publique. */
export function construireMetadata(e: EntreeMetadata): Metadata {
  const fixe = seoPage(e.chemin);
  const titreTexte = e.titreAbsolu ?? (e.titre ? titreComplet(e.titre) : (fixe?.titre ?? siteConfig.titreParDefaut));
  const description = e.description ?? fixe?.description ?? siteConfig.description;
  const canonique = urlCanonique(e.chemin);
  const og = resoudreImage(e.image);
  const noindex = e.noindex || estNoindex();
  const article = e.type === "article";
  return {
    title: { absolute: titreTexte },
    description,
    alternates: { canonical: canonique },
    openGraph: {
      type: article ? "article" : "website",
      locale: siteConfig.locale,
      siteName: siteConfig.nom,
      title: titreTexte,
      description,
      url: canonique,
      images: [og],
      ...(article && e.publieLe ? { publishedTime: e.publieLe } : {}),
      ...(article && e.modifieLe ? { modifiedTime: e.modifieLe } : {}),
      ...(article ? { authors: [siteConfig.nom] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: titreTexte,
      description,
      images: [og.alt ? { url: og.url, alt: og.alt } : og.url],
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}

/**
 * Title et description de /menus-de-fetes. En saison (au moins un menu),
 * dérivés du menu en base (COPY.md section 9) ; hors saison, `seo.pages`.
 */
export function seoMenusDeFetes(menus: Pick<Menu, "titre" | "slug">[]): { titre: string; description: string } {
  const horsSaison = siteConfig.seo.pages["/menus-de-fetes"];
  const menu = menus[0];
  if (!menu) return { titre: horsSaison.titre, description: horsSaison.description };
  const texte = `${menu.titre} ${menu.slug}`;
  const annee = /\b(20\d\d)\b/.exec(texte)?.[1];
  const fetes = /f[êe]tes|no[ëe]l|fin d.ann[ée]e/i.test(texte);
  if (fetes && annee === "2026") return { ...siteConfig.seo.fetesEnSaison };
  if (fetes && annee) {
    return {
      titre: `Traiteur Noël à Roanne, menus de fêtes ${annee} | Cherblanc`,
      description: `Menus de fêtes ${annee} de Maison Cherblanc, boucherie et traiteur à Roanne : menus, carte des fêtes, prix, dates limites de commande et horaires.`,
    };
  }
  return {
    titre: `${menu.titre} à Roanne | Maison Cherblanc`,
    description: `${menu.titre} de Maison Cherblanc, boucherie et traiteur à Roanne : menu, prix et dates de commande.`,
  };
}

// ---------------------------------------------------------------------------
// JSON-LD : identifiants et briques
// ---------------------------------------------------------------------------

/** Sérialisation sûre pour <script type="application/ld+json"> (`<` échappé : `</script>` impossible). */
export function serialiserJsonLd(d: JsonLdDonnees | JsonLdDonnees[]): string {
  return JSON.stringify(d).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

export const idCommerce = () => `${urlSite()}/#commerce`;
export const idSiteWeb = () => `${urlSite()}/#site`;
export const idCarteTraiteur = () => `${urlSite()}/carte-traiteur#carte`;
export const idLogo = () => `${urlSite()}/#logo`;

/** URL absolue d'une image média (variante WebP 1600 px) ou d'un chemin. */
function urlImage(i: ImageMedia | string): string {
  return typeof i === "string" ? urlAbsolue(i) : urlAbsolue(urlMedia(choisirVariante(i, 1600).chemin));
}

export function adressePostale(): JsonLdDonnees {
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

/** Zone servie : communes (City) et territoires (AdministrativeArea). */
export function zoneServie(): JsonLdDonnees[] {
  return siteConfig.zone.map((nom) =>
    /roannais|loire/i.test(nom) ? { "@type": "AdministrativeArea", name: nom } : { "@type": "City", name: nom },
  );
}

/** Logo (PNG 512 px : Google demande une image matricielle d'au moins 112 px). */
export function logoJsonLd(): JsonLdDonnees {
  const url = urlAbsolue("/icons/icon-512.png");
  return { "@type": "ImageObject", "@id": idLogo(), url, contentUrl: url, width: 512, height: 512, caption: siteConfig.nom };
}

/** Éditeur (Article, Menu...) : bloc autonome, sans dépendre d'un autre JSON-LD de la page. */
export function editeurJsonLd(): JsonLdDonnees {
  return { "@type": "Organization", "@id": idCommerce(), name: siteConfig.nom, url: `${urlSite()}/`, logo: logoJsonLd() };
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
 * (`plages = null`, ex. « commandes à récupérer avant 17h ») : non publiés
 * (aucune heure inventée).
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

// ---------------------------------------------------------------------------
// JSON-LD : entités
// ---------------------------------------------------------------------------

/**
 * Le commerce (boucherie-charcuterie et traiteur). Données lues en base par
 * l'appelant : `commerceJsonLd({ horaires: lireHoraires(), exceptionnels:
 * horairesExceptionnelsAVenir(60), images: [...] })`.
 */
export function commerceJsonLd(e: {
  horaires: HorairesSemaine;
  exceptionnels?: HoraireExceptionnel[];
  images?: (ImageMedia | string | null | undefined)[];
  /** Menus de saison en cours (page /menus-de-fetes), ajoutés à `hasMenu`. Images provisoires (IA) ignorées. */
  menusSaison?: Pick<Menu, "slug" | "titre">[];
  /** Carte traiteur publiée (`!!carteTraiteur()`) ; masquée : pas de `hasMenu` vers /carte-traiteur. */
  carteEnLigne?: boolean;
}): JsonLdDonnees {
  const site = urlSite();
  // Visuels provisoires (IA) exclus : l'entité ne montre que de vraies photos.
  const images = (e.images ?? []).filter((i): i is ImageMedia | string => !!i && (typeof i === "string" || !i.provisoire)).map(urlImage);
  const editeur = siteConfig.legal.editeur;
  const menus: JsonLdDonnees[] =
    e.carteEnLigne === false ? [] : [{ "@type": "Menu", "@id": idCarteTraiteur(), name: "Carte traiteur", url: urlCanonique("/carte-traiteur") }];
  for (const m of e.menusSaison ?? []) menus.push({ "@type": "Menu", "@id": `${urlAbsolue("/menus-de-fetes")}#${m.slug}`, name: m.titre, url: urlCanonique("/menus-de-fetes") });
  const donnees: JsonLdDonnees = {
    "@context": CONTEXTE,
    "@type": ["Store", "FoodEstablishment"],
    "@id": idCommerce(),
    additionalType: [...siteConfig.seo.typesWikidata],
    name: siteConfig.nom,
    description: siteConfig.description,
    slogan: siteConfig.signature,
    url: `${site}/`,
    telephone: siteConfig.telephones.boutique.e164,
    email: siteConfig.email,
    image: images.length ? images : [urlAbsolue(siteConfig.imagePartageParDefaut.chemin)],
    logo: logoJsonLd(),
    address: adressePostale(),
    areaServed: zoneServie(),
    openingHoursSpecification: specificationHoraires(e.horaires),
    ...(menus.length ? { hasMenu: menus.length === 1 ? menus[0] : menus } : {}),
    hasMap: siteConfig.itineraire,
    currenciesAccepted: "EUR",
    knowsLanguage: "fr",
    sameAs: [siteConfig.reseaux.facebook, siteConfig.reseaux.instagram],
  };
  if (editeur.denomination) donnees.legalName = editeur.denomination;
  if (editeur.immatriculation) donnees.foundingDate = editeur.immatriculation;
  if (editeur.tva) donnees.vatID = editeur.tva;
  if (editeur.siret) donnees.identifier = { "@type": "PropertyValue", propertyID: "SIRET", value: editeur.siret.replace(/\s/g, "") };
  const speciaux = specificationHorairesExceptionnels(e.exceptionnels ?? []);
  if (speciaux.length) donnees.specialOpeningHoursSpecification = speciaux;
  if (siteConfig.geo) donnees.geo = { "@type": "GeoCoordinates", latitude: siteConfig.geo.latitude, longitude: siteConfig.geo.longitude };
  return donnees;
}

export function siteWebJsonLd(): JsonLdDonnees {
  return {
    "@context": CONTEXTE,
    "@type": "WebSite",
    "@id": idSiteWeb(),
    url: `${urlSite()}/`,
    name: siteConfig.nom,
    description: siteConfig.descriptionCourte,
    inLanguage: "fr-FR",
    publisher: { "@id": idCommerce() },
  };
}

/**
 * Page web typée (AboutPage pour /la-maison, ContactPage pour /contact,
 * WebPage ailleurs si besoin). Title et description de `seo.pages` par défaut.
 */
export function pageWebJsonLd(e: {
  chemin: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
  nom?: string;
  description?: string;
  image?: ImageMedia | string | null;
}): JsonLdDonnees {
  const fixe = seoPage(e.chemin);
  const url = urlCanonique(e.chemin);
  return {
    "@context": CONTEXTE,
    "@type": e.type ?? "WebPage",
    "@id": `${url}#page`,
    url,
    name: e.nom ?? fixe?.titre ?? siteConfig.titreParDefaut,
    description: e.description ?? fixe?.description ?? siteConfig.description,
    inLanguage: "fr-FR",
    isPartOf: { "@id": idSiteWeb() },
    about: { "@id": idCommerce() },
    ...(e.image ? { primaryImageOfPage: { "@type": "ImageObject", url: urlImage(e.image) } } : {}),
  };
}

/** Fil d'Ariane. L'accueil est ajouté automatiquement en tête. */
export function filArianeJsonLd(elements: { nom: string; chemin: string }[]): JsonLdDonnees {
  const tous = [{ nom: "Accueil", chemin: "/" }, ...elements.filter((e) => e.chemin !== "/")];
  return {
    "@context": CONTEXTE,
    "@type": "BreadcrumbList",
    itemListElement: tous.map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.nom, item: urlCanonique(e.chemin) })),
  };
}

/**
 * Éléments du fil d'Ariane d'un chemin (libellés `seo.pages[...].ariane`) :
 * "/traiteur-roanne/mariage" -> Traiteur à Roanne › Mariage. `dernier` remplace
 * le libellé du dernier élément (ex. titre d'un article). À utiliser pour le fil
 * VISIBLE et pour `filArianeJsonLd(...)`, afin qu'ils restent identiques.
 */
export function elementsFilAriane(chemin: string, dernier?: string): { nom: string; chemin: string }[] {
  const segments = chemin.split("/").filter(Boolean);
  const out: { nom: string; chemin: string }[] = [];
  for (let i = 0; i < segments.length; i++) {
    const c = `/${segments.slice(0, i + 1).join("/")}`;
    const estDernier = i === segments.length - 1;
    const nom = estDernier && dernier ? dernier : seoPage(c)?.ariane;
    if (nom) out.push({ nom, chemin: c });
  }
  return out;
}

export function faqJsonLd(questions: { question: string; reponse: string }[]): JsonLdDonnees {
  return {
    "@context": CONTEXTE,
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({ "@type": "Question", name: q.question, acceptedAnswer: { "@type": "Answer", text: q.reponse } })),
  };
}

/** Menu schema.org depuis un menu complet (sections et plats visibles). */
export function menuJsonLd(menu: MenuComplet, chemin: string): JsonLdDonnees {
  return {
    "@context": CONTEXTE,
    "@type": "Menu",
    "@id": menu.slug === "carte-traiteur" ? idCarteTraiteur() : `${urlAbsolue(chemin)}#${menu.slug}`,
    name: menu.titre,
    ...(menu.intro || menu.sous_titre ? { description: menu.intro || menu.sous_titre } : {}),
    inLanguage: "fr-FR",
    url: urlCanonique(chemin),
    publisher: editeurJsonLd(),
    ...(menu.pdf
      ? { associatedMedia: { "@type": "MediaObject", contentUrl: urlAbsolue(menu.pdf.url), encodingFormat: "application/pdf", name: menu.pdf.nom } }
      : {}),
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

/** Prestations traiteur (une page chacune). Textes tirés de docs/COPY.md (meta et chapôs des pages). */
export const SERVICES_TRAITEUR = {
  "/traiteur-roanne": {
    nom: "Traiteur à Roanne",
    type: "Traiteur",
    description:
      "Plateaux, plats cuisinés, cocktails dînatoires, buffets et repas de mariage préparés par Maison Cherblanc à Roanne. Commande une semaine avant, option service à table, devis gratuit.",
  },
  "/traiteur-roanne/mariage": {
    nom: "Traiteur mariage à Roanne",
    type: "Traiteur mariage",
    description:
      "Vin d’honneur, buffet ou repas servi, plateaux de fromages, pièce montée et macarons pour les mariages à Roanne et dans le Roannais. Option service à table, devis gratuit.",
  },
  "/traiteur-roanne/cocktail-dinatoire": {
    nom: "Cocktail dînatoire et buffets à Roanne",
    type: "Cocktail dînatoire et buffet",
    description:
      "Pièces cocktail à l’unité (mini burgers, wraps, verrines), plateaux de charcuterie, de fromages et de légumes pour vos cocktails dînatoires et buffets à Roanne. Commande une semaine avant.",
  },
  "/traiteur-roanne/broche-barbecue": {
    nom: "Jambon à la broche et barbecue à Roanne",
    type: "Animation culinaire : jambon à la broche et barbecue",
    description:
      "Jambons cuits à la broche sur une rôtissoire installée sur place et côtes de bœuf au barbecue, cuits devant vos invités lors de vos réceptions à Roanne. Devis gratuit.",
  },
} as const satisfies Record<string, { nom: string; type: string; description: string }>;

export type CheminService = keyof typeof SERVICES_TRAITEUR;

/**
 * Prestation traiteur (Service). Sur /traiteur-roanne, passer `sousServices`
 * pour lister les trois sous-prestations (`hasOfferCatalog`).
 */
export function serviceJsonLd(chemin: CheminService, opts: { image?: ImageMedia | string | null; sousServices?: boolean } = {}): JsonLdDonnees {
  const s = SERVICES_TRAITEUR[chemin];
  const url = urlCanonique(chemin);
  const donnees: JsonLdDonnees = {
    "@context": CONTEXTE,
    "@type": "Service",
    "@id": `${url}#service`,
    name: s.nom,
    serviceType: s.type,
    description: s.description,
    url,
    provider: {
      "@type": ["Store", "FoodEstablishment"],
      "@id": idCommerce(),
      name: siteConfig.nom,
      url: `${urlSite()}/`,
      telephone: siteConfig.telephones.boutique.e164,
      address: adressePostale(),
    },
    areaServed: zoneServie(),
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: urlCanonique("/contact"),
      servicePhone: { "@type": "ContactPoint", telephone: siteConfig.telephones.boutique.e164, contactType: "customer service", availableLanguage: "fr" },
    },
    ...(opts.image ? { image: urlImage(opts.image) } : {}),
  };
  if (opts.sousServices) {
    donnees.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: "Prestations traiteur",
      itemListElement: (Object.keys(SERVICES_TRAITEUR) as CheminService[])
        .filter((c) => c !== chemin)
        .map((c) => ({ "@type": "Offer", itemOffered: { "@type": "Service", "@id": `${urlCanonique(c)}#service`, name: SERVICES_TRAITEUR[c].nom, url: urlCanonique(c), provider: { "@id": idCommerce() } } })),
    };
  }
  return donnees;
}

export function articleJsonLd(a: ArticleAvecCouverture): JsonLdDonnees {
  const url = urlCanonique(`/actualites/${a.slug}`);
  return {
    "@context": CONTEXTE,
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: a.titre,
    description: a.description_seo || a.chapo || texteBrut(a.corps, 160),
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "fr-FR",
    ...(a.publie_le ? { datePublished: a.publie_le } : {}),
    dateModified: a.updated_at,
    image: a.couverture ? [urlImage(a.couverture)] : [urlAbsolue(siteConfig.imagePartageParDefaut.chemin)],
    author: { "@type": "Organization", "@id": idCommerce(), name: siteConfig.nom, url: `${urlSite()}/` },
    publisher: editeurJsonLd(),
    isPartOf: { "@id": idSiteWeb() },
  };
}

/** Liste des actualités (/actualites) : CollectionPage + ItemList des articles affichés. */
export function listeArticlesJsonLd(articles: Pick<ArticleAvecCouverture, "slug" | "titre">[]): JsonLdDonnees {
  const url = urlCanonique("/actualites");
  const fixe = seoPage("/actualites");
  return {
    "@context": CONTEXTE,
    "@type": "CollectionPage",
    "@id": `${url}#page`,
    url,
    name: fixe?.titre,
    description: fixe?.description,
    inLanguage: "fr-FR",
    isPartOf: { "@id": idSiteWeb() },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: urlCanonique(`/actualites/${a.slug}`), name: a.titre })),
    },
  };
}

/**
 * Galerie (/realisations) : ImageGallery des photos affichées. Les photos
 * réelles portent le crédit Maison Cherblanc ; un visuel provisoire (IA)
 * n'en porte pas.
 */
export function galerieJsonLd(photos: { image: ImageMedia; legende?: string | null }[], opts: { chemin?: string } = {}): JsonLdDonnees {
  const url = urlCanonique(opts.chemin ?? "/realisations");
  const fixe = seoPage("/realisations");
  return {
    "@context": CONTEXTE,
    "@type": "ImageGallery",
    "@id": `${url}#galerie`,
    url,
    name: fixe?.titre,
    description: fixe?.description,
    inLanguage: "fr-FR",
    isPartOf: { "@id": idSiteWeb() },
    about: { "@id": idCommerce() },
    image: photos.map(({ image, legende }) => {
      const v = choisirVariante(image, 1600);
      return {
        "@type": "ImageObject",
        contentUrl: urlAbsolue(urlMedia(v.chemin)),
        width: v.largeur,
        height: v.hauteur,
        ...(legende ? { caption: legende } : {}),
        ...(image.alt ? { description: image.alt } : {}),
        ...(image.provisoire
          ? {}
          : { creditText: siteConfig.nom, creator: { "@type": "Organization", "@id": idCommerce(), name: siteConfig.nom }, copyrightNotice: `© ${siteConfig.nom}` }),
      };
    }),
  };
}

// ---------------------------------------------------------------------------
// FAQ (docs/COPY.md sections 3 et 4) : le MÊME texte est affiché et balisé
// ---------------------------------------------------------------------------

export type QuestionFaq = { question: string; reponse: string };

function heurePlage(p: Plage): string {
  return `${formaterHeure(p.ouverture)}${DEMI_CADRATIN}${formaterHeure(p.fermeture)}`;
}

function enContinu(plages: Plage[]): boolean {
  return plages.length === 1 && plages[0].ouverture < "12:00" && plages[0].fermeture > "14:00";
}

function listeJours(jours: CleJour[]): string {
  const noms = jours.map((j, i) => (i === 0 ? LIBELLES_JOURS[j] : LIBELLES_JOURS[j].toLowerCase()));
  return noms.length <= 1 ? (noms[0] ?? "") : `${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]}`;
}

/**
 * Horaires en une phrase, jours aux horaires identiques regroupés (même non
 * consécutifs) : « Mardi et vendredi : 7h30–13h et 15h–19h. … Fermé le lundi. »
 */
export function phraseHoraires(h: HorairesSemaine): string {
  const groupes = new Map<string, { jours: CleJour[]; plages: Plage[] }>();
  const fermes: CleJour[] = [];
  for (const j of JOURS) {
    if (h[j].length === 0) {
      fermes.push(j);
      continue;
    }
    const cle = h[j].map(heurePlage).join(" et ");
    const g = groupes.get(cle) ?? { jours: [], plages: h[j] };
    g.jours.push(j);
    groupes.set(cle, g);
  }
  const phrases = [...groupes.entries()].map(([texte, g]) => `${listeJours(g.jours)} : ${texte}${enContinu(g.plages) ? " en continu" : ""}.`);
  if (fermes.length) phrases.push(`Fermé le ${fermes.map((j) => LIBELLES_JOURS[j].toLowerCase()).join(" et le ")}.`);
  return phrases.join(" ");
}

/**
 * Dates limites de commande des fêtes lues dans `infos_commande` du menu de
 * saison (« … avant le dimanche 20 décembre pour Noël, et avant le jeudi
 * 24 décembre pour le jour de l’An. »). Rien n'est supposé : `null` si absent.
 */
export function datesCommandeFetes(menu: Pick<Menu, "titre" | "infos_commande"> | null | undefined): {
  noel: string | null;
  nouvelAn: string | null;
  annee: string | null;
} {
  const texte = menu?.infos_commande ?? "";
  return {
    noel: /avant le ([^,.;]+?) pour Noël/i.exec(texte)?.[1]?.trim() ?? null,
    nouvelAn: /avant le ([^,.;]+?) pour le jour de l[’']An/i.exec(texte)?.[1]?.trim() ?? null,
    annee: /\b(20\d{2})\b/.exec(menu?.titre ?? "")?.[1] ?? null,
  };
}

const minusculeInitiale = (s: string) => (/^[A-ZÀ-Ý][a-zà-ÿ]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);

/** Composition d'un plateau en liste courte (« jambon blanc, jambon cru, rosette »), quantités retirées. */
function compositionCourte(description: string): string {
  return description
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/^[\d½¼¾,.]+\s+(?:tranches?|morceaux?|pièces?)\s+(?:de |d’|d')/i, ""))
    .filter(Boolean)
    .map(minusculeInitiale)
    .join(", ");
}

/** Plat de la carte retrouvé par son nom exact (insensible à la casse). */
function platCarte(carte: MenuComplet | null | undefined, nom: string) {
  const cible = nom.toLocaleLowerCase("fr");
  for (const s of carte?.sections ?? []) for (const p of s.plats) if (p.nom.toLocaleLowerCase("fr") === cible && p.prix) return p;
  return null;
}

const uniteLongue = (u: string) => (u === "par pers." ? "par personne" : u);

/**
 * FAQ de /boucherie-roanne (COPY.md section 3, réponses par défaut des points
 * [À VALIDER]). Horaires et dates de commande des fêtes lus en base : `saison`
 * = menu de saison en cours (`menusDeSaisonEnCours()[0]`), repli neutre hors saison.
 */
export function faqBoucherie(horaires: HorairesSemaine, saison?: Pick<Menu, "titre" | "infos_commande"> | null): QuestionFaq[] {
  const tel = siteConfig.telephones.boutique.affichage;
  const dimanche = horaires.dimanche;
  const reponseDimanche = dimanche.length
    ? `Oui, le dimanche${dimanche[dimanche.length - 1].fermeture <= "13:00" ? " matin" : ""} ${dimanche.map((p) => `de ${formaterHeure(p.ouverture)} à ${formaterHeure(p.fermeture)}`).join(" et ")}.`
    : "Non, la boutique est fermée le dimanche.";
  const fetes = datesCommandeFetes(saison);
  const dateVolailles = fetes.noel
    ? ` Pour Noël${fetes.annee ? ` ${fetes.annee}` : ""}, la date limite de commande est le ${fetes.noel}.`
    : " Les dates limites de commande sont publiées chaque année sur la page des menus de fêtes.";
  return [
    {
      question: "Quels sont les horaires de la boucherie Maison Cherblanc à Roanne ?",
      reponse: `${phraseHoraires(horaires)} Les horaires changent pendant les fêtes de fin d’année : ils sont publiés sur la page des menus de fêtes.`,
    },
    { question: "Êtes-vous ouverts le dimanche ?", reponse: reponseDimanche },
    {
      question: "Peut-on commander sa viande à l’avance ?",
      reponse: `Oui. Appelez la boutique au ${tel}, passez au comptoir, ou écrivez-nous depuis la page contact en précisant les pièces, les quantités et le jour de retrait. C’est conseillé pour une grosse pièce, une découpe particulière ou une grande quantité.`,
    },
    {
      question: "Faut-il commander les volailles de Noël ?",
      reponse: `Oui. Les volailles de fête (dinde, poularde, chapon, poulet de Bresse, pintade, canard ou canette, caille) sont vendues uniquement sur commande.${dateVolailles}`,
    },
    {
      question: "D’où vient votre viande ?",
      reponse: "L’origine des viandes est indiquée en boutique. Demandez-nous, nous vous dirons d’où vient chaque pièce.",
    },
    {
      question: "Faites-vous aussi traiteur ?",
      reponse:
        "Oui. Maison Cherblanc est aussi traiteur : plateaux, plats cuisinés, cocktails, buffets et repas de mariage, avec une option service à table. La carte et les prix sont en ligne sur la page carte traiteur.",
    },
    { question: "Livrez-vous à domicile ?", reponse: "Les commandes de la boucherie se retirent en boutique." },
  ];
}

/**
 * Prix repères des plateaux et de la formule du chef, lus sur la carte traiteur
 * en base : « Sur la carte 2027 : 6 € par personne pour le plateau de
 * charcuterie (jambon blanc, …), 4,90 € pour le plateau de fromages (…), 4 €
 * pour le plateau de légumes crus avec sa sauce. La formule du chef est à 14 €
 * par personne. » `null` si la carte est masquée ou sans ces plats.
 * Partagé par la FAQ traiteur et /llms.txt.
 */
export function phrasePrixPlateaux(carte: MenuComplet | null | undefined): string | null {
  const anneeCarte = /\b(20\d{2})\b/.exec(carte?.titre ?? "")?.[1] ?? null;
  const charcuterie = platCarte(carte, "Plateau de charcuterie");
  const fromages = platCarte(carte, "Plateau de fromages");
  const legumes = platCarte(carte, "Plateau de légumes crus");
  const formule = platCarte(carte, "La formule du chef");
  const morceaux = [
    charcuterie && `${charcuterie.prix} ${uniteLongue(charcuterie.unite)} pour le plateau de charcuterie${charcuterie.description ? ` (${compositionCourte(charcuterie.description)})` : ""}`,
    fromages && `${fromages.prix}${fromages.unite === charcuterie?.unite ? "" : ` ${uniteLongue(fromages.unite)}`} pour le plateau de fromages${fromages.description ? ` (${compositionCourte(fromages.description)})` : ""}`,
    legumes && `${legumes.prix}${legumes.unite === charcuterie?.unite ? "" : ` ${uniteLongue(legumes.unite)}`} pour le plateau de légumes crus avec sa sauce`,
  ].filter((m): m is string => !!m);
  return morceaux.length
    ? `Sur la carte${anneeCarte ? ` ${anneeCarte}` : ""} : ${morceaux.length > 1 ? `${morceaux.slice(0, -1).join(", ")}, ${morceaux[morceaux.length - 1]}` : morceaux[0]}.${formule ? ` La formule du chef est à ${formule.prix} ${uniteLongue(formule.unite)}.`.replace(/ \./, ".") : ""}`
    : null;
}

/**
 * FAQ de /traiteur-roanne (COPY.md section 4, réponses par défaut des points
 * [À VALIDER]). Prix lus sur la carte traiteur en base (`carteTraiteur()`),
 * dates de commande des fêtes sur le menu de saison en cours ; replis neutres
 * si la carte est masquée ou hors saison.
 */
export function faqTraiteur(carte?: MenuComplet | null, saison?: Pick<Menu, "titre" | "infos_commande"> | null): QuestionFaq[] {
  const t = siteConfig.telephones;
  const fetes = datesCommandeFetes(saison);
  const datesFetes =
    fetes.noel && fetes.nouvelAn
      ? ` : pour ${fetes.annee ?? "cette année"}, le ${fetes.noel} pour Noël et le ${fetes.nouvelAn} pour le jour de l’An`
      : fetes.noel
        ? ` : pour ${fetes.annee ?? "cette année"}, le ${fetes.noel} pour Noël`
        : "";

  const reponsePrix =
    phrasePrixPlateaux(carte) ?? "Les plateaux sont vendus à la personne : tous les prix sont sur la page carte traiteur, ou sur demande à la boutique."

  return [
    {
      question: "Combien de temps à l’avance faut-il commander ?",
      reponse: `Une semaine avant la date, au minimum. Pour un mariage, une grande réception ou une date de fin d’année, contactez-nous dès que la date est fixée. Pour les fêtes, les dates limites sont publiées sur la page menus de fêtes${datesFetes}.`,
    },
    {
      question: "Proposez-vous le service à table ?",
      reponse:
        "Oui. L’option service à table est disponible pour vos réceptions. Elle est chiffrée dans le devis, selon le nombre d’invités et la durée du service.",
    },
    {
      question: "Le devis est-il gratuit ?",
      reponse: `Oui, le devis est gratuit. Écrivez-nous depuis la page contact ou appelez le ${t.boutique.affichage} ou le ${t.mobile.affichage}.`,
    },
    { question: "Combien coûte un plateau par personne ?", reponse: reponsePrix },
    {
      question: "Livrez-vous ?",
      reponse: `Les commandes se retirent à la boutique, ${siteConfig.adresse.rue} à ${siteConfig.adresse.ville}. Pour une réception avec service à table, l’équipe vient sur le lieu de l’événement.`,
    },
    {
      question: "Avez-vous des options végétariennes ?",
      reponse:
        "Oui : le petit dînatoire compte un toast de saison vegan, le plateau de légumes crus et le plateau de fromages conviennent aux végétariens. Pour d’autres régimes, dites-le-nous à la demande de devis.",
    },
    {
      question: "Faites-vous les commandes de fêtes ?",
      reponse:
        "Oui. Chaque année, nous publions un menu de fêtes avec entrées, plats cuisinés, accompagnements, volailles sur commande et petit dînatoire de Noël, ainsi que les horaires d’ouverture exceptionnels.",
    },
  ];
}
