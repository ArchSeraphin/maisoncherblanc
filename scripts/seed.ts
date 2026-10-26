/**
 * Seed relançable sans dupliquer NI RESSUSCITER ce que le client a retiré :
 * 1. schéma (créé à l'ouverture de la base) et JOURNAL DU SEED
 *    (lib/seed-journal.ts, scripts/_journal-seed.ts) : chaque élément créé une
 *    fois pour toutes est noté par une clé ; une clé notée n'est jamais
 *    recréée. Une base remplie avant le journal est d'abord migrée (l'existant
 *    est journalisé, rien n'est recréé) ;
 * 2. premier administrateur depuis ADMIN_EMAIL / ADMIN_PASSWORD (+ ADMIN_NAME
 *    facultatif), jamais écrasé ;
 * 3. réglages : horaires (carte 2027), annonce de démonstration, coordonnées
 *    (créés seulement s'ils n'existent pas) ;
 * 4. horaires exceptionnels des fêtes 2026 (`horaire:<date>`) ;
 * 5. PDF de seed-medias/documents (carte 2027, menu de fêtes 2026) ;
 * 6. médias de tous les seed-medias/<dossier>/manifest.json (photos puis ia...),
 *    avec réalisations (`realisation:<source>`) et emplacements
 *    (`emplacement:<cle>`) ; relancer plus tard importe les NOUVEAUX médias ;
 * 7. carte traiteur 2027 et menu de fêtes 2026 (`menu:carte-2027`,
 *    `menu:fetes-2026`) : créés une fois, puis retrouvés par leur ID journalisé
 *    (jamais par leur adresse, qui change quand une carte 2028 est mise en
 *    ligne). Le PDF n'est rattaché qu'une fois (`pdf:<menu>`) : retiré dans le
 *    BO, il ne revient pas. `--reset-menus` remplace le contenu du menu
 *    journalisé par celui des fichiers de données (s'il existe encore) ;
 * 8. contenus (scripts/seed-contenus.ts) : les 4 actualités de lancement de
 *    docs/COPY.md (`article:<slug>`) et l'emplacement `contact-boutique`.
 * Aucun avis : rien n'est inventé.
 *
 * Usage : npm run seed [-- --reset-menus]
 */

import path from "node:path";
import { banniere, drapeau, lancer } from "./_amorce";
import { dossiersAvecManifeste, importerDocument, importerManifeste } from "./_import-medias";
import { demarrerJournal, MENUS_SEED } from "./_journal-seed";
import { amorcerContenus } from "./seed-contenus";
import { SECTIONS_CARTE_2027 } from "./donnees/carte-traiteur-2027";
import { ANNONCE_FETES_2026, HORAIRES_FETES_2026, SECTIONS_FETES_2026 } from "./donnees/menu-fetes-2026";

