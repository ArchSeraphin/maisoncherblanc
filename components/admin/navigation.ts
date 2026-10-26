/**
 * Modules du backoffice (docs/CONTRAT.md). Chemins RELATIFS au chemin secret :
 * le lien final est `${base}${href}`. Module pur : importable partout.
 */

export type ModuleAdmin = { href: string; libelle: string; description: string; icone: NomIcone };

export type NomIcone = "accueil" | "carte" | "horloge" | "annonce" | "journal" | "etoile" | "galerie" | "photo" | "message" | "personnes";

export const NAVIGATION_ADMIN: readonly ModuleAdmin[] = [
  { href: "", libelle: "Tableau de bord", description: "Visites, messages non lus, raccourcis.", icone: "accueil" },
  { href: "/menus", libelle: "Carte & menus", description: "Carte traiteur, menus de fêtes : plats, prix, PDF.", icone: "carte" },
  { href: "/horaires", libelle: "Horaires", description: "Semaine type, fermetures et ouvertures exceptionnelles.", icone: "horloge" },
  { href: "/annonce", libelle: "Bandeau d’annonce", description: "Message affiché en haut du site.", icone: "annonce" },
  { href: "/actualites", libelle: "Actualités", description: "Écrire, publier, programmer.", icone: "journal" },
  { href: "/realisations", libelle: "Réalisations", description: "Photos de la galerie : envoi, catégorie, ordre.", icone: "galerie" },
  { href: "/photos", libelle: "Photos des pages", description: "Changer les photos de chaque page du site.", icone: "photo" },
  { href: "/avis", libelle: "Avis clients", description: "Avis recopiés depuis Google ou reçus en direct.", icone: "etoile" },
  { href: "/messages", libelle: "Messages", description: "Demandes de devis et commandes reçues par le site.", icone: "message" },
  { href: "/administrateurs", libelle: "Administrateurs", description: "Comptes d’accès, mot de passe.", icone: "personnes" },
] as const;
