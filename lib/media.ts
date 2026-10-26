/**
 * Médias (table `media`) et file d'attente de traitement (table `jobs`).
 *
 * Stockage disque (UPLOADS_DIR, persistant, hors build) :
 * - `tmp/<uuid>.<ext>` : bruts en attente de traitement, JAMAIS servis ;
 * - `<mediaId>/w480.webp`, `w960.webp`, ... + `original.jpg` : variantes d'une image ;
 * - `<mediaId>/<nom>.pdf` : documents (cartes, menus).
 *
 * La base cascade les LIGNES (realisations, jobs ; menus et articles passent à
 * NULL), pas les FICHIERS : utiliser `supprimerMediaEtFichiers()`.
 */

import fs from "node:fs";
import path from "node:path";
import { bool, lireJson, maintenantIso, stmt, transaction } from "./db";
import { dossierUploads } from "./env";
import { urlMedia, type DocumentMedia, type ImageMedia, type VariantesMedia } from "./media-url";

export type StatutMedia = "pending" | "processing" | "ready" | "error";
export type TypeMedia = "image" | "document";

export type Media = {
  id: number;
  nom_original: string;
  alt: string;
  largeur: number | null;
  hauteur: number | null;
  variantes: VariantesMedia | null;
  statut: StatutMedia;
  type: TypeMedia;
  provisoire: boolean;
  mime: string;
  poids: number;
  /** Clé d'import (seed : "photos/nom.jpg"), `null` pour un envoi du BO. */
  source: string | null;
  created_at: string;
};

export type Job = {
  id: number;
  media_id: number;
  statut: "pending" | "processing" | "error";
  tentatives: number;
  erreur: string | null;
  chemin_brut: string | null;
  verrouille_le: string | null;
  created_at: string;
};

type LigneMedia = Omit<Media, "variantes" | "provisoire"> & { variantes: string | null; provisoire: number };

function versMedia(r: LigneMedia): Media {
  return { ...r, provisoire: bool(r.provisoire), variantes: lireJson<VariantesMedia | null>(r.variantes, null) };
}

// ---------------------------------------------------------------------------
// Lecture
// ---------------------------------------------------------------------------

export function lireMedia(id: number): Media | null {
  const r = stmt("SELECT * FROM media WHERE id = ?").get(id) as LigneMedia | undefined;
  return r ? versMedia(r) : null;
}

export function lireMediaParSource(source: string): Media | null {
  const r = stmt("SELECT * FROM media WHERE source = ?").get(source) as LigneMedia | undefined;
  return r ? versMedia(r) : null;
}

/** Plusieurs médias en une requête (Map id -> média). */
export function lireMedias(ids: readonly number[]): Map<number, Media> {
  const uniques = [...new Set(ids.filter((i) => Number.isInteger(i) && i > 0))];
  const out = new Map<number, Media>();
  if (!uniques.length) return out;
  const marques = uniques.map(() => "?").join(",");
  const lignes = stmt(`SELECT * FROM media WHERE id IN (${marques})`).all(...uniques) as LigneMedia[];
  for (const l of lignes) out.set(l.id, versMedia(l));
  return out;
}

export function listerMedias(opts: { statut?: StatutMedia; type?: TypeMedia; limite?: number } = {}): Media[] {
  const limite = Math.min(Math.max(opts.limite ?? 200, 1), 1000);
  const lignes = stmt(
    `SELECT * FROM media WHERE (@statut = '' OR statut = @statut) AND (@type = '' OR type = @type)
     ORDER BY id DESC LIMIT @limite`,
  ).all({ statut: opts.statut ?? "", type: opts.type ?? "", limite }) as LigneMedia[];
  return lignes.map(versMedia);
}

/** Image prête à l'affichage, ou `null` (absente, en cours, en erreur, ou document). */
export function versImage(m: Media | null | undefined): ImageMedia | null {
  if (!m || m.statut !== "ready" || !m.variantes || m.variantes.type !== "image") return null;
  return {
    id: m.id,
    alt: m.alt,
    largeur: m.largeur ?? m.variantes.original.largeur,
    hauteur: m.hauteur ?? m.variantes.original.hauteur,
    provisoire: m.provisoire,
    variantes: m.variantes,
  };
}

export function lireImage(id: number | null | undefined): ImageMedia | null {
  return id ? versImage(lireMedia(id)) : null;
}

