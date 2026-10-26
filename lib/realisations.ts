/**
 * Réalisations (table `realisations`) : galerie publique filtrable par catégorie.
 * Le texte alternatif est porté par le MÉDIA (`modifierAltMedia`).
 */

import { bool, stmt, transaction } from "./db";
import { echangerDansListe } from "./ordre";
import { lireMedias, supprimerMediaSiOrphelinHorsSeed, versImage, type StatutMedia } from "./media";
import type { ImageMedia } from "./media-url";

export const CATEGORIES_REALISATION = ["mariage", "cocktail", "buffet", "broche-barbecue", "plateaux", "boucherie"] as const;
export type CategorieRealisation = (typeof CATEGORIES_REALISATION)[number];

export const LIBELLES_CATEGORIES: Record<CategorieRealisation, string> = {
  mariage: "Mariages",
  cocktail: "Cocktails",
  buffet: "Buffets",
  "broche-barbecue": "Broche et barbecue",
  plateaux: "Plateaux",
  boucherie: "Boucherie",
};

export const LIMITE_LEGENDE = 200;

export type Realisation = {
  id: number;
  media_id: number;
  legende: string;
  categorie: CategorieRealisation;
  position: number;
  visible: boolean;
};

/** Pour le site : image prête garantie. */
export type RealisationPublique = Realisation & { image: ImageMedia };

/** Pour le BO : statut du média et image si prête. */
export type RealisationAdmin = Realisation & { statut_media: StatutMedia; alt: string; provisoire: boolean; image: ImageMedia | null };

type Ligne = Omit<Realisation, "visible"> & { visible: number };
const versRealisation = (l: Ligne): Realisation => ({ ...l, visible: bool(l.visible) });

export function estCategorieRealisation(v: unknown): v is CategorieRealisation {
  return typeof v === "string" && (CATEGORIES_REALISATION as readonly string[]).includes(v);
}

/** Galerie publique (visibles et prêtes), filtrable par catégorie. */
export function listerRealisationsPubliques(categorie?: CategorieRealisation, limite = 500): RealisationPublique[] {
  const lignes = stmt(
    `SELECT r.* FROM realisations r JOIN media m ON m.id = r.media_id
     WHERE r.visible = 1 AND m.statut = 'ready' AND (@cat = '' OR r.categorie = @cat)
     ORDER BY r.position, r.id LIMIT @limite`,
  ).all({ cat: categorie ?? "", limite }) as Ligne[];
  const medias = lireMedias(lignes.map((l) => l.media_id));
  return lignes
    .map((l) => ({ ...versRealisation(l), image: versImage(medias.get(l.media_id)) }))
    .filter((r): r is RealisationPublique => r.image !== null);
}

/** Catégories ayant au moins une réalisation publique (filtres du site). */
export function categoriesUtilisees(): { categorie: CategorieRealisation; libelle: string; nombre: number }[] {
  const lignes = stmt(
    `SELECT r.categorie, COUNT(*) AS n FROM realisations r JOIN media m ON m.id = r.media_id
     WHERE r.visible = 1 AND m.statut = 'ready' GROUP BY r.categorie`,
  ).all() as { categorie: CategorieRealisation; n: number }[];
  const parCat = new Map(lignes.map((l) => [l.categorie, l.n]));
  return CATEGORIES_REALISATION.filter((c) => parCat.has(c)).map((c) => ({ categorie: c, libelle: LIBELLES_CATEGORIES[c], nombre: parCat.get(c)! }));
}

export function listerRealisationsAdmin(): RealisationAdmin[] {
  const lignes = stmt("SELECT * FROM realisations ORDER BY position, id").all() as Ligne[];
  const medias = lireMedias(lignes.map((l) => l.media_id));
  return lignes.map((l) => {
    const m = medias.get(l.media_id);
    return {
      ...versRealisation(l),
      statut_media: m?.statut ?? "error",
      alt: m?.alt ?? "",
      provisoire: m?.provisoire ?? false,
      image: versImage(m),
    };
  });
}

export function lireRealisation(id: number): Realisation | null {
  const l = stmt("SELECT * FROM realisations WHERE id = ?").get(id) as Ligne | undefined;
  return l ? versRealisation(l) : null;
}

export function realisationDuMedia(mediaId: number): Realisation | null {
  const l = stmt("SELECT * FROM realisations WHERE media_id = ? ORDER BY id LIMIT 1").get(mediaId) as Ligne | undefined;
  return l ? versRealisation(l) : null;
}

export function creerRealisation(e: { media_id: number; legende?: string; categorie?: CategorieRealisation; visible?: boolean }): Realisation {
  const pos = (stmt("SELECT COALESCE(MAX(position), 0) + 1 AS p FROM realisations").get() as { p: number }).p;
  const res = stmt("INSERT INTO realisations (media_id, legende, categorie, position, visible) VALUES (?, ?, ?, ?, ?)").run(
    e.media_id,
    (e.legende ?? "").replace(/\s+/g, " ").trim().slice(0, LIMITE_LEGENDE),
    e.categorie && estCategorieRealisation(e.categorie) ? e.categorie : "buffet",
    pos,
    e.visible === false ? 0 : 1,
  );
  return lireRealisation(Number(res.lastInsertRowid))!;
}

export function modifierRealisation(
  id: number,
  patch: { legende?: string; categorie?: CategorieRealisation; visible?: boolean },
): Realisation | null {
  const cur = lireRealisation(id);
  if (!cur) return null;
  stmt("UPDATE realisations SET legende = ?, categorie = ?, visible = ? WHERE id = ?").run(
    patch.legende !== undefined ? patch.legende.replace(/\s+/g, " ").trim().slice(0, LIMITE_LEGENDE) : cur.legende,
    patch.categorie && estCategorieRealisation(patch.categorie) ? patch.categorie : cur.categorie,
    (patch.visible ?? cur.visible) ? 1 : 0,
    id,
  );
  return lireRealisation(id);
}

/**
 * Supprime la réalisation. Le média et ses fichiers sont supprimés aussi
 * s'il ne sert plus ailleurs (emplacement, menu, article) et ne vient pas du
 * seed (photo de départ : gardée dans la médiathèque). Renvoie la ligne.
 */
export function supprimerRealisation(id: number): Realisation | null {
  const l = stmt("DELETE FROM realisations WHERE id = ? RETURNING *").get(id) as Ligne | undefined;
  if (!l) return null;
  supprimerMediaSiOrphelinHorsSeed(l.media_id);
  return versRealisation(l);
}

export function ordonnerRealisations(ids: number[]): void {
  const existants = new Set((stmt("SELECT id FROM realisations").all() as { id: number }[]).map((r) => r.id));
  const maj = stmt("UPDATE realisations SET position = ? WHERE id = ?");
  transaction(() => ids.filter((i) => existants.has(i)).forEach((id, i) => maj.run(i + 1, id)));
}

export function deplacerRealisation(id: number, sens: "haut" | "bas"): void {
  const ids = (stmt("SELECT id FROM realisations ORDER BY position, id").all() as { id: number }[]).map((r) => r.id);
  ordonnerRealisations(echangerDansListe(ids, id, sens));
}

export function compterRealisations(): number {
  return (stmt("SELECT COUNT(*) AS n FROM realisations").get() as { n: number }).n;
}
