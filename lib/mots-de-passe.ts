/**
 * Hachage de mot de passe via `node:crypto` scrypt ASYNCHRONE (aucune
 * dépendance native à compiler sur le VPS).
 *
 * La version synchrone gèlerait la boucle d'événements (et donc le site
 * public) sous quelques dizaines de tentatives : on utilise `crypto.scrypt`
 * promisifié + un plafond de vérifications simultanées (sémaphore).
 *
 * Format stocké : `scrypt$N$r$p$selBase64$hashBase64`. Les paramètres sont
 * lus dans le hash : un hash ancien (N = 2^14) reste vérifiable, et il est
 * recalculé aux paramètres courants à la connexion suivante (`doitEtreRehache`).
 *
 * Paramètres : N = 2^17, r = 8, p = 1 (recommandation OWASP), soit 128 Mio de
 * mémoire et environ 0,25 s par calcul (mesuré sur Apple M-series ; compter
 * plus sur un petit VPS). D'où au plus 2 calculs simultanés (256 Mio au pic,
 * que l'allocateur ne rend pas toujours tout de suite au système).
 */

import crypto from "node:crypto";

const N = 2 ** 17;
const R = 8;
const P = 1;
const KEYLEN = 64;
const MAX_CONCURRENT = 2;
const MAX_QUEUE = 64;
/** Garde-fou sur les paramètres lus dans un hash stocké. */
const MAX_N = 2 ** 20;

export const LONGUEUR_MIN_MOT_DE_PASSE = 12;

function scryptAsync(password: string, salt: Buffer, n: number, r: number, p: number, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Besoin réel : 128 * N * r octets ; marge x2 (Node refuse au-delà de maxmem).
    crypto.scrypt(password, salt, keylen, { N: n, r, p, maxmem: 256 * n * r }, (err, key) =>
      err ? reject(err) : resolve(key),
    );
  });
}

// Sémaphore simple : au plus MAX_CONCURRENT scrypt en parallèle.
const sem = globalThis as unknown as { __cherblancScrypt?: { active: number; queue: Array<() => void> } };
function semaphore() {
  if (!sem.__cherblancScrypt) sem.__cherblancScrypt = { active: 0, queue: [] };
  return sem.__cherblancScrypt;
}

export class ErreurCalculOccupe extends Error {
  constructor() {
    super("Trop de vérifications simultanées.");
  }
}

async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  const s = semaphore();
  if (s.active >= MAX_CONCURRENT) {
    if (s.queue.length >= MAX_QUEUE) throw new ErreurCalculOccupe();
    await new Promise<void>((resolve) => s.queue.push(resolve));
  } else {
    s.active++;
  }
  try {
    return await fn();
  } finally {
    const next = s.queue.shift();
    if (next) next();
    else s.active--;
  }
}

export async function hacherMotDePasse(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const key = await withSlot(() => scryptAsync(password, salt, N, R, P, KEYLEN));
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

type Parsed = { n: number; r: number; p: number; salt: Buffer; hash: Buffer };

function parseHash(stored: string): Parsed | null {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return null;
  const [n, r, p] = parts.slice(1, 4).map(Number);
  // N puissance de 2 bornée, r et p petits : un hash corrompu ne doit pas
  // pouvoir réclamer des gigaoctets de mémoire.
  if (!Number.isInteger(n) || n < 2 || n > MAX_N || (n & (n - 1)) !== 0) return null;
  if (!Number.isInteger(r) || r < 1 || r > 32 || !Number.isInteger(p) || p < 1 || p > 4) return null;
  const hash = Buffer.from(parts[5], "base64");
  if (hash.length < 16) return null;
  return { n, r, p, salt: Buffer.from(parts[4], "base64"), hash };
}

export async function verifierMotDePasse(password: string, stored: string): Promise<boolean> {
  const h = parseHash(stored);
  if (!h) return false;
  const key = await withSlot(() => scryptAsync(password, h.salt, h.n, h.r, h.p, h.hash.length));
  return key.length === h.hash.length && crypto.timingSafeEqual(key, h.hash);
}

/** `true` si le hash n'utilise pas les paramètres courants (à recalculer après une connexion réussie). */
export function doitEtreRehache(stored: string): boolean {
  const h = parseHash(stored);
  return !h || h.n !== N || h.r !== R || h.p !== P || h.hash.length !== KEYLEN;
}

/** Hash factice pour égaliser le temps de réponse quand le compte n'existe pas. */
let hachageFactivePromesse: Promise<string> | null = null;
export function hachageFactice(): Promise<string> {
  if (!hachageFactivePromesse) hachageFactivePromesse = hacherMotDePasse(crypto.randomBytes(16).toString("hex"));
  return hachageFactivePromesse;
}

/** Règle de robustesse minimale (message en français, ou `null` si OK). */
export function verifierRobustesse(password: string): string | null {
  if (password.length < LONGUEUR_MIN_MOT_DE_PASSE)
    return `Le mot de passe doit contenir au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`;
  if (password.length > 200) return "Le mot de passe est trop long.";
  return null;
}
