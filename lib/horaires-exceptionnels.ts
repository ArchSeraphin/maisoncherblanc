/**
 * Horaires exceptionnels (table `horaires_exceptionnels`) : fermetures et
 * ouvertures exceptionnelles, une ligne par jour.
 *
 * `plages` : `[]` = fermé ; `[{ouverture, fermeture}]` = ouvert à ces horaires ;
 * `null` = ouvert, horaires précisés dans `note` (ex. « Les commandes sont à
 * récupérer avant 17h00 »). Affichés sur le site (contact, pied de page si dans
 * les 30 jours) et en JSON-LD (`specialOpeningHoursSpecification`).
 * Purge automatique des dates passées depuis plus de 60 jours (maintenance).
 */

import type { Plage } from "@/config/site";
import { ajouterJours, estJourIso, jourParis } from "./dates";
import { lireJson, stmt } from "./db";
import { erreurPlages, normaliserPlages, type ResultatValidation } from "./reglages";

export type HoraireExceptionnel = {
  id: number;
  /** Jour ISO `AAAA-MM-JJ`. */
  date: string;
  libelle: string;
  /** `[]` fermé, `null` ouvert (voir la note), sinon les plages d'ouverture. */
  plages: Plage[] | null;
  note: string;
  ferme: boolean;
};

export type EntreeHoraireExceptionnel = { date: string; libelle?: string; plages: Plage[] | null; note?: string };

type Ligne = { id: number; date: string; libelle: string; plages: string | null; note: string };

function versHoraire(l: Ligne): HoraireExceptionnel {
  const plages = l.plages === null ? null : normaliserPlages(lireJson<unknown>(l.plages, []));
  return { id: l.id, date: l.date, libelle: l.libelle, plages, note: l.note, ferme: plages !== null && plages.length === 0 };
}

export const LIMITES_HORAIRE_EXCEPTIONNEL = { libelle: 120, note: 240 } as const;

/** Tous (BO), du plus proche au plus lointain ; `aPartirDu` filtre les dates passées. */
export function listerHorairesExceptionnels(opts: { aPartirDu?: string } = {}): HoraireExceptionnel[] {
  const lignes = stmt("SELECT * FROM horaires_exceptionnels WHERE date >= ? ORDER BY date").all(opts.aPartirDu ?? "0000-00-00") as Ligne[];
  return lignes.map(versHoraire);
}

/** À venir dans les `jours` prochains jours (aujourd'hui inclus), pour le site. */
export function horairesExceptionnelsAVenir(jours = 30, aujourdhui: string = jourParis()): HoraireExceptionnel[] {
  const lignes = stmt("SELECT * FROM horaires_exceptionnels WHERE date >= ? AND date <= ? ORDER BY date").all(
    aujourdhui,
    ajouterJours(aujourdhui, jours),
  ) as Ligne[];
  return lignes.map(versHoraire);
}

export function lireHoraireExceptionnel(id: number): HoraireExceptionnel | null {
  const l = stmt("SELECT * FROM horaires_exceptionnels WHERE id = ?").get(id) as Ligne | undefined;
  return l ? versHoraire(l) : null;
}

export function lireHoraireExceptionnelParDate(date: string): HoraireExceptionnel | null {
  const l = stmt("SELECT * FROM horaires_exceptionnels WHERE date = ?").get(date) as Ligne | undefined;
  return l ? versHoraire(l) : null;
}

/** Valide une saisie du BO. */
export function validerHoraireExceptionnel(entree: {
  date?: unknown;
  libelle?: unknown;
  plages?: unknown;
  note?: unknown;
  /** "ferme" | "horaires" | "note" */
  mode?: unknown;
}): ResultatValidation<EntreeHoraireExceptionnel, "date" | "plages" | "libelle" | "note"> {
  const erreurs: Partial<Record<"date" | "plages" | "libelle" | "note", string>> = {};
  if (!estJourIso(entree.date)) erreurs.date = "Choisissez une date.";
  const libelle = typeof entree.libelle === "string" ? entree.libelle.replace(/\s+/g, " ").trim().slice(0, LIMITES_HORAIRE_EXCEPTIONNEL.libelle) : "";
  const note = typeof entree.note === "string" ? entree.note.replace(/\s+/g, " ").trim().slice(0, LIMITES_HORAIRE_EXCEPTIONNEL.note) : "";
  let plages: Plage[] | null = [];
  if (entree.mode === "note") {
    plages = null;
    if (!note) erreurs.note = "Précisez les horaires dans la note.";
  } else if (entree.mode === "horaires") {
    const brutes = Array.isArray(entree.plages) ? (entree.plages as Plage[]) : [];
    const e = erreurPlages(brutes) ?? (brutes.length === 0 ? "Indiquez au moins une plage d’ouverture." : null);
    if (e) erreurs.plages = e;
    plages = normaliserPlages(brutes);
  }
  if (Object.keys(erreurs).length) return { ok: false, erreurs };
  return { ok: true, donnees: { date: entree.date as string, libelle, plages, note } };
}

/** Crée ou remplace l'horaire d'un jour (une ligne par date). */
export function enregistrerHoraireExceptionnel(e: EntreeHoraireExceptionnel): HoraireExceptionnel {
  const l = stmt(
    `INSERT INTO horaires_exceptionnels (date, libelle, plages, note) VALUES (@date, @libelle, @plages, @note)
     ON CONFLICT(date) DO UPDATE SET libelle = excluded.libelle, plages = excluded.plages, note = excluded.note
     RETURNING *`,
  ).get({
    date: e.date,
    libelle: e.libelle ?? "",
    plages: e.plages === null ? null : JSON.stringify(normaliserPlages(e.plages)),
    note: e.note ?? "",
  }) as Ligne;
  return versHoraire(l);
}

/** Crée la ligne seulement si la date est libre (seed idempotent). Renvoie `true` si créée. */
export function creerHoraireExceptionnelSiAbsent(e: EntreeHoraireExceptionnel): boolean {
  if (lireHoraireExceptionnelParDate(e.date)) return false;
  enregistrerHoraireExceptionnel(e);
  return true;
}

/** Modifie une ligne existante (la date peut changer si elle reste libre). */
export function modifierHoraireExceptionnel(id: number, e: EntreeHoraireExceptionnel): HoraireExceptionnel | null {
  const autre = lireHoraireExceptionnelParDate(e.date);
  if (autre && autre.id !== id) throw new Error("Un horaire exceptionnel existe déjà à cette date.");
  const l = stmt(
    `UPDATE horaires_exceptionnels SET date = @date, libelle = @libelle, plages = @plages, note = @note WHERE id = @id RETURNING *`,
  ).get({
    id,
    date: e.date,
    libelle: e.libelle ?? "",
    plages: e.plages === null ? null : JSON.stringify(normaliserPlages(e.plages)),
    note: e.note ?? "",
  }) as Ligne | undefined;
  return l ? versHoraire(l) : null;
}

/** Supprime une ligne. Renvoie la ligne supprimée. */
export function supprimerHoraireExceptionnel(id: number): HoraireExceptionnel | null {
  const l = stmt("DELETE FROM horaires_exceptionnels WHERE id = ? RETURNING *").get(id) as Ligne | undefined;
  return l ? versHoraire(l) : null;
}

/** Maintenance : dates passées depuis plus de `jours` jours. Renvoie le nombre supprimé. */
export function purgerHorairesExceptionnelsPasses(jours = 60, aujourdhui: string = jourParis()): number {
  return stmt("DELETE FROM horaires_exceptionnels WHERE date < ?").run(ajouterJours(aujourdhui, -jours)).changes;
}
