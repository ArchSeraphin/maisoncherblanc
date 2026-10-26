/**
 * Actualités (table `articles`). Corps en Markdown restreint (lib/markdown.ts),
 * rendu côté serveur sans HTML brut.
 *
 * Visible du public : `statut = 'publie'` ET `publie_le` (horodatage ISO) passé.
 * Un article publié avec une date future est donc PROGRAMMÉ : le site étant en
 * force-dynamic, il apparaît seul à l'heure dite.
 */

import { maintenantIso, stmt } from "./db";
import { lireMedias, versImage } from "./media";
import type { ImageMedia } from "./media-url";
import { estSlug, slugifier } from "./slug";

export type StatutArticle = "brouillon" | "publie";
/** Statut calculé pour l'affichage du BO. */
export type EtatArticle = "brouillon" | "programme" | "publie";

export const LIBELLES_ETAT_ARTICLE: Record<EtatArticle, string> = { brouillon: "Brouillon", programme: "Programmé", publie: "Publié" };

export const LIMITES_ARTICLE = {
  titre: 160,
  chapo: 500,
  corps: 60_000,
  titre_seo: 70,
  description_seo: 170,
  slug: 90,
} as const;

export type Article = {
  id: number;
  slug: string;
  titre: string;
  chapo: string;
  corps: string;
  couverture_media_id: number | null;
  statut: StatutArticle;
  /** Horodatage ISO de publication, `null` pour un brouillon jamais publié. */
  publie_le: string | null;
  titre_seo: string;
  description_seo: string;
  created_at: string;
  updated_at: string;
};

export type ArticleAvecCouverture = Article & { couverture: ImageMedia | null };

export type EntreeArticle = {
  slug?: string;
  titre: string;
  chapo?: string;
  corps?: string;
  couverture_media_id?: number | null;
  statut?: StatutArticle;
  publie_le?: string | null;
  titre_seo?: string;
  description_seo?: string;
};

const EN_LIGNE = "statut = 'publie' AND publie_le IS NOT NULL AND publie_le <= @maintenant";

function avecCouvertures(articles: Article[]): ArticleAvecCouverture[] {
  const medias = lireMedias(articles.map((a) => a.couverture_media_id).filter((x): x is number => !!x));
  return articles.map((a) => ({ ...a, couverture: a.couverture_media_id ? versImage(medias.get(a.couverture_media_id)) : null }));
}

/** État calculé (brouillon / programmé / publié). */
export function etatArticle(a: Pick<Article, "statut" | "publie_le">, maintenant = maintenantIso()): EtatArticle {
  if (a.statut !== "publie" || !a.publie_le) return "brouillon";
  return a.publie_le <= maintenant ? "publie" : "programme";
}

/** Articles en ligne, du plus récent au plus ancien. */
export function listerArticlesPublies(opts: { limite?: number; decalage?: number } = {}): ArticleAvecCouverture[] {
  const lignes = stmt(`SELECT * FROM articles WHERE ${EN_LIGNE} ORDER BY publie_le DESC, id DESC LIMIT @limite OFFSET @decalage`).all({
    maintenant: maintenantIso(),
    limite: Math.min(Math.max(opts.limite ?? 50, 1), 200),
    decalage: Math.max(opts.decalage ?? 0, 0),
  }) as Article[];
  return avecCouvertures(lignes);
}

export function compterArticlesPublies(): number {
  return (stmt(`SELECT COUNT(*) AS n FROM articles WHERE ${EN_LIGNE}`).get({ maintenant: maintenantIso() }) as { n: number }).n;
}

/** Article en ligne par slug (page publique), ou `null`. */
export function articlePublie(slug: string): ArticleAvecCouverture | null {
  const a = stmt(`SELECT * FROM articles WHERE slug = @slug AND ${EN_LIGNE}`).get({ slug, maintenant: maintenantIso() }) as Article | undefined;
  return a ? avecCouvertures([a])[0] : null;
}