/** Document prêt (PDF), ou `null`. */
export function versDocument(m: Media | null | undefined): DocumentMedia | null {
  if (!m || m.statut !== "ready" || !m.variantes || m.variantes.type !== "document") return null;
  const url = urlMedia(m.variantes.chemin);
  return {
    id: m.id,
    nom: path.basename(m.variantes.chemin),
    url,
    urlTelechargement: `${url}?download=1`,
    poids: m.variantes.poids,
    mime: m.variantes.mime,
  };
}

export function lireDocument(id: number | null | undefined): DocumentMedia | null {
  return id ? versDocument(lireMedia(id)) : null;
}

/** Statut léger pour le suivi (polling) du backoffice. */
export function statutMedia(id: number): { id: number; statut: StatutMedia; erreur: string | null } | null {
  const m = stmt("SELECT id, statut FROM media WHERE id = ?").get(id) as { id: number; statut: StatutMedia } | undefined;
  if (!m) return null;
  const job = stmt("SELECT erreur FROM jobs WHERE media_id = ? ORDER BY id DESC LIMIT 1").get(id) as
    | { erreur: string | null }
    | undefined;
  return { id: m.id, statut: m.statut, erreur: job?.erreur ?? null };
}

// ---------------------------------------------------------------------------
// Écriture
// ---------------------------------------------------------------------------

/** Crée un média image en attente + son job (transaction). */
export function creerMediaEnAttente(entree: {
  nom_original: string;
  mime: string;
  poids: number;
  alt?: string;
  provisoire?: boolean;
  source?: string | null;
  chemin_brut: string;
}): { media: Media; jobId: number } {
  return transaction(() => {
    const res = stmt(
      `INSERT INTO media (nom_original, alt, statut, type, provisoire, mime, poids, source)
       VALUES (?, ?, 'pending', 'image', ?, ?, ?, ?)`,
    ).run(
      entree.nom_original.slice(0, 255),
      (entree.alt ?? "").trim().slice(0, 300),
      entree.provisoire ? 1 : 0,
      entree.mime,
      entree.poids,
      entree.source ?? null,
    );
    const mediaId = Number(res.lastInsertRowid);
    const job = stmt(`INSERT INTO jobs (media_id, statut, chemin_brut) VALUES (?, 'pending', ?)`).run(mediaId, entree.chemin_brut);
    return { media: lireMedia(mediaId)!, jobId: Number(job.lastInsertRowid) };
  });
}

/**
 * Document (PDF) prêt immédiatement. `placer(cheminRelatif)` met le fichier en
 * place (renommage depuis `tmp/`) DANS la transaction : la ligne n'est jamais
 * `ready` sans son fichier. Si `placer` lève, la ligne est annulée et le dossier
 * `<id>/` éventuellement créé est supprimé.
 */
export function creerMediaDocument(entree: {
  nom_original: string;
  mime: string;
  poids: number;
  alt?: string;
  source?: string | null;
  construireChemin: (mediaId: number) => string;
  placer: (cheminRelatif: string) => void;
}): Media {
  let idReserve: number | null = null;
  try {
    return transaction(() => {
      const res = stmt(
        `INSERT INTO media (nom_original, alt, statut, type, mime, poids, source) VALUES (?, ?, 'processing', 'document', ?, ?, ?)`,
      ).run(entree.nom_original.slice(0, 255), (entree.alt ?? "").trim().slice(0, 300), entree.mime, entree.poids, entree.source ?? null);
      const id = Number(res.lastInsertRowid);
      idReserve = id;
      const rel = entree.construireChemin(id);
      entree.placer(rel);
      const variantes: VariantesMedia = { type: "document", chemin: rel, mime: entree.mime, poids: entree.poids };
      stmt(`UPDATE media SET statut = 'ready', variantes = ? WHERE id = ?`).run(JSON.stringify(variantes), id);
      return lireMedia(id)!;
    });
  } catch (err) {
    if (idReserve !== null) supprimerFichiersMedia(idReserve);
    throw err;
  }
}

export function modifierAltMedia(id: number, alt: string): Media | null {
  stmt("UPDATE media SET alt = ? WHERE id = ?").run(alt.replace(/\s+/g, " ").trim().slice(0, 300), id);
  return lireMedia(id);
}

/** Marque (ou démarque) un visuel comme provisoire (visuel IA à remplacer). */
export function definirProvisoire(id: number, provisoire: boolean): void {
  stmt("UPDATE media SET provisoire = ? WHERE id = ?").run(provisoire ? 1 : 0, id);
}

