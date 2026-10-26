/**
 * Avis clients (table `avis`), saisis À LA MAIN depuis le BO à partir d'avis
 * réels (Google ou reçus directement). Aucun avis inventé, aucun
 * `aggregateRating` en JSON-LD (contrat).
 */

import { estJourIso } from "./dates";
import { bool, stmt, transaction } from "./db";
import { echangerDansListe } from "./ordre";

export const SOURCES_AVIS = ["google", "direct"] as const;
export type SourceAvis = (typeof SOURCES_AVIS)[number];
export const LIMITES_AVIS = { auteur: 80, texte: 1500 } as const;

export type Avis = {
  id: number;
  auteur: string;
  texte: string;
  note: number;
  source: SourceAvis;
  /** Jour ISO de l'avis, ou `null`. */
  date: string | null;
  visible: boolean;
  position: number;
};

export type EntreeAvis = { auteur: string; texte: string; note: number; source: SourceAvis; date: string | null; visible?: boolean };

type Ligne = Omit<Avis, "visible"> & { visible: number };
const versAvis = (l: Ligne): Avis => ({ ...l, visible: bool(l.visible) });

export function listerAvisPublics(limite = 50): Avis[] {
  return (stmt("SELECT * FROM avis WHERE visible = 1 ORDER BY position, id LIMIT ?").all(limite) as Ligne[]).map(versAvis);
}

export function listerAvisAdmin(): Avis[] {
  return (stmt("SELECT * FROM avis ORDER BY position, id").all() as Ligne[]).map(versAvis);
}

export function lireAvis(id: number): Avis | null {
  const l = stmt("SELECT * FROM avis WHERE id = ?").get(id) as Ligne | undefined;
  return l ? versAvis(l) : null;
}

export function validerAvis(e: Partial<Record<keyof EntreeAvis, unknown>>):
  | { ok: true; donnees: EntreeAvis }
  | { ok: false; erreurs: Partial<Record<keyof EntreeAvis, string>> } {
  const erreurs: Partial<Record<keyof EntreeAvis, string>> = {};
  const auteur = typeof e.auteur === "string" ? e.auteur.replace(/\s+/g, " ").trim().slice(0, LIMITES_AVIS.auteur) : "";
  const texte = typeof e.texte === "string" ? e.texte.trim().slice(0, LIMITES_AVIS.texte) : "";
  const note = Number(e.note);
  if (!auteur) erreurs.auteur = "Indiquez le nom (ou prénom) de l’auteur.";
  if (texte.length < 5) erreurs.texte = "Recopiez le texte de l’avis.";
  if (!Number.isInteger(note) || note < 1 || note > 5) erreurs.note = "Note de 1 à 5.";
  const date = typeof e.date === "string" && e.date ? e.date : null;
  if (date && !estJourIso(date)) erreurs.date = "Date invalide.";
  if (Object.keys(erreurs).length) return { ok: false, erreurs };
  return {
    ok: true,
    donnees: { auteur, texte, note, source: e.source === "google" ? "google" : "direct", date, visible: e.visible !== false },
  };
}

export function creerAvis(e: EntreeAvis): Avis {
  const pos = (stmt("SELECT COALESCE(MAX(position), 0) + 1 AS p FROM avis").get() as { p: number }).p;
  const res = stmt("INSERT INTO avis (auteur, texte, note, source, date, visible, position) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    e.auteur,
    e.texte,
    e.note,
    e.source,
    e.date,
    e.visible === false ? 0 : 1,
    pos,
  );
  return lireAvis(Number(res.lastInsertRowid))!;
}

export function modifierAvis(id: number, e: Partial<EntreeAvis>): Avis | null {
  const cur = lireAvis(id);
  if (!cur) return null;
  const v = { ...cur, ...e };
  stmt("UPDATE avis SET auteur = ?, texte = ?, note = ?, source = ?, date = ?, visible = ? WHERE id = ?").run(
    v.auteur,
    v.texte,
    v.note,
    v.source,
    v.date,
    v.visible ? 1 : 0,
    id,
  );
  return lireAvis(id);
}

export function definirAvisVisible(id: number, visible: boolean): void {
  stmt("UPDATE avis SET visible = ? WHERE id = ?").run(visible ? 1 : 0, id);
}

/** Supprime un avis. Renvoie la ligne. */
export function supprimerAvis(id: number): Avis | null {
  const l = stmt("DELETE FROM avis WHERE id = ? RETURNING *").get(id) as Ligne | undefined;
  return l ? versAvis(l) : null;
}

export function ordonnerAvis(ids: number[]): void {
  const existants = new Set(listerAvisAdmin().map((a) => a.id));
  const maj = stmt("UPDATE avis SET position = ? WHERE id = ?");
  transaction(() => ids.filter((i) => existants.has(i)).forEach((id, i) => maj.run(i + 1, id)));
}

export function deplacerAvis(id: number, sens: "haut" | "bas"): void {
  ordonnerAvis(echangerDansListe(listerAvisAdmin().map((a) => a.id), id, sens));
}

export function compterAvis(): number {
  return (stmt("SELECT COUNT(*) AS n FROM avis").get() as { n: number }).n;
}
