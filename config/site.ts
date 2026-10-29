/**
 * Source de vérité unique des informations factuelles de Maison Cherblanc.
 *
 * Toute coordonnée, tout lien externe, tout texte légal se modifie ICI et se
 * propage partout (en-tête, pied de page, pages, JSON-LD, manifeste). Module
 * PUR (aucun accès à la base, aucun module Node) : importable depuis un
 * composant client.
 *
 * Règle projet : aucune information inventée. Les champs légaux non fournis
 * restent `null` (avec un TODO) et doivent être complétés avant la mise en
 * ligne ; les pages n'affichent jamais un champ `null`.
 */

export type CleJour = "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche";

/** Plage horaire au format 24 h "HH:MM". */
export type Plage = { ouverture: string; fermeture: string };

/** Horaires de la semaine type : tableau vide = fermé ce jour-là. */
export type HorairesSemaine = Record<CleJour, Plage[]>;

export const JOURS: readonly CleJour[] = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"] as const;

export const LIBELLES_JOURS: Record<CleJour, string> = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
  samedi: "Samedi",
  dimanche: "Dimanche",
};

/** Correspondance schema.org (DayOfWeek). */
export const JOURS_SCHEMA_ORG: Record<CleJour, string> = {
  lundi: "https://schema.org/Monday",
  mardi: "https://schema.org/Tuesday",
  mercredi: "https://schema.org/Wednesday",
  jeudi: "https://schema.org/Thursday",
  vendredi: "https://schema.org/Friday",
  samedi: "https://schema.org/Saturday",
  dimanche: "https://schema.org/Sunday",
};

export type LienNavigation = { href: string; libelle: string; enfants?: readonly LienNavigation[] };

