/**
 * Démarrage du journal du seed (lib/seed-journal.ts), partagé par
 * `npm run seed` et `npm run import-medias`.
 *
 * - Base neuve (rien d'importé) : on pose le marqueur `seed:journal`, chaque
 *   élément sera journalisé à sa création.
 * - Base déjà remplie SANS journal (seed antérieur au journal) : MIGRATION.
 *   Tout ce que le seed aurait créé est journalisé tel qu'il est aujourd'hui,
 *   sans rien recréer : un menu, un article de lancement, un horaire
 *   exceptionnel, un PDF ou un emplacement absent est considéré comme retiré
 *   dans le backoffice, et un emplacement rempli n'est plus jamais réécrit
 *   (on ignore s'il a été choisi dans le BO). Seule exception : un média du
 *   manifeste ENCORE JAMAIS IMPORTÉ (ajouté au manifeste depuis) reste à
 *   importer avec sa réalisation.
 * - Base au journal déjà tenu : rien.
 */

import { ARTICLES_LANCEMENT } from "./seed-contenus";
import { MENU_CARTE_2027 } from "./donnees/carte-traiteur-2027";
import { HORAIRES_FETES_2026, MENU_FETES_2026 } from "./donnees/menu-fetes-2026";
import { categorieManifeste, dossiersAvecManifeste, lireManifeste } from "./_import-medias";

/** Menus créés par le seed : clé de journal, définition, clé du PDF rattaché. */
export const MENUS_SEED = [
  { cle: "menu:carte-2027", clePdf: "pdf:carte-2027", def: MENU_CARTE_2027 },
  { cle: "menu:fetes-2026", clePdf: "pdf:fetes-2026", def: MENU_FETES_2026 },
] as const;

export type DemarrageJournal = { mode: "neuf" | "migration" | "suivi"; cles: number };

export async function demarrerJournal(racineMedias: string): Promise<DemarrageJournal> {
  const J = await import("../lib/seed-journal");
  const { transaction } = await import("../lib/db");
  J.assurerJournal();
  if (J.estJournalise(J.CLE_MARQUEUR)) return { mode: "suivi", cles: J.compterJournal() };
  if (!J.baseDejaRemplie()) {
    J.journaliser(J.CLE_MARQUEUR);
    return { mode: "neuf", cles: J.compterJournal() };
  }

  const { lireMenuParSlug, listerMenus } = await import("../lib/menus");
  const { lireMediaParSource } = await import("../lib/media");
  const { realisationDuMedia } = await import("../lib/realisations");
  const { lireArticle } = await import("../lib/articles");
  const { estCleEmplacement } = await import("../lib/emplacements");
  const { stmt } = await import("../lib/db");

  transaction(() => {
    // Menus : même adresse ET même titre, sinon même titre (la carte a pu être renommée par une mise en ligne).
    for (const { cle, clePdf, def } of MENUS_SEED) {
      const parSlug = def.slug ? lireMenuParSlug(def.slug) : null;
      const menu = parSlug && parSlug.titre === def.titre ? parSlug : (listerMenus().find((m) => m.titre === def.titre) ?? null);
      J.journaliser(cle, menu?.id ?? null);
      J.journaliser(clePdf, menu?.pdf_media_id ?? null);
    }

    for (const a of ARTICLES_LANCEMENT) {
      const l = stmt("SELECT id FROM articles WHERE slug = ?").get(a.slug) as { id: number } | undefined;
      J.journaliser(`article:${a.slug}`, l && lireArticle(l.id) ? l.id : null);
    }

    for (const h of HORAIRES_FETES_2026) J.journaliser(`horaire:${h.date}`);

    const cles = new Set<string>(["contact-boutique"]);
    for (const dossier of dossiersAvecManifeste(racineMedias)) {
      for (const e of lireManifeste(racineMedias, dossier) ?? []) {
        if (e.emplacement && estCleEmplacement(e.emplacement)) cles.add(e.emplacement);
        const source = `${dossier}/${e.fichier}`;
        const media = categorieManifeste(e) ? lireMediaParSource(source) : null;
        // Média déjà importé : sa réalisation (présente ou supprimée dans le BO) est réglée.
        if (media) J.journaliser(`realisation:${source}`, realisationDuMedia(media.id)?.id ?? null);
      }
    }
    // Provenance inconnue (seed ou choix dans le BO) : `ref` nul, l'emplacement ne sera plus jamais réécrit.
    for (const c of cles) J.journaliser(`emplacement:${c}`, null);

    J.journaliser(J.CLE_MARQUEUR);
  });
  return { mode: "migration", cles: J.compterJournal() };
}
