/**
 * Mesure d'audience maison (table `page_views`) : compteur agrégé par jour et
 * par chemin, SANS IP, SANS cookie, SANS identifiant. Aucun traceur déposé :
 * hors article 82, donc aucun bandeau de consentement.
 *
 * Bornes : chemin <= 200 caractères, <= 500 chemins distincts par jour,
 * purge au-delà de 25 mois. L'enregistrement passe par `compterVue()`
 * (lib/compter-vue.ts), appelé depuis les PAGES (jamais le layout).
 */

import { siteConfig } from "@/config/site";
import { jourParis } from "./dates";
import { stmt } from "./db";

const LONGUEUR_MAX = 200;
const CHEMINS_MAX_PAR_JOUR = 500;

/** Normalise un chemin (sans query, sans slash final, minuscule). `null` si refusé. */
export function normaliserCheminVue(brut: string): string | null {
  let p = brut.split("?")[0].split("#")[0];
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1) p = p.replace(/\/+$/, "");
  p = p.toLowerCase();
  return p.length > LONGUEUR_MAX ? null : p;
}

/** Incrémente le compteur du jour pour `chemin` (borné). */
export function enregistrerVue(chemin: string, date: Date = new Date()): boolean {
  const p = normaliserCheminVue(chemin);
  if (!p) return false;
  const jour = jourParis(date);
  if (stmt("UPDATE page_views SET compte = compte + 1 WHERE jour = ? AND chemin = ?").run(jour, p).changes > 0) return true;
  const n = (stmt("SELECT COUNT(*) AS n FROM page_views WHERE jour = ?").get(jour) as { n: number }).n;
  if (n >= CHEMINS_MAX_PAR_JOUR) return false;
  stmt("INSERT INTO page_views (jour, chemin, compte) VALUES (?, ?, 1) ON CONFLICT(jour, chemin) DO UPDATE SET compte = compte + 1").run(jour, p);
  return true;
}

export type SyntheseVues = {
  jours: number;
  total: number;
  aujourdhui: number;
  parJour: { jour: string; compte: number }[];
  pagesLesPlusVues: { chemin: string; compte: number }[];
};

/** Synthèse du tableau de bord sur `jours` jours (aujourd'hui inclus), jours sans vue à 0. */
export function syntheseVues(jours = 30, maintenant: Date = new Date()): SyntheseVues {
  const debut = new Date(maintenant);
  debut.setDate(debut.getDate() - (jours - 1));
  const jourDebut = jourParis(debut);
  const lignes = stmt("SELECT jour, SUM(compte) AS compte FROM page_views WHERE jour >= ? GROUP BY jour").all(jourDebut) as {
    jour: string;
    compte: number;
  }[];
  const parJourMap = new Map(lignes.map((l) => [l.jour, l.compte]));
  const parJour: { jour: string; compte: number }[] = [];
  for (let i = jours - 1; i >= 0; i--) {
    const d = new Date(maintenant);
    d.setDate(d.getDate() - i);
    const j = jourParis(d);
    parJour.push({ jour: j, compte: parJourMap.get(j) ?? 0 });
  }
  const pagesLesPlusVues = stmt(
    "SELECT chemin, SUM(compte) AS compte FROM page_views WHERE jour >= ? GROUP BY chemin ORDER BY compte DESC LIMIT 10",
  ).all(jourDebut) as { chemin: string; compte: number }[];
  return {
    jours,
    total: parJour.reduce((s, d) => s + d.compte, 0),
    aujourdhui: parJourMap.get(jourParis(maintenant)) ?? 0,
    parJour,
    pagesLesPlusVues,
  };
}

/** Purge des agrégats anciens (25 mois par défaut). */
export function purgerVuesAnciennes(mois: number = siteConfig.confidentialite.conservationStatistiquesMois): number {
  const limite = new Date();
  limite.setMonth(limite.getMonth() - mois);
  return stmt("DELETE FROM page_views WHERE jour < ?").run(jourParis(limite)).changes;
}
