/**
 * Outils PURS des pages publiques (aucun accès à la base) : extraits de la
 * carte traiteur, fourchettes de prix, phrases d'horaires, dates des fêtes.
 * Les données arrivent toujours de `lib/` (carteTraiteur(), lireHoraires()...).
 */

import { JOURS, LIBELLES_JOURS, type CleJour, type HorairesSemaine, type Plage } from "@/config/site";
import { formaterJourLong, jourParis } from "@/lib/dates";
import { formaterHeure } from "@/lib/horaires";
import type { MenuComplet, Plat, SectionAvecPlats } from "@/lib/menus";
import { montantSchema, normaliserPrix } from "@/lib/prix";
import { slugifier } from "@/lib/slug";

// ---------------------------------------------------------------------------
// Carte
// ---------------------------------------------------------------------------

/** Ancre stable d'une section de carte (« Petit dînatoire » -> `petit-dinatoire`). */
export function ancreSection(titre: string): string {
  return slugifier(titre) || "section";
}

const normaliser = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Plat d'un menu retrouvé par son nom (insensible aux accents et à la casse). */
export function trouverPlat(menu: MenuComplet | null, nom: string): Plat | null {
  if (!menu) return null;
  const cible = normaliser(nom);
  for (const s of menu.sections) for (const p of s.plats) if (normaliser(p.nom) === cible) return p;
  return null;
}

/** Section d'un menu retrouvée par son titre. */
export function trouverSection(menu: MenuComplet | null, titre: string): SectionAvecPlats | null {
  if (!menu) return null;
  const cible = normaliser(titre);
  return menu.sections.find((s) => normaliser(s.titre) === cible) ?? null;
}

/** Montant numérique d'un prix (« 4,90 € » -> 4.9), `null` si texte libre. */
export function montant(prix: string): number | null {
  const m = montantSchema(prix);
  return m === null ? null : Number(m);
}

/** Montant -> prix affiché (« 17 € », « 7,50 € »). */
export function prixDepuisMontant(n: number): string {
  return normaliserPrix(n.toFixed(2).replace(".", ","));
}

/**
 * Fourchette de prix d'une liste de plats (« de 4 € à 12,50 € »), bornée
 * éventuellement (`min`/`max`) pour ne garder que les pièces courantes.
 */
export function fourchette(plats: Plat[], bornes: { min?: number; max?: number } = {}): string | null {
  const montants = plats
    .map((p) => montant(p.prix))
    .filter((n): n is number => n !== null && (bornes.min === undefined || n >= bornes.min) && (bornes.max === undefined || n <= bornes.max));
  if (!montants.length) return null;
  const bas = Math.min(...montants);
  const haut = Math.max(...montants);
  return bas === haut ? prixDepuisMontant(bas) : `de ${prixDepuisMontant(bas)} à ${prixDepuisMontant(haut)}`;
}

/** Année lue dans un titre (« Carte traiteur 2027 » -> "2027"). */
export function anneeDuTitre(titre: string | null | undefined): string | null {
  return titre?.match(/\b(20\d{2})\b/)?.[1] ?? null;
}

// ---------------------------------------------------------------------------
// Horaires
// ---------------------------------------------------------------------------

/** "7h30–13h" (minutes nulles omises, comme les textes de docs/COPY.md). */
export function plageCourte(p: Plage): string {
  return `${formaterHeure(p.ouverture)}–${formaterHeure(p.fermeture)}`;
}

/** Plages d'un jour : « 7h30–13h et 15h–19h » ou « fermé ». */
export function jourCourt(plages: Plage[], separateur = " et "): string {
  return plages.length ? plages.map(plageCourte).join(separateur) : "Fermé";
}

/** Jours (même non consécutifs) regroupés par horaires identiques, dans l'ordre de la semaine. */
export function groupesParHoraires(h: HorairesSemaine): { jours: CleJour[]; plages: Plage[] }[] {
  const groupes: { cle: string; jours: CleJour[]; plages: Plage[] }[] = [];
  for (const j of JOURS) {
    const cle = JSON.stringify(h[j]);
    const g = groupes.find((x) => x.cle === cle);
    if (g) g.jours.push(j);
    else groupes.push({ cle, jours: [j], plages: h[j] });
  }
  return groupes.map(({ jours, plages }) => ({ jours, plages }));
}

function listeJours(jours: CleJour[], article = ""): string {
  const noms = jours.map((j) => `${article}${LIBELLES_JOURS[j].toLowerCase()}`);
  return noms.length <= 1 ? noms.join("") : `${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]}`;
}

const enMinutes = (hhmm: string) => {
  const [a, b] = hhmm.split(":").map(Number);
  return a * 60 + b;
};

