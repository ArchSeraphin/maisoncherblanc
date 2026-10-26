/**
 * Messages du formulaire de contact (table `messages`) : demandes de devis
 * traiteur, commandes boucherie, autres questions.
 *
 * Données personnelles : conservation 12 mois (`siteConfig.confidentialite`),
 * purge automatique (lib/maintenance.ts). Recherche et suppression par e-mail
 * pour l'exercice des droits (RGPD).
 */

import { siteConfig } from "@/config/site";
import { estJourIso } from "./dates";
import { stmt } from "./db";

export const TYPES_MESSAGE = ["devis-traiteur", "commande-boucherie", "autre"] as const;
export type TypeMessage = (typeof TYPES_MESSAGE)[number];

export const LIBELLES_TYPES_MESSAGE: Record<TypeMessage, string> = {
  "devis-traiteur": "Demande de devis traiteur",
  "commande-boucherie": "Commande boucherie",
  autre: "Autre question",
};

export type Message = {
  id: number;
  type: TypeMessage;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  date_evenement: string | null;
  nb_personnes: number | null;
  message: string;
  created_at: string;
  lu_le: string | null;
};

export type EntreeMessage = Omit<Message, "id" | "created_at" | "lu_le">;

export const LIMITES_MESSAGE = { prenom: 80, nom: 80, email: 254, telephone: 30, message: 5000, nb_personnes: 5000 } as const;

/**
 * Forme simple `local@domaine.tld`, sans espaces ni caractères de contrôle, ni
 * caractères qui changent le sens d'un lien `mailto:` (`? & % # / \ , ; < > " ' ( )`).
 */
const CAR_EMAIL = String.raw`[^\s@?&%#/\\,;<>"'()\x00-\x1f\x7f]`;
const RE_EMAIL = new RegExp(`^${CAR_EMAIL}+@${CAR_EMAIL}+\\.${CAR_EMAIL}{2,}$`);

export function estEmailValide(v: unknown): v is string {
  return typeof v === "string" && v.length <= LIMITES_MESSAGE.email && RE_EMAIL.test(v);
}

/** Téléphone français ou international lisible (chiffres, espaces, points, +). */
export function estTelephoneValide(v: string): boolean {
  const chiffres = v.replace(/[\s.\-()]/g, "");
  return /^\+?\d{9,15}$/.test(chiffres);
}

export function estTypeMessage(v: unknown): v is TypeMessage {
  return typeof v === "string" && (TYPES_MESSAGE as readonly string[]).includes(v);
}

/** Valide et nettoie une saisie ; erreurs par champ, en français. */
export function validerMessage(
  e: Partial<Record<keyof EntreeMessage, unknown>>,
): { ok: true; donnees: EntreeMessage } | { ok: false; erreurs: Partial<Record<keyof EntreeMessage, string>> } {
  const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const type = estTypeMessage(e.type) ? e.type : "autre";
  const nb = e.nb_personnes === null || e.nb_personnes === undefined || e.nb_personnes === "" ? null : Number(e.nb_personnes);
  const date = typeof e.date_evenement === "string" && e.date_evenement ? e.date_evenement : null;
  const donnees: EntreeMessage = {
    type,
    prenom: s(e.prenom, LIMITES_MESSAGE.prenom).replace(/\s+/g, " "),
    nom: s(e.nom, LIMITES_MESSAGE.nom).replace(/\s+/g, " "),
    email: s(e.email, LIMITES_MESSAGE.email).toLowerCase(),
    telephone: s(e.telephone, LIMITES_MESSAGE.telephone),
    date_evenement: date,
    nb_personnes: nb,
    message: s(e.message, LIMITES_MESSAGE.message).replace(/\r\n?/g, "\n"),
  };
  const erreurs: Partial<Record<keyof EntreeMessage, string>> = {};
  if (!donnees.prenom) erreurs.prenom = "Merci d’indiquer votre prénom.";
  if (!donnees.nom) erreurs.nom = "Merci d’indiquer votre nom.";
  if (!estEmailValide(donnees.email)) erreurs.email = "Adresse e-mail invalide.";
  if (donnees.telephone && !estTelephoneValide(donnees.telephone)) erreurs.telephone = "Numéro de téléphone invalide.";
  if (date && !estJourIso(date)) erreurs.date_evenement = "Date invalide.";
  if (nb !== null && (!Number.isInteger(nb) || nb < 1 || nb > LIMITES_MESSAGE.nb_personnes)) erreurs.nb_personnes = "Nombre de personnes invalide.";
  if (donnees.message.length < 5) erreurs.message = "Votre message est trop court.";
  return Object.keys(erreurs).length ? { ok: false, erreurs } : { ok: true, donnees };
}

