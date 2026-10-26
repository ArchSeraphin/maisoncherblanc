/**
 * Cartes et menus (tables `menus`, `menu_sections`, `menu_plats`).
 *
 * - La carte traiteur = un menu `permanent` (slug `carte-traiteur`).
 * - Un menu de fêtes = un menu `saison`, affiché sur /menus-de-fetes quand il
 *   est visible et que sa fenêtre de publication (`publie_du`..`publie_au`,
 *   jours ISO inclus, `null` = ouverte) couvre aujourd'hui.
 * - Sections : `note` (ex. « À la part »), `mise_en_avant` (formules encadrées).
 * - Plats : `prix` texte normalisé (lib/prix.ts), `unite` libre (« la part »,
 *   « pièce », « le kg »...), `description` multiligne (lib/composition.ts).
 *
 * Les suppressions renvoient la ligne supprimée (cascade sections/plats).
 */

import { dansFenetre, estJourIso, jourParis } from "./dates";
import { bool, maintenantIso, stmt, transaction } from "./db";
import { lireDocument, lireMedias, versDocument, versImage } from "./media";
import type { DocumentMedia, ImageMedia } from "./media-url";
import { echangerDansListe } from "./ordre";
import { normaliserPrix, validerPrix } from "./prix";
import { slugifier } from "./slug";

export type TypeMenu = "permanent" | "saison";
export const TYPES_MENU: readonly TypeMenu[] = ["permanent", "saison"];

export const BADGES = ["Fait maison", "Nouveau", "Végétarien", "Sur commande"] as const;
export type Badge = (typeof BADGES)[number];

/** Unités proposées dans le BO (la saisie reste libre). */
export const UNITES_SUGGEREES = ["", "par pers.", "la part", "pièce", "le kg", "les 100 g", "la plaque", "les trois"] as const;

export const LIMITES_MENU = {
  titre: 120,
  sous_titre: 200,
  intro: 1500,
  note_bas: 600,
  infos_commande: 1000,
  section_titre: 100,
  section_note: 160,
  plat_nom: 160,
  plat_description: 1200,
  unite: 30,
} as const;

/** Slug réservé à la carte traiteur permanente (page /carte-traiteur). */
export const SLUG_CARTE_TRAITEUR = "carte-traiteur";

export type Menu = {
  id: number;
  slug: string;
  type: TypeMenu;
  titre: string;
  sous_titre: string;
  intro: string;
  note_bas: string;
  infos_commande: string;
  valable_du: string | null;
  valable_au: string | null;
  publie_du: string | null;
  publie_au: string | null;
  pdf_media_id: number | null;
  couverture_media_id: number | null;
  visible: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Section = {
  id: number;
  menu_id: number;
  titre: string;
  note: string;
  mise_en_avant: boolean;
  position: number;
  visible: boolean;
};

export type Plat = {
  id: number;
  section_id: number;
  nom: string;
  description: string;
  prix: string;
  unite: string;
  badge: Badge | null;
  position: number;
  visible: boolean;
};

export type SectionAvecPlats = Section & { plats: Plat[] };

export type MenuComplet = Menu & {
  sections: SectionAvecPlats[];
  pdf: DocumentMedia | null;
  couverture: ImageMedia | null;
};

export type EntreeMenu = {
  slug?: string;
  type?: TypeMenu;
  titre: string;
  sous_titre?: string;
  intro?: string;
  note_bas?: string;
  infos_commande?: string;
  valable_du?: string | null;
  valable_au?: string | null;
  publie_du?: string | null;
  publie_au?: string | null;
  visible?: boolean;
};

export type EntreeSection = { titre: string; note?: string; mise_en_avant?: boolean; visible?: boolean };
export type EntreePlat = { nom: string; description?: string; prix?: string; unite?: string; badge?: string | null; visible?: boolean };

type LigneMenu = Omit<Menu, "visible"> & { visible: number };
type LigneSection = Omit<Section, "visible" | "mise_en_avant"> & { visible: number; mise_en_avant: number };
type LignePlat = Omit<Plat, "visible" | "badge"> & { visible: number; badge: string | null };

const versMenu = (l: LigneMenu): Menu => ({ ...l, visible: bool(l.visible) });
const versSection = (l: LigneSection): Section => ({ ...l, visible: bool(l.visible), mise_en_avant: bool(l.mise_en_avant) });
const versPlat = (l: LignePlat): Plat => ({ ...l, visible: bool(l.visible), badge: estBadge(l.badge) ? l.badge : null });

export function estBadge(v: unknown): v is Badge {
  return typeof v === "string" && (BADGES as readonly string[]).includes(v);
}

export function estTypeMenu(v: unknown): v is TypeMenu {
  return v === "permanent" || v === "saison";
}

const nettoyer = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[ \t]+/g, " ").trim().slice(0, max) : "");
const multiligne = (v: unknown, max: number) =>
  typeof v === "string"
    ? v
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map((l) => l.replace(/[ \t]+/g, " ").trim())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .slice(0, max)
    : "";
