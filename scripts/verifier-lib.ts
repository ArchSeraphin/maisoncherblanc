/**
 * Vérification des modules lib/ sur une base JETABLE (dossier temporaire) :
 * CRUD, réordonnancement, bornage, suppressions qui renvoient les lignes,
 * validations, pipeline médias. Ne touche jamais à la base du projet.
 *
 *   npm run verifier-lib
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cherblanc-verif-"));
process.env.DATABASE_PATH = path.join(tmp, "test.db");
process.env.UPLOADS_DIR = path.join(tmp, "uploads");
process.env.SESSION_SECRET = "x".repeat(40);

let n = 0;
function ok(cond: unknown, libelle: string) {
  assert.ok(cond, libelle);
  n++;
}

async function principal() {
  const { closeDb } = await import("../lib/db");
  const M = await import("../lib/menus");
  const H = await import("../lib/horaires-exceptionnels");
  const R = await import("../lib/reglages");
  const A = await import("../lib/articles");
  const V = await import("../lib/avis");
  const Msg = await import("../lib/messages");
  const Ad = await import("../lib/admins");
  const Real = await import("../lib/realisations");
  const E = await import("../lib/emplacements");
  const Med = await import("../lib/media");
  const P = await import("../lib/media-pipeline");
  const { normaliserPrix, montantSchema } = await import("../lib/prix");
  const { analyserMarkdown, texteBrut } = await import("../lib/markdown");
  const { isoDepuisHeureParis, heureParisPourChamp, formaterJourLong } = await import("../lib/dates");
  const { groupesComposition } = await import("../lib/composition");
  const { grouperHoraires } = await import("../lib/horaires");
  const J = await import("../lib/jeton-formulaire");
  const sharp = (await import("sharp")).default;

  // Prix, dates, composition, markdown
  ok(normaliserPrix("3,2") === "3,20 €" && normaliserPrix("30,00") === "30 €" && normaliserPrix("Sur devis") === "Sur devis", "prix normalisés");
  ok(montantSchema("23,99 €") === "23.99", "montant schema.org");
  ok(isoDepuisHeureParis("2026-12-01T09:30") === "2026-12-01T08:30:00.000Z", "heure de Paris (hiver) -> UTC");
  ok(isoDepuisHeureParis("2026-07-01T09:30") === "2026-07-01T07:30:00.000Z", "heure de Paris (été) -> UTC");
  ok(heureParisPourChamp("2026-12-01T08:30:00.000Z") === "2026-12-01T09:30", "UTC -> champ datetime-local");
  ok(formaterJourLong("2027-01-01") === "vendredi 1er janvier 2027", "jour long avec 1er");
  ok(groupesComposition("# Entrée\nA\nB\n# Plat\nC").length === 2, "composition groupée");
  const blocs = analyserMarkdown("## Titre\n\nTexte **gras** et [lien](javascript:alert(1)) et [ok](/contact)\n\n- a\n- b");
  ok(blocs.length === 3 && blocs[0].t === "h2" && blocs[2].t === "ul", "markdown : blocs");
  ok(JSON.stringify(blocs[1]).includes('"href":"/contact"') && !JSON.stringify(blocs).includes("javascript"), "markdown : liens filtrés");
  ok(texteBrut("**a** b", 100) === "a b", "markdown : texte brut");
  ok(grouperHoraires(R.REGLAGES_PAR_DEFAUT.horaires).some((g) => g.libelle === "Mercredi et jeudi"), "horaires groupés");

  // Réglages
  ok(R.validerHoraires({ mardi: [{ ouverture: "13:00", fermeture: "07:30" }] }).ok === false, "horaires invalides refusés");
  ok(R.verifierLien("//pirate.example").ok === false && R.verifierLien("/menus-de-fetes").ok, "liens d'annonce bornés");
  R.ecrireReglage("annonce", { active: true, texte: "Test", lien: "", debut: "2026-12-01", fin: "2026-12-20" });
  ok(R.annonceEnCours("2026-12-10") && !R.annonceEnCours("2026-12-21"), "annonce : fenêtre d'affichage");

  // Menus : CRUD, ordre, bornage, duplication, suppression
  const menu = M.creerMenu({ titre: "Carte test", type: "permanent" });
  ok(menu.slug === "carte-test", "slug du menu");
  ok(M.creerMenu({ titre: "Carte test" }).slug === "carte-test-2", "slug unique");
  const s1 = M.creerSection(menu.id, { titre: "Entrées", note: "À la part" });
  const s2 = M.creerSection(menu.id, { titre: "Plats" });
  const p1 = M.creerPlat(s1.id, { nom: "Taboulé", prix: "3,2", unite: "la part" });
  const p2 = M.creerPlat(s1.id, { nom: "Salade", prix: "4" });
  const p3 = M.creerPlat(s1.id, { nom: "Terrine", prix: "" });
  ok(p1.prix === "3,20 €", "prix du plat normalisé");
  M.deplacerPlat(p3.id, "haut");
  ok(M.listerPlats(s1.id).map((p) => p.id).join() === [p1.id, p3.id, p2.id].join(), "flèche haut");
  M.ordonnerPlats(s1.id, [p2.id, p1.id, 999999, p3.id]);
  ok(M.listerPlats(s1.id).map((p) => p.id).join() === [p2.id, p1.id, p3.id].join(), "ordre glisser-déposer (ID étranger ignoré)");
  const etranger = M.creerPlat(s2.id, { nom: "Étranger" });
  M.ordonnerPlats(s1.id, [etranger.id, p1.id]);
  ok(M.lirePlat(etranger.id)!.section_id === s2.id && M.lirePlat(etranger.id)!.position === 1, "bornage : un plat d'une autre section n'est pas réordonné");
  M.definirPlatVisible(p2.id, false);
  ok(M.menuComplet(menu.id, { visiblesSeulement: true })!.sections.find((s) => s.id === s1.id)!.plats.length === 2, "plat masqué retiré du public");
  ok(M.menuComplet(menu.id, { visiblesSeulement: true })!.sections.every((s) => s.id !== s2.id || s.plats.length), "section vide retirée");
  ok(M.modifierPrixPlat(p1.id, "5")!.prix === "5 €", "changer un prix");
  ok(M.menuDuPlat(p1.id) === menu.id, "menu du plat");
  ok(M.rechercherPlats("tabou").length === 1, "recherche de plat");
  const copie = M.dupliquerMenu(menu.id, { titre: "Carte test 2028" })!;
  ok(copie.visible === false && M.compterMenus().plats === 8, "duplication (masquée, plats copiés)");
  const supp = M.supprimerPlat(p3.id);
  ok(supp?.nom === "Terrine", "suppression de plat renvoie la ligne");
  const suppSection = M.supprimerSection(s1.id);
  ok(suppSection?.titre === "Entrées" && M.lirePlat(p1.id) === null, "suppression de section : cascade des plats");
  ok(M.supprimerMenu(copie.id)?.titre === "Carte test 2028", "suppression de menu renvoie la ligne");
  const saison = M.creerMenu({ titre: "Fêtes", type: "saison", publie_au: "2027-01-05" });
  M.creerPlat(M.creerSection(saison.id, { titre: "Menus" }).id, { nom: "Menu", prix: "35" });
  ok(M.menusDeSaisonEnCours("2026-12-01").length === 1 && M.menusDeSaisonEnCours("2027-01-06").length === 0, "fenêtre de publication des menus de saison");
  ok(M.validerMenu({ titre: "", publie_du: "2027-02-30" }).ok === false, "validation menu");

  // Horaires exceptionnels
  ok(H.creerHoraireExceptionnelSiAbsent({ date: "2026-12-25", libelle: "Noël", plages: [] }), "fermeture créée");
  ok(!H.creerHoraireExceptionnelSiAbsent({ date: "2026-12-25", libelle: "Noël", plages: [] }), "fermeture idempotente");
  H.enregistrerHoraireExceptionnel({ date: "2026-12-24", plages: null, note: "Retrait avant 17h00." });
  const aVenir = H.horairesExceptionnelsAVenir(30, "2026-12-01");
  ok(aVenir.length === 2 && aVenir[0].plages === null && aVenir[1].ferme, "horaires exceptionnels à venir");
  ok(H.validerHoraireExceptionnel({ date: "2026-12-31", mode: "note", note: "" }).ok === false, "mode note exige une note");
  ok(H.purgerHorairesExceptionnelsPasses(60, "2027-03-01") === 2, "purge des dates passées");

  // Articles
  const art = A.creerArticle({ titre: "Premier article", corps: "Un texte assez long pour être publié.", statut: "brouillon" });
  ok(A.etatArticle(art) === "brouillon" && A.listerArticlesPublies().length === 0, "brouillon invisible");
  A.definirStatutArticle(art.id, "publie");
  ok(A.articlePublie("premier-article") !== null, "article publié visible");
  const prog = A.creerArticle({ titre: "Programmé", corps: "Un texte assez long pour être publié.", statut: "publie", publie_le: "2099-01-01T08:00:00.000Z" });
  ok(A.etatArticle(prog) === "programme" && A.articlePublie(prog.slug) === null, "article programmé invisible");
  ok(A.validerArticle({ titre: "Autre", slug: "premier-article" }).ok === false, "slug d'article déjà pris refusé");
  ok(A.supprimerArticle(prog.id)?.slug === "programme", "suppression d'article renvoie la ligne");

  // Avis
  ok(V.validerAvis({ auteur: "", texte: "x", note: 9 }).ok === false, "avis invalide refusé");
  const av = V.creerAvis({ auteur: "Test", texte: "Très bon.", note: 5, source: "direct", date: null });
  V.creerAvis({ auteur: "Test 2", texte: "Parfait.", note: 4, source: "google", date: "2026-10-01" });
  V.deplacerAvis(av.id, "bas");
  ok(V.listerAvisAdmin()[1].id === av.id, "avis réordonnés");
  ok(V.supprimerAvis(av.id)?.auteur === "Test", "suppression d'avis renvoie la ligne");

  // Messages
  const vm = Msg.validerMessage({ type: "devis-traiteur", prenom: "A", nom: "B", email: "a@b.fr", message: "Bonjour, un devis svp", nb_personnes: "40", date_evenement: "2027-06-12" });
  ok(vm.ok, "message valide");
  if (vm.ok) Msg.creerMessage(vm.donnees);
  ok(Msg.validerMessage({ prenom: "A", nom: "B", email: "a@b.fr?bcc=x", message: "Bonjour" }).ok === false, "e-mail piégé refusé");
  ok(Msg.compterMessagesNonLus() === 1 && Msg.listerMessages({ email: "b.fr" }).length === 1, "recherche par e-mail");
  ok(Msg.supprimerMessagesParEmail("A@B.FR").length === 1, "droit à l'effacement");

  // Admins
  const ad = await Ad.creerAdmin({ email: "test@exemple.fr", motDePasse: "motdepasse-solide" });
  ok(ad.ok, "admin créé");
  if (ad.ok) {
    ok((await Ad.creerAdmin({ email: "test@exemple.fr", motDePasse: "motdepasse-solide" })).ok === false, "admin en double refusé");
    const r = await Ad.changerSonMotDePasse(ad.admin.id, "motdepasse-solide", "nouveau-mot-de-passe");
    ok(r.ok && r.sessionVersion === 2, "session_version incrémentée");
    ok(Ad.supprimerAdmin(ad.admin.id).ok === false, "dernier admin protégé");
  }

  // Jeton de formulaire
  const jeton = J.emettreJeton(J.USAGE_CONTACT, Date.now() - 5000);
  ok(J.verifierJeton(J.USAGE_CONTACT, jeton) === "ok" && J.verifierJeton(J.USAGE_CONTACT, J.emettreJeton(J.USAGE_CONTACT)) === "too-early", "jeton horodaté");
  ok(J.consommerJeton(J.USAGE_CONTACT, jeton, () => 1).spent && !J.consommerJeton(J.USAGE_CONTACT, jeton, () => 1).spent, "jeton à usage unique");

  // Médias : pipeline, réalisation, emplacement, suppression
  const png = await sharp({ create: { width: 1200, height: 800, channels: 3, background: "#a3702a" } }).jpeg().toBuffer();
  const env = await P.enregistrerFichier({ buffer: png, nomOriginal: "essai.jpg", alt: "Essai", source: "test/essai.jpg" });
  ok(env.ok, "image enregistrée");
  ok((await P.enregistrerFichier({ buffer: Buffer.from("<svg></svg>".padEnd(40)), nomOriginal: "x.svg" })).ok === false, "SVG refusé");
  await P.viderFile();
  if (env.ok) {
    const img = Med.lireImage(env.media.id);
    ok(img && img.variantes.sources.map((s) => s.largeur).join() === "480,960,1200", "variantes WebP bornées à la source");
    ok(fs.existsSync(path.join(process.env.UPLOADS_DIR!, String(env.media.id), "w960.webp")), "fichiers écrits");
    ok(!fs.readdirSync(path.join(process.env.UPLOADS_DIR!, "tmp")).length, "brut supprimé après traitement");
    const re = Real.creerRealisation({ media_id: env.media.id, categorie: "mariage", legende: "Essai" });
    ok(Real.listerRealisationsPubliques("mariage").length === 1 && Real.categoriesUtilisees()[0].categorie === "mariage", "réalisation publique");
    E.definirEmplacement("og-defaut", env.media.id);
    ok(E.imageEmplacement("og-defaut")?.id === env.media.id, "emplacement rempli");
    ok(Real.supprimerRealisation(re.id) && Med.lireMedia(env.media.id) !== null, "média conservé tant qu'un emplacement l'utilise");
    E.definirEmplacement("og-defaut", null);
    ok(Med.supprimerMediaSiOrphelin(env.media.id) && !fs.existsSync(path.join(process.env.UPLOADS_DIR!, String(env.media.id))), "média orphelin supprimé avec ses fichiers");
  }
  const pdf = await P.enregistrerFichier({ buffer: Buffer.from("%PDF-1.4\n%essai\n".padEnd(64)), nomOriginal: "Carte 2027.pdf", accepte: ["pdf"] });
  ok(pdf.ok && pdf.media.type === "document" && Med.lireDocument(pdf.media.id)?.nom === "carte-2027.pdf", "PDF enregistré comme document");

  closeDb();
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`Vérification lib/ : ${n} contrôles réussis.`);
}

principal().catch((err) => {
  console.error(err);
  fs.rmSync(tmp, { recursive: true, force: true });
  process.exit(1);
});
