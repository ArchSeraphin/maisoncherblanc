/**
 * Emplacements d'images des pages (photos éditables depuis le BO « Photos des pages »).
 * Le média associé à chaque clé est stocké dans le réglage JSON `emplacements`
 * ({ "<cle>": media_id }). Clés stables : elles sont citées par les pages.
 */

import { lireMedias, versImage } from "./media";
import type { ImageMedia } from "./media-url";
import { ecrireReglage, lireReglage } from "./reglages";

export const EMPLACEMENTS = [
  { cle: "accueil-hero-boucherie", libelle: "Accueil : porte « La boucherie »", page: "/", ratio: "4/5" },
  { cle: "accueil-hero-traiteur", libelle: "Accueil : porte « Le traiteur »", page: "/", ratio: "4/5" },
  { cle: "accueil-savoir-faire", libelle: "Accueil : bloc savoir-faire", page: "/", ratio: "4/3" },
  { cle: "accueil-maison", libelle: "Accueil : bloc « La maison »", page: "/", ratio: "4/3" },
  { cle: "boucherie-hero", libelle: "Boucherie : grande image d’en-tête", page: "/boucherie-roanne", ratio: "16/9" },
  { cle: "boucherie-viandes", libelle: "Boucherie : les viandes", page: "/boucherie-roanne", ratio: "4/3" },
  { cle: "boucherie-charcuterie", libelle: "Boucherie : la charcuterie", page: "/boucherie-roanne", ratio: "4/3" },
  { cle: "boucherie-fumoir", libelle: "Boucherie : salaisons et jambons", page: "/boucherie-roanne", ratio: "4/3" },
  { cle: "boucherie-volailles", libelle: "Boucherie : les volailles", page: "/boucherie-roanne", ratio: "4/3" },
  { cle: "traiteur-hero", libelle: "Traiteur : grande image d’en-tête", page: "/traiteur-roanne", ratio: "16/9" },
  { cle: "traiteur-mariage", libelle: "Traiteur : carte « Mariage »", page: "/traiteur-roanne", ratio: "4/5" },
  { cle: "traiteur-cocktail", libelle: "Traiteur : carte « Cocktail dînatoire »", page: "/traiteur-roanne", ratio: "4/5" },
  { cle: "traiteur-broche", libelle: "Traiteur : carte « Broche et barbecue »", page: "/traiteur-roanne", ratio: "4/5" },
  { cle: "traiteur-plats", libelle: "Traiteur : plats cuisinés", page: "/traiteur-roanne", ratio: "4/3" },
  { cle: "mariage-hero", libelle: "Mariage : image d’en-tête", page: "/traiteur-roanne/mariage", ratio: "16/9" },
  { cle: "cocktail-hero", libelle: "Cocktail dînatoire : image d’en-tête", page: "/traiteur-roanne/cocktail-dinatoire", ratio: "16/9" },
  { cle: "broche-hero", libelle: "Broche et barbecue : image d’en-tête", page: "/traiteur-roanne/broche-barbecue", ratio: "16/9" },
  { cle: "carte-hero", libelle: "Carte traiteur : image d’en-tête", page: "/carte-traiteur", ratio: "16/9" },
  { cle: "fetes-hero", libelle: "Menus de fêtes : image d’en-tête", page: "/menus-de-fetes", ratio: "16/9" },
  { cle: "maison-hero", libelle: "La maison : image d’en-tête", page: "/la-maison", ratio: "16/9" },
  { cle: "maison-equipe", libelle: "La maison : l’équipe", page: "/la-maison", ratio: "4/3" },
  { cle: "contact-boutique", libelle: "Contact : la boutique", page: "/contact", ratio: "4/3" },
  { cle: "og-defaut", libelle: "Image de partage sur les réseaux sociaux", page: "", ratio: "1200/630" },
] as const;

export type CleEmplacement = (typeof EMPLACEMENTS)[number]["cle"];

export function estCleEmplacement(v: unknown): v is CleEmplacement {
  return typeof v === "string" && EMPLACEMENTS.some((e) => e.cle === v);
}

/** Associe (ou retire avec `null`) un média à un emplacement. */
export function definirEmplacement(cle: CleEmplacement, mediaId: number | null): void {
  const carte = { ...lireReglage("emplacements") };
  if (mediaId) carte[cle] = mediaId;
  else delete carte[cle];
  ecrireReglage("emplacements", carte);
}

/** Remplit un emplacement seulement s'il est vide (seed). Renvoie `true` si rempli. */
export function remplirEmplacementSiVide(cle: CleEmplacement, mediaId: number): boolean {
  const carte = lireReglage("emplacements");
  if (carte[cle]) return false;
  definirEmplacement(cle, mediaId);
  return true;
}

/** IDs de médias par emplacement (BO). */
export function lireIdsEmplacements(): Partial<Record<CleEmplacement, number>> {
  return lireReglage("emplacements") as Partial<Record<CleEmplacement, number>>;
}

/**
 * Images prêtes des emplacements demandés (2 requêtes, quel que soit le nombre).
 * Un emplacement vide ou dont l'image n'est pas prête vaut `null`.
 */
export function chargerEmplacements<C extends CleEmplacement>(cles: readonly C[]): Record<C, ImageMedia | null> {
  const carte = lireReglage("emplacements");
  const medias = lireMedias(cles.map((c) => carte[c]).filter((id): id is number => !!id));
  const out = {} as Record<C, ImageMedia | null>;
  for (const c of cles) out[c] = carte[c] ? versImage(medias.get(carte[c])) : null;
  return out;
}

/** Image d'un seul emplacement. */
export function imageEmplacement(cle: CleEmplacement): ImageMedia | null {
  return chargerEmplacements([cle])[cle];
}
