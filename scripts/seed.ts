/**
 * Seed IDEMPOTENT (relançable sans dupliquer) :
 * 1. schéma (créé à l'ouverture de la base) ;
 * 2. premier administrateur depuis ADMIN_EMAIL / ADMIN_PASSWORD (jamais écrasé) ;
 * 3. réglages : horaires (carte 2027), annonce de démonstration, coordonnées ;
 * 4. horaires exceptionnels des fêtes 2026 (dates absentes seulement) ;
 * 5. PDF de seed-medias/documents (carte 2027, menu de fêtes 2026) ;
 * 6. médias de tous les seed-medias/<dossier>/manifest.json (photos puis ia...),
 *    avec réalisations et emplacements ; relancer plus tard importe les ajouts ;
 * 7. carte traiteur 2027 et menu de fêtes 2026 (créés s'ils n'existent pas ;
 *    `--reset-menus` remplace leur contenu par celui des fichiers de données) ;
 * 8. contenus (scripts/seed-contenus.ts) : les 4 actualités de lancement de
 *    docs/COPY.md (absentes seulement, par slug) et l'emplacement `contact-boutique`.
 * Aucun avis : rien n'est inventé.
 *
 * Usage : npm run seed [-- --reset-menus]
 */

import path from "node:path";
import { banniere, drapeau, lancer } from "./_amorce";
import { dossiersAvecManifeste, importerDocument, importerManifeste } from "./_import-medias";
import { amorcerContenus } from "./seed-contenus";
import { MENU_CARTE_2027, SECTIONS_CARTE_2027 } from "./donnees/carte-traiteur-2027";
import { ANNONCE_FETES_2026, HORAIRES_FETES_2026, MENU_FETES_2026, SECTIONS_FETES_2026 } from "./donnees/menu-fetes-2026";

lancer(async () => {
  await banniere("Seed Maison Cherblanc");
  const racineMedias = path.resolve(process.cwd(), "seed-medias");
  const { getDb, closeDb } = await import("../lib/db");
  const { creerAdmin, lireAdminParEmail, compterAdmins } = await import("../lib/admins");
  const { initialiserReglage } = await import("../lib/reglages");
  const { creerHoraireExceptionnelSiAbsent } = await import("../lib/horaires-exceptionnels");
  const { creerMenu, lireMenuParSlug, remplacerContenuMenu, definirPdfMenu, compterMenus } = await import("../lib/menus");
  const { viderFile } = await import("../lib/media-pipeline");
  const { compterRealisations } = await import("../lib/realisations");
  const { lireIdsEmplacements, EMPLACEMENTS } = await import("../lib/emplacements");

  getDb();
  console.log("Schéma : OK");

  // 1er administrateur
  const email = process.env.ADMIN_EMAIL?.trim();
  const motDePasse = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !motDePasse) console.warn("Admin : ADMIN_EMAIL / ADMIN_PASSWORD absents, aucun compte créé.");
  else if (lireAdminParEmail(email)) console.log(`Admin : ${email} existe déjà (mot de passe inchangé).`);
  else {
    const r = await creerAdmin({ email, name: "", motDePasse });
    if (!r.ok) throw new Error(`Création de l'admin impossible : ${r.erreur}`);
    console.log(`Admin : ${email} créé.`);
  }
  console.log(`Admins en base : ${compterAdmins()}`);

  // Réglages
  console.log(`Réglage horaires : ${initialiserReglage("horaires") ? "créé (carte 2027)" : "déjà présent"}`);
  console.log(`Réglage annonce : ${initialiserReglage("annonce", ANNONCE_FETES_2026) ? "créé (démonstration fêtes)" : "déjà présent"}`);
  initialiserReglage("emplacements");
  initialiserReglage("coordonnees_affichage");

  // Horaires exceptionnels
  const nbHoraires = HORAIRES_FETES_2026.filter((h) => creerHoraireExceptionnelSiAbsent(h)).length;
  console.log(`Horaires exceptionnels : ${nbHoraires} ajouté(s), ${HORAIRES_FETES_2026.length - nbHoraires} déjà présent(s).`);

  // Documents PDF
  const pdfCarte = await importerDocument(racineMedias, "carte-traiteur-2027-maison-cherblanc.pdf", "Carte traiteur 2027 de Maison Cherblanc (PDF)");
  const pdfFetes = await importerDocument(racineMedias, "menu-fetes-2026-maison-cherblanc.pdf", "Menu des fêtes de fin d’année 2026 de Maison Cherblanc (PDF)");
  console.log(`Documents : carte 2027 = média ${pdfCarte ?? "absent"}, fêtes 2026 = média ${pdfFetes ?? "absent"}`);

  // Médias des manifestes
  for (const dossier of dossiersAvecManifeste(racineMedias)) {
    const b = await importerManifeste(racineMedias, dossier);
    console.log(
      `Médias ${dossier}/ : ${b.crees} importé(s), ${b.existants} déjà présent(s), ${b.realisations} réalisation(s), ${b.emplacements} emplacement(s)${b.erreurs ? `, ${b.erreurs} erreur(s)` : ""}`,
    );
  }
  process.stdout.write("Traitement des images (variantes WebP)... ");
  await viderFile();
  console.log("terminé.");

  // Menus
  const reset = drapeau("reset-menus");
  for (const [def, sections, pdf] of [
    [MENU_CARTE_2027, SECTIONS_CARTE_2027, pdfCarte],
    [MENU_FETES_2026, SECTIONS_FETES_2026, pdfFetes],
  ] as const) {
    let menu = lireMenuParSlug(def.slug!);
    if (!menu) {
      menu = creerMenu(def);
      const n = remplacerContenuMenu(menu.id, [...sections]);
      console.log(`Menu « ${def.titre} » : créé (${n.sections} sections, ${n.plats} plats).`);
    } else if (reset) {
      const n = remplacerContenuMenu(menu.id, [...sections]);
      console.log(`Menu « ${def.titre} » : contenu remplacé (${n.sections} sections, ${n.plats} plats).`);
    } else {
      console.log(`Menu « ${def.titre} » : déjà présent, inchangé (--reset-menus pour remplacer son contenu).`);
    }
    if (pdf && !menu.pdf_media_id) definirPdfMenu(menu.id, pdf);
  }

  // Contenus éditoriaux (après les médias : couvertures)
  const contenus = await amorcerContenus();
  console.log(
    `Actualités : ${contenus.articlesCrees} créée(s), ${contenus.articlesExistants} déjà présente(s)${contenus.emplacements.length ? ` ; emplacement rempli : ${contenus.emplacements.join(", ")}` : ""}.`,
  );

  const totaux = compterMenus();
  const emplacements = lireIdsEmplacements();
  const vides = EMPLACEMENTS.filter((e) => !emplacements[e.cle]).map((e) => e.cle);
  console.log(`\nBilan : ${totaux.menus} menus, ${totaux.sections} sections, ${totaux.plats} plats ; ${compterRealisations()} réalisations.`);
  console.log(`Emplacements remplis : ${EMPLACEMENTS.length - vides.length}/${EMPLACEMENTS.length}${vides.length ? ` (vides : ${vides.join(", ")})` : ""}`);
  closeDb();
  console.log("\nSeed terminé.");
});