const jourOuNull = (v: unknown) => (estJourIso(v) ? v : null);

// ---------------------------------------------------------------------------
// Menus
// ---------------------------------------------------------------------------

export function listerMenus(opts: { type?: TypeMenu } = {}): Menu[] {
  const lignes = stmt("SELECT * FROM menus WHERE (@type = '' OR type = @type) ORDER BY type, position, id").all({
    type: opts.type ?? "",
  }) as LigneMenu[];
  return lignes.map(versMenu);
}

export function lireMenu(id: number): Menu | null {
  const l = stmt("SELECT * FROM menus WHERE id = ?").get(id) as LigneMenu | undefined;
  return l ? versMenu(l) : null;
}

export function lireMenuParSlug(slug: string): Menu | null {
  const l = stmt("SELECT * FROM menus WHERE slug = ?").get(slug) as LigneMenu | undefined;
  return l ? versMenu(l) : null;
}

export function slugMenuDisponible(slug: string, saufId?: number): boolean {
  const l = stmt("SELECT id FROM menus WHERE slug = ?").get(slug) as { id: number } | undefined;
  return !l || l.id === saufId;
}

/** Slug unique dérivé de `base` (suffixe -2, -3... si déjà pris). */
export function slugMenuUnique(base: string, saufId?: number): string {
  const racine = slugifier(base) || "menu";
  let slug = racine;
  for (let n = 2; !slugMenuDisponible(slug, saufId); n++) slug = `${racine}-${n}`;
  return slug;
}

/** Valide une saisie de menu (titre obligatoire, dates ISO, fenêtres cohérentes). */
export function validerMenu(e: Partial<Record<keyof EntreeMenu, unknown>>):
  | { ok: true; donnees: EntreeMenu }
  | { ok: false; erreurs: Partial<Record<keyof EntreeMenu, string>> } {
  const erreurs: Partial<Record<keyof EntreeMenu, string>> = {};
  const titre = nettoyer(e.titre, LIMITES_MENU.titre);
  if (!titre) erreurs.titre = "Donnez un titre au menu.";
  const dates = ["valable_du", "valable_au", "publie_du", "publie_au"] as const;
  const d: Record<(typeof dates)[number], string | null> = { valable_du: null, valable_au: null, publie_du: null, publie_au: null };
  for (const k of dates) {
    const v = e[k];
    if (v === null || v === undefined || v === "") continue;
    if (!estJourIso(v)) erreurs[k] = "Date invalide.";
    else d[k] = v;
  }
  if (d.valable_du && d.valable_au && d.valable_au < d.valable_du) erreurs.valable_au = "La fin doit être après le début.";
  if (d.publie_du && d.publie_au && d.publie_au < d.publie_du) erreurs.publie_au = "La fin doit être après le début.";
  const slug = typeof e.slug === "string" && e.slug.trim() ? slugifier(e.slug) : undefined;
  if (typeof e.slug === "string" && e.slug.trim() && !slug) erreurs.slug = "Adresse invalide.";
  if (Object.keys(erreurs).length) return { ok: false, erreurs };
  return {
    ok: true,
    donnees: {
      slug,
      type: estTypeMenu(e.type) ? e.type : "saison",
      titre,
      sous_titre: nettoyer(e.sous_titre, LIMITES_MENU.sous_titre),
      intro: multiligne(e.intro, LIMITES_MENU.intro),
      note_bas: multiligne(e.note_bas, LIMITES_MENU.note_bas),
      infos_commande: multiligne(e.infos_commande, LIMITES_MENU.infos_commande),
      ...d,
      visible: e.visible === undefined ? true : e.visible === true,
    },
  };
}

