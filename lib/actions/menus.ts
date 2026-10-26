"use server";

/**
 * Server Actions « Carte & menus » du backoffice.
 *
 * Règles : `requireUser()` en PREMIÈRE ligne ; les IDs ciblés sont liés
 * (`action.bind(null, menuId, platId)`), revalidés par zod (ils transitent par
 * le navigateur) puis leur APPARTENANCE est vérifiée : un plat doit appartenir
 * au menu édité, une section aussi. Entrées lues par lib/formulaire ; `refresh()`
 * ré-affiche la page du BO (le site public est en force-dynamic : rien à invalider).
 */

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { champBooleen, champChoix, champId, champMultiligne, champTexte, type EtatAction } from "@/lib/formulaire";
import { lireMedia } from "@/lib/media";
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
  deplacerPlat,
  deplacerSection,
  dupliquerMenu,
  lireMenu,
  lirePlat,
  lireSection,
  menuDuPlat,
  modifierMenu,
  modifierPlat,
  modifierSection,
  ordonnerPlats,
  ordonnerSections,
  remplacerCarteTraiteur,
  SLUG_CARTE_TRAITEUR,
  supprimerMenu,
  supprimerPlat,
  supprimerSection,
  TYPES_MENU,
  validerMenu,
  validerPlat,
  validerSection,
  type EntreePlat,
} from "@/lib/menus";
import { normaliserPrix } from "@/lib/prix";
import { nettoyerMedia } from "./nettoyage";
import { booleen, idsValides, listeIds, sens as lireSens } from "./schemas";

const INTROUVABLE: EtatAction = { ok: false, message: "Élément introuvable : il a peut-être déjà été supprimé. Rechargez la page." };

/** Section appartenant bien au menu édité, ou `null`. */
function sectionDuMenu(menuId: unknown, sectionId: unknown) {
  const ids = idsValides(menuId, sectionId);
  if (!ids) return null;
  const s = lireSection(ids[1]);
  return s && s.menu_id === ids[0] ? s : null;
}

/** Plat appartenant bien au menu édité, ou `null`. */
function platDuMenu(menuId: unknown, platId: unknown) {
  const ids = idsValides(menuId, platId);
  if (!ids || menuDuPlat(ids[1]) !== ids[0]) return null;
  return lirePlat(ids[1]);
}

function menuExistant(menuId: unknown) {
  const ids = idsValides(menuId);
  return ids ? lireMenu(ids[0]) : null;
}

