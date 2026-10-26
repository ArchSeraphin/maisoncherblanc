"use server";

/**
 * Server Actions « Carte & menus » du backoffice.
 *
 * Règles : `requireUser()` en PREMIÈRE ligne ; l'ID ciblé est lié côté serveur
 * (`action.bind(null, id)`) et son existence vérifiée ; entrées lues par
 * lib/formulaire ; `refresh()` ré-affiche la page courante du BO (le site public
 * est en force-dynamic : rien à invalider).
 */

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { champBooleen, champChoix, champListeIds, champMultiligne, champTexte, type EtatAction } from "@/lib/formulaire";
import { supprimerMediaSiOrphelin } from "@/lib/media";
import {
  BADGES,
  creerMenu,
  creerPlat,
  creerSection,
  definirCouvertureMenu,
  definirMenuVisible,
  definirPdfMenu,
  definirPlatVisible,
  definirSectionVisible,
  deplacerMenu,
  deplacerPlat,
  deplacerSection,
  dupliquerMenu,
  lireMenu,
  lirePlat,
  lireSection,
  modifierMenu,
  modifierPlat,
  modifierPrixPlat,
  modifierSection,
  ordonnerMenus,
  ordonnerPlats,
  ordonnerSections,
  supprimerMenu,
  supprimerPlat,
  supprimerSection,
  TYPES_MENU,
  validerMenu,
  validerPlat,
  validerSection,
} from "@/lib/menus";
import { normaliserPrix } from "@/lib/prix";

type Sens = "haut" | "bas";
const INTROUVABLE: EtatAction = { ok: false, message: "Élément introuvable (déjà supprimé ?)." };

function lireChampsMenu(fd: FormData) {
  return {
    titre: champTexte(fd, "titre", 200),
    slug: champTexte(fd, "slug", 120),
    type: champChoix(fd, "type", TYPES_MENU, "saison"),
    sous_titre: champTexte(fd, "sous_titre", 300),
    intro: champMultiligne(fd, "intro", 2000),
    note_bas: champMultiligne(fd, "note_bas", 1000),
    infos_commande: champMultiligne(fd, "infos_commande", 1500),
    valable_du: champTexte(fd, "valable_du", 10) || null,
    valable_au: champTexte(fd, "valable_au", 10) || null,
    publie_du: champTexte(fd, "publie_du", 10) || null,
    publie_au: champTexte(fd, "publie_au", 10) || null,
    visible: champBooleen(fd, "visible"),
  };
}

// --- Menus -----------------------------------------------------------------

export async function creerMenuAction(_prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const champs = lireChampsMenu(fd);
  const v = validerMenu(champs);
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string>, valeurs: { titre: champs.titre } };
  const menu = creerMenu(v.donnees);
  refresh();
  return { ok: true, message: "Menu créé.", id: menu.id };
}

export async function modifierMenuAction(menuId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  if (!lireMenu(menuId)) return INTROUVABLE;
  const champs = lireChampsMenu(fd);
  const v = validerMenu(champs);
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string> };
  try {
    modifierMenu(menuId, { ...v.donnees, slug: v.donnees.slug ?? undefined });
  } catch (err) {
    return { ok: false, erreurs: { slug: err instanceof Error ? err.message : "Adresse invalide." } };
  }
  refresh();
  return { ok: true, message: "Menu enregistré." };
}

export async function basculerMenuVisibleAction(menuId: number, visible: boolean): Promise<EtatAction> {
  await requireUser();
  if (!lireMenu(menuId)) return INTROUVABLE;
  definirMenuVisible(menuId, visible);
  refresh();
  return { ok: true, message: visible ? "Menu affiché sur le site." : "Menu masqué du site." };
}

/** Supprime le menu (sections et plats) et ses fichiers PDF/couverture s'ils ne servent plus. */
export async function supprimerMenuAction(menuId: number): Promise<EtatAction> {
  await requireUser();
  const m = supprimerMenu(menuId);
  if (!m) return INTROUVABLE;
  supprimerMediaSiOrphelin(m.pdf_media_id);
  supprimerMediaSiOrphelin(m.couverture_media_id);
  refresh();
  return { ok: true, message: "Menu supprimé." };
}

/** Duplique (pour l'année suivante). Le double est masqué, à relire avant publication. */
export async function dupliquerMenuAction(menuId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const copie = dupliquerMenu(menuId, { titre: champTexte(fd, "titre", 200) || undefined });
  if (!copie) return INTROUVABLE;
  refresh();
  return { ok: true, message: "Menu dupliqué (masqué tant que vous ne l’affichez pas).", id: copie.id };
}

export async function deplacerMenuAction(menuId: number, sens: Sens): Promise<void> {
  await requireUser();
  deplacerMenu(menuId, sens === "haut" ? "haut" : "bas");
  refresh();
}

export async function ordonnerMenusAction(ids: number[]): Promise<void> {
  await requireUser();
  ordonnerMenus(Array.isArray(ids) ? ids.filter((i) => Number.isInteger(i) && i > 0) : []);
  refresh();
}

/** Retire le PDF du menu (le fichier est supprimé s'il ne sert plus). L'envoi passe par /api/upload. */
export async function retirerPdfMenuAction(menuId: number): Promise<EtatAction> {
  await requireUser();
  if (!lireMenu(menuId)) return INTROUVABLE;
  supprimerMediaSiOrphelin(definirPdfMenu(menuId, null));
  refresh();
  return { ok: true, message: "PDF retiré." };
}