export function creerMenu(e: EntreeMenu): Menu {
  const slug = slugMenuUnique(e.slug || e.titre);
  const pos = (stmt("SELECT COALESCE(MAX(position), 0) + 1 AS p FROM menus").get() as { p: number }).p;
  const res = stmt(
    `INSERT INTO menus (slug, type, titre, sous_titre, intro, note_bas, infos_commande, valable_du, valable_au, publie_du, publie_au, visible, position)
     VALUES (@slug, @type, @titre, @sous_titre, @intro, @note_bas, @infos_commande, @valable_du, @valable_au, @publie_du, @publie_au, @visible, @position)`,
  ).run({
    slug,
    type: e.type ?? "saison",
    titre: nettoyer(e.titre, LIMITES_MENU.titre),
    sous_titre: nettoyer(e.sous_titre, LIMITES_MENU.sous_titre),
    intro: multiligne(e.intro, LIMITES_MENU.intro),
    note_bas: multiligne(e.note_bas, LIMITES_MENU.note_bas),
    infos_commande: multiligne(e.infos_commande, LIMITES_MENU.infos_commande),
    valable_du: jourOuNull(e.valable_du),
    valable_au: jourOuNull(e.valable_au),
    publie_du: jourOuNull(e.publie_du),
    publie_au: jourOuNull(e.publie_au),
    visible: e.visible === false ? 0 : 1,
    position: pos,
  });
  return lireMenu(Number(res.lastInsertRowid))!;
}

/** Modifie les champs fournis. Un slug déjà pris lève une erreur. */
export function modifierMenu(id: number, patch: Partial<EntreeMenu>): Menu | null {
  const cur = lireMenu(id);
  if (!cur) return null;
  let slug = cur.slug;
  if (patch.slug !== undefined && patch.slug !== cur.slug) {
    const s = slugifier(patch.slug);
    if (!s || !slugMenuDisponible(s, id)) throw new Error("Cette adresse est déjà utilisée par un autre menu.");
    slug = s;
  }
  const v = <K extends keyof EntreeMenu>(k: K, def: Menu[K & keyof Menu]) => (patch[k] !== undefined ? patch[k] : def);
  stmt(
    `UPDATE menus SET slug = @slug, type = @type, titre = @titre, sous_titre = @sous_titre, intro = @intro, note_bas = @note_bas,
       infos_commande = @infos_commande, valable_du = @valable_du, valable_au = @valable_au, publie_du = @publie_du,
       publie_au = @publie_au, visible = @visible, updated_at = @maj WHERE id = @id`,
  ).run({
    id,
    slug,
    type: estTypeMenu(patch.type) ? patch.type : cur.type,
    titre: nettoyer(v("titre", cur.titre), LIMITES_MENU.titre) || cur.titre,
    sous_titre: nettoyer(v("sous_titre", cur.sous_titre), LIMITES_MENU.sous_titre),
    intro: multiligne(v("intro", cur.intro), LIMITES_MENU.intro),
    note_bas: multiligne(v("note_bas", cur.note_bas), LIMITES_MENU.note_bas),
    infos_commande: multiligne(v("infos_commande", cur.infos_commande), LIMITES_MENU.infos_commande),
    valable_du: jourOuNull(v("valable_du", cur.valable_du)),
    valable_au: jourOuNull(v("valable_au", cur.valable_au)),
    publie_du: jourOuNull(v("publie_du", cur.publie_du)),
    publie_au: jourOuNull(v("publie_au", cur.publie_au)),
    visible: (patch.visible ?? cur.visible) ? 1 : 0,
    maj: maintenantIso(),
  });
  return lireMenu(id);
}