/** Tous les articles (BO), brouillons compris. */
export function listerArticlesAdmin(): (ArticleAvecCouverture & { etat: EtatArticle })[] {
  const lignes = stmt("SELECT * FROM articles ORDER BY COALESCE(publie_le, created_at) DESC, id DESC").all() as Article[];
  const maintenant = maintenantIso();
  return avecCouvertures(lignes).map((a) => ({ ...a, etat: etatArticle(a, maintenant) }));
}

export function lireArticle(id: number): Article | null {
  return (stmt("SELECT * FROM articles WHERE id = ?").get(id) as Article | undefined) ?? null;
}

/** Article de tout statut avec couverture (aperçu du BO). */
export function lireArticleComplet(id: number): ArticleAvecCouverture | null {
  const a = lireArticle(id);
  return a ? avecCouvertures([a])[0] : null;
}

export function slugArticleDisponible(slug: string, saufId?: number): boolean {
  const l = stmt("SELECT id FROM articles WHERE slug = ?").get(slug) as { id: number } | undefined;
  return !l || l.id === saufId;
}

export function slugArticleUnique(base: string, saufId?: number): string {
  const racine = slugifier(base, LIMITES_ARTICLE.slug) || "article";
  let slug = racine;
  for (let n = 2; !slugArticleDisponible(slug, saufId); n++) slug = `${racine}-${n}`;
  return slug;
}

/**
 * Valide une saisie du BO. `publie_le` : horodatage ISO ou `AAAA-MM-JJTHH:MM`
 * (heure locale de Paris saisie dans un champ datetime-local, convertie en ISO UTC par l'appelant).
 */
export function validerArticle(e: Partial<Record<keyof EntreeArticle, unknown>>, saufId?: number):
  | { ok: true; donnees: EntreeArticle }
  | { ok: false; erreurs: Partial<Record<keyof EntreeArticle, string>> } {
  const erreurs: Partial<Record<keyof EntreeArticle, string>> = {};
  const t = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const titre = t(e.titre, LIMITES_ARTICLE.titre).replace(/\s+/g, " ");
  if (titre.length < 3) erreurs.titre = "Donnez un titre à l’actualité.";
  const corps = t(e.corps, LIMITES_ARTICLE.corps).replace(/\r\n?/g, "\n");
  const statut: StatutArticle = e.statut === "publie" ? "publie" : "brouillon";
  if (statut === "publie" && corps.length < 20) erreurs.corps = "Le texte est trop court pour être publié.";
  const slugBrut = t(e.slug, LIMITES_ARTICLE.slug);
  const slug = slugBrut ? slugifier(slugBrut, LIMITES_ARTICLE.slug) : undefined;
  if (slugBrut && !estSlug(slug)) erreurs.slug = "Adresse invalide.";
  else if (slug && !slugArticleDisponible(slug, saufId)) erreurs.slug = "Cette adresse est déjà utilisée.";
  let publie_le: string | null = null;
  if (typeof e.publie_le === "string" && e.publie_le) {
    const d = new Date(e.publie_le);
    if (Number.isNaN(d.getTime())) erreurs.publie_le = "Date de publication invalide.";
    else publie_le = d.toISOString();
  }
  const couverture = typeof e.couverture_media_id === "number" && Number.isInteger(e.couverture_media_id) && e.couverture_media_id > 0 ? e.couverture_media_id : null;
  if (Object.keys(erreurs).length) return { ok: false, erreurs };
  return {
    ok: true,
    donnees: {
      slug,
      titre,
      chapo: t(e.chapo, LIMITES_ARTICLE.chapo).replace(/\s+/g, " "),
      corps,
      couverture_media_id: couverture,
      statut,
      publie_le,
      titre_seo: t(e.titre_seo, LIMITES_ARTICLE.titre_seo).replace(/\s+/g, " "),
      description_seo: t(e.description_seo, LIMITES_ARTICLE.description_seo).replace(/\s+/g, " "),
    },
  };
}

