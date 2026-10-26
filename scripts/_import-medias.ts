/**
 * Import des médias de départ depuis `seed-medias/<dossier>/manifest.json`
 * (partagé par `npm run seed` et `npm run import-medias`).
 *
 * Format (docs/CONTRAT.md) :
 *   [{ "fichier": "nom.jpg", "alt": "…", "emplacement": "boucherie-hero" | null,
 *      "realisation": "mariage" | null, "legende": "…" | null, "provisoire": false }]
 *
 * IDEMPOTENT : chaque fichier porte une clé `source` = "<dossier>/<fichier>" ;
 * un fichier déjà importé n'est pas recréé (son alt est seulement mis à jour
 * s'il était vide). Une réalisation n'est créée qu'une fois par média. Un
 * emplacement n'est rempli que s'il est vide, ou s'il porte un visuel
 * PROVISOIRE et que le nouveau est une vraie photo (jamais l'inverse) : les
 * choix faits ensuite dans le backoffice sont respectés.
 */

import fs from "node:fs";
import path from "node:path";

export type EntreeManifest = {
  fichier: string;
  alt?: string;
  emplacement?: string | null;
  realisation?: string | null;
  legende?: string | null;
  provisoire?: boolean;
};

export type BilanImport = { crees: number; existants: number; realisations: number; emplacements: number; erreurs: number };

const ANCIENNES_CATEGORIES: Record<string, string> = { "broche-fumoir": "broche-barbecue" };

export async function importerManifeste(racine: string, dossier: string): Promise<BilanImport> {
  const bilan: BilanImport = { crees: 0, existants: 0, realisations: 0, emplacements: 0, erreurs: 0 };
  const cheminManifeste = path.join(racine, dossier, "manifest.json");
  if (!fs.existsSync(cheminManifeste)) return bilan;
  let entrees: EntreeManifest[];
  try {
    entrees = JSON.parse(fs.readFileSync(cheminManifeste, "utf8")) as EntreeManifest[];
  } catch (err) {
    console.error(`  ${dossier}/manifest.json illisible : ${(err as Error).message}`);
    bilan.erreurs++;
    return bilan;
  }
  if (!Array.isArray(entrees)) throw new Error(`${dossier}/manifest.json doit être un tableau.`);

  const { enregistrerFichier } = await import("../lib/media-pipeline");
  const { lireMedia, lireMediaParSource, modifierAltMedia } = await import("../lib/media");
  const { creerRealisation, estCategorieRealisation, realisationDuMedia } = await import("../lib/realisations");
  const { definirEmplacement, estCleEmplacement, lireIdsEmplacements } = await import("../lib/emplacements");

  for (const e of entrees) {
    if (!e || typeof e.fichier !== "string") continue;
    const source = `${dossier}/${e.fichier}`;
    const abs = path.join(racine, dossier, e.fichier);
    let media = lireMediaParSource(source);
    if (media) {
      bilan.existants++;
      if (!media.alt && e.alt) modifierAltMedia(media.id, e.alt);
    } else {
      if (!fs.existsSync(abs)) {
        console.warn(`  absent : ${source}`);
        bilan.erreurs++;
        continue;
      }
      if (!e.alt?.trim()) console.warn(`  attention, texte alternatif vide : ${source}`);
      const r = await enregistrerFichier({
        buffer: fs.readFileSync(abs),
        nomOriginal: e.fichier,
        alt: e.alt ?? "",
        provisoire: e.provisoire === true,
        source,
        accepte: ["image"],
      });
      if (!r.ok) {
        console.error(`  refusé : ${source} (${r.erreur})`);
        bilan.erreurs++;
        continue;
      }
      media = r.media;
      bilan.crees++;
    }

    const categorie = e.realisation ? (ANCIENNES_CATEGORIES[e.realisation] ?? e.realisation) : null;
    if (categorie) {
      if (!estCategorieRealisation(categorie)) console.warn(`  catégorie inconnue « ${e.realisation} » : ${source}`);
      else if (!realisationDuMedia(media.id)) {
        creerRealisation({ media_id: media.id, categorie, legende: e.legende ?? "" });
        bilan.realisations++;
      }
    }

    if (e.emplacement) {
      if (!estCleEmplacement(e.emplacement)) {
        console.warn(`  emplacement inconnu « ${e.emplacement} » : ${source}`);
      } else {
        const actuel = lireIdsEmplacements()[e.emplacement];
        const actuelMedia = actuel ? lireMedia(actuel) : null;
        const remplacer = !actuelMedia || (actuelMedia.provisoire && !media.provisoire && actuelMedia.id !== media.id);
        if (remplacer) {
          definirEmplacement(e.emplacement, media.id);
          bilan.emplacements++;
        }
      }
    }
  }
  return bilan;
}

/** Dossiers de seed-medias ayant un manifest.json : `photos` d'abord, `ia` ensuite, puis les autres. */
export function dossiersAvecManifeste(racine: string): string[] {
  if (!fs.existsSync(racine)) return [];
  const tous = fs
    .readdirSync(racine, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(racine, d.name, "manifest.json")))
    .map((d) => d.name);
  const rang = (n: string) => (n === "photos" ? 0 : n === "ia" ? 1 : 2);
  return tous.sort((a, b) => rang(a) - rang(b) || a.localeCompare(b));
}

/** Importe un PDF de `seed-medias/documents/` (idempotent par `source`). Renvoie l'ID du média, ou `null`. */
export async function importerDocument(racine: string, fichier: string, alt: string): Promise<number | null> {
  const { lireMediaParSource } = await import("../lib/media");
  const { enregistrerFichier } = await import("../lib/media-pipeline");
  const source = `documents/${fichier}`;
  const existant = lireMediaParSource(source);
  if (existant) return existant.id;
  const abs = path.join(racine, "documents", fichier);
  if (!fs.existsSync(abs)) {
    console.warn(`  document absent : ${source}`);
    return null;
  }
  const r = await enregistrerFichier({ buffer: fs.readFileSync(abs), nomOriginal: fichier, alt, source, accepte: ["pdf"] });
  if (!r.ok) {
    console.error(`  document refusé : ${source} (${r.erreur})`);
    return null;
  }
  return r.media.id;
}