export function definirMenuVisible(id: number, visible: boolean): void {
  stmt("UPDATE menus SET visible = ?, updated_at = ? WHERE id = ?").run(visible ? 1 : 0, maintenantIso(), id);
}

/**
 * Remplace le PDF du menu. Renvoie l'ID de l'ancien PDF (à supprimer par
 * l'appelant avec `supprimerMediaSiOrphelinHorsSeed`), ou `null`.
 */
export function definirPdfMenu(id: number, mediaId: number | null): number | null {
  const cur = lireMenu(id);
  if (!cur) return null;
  stmt("UPDATE menus SET pdf_media_id = ?, updated_at = ? WHERE id = ?").run(mediaId, maintenantIso(), id);
  return cur.pdf_media_id && cur.pdf_media_id !== mediaId ? cur.pdf_media_id : null;
}

/** Remplace la couverture. Renvoie l'ID de l'ancienne image, ou `null`. */
export function definirCouvertureMenu(id: number, mediaId: number | null): number | null {
  const cur = lireMenu(id);
  if (!cur) return null;
  stmt("UPDATE menus SET couverture_media_id = ?, updated_at = ? WHERE id = ?").run(mediaId, maintenantIso(), id);
  return cur.couverture_media_id && cur.couverture_media_id !== mediaId ? cur.couverture_media_id : null;
}

/** Supprime un menu (cascade sections et plats). Renvoie la ligne ; le PDF reste à nettoyer par l'appelant. */
export function supprimerMenu(id: number): Menu | null {
  const l = stmt("DELETE FROM menus WHERE id = ? RETURNING *").get(id) as LigneMenu | undefined;
  return l ? versMenu(l) : null;
}

export function ordonnerMenus(ids: number[]): void {
  const existants = new Set(listerMenus().map((m) => m.id));
  const maj = stmt("UPDATE menus SET position = ? WHERE id = ?");
  transaction(() => ids.filter((i) => existants.has(i)).forEach((id, i) => maj.run(i + 1, id)));
}

export function deplacerMenu(id: number, sens: "haut" | "bas"): void {
  ordonnerMenus(echangerDansListe(listerMenus().map((m) => m.id), id, sens));
}

/**
 * Duplique un menu complet (sections et plats) pour l'année suivante. Le
 * double est MASQUÉ, sans PDF ni fenêtre de publication : à relire avant de publier.
 */
export function dupliquerMenu(id: number, opts: { titre?: string; slug?: string } = {}): Menu | null {
  const source = menuComplet(id);
  if (!source) return null;
  return transaction(() => {
    const titre = opts.titre?.trim() || `${source.titre} (copie)`;
    const copie = creerMenu({
      slug: opts.slug || titre,
      type: source.type,
      titre,
      sous_titre: source.sous_titre,
      intro: source.intro,
      note_bas: source.note_bas,
      infos_commande: source.infos_commande,
      visible: false,
    });
    for (const s of source.sections) {
      const ns = creerSection(copie.id, { titre: s.titre, note: s.note, mise_en_avant: s.mise_en_avant, visible: s.visible });
      for (const p of s.plats) creerPlat(ns.id, { nom: p.nom, description: p.description, prix: p.prix, unite: p.unite, badge: p.badge, visible: p.visible });
    }
    return lireMenu(copie.id);
  });
}

/**
 * Met en ligne un menu permanent comme carte traiteur (page /carte-traiteur),
 * par exemple la carte 2028 préparée par duplication de la carte 2027.
 * L'ancienne carte est conservée, masquée, sous une adresse tirée de son titre
 * (« carte-traiteur-2027 »). Transaction : jamais deux cartes ni aucune.
 */
