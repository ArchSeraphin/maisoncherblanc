/**
 * Accès centralisé aux variables d'environnement RUNTIME.
 *
 * Tout est lu paresseusement (à l'appel, jamais au chargement du module) pour
 * que `next build` passe sans secrets, et pour que le chemin du backoffice se
 * change par l'environnement + redémarrage, sans rebuild. Aucune `NEXT_PUBLIC_*`.
 *
 * Module léger (seulement `node:path`) : importable depuis `proxy.ts`. Jamais
 * depuis un composant client.
 */

import path from "node:path";

const URL_PAR_DEFAUT = "https://maisoncherblanc.fr";

/** URL publique du site, sans slash final. */
export function urlSite(): string {
  const brut = (process.env.SITE_URL || URL_PAR_DEFAUT).trim();
  return brut.replace(/\/+$/, "");
}

/** Segments interdits comme chemin secret (scannés en permanence ou réservés par le site). */
const SEGMENTS_INTERDITS = new Set([
  "admin",
  "administrator",
  "administrateur",
  "backoffice",
  "back-office",
  "login",
  "connexion",
  "dashboard",
  "wp-admin",
  "wp-login",
  "bo",
  "__bo",
  "media",
  "api",
  "_next",
  "icons",
  "logo",
  "contact",
  "actualites",
  "realisations",
]);

/**
 * Segment secret du backoffice (sans slash), ou `null` si absent ou invalide
 * (le backoffice est alors fermé : tout répond 404).
 */
export function segmentAdmin(): string | null {
  const brut = (process.env.ADMIN_PATH || "").trim().replace(/^\/+|\/+$/g, "");
  if (!/^[a-z0-9][a-z0-9-]{5,63}$/i.test(brut)) return null;
  if (SEGMENTS_INTERDITS.has(brut.toLowerCase())) return null;
  return brut;
}

/** `NOINDEX=1` : préproduction, rien ne doit être indexé. */
export function estNoindex(): boolean {
  return process.env.NOINDEX === "1" || process.env.NOINDEX === "true";
}

/** `TRUST_PROXY=1` derrière Traefik (Coolify), nginx ou Plesk. */
export function proxyDeConfiance(): boolean {
  return process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true";
}

/** Chemin absolu de la base SQLite. */
export function cheminBase(): string {
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.DATABASE_PATH || "./data/cherblanc.db");
}

/** Dossier absolu des fichiers téléversés (persistant, hors build). */
export function dossierUploads(): string {
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.UPLOADS_DIR || "./data/uploads");
}

/**
 * Secret de session (>= 32 caractères). Validé à l'appel seulement : une valeur
 * manquante casse la connexion au backoffice, jamais le build.
 */
export function secretSession(): string {
  const secret = process.env.SESSION_SECRET || "";
  if (secret.length < 32) {
    throw new Error("SESSION_SECRET manquant ou trop court (32 caractères minimum). Renseignez-le dans l'environnement.");
  }
  return secret;
}

/** Adresse de réception des messages du formulaire (défaut : e-mail public). */
export function emailContact(): string {
  return (process.env.CONTACT_EMAIL || "contact@maisoncherblanc.fr").trim();
}

/** Expéditeur des notifications (adresse validée dans Brevo). */
export function emailExpediteur(): string {
  return (process.env.MAIL_FROM || emailContact()).trim();
}

/** Cookie `Secure` : production HTTPS, sauf `COOKIE_SECURE=0` (test local en HTTP). */
export function cookieSecurise(): boolean {
  return process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "0";
}