export function definirStatutMedia(id: number, statut: StatutMedia): void {
  stmt("UPDATE media SET statut = ? WHERE id = ?").run(statut, id);
}

export function marquerMediaPret(id: number, d: { largeur: number; hauteur: number; variantes: VariantesMedia }): void {
  stmt(`UPDATE media SET statut = 'ready', largeur = ?, hauteur = ?, variantes = ? WHERE id = ?`).run(
    d.largeur,
    d.hauteur,
    JSON.stringify(d.variantes),
    id,
  );
}

/** Supprime la ligne média (cascade realisations/jobs ; menus et articles -> NULL). Renvoie la ligne. */
export function supprimerMedia(id: number): Media | null {
  const r = stmt("DELETE FROM media WHERE id = ? RETURNING *").get(id) as LigneMedia | undefined;
  return r ? versMedia(r) : null;
}

/** Supprime le média ET ses fichiers disque (variantes + bruts en attente). Renvoie la ligne. */
export function supprimerMediaEtFichiers(id: number): Media | null {
  const bruts = (stmt("SELECT chemin_brut FROM jobs WHERE media_id = ?").all(id) as { chemin_brut: string | null }[])
    .map((j) => j.chemin_brut)
    .filter((p): p is string => !!p);
  const supprime = supprimerMedia(id);
  if (!supprime) return null;
  supprimerFichiersMedia(supprime.id, bruts);
  return supprime;
}

/** Supprime le dossier `<UPLOADS_DIR>/<id>` et les bruts listés (chemins relatifs). */
export function supprimerFichiersMedia(mediaId: number, bruts: string[] = []): void {
  const racine = dossierUploads();
  const dossier = jointureSure(racine, String(mediaId));
  if (dossier) fs.rmSync(dossier, { recursive: true, force: true });
  for (const brut of bruts) {
    const p = jointureSure(racine, brut);
    if (p) fs.rmSync(p, { force: true });
  }
}

/** Jointure bornée à `racine` (refuse toute sortie par `..`). */
export function jointureSure(racine: string, relatif: string): string | null {
  const complet = path.resolve(racine, relatif);
  if (complet !== racine && !complet.startsWith(racine + path.sep)) return null;
  return complet;
}

// ---------------------------------------------------------------------------
// File d'attente
// ---------------------------------------------------------------------------

/** Réserve atomiquement le prochain job en attente (ou `null`). */
export function reserverProchainJob(): Job | null {
  const r = stmt(
    `UPDATE jobs SET statut = 'processing', tentatives = tentatives + 1, verrouille_le = ?
     WHERE id = (SELECT id FROM jobs WHERE statut = 'pending' ORDER BY id LIMIT 1)
     RETURNING *`,
  ).get(maintenantIso()) as Job | undefined;
  return r ?? null;
}

/** Job terminé : la ligne est supprimée (le média porte le résultat). */
export function terminerJob(id: number): void {
  stmt("DELETE FROM jobs WHERE id = ?").run(id);
}

/** Échec : remis en attente tant que `tentatives < max`, sinon `error`. */
export function echouerJob(id: number, erreur: string, max = 3): "nouvel-essai" | "erreur" {
  const job = stmt("SELECT tentatives FROM jobs WHERE id = ?").get(id) as { tentatives: number } | undefined;
  const definitif = !job || job.tentatives >= max;
  stmt("UPDATE jobs SET statut = ?, erreur = ?, verrouille_le = NULL WHERE id = ?").run(
    definitif ? "error" : "pending",
    erreur.slice(0, 500),
    id,
  );
  return definitif ? "erreur" : "nouvel-essai";
}

/** Remet en attente les jobs restés `processing` (process recyclé, plantage). `0` = tous. */
export function reprendreJobsBloques(plusVieuxQueMs = 0): number {
  const limite = new Date(Date.now() - plusVieuxQueMs).toISOString();
  const res = stmt(
    `UPDATE jobs SET statut = 'pending', verrouille_le = NULL
     WHERE statut = 'processing' AND (verrouille_le IS NULL OR verrouille_le <= ?)`,
  ).run(limite);
  stmt(
    `UPDATE media SET statut = 'pending'
     WHERE statut = 'processing' AND id IN (SELECT media_id FROM jobs WHERE statut = 'pending')`,
  ).run();
  return res.changes;
}