export async function retirerCouvertureMenuAction(menuId: number): Promise<EtatAction> {
  await requireUser();
  if (!lireMenu(menuId)) return INTROUVABLE;
  supprimerMediaSiOrphelin(definirCouvertureMenu(menuId, null));
  refresh();
  return { ok: true, message: "Photo retirée." };
}

// --- Sections --------------------------------------------------------------

export async function creerSectionAction(menuId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  if (!lireMenu(menuId)) return INTROUVABLE;
  const v = validerSection({ titre: champTexte(fd, "titre", 200), note: champTexte(fd, "note", 300), mise_en_avant: champBooleen(fd, "mise_en_avant") });
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string> };
  const s = creerSection(menuId, v.donnees);
  refresh();
  return { ok: true, message: "Section ajoutée.", id: s.id };
}

export async function modifierSectionAction(sectionId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  if (!lireSection(sectionId)) return INTROUVABLE;
  const v = validerSection({
    titre: champTexte(fd, "titre", 200),
    note: champTexte(fd, "note", 300),
    mise_en_avant: champBooleen(fd, "mise_en_avant"),
    visible: champBooleen(fd, "visible"),
  });
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string> };
  modifierSection(sectionId, v.donnees);
  refresh();
  return { ok: true, message: "Section enregistrée." };
}

export async function basculerSectionVisibleAction(sectionId: number, visible: boolean): Promise<EtatAction> {
  await requireUser();
  if (!lireSection(sectionId)) return INTROUVABLE;
  definirSectionVisible(sectionId, visible);
  refresh();
  return { ok: true, message: visible ? "Section affichée." : "Section masquée." };
}

export async function supprimerSectionAction(sectionId: number): Promise<EtatAction> {
  await requireUser();
  if (!supprimerSection(sectionId)) return INTROUVABLE;
  refresh();
  return { ok: true, message: "Section supprimée." };
}

export async function deplacerSectionAction(sectionId: number, sens: Sens): Promise<void> {
  await requireUser();
  deplacerSection(sectionId, sens === "haut" ? "haut" : "bas");
  refresh();
}

/** Ordre des sections d'un menu (glisser-déposer). IDs étrangers au menu ignorés. */
export async function ordonnerSectionsAction(menuId: number, ids: number[]): Promise<void> {
  await requireUser();
  ordonnerSections(menuId, Array.isArray(ids) ? ids : []);
  refresh();
}

// --- Plats -----------------------------------------------------------------

function lireChampsPlat(fd: FormData) {
  return {
    nom: champTexte(fd, "nom", 200),
    description: champMultiligne(fd, "description", 1500),
    prix: champTexte(fd, "prix", 60),
    unite: champTexte(fd, "unite", 40),
    badge: champChoix(fd, "badge", ["", ...BADGES] as const, "") || null,
    visible: fd.has("visible") ? champBooleen(fd, "visible") : true,
  };
}

export async function creerPlatAction(sectionId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  if (!lireSection(sectionId)) return INTROUVABLE;
  const champs = lireChampsPlat(fd);
  const v = validerPlat(champs);
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string>, valeurs: { nom: champs.nom, prix: champs.prix } };
  const p = creerPlat(sectionId, v.donnees);
  refresh();
  return { ok: true, message: "Plat ajouté.", id: p.id };
}

export async function modifierPlatAction(platId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  if (!lirePlat(platId)) return INTROUVABLE;
  const v = validerPlat(lireChampsPlat(fd));
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string> };
  modifierPlat(platId, v.donnees);
  refresh();
  return { ok: true, message: "Plat enregistré." };
}

/** Raccourci « Changer un prix » (champ `prix`, normalisé : « 3,2 » devient « 3,20 € »). */
export async function modifierPrixAction(platId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  if (!lirePlat(platId)) return INTROUVABLE;
  const prix = normaliserPrix(champTexte(fd, "prix", 60));
  modifierPrixPlat(platId, prix);
  refresh();
  return { ok: true, message: prix ? `Prix enregistré : ${prix}` : "Prix retiré." };
}

export async function basculerPlatVisibleAction(platId: number, visible: boolean): Promise<EtatAction> {
  await requireUser();
  if (!lirePlat(platId)) return INTROUVABLE;
  definirPlatVisible(platId, visible);
  refresh();
  return { ok: true, message: visible ? "Plat affiché." : "Plat masqué du site." };
}

export async function supprimerPlatAction(platId: number): Promise<EtatAction> {
  await requireUser();
  if (!supprimerPlat(platId)) return INTROUVABLE;
  refresh();
  return { ok: true, message: "Plat supprimé." };
}

export async function deplacerPlatAction(platId: number, sens: Sens): Promise<void> {
  await requireUser();
  deplacerPlat(platId, sens === "haut" ? "haut" : "bas");
  refresh();
}

/** Ordre des plats d'une section (glisser-déposer). IDs étrangers à la section ignorés. */
export async function ordonnerPlatsAction(sectionId: number, ids: number[]): Promise<void> {
  await requireUser();
  ordonnerPlats(sectionId, Array.isArray(ids) ? ids : []);
  refresh();
}

/** Variante formulaire de l'ordre (champ caché `ordre` = JSON ou "1,2,3"). */
export async function ordonnerPlatsFormAction(sectionId: number, fd: FormData): Promise<void> {
  await requireUser();
  ordonnerPlats(sectionId, champListeIds(fd, "ordre"));
  refresh();
}
