/**
 * Mise en forme des horaires (module PUR, aucune base : importable côté client).
 * Les horaires viennent de `lireHoraires()` (lib/reglages.ts) et
 * `listerHorairesExceptionnels*()` (lib/horaires-exceptionnels.ts).
 *
 * Typographie : le demi-cadratin (U+2013) sert uniquement aux intervalles.
 */

import { JOURS, LIBELLES_JOURS, type CleJour, type HorairesSemaine, type Plage } from "@/config/site";

const DEMI_CADRATIN = "–";

/** "07:30" -> "7h30", "13:00" -> "13h00" (style des cartes imprimées). */
export function formaterHeure(hhmm: string, opts: { minutesZero?: boolean } = {}): string {
  const [h, m] = hhmm.split(":");
  const heure = String(Number(h));
  if (m === "00" && !opts.minutesZero) return `${heure}h`;
  return `${heure}h${m}`;
}

/** { ouverture: "07:30", fermeture: "13:00" } -> "7h30–13h00". */
export function formaterPlage(p: Plage, opts: { minutesZero?: boolean } = { minutesZero: true }): string {
  return `${formaterHeure(p.ouverture, opts)}${DEMI_CADRATIN}${formaterHeure(p.fermeture, opts)}`;
}

/** Plages d'un jour -> "7h30–13h00, 15h00–19h00" ou "Fermé". */
export function formaterJour(plages: Plage[], opts?: { minutesZero?: boolean }): string {
  return plages.length === 0 ? "Fermé" : plages.map((p) => formaterPlage(p, opts)).join(", ");
}

export type GroupeHoraires = { jours: CleJour[]; libelle: string; horaires: string; ferme: boolean };

/**
 * Regroupe les jours CONSÉCUTIFS aux horaires identiques.
 * Ex. [{ libelle: "Mercredi – Jeudi", horaires: "7h30–13h00" }, ...].
 */
export function grouperHoraires(h: HorairesSemaine, opts?: { minutesZero?: boolean }): GroupeHoraires[] {
  const groupes: GroupeHoraires[] = [];
  for (const jour of JOURS) {
    const texte = formaterJour(h[jour], opts);
    const dernier = groupes[groupes.length - 1];
    if (dernier && dernier.horaires === texte) dernier.jours.push(jour);
    else groupes.push({ jours: [jour], libelle: "", horaires: texte, ferme: h[jour].length === 0 });
  }
  for (const g of groupes) {
    const premier = LIBELLES_JOURS[g.jours[0]];
    const dernier = LIBELLES_JOURS[g.jours[g.jours.length - 1]];
    g.libelle =
      g.jours.length === 1 ? premier : g.jours.length === 2 ? `${premier} et ${dernier.toLowerCase()}` : `${premier} ${DEMI_CADRATIN} ${dernier}`;
  }
  return groupes;
}

/** Liste des 7 jours (lundi en tête) prête à afficher. */
export function lignesHoraires(h: HorairesSemaine, opts?: { minutesZero?: boolean }): { jour: CleJour; libelle: string; horaires: string; ferme: boolean }[] {
  return JOURS.map((jour) => ({ jour, libelle: LIBELLES_JOURS[jour], horaires: formaterJour(h[jour], opts), ferme: h[jour].length === 0 }));
}

function minutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Vrai si l'heure `hhmm` tombe dans une des plages. */
export function estDansPlages(plages: Plage[], hhmm: string): boolean {
  const t = minutes(hhmm);
  return plages.some((p) => t >= minutes(p.ouverture) && t < minutes(p.fermeture));
}
