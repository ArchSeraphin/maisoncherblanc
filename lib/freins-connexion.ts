/**
 * Freins du login du backoffice (module sans `server-only` ni Next : testable
 * en tsx). Mémoire du process, vidée au redémarrage.
 *
 * Les adresses sont regroupées par `groupeClient()` : IPv4 exacte, IPv6 par
 * préfixe /64 (un abonné en possède au moins un entier).
 *
 * - Par IP (connue) : 10 échecs / 15 min, blocage dur (l'IP est celle de
 *   l'attaquant, il ne bloque que lui-même).
 * - Par e-mail : PAS de blocage dur (sinon un tiers pourrait bloquer le gérant
 *   en tapant son adresse), mais une temporisation progressive : 3 échecs
 *   libres, puis 1 s, 2 s, 4 s... plafonnée à 60 s depuis le dernier échec.
 * - Global : au-delà de 200 échecs / 15 min (attaque distribuée), mode
 *   « alerte » plutôt qu'un blocage de tous : la limite par IP tombe à 3
 *   échecs. Une IP sans échec récent (le gérant sur un nouvel appareil) peut
 *   donc toujours essayer ; chaque machine de l'attaquant est arrêtée après
 *   3 essais au lieu de 10. IP inconnue (`null`) : refusée en mode alerte
 *   (impossible de la distinguer de l'attaque).
 * - Une IP qui s'est connectée avec succès dans les 30 derniers jours est
 *   « de confiance » : ni la temporisation par e-mail ni le mode alerte ne
 *   s'appliquent à elle (le gérant n'est pas bloqué par une attaque menée
 *   ailleurs) ; sa limite par IP reste active.
 * - IP inconnue (`null`) hors alerte : pas de clé IP commune à tous les
 *   visiteurs ; seule la temporisation par e-mail s'applique.
 */

import { enregistrerCoup, estLimite, groupeClient, reinitialiser, statistiques } from "./limiteur";

export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const MAX_FAILS_PER_IP = 10;
export const MAX_FAILS_GLOBAL = 200;
export const MAX_FAILS_PER_IP_UNDER_ATTACK = 3;
export const EMAIL_FREE_FAILS = 3;
export const EMAIL_MAX_DELAY_MS = 60 * 1000;
export const TRUSTED_IP_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const GLOBAL_KEY = "login:global";
const ipKey = (bucket: string) => `login:ip:${bucket}`;
const emailKey = (email: string) => `login:email:${email}`;

const store = globalThis as unknown as { __cherblancIpsDeConfiance?: Map<string, number> };
function trusted(): Map<string, number> {
  if (!store.__cherblancIpsDeConfiance) store.__cherblancIpsDeConfiance = new Map();
  return store.__cherblancIpsDeConfiance;
}

/** Délai imposé après `fails` échecs récents sur une même adresse e-mail. */
export function delaiEmailMs(fails: number): number {
  if (fails < EMAIL_FREE_FAILS) return 0;
  return Math.min(1000 * 2 ** (fails - EMAIL_FREE_FAILS), EMAIL_MAX_DELAY_MS);
}

export function estIpDeConfiance(ip: string | null, now = Date.now()): boolean {
  if (!ip) return false;
  const bucket = groupeClient(ip);
  const until = trusted().get(bucket);
  if (!until) return false;
  if (until <= now) {
    trusted().delete(bucket);
    return false;
  }
  return true;
}

export type PorteConnexion = { allowed: true } | { allowed: false; retryAfterMs: number };

/** Une tentative de connexion peut-elle être examinée maintenant ? */
export function connexionAutorisee(ip: string | null, email: string, now = Date.now()): PorteConnexion {
  const key = ip ? ipKey(groupeClient(ip)) : null;
  if (key && estLimite(key, MAX_FAILS_PER_IP, LOGIN_WINDOW_MS, now)) {
    return { allowed: false, retryAfterMs: LOGIN_WINDOW_MS };
  }
  if (estIpDeConfiance(ip, now)) return { allowed: true };
  if (estLimite(GLOBAL_KEY, MAX_FAILS_GLOBAL, LOGIN_WINDOW_MS, now)) {
    if (!key || estLimite(key, MAX_FAILS_PER_IP_UNDER_ATTACK, LOGIN_WINDOW_MS, now)) {
      return { allowed: false, retryAfterMs: LOGIN_WINDOW_MS };
    }
  }
  const s = statistiques(emailKey(email), LOGIN_WINDOW_MS, now);
  const wait = s.last === null ? 0 : s.last + delaiEmailMs(s.count) - now;
  if (wait > 0) return { allowed: false, retryAfterMs: wait };
  return { allowed: true };
}

export function noterEchecConnexion(ip: string | null, email: string, now = Date.now()): void {
  if (ip) enregistrerCoup(ipKey(groupeClient(ip)), LOGIN_WINDOW_MS, now);
  enregistrerCoup(emailKey(email), LOGIN_WINDOW_MS, now);
  enregistrerCoup(GLOBAL_KEY, LOGIN_WINDOW_MS, now);
}

export function noterSuccesConnexion(ip: string | null, email: string, now = Date.now()): void {
  reinitialiser(emailKey(email));
  if (!ip) return;
  const bucket = groupeClient(ip);
  reinitialiser(ipKey(bucket));
  const map = trusted();
  map.set(bucket, now + TRUSTED_IP_TTL_MS);
  if (map.size > 1000) {
    for (const [k, until] of map) if (until <= now) map.delete(k);
  }
}

/** Tests uniquement : vide l'état mémoire. */
export function reinitialiserFreins(): void {
  trusted().clear();
  reinitialiser(GLOBAL_KEY);
}