/** Date de publication à enregistrer : saisie, sinon conservée si déjà publié, sinon maintenant. */
function datePublication(e: EntreeArticle, actuel: Article | null): string | null {
  if (e.statut !== "publie") return e.publie_le ?? actuel?.publie_le ?? null;
  if (e.publie_le) return e.publie_le;
  if (actuel?.statut === "publie" && actuel.publie_le) return actuel.publie_le;
  return maintenantIso();
}

export function creerArticle(e: EntreeArticle): Article {
  const res = stmt(
    `INSERT INTO articles (slug, titre, chapo, corps, couverture_media_id, statut, publie_le, titre_seo, description_seo)
     VALUES (@slug, @titre, @chapo, @corps, @couverture, @statut, @publie_le, @titre_seo, @description_seo)`,
  ).run({
    slug: slugArticleUnique(e.slug || e.titre),
    titre: e.titre,
    chapo: e.chapo ?? "",
    corps: e.corps ?? "",
    couverture: e.couverture_media_id ?? null,
    statut: e.statut ?? "brouillon",
    publie_le: datePublication(e, null),
    titre_seo: e.titre_seo ?? "",
    description_seo: e.description_seo ?? "",
  });
  return lireArticle(Number(res.lastInsertRowid))!;
}

export function modifierArticle(id: number, e: EntreeArticle): Article | null {
  const cur = lireArticle(id);
  if (!cur) return null;
  stmt(
    `UPDATE articles SET slug = @slug, titre = @titre, chapo = @chapo, corps = @corps, couverture_media_id = @couverture,
       statut = @statut, publie_le = @publie_le, titre_seo = @titre_seo, description_seo = @description_seo, updated_at = @maj
     WHERE id = @id`,
  ).run({
    id,
    slug: e.slug ? slugArticleUnique(e.slug, id) : cur.slug,
    titre: e.titre,
    chapo: e.chapo ?? cur.chapo,
    corps: e.corps ?? cur.corps,
    couverture: e.couverture_media_id === undefined ? cur.couverture_media_id : e.couverture_media_id,
    statut: e.statut ?? cur.statut,
    publie_le: datePublication({ ...e, statut: e.statut ?? cur.statut }, cur),
    titre_seo: e.titre_seo ?? cur.titre_seo,
    description_seo: e.description_seo ?? cur.description_seo,
    maj: maintenantIso(),
  });
  return lireArticle(id);
}

/** Publie (date conservée si déjà publiée, sinon maintenant) ou repasse en brouillon. */
export function definirStatutArticle(id: number, statut: StatutArticle): Article | null {
  const cur = lireArticle(id);
  if (!cur) return null;
  const publie_le = statut === "publie" ? (cur.publie_le ?? maintenantIso()) : cur.publie_le;
  stmt("UPDATE articles SET statut = ?, publie_le = ?, updated_at = ? WHERE id = ?").run(statut, publie_le, maintenantIso(), id);
  return lireArticle(id);
}

/** Supprime un article. Renvoie la ligne (la couverture reste à nettoyer : `supprimerMediaSiOrphelin`). */
export function supprimerArticle(id: number): Article | null {
  return (stmt("DELETE FROM articles WHERE id = ? RETURNING *").get(id) as Article | undefined) ?? null;
}

export function compterArticles(): { total: number; publies: number; brouillons: number } {
  return stmt(
    `SELECT COUNT(*) AS total, SUM(CASE WHEN statut = 'publie' THEN 1 ELSE 0 END) AS publies,
            SUM(CASE WHEN statut = 'brouillon' THEN 1 ELSE 0 END) AS brouillons FROM articles`,
  ).get() as { total: number; publies: number; brouillons: number };
}

/** Pour le sitemap : slug et date de dernière modification des articles en ligne. */
export function articlesPourSitemap(): { slug: string; updated_at: string }[] {
  return stmt(`SELECT slug, updated_at FROM articles WHERE ${EN_LIGNE} ORDER BY publie_le DESC`).all({ maintenant: maintenantIso() }) as {
    slug: string;
    updated_at: string;
  }[];
}

