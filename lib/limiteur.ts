/**
 * Limiteur de débit en mémoire (fenêtre glissante), par clé.
 * Mono-process : suffisant pour un VPS unique. Utilisé par le login et le
 * formulaire de contact.
 */

import net from "node:net";

/** Les 8 groupes de 16 bits d'une IPv6 valide (formes compressée et IPv4 finale acceptées). */
function ipv6Groups(ip: string): number[] {
  let addr = ip;
  const v4 = /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(addr);
  if (v4) {
    const [a, b, c, d] = v4.slice(1).map(Number);
    addr = `${addr.slice(0, v4.index)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const [head, tail] = addr.includes("::") ? addr.split("::") : [addr, null];
  const h = head ? head.split(":") : [];
  const t = tail ? tail.split(":") : [];
  const fill = tail === null ? [] : Array<string>(8 - h.length - t.length).fill("0");
  return [...h, ...fill, ...t].map((g) => Number.parseInt(g, 16));
}

/**
 * Clé de limitation d'une adresse client. IPv4 : l'adresse telle quelle
 * (IPv4 mappée `::ffff:a.b.c.d` ramenée à `a.b.c.d`). IPv6 : le préfixe /64,
 * car un seul abonné (box, mobile) dispose d'au moins un /64 entier et
 * changerait d'adresse à volonté pour contourner une limite par adresse.
 */
export function groupeClient(ip: string): string {
  const addr = ip.trim().replace(/%.*$/, "").toLowerCase();
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(addr);
  if (mapped) return mapped[1];
  if (!net.isIPv6(addr)) return addr;
  const prefix = ipv6Groups(addr)
    .slice(0, 4)
    .map((g) => g.toString(16))
    .join(":");
  return `${prefix}::/64`;
}

type Bucket = { hits: number[] };
const store = globalThis as unknown as { __cherblancLimiteur?: Map<string, Bucket> };

function buckets(): Map<string, Bucket> {
  if (!store.__cherblancLimiteur) store.__cherblancLimiteur = new Map();
  return store.__cherblancLimiteur;
}

function prune(b: Bucket, windowMs: number, now: number) {
  while (b.hits.length && b.hits[0] <= now - windowMs) b.hits.shift();
}

/** `true` si la clé a atteint `limit` évènements dans la fenêtre. */
export function estLimite(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const b = buckets().get(key);
  if (!b) return false;
  prune(b, windowMs, now);
  return b.hits.length >= limit;
}

/** Enregistre un évènement (ex. échec de connexion) pour la clé. */
export function enregistrerCoup(key: string, windowMs: number, now = Date.now()): void {
  const map = buckets();
  const b = map.get(key) ?? { hits: [] };
  prune(b, windowMs, now);
  b.hits.push(now);
  map.set(key, b);
  // Garde-fou mémoire : on purge les clés vides quand la table grossit.
  if (map.size > 10_000) {
    for (const [k, v] of map) {
      prune(v, windowMs, now);
      if (!v.hits.length) map.delete(k);
    }
  }
}

export function reinitialiser(key: string): void {
  buckets().delete(key);
}

/** Nombre d'évènements de la clé dans la fenêtre, et horodatage du dernier. */
export function statistiques(key: string, windowMs: number, now = Date.now()): { count: number; last: number | null } {
  const b = buckets().get(key);
  if (!b) return { count: 0, last: null };
  prune(b, windowMs, now);
  return { count: b.hits.length, last: b.hits.length ? b.hits[b.hits.length - 1] : null };
}
