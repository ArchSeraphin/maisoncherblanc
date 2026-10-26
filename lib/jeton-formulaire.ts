/**
 * Horodatage signé des formulaires publics (anti-robot du formulaire de contact).
 *
 * Le serveur rend dans le formulaire un jeton `<ms>.<nonce>.<hmac>`
 * (HMAC-SHA256 avec SESSION_SECRET, lu à l'appel, jamais au chargement du
 * module ; nonce aléatoire : deux visiteurs servis à la même milliseconde ont
 * des jetons distincts). À l'envoi, le jeton doit être présent, intact, ni trop
 * récent (< 3 s : remplissage par un robot) ni trop ancien (> 24 h), et
 * n'avoir jamais servi : `consommerJeton` l'inscrit dans la table
 * `jetons_formulaire` (SQLite : survit au redémarrage, partagée entre process),
 * purgée chaque jour par lib/maintenance.ts une fois le jeton expiré.
 *
 * Module serveur (node:crypto, DB) : ne jamais l'importer depuis un composant client.
 */

import crypto from "node:crypto";
import { stmt, transaction } from "./db";
import { secretSession } from "./env";

/** Usage du jeton du formulaire de contact. */
export const USAGE_CONTACT = "contact";

export const AGE_MIN_JETON_MS = 3000;
export const AGE_MAX_JETON_MS = 24 * 60 * 60 * 1000;

export type VerdictJeton = "ok" | "missing" | "invalid" | "too-early" | "expired";

const TOKEN_RE = /^(\d{13})\.([A-Za-z0-9_-]{16})\.([A-Za-z0-9_-]{43})$/;

function sign(purpose: string, issuedAt: number, nonce: string): string {
  return crypto
    .createHmac("sha256", secretSession())
    .update(`cherblanc-form:${purpose}:${issuedAt}:${nonce}`)
    .digest("base64url");
}

/** Jeton à rendre dans un champ caché. `""` si le secret n'est pas configuré (envoi alors refusé). */
export function emettreJeton(purpose: string, now = Date.now()): string {
  try {
    const nonce = crypto.randomBytes(12).toString("base64url");
    return `${now}.${nonce}.${sign(purpose, now, nonce)}`;
  } catch (err) {
    console.error("[jeton] jeton impossible :", err instanceof Error ? err.message : err);
    return "";
  }
}

/** Signature et âge du jeton (ne dit rien d'un éventuel rejeu : voir `consommerJeton`). */
export function verifierJeton(purpose: string, token: string, now = Date.now()): VerdictJeton {
  if (!token) return "missing";
  const m = TOKEN_RE.exec(token);
  if (!m) return "invalid";
  const issuedAt = Number(m[1]);
  let expected: string;
  try {
    expected = sign(purpose, issuedAt, m[2]);
  } catch {
    return "invalid";
  }
  const a = Buffer.from(m[3]);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return "invalid";
  const age = now - issuedAt;
  if (age < AGE_MIN_JETON_MS) return "too-early";
  if (age > AGE_MAX_JETON_MS) return "expired";
  return "ok";
}

/**
 * Consomme un jeton déjà validé (`verifierJeton === "ok"`) et exécute `fn`
 * dans la MÊME transaction : l'enregistrement n'a lieu qu'une fois par jeton,
 * même si deux envois identiques arrivent en même temps. Renvoie
 * `{ spent: false }` (et `fn` n'est pas appelée) si le jeton a déjà servi.
 * Une exception de `fn` annule aussi la consommation (le visiteur peut réessayer).
 */
export function consommerJeton<T>(purpose: string, token: string, fn: () => T): { spent: true; value: T } | { spent: false } {
  const issuedAt = Number(token.slice(0, 13));
  const id = crypto.createHash("sha256").update(`${purpose}:${token}`).digest("base64url");
  return transaction(() => {
    const res = stmt("INSERT OR IGNORE INTO jetons_formulaire (id, expire_le) VALUES (?, ?)").run(
      id,
      issuedAt + AGE_MAX_JETON_MS,
    );
    if (res.changes === 0) return { spent: false as const };
    return { spent: true as const, value: fn() };
  });
}

/** Maintenance : oublie les jetons expirés (ils seraient refusés de toute façon). Renvoie le nombre supprimé. */
export function purgerJetonsExpires(now = Date.now()): number {
  return stmt("DELETE FROM jetons_formulaire WHERE expire_le < ?").run(now).changes;
}
