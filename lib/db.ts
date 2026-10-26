/**
 * Connexion SQLite (better-sqlite3), singleton par process.
 *
 * - Schéma en `CREATE TABLE IF NOT EXISTS`, créé à la première ouverture.
 * - Migrations idempotentes via `ensureColumn` (ajoute une colonne absente).
 * - PRAGMA : WAL, foreign_keys, busy_timeout, secure_delete.
 * - Le singleton vit sur `globalThis` pour survivre au rechargement de `next dev`.
 *
 * Règle projet : seuls les modules `lib/` importent ce fichier. Jamais une page,
 * jamais un composant, jamais un composant client.
 */

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { cheminBase } from "./env";

export type DB = Database.Database;

const globalPourDb = globalThis as unknown as { __cherblancDb?: DB; __cherblancDbChemin?: string };

const SCHEMA = `
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  session_version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- plages : JSON [{ouverture, fermeture}] ; '[]' = fermé ;
-- NULL = ouvert, horaires précisés dans la note (ex. « commandes à récupérer avant 17h »).
CREATE TABLE IF NOT EXISTS horaires_exceptionnels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  libelle TEXT NOT NULL DEFAULT '',
  plages TEXT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom_original TEXT NOT NULL DEFAULT '',
  alt TEXT NOT NULL DEFAULT '',
  largeur INTEGER NULL,
  hauteur INTEGER NULL,
  variantes TEXT NULL,
  statut TEXT NOT NULL DEFAULT 'pending' CHECK (statut IN ('pending','processing','ready','error')),
  type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image','document')),
  provisoire INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  statut TEXT NOT NULL DEFAULT 'pending' CHECK (statut IN ('pending','processing','error')),
  tentatives INTEGER NOT NULL DEFAULT 0,
  erreur TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_jobs_statut ON jobs(statut, id);

CREATE TABLE IF NOT EXISTS menus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'permanent' CHECK (type IN ('permanent','saison')),
  titre TEXT NOT NULL,
  sous_titre TEXT NOT NULL DEFAULT '',
  intro TEXT NOT NULL DEFAULT '',
  note_bas TEXT NOT NULL DEFAULT '',
  infos_commande TEXT NOT NULL DEFAULT '',
  valable_du TEXT NULL,
  valable_au TEXT NULL,
  publie_du TEXT NULL,
  publie_au TEXT NULL,
  pdf_media_id INTEGER NULL REFERENCES media(id) ON DELETE SET NULL,
  couverture_media_id INTEGER NULL REFERENCES media(id) ON DELETE SET NULL,
  visible INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS menu_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  mise_en_avant INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_menu_sections_menu ON menu_sections(menu_id, position);

CREATE TABLE IF NOT EXISTS menu_plats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL REFERENCES menu_sections(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  prix TEXT NOT NULL DEFAULT '',
  unite TEXT NOT NULL DEFAULT '',
  badge TEXT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_menu_plats_section ON menu_plats(section_id, position);

CREATE TABLE IF NOT EXISTS realisations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  legende TEXT NOT NULL DEFAULT '',
  categorie TEXT NOT NULL DEFAULT 'buffet'
    CHECK (categorie IN ('mariage','cocktail','buffet','broche-barbecue','plateaux','boucherie')),
  position INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_realisations_position ON realisations(position);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  titre TEXT NOT NULL,
  chapo TEXT NOT NULL DEFAULT '',
  corps TEXT NOT NULL DEFAULT '',
  couverture_media_id INTEGER NULL REFERENCES media(id) ON DELETE SET NULL,
  statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon','publie')),
  publie_le TEXT NULL,
  titre_seo TEXT NOT NULL DEFAULT '',
  description_seo TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_articles_publication ON articles(statut, publie_le);

CREATE TABLE IF NOT EXISTS avis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  auteur TEXT NOT NULL,
  texte TEXT NOT NULL,
  note INTEGER NOT NULL DEFAULT 5 CHECK (note BETWEEN 1 AND 5),
  source TEXT NOT NULL DEFAULT 'direct' CHECK (source IN ('google','direct')),
  date TEXT NULL,
  visible INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL DEFAULT 'autre' CHECK (type IN ('devis-traiteur','commande-boucherie','autre')),
  prenom TEXT NOT NULL DEFAULT '',
  nom TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  telephone TEXT NOT NULL DEFAULT '',
  date_evenement TEXT NULL,
  nb_personnes INTEGER NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  lu_le TEXT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_email ON messages(email COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS page_views (
  jour TEXT NOT NULL,
  chemin TEXT NOT NULL,
  compte INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (jour, chemin)
);

-- Jetons de formulaire déjà utilisés (anti-rejeu, lib/jeton-formulaire.ts) :
-- empreinte SHA-256 du jeton, purgée une fois le jeton expiré (ms epoch).
CREATE TABLE IF NOT EXISTS jetons_formulaire (
  id TEXT PRIMARY KEY,
  expire_le INTEGER NOT NULL
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS idx_jetons_expire ON jetons_formulaire(expire_le);
`;

