/**
 * Dates (module PUR, importable côté client). Toutes les dates « métier »
 * (horaires exceptionnels, fenêtres de publication, validité d'un menu) sont
 * des jours ISO `AAAA-MM-JJ` interprétés en heure de Paris.
 */

const FUSEAU = "Europe/Paris";
const RE_JOUR = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Jour courant (ou de `date`) en heure de Paris, au format `AAAA-MM-JJ`. */
export function jourParis(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("fr-CA", { timeZone: FUSEAU, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/** Vrai si `v` est un jour ISO valide (`2026-12-25`). */
export function estJourIso(v: unknown): v is string {
  if (typeof v !== "string") return false;
  const m = RE_JOUR.exec(v);
  if (!m) return false;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.getUTCFullYear() === Number(m[1]) && d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[3]);
}

/** Ajoute `n` jours à un jour ISO. */
export function ajouterJours(jour: string, n: number): string {
  const [a, m, j] = jour.split("-").map(Number);
  const d = new Date(Date.UTC(a, m - 1, j + n));
  return d.toISOString().slice(0, 10);
}

/** Clé de jour de semaine (`lundi`...) d'un jour ISO. */
export function jourDeSemaine(jour: string): "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche" {
  const [a, m, j] = jour.split("-").map(Number);
  const idx = new Date(Date.UTC(a, m - 1, j)).getUTCDay();
  return (["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"] as const)[idx];
}

/** « vendredi 25 décembre 2026 » (sans majuscule initiale). */
export function formaterJourLong(jour: string): string {
  const [a, m, j] = jour.split("-").map(Number);
  const texte = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(a, m - 1, j)));
  // « 1 janvier » -> « 1er janvier »
  return texte.replace(/\b1 (?=[a-zéû]+ \d{4})/, "1er ");
}

/** « 25 décembre » (sans l'année). */
export function formaterJourCourt(jour: string): string {
  const [a, m, j] = jour.split("-").map(Number);
  const texte = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", day: "numeric", month: "long" }).format(
    new Date(Date.UTC(a, m - 1, j)),
  );
  return texte.replace(/^1 /, "1er ");
}

/** Date et heure lisibles (« 26 octobre 2026 à 21:05 ») d'un horodatage ISO. */
export function formaterHorodatage(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", { timeZone: FUSEAU, dateStyle: "long", timeStyle: "short" }).format(d);
}

/** Vrai si `jour` est dans la fenêtre [du, au] (bornes incluses, `null` = ouverte). */
export function dansFenetre(jour: string, du: string | null, au: string | null): boolean {
  if (du && jour < du) return false;
  if (au && jour > au) return false;
  return true;
}

/**
 * Convertit une heure locale de Paris saisie dans un champ `datetime-local`
 * (« 2026-12-01T09:30 ») en horodatage ISO UTC. `null` si invalide.
 */
export function isoDepuisHeureParis(local: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local.trim());
  if (!m) return null;
  const [a, mo, j, h, mi] = m.slice(1).map(Number);
  const supposeUtc = Date.UTC(a, mo - 1, j, h, mi);
  // Décalage de Paris à cet instant (1 h ou 2 h), calculé par Intl.
  const parties = new Intl.DateTimeFormat("en-GB", {
    timeZone: FUSEAU,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(supposeUtc));
  const v = (t: string) => Number(parties.find((p) => p.type === t)?.value);
  const vuParis = Date.UTC(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"));
  const d = new Date(supposeUtc - (vuParis - supposeUtc));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Inverse : horodatage ISO -> valeur de champ `datetime-local` en heure de Paris. */
export function heureParisPourChamp(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const parties = new Intl.DateTimeFormat("en-GB", {
    timeZone: FUSEAU,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const v = (t: string) => parties.find((p) => p.type === t)?.value ?? "00";
  return `${v("year")}-${v("month")}-${v("day")}T${v("hour")}:${v("minute")}`;
}