export const siteConfig = {
  nom: "Maison Cherblanc",
  activite: "Boucherie, charcuterie, traiteur",
  /** Mention courte sous le nom (logo, pied de page). */
  signature: "Boucherie · Charcuterie · Traiteur",
  /** « charcuterie maison » non confirmé (COPY.md question n° 3) : ne pas l'écrire avant réponse du client. */
  description:
    "Maison Cherblanc, boucherie, charcuterie et traiteur au 55 rue Mulsant à Roanne : viandes, volailles, charcuterie, plats cuisinés, plateaux, cocktails et buffets pour vos réceptions.",
  descriptionCourte: "Boucherie, charcuterie et traiteur à Roanne",
  locale: "fr_FR",
  langue: "fr",

  /**
   * Titres (metadata). Les pages fixes ont un title COMPLET dans `seo.pages`
   * (docs/COPY.md section 18, suffixes variables pour tenir sous 60 caractères) ;
   * le modèle ne sert qu'aux titres sans entrée (repli).
   */
  modeleTitre: "%s | Maison Cherblanc",
  titreParDefaut: "Boucherie, charcuterie, traiteur à Roanne | Maison Cherblanc",

  /** URL publique par défaut (surchargée au runtime par l'env SITE_URL). */
  urlParDefaut: "https://maisoncherblanc.fr",

  /** Gérants (orthographe du registre du commerce). */
  dirigeant: "Thibaut Cherblanc",
  gerants: ["Thibaut Cherblanc", "Emilie Viallon"],

  adresse: {
    rue: "55 rue Mulsant",
    codePostal: "42300",
    ville: "Roanne",
    departement: "Loire",
    region: "Auvergne-Rhône-Alpes",
    pays: "FR",
    nomPays: "France",
  },

  /**
   * Coordonnées GPS du 55 rue Mulsant (Base Adresse Nationale, API
   * api-adresse.data.gouv.fr, précision « numéro de rue », score 0,97,
   * identifiant 42187_2100_00055, interrogée le 26/10/2026).
   */
  geo: { latitude: 46.038577, longitude: 4.057986 } as { latitude: number; longitude: number } | null,

  telephones: {
    boutique: { affichage: "04 77 71 16 11", e164: "+33477711611", href: "tel:+33477711611" },
    mobile: { affichage: "06 22 22 49 68", e164: "+33622224968", href: "tel:+33622224968" },
  },
  email: "contact@maisoncherblanc.fr",

  /** Lien itinéraire (aucune iframe Google Maps sur le site). */
  itineraire: "https://www.google.com/maps/search/?api=1&query=55%20rue%20Mulsant%2042300%20Roanne",

  reseaux: {
    facebook: "https://www.facebook.com/profile.php?id=100094509101001",
    instagram: "https://www.instagram.com/maisoncherblanc/",
  },

  /** Faits du traiteur (carte 2027 imprimée). */
  traiteur: {
    delaiCommande: "Merci de passer commande une semaine avant.",
    serviceATable: "Option service à table disponible.",
    devis: "Devis gratuit.",
  },

  /**
   * Zone servie (mots clés secondaires du contrat et docs/COPY.md 1.3 : communes
   * voisines de la boutique, aucune promesse de livraison ni de zone d'intervention).
   * Utilisée par le JSON-LD (`areaServed`) ; ne pas afficher en liste de communes.
   */
  zone: ["Roanne", "Riorges", "Mably", "Le Coteau", "Villerest", "Roannais", "Loire (42)"],

  /**
   * Horaires par défaut (carte 2027), recopiés en base par le seed puis
   * éditables depuis le backoffice (réglage `horaires`).
   */
  horairesParDefaut: {
    lundi: [],
    mardi: [
      { ouverture: "07:30", fermeture: "13:00" },
      { ouverture: "15:00", fermeture: "19:00" },
    ],
    mercredi: [{ ouverture: "07:30", fermeture: "13:00" }],
    jeudi: [{ ouverture: "07:30", fermeture: "13:00" }],
    vendredi: [
      { ouverture: "07:30", fermeture: "13:00" },
      { ouverture: "15:00", fermeture: "19:00" },
    ],
    samedi: [{ ouverture: "07:30", fermeture: "18:00" }],
    dimanche: [{ ouverture: "08:00", fermeture: "12:00" }],
  } satisfies HorairesSemaine as HorairesSemaine,

  /**
   * Mentions légales (LCEN). Source : BODACC et API recherche-entreprises
   * (octobre 2026). Tant qu'un champ est `null`, les pages ne l'affichent pas.
   */
  legal: {
    editeur: {
      denomination: "MAISON CHERBLANC" as string | null,
      nomCommercial: "Maison Cherblanc",
      formeJuridique: "Société à responsabilité limitée (SARL)" as string | null,
      capital: "5 000 €" as string | null,
      rcs: "RCS Roanne 977 639 780" as string | null,
      siren: "977 639 780" as string | null,
      siret: "977 639 780 00013" as string | null,
      tva: "FR95977639780" as string | null,
      codeNaf: "10.11Z" as string | null,
      immatriculation: "2023-07-20" as string | null,
      gerants: ["Thibaut Cherblanc", "Emilie Viallon"] as readonly string[],
      directeurPublication: null as string | null, // TODO : à confirmer par le client
      adresse: "55 rue Mulsant, 42300 Roanne",
      telephone: "04 77 71 16 11",
      email: "contact@maisoncherblanc.fr",
    },
    /** TODO : VPS Coolify de l'agence, coordonnées de l'hébergeur à confirmer. */
    hebergeur: {
      nom: null as string | null,
      adresse: null as string | null,
      telephone: null as string | null,
      pays: null as string | null,
    },
    /** docs/COPY.md section 17. */
    creditsPhotos: "Photographies : Maison Cherblanc." as string | null,
    /** À afficher après les crédits tant qu'un visuel `provisoire` (IA) est publié (docs/COPY.md section 17). */
    mentionVisuelsProvisoires:
      "Certains visuels d’illustration provisoires ont été générés par intelligence artificielle et seront remplacés par des photographies de la maison.",
    /** docs/COPY.md section 17 (« Conception et réalisation »). */
    conception: "Agence Voilà Voilà",
    /** TODO client (question n° 27) : nom, adresse et site du médiateur de la consommation. */
    mediateur: null as { nom: string; adresse: string; site: string } | null,
  },

  /** Données personnelles (politique de confidentialité). Durées appliquées par la maintenance. */
  confidentialite: {
    conservationMessagesMois: 12,
    conservationStatistiquesMois: 25,
    /** Sous-traitant des notifications e-mail (lib/mail.ts), seulement si BREVO_API_KEY est défini. */
    prestataireEmail: { nom: "Brevo", societe: "BREVO SAS", ville: "Paris" },
    /** Mesure d'audience soumise au consentement, seulement si GA_MEASUREMENT_ID est défini. */
    prestataireMesure: { nom: "Google Analytics", societe: "Google Ireland Limited", adresse: "Gordon House, Barrow Street, Dublin 4, Irlande" },
    /** Durée de conservation réglée dans Google Analytics (Administration > Conservation des données). */
    conservationAnalyticsMois: 14,
  },

  /** Navigation principale (en-tête). Le backoffice n'y figure jamais. */
  navigation: [
    { href: "/boucherie-roanne", libelle: "La boucherie" },
    {
      href: "/traiteur-roanne",
      libelle: "Le traiteur",
      enfants: [
        { href: "/traiteur-roanne", libelle: "Toutes les prestations" },
        { href: "/traiteur-roanne/mariage", libelle: "Mariage" },
        { href: "/traiteur-roanne/cocktail-dinatoire", libelle: "Cocktail dînatoire" },
        { href: "/traiteur-roanne/broche-barbecue", libelle: "Broche et barbecue" },
      ],
    },
    { href: "/carte-traiteur", libelle: "Carte & tarifs" },
    { href: "/menus-de-fetes", libelle: "Menus de fêtes" },
    { href: "/realisations", libelle: "Réalisations" },
    { href: "/la-maison", libelle: "La maison" },
    { href: "/actualites", libelle: "Actualités" },
  ] satisfies readonly LienNavigation[] as readonly LienNavigation[],

  /** Appel à l'action principal de l'en-tête. */
  appelAction: { href: "/contact", libelle: "Demander un devis" },

  /** Pages publiques fixes (sitemap). Les articles s'y ajoutent depuis la base. */
  pages: [
    { chemin: "/", libelle: "Accueil", priorite: 1.0, frequence: "weekly" },
    { chemin: "/boucherie-roanne", libelle: "La boucherie", priorite: 0.9, frequence: "monthly" },
    { chemin: "/traiteur-roanne", libelle: "Le traiteur", priorite: 0.9, frequence: "monthly" },
    { chemin: "/traiteur-roanne/mariage", libelle: "Traiteur mariage", priorite: 0.8, frequence: "monthly" },
    { chemin: "/traiteur-roanne/cocktail-dinatoire", libelle: "Cocktail dînatoire", priorite: 0.8, frequence: "monthly" },
    { chemin: "/traiteur-roanne/broche-barbecue", libelle: "Broche et barbecue", priorite: 0.8, frequence: "monthly" },
    { chemin: "/carte-traiteur", libelle: "Carte traiteur", priorite: 0.9, frequence: "monthly" },
    { chemin: "/menus-de-fetes", libelle: "Menus de fêtes", priorite: 0.8, frequence: "weekly" },
    { chemin: "/realisations", libelle: "Réalisations", priorite: 0.6, frequence: "monthly" },
    { chemin: "/la-maison", libelle: "La maison", priorite: 0.6, frequence: "yearly" },
    { chemin: "/actualites", libelle: "Actualités", priorite: 0.6, frequence: "weekly" },
    { chemin: "/contact", libelle: "Contact", priorite: 0.8, frequence: "yearly" },
    { chemin: "/mentions-legales", libelle: "Mentions légales", priorite: 0.2, frequence: "yearly" },
    { chemin: "/politique-de-confidentialite", libelle: "Politique de confidentialité", priorite: 0.2, frequence: "yearly" },
  ] as const,

  /**
   * Image de partage par défaut : carte 1200 x 630 générée par
   * app/opengraph-image.tsx (fond olive, monogramme ; photo de l'emplacement
   * `og-defaut` en volet gauche si elle est renseignée).
   */
  imagePartageParDefaut: {
    chemin: "/opengraph-image",
    largeur: 1200,
    hauteur: 630,
    alt: "Maison Cherblanc, boucherie, charcuterie et traiteur au 55 rue Mulsant à Roanne",
  },

  /**
   * SEO des pages fixes (docs/COPY.md section 18, textes exacts, longueurs
   * vérifiées). `titre` est ABSOLU (aucun modèle ajouté). `ariane` = libellé
   * du fil d'Ariane (« Accueil › Traiteur à Roanne › Mariage »).
   * `construireMetadata({ chemin })` les applique d'office (lib/seo.ts).
   */
  seo: {
    pages: {
      "/": {
        titre: "Boucherie, charcuterie, traiteur à Roanne | Maison Cherblanc",
        description:
          "Maison Cherblanc, 55 rue Mulsant à Roanne : boucherie, charcuterie et traiteur. Viandes, volailles, plateaux, buffets et mariages. Devis gratuit.",
        ariane: "Accueil",
      },
      "/boucherie-roanne": {
        titre: "Boucherie à Roanne, rue Mulsant | Maison Cherblanc",
        description:
          "Boucherie-charcuterie à Roanne, 55 rue Mulsant : bœuf, veau, porc, volailles et charcuterie. Ouvert du mardi au dimanche matin. Conseils au comptoir.",
        ariane: "Boucherie à Roanne",
      },
      "/traiteur-roanne": {
        titre: "Traiteur à Roanne : buffets, cocktails, mariages | Cherblanc",
        description:
          "Traiteur à Roanne : plateaux, plats cuisinés, cocktails dînatoires, buffets et mariages. Carte et prix en ligne, service à table en option, devis gratuit.",
        ariane: "Traiteur à Roanne",
      },
      "/traiteur-roanne/mariage": {
        titre: "Traiteur mariage à Roanne | Maison Cherblanc",
        description:
          "Traiteur mariage à Roanne et dans le Roannais : vin d’honneur, buffet ou repas servi, fromages, pièce montée et macarons. Service à table, devis gratuit.",
        ariane: "Mariage",
      },
      "/traiteur-roanne/cocktail-dinatoire": {
        titre: "Cocktail dînatoire à Roanne, buffets | Maison Cherblanc",
        description:
          "Cocktail dînatoire et buffets à Roanne : mini burgers, wraps, verrines, plateaux de charcuterie et de fromages. Prix à la pièce, commande 1 semaine avant.",
        ariane: "Cocktail dînatoire",
      },
      "/traiteur-roanne/broche-barbecue": {
        titre: "Jambon à la broche et barbecue à Roanne | Maison Cherblanc",
        description:
          "Jambon à la broche et côtes de bœuf au barbecue pour vos réceptions à Roanne : rôtissoire installée sur place, cuisson devant vos invités. Devis gratuit.",
        ariane: "Broche et barbecue",
      },
      "/carte-traiteur": {
        titre: "Carte traiteur à Roanne, prix 2027 | Maison Cherblanc",
        description:
          "Carte traiteur 2027 de Maison Cherblanc à Roanne : plateaux par personne, formule du chef à 14 €, plats cuisinés à la part, petit dînatoire. PDF en ligne.",
        ariane: "Carte traiteur",
      },
      /** Hors saison. En saison : `seo.fetesEnSaison` (titre du menu en base). */
      "/menus-de-fetes": {
        titre: "Menus de fêtes à Roanne | Maison Cherblanc",
        description:
          "Menus de fêtes de Maison Cherblanc, boucherie et traiteur à Roanne : Noël, jour de l’An et autres saisons. Les prochains menus sont publiés ici.",
        ariane: "Menus de fêtes",
      },
      "/realisations": {
        titre: "Réalisations traiteur à Roanne, en photos | Maison Cherblanc",
        description:
          "Mariages, cocktails, buffets, plateaux et jambons à la broche : quelques réceptions préparées par Maison Cherblanc, traiteur et boucherie à Roanne.",
        ariane: "Réalisations",
      },
      "/la-maison": {
        titre: "La maison : boucherie et traiteur rue Mulsant | Cherblanc",
        description:
          "Maison Cherblanc, boucherie, charcuterie et traiteur au 55 rue Mulsant à Roanne depuis 2023 : qui nous sommes, comment nous travaillons, l’équipe.",
        ariane: "La maison",
      },
      "/actualites": {
        titre: "Actualités et conseils | Maison Cherblanc, Roanne",
        description:
          "Actualités de Maison Cherblanc, boucherie et traiteur à Roanne : commandes de fêtes, conseils de cuisson, quantités pour vos réceptions, nouveautés.",
        ariane: "Actualités",
      },
      "/contact": {
        titre: "Contact, horaires et devis traiteur à Roanne | Cherblanc",
        description:
          "Maison Cherblanc, 55 rue Mulsant, 42300 Roanne. Tél. 04 77 71 16 11. Horaires de la boucherie, demande de devis traiteur gratuit et commandes en ligne.",
        ariane: "Contact",
      },
      "/mentions-legales": {
        titre: "Mentions légales | Maison Cherblanc, Roanne",
        description:
          "Mentions légales du site de Maison Cherblanc, boucherie, charcuterie et traiteur à Roanne : éditeur, directeur de la publication, hébergeur, crédits.",
        ariane: "Mentions légales",
      },
      "/politique-de-confidentialite": {
        titre: "Politique de confidentialité | Maison Cherblanc, Roanne",
        description:
          "Comment Maison Cherblanc, boucherie et traiteur à Roanne, traite vos données : formulaire de contact, mesure d’audience sans cookie, durées et vos droits.",
        ariane: "Politique de confidentialité",
      },
    } as Record<string, { titre: string; description: string; ariane: string }>,
    /**
     * /menus-de-fetes en saison (COPY.md section 9 : « suit le titre du menu en
     * base »). Exemple 2026 ; `seoMenusDeFetes(menu)` (lib/seo.ts) le dérive du menu.
     */
    fetesEnSaison: {
      titre: "Traiteur Noël à Roanne, menus de fêtes 2026 | Cherblanc",
      description:
        "Menus de fêtes 2026 de Maison Cherblanc à Roanne : foie gras, plats cuisinés, volailles fermières sur commande. Commandes avant le 20 décembre pour Noël.",
    },
    /**
     * Types complémentaires (Wikidata) de l'entité commerce : schema.org n'a pas
     * de type « boucherie » ni « traiteur » (vérifié sur le vocabulaire courant).
     */
    typesWikidata: [
      "https://www.wikidata.org/wiki/Q13164546", // butcher shop / boucherie
      "https://www.wikidata.org/wiki/Q16140622", // charcuterie (commerce)
      "https://www.wikidata.org/wiki/Q377117", // traiteur
    ],
  },

  /** Couleurs de marque (docs/DA.md), pour le manifeste et le viewport. */
  theme: {
    creme: "#F3EBDC",
    lin: "#F8F3EA",
    olive: "#3F4530",
    oliveProfond: "#2F3424",
    encre: "#2A2B24",
    cuivre: "#A3702A",
    or: "#E4CB8F",
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Adresse sur une ligne (affichage). */
export function adresseUneLigne(): string {
  const a = siteConfig.adresse;
  return `${a.rue}, ${a.codePostal} ${a.ville}`;
}
