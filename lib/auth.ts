/**
 * Authentification du backoffice : session iron-session (cookie chiffré,
 * HTTP-only, `path=/`), mots de passe scrypt asynchrones, freins à la
 * connexion, invalidation des sessions par `session_version`.
 *
 * - `requireUser()` EN TÊTE de chaque page, Server Action et layout protégés.
 * - Routes API du BO : `lireUtilisateur()` + réponse 401 (pas de redirection d'un fetch).
 * - Le secret de session est validé à l'appel (jamais au chargement du module).
 */

import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { lireAdmin, lireIdentifiants, remplacerHash, type Admin } from "./admins";
import { lienAdmin } from "./chemin-admin";
import { cookieSecurise, proxyDeConfiance, secretSession } from "./env";
import { connexionAutorisee, noterEchecConnexion, noterSuccesConnexion } from "./freins-connexion";
import { doitEtreRehache, ErreurCalculOccupe, hachageFactice, hacherMotDePasse, verifierMotDePasse } from "./mots-de-passe";

export type DonneesSession = { adminId?: number; sv?: number };

export const COOKIE_SESSION = "cherblanc_bo";
const DUREE_SESSION_S = 60 * 60 * 12; // 12 h

const ERREUR_GENERIQUE = "Identifiants incorrects.";
const ERREUR_LIMITE = "Trop de tentatives. Merci de patienter un peu avant de réessayer.";

/**
 * Nom effectif du cookie : `__Host-cherblanc_bo` quand il est Secure (un
 * sous-domaine ne peut ni le poser ni l'écraser) ; nom nu en HTTP local.
 */
export function nomCookieSession(): string {
  return cookieSecurise() ? `__Host-${COOKIE_SESSION}` : COOKIE_SESSION;
}

function optionsSession(): SessionOptions {
  return {
    cookieName: nomCookieSession(),
    password: secretSession(),
    ttl: DUREE_SESSION_S,
    cookieOptions: { httpOnly: true, secure: cookieSecurise(), sameSite: "lax", path: "/" },
  };
}

export async function lireSession(): Promise<IronSession<DonneesSession>> {
  return getIronSession<DonneesSession>(await cookies(), optionsSession());
}

/**
 * Administrateur connecté, ou `null`. Vérifie que le compte existe toujours et
 * que `session_version` correspond. Dédupliqué par requête (React `cache`).
 */
export const lireUtilisateur = cache(async (): Promise<Admin | null> => {
  const session = await lireSession();
  if (!session.adminId) return null;
  const admin = lireAdmin(session.adminId);
  if (!admin || admin.session_version !== session.sv) return null;
  return admin;
});

/** Exige une session valide, sinon redirige vers la page de connexion. */
export async function requireUser(): Promise<Admin> {
  const u = await lireUtilisateur();
  if (!u) redirect(lienAdmin("/connexion"));
  return u;
}

/**
 * Adresse du client pour les freins, ou `null` si inconnue.
 * - `TRUST_PROXY=1` : DERNIER élément de X-Forwarded-For (posé par le reverse
 *   proxy), jamais le premier (fourni par le client) ;
 * - sinon : adresse de la socket, transmise par server.js (`x-cherblanc-ip-socket`).
 * Pas de repli sur X-Real-IP (falsifiable si le proxy ne l'écrase pas).
 */
export async function adresseClient(): Promise<string | null> {
  const h = await headers();
  if (proxyDeConfiance()) {
    const xff = h.get("x-forwarded-for");
    if (xff) {
      const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
      if (parts.length) return parts[parts.length - 1];
    }
  }
  return h.get("x-cherblanc-ip-socket")?.trim() || null;
}

export type ResultatConnexion = { ok: true; admin: Admin } | { ok: false; erreur: string };

/** Vérifie les identifiants et ouvre la session. Messages toujours génériques. */
export async function connecter(emailBrut: string, motDePasse: string): Promise<ResultatConnexion> {
  const email = emailBrut.trim().toLowerCase().slice(0, 254);
  const ip = await adresseClient();
  if (!connexionAutorisee(ip, email).allowed) return { ok: false, erreur: ERREUR_LIMITE };

  let valide = false;
  const ids = email && motDePasse ? lireIdentifiants(email) : null;
  try {
    if (ids) valide = await verifierMotDePasse(motDePasse.slice(0, 200), ids.password_hash);
    // Compte inexistant : même coût de calcul (pas d'oracle temporel).
    else await verifierMotDePasse(motDePasse.slice(0, 200) || "x", await hachageFactice());
  } catch (err) {
    if (err instanceof ErreurCalculOccupe) return { ok: false, erreur: ERREUR_LIMITE };
    throw err;
  }

  if (!ids || !valide) {
    noterEchecConnexion(ip, email);
    return { ok: false, erreur: ERREUR_GENERIQUE };
  }

  noterSuccesConnexion(ip, email);
  if (doitEtreRehache(ids.password_hash)) {
    try {
      remplacerHash(ids.id, await hacherMotDePasse(motDePasse.slice(0, 200)));
    } catch (err) {
      console.error("[auth] mise à niveau du hash impossible :", err instanceof Error ? err.message : err);
    }
  }
  const session = await lireSession();
  session.adminId = ids.id;
  session.sv = ids.session_version;
  await session.save();
  return { ok: true, admin: lireAdmin(ids.id)! };
}

/** Ferme la session courante. */
export async function deconnecter(): Promise<void> {
  (await lireSession()).destroy();
}

/** Après changement de SON PROPRE mot de passe : garde la session courante valide. */
export async function rafraichirSaSession(adminId: number, sessionVersion: number): Promise<void> {
  const session = await lireSession();
  if (session.adminId !== adminId) return;
  session.sv = sessionVersion;
  await session.save();
}