function lireChampsMenu(fd: FormData) {
  return {
    titre: champTexte(fd, "titre", 200),
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

/** Nouveau menu (`titre`, `type`) : créé MASQUÉ, à compléter avant de l'afficher. */
export async function creerMenuAction(_prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const champs = { ...lireChampsMenu(fd), visible: false };
  const v = validerMenu(champs);
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string>, valeurs: { titre: champs.titre } };
  const menu = creerMenu({ ...v.donnees, visible: false });
  refresh();
  return { ok: true, message: "Menu créé. Ajoutez maintenant ses sections et ses plats.", id: menu.id };
}

export async function modifierMenuAction(menuId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const cur = menuExistant(menuId);
  if (!cur) return INTROUVABLE;
  const champs = lireChampsMenu(fd);
  // La carte en ligne reste une carte permanente (sinon la page /carte-traiteur disparaîtrait).
  if (cur.slug === SLUG_CARTE_TRAITEUR) champs.type = "permanent";
  const v = validerMenu(champs);
  if (!v.ok) return { ok: false, message: "Certains champs sont à corriger.", erreurs: v.erreurs as Record<string, string> };
  try {
    modifierMenu(cur.id, { ...v.donnees, slug: undefined });
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Enregistrement impossible." };
  }
  refresh();
  return { ok: true, message: "Informations du menu enregistrées." };
}

export async function basculerMenuVisibleAction(menuId: number, visible: boolean): Promise<EtatAction> {
  await requireUser();
  const m = menuExistant(menuId);
  const v = booleen(visible);
  if (!m || v === null) return INTROUVABLE;
  definirMenuVisible(m.id, v);
  refresh();
  return { ok: true, message: v ? "Menu affiché sur le site." : "Menu masqué du site." };
}

/** Supprime le menu (sections et plats) et ses fichiers PDF/couverture s'ils ne servent plus. La carte en ligne est protégée. */
export async function supprimerMenuAction(menuId: number): Promise<EtatAction> {
  await requireUser();
  const cur = menuExistant(menuId);
  if (!cur) return INTROUVABLE;
  if (cur.slug === SLUG_CARTE_TRAITEUR)
    return { ok: false, message: "C’est la carte affichée sur le site : elle ne peut pas être supprimée. Masquez-la si besoin." };
  const m = supprimerMenu(cur.id);
  if (!m) return INTROUVABLE;
  nettoyerMedia(m.pdf_media_id);
  nettoyerMedia(m.couverture_media_id);
  refresh();
  return { ok: true, message: `Menu « ${m.titre} » supprimé.` };
}

/** Duplique (pour l'année suivante, champ `titre`). Le double est masqué, sans PDF ni dates : à relire avant de l'afficher. */
export async function dupliquerMenuAction(menuId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const m = menuExistant(menuId);
  if (!m) return INTROUVABLE;
  const titre = champTexte(fd, "titre", 200);
  if (!titre) return { ok: false, erreurs: { titre: "Donnez un titre au nouveau menu." } };
  const copie = dupliquerMenu(m.id, { titre });
  if (!copie) return INTROUVABLE;
  refresh();
  return { ok: true, message: `Menu dupliqué : « ${copie.titre} » (masqué tant que vous ne l’affichez pas).`, id: copie.id };
}

/** Met en ligne ce menu permanent comme carte traiteur ; l'ancienne carte est gardée, masquée. */
export async function remplacerCarteTraiteurAction(menuId: number): Promise<EtatAction> {
  await requireUser();
  const m = menuExistant(menuId);
  if (!m) return INTROUVABLE;
  if (m.type !== "permanent") return { ok: false, message: "Seule une carte permanente peut remplacer la carte traiteur." };
  const r = remplacerCarteTraiteur(m.id);
  if (!r) return { ok: false, message: "Cette carte est déjà celle du site." };
  refresh();
  return {
    ok: true,
    message: r.ancienne
      ? `« ${r.nouvelle.titre} » est maintenant la carte du site. « ${r.ancienne.titre} » est gardée, masquée.`
      : "Carte mise en ligne.",
  };
}

/** Retire le PDF du menu (le fichier est supprimé s'il ne sert plus). L'envoi passe par /api/upload. */
export async function retirerPdfMenuAction(menuId: number): Promise<EtatAction> {
  await requireUser();
  const m = menuExistant(menuId);
  if (!m) return INTROUVABLE;
  nettoyerMedia(definirPdfMenu(m.id, null));
  refresh();
  return { ok: true, message: "PDF retiré." };
}

/** Photo de couverture choisie dans la médiathèque. L'envoi d'une nouvelle photo passe par /api/upload. */
export async function definirCouvertureMenuAction(menuId: number, mediaId: number): Promise<EtatAction> {
  await requireUser();
  const m = menuExistant(menuId);
  const ids = idsValides(mediaId);
  if (!m || !ids) return INTROUVABLE;
  const media = lireMedia(ids[0]);
  if (!media || media.type !== "image" || media.statut !== "ready") return { ok: false, message: "Photo introuvable." };
  nettoyerMedia(definirCouvertureMenu(m.id, media.id));
  refresh();
  return { ok: true, message: "Photo de couverture enregistrée." };
}

export async function retirerCouvertureMenuAction(menuId: number): Promise<EtatAction> {
  await requireUser();
  const m = menuExistant(menuId);
  if (!m) return INTROUVABLE;
  nettoyerMedia(definirCouvertureMenu(m.id, null));
  refresh();
  return { ok: true, message: "Photo de couverture retirée." };
}

// --- Sections --------------------------------------------------------------

export async function creerSectionAction(menuId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const m = menuExistant(menuId);
  if (!m) return INTROUVABLE;
  const v = validerSection({
    titre: champTexte(fd, "titre", 200),
    note: champTexte(fd, "note", 300),
    mise_en_avant: champBooleen(fd, "mise_en_avant"),
  });
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string> };
  const s = creerSection(m.id, v.donnees);
  refresh();
  return { ok: true, message: `Section « ${s.titre} » ajoutée.`, id: s.id };
}