export function creerMessage(e: EntreeMessage): Message {
  const res = stmt(
    `INSERT INTO messages (type, prenom, nom, email, telephone, date_evenement, nb_personnes, message)
     VALUES (@type, @prenom, @nom, @email, @telephone, @date_evenement, @nb_personnes, @message)`,
  ).run(e);
  return lireMessage(Number(res.lastInsertRowid))!;
}

export function lireMessage(id: number): Message | null {
  return (stmt("SELECT * FROM messages WHERE id = ?").get(id) as Message | undefined) ?? null;
}

/** Liste (BO) : filtres non lus, type, recherche par e-mail (sous-chaîne). */
export function listerMessages(
  opts: { nonLusSeulement?: boolean; type?: TypeMessage; email?: string; limite?: number; decalage?: number } = {},
): Message[] {
  const email = (opts.email ?? "").trim();
  return stmt(
    `SELECT * FROM messages
     WHERE (@nonlus = 0 OR lu_le IS NULL)
       AND (@type = '' OR type = @type)
       AND (@email = '' OR email LIKE '%' || @email || '%' ESCAPE '\\')
     ORDER BY created_at DESC, id DESC LIMIT @limite OFFSET @decalage`,
  ).all({
    nonlus: opts.nonLusSeulement ? 1 : 0,
    type: opts.type ?? "",
    email: email.replace(/[\\%_]/g, (c) => `\\${c}`),
    limite: Math.min(Math.max(opts.limite ?? 100, 1), 500),
    decalage: Math.max(opts.decalage ?? 0, 0),
  }) as Message[];
}

export function compterMessagesNonLus(): number {
  return (stmt("SELECT COUNT(*) AS n FROM messages WHERE lu_le IS NULL").get() as { n: number }).n;
}

export function compterMessages(): number {
  return (stmt("SELECT COUNT(*) AS n FROM messages").get() as { n: number }).n;
}

export function marquerMessageLu(id: number, lu = true): void {
  stmt("UPDATE messages SET lu_le = ? WHERE id = ?").run(lu ? new Date().toISOString() : null, id);
}

/** Supprime un message. Renvoie la ligne. */
export function supprimerMessage(id: number): Message | null {
  return (stmt("DELETE FROM messages WHERE id = ? RETURNING *").get(id) as Message | undefined) ?? null;
}

/** Droit à l'effacement : tous les messages d'une adresse exacte. Renvoie les lignes. */
export function supprimerMessagesParEmail(email: string): Message[] {
  return stmt("DELETE FROM messages WHERE email = ? COLLATE NOCASE RETURNING *").all(email.trim()) as Message[];
}

/** Droit d'accès : messages d'une adresse exacte. */
export function listerMessagesParEmail(email: string): Message[] {
  return stmt("SELECT * FROM messages WHERE email = ? COLLATE NOCASE ORDER BY created_at DESC, id DESC").all(email.trim()) as Message[];
}

/** Purge des messages plus vieux que `mois` mois (12 par défaut). Renvoie le nombre supprimé. */
export function purgerMessagesAnciens(mois: number = siteConfig.confidentialite.conservationMessagesMois, maintenant = new Date()): number {
  const limite = new Date(maintenant);
  limite.setUTCMonth(limite.getUTCMonth() - mois);
  return stmt("DELETE FROM messages WHERE created_at < ?").run(limite.toISOString()).changes;
}