export function remplacerCarteTraiteur(id: number): { nouvelle: Menu; ancienne: Menu | null } | null {
  const cible = lireMenu(id);
  if (!cible || cible.type !== "permanent" || cible.slug === SLUG_CARTE_TRAITEUR) return null;
  return transaction(() => {
    const ancienne = lireMenuParSlug(SLUG_CARTE_TRAITEUR);
    const maj = maintenantIso();
    if (ancienne) {
      // Adresse provisoire pour libérer « carte-traiteur » avant de calculer la définitive.
      stmt("UPDATE menus SET slug = ?, visible = 0, updated_at = ? WHERE id = ?").run(`archive-${ancienne.id}-${Date.now()}`, maj, ancienne.id);
      const base = slugifier(ancienne.titre) === SLUG_CARTE_TRAITEUR ? `${ancienne.titre} ancienne` : ancienne.titre;
      stmt("UPDATE menus SET slug = ? WHERE id = ?").run(slugMenuUnique(base, ancienne.id), ancienne.id);
    }
    stmt("UPDATE menus SET slug = ?, visible = 1, updated_at = ? WHERE id = ?").run(SLUG_CARTE_TRAITEUR, maj, id);
    return { nouvelle: lireMenu(id)!, ancienne: ancienne ? lireMenu(ancienne.id) : null };
  });
}

// ---------------------------------------------------------------------------
// Lecture complète (pages publiques et BO)
// ---------------------------------------------------------------------------

/**
 * Menu avec ses sections et plats. `visiblesSeulement` (site public) : sections
 * et plats masqués retirés, sections vides retirées.
 */
export function menuComplet(idOuMenu: number | Menu, opts: { visiblesSeulement?: boolean } = {}): MenuComplet | null {
  const menu = typeof idOuMenu === "number" ? lireMenu(idOuMenu) : idOuMenu;
  if (!menu) return null;
  const sections = (stmt("SELECT * FROM menu_sections WHERE menu_id = ? ORDER BY position, id").all(menu.id) as LigneSection[]).map(versSection);
  const plats = (
    stmt(
      `SELECT p.* FROM menu_plats p JOIN menu_sections s ON s.id = p.section_id WHERE s.menu_id = ? ORDER BY p.position, p.id`,
    ).all(menu.id) as LignePlat[]
  ).map(versPlat);
  const parSection = new Map<number, Plat[]>();
  for (const p of plats) {
    if (opts.visiblesSeulement && !p.visible) continue;
    parSection.set(p.section_id, [...(parSection.get(p.section_id) ?? []), p]);
  }
  let avecPlats: SectionAvecPlats[] = sections.map((s) => ({ ...s, plats: parSection.get(s.id) ?? [] }));
  if (opts.visiblesSeulement) avecPlats = avecPlats.filter((s) => s.visible && s.plats.length > 0);
  const medias = lireMedias([menu.pdf_media_id, menu.couverture_media_id].filter((x): x is number => !!x));
  return {
    ...menu,
    sections: avecPlats,
    pdf: menu.pdf_media_id ? versDocument(medias.get(menu.pdf_media_id)) : null,
    couverture: menu.couverture_media_id ? versImage(medias.get(menu.couverture_media_id)) : null,
  };
}

/** Menu publié par son slug (visible, contenu visible seulement), ou `null`. */
export function menuPublic(slug: string): MenuComplet | null {
  const m = lireMenuParSlug(slug);
  if (!m || !m.visible) return null;
  return menuComplet(m, { visiblesSeulement: true });
}

/** La carte traiteur permanente (page /carte-traiteur), ou `null`. */
export function carteTraiteur(): MenuComplet | null {
  return menuPublic(SLUG_CARTE_TRAITEUR);
}

/** Menus de saison visibles dont la fenêtre de publication couvre `jour` (page /menus-de-fetes). */
export function menusDeSaisonEnCours(jour: string = jourParis()): MenuComplet[] {
  return listerMenus({ type: "saison" })
    .filter((m) => m.visible && dansFenetre(jour, m.publie_du, m.publie_au))
    .map((m) => menuComplet(m, { visiblesSeulement: true }))
    .filter((m): m is MenuComplet => !!m && m.sections.length > 0);
}

/** PDF d'un menu, ou `null`. */
export function pdfMenu(menu: Pick<Menu, "pdf_media_id">): DocumentMedia | null {
  return lireDocument(menu.pdf_media_id);
}

