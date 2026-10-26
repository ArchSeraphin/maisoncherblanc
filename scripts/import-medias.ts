/**
 * Importe les médias d'un ou plusieurs dossiers de seed-medias (manifest.json),
 * sans toucher au reste de la base. Idempotent et journalisé (voir
 * scripts/_import-medias.ts) : une réalisation ou un emplacement retiré dans
 * le backoffice ne revient pas.
 *
 *   npm run import-medias              (tous les dossiers ayant un manifest.json)
 *   npm run import-medias -- ia        (un dossier précis)
 */

import path from "node:path";
import { banniere, lancer, positionnels } from "./_amorce";
import { dossiersAvecManifeste, importerManifeste } from "./_import-medias";
import { demarrerJournal } from "./_journal-seed";

lancer(async () => {
  await banniere("Import des médias");
  const racine = path.resolve(process.cwd(), "seed-medias");
  const demandes = positionnels();
  const dossiers = demandes.length ? demandes : dossiersAvecManifeste(racine);
  if (!dossiers.length) throw new Error("Aucun seed-medias/<dossier>/manifest.json trouvé.");
  const { closeDb } = await import("../lib/db");
  const { viderFile } = await import("../lib/media-pipeline");
  const journal = await demarrerJournal(racine);
  if (journal.mode === "migration") console.log(`Journal du seed : base existante migrée (${journal.cles} clés notées).`);
  for (const d of dossiers) {
    const b = await importerManifeste(racine, d);
    console.log(`${d}/ : ${b.crees} importé(s), ${b.existants} déjà présent(s), ${b.realisations} réalisation(s), ${b.emplacements} emplacement(s), ${b.erreurs} erreur(s)`);
  }
  process.stdout.write("Traitement des images... ");
  await viderFile();
  console.log("terminé.");
  closeDb();
});
