/**
 * Comptes administrateurs (table `admins`), multi-admin.
 *
 * `session_version` est incrémenté à chaque changement de mot de passe : toutes
 * les sessions ouvertes du compte deviennent invalides (vérifié par
 * `lireUtilisateur()` / `requireUser()` dans lib/auth.ts).
 * `password_hash` ne sort jamais de ce module, sauf via `lireIdentifiants` (lib/auth.ts).
 */

import { stmt } from "./db";
import { estEmailValide } from "./messages";
import { hacherMotDePasse, verifierMotDePasse, verifierRobustesse } from "./mots-de-passe";

export type Admin = { id: number; email: string; name: string; session_version: number; created_at: string };
type LigneAdmin = Admin & { password_hash: string };

const COLONNES = "id, email, name, session_version, created_at";

export type ResultatAdmin = { ok: true; admin: Admin } | { ok: false; erreur: string };
export type ResultatMotDePasse = { ok: true; sessionVersion: number } | { ok: false; erreur: string };

export function listerAdmins(): Admin[] {
  return stmt(`SELECT ${COLONNES} FROM admins ORDER BY id`).all() as Admin[];
}

export function compterAdmins(): number {
  return (stmt("SELECT COUNT(*) AS n FROM admins").get() as { n: number }).n;
}

export function lireAdmin(id: number): Admin | null {
  return (stmt(`SELECT ${COLONNES} FROM admins WHERE id = ?`).get(id) as Admin | undefined) ?? null;
}

export function lireAdminParEmail(email: string): Admin | null {
  return (stmt(`SELECT ${COLONNES} FROM admins WHERE email = ? COLLATE NOCASE`).get(email.trim()) as Admin | undefined) ?? null;
}

/** Usage interne (connexion) : identifiants complets. */
export function lireIdentifiants(email: string): LigneAdmin | null {
  return (stmt("SELECT * FROM admins WHERE email = ? COLLATE NOCASE").get(email.trim()) as LigneAdmin | undefined) ?? null;
}

export async function creerAdmin(e: { email: string; name?: string; motDePasse: string }): Promise<ResultatAdmin> {
  const email = e.email.trim().toLowerCase();
  if (!estEmailValide(email)) return { ok: false, erreur: "Adresse e-mail invalide." };
  const faible = verifierRobustesse(e.motDePasse);
  if (faible) return { ok: false, erreur: faible };
  if (lireAdminParEmail(email)) return { ok: false, erreur: "Un compte existe déjà avec cette adresse." };
  const hash = await hacherMotDePasse(e.motDePasse);
  const res = stmt("INSERT INTO admins (email, name, password_hash) VALUES (?, ?, ?)").run(email, (e.name ?? "").trim().slice(0, 80), hash);
  return { ok: true, admin: lireAdmin(Number(res.lastInsertRowid))! };
}

export function modifierProfilAdmin(id: number, patch: { name?: string; email?: string }): ResultatAdmin {
  const cur = lireAdmin(id);
  if (!cur) return { ok: false, erreur: "Compte introuvable." };
  const email = (patch.email ?? cur.email).trim().toLowerCase();
  if (!estEmailValide(email)) return { ok: false, erreur: "Adresse e-mail invalide." };
  const autre = lireAdminParEmail(email);
  if (autre && autre.id !== id) return { ok: false, erreur: "Un compte existe déjà avec cette adresse." };
  stmt("UPDATE admins SET email = ?, name = ? WHERE id = ?").run(email, (patch.name ?? cur.name).trim().slice(0, 80), id);
  return { ok: true, admin: lireAdmin(id)! };
}

/** Change le mot de passe et invalide toutes les sessions du compte. */
export async function definirMotDePasse(id: number, nouveau: string): Promise<ResultatMotDePasse> {
  const faible = verifierRobustesse(nouveau);
  if (faible) return { ok: false, erreur: faible };
  const hash = await hacherMotDePasse(nouveau);
  const l = stmt("UPDATE admins SET password_hash = ?, session_version = session_version + 1 WHERE id = ? RETURNING session_version").get(
    hash,
    id,
  ) as { session_version: number } | undefined;
  return l ? { ok: true, sessionVersion: l.session_version } : { ok: false, erreur: "Compte introuvable." };
}

/** Usage interne (connexion) : remplace le hash par un hash du MÊME mot de passe aux paramètres courants. */
export function remplacerHash(id: number, hash: string): void {
  stmt("UPDATE admins SET password_hash = ? WHERE id = ?").run(hash, id);
}

/**
 * Ré-authentification avant une action sensible (créer un compte, réinitialiser
 * le mot de passe d'un autre) : vrai si `motDePasse` est celui du compte `id`.
 */
export async function verifierMotDePasseAdmin(id: number, motDePasse: string): Promise<boolean> {
  const l = stmt("SELECT password_hash FROM admins WHERE id = ?").get(id) as { password_hash: string } | undefined;
  if (!l || !motDePasse) return false;
  return verifierMotDePasse(motDePasse.slice(0, 200), l.password_hash);
}

/** Changement de SON PROPRE mot de passe : exige le mot de passe actuel. */
export async function changerSonMotDePasse(id: number, actuel: string, nouveau: string): Promise<ResultatMotDePasse> {
  const l = stmt("SELECT password_hash FROM admins WHERE id = ?").get(id) as { password_hash: string } | undefined;
  if (!l || !(await verifierMotDePasse(actuel, l.password_hash))) return { ok: false, erreur: "Mot de passe actuel incorrect." };
  return definirMotDePasse(id, nouveau);
}

/** Supprime un compte (refusé pour le dernier). Renvoie la ligne. */
export function supprimerAdmin(id: number): ResultatAdmin {
  if (compterAdmins() <= 1) return { ok: false, erreur: "Impossible de supprimer le dernier administrateur." };
  const l = stmt(`DELETE FROM admins WHERE id = ? RETURNING ${COLONNES}`).get(id) as Admin | undefined;
  return l ? { ok: true, admin: l } : { ok: false, erreur: "Compte introuvable." };
}