export function compterMenus(): { menus: number; sections: number; plats: number } {
  return stmt(
    "SELECT (SELECT COUNT(*) FROM menus) AS menus, (SELECT COUNT(*) FROM menu_sections) AS sections, (SELECT COUNT(*) FROM menu_plats) AS plats",
  ).get() as { menus: number; sections: number; plats: number };
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

export function listerSections(menuId: number): Section[] {
  return (stmt("SELECT * FROM menu_sections WHERE menu_id = ? ORDER BY position, id").all(menuId) as LigneSection[]).map(versSection);
}

export function lireSection(id: number): Section | null {
  const l = stmt("SELECT * FROM menu_sections WHERE id = ?").get(id) as LigneSection | undefined;
  return l ? versSection(l) : null;
}

export function validerSection(e: Partial<Record<keyof EntreeSection, unknown>>):
  | { ok: true; donnees: EntreeSection }
  | { ok: false; erreurs: Partial<Record<keyof EntreeSection, string>> } {
  const titre = nettoyer(e.titre, LIMITES_MENU.section_titre);
  if (!titre) return { ok: false, erreurs: { titre: "Donnez un titre à la section." } };
  return {
    ok: true,
    donnees: { titre, note: nettoyer(e.note, LIMITES_MENU.section_note), mise_en_avant: e.mise_en_avant === true, visible: e.visible !== false },
  };
}

export function creerSection(menuId: number, e: EntreeSection): Section {
  const pos = (stmt("SELECT COALESCE(MAX(position), 0) + 1 AS p FROM menu_sections WHERE menu_id = ?").get(menuId) as { p: number }).p;
  const res = stmt("INSERT INTO menu_sections (menu_id, titre, note, mise_en_avant, position, visible) VALUES (?, ?, ?, ?, ?, ?)").run(
    menuId,
    nettoyer(e.titre, LIMITES_MENU.section_titre),
    nettoyer(e.note, LIMITES_MENU.section_note),
    e.mise_en_avant ? 1 : 0,
    pos,
    e.visible === false ? 0 : 1,
  );
  toucherMenu(menuId);
  return lireSection(Number(res.lastInsertRowid))!;
}

export function modifierSection(id: number, patch: Partial<EntreeSection>): Section | null {
  const cur = lireSection(id);
  if (!cur) return null;
  stmt("UPDATE menu_sections SET titre = ?, note = ?, mise_en_avant = ?, visible = ? WHERE id = ?").run(
    patch.titre !== undefined ? nettoyer(patch.titre, LIMITES_MENU.section_titre) || cur.titre : cur.titre,
    patch.note !== undefined ? nettoyer(patch.note, LIMITES_MENU.section_note) : cur.note,
    (patch.mise_en_avant ?? cur.mise_en_avant) ? 1 : 0,
    (patch.visible ?? cur.visible) ? 1 : 0,
    id,
  );
  toucherMenu(cur.menu_id);
  return lireSection(id);
}

export function definirSectionVisible(id: number, visible: boolean): void {
  modifierSection(id, { visible });
}

/** Supprime une section (cascade plats). Renvoie la ligne. */
export function supprimerSection(id: number): Section | null {
  const l = stmt("DELETE FROM menu_sections WHERE id = ? RETURNING *").get(id) as LigneSection | undefined;
  if (l) toucherMenu(l.menu_id);
  return l ? versSection(l) : null;
}

/** Réordonne les sections d'un menu (IDs étrangers au menu ignorés). */
export function ordonnerSections(menuId: number, ids: number[]): void {
  const du = new Set(listerSections(menuId).map((s) => s.id));
  const maj = stmt("UPDATE menu_sections SET position = ? WHERE id = ? AND menu_id = ?");
  transaction(() => ids.filter((i) => du.has(i)).forEach((id, i) => maj.run(i + 1, id, menuId)));
  toucherMenu(menuId);
}

export function deplacerSection(id: number, sens: "haut" | "bas"): void {
  const s = lireSection(id);
  if (!s) return;
  ordonnerSections(s.menu_id, echangerDansListe(listerSections(s.menu_id).map((x) => x.id), id, sens));
}

// ---------------------------------------------------------------------------
// Plats
// ---------------------------------------------------------------------------

export function listerPlats(sectionId: number): Plat[] {
  return (stmt("SELECT * FROM menu_plats WHERE section_id = ? ORDER BY position, id").all(sectionId) as LignePlat[]).map(versPlat);
}

export function lirePlat(id: number): Plat | null {
  const l = stmt("SELECT * FROM menu_plats WHERE id = ?").get(id) as LignePlat | undefined;
  return l ? versPlat(l) : null;
}

/** Menu auquel appartient un plat (bornage des actions du BO). */
export function menuDuPlat(platId: number): number | null {
  const l = stmt("SELECT s.menu_id FROM menu_plats p JOIN menu_sections s ON s.id = p.section_id WHERE p.id = ?").get(platId) as
    | { menu_id: number }
    | undefined;
  return l?.menu_id ?? null;
}

export function validerPlat(e: Partial<Record<keyof EntreePlat, unknown>>):
  | { ok: true; donnees: EntreePlat }
  | { ok: false; erreurs: Partial<Record<keyof EntreePlat, string>> } {
  const erreurs: Partial<Record<keyof EntreePlat, string>> = {};
  const nom = nettoyer(e.nom, LIMITES_MENU.plat_nom);
  if (!nom) erreurs.nom = "Indiquez le nom du plat.";
  if (e.badge && !estBadge(e.badge)) erreurs.badge = "Étiquette inconnue.";
  const prix = validerPrix(e.prix);
  if (!prix.ok) erreurs.prix = prix.erreur;
  if (Object.keys(erreurs).length || !prix.ok) return { ok: false, erreurs };
  return {
    ok: true,
    donnees: {
      nom,
      description: multiligne(e.description, LIMITES_MENU.plat_description),
      prix: prix.prix,
      unite: nettoyer(e.unite, LIMITES_MENU.unite),
      badge: estBadge(e.badge) ? e.badge : null,
      visible: e.visible !== false,
    },
  };
}

export function creerPlat(sectionId: number, e: EntreePlat): Plat {
  const pos = (stmt("SELECT COALESCE(MAX(position), 0) + 1 AS p FROM menu_plats WHERE section_id = ?").get(sectionId) as { p: number }).p;
  const res = stmt(
    "INSERT INTO menu_plats (section_id, nom, description, prix, unite, badge, position, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  ).run(
    sectionId,
    nettoyer(e.nom, LIMITES_MENU.plat_nom),
    multiligne(e.description, LIMITES_MENU.plat_description),
    normaliserPrix(e.prix ?? ""),
    nettoyer(e.unite, LIMITES_MENU.unite),
    estBadge(e.badge) ? e.badge : null,
    pos,
    e.visible === false ? 0 : 1,
  );
  toucherMenuDeSection(sectionId);
  return lirePlat(Number(res.lastInsertRowid))!;
}

/** Modifie un plat. Changement de section (même menu ou non) : placé en fin. */
export function modifierPlat(id: number, patch: Partial<EntreePlat> & { section_id?: number }): Plat | null {
  const cur = lirePlat(id);
  if (!cur) return null;
  let sectionId = cur.section_id;
  let position = cur.position;
  if (patch.section_id && patch.section_id !== cur.section_id && lireSection(patch.section_id)) {
    sectionId = patch.section_id;
    position = (stmt("SELECT COALESCE(MAX(position), 0) + 1 AS p FROM menu_plats WHERE section_id = ?").get(sectionId) as { p: number }).p;
  }
  stmt(
    "UPDATE menu_plats SET section_id = ?, nom = ?, description = ?, prix = ?, unite = ?, badge = ?, position = ?, visible = ? WHERE id = ?",
  ).run(
    sectionId,
    patch.nom !== undefined ? nettoyer(patch.nom, LIMITES_MENU.plat_nom) || cur.nom : cur.nom,
    patch.description !== undefined ? multiligne(patch.description, LIMITES_MENU.plat_description) : cur.description,
    patch.prix !== undefined ? normaliserPrix(patch.prix) : cur.prix,
    patch.unite !== undefined ? nettoyer(patch.unite, LIMITES_MENU.unite) : cur.unite,
    patch.badge !== undefined ? (estBadge(patch.badge) ? patch.badge : null) : cur.badge,
    position,
    (patch.visible ?? cur.visible) ? 1 : 0,
    id,
  );
  toucherMenuDeSection(sectionId);
  return lirePlat(id);
}

/** Raccourci « Changer un prix » du tableau de bord. */
export function modifierPrixPlat(id: number, prix: string): Plat | null {
  return modifierPlat(id, { prix });
}

export function definirPlatVisible(id: number, visible: boolean): void {
  modifierPlat(id, { visible });
}

/** Supprime un plat. Renvoie la ligne. */
export function supprimerPlat(id: number): Plat | null {
  const l = stmt("DELETE FROM menu_plats WHERE id = ? RETURNING *").get(id) as LignePlat | undefined;
  if (l) toucherMenuDeSection(l.section_id);
  return l ? versPlat(l) : null;
}

/** Réordonne les plats d'une section (IDs étrangers à la section ignorés). */
export function ordonnerPlats(sectionId: number, ids: number[]): void {
  const de = new Set(listerPlats(sectionId).map((p) => p.id));
  const maj = stmt("UPDATE menu_plats SET position = ? WHERE id = ? AND section_id = ?");
  transaction(() => ids.filter((i) => de.has(i)).forEach((id, i) => maj.run(i + 1, id, sectionId)));
  toucherMenuDeSection(sectionId);
}

export function deplacerPlat(id: number, sens: "haut" | "bas"): void {
  const p = lirePlat(id);
  if (!p) return;
  ordonnerPlats(p.section_id, echangerDansListe(listerPlats(p.section_id).map((x) => x.id), id, sens));
}

/** Recherche de plats par nom (raccourci « Changer un prix »). */
export function rechercherPlats(texte: string, limite = 30): (Plat & { menu_id: number; menu_titre: string; section_titre: string })[] {
  const q = texte.trim().replace(/[\\%_]/g, (c) => `\\${c}`);
  if (!q) return [];
  return (
    stmt(
      `SELECT p.*, s.menu_id, m.titre AS menu_titre, s.titre AS section_titre
       FROM menu_plats p JOIN menu_sections s ON s.id = p.section_id JOIN menus m ON m.id = s.menu_id
       WHERE p.nom LIKE '%' || ? || '%' ESCAPE '\\' ORDER BY m.position, s.position, p.position LIMIT ?`,
    ).all(q, Math.min(Math.max(limite, 1), 100)) as (LignePlat & { menu_id: number; menu_titre: string; section_titre: string })[]
  ).map((l) => ({ ...versPlat(l), menu_id: l.menu_id, menu_titre: l.menu_titre, section_titre: l.section_titre }));
}

// ---------------------------------------------------------------------------
// Import (seed)
// ---------------------------------------------------------------------------

export type ImportSection = EntreeSection & { plats: EntreePlat[] };

/** Remplace tout le contenu (sections et plats) d'un menu, en transaction. */
export function remplacerContenuMenu(menuId: number, sections: ImportSection[]): { sections: number; plats: number } {
  return transaction(() => {
    stmt("DELETE FROM menu_sections WHERE menu_id = ?").run(menuId);
    let plats = 0;
    for (const s of sections) {
      const ns = creerSection(menuId, s);
      for (const p of s.plats) {
        creerPlat(ns.id, p);
        plats++;
      }
    }
    return { sections: sections.length, plats };
  });
}

function toucherMenu(menuId: number): void {
  stmt("UPDATE menus SET updated_at = ? WHERE id = ?").run(maintenantIso(), menuId);
}

function toucherMenuDeSection(sectionId: number): void {
  const s = stmt("SELECT menu_id FROM menu_sections WHERE id = ?").get(sectionId) as { menu_id: number } | undefined;
  if (s) toucherMenu(s.menu_id);
}