export function compterJobsEnAttente(): number {
  return (stmt("SELECT COUNT(*) AS n FROM jobs WHERE statut IN ('pending','processing')").get() as { n: number }).n;
}

// ---------------------------------------------------------------------------
// Références : un média peut-il être supprimé sans casser une page ?
// ---------------------------------------------------------------------------

/** IDs de médias référencés par les emplacements (réglage JSON `emplacements`). */
function idsEmplacements(): Set<number> {
  const r = stmt("SELECT value FROM settings WHERE key = 'emplacements'").get() as { value: string } | undefined;
  const carte = lireJson<Record<string, unknown>>(r?.value ?? null, {});
  return new Set(Object.values(carte).filter((v): v is number => typeof v === "number" && Number.isInteger(v)));
}

/** Vrai si le média sert quelque part (réalisation, menu, article, emplacement). */
export function mediaReference(mediaId: number): boolean {
  const n = (
    stmt(
      `SELECT
         (SELECT COUNT(*) FROM realisations WHERE media_id = @id)
       + (SELECT COUNT(*) FROM menus WHERE pdf_media_id = @id OR couverture_media_id = @id)
       + (SELECT COUNT(*) FROM articles WHERE couverture_media_id = @id) AS n`,
    ).get({ id: mediaId }) as { n: number }
  ).n;
  return n > 0 || idsEmplacements().has(mediaId);
}

/** Supprime le média et ses fichiers s'il n'est plus référencé nulle part. */
export function supprimerMediaSiOrphelin(mediaId: number | null | undefined): boolean {
  if (!mediaId || mediaReference(mediaId)) return false;
  return supprimerMediaEtFichiers(mediaId) !== null;
}

/**
 * Maintenance : médias non référencés créés il y a plus de `plusVieuxQueMs`
 * (24 h : laisse le temps d'enregistrer un formulaire après l'envoi de sa photo),
 * hors import du seed (`source` non nul : médiathèque de départ conservée).
 */
export function purgerMediasOrphelins(plusVieuxQueMs = 24 * 60 * 60 * 1000, maintenant = Date.now()): number[] {
  const limite = new Date(maintenant - plusVieuxQueMs).toISOString();
  const candidats = stmt(
    `SELECT id FROM media
     WHERE created_at < ? AND source IS NULL AND statut != 'processing'
       AND id NOT IN (SELECT media_id FROM realisations)
       AND id NOT IN (SELECT pdf_media_id FROM menus WHERE pdf_media_id IS NOT NULL)
       AND id NOT IN (SELECT couverture_media_id FROM menus WHERE couverture_media_id IS NOT NULL)
       AND id NOT IN (SELECT couverture_media_id FROM articles WHERE couverture_media_id IS NOT NULL)
       AND id NOT IN (SELECT media_id FROM jobs WHERE statut = 'processing')`,
  ).all(limite) as { id: number }[];
  const emplacements = idsEmplacements();
  const supprimes: number[] = [];
  for (const { id } of candidats) {
    if (emplacements.has(id)) continue;
    if (supprimerMediaEtFichiers(id)) supprimes.push(id);
  }
  return supprimes;
}

/** Maintenance : bruts de `tmp/` sans job, plus vieux que `plusVieuxQueMs`. Renvoie le nombre supprimé. */
export function purgerBrutsOrphelins(plusVieuxQueMs = 24 * 60 * 60 * 1000, maintenant = Date.now()): number {
  const racine = dossierUploads();
  const dossier = jointureSure(racine, "tmp");
  if (!dossier || !fs.existsSync(dossier)) return 0;
  const connus = new Set(
    (stmt("SELECT chemin_brut FROM jobs WHERE chemin_brut IS NOT NULL").all() as { chemin_brut: string }[]).map((j) =>
      path.resolve(racine, j.chemin_brut),
    ),
  );
  let n = 0;
  for (const nom of fs.readdirSync(dossier)) {
    const abs = path.join(/*turbopackIgnore: true*/ dossier, nom);
    if (connus.has(abs)) continue;
    let st: fs.Stats;
    try {
      st = fs.statSync(/*turbopackIgnore: true*/ abs);
    } catch {
      continue;
    }
    if (!st.isFile() || maintenant - st.mtimeMs < plusVieuxQueMs) continue;
    fs.rmSync(abs, { force: true });
    n++;
  }
  return n;
}