lancer(async () => {
  await banniere("Seed Maison Cherblanc");
  const racineMedias = path.resolve(process.cwd(), "seed-medias");
  const { getDb, closeDb } = await import("../lib/db");
  const { creerAdmin, lireAdminParEmail, compterAdmins, modifierProfilAdmin } = await import("../lib/admins");
  const { initialiserReglage } = await import("../lib/reglages");
  const { creerHoraireExceptionnelSiAbsent } = await import("../lib/horaires-exceptionnels");
  const { creerMenu, lireMenu, lireMenuParSlug, remplacerContenuMenu, definirPdfMenu, compterMenus } = await import("../lib/menus");
  const { estJournalise, journaliser, refJournal } = await import("../lib/seed-journal");
  const { viderFile } = await import("../lib/media-pipeline");
  const { compterRealisations } = await import("../lib/realisations");
  const { lireIdsEmplacements, EMPLACEMENTS } = await import("../lib/emplacements");

  getDb();
  console.log("Schéma : OK");
  const journal = await demarrerJournal(racineMedias);
  console.log(
    journal.mode === "migration"
      ? `Journal du seed : base existante migrée (${journal.cles} clés notées, rien n'est recréé).`
      : journal.mode === "neuf"
        ? "Journal du seed : base neuve, chaque création sera notée."
        : `Journal du seed : ${journal.cles} clés déjà notées.`,
  );

  // 1er administrateur
  const email = process.env.ADMIN_EMAIL?.trim();
  const motDePasse = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !motDePasse) console.warn("Admin : ADMIN_EMAIL / ADMIN_PASSWORD absents, aucun compte créé.");
  else if (lireAdminParEmail(email)) {
    const admin = lireAdminParEmail(email)!;
    const nom = process.env.ADMIN_NAME?.trim();
    // Nom ajouté seulement s'il manque (jamais écrasé : il se change dans le BO).
    if (nom && !admin.name) modifierProfilAdmin(admin.id, { name: nom });
    console.log(`Admin : ${email} existe déjà (mot de passe inchangé${nom && !admin.name ? `, nom « ${nom} » ajouté` : ""}).`);
  } else {
    const r = await creerAdmin({ email, name: process.env.ADMIN_NAME?.trim() ?? "", motDePasse });
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
  let nbHoraires = 0;
  for (const h of HORAIRES_FETES_2026) {
    const cle = `horaire:${h.date}`;
    if (estJournalise(cle)) continue;
    if (creerHoraireExceptionnelSiAbsent(h)) nbHoraires++;
    journaliser(cle);
  }
  console.log(`Horaires exceptionnels : ${nbHoraires} ajouté(s), ${HORAIRES_FETES_2026.length - nbHoraires} déjà réglé(s) (présents, ou supprimés dans le BO).`);

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

  // Menus (retrouvés par l'ID journalisé, jamais par leur adresse)
  const reset = drapeau("reset-menus");
  const sectionsParCle: Record<string, typeof SECTIONS_CARTE_2027> = {
    "menu:carte-2027": SECTIONS_CARTE_2027,
    "menu:fetes-2026": SECTIONS_FETES_2026,
  };
  const pdfParCle: Record<string, number | null> = { "menu:carte-2027": pdfCarte, "menu:fetes-2026": pdfFetes };
  for (const { cle, clePdf, def } of MENUS_SEED) {
    const sections = sectionsParCle[cle];
    const pdf = pdfParCle[cle];
    let menu = null;
    if (!estJournalise(cle)) {
      // Adresse déjà prise par ce même menu (seed interrompu) : il est repris tel quel.
      const existant = def.slug ? lireMenuParSlug(def.slug) : null;
      if (existant && existant.titre === def.titre) {
        menu = existant;
        console.log(`Menu « ${def.titre} » : déjà présent, repris dans le journal.`);
      } else {
        menu = creerMenu(def);
        const n = remplacerContenuMenu(menu.id, [...sections]);
        console.log(`Menu « ${def.titre} » : créé (${n.sections} sections, ${n.plats} plats).`);
      }
      journaliser(cle, menu.id);
    } else {
      const id = refJournal(cle);
      menu = id ? lireMenu(id) : null;
      if (!menu) console.log(`Menu « ${def.titre} » : supprimé dans le backoffice, non recréé.`);
      else if (reset) {
        const n = remplacerContenuMenu(menu.id, [...sections]);
        console.log(`Menu « ${menu.titre} » (n° ${menu.id}) : contenu remplacé (${n.sections} sections, ${n.plats} plats).`);
      } else {
        console.log(`Menu « ${menu.titre} » (n° ${menu.id}) : déjà présent, inchangé (--reset-menus pour remplacer son contenu).`);
      }
    }
    // PDF rattaché une seule fois : retiré ou remplacé dans le BO, il ne revient pas.
    if (menu && pdf && !estJournalise(clePdf)) {
      if (!menu.pdf_media_id) definirPdfMenu(menu.id, pdf);
      journaliser(clePdf, pdf);
    }
  }

  // Contenus éditoriaux (après les médias : couvertures)
  const contenus = await amorcerContenus();
  console.log(
    `Actualités : ${contenus.articlesCrees} créée(s), ${contenus.articlesExistants} déjà réglée(s) (présentes, ou supprimées dans le BO)${contenus.emplacements.length ? ` ; emplacement rempli : ${contenus.emplacements.join(", ")}` : ""}.`,
  );

  const totaux = compterMenus();
  const emplacements = lireIdsEmplacements();
  const vides = EMPLACEMENTS.filter((e) => !emplacements[e.cle]).map((e) => e.cle);
  console.log(`\nBilan : ${totaux.menus} menus, ${totaux.sections} sections, ${totaux.plats} plats ; ${compterRealisations()} réalisations.`);
  console.log(`Emplacements remplis : ${EMPLACEMENTS.length - vides.length}/${EMPLACEMENTS.length}${vides.length ? ` (vides : ${vides.join(", ")})` : ""}`);
  closeDb();
  console.log("\nSeed terminé.");
});
