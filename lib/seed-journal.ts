/**
 * Journal du seed (table `seed_journal`, créée ici et non dans lib/db.ts).
 *
 * Chaque élément que le seed crée une fois pour toutes est noté par une clé
 * stable À SA PREMIÈRE CRÉATION : `menu:carte-2027`, `pdf:carte-2027`,
 * `realisation:<source>`, `article:<slug>`, `horaire:<AAAA-MM-JJ>`,
 * `emplacement:<cle>`. Une clé journalisée n'est JAMAIS recréée : ce que le
 * client supprime, vide, retire ou renomme dans le backoffice ne revient pas
 * au prochain `npm run seed`.
 *
 * `ref` garde l'identifiant créé (menu, réalisation, article, média placé dans
 * un emplacement) : les menus sont retrouvés par cet ID et non par leur
 * adresse, qui change quand une nouvelle carte est mise en ligne.
 *
 * La clé `seed:journal` marque une base dont le journal est tenu : une base
 * déjà remplie SANS cette clé (créée avant le journal) est d'abord migrée
 * (scripts/_journal-seed.ts) : l'existant est journalisé, rien n'est recréé.
 */

import { getDb, stmt } from "./db";

export const CLE_MARQUEUR = "seed:journal";

let pret: unknown = null;

/** Crée la table si besoin (une fois par connexion). */
export function assurerJournal(): void {
  const db = getDb();
  if (pret === db) return;
  db.exec(`CREATE TABLE IF NOT EXISTS seed_journal (
    cle TEXT PRIMARY KEY,
    ref INTEGER NULL,
    cree_le TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  ) WITHOUT ROWID`);
  pret = db;
}

export function estJournalise(cle: string): boolean {
  assurerJournal();
  return !!stmt("SELECT 1 FROM seed_journal WHERE cle = ?").get(cle);
}

/** Identifiant noté avec la clé (`null` si absent ou non renseigné). */
export function refJournal(cle: string): number | null {
  assurerJournal();
  const l = stmt("SELECT ref FROM seed_journal WHERE cle = ?").get(cle) as { ref: number | null } | undefined;
  return l?.ref ?? null;
}

/** Note la clé (sans effet si elle l'est déjà, sauf `ref` mis à jour quand il est fourni). */
export function journaliser(cle: string, ref: number | null = null): void {
  assurerJournal();
  stmt(
    `INSERT INTO seed_journal (cle, ref) VALUES (?, ?)
     ON CONFLICT(cle) DO UPDATE SET ref = COALESCE(excluded.ref, seed_journal.ref)`,
  ).run(cle, ref);
}

/** Remplace l'identifiant d'une clé déjà notée (emplacement dont le visuel provisoire est remplacé par le seed). */
export function majRefJournal(cle: string, ref: number | null): void {
  assurerJournal();
  stmt("UPDATE seed_journal SET ref = ? WHERE cle = ?").run(ref, cle);
}

export function compterJournal(): number {
  assurerJournal();
  return (stmt("SELECT COUNT(*) AS n FROM seed_journal").get() as { n: number }).n;
}

export function listerJournal(): { cle: string; ref: number | null; cree_le: string }[] {
  assurerJournal();
  return stmt("SELECT cle, ref, cree_le FROM seed_journal ORDER BY cle").all() as { cle: string; ref: number | null; cree_le: string }[];
}

/** Vrai si la base contient déjà des données de départ (seed antérieur au journal, ou saisies). */
export function baseDejaRemplie(): boolean {
  const l = stmt(
    `SELECT EXISTS(SELECT 1 FROM media WHERE source IS NOT NULL)
         OR EXISTS(SELECT 1 FROM menus)
         OR EXISTS(SELECT 1 FROM articles)
         OR EXISTS(SELECT 1 FROM horaires_exceptionnels) AS n`,
  ).get() as { n: number };
  return l.n === 1;
}