/** Ajoute une colonne si elle n'existe pas (migration idempotente). */
export function ensureColumn(db: DB, table: string, colonne: string, definition: string): void {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === colonne)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${colonne} ${definition}`);
  }
}

/** Migrations idempotentes, à compléter au fil du projet (jamais de DROP). */
function migrer(db: DB): void {
  // jobs : chemin du fichier brut à traiter + horodatage de prise en charge.
  ensureColumn(db, "jobs", "chemin_brut", "TEXT NULL");
  ensureColumn(db, "jobs", "verrouille_le", "TEXT NULL");
  // media : type MIME détecté, poids du fichier source, clé d'import (seed idempotent).
  ensureColumn(db, "media", "mime", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, "media", "poids", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn(db, "media", "source", "TEXT NULL");
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_media_source ON media(source) WHERE source IS NOT NULL");
}

function ouvrir(chemin: string): DB {
  fs.mkdirSync(path.dirname(chemin), { recursive: true });
  const db = new Database(chemin);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.pragma("synchronous = NORMAL");
  // Les données supprimées (messages purgés, effacement RGPD) sont écrasées
  // sur le disque au lieu de rester lisibles dans les pages libres du fichier.
  db.pragma("secure_delete = ON");
  db.exec(SCHEMA);
  migrer(db);
  return db;
}

/** Connexion singleton (ouverte et migrée au premier appel). */
export function getDb(): DB {
  const chemin = cheminBase();
  if (!globalPourDb.__cherblancDb || globalPourDb.__cherblancDbChemin !== chemin) {
    globalPourDb.__cherblancDb?.close();
    globalPourDb.__cherblancDb = ouvrir(chemin);
    globalPourDb.__cherblancDbChemin = chemin;
  }
  return globalPourDb.__cherblancDb;
}

/** Ferme la connexion (scripts CLI). */
export function closeDb(): void {
  globalPourDb.__cherblancDb?.close();
  globalPourDb.__cherblancDb = undefined;
  globalPourDb.__cherblancDbChemin = undefined;
}

const cacheRequetes = new WeakMap<DB, Map<string, Database.Statement>>();

/**
 * Requête préparée mise en cache par connexion. Toujours des paramètres liés
 * (`?` ou `@nom`), jamais de SQL concaténé avec une entrée utilisateur.
 */
export function stmt(sql: string): Database.Statement {
  const db = getDb();
  let cache = cacheRequetes.get(db);
  if (!cache) {
    cache = new Map();
    cacheRequetes.set(db, cache);
  }
  let s = cache.get(sql);
  if (!s) {
    s = db.prepare(sql);
    cache.set(sql, s);
  }
  return s;
}

/** Exécute `fn` dans une transaction (better-sqlite3, synchrone). Imbricable. */
export function transaction<T>(fn: () => T): T {
  return getDb().transaction(fn)();
}

/** Horodatage ISO 8601 UTC courant. */
export function maintenantIso(): string {
  return new Date().toISOString();
}

/** Parse JSON défensif (renvoie `secours` si invalide). */
export function lireJson<T>(brut: string | null | undefined, secours: T): T {
  if (brut == null || brut === "") return secours;
  try {
    return JSON.parse(brut) as T;
  } catch {
    return secours;
  }
}

/** Booléen SQLite (0/1) -> boolean. */
export function bool(v: unknown): boolean {
  return v === 1 || v === true || v === "1";
}