/** Une plage unique qui couvre la mi-journée : « sans interruption ». */
const continue_ = (plages: Plage[]) => plages.length === 1 && enMinutes(plages[0].ouverture) <= 12 * 60 && enMinutes(plages[0].fermeture) >= 15 * 60;

/**
 * Phrase complète des horaires, générée depuis la base :
 * « ouverte le mardi et le vendredi de 7h30 à 13h et de 15h à 19h, …, et le
 * dimanche de 8h à 12h. Elle est fermée le lundi. »
 */
export function phraseHoraires(h: HorairesSemaine): string {
  const groupes = groupesParHoraires(h);
  const ouverts = groupes.filter((g) => g.plages.length);
  const fermes = groupes.filter((g) => !g.plages.length).flatMap((g) => g.jours);
  const morceaux = ouverts.map((g) => {
    const heures = g.plages.map((p) => `de ${formaterHeure(p.ouverture)} à ${formaterHeure(p.fermeture)}`).join(" et ");
    return `${listeJours(g.jours, "le ")} ${heures}${continue_(g.plages) ? " sans interruption" : ""}`;
  });
  const ouverture = morceaux.length > 1 ? `${morceaux.slice(0, -1).join(", ")} et ${morceaux[morceaux.length - 1]}` : morceaux.join("");
  return `Elle est ouverte ${ouverture}.${fermes.length ? ` Elle est fermée ${listeJours(fermes, "le ")}.` : ""}`;
}

/** Horaires en réponse de FAQ : « Mardi et vendredi : 7h30–13h et 15h–19h. … Fermé le lundi. » */
export function horairesEnLignes(h: HorairesSemaine): string {
  const groupes = groupesParHoraires(h);
  const ouverts = groupes.filter((g) => g.plages.length);
  const fermes = groupes.filter((g) => !g.plages.length).flatMap((g) => g.jours);
  const lignes = ouverts.map((g) => {
    const jours = listeJours(g.jours);
    return `${jours.charAt(0).toUpperCase()}${jours.slice(1)} : ${jourCourt(g.plages)}${continue_(g.plages) ? " en continu" : ""}.`;
  });
  if (fermes.length) lignes.push(`Fermé ${listeJours(fermes, "le ")}.`);
  return lignes.join(" ");
}

/** Nombre de jours d'ouverture dans la semaine. */
export function joursOuverts(h: HorairesSemaine): number {
  return JOURS.filter((j) => h[j].length > 0).length;
}

// ---------------------------------------------------------------------------
// Fêtes
// ---------------------------------------------------------------------------

/**
 * Dates limites de commande lues dans `menus.infos_commande`
 * (« … avant le dimanche 20 décembre pour Noël, et avant le jeudi 24 décembre
 * pour le jour de l’An. »). Rien n'est supposé : `null` si absent.
 */
export function datesLimitesFetes(menu: MenuComplet | null | undefined): { noel: string | null; nouvelAn: string | null; annee: string | null } {
  const texte = menu?.infos_commande ?? "";
  const noel = texte.match(/avant le ([^,.;]+?) pour Noël/i)?.[1]?.trim() ?? null;
  const nouvelAn = texte.match(/avant le ([^,.;]+?) pour le jour de l[’']An/i)?.[1]?.trim() ?? null;
  return { noel, nouvelAn, annee: anneeDuTitre(menu?.titre) };
}

/** Lignes non vides d'un texte multiligne de la base. */
export function lignes(texte: string | null | undefined): string[] {
  return (texte ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** « du 1er janvier au 31 décembre 2027 » (année commune factorisée), ou `null`. */
export function periode(du: string | null, au: string | null): string | null {
  if (!du || !au) return null;
  const sansJour = (j: string) => formaterJourLong(j).replace(/^\S+ /, "");
  const debut = du.slice(0, 4) === au.slice(0, 4) ? sansJour(du).replace(/ \d{4}$/, "") : sansJour(du);
  return `du ${debut} au ${sansJour(au)}`;
}

/** « 26 octobre 2026 » depuis un horodatage ISO (jour de Paris). */
export function dateArticle(iso: string | null): string {
  if (!iso) return "";
  const jour = jourParis(new Date(iso));
  const [a, m, j] = jour.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" })
    .format(new Date(Date.UTC(a, m - 1, j)))
    .replace(/^1 /, "1er ");
}

/** Image de partage : une vraie photo seulement (jamais un visuel provisoire IA), sinon la carte OG générée. */
export function photoPartage<T extends { provisoire: boolean }>(image: T | null | undefined): T | null {
  return image && !image.provisoire ? image : null;
}