/** Titre, note, formule encadrée. La visibilité se change par `basculerSectionVisibleAction`. */
export async function modifierSectionAction(menuId: number, sectionId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const s = sectionDuMenu(menuId, sectionId);
  if (!s) return INTROUVABLE;
  const v = validerSection({
    titre: champTexte(fd, "titre", 200),
    note: champTexte(fd, "note", 300),
    mise_en_avant: champBooleen(fd, "mise_en_avant"),
    visible: s.visible,
  });
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string> };
  modifierSection(s.id, { ...v.donnees, visible: s.visible });
  refresh();
  return { ok: true, message: "Section enregistrée." };
}

export async function basculerSectionVisibleAction(menuId: number, sectionId: number, visible: boolean): Promise<EtatAction> {
  await requireUser();
  const s = sectionDuMenu(menuId, sectionId);
  const v = booleen(visible);
  if (!s || v === null) return INTROUVABLE;
  definirSectionVisible(s.id, v);
  refresh();
  return { ok: true, message: v ? `Section « ${s.titre} » affichée.` : `Section « ${s.titre} » masquée du site.` };
}

export async function supprimerSectionAction(menuId: number, sectionId: number): Promise<EtatAction> {
  await requireUser();
  const s = sectionDuMenu(menuId, sectionId);
  if (!s || !supprimerSection(s.id)) return INTROUVABLE;
  refresh();
  return { ok: true, message: `Section « ${s.titre} » supprimée.` };
}

export async function deplacerSectionAction(menuId: number, sectionId: number, sens: "haut" | "bas"): Promise<EtatAction> {
  await requireUser();
  const s = sectionDuMenu(menuId, sectionId);
  const sn = lireSens(sens);
  if (!s || !sn) return INTROUVABLE;
  deplacerSection(s.id, sn);
  refresh();
  return { ok: true, message: "Ordre enregistré." };
}

/** Ordre des sections d'un menu (glisser-déposer). IDs étrangers au menu ignorés. */
export async function ordonnerSectionsAction(menuId: number, ids: number[]): Promise<EtatAction> {
  await requireUser();
  const m = menuExistant(menuId);
  const liste = listeIds(ids);
  if (!m || !liste) return INTROUVABLE;
  ordonnerSections(m.id, liste);
  refresh();
  return { ok: true, message: "Ordre des sections enregistré." };
}

// --- Plats -----------------------------------------------------------------

/** Champs présents dans le formulaire seulement (un champ absent garde sa valeur). */
function fusionnerPlat(fd: FormData, base: EntreePlat): Record<keyof EntreePlat, unknown> {
  return {
    nom: fd.has("nom") ? champTexte(fd, "nom", 200) : base.nom,
    description: fd.has("description") ? champMultiligne(fd, "description", 1500) : base.description,
    prix: fd.has("prix") ? champTexte(fd, "prix", 60) : base.prix,
    unite: fd.has("unite") ? champTexte(fd, "unite", 40) : base.unite,
    badge: fd.has("badge") ? champChoix(fd, "badge", ["", ...BADGES] as const, "") || null : base.badge,
    visible: base.visible,
  };
}

