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
  description:
    "Maison Cherblanc, boucherie, charcuterie et traiteur au 55 rue Mulsant à Roanne : viandes, charcuterie maison, plats cuisinés, plateaux, cocktails et buffets pour vos réceptions.",
  descriptionCourte: "Boucherie, charcuterie et traiteur à Roanne",
  locale: "fr_FR",
  langue: "fr",

  /** Titres (metadata). Le texte définitif des pages vient de docs/COPY.md. */
  modeleTitre: "%s | Maison Cherblanc, Roanne",
  titreParDefaut: "Maison Cherblanc, boucherie charcuterie et traiteur à Roanne",

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

  /** Coordonnées GPS : non fournies, aucun `geo` en JSON-LD tant que `null`. */
  geo: null as { latitude: number; longitude: number } | null,

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

  /** Zone servie (mots clés secondaires du contrat, aucune promesse de livraison). */
  zone: ["Roanne", "Riorges", "Mably", "Le Coteau", "Roannais", "Loire (42)"],

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
    creditsPhotos: null as string | null, // TODO
  },

  /** Données personnelles (politique de confidentialité). Durées appliquées par la maintenance. */
  confidentialite: {
    conservationMessagesMois: 12,
    conservationStatistiquesMois: 25,
    /** Sous-traitant des notifications e-mail (lib/mail.ts), seulement si BREVO_API_KEY est défini. */
    prestataireEmail: { nom: "Brevo", societe: "BREVO SAS", ville: "Paris" },
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

  /** Image Open Graph par défaut si l'emplacement `og-defaut` est vide. */
  imagePartageParDefaut: {
    chemin: "/icons/icon-512.png",
    largeur: 512,
    hauteur: 512,
    alt: "Monogramme de Maison Cherblanc, boucherie, charcuterie, traiteur à Roanne",
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