export async function creerPlatAction(menuId: number, sectionId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const s = sectionDuMenu(menuId, sectionId);
  if (!s) return INTROUVABLE;
  const v = validerPlat(fusionnerPlat(fd, { nom: "", description: "", prix: "", unite: "", badge: null, visible: true }));
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string> };
  const p = creerPlat(s.id, v.donnees);
  refresh();
  return { ok: true, message: `« ${p.nom} » ajouté${p.prix ? ` à ${p.prix}` : ""}.`, id: p.id };
}

export async function modifierPlatAction(menuId: number, platId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const cur = platDuMenu(menuId, platId);
  if (!cur) return INTROUVABLE;
  const v = validerPlat(fusionnerPlat(fd, cur));
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string> };
  modifierPlat(cur.id, { ...v.donnees, visible: cur.visible });
  refresh();
  const d = v.donnees;
  const seulPrix = d.prix !== cur.prix && d.nom === cur.nom && d.unite === cur.unite && d.description === cur.description && d.badge === cur.badge;
  if (seulPrix) return { ok: true, message: d.prix ? `Prix enregistré : ${d.prix}` : "Prix retiré." };
  return { ok: true, message: `« ${d.nom} » enregistré.` };
}

/** Raccourci « Changer un prix » (champ `prix`, normalisé : « 3,2 » devient « 3,20 € »). */
export async function modifierPrixAction(menuId: number, platId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const cur = platDuMenu(menuId, platId);
  if (!cur) return INTROUVABLE;
  const prix = normaliserPrix(champTexte(fd, "prix", 60));
  modifierPlat(cur.id, { prix });
  refresh();
  return { ok: true, message: prix ? `Prix enregistré : ${prix}` : "Prix retiré." };
}

export async function basculerPlatVisibleAction(menuId: number, platId: number, visible: boolean): Promise<EtatAction> {
  await requireUser();
  const p = platDuMenu(menuId, platId);
  const v = booleen(visible);
  if (!p || v === null) return INTROUVABLE;
  definirPlatVisible(p.id, v);
  refresh();
  return { ok: true, message: v ? `« ${p.nom} » affiché sur le site.` : `« ${p.nom} » masqué du site.` };
}

export async function supprimerPlatAction(menuId: number, platId: number): Promise<EtatAction> {
  await requireUser();
  const p = platDuMenu(menuId, platId);
  if (!p || !supprimerPlat(p.id)) return INTROUVABLE;
  refresh();
  return { ok: true, message: `« ${p.nom} » supprimé.` };
}

export async function deplacerPlatAction(menuId: number, platId: number, sens: "haut" | "bas"): Promise<EtatAction> {
  await requireUser();
  const p = platDuMenu(menuId, platId);
  const sn = lireSens(sens);
  if (!p || !sn) return INTROUVABLE;
  deplacerPlat(p.id, sn);
  refresh();
  return { ok: true, message: "Ordre enregistré." };
}

/** Ordre des plats d'une section (glisser-déposer). IDs étrangers à la section ignorés. */
export async function ordonnerPlatsAction(menuId: number, sectionId: number, ids: number[]): Promise<EtatAction> {
  await requireUser();
  const s = sectionDuMenu(menuId, sectionId);
  const liste = listeIds(ids);
  if (!s || !liste) return INTROUVABLE;
  ordonnerPlats(s.id, liste);
  refresh();
  return { ok: true, message: "Ordre des plats enregistré." };
}

/** Déplace un plat dans une autre section du même menu (champ `section_id`), placé en fin. */
export async function changerSectionPlatAction(menuId: number, platId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const p = platDuMenu(menuId, platId);
  const cible = sectionDuMenu(menuId, champId(fd, "section_id"));
  if (!p || !cible) return INTROUVABLE;
  if (cible.id === p.section_id) return { ok: true, message: "Le plat est déjà dans cette section." };
  modifierPlat(p.id, { section_id: cible.id });
  refresh();
  return { ok: true, message: `« ${p.nom} » déplacé dans « ${cible.titre} ».` };
}
