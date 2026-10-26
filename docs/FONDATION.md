# MAISON CHERBLANC · Fondation technique (contrat entre lots)

Ce document est le contrat des trois lots suivants : **pages publiques**, **backoffice**, **SEO**.
Il complète `docs/CONTRAT.md` (règles, URLs, modèle de données), `docs/DA.md` (direction artistique),
`docs/COPY.md` (textes) et la ligne directrice `archi-vitrine-cms`. Lire ces documents avant de coder ;
ce fichier suffit pour travailler sans relire tout le code.

Rappels non négociables : jamais de tiret cadratin (U+2014) nulle part ; une page ou un composant ne
parle jamais à la base, toujours via `lib/` ; aucune info inventée ; aucune ressource tierce chargée
côté visiteur ; le site public ne lie jamais le backoffice ; code métier en français.

---

## 1. Stack installée (résolue au registre le 26/10/2026, pinnée en exact via `.npmrc save-exact=true`)

| Paquet | Version |
|---|---|
| next / eslint-config-next | 16.4.3 |
| react / react-dom | 19.3.0 (tels qu'installés par create-next-app) |
| better-sqlite3 | 13.0.3 (binaires précompilés, aucune compilation) |
| sharp | 0.35.5 |
| iron-session | 9.0.1 |
| zod | 4.6.7 (installé, pas encore utilisé : validations écrites à la main dans `lib/`) |
| dotenv | 18.0.9 · server-only 0.0.1 |
| tsx (dev) | 4.23.15 · @types/node 24.19.2 · @types/better-sqlite3 9.6.0 |
| typescript, eslint, @types/react* | plages `^` écrites par create-next-app, figées par `package-lock.json` |

Node 24 (local 24.21.0), `engines.node >= 24`. **Pas de Tailwind** : CSS Modules + `app/globals.css`.
`package.json` contient `allowScripts` (npm 11.19) qui refuse les scripts d'installation de
better-sqlite3, esbuild, unrs-resolver (binaires précompilés suffisants).
Playwright n'est PAS dans le projet (la recette navigateur de la fondation a utilisé un
`playwright-core` temporaire hors dépôt avec le Chrome installé) : un lot qui en a besoin l'ajoute.

## 2. Commandes

```bash
npm run dev             # next dev (UN SEUL serveur par dossier : verrou .next/dev)
npm run build           # next build
npm start               # node server.js (production : Docker / Coolify), PORT=3000 par défaut
npm run typecheck       # next typegen && tsc --noEmit
npm run lint
npm run seed            # idempotent : schéma, 1er admin, réglages, horaires des fêtes, PDF, médias, menus
npm run seed -- --reset-menus      # remplace le contenu des 2 menus par scripts/donnees/*.ts
npm run import-medias [-- ia]      # (ré)importe seed-medias/<dossier>/manifest.json, sans doublon
npm run create-admin -- --email x@y.fr --name "Prénom" [--mot-de-passe "..."]
npm run create-admin -- --email x@y.fr --reinitialiser [--mot-de-passe "..."]
npm run list-admins     # affiche la base réellement utilisée + les comptes
npm run purge-messages [-- --mois 6 | --email x@y.fr]
npm run verifier-lib    # 64 contrôles des modules lib/ sur une base jetable (à relancer après toute modif de lib/)
npm run logos           # régénère public/logo/*.svg, app/icon.*, app/favicon.ico (nécessite pdftocairo)
```

Le seed affiche à la fin les emplacements d'images encore vides. Relancer `npm run seed` (ou
`npm run import-medias -- ia`) après l'ajout de visuels dans `seed-medias/ia/` : seuls les nouveaux
fichiers sont importés, un emplacement occupé par un visuel PROVISOIRE est remplacé par une vraie
photo (jamais l'inverse), et un choix fait dans le BO n'est jamais écrasé.

## 3. Accès dev

`.env` (non versionné) déjà en place à la racine : `ADMIN_PATH`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
`SESSION_SECRET`, `NOINDEX=1`, `COOKIE_SECURE=0`, `TRUST_PROXY=0`, base `./data/cherblanc.db`,
fichiers `./data/uploads`. Backoffice : `http://localhost:3000/<ADMIN_PATH>` (redirige vers
`/<ADMIN_PATH>/connexion`). Ne jamais écrire le chemin secret, l'e-mail ni le mot de passe dans un
fichier versionné. Trop d'échecs de connexion : les freins (mémoire) se vident au redémarrage.

## 4. Arborescence posée

```
config/site.ts                       source de vérité (coordonnées, légal, navigation, pages du sitemap, horaires par défaut, thème)
lib/env.ts                           variables d'env runtime (aucune NEXT_PUBLIC)
lib/db.ts                            singleton SQLite, schéma, ensureColumn, stmt(), transaction()
lib/reglages.ts                      réglages JSON : horaires, annonce, emplacements, coordonnees_affichage
lib/emplacements.ts                  photos des pages (23 clés stables)
lib/horaires.ts                      PUR : mise en forme des horaires
lib/horaires-exceptionnels.ts        fermetures / ouvertures exceptionnelles
lib/menus.ts                         menus, sections, plats (CRUD, ordre, duplication, publication)
lib/composition.ts                   PUR : description multiligne d'un plat (« # Entrée » = intertitre)
lib/prix.ts                          PUR : saisie et affichage des prix
lib/media.ts / media-pipeline.ts     médias + file de jobs / envoi, sharp, worker séquentiel
lib/media-url.ts                     PUR (client OK) : URLs, srcset, attributs <img>
lib/realisations.ts                  galerie
lib/articles.ts + lib/markdown.ts    actualités (Markdown restreint, PUR)
lib/avis.ts                          avis saisis à la main (table vide au départ)
lib/messages.ts / lib/mail.ts        formulaire de contact / notification Brevo
lib/audience.ts / lib/compter-vue.ts compteur de vues sans cookie / appel depuis les pages
lib/admins.ts, auth.ts, mots-de-passe.ts, freins-connexion.ts, limiteur.ts, chemin-admin.ts
lib/jeton-formulaire.ts              anti-robot du formulaire public (jeton signé à usage unique)
lib/formulaire.ts                    PUR : lecture bornée de FormData, type EtatAction
lib/dates.ts, slug.ts, ordre.ts      PURS
lib/seo.ts                           construireMetadata + builders JSON-LD
lib/http.ts, lib/maintenance.ts      contrôle d'origine / purges quotidiennes
lib/actions/*.ts                     Server Actions ("use server") : auth, menus, horaires, medias,
                                     realisations, articles, avis, messages, admins, contact (public)
components/ui/                       visuel, json-ld, markdown, motifs, logo (partagés)
components/site/                     habillage, entete, pied, bandeau-annonce, revelations
components/admin/                    contexte-admin, coque, navigation, icones, formulaire-connexion, ecran-a-venir
app/layout.tsx, fonts.ts, globals.css, global-not-found.tsx, not-found.tsx, robots.ts, manifest.ts
app/icon.svg, icon.png, apple-icon.png, favicon.ico   (générés par npm run logos)
app/(site)/layout.tsx                force-dynamic + Habillage
app/(site)/page.tsx + accueil.module.css   accueil PROVISOIRE (diptyque) à remplacer
app/(site)/sitemap.ts
app/(admin)/bo/layout.tsx, admin.css, connexion/page.tsx
app/(admin)/bo/(espace)/layout.tsx, page.tsx (tableau de bord squelette)
app/(admin)/bo/(espace)/{menus,horaires,annonce,actualites,realisations,photos,avis,messages,administrateurs}/page.tsx  PROVISOIRES
app/(admin)/bo/api/upload/route.ts, api/media/[id]/route.ts
app/media/[...path]/route.ts
proxy.ts, instrumentation.ts, server.js, next.config.ts, Dockerfile, .dockerignore, .env.example
scripts/ seed.ts, import-medias.ts, create-admin.ts, list-admins.ts, purge-messages.ts, verifier-lib.ts,
         generer-logos.ts, _amorce.ts, _import-medias.ts, donnees/carte-traiteur-2027.ts, donnees/menu-fetes-2026.ts
public/logo/  logo-complet-{encre,olive,creme,or}.svg, monogramme-{encre,olive,creme,or}.svg
public/icons/ icon-192.png, icon-512.png, maskable-512.png
seed-medias/photos/manifest.json     46 vraies photos (alt, catégorie, emplacement)
```

## 5. Données en base après `npm run seed`

- 1 admin (env), réglages `horaires` (carte 2027), `annonce` (démo « Commandes de fêtes : jusqu’au dimanche
  20 décembre pour Noël », lien `/menus-de-fetes`, affichée jusqu'au 20/12/2026), `emplacements`, `coordonnees_affichage` (vide).
- 10 horaires exceptionnels (20, 21, 24, 25, 27, 31/12/2026 ; 1er, 2, 3, 4/01/2027). Le 24 et le 31 :
  `plages = null` + note « Les commandes sont à récupérer avant 17h00. » (heures d'ouverture non précisées sur le PDF).
- Menu `carte-traiteur` (permanent) : 9 sections, 85 plats, PDF lié, valable du 01/01 au 31/12/2027.
- Menu `menu-de-fetes-2026` (saison) : 7 sections, 48 plats, PDF lié, publié jusqu'au 05/01/2027.
- Médias : 2 PDF (`type = document`), 46 photos réelles, les visuels IA présents dans `seed-medias/ia/`
  au moment du seed (`provisoire = 1`) ; 37 réalisations ; emplacements remplis selon les manifestes.
- Aucun avis, aucune actualité, aucun message.

Ajouts au schéma du contrat (via `ensureColumn`) : `jobs.chemin_brut`, `jobs.verrouille_le`,
`media.mime`, `media.poids`, `media.source` (clé d'import unique du seed) ; table `jetons_formulaire`.
`horaires_exceptionnels.plages` accepte `NULL` (ouvert, horaires dans la note).
Catégories de réalisation : `mariage | cocktail | buffet | broche-barbecue | plateaux | boucherie`.

## 6. Modules `lib/` : signatures

Toutes les fonctions base sont **synchrones** (better-sqlite3) sauf mention `async`.
Les suppressions **renvoient la ou les lignes supprimées**. Les booléens SQLite sortent en `boolean`.

### config/site.ts (pur, importable partout)
`siteConfig` : `nom`, `activite`, `signature`, `description`, `descriptionCourte`, `modeleTitre`
(`"%s | Maison Cherblanc, Roanne"`), `titreParDefaut`, `dirigeant`, `gerants`, `adresse{rue, codePostal, ville,
departement, region, pays}`, `geo` (= `null`), `telephones.{boutique,mobile}.{affichage,e164,href}`, `email`,
`itineraire` (lien Google Maps, pas d'iframe), `reseaux{facebook, instagram}`, `traiteur{delaiCommande,
serviceATable, devis}`, `zone[]`, `horairesParDefaut`, `legal{editeur{denomination, formeJuridique, capital,
rcs, siren, siret, tva, codeNaf, immatriculation, gerants, directeurPublication (null, TODO), ...}, hebergeur{... null, TODO},
creditsPhotos}`, `confidentialite{conservationMessagesMois: 12, conservationStatistiquesMois: 25, prestataireEmail}`,
`navigation[]` (`{href, libelle, enfants?}`), `appelAction`, `pages[]` (`{chemin, libelle, priorite, frequence}`),
`imagePartageParDefaut`, `theme`.
Types : `CleJour`, `Plage {ouverture, fermeture}` ("HH:MM"), `HorairesSemaine` (tableau vide = fermé), `LienNavigation`.
`JOURS`, `LIBELLES_JOURS`, `JOURS_SCHEMA_ORG`, `adresseUneLigne()`.

### lib/env.ts
`urlSite()` · `segmentAdmin(): string | null` · `estNoindex()` · `proxyDeConfiance()` · `cheminBase()` ·
`dossierUploads()` · `secretSession()` (lève si < 32 car.) · `emailContact()` · `emailExpediteur()` · `cookieSecurise()`.

### lib/db.ts (réservé aux modules lib)
`getDb()` · `closeDb()` · `stmt(sql)` (requête préparée en cache) · `transaction(fn)` ·
`ensureColumn(db, table, colonne, definition)` · `maintenantIso()` · `lireJson(brut, secours)` · `bool(v)`.

### lib/reglages.ts
- Types : `Annonce {active, texte, lien, debut, fin}`, `CoordonneesAffichage`, `Reglages`, `CleReglage`, `ResultatValidation<T, K>`.
- `lireReglage(cle)` · `ecrireReglage(cle, valeur)` · `initialiserReglage(cle, valeur?)` · `REGLAGES_PAR_DEFAUT`.
- Horaires : `lireHoraires(): HorairesSemaine` · `validerHoraires(entree)` (2 plages max par jour) · `erreurPlages(plages)` ·
  `normaliserPlages`, `normaliserHoraires`.
- Annonce : `lireAnnonce()` (BO) · **`annonceEnCours(jour?)`** (site : `null` si inactive, vide ou hors fenêtre) ·
  `validerAnnonce({active, texte, lien, debut, fin})` · `verifierLien(brut)` (chemin interne ou https://) · `LIMITES_ANNONCE`.
- **`coordonnees()`** : `{ telephone{affichage, href}, mobile{affichage, href}, email }` (surcharge BO sinon config).

### lib/emplacements.ts
`EMPLACEMENTS` (`{cle, libelle, page, ratio}`, 23 clés du contrat ; `boucherie-fumoir` = « salaisons et jambons ») ·
`CleEmplacement` · `estCleEmplacement(v)` · **`chargerEmplacements(cles): Record<cle, ImageMedia | null>`** (2 requêtes) ·
**`imageEmplacement(cle)`** · `definirEmplacement(cle, mediaId | null)` · `remplirEmplacementSiVide(cle, mediaId)` · `lireIdsEmplacements()`.

### lib/horaires.ts (pur)
`formaterHeure("07:30") -> "7h30"` · `formaterPlage(p) -> "7h30–13h00"` (minutes toujours écrites, comme les cartes) ·
`formaterJour(plages) -> "7h30–13h00, 15h00–19h00" | "Fermé"` · `grouperHoraires(h)` (`{jours, libelle: "Mercredi et jeudi", horaires, ferme}`) ·
`lignesHoraires(h)` (7 lignes) · `estDansPlages(plages, "10:15")`.

### lib/horaires-exceptionnels.ts
Type `HoraireExceptionnel {id, date, libelle, plages: Plage[] | null, note, ferme}` (`[]` fermé ; `null` = ouvert, voir la note).
`horairesExceptionnelsAVenir(jours = 30, aujourdhui?)` (site) · `listerHorairesExceptionnels({aPartirDu?})` (BO) ·
`lireHoraireExceptionnel(id)` · `lireHoraireExceptionnelParDate(date)` ·
`validerHoraireExceptionnel({date, mode: "ferme" | "horaires" | "note", plages, libelle, note})` ·
`enregistrerHoraireExceptionnel(e)` (crée ou remplace la date) · `creerHoraireExceptionnelSiAbsent(e)` ·
`modifierHoraireExceptionnel(id, e)` (lève si la date est prise) · `supprimerHoraireExceptionnel(id)` · `purgerHorairesExceptionnelsPasses(60)`.

### lib/menus.ts
- Types : `TypeMenu`, `Menu`, `Section`, `Plat`, `SectionAvecPlats`, **`MenuComplet`** (= `Menu & {sections, pdf: DocumentMedia | null, couverture: ImageMedia | null}`),
  `EntreeMenu`, `EntreeSection`, `EntreePlat`, `ImportSection`, `Badge`.
- Constantes : `BADGES` (Fait maison, Nouveau, Végétarien, Sur commande), `UNITES_SUGGEREES`, `LIMITES_MENU`, `SLUG_CARTE_TRAITEUR`, `TYPES_MENU`.
- **Site** : `carteTraiteur(): MenuComplet | null` · `menusDeSaisonEnCours(jour?): MenuComplet[]` (visibles, fenêtre `publie_du..publie_au`) ·
  `menuPublic(slug)` · `pdfMenu(menu)`. Le contenu public exclut plats et sections masqués et les sections vides.
- Menus : `listerMenus({type?})` · `lireMenu(id)` · `lireMenuParSlug(slug)` · `menuComplet(idOuMenu, {visiblesSeulement?})` ·
  `validerMenu(e)` · `creerMenu(e)` (slug unique auto) · `modifierMenu(id, patch)` (lève si slug pris) · `definirMenuVisible(id, b)` ·
  `definirPdfMenu(id, mediaId | null)` et `definirCouvertureMenu(...)` (renvoient l'ID de l'ancien média, à passer à `supprimerMediaSiOrphelin`) ·
  `supprimerMenu(id)` · `ordonnerMenus(ids)` · `deplacerMenu(id, "haut" | "bas")` · **`dupliquerMenu(id, {titre?, slug?})`** (copie masquée, sans PDF ni dates) ·
  `slugMenuUnique`, `slugMenuDisponible`, `compterMenus()`.
- Sections : `listerSections(menuId)` · `lireSection(id)` · `validerSection(e)` · `creerSection(menuId, e)` · `modifierSection(id, patch)` ·
  `definirSectionVisible` · `supprimerSection(id)` (cascade plats) · `ordonnerSections(menuId, ids)` · `deplacerSection(id, sens)`.
- Plats : `listerPlats(sectionId)` · `lirePlat(id)` · `menuDuPlat(platId)` · `validerPlat(e)` (prix normalisé) · `creerPlat(sectionId, e)` ·
  `modifierPlat(id, patch & {section_id?})` (changement de section : placé en fin) · **`modifierPrixPlat(id, prix)`** · `definirPlatVisible` ·
  `supprimerPlat(id)` · `ordonnerPlats(sectionId, ids)` (IDs hors section ignorés) · `deplacerPlat(id, sens)` · `rechercherPlats(texte)` (raccourci « Changer un prix »).
- Import : `remplacerContenuMenu(menuId, sections)` (transaction).

### lib/composition.ts, lib/prix.ts, lib/ordre.ts, lib/slug.ts, lib/dates.ts (purs)
- `lignesComposition(desc)` · `groupesComposition(desc): {titre | null, elements[]}[]` · `compositionEnTexte(desc)`.
  Convention : 1 ligne = 1 élément ; `# Entrée` = intertitre (menus de fêtes).
- `normaliserPrix("3,2") -> "3,20 €"` (« 30,00 » -> « 30 € », texte libre conservé) · `prixAvecCentimes("2 €") -> "2,00 €"` (style carte imprimée) ·
  `montantSchema` · `estPrixNumerique` · `AIDE_PRIX` (texte d'aide pour le BO).
- `echangerDansListe(ids, id, sens)` · `slugifier(texte)`, `estSlug(v)`.
- `jourParis()` · `estJourIso(v)` · `ajouterJours(jour, n)` · `jourDeSemaine(jour)` · `formaterJourLong("2027-01-01") -> "vendredi 1er janvier 2027"` ·
  `formaterJourCourt` · `formaterHorodatage(iso)` · `dansFenetre(jour, du, au)` · `isoDepuisHeureParis("2026-12-01T09:30")` · `heureParisPourChamp(iso)`.

### lib/media-url.ts (pur, client OK)
`LARGEURS_MEDIA = [480, 960, 1600, 2400]` · types `VarianteImage {largeur, hauteur, chemin}`, `VariantesMedia`,
**`ImageMedia {id, alt, largeur, hauteur, provisoire, variantes}`**, **`DocumentMedia {id, nom, url, urlTelechargement, poids, mime}`** ·
`urlMedia(rel)` · `construireSrcSet(img)` · `choisirVariante(img, largeur)` · `attributsImage(img, {sizes, largeurCible})` · `formaterPoids(octets)`.

### lib/media.ts
Type `Media {id, nom_original, alt, largeur, hauteur, variantes, statut, type: "image" | "document", provisoire, mime, poids, source, created_at}`.
`lireMedia(id)` · `lireMedias(ids): Map` · `lireMediaParSource(source)` · `listerMedias({statut?, type?, limite?})` (médiathèque du BO) ·
`versImage(m)` / `lireImage(id)` (null si pas prête) · `versDocument(m)` / `lireDocument(id)` · `statutMedia(id)` ·
`modifierAltMedia(id, alt)` · `definirProvisoire(id, b)` · `mediaReference(id)` (réalisation, menu, article, emplacement) ·
**`supprimerMediaSiOrphelin(id)`** · **`supprimerMediaEtFichiers(id)`** · `jointureSure(racine, rel)` ;
interne pipeline : `creerMediaEnAttente`, `creerMediaDocument`, `reserverProchainJob`, `terminerJob`, `echouerJob`, `reprendreJobsBloques`,
`purgerMediasOrphelins` (hors seed), `purgerBrutsOrphelins`.

### lib/media-pipeline.ts
`enregistrerFichier({buffer, nomOriginal, alt?, accepte?: ("image" | "pdf")[], provisoire?, source?}): Promise<{ok, media} | {ok: false, erreur}>`
(signature binaire vérifiée ; JPEG, PNG, WebP, AVIF, GIF, PDF ; SVG et TIFF refusés ; 25 Mo, 50 Mpx max) ·
`relancerWorker()` · `viderFile()` (scripts) · `demarrerWorkerMedias()` (instrumentation) · **`reprendreTraitements()`** (en tête des pages BO
qui affichent des médias) · `POIDS_MAX_UPLOAD`. Sortie : `UPLOADS_DIR/<id>/w480.webp…` + `original.jpg` (3000 px max, EXIF retiré).

### lib/realisations.ts
`CATEGORIES_REALISATION`, `LIBELLES_CATEGORIES` (« Broche et barbecue »...), types `Realisation`, `RealisationPublique` (+ `image`),
`RealisationAdmin` (+ `statut_media`, `alt`, `provisoire`, `image`).
**`listerRealisationsPubliques(categorie?, limite?)`** · **`categoriesUtilisees()`** (filtres) · `listerRealisationsAdmin()` · `lireRealisation(id)` ·
`realisationDuMedia(mediaId)` · `creerRealisation({media_id, legende?, categorie?, visible?})` · `modifierRealisation(id, patch)` ·
`supprimerRealisation(id)` (supprime aussi la photo si elle ne sert plus) · `ordonnerRealisations(ids)` · `deplacerRealisation(id, sens)` · `compterRealisations()`.
L'alt est porté par le média : `modifierAltMedia`.

### lib/articles.ts + lib/markdown.ts
- Types `Article`, `ArticleAvecCouverture` (+ `couverture: ImageMedia | null`), `EntreeArticle`, `StatutArticle`, `EtatArticle`
  (`brouillon | programme | publie`, calculé), `LIBELLES_ETAT_ARTICLE`, `LIMITES_ARTICLE`.
- **Site** : `listerArticlesPublies({limite?, decalage?})` · `compterArticlesPublies()` · **`articlePublie(slug)`** · `articlesPourSitemap()`.
- BO : `listerArticlesAdmin()` (+ `etat`) · `lireArticle(id)` · `lireArticleComplet(id)` (aperçu) · `validerArticle(e, saufId?)` · `creerArticle(e)` ·
  `modifierArticle(id, e)` · `definirStatutArticle(id, statut)` · `supprimerArticle(id)` · `etatArticle(a)` · `compterArticles()` · `slugArticleUnique`.
- Markdown restreint (pur) : `analyserMarkdown(src): Bloc[]` · `texteBrut(src, max)` (meta description) · `tempsLecture(src)` · `lienSur(href)`.
  Syntaxe : `## `, `### `, `- `, `1. `, `> `, `**gras**`, `*italique*`, `[texte](/chemin ou https://)`. Rendu : `<Markdown>` (section 8).

### lib/avis.ts
`SOURCES_AVIS`, type `Avis {id, auteur, texte, note, source, date, visible, position}` ·
`listerAvisPublics(limite?)` · `listerAvisAdmin()` · `lireAvis(id)` · `validerAvis(e)` · `creerAvis(e)` · `modifierAvis(id, e)` ·
`definirAvisVisible` · `supprimerAvis(id)` · `ordonnerAvis(ids)` · `deplacerAvis(id, sens)` · `compterAvis()`.
**Aucun avis en base** : la section avis du site doit se masquer si la liste est vide. Jamais d'`aggregateRating`.

### lib/messages.ts, lib/mail.ts
`TYPES_MESSAGE` (`devis-traiteur | commande-boucherie | autre`), `LIBELLES_TYPES_MESSAGE`, type `Message`, `EntreeMessage`, `LIMITES_MESSAGE` ·
`validerMessage(e)` · `creerMessage(e)` · `lireMessage(id)` · `listerMessages({nonLusSeulement?, type?, email?, limite?, decalage?})` ·
`compterMessagesNonLus()` · `compterMessages()` · `marquerMessageLu(id, lu)` · `supprimerMessage(id)` · `supprimerMessagesParEmail(email)` ·
`listerMessagesParEmail(email)` · `purgerMessagesAnciens(mois?)` · `estEmailValide(v)` · `estTelephoneValide(v)`.
`notifierNouveauMessage(m)` (Brevo si `BREVO_API_KEY`, ne lève jamais) · `construireEmailMessage(m)`.

### lib/audience.ts, lib/compter-vue.ts
`compterVue(chemin): Promise<void>` (dans chaque PAGE publique, jamais le layout) · `syntheseVues(30): {jours, total, aujourdhui, parJour[], pagesLesPlusVues[]}` ·
`enregistrerVue` · `purgerVuesAnciennes` · `normaliserCheminVue`.

### lib/admins.ts, lib/auth.ts, lib/chemin-admin.ts
- `Admin {id, email, name, session_version, created_at}` · `listerAdmins()` · `compterAdmins()` · `lireAdmin(id)` · `lireAdminParEmail(email)` ·
  `creerAdmin({email, name?, motDePasse})` (async) · `modifierProfilAdmin(id, patch)` · `definirMotDePasse(id, nouveau)` (async, ferme les sessions) ·
  `changerSonMotDePasse(id, actuel, nouveau)` (async) · `supprimerAdmin(id)` (refuse le dernier). Mot de passe : 12 caractères minimum.
- `lireUtilisateur(): Promise<Admin | null>` (dédupliqué par requête) · **`requireUser(): Promise<Admin>`** (redirige vers `/<secret>/connexion`) ·
  `connecter(email, mdp)` · `deconnecter()` · `rafraichirSaSession(adminId, version)` · `adresseClient()` · `nomCookieSession()`
  (`__Host-cherblanc_bo` en HTTPS, `cherblanc_bo` avec `COOKIE_SECURE=0`). HttpOnly, SameSite=Lax, `path=/`, 12 h.
- **`cheminAdmin()`** (`"/" + ADMIN_PATH`, 404 si absent) · **`lienAdmin("/menus")`**. Server only.

### lib/formulaire.ts, lib/jeton-formulaire.ts, lib/seo.ts
- `champTexte`, `champMultiligne`, `champId`, `champEntier`, `champEntierOuNull`, `champBooleen`, `champChoix`, `champJson`, `champListeIds` ·
  type **`EtatAction {ok, message?, erreurs?, valeurs?, id?}`** · `etatInitial`.
- `emettreJeton(USAGE_CONTACT)` (à rendre dans un champ caché `jeton` du formulaire de contact) · `verifierJeton` · `consommerJeton`.
- SEO : section 9.

## 7. Server Actions (`lib/actions/*.ts`, toutes `"use server"`)

Chacune appelle `requireUser()` en première ligne (sauf `contact.ts`, publique), vérifie l'existence de l'ID
lié, renvoie un `EtatAction` (messages en français simple) et appelle `refresh()` (`next/cache`) pour
ré-afficher la page du BO. ID lié côté serveur : `action.bind(null, id)`. Formulaires : `useActionState(action, etatInitial)`.

| Fichier | Actions (paramètres liés avant `(_prec, fd)`) |
|---|---|
| `auth.ts` | `actionConnexion(_prec, fd)` (champs `email`, `mot_de_passe`) · `actionDeconnexion()` |
| `menus.ts` | `creerMenuAction(_prec, fd)` · `modifierMenuAction(menuId, _prec, fd)` · `basculerMenuVisibleAction(menuId, visible)` · `supprimerMenuAction(menuId)` · `dupliquerMenuAction(menuId, _prec, fd)` (`titre`) · `deplacerMenuAction(menuId, sens)` · `ordonnerMenusAction(ids)` · `retirerPdfMenuAction(menuId)` · `retirerCouvertureMenuAction(menuId)` · `creerSectionAction(menuId, _prec, fd)` · `modifierSectionAction(sectionId, _prec, fd)` · `basculerSectionVisibleAction(sectionId, v)` · `supprimerSectionAction(sectionId)` · `deplacerSectionAction(sectionId, sens)` · `ordonnerSectionsAction(menuId, ids)` · `creerPlatAction(sectionId, _prec, fd)` · `modifierPlatAction(platId, _prec, fd)` · **`modifierPrixAction(platId, _prec, fd)`** (`prix`) · `basculerPlatVisibleAction(platId, v)` · `supprimerPlatAction(platId)` · `deplacerPlatAction(platId, sens)` · `ordonnerPlatsAction(sectionId, ids)` · `ordonnerPlatsFormAction(sectionId, fd)` (`ordre`) |
| `horaires.ts` | `enregistrerHorairesAction(_prec, fd)` (`horaires` = JSON semaine) · `creerHoraireExceptionnelAction(_prec, fd)` · `modifierHoraireExceptionnelAction(id, _prec, fd)` (`date`, `mode`, `plages` JSON, `libelle`, `note`) · `supprimerHoraireExceptionnelAction(id)` · `enregistrerAnnonceAction(_prec, fd)` (`active`, `texte`, `lien`, `debut`, `fin`) |
| `medias.ts` | `modifierAltAction(mediaId, _prec, fd)` · `definirProvisoireAction(mediaId, b)` · `definirEmplacementAction(cle, mediaId \| null)` · `supprimerMediaAction(mediaId)` (refuse s'il est utilisé) |
| `realisations.ts` | `modifierRealisationAction(id, _prec, fd)` (`legende`, `categorie`, `visible`, `alt`) · `basculerRealisationVisibleAction(id, v)` · `supprimerRealisationAction(id)` · `deplacerRealisationAction(id, sens)` · `ordonnerRealisationsAction(ids)` · `ordonnerRealisationsFormAction(fd)` |
| `articles.ts` | `creerArticleAction(_prec, fd)` (redirige vers `/actualites/<id>`) · `modifierArticleAction(id, _prec, fd)` (`titre`, `slug`, `chapo`, `corps`, `couverture_media_id`, `statut`, `publie_le` datetime-local Paris, `titre_seo`, `description_seo`) · `definirStatutArticleAction(id, statut)` · `supprimerArticleAction(id)` |
| `avis.ts` | `creerAvisAction` · `modifierAvisAction(id, …)` (`auteur`, `texte`, `note`, `source`, `date`, `visible`) · `basculerAvisVisibleAction` · `supprimerAvisAction` · `deplacerAvisAction` · `ordonnerAvisAction` |
| `messages.ts` | `marquerLuAction(id, lu)` · `supprimerMessageAction(id)` · `supprimerMessagesParEmailAction(_prec, fd)` (`email`) |
| `admins.ts` | `creerAdminAction(_prec, fd)` (`email`, `name`, `mot_de_passe`) · `modifierSonProfilAction` · `changerSonMotDePasseAction` (`actuel`, `nouveau`, `confirmation`) · `reinitialiserMotDePasseAction(adminId, _prec, fd)` · `supprimerAdminAction(adminId)` |
| `contact.ts` (PUBLIQUE) | `envoyerMessageAction(_prec, fd)` : champs `type`, `prenom`, `nom`, `email`, `telephone`, `date_evenement`, `nb_personnes`, `message`, `jeton` (caché, `emettreJeton(USAGE_CONTACT)`), piège `site_web` (masqué, vide). Retour `message` = `envoye` \| `verifier` (nouveau jeton dans `valeurs.jeton`) \| `limite` \| `erreur`, ou `erreurs` par champ + `valeurs`. |

### Envoi de fichiers (Route Handler)
`POST ${lien("/api/upload")}` (multipart, en-tête `Origin` requis) : `file` (1 à 30), `usage` = `media` | `realisation`
(`categorie`, `legende`) | `emplacement` (`cle`) | `menu-pdf` (`menu_id`) | `menu-couverture` (`menu_id`), `alt`, `provisoire=1`.
Réponse `{ok, items: [{nom, ok, mediaId, statut, realisationId?, erreur?}]}`. L'ancien média d'un emplacement / PDF / couverture
est supprimé s'il ne sert plus. Suivi : `GET ${lien(`/api/media/${id}`)}` -> `{ok, id, statut, erreur}` toutes les 1 à 2 s.
Non connecté : 401 JSON. Un fichier par requête (XHR `upload.onprogress`) pour la progression.

## 8. Composants disponibles

### Partagés (`components/ui/`, Server Components sauf mention)
| Composant | Props |
|---|---|
| `<Visuel>` (visuel.tsx) | `image: ImageMedia \| null`, **`sizes`** (obligatoire), `className?`, `alt?` (remplace l'alt du média, `""` décoratif), `priorite?` (LCP : eager + fetchpriority high), `ratio?` (aplat de secours si absent), `largeurCible?`. Pose srcset, width/height. À envelopper dans `.cadre .ratio-…` pour recadrer. |
| `<JsonLd donnees={...} />` (json-ld.tsx) | objet ou tableau JSON-LD, `<` échappé |
| `<Markdown source className="prose" />` (markdown.tsx) | rendu React du Markdown restreint (aucun HTML brut), client ou serveur |
| `<Surtitre centre? as?>` (motifs.tsx) | surtitre capitales cuivre |
| `<FiletLosange className?>` | séparateur filet + losange |
| `<FlecheDroite taille?>` | flèche des `.lien-fleche` |
| `<LigneCarte nom prix unite? detail? badge?>` | ligne à points de conduite « nom ....... prix UNITÉ » |
| `<Logo variante="monogramme" \| "complet" couleur="encre" \| "olive" \| "creme" \| "or" taille alt? className?>` (logo.tsx) | SVG de `public/logo/` |

### Site public (`components/site/`)
- `<Habillage>` : lien d'évitement, `<BandeauAnnonce>` (si `annonceEnCours()`), `<Entete>` (client : compactage au défilement avec
  fond crème translucide, sous-menu « Le traiteur », menu mobile plein écran, téléphone affiché à partir de 1500 px), `<main id="contenu">`,
  `<Pied>` (olive profond : logo complet or, adresse, téléphones, e-mail, itinéraire, horaires groupés depuis la base, horaires
  exceptionnels des 30 prochains jours, navigation, liens légaux et réseaux), `<Revelations>` (client). **Déjà monté par le layout** :
  les pages ne rendent que leur contenu (pas de `<main>` à elles).
- `<Revelations>` : ajoute `.est-visible` aux `.apparait` entrés dans l'écran (une fois). Neutralisé sans JS et sous reduced-motion.

### Backoffice (`components/admin/`)
- `FournisseurCheminAdmin` (monté par le layout), hooks client **`useCheminAdmin()`** et **`useLienAdmin()`** (`lien("/menus")`).
- `<CoqueAdmin utilisateur actionDeconnexion pastilles>` (déjà montée par `(espace)/layout.tsx`), `NAVIGATION_ADMIN` (navigation.ts),
  `<Icone nom taille?>` (icones.tsx), `<FormulaireConnexion action>`, `<EcranAVenir titre>` (placeholder à supprimer).
- Classes `bo-*` (app/(admin)/bo/admin.css) : `bo-titre`, `bo-sous-titre`, `bo-discret`, `bo-pile`, `bo-pile-large`, `bo-rangee`, `bo-carte`,
  `bo-grille-chiffres`, `bo-chiffre(-valeur)`, `bo-grille-modules`, `bo-module`, `bo-tableau`, `bo-champ`, `bo-aide`, `bo-saisie`, `bo-erreur`,
  `bo-bouton` (+ `-principal`, `-secondaire`, `-danger`, `-large`), `bo-bouton-icone`, `bo-alerte` (+ `-erreur`, `-succes`), `bo-etiquette`
  (+ `-provisoire` : badge « visuel à remplacer »), `bo-pastille`. Boutons de 48 px (usage au téléphone).

## 9. Conventions des pages publiques (lot pages) et SEO (lot SEO)

```tsx
// app/(site)/carte-traiteur/page.tsx
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/ui/json-ld";
import { compterVue } from "@/lib/compter-vue";
import { imageEmplacement } from "@/lib/emplacements";
import { carteTraiteur } from "@/lib/menus";
import { construireMetadata, filArianeJsonLd, menuJsonLd } from "@/lib/seo";

export async function generateMetadata() {            // jamais `export const metadata` (figé au build)
  return construireMetadata({ titre: "Carte traiteur et tarifs", description: "…", chemin: "/carte-traiteur", image: imageEmplacement("carte-hero") });
}

export default async function Page() {
  await compterVue("/carte-traiteur");                  // dans la PAGE, jamais dans le layout
  const carte = carteTraiteur();
  if (!carte) notFound();
  return (
    <>
      <JsonLd donnees={[menuJsonLd(carte, "/carte-traiteur"), filArianeJsonLd([{ nom: "Carte traiteur", chemin: "/carte-traiteur" }])]} />
      …
    </>
  );
}
```
- `construireMetadata({titre?, titreAbsolu?, description?, chemin, image?, noindex?, type?, publieLe?})` : canonical, Open Graph,
  Twitter, robots (noindex auto si `NOINDEX=1`). `image` accepte un `ImageMedia` (ex. `imageEmplacement("og-defaut")`).
- JSON-LD : `commerceJsonLd({horaires, exceptionnels?, images?})` (`Store` + `FoodEstablishment`, adresse, horaires de la base,
  `specialOpeningHoursSpecification` depuis les horaires exceptionnels à plages connues, `hasMenu`, `areaServed`, `sameAs`, `founder` ;
  pas de `geo` tant que `siteConfig.geo` est `null`, aucun avis ni note), `siteWebJsonLd()`, `filArianeJsonLd([{nom, chemin}])`,
  `faqJsonLd([{question, reponse}])`, `menuJsonLd(menu, chemin)`, `articleJsonLd(article)`, `specificationHoraires(h)`,
  `urlAbsolue(chemin)`, `titreComplet(titre)`, `serialiserJsonLd`. L'accueil provisoire publie déjà `commerceJsonLd` + `siteWebJsonLd`.
- Sitemap : `app/(site)/sitemap.ts` (pages de `siteConfig.pages` + actualités en ligne). robots : `app/robots.ts` (jamais le BO).
- Images : `<Visuel>` partout (pas de `next/image` sur les médias). Badge visuel provisoire : `image.provisoire`.
- Carte et menus : afficher `section.note` comme en-tête de colonne (« À la part ») et `plat.unite` en petites capitales ; les
  formules (`section.mise_en_avant`) en bloc encadré ; `groupesComposition(plat.description)` pour les compositions et intertitres.
  PDF : `menu.pdf.url` (affichage) ou `menu.pdf.urlTelechargement`, poids via `formaterPoids(menu.pdf.poids)`.
- Horaires : `lireHoraires()` + `grouperHoraires` / `lignesHoraires` ; exceptionnels : `horairesExceptionnelsAVenir(jours)`
  (`plages === null` -> afficher la note).
- Coordonnées : `coordonnees()` (téléphones) et `siteConfig` (adresse, itinéraire). Jamais de numéro en dur.
- Contact : formulaire client avec `envoyerMessageAction` + champ caché `jeton` (`emettreJeton(USAGE_CONTACT)` rendu par la page,
  donc la page reste dynamique) + champ piège `site_web` masqué. Phrase RGPD près du bouton (conservation
  `siteConfig.confidentialite.conservationMessagesMois` mois). Aucune case pré-cochée.
- Mentions légales : `siteConfig.legal.editeur` (n'afficher que les champs non `null`), hébergeur `null` = TODO.
- Pas de bandeau cookies : la mesure est un compteur serveur sans cookie ni IP (à dire dans la politique de confidentialité).

### CSS : jetons (app/globals.css, `var(--…)` uniquement)
Fonds `--creme` (page), `--lin`, `--sable`, `--olive`, `--olive-profond` · texte `--encre`, `--encre-douce` (5,6:1), `--encre-tres-douce` (4,8:1) ·
`--cuivre` (filets, décor, grands chiffres : 3,6:1 seulement), **`--cuivre-texte`** (= `--cuivre-fonce` #8A5C1E, 4,9:1 : tout petit texte cuivre) ·
`--or` (sur olive) · `--sur-olive`, `--sur-olive-doux` · `--trait`, `--trait-fort`, `--trait-clair` · ombres `--ombre-xs|s|m|l` (teintées olive) ·
rayons `--r-xs|s|m|l`, `--arche` · rythme `--page` 1240, `--page-large` 1440, `--page-etroite` 760, `--mesure` 62ch, `--gouttiere`, `--section`,
`--section-serree`, `--hauteur-entete` · typo `--display` (Fraunces), `--texte` (DM Sans), `--interlettrage-surtitre` · mouvement `--courbe`,
`--duree-entree` 600ms, `--decalage-serie` 80ms, `--transition`.

### CSS : classes utilitaires globales
Structure `.contenu` `.contenu-large` `.contenu-etroit` `.section` `.section-serree` · fonds `.fond-creme` `.fond-lin` `.fond-sable` `.fond-olive`
`.fond-olive-profond` (titres, surtitres, boutons et liens s'adaptent) `.grain` ·
typo `.titre-xl` `.titre-l` `.titre-m` (+ `<em>` = italique d'accent) `.surtitre` `.surtitre-centre` `.chapo` `.mesure` `.texte-doux` `.mention`
`.prix` `.prix-fort` `.unite` `.prose` `.badge` ·
actions `.bouton` (+ `.bouton-contour` `.bouton-or` `.bouton-petit`) `.lien-fleche` `.lien-souligne` ·
motifs `.filet-losange` `.filet` `.ligne-carte` (`__nom` `__points` `__prix` `__detail`) `.arche` `.arche-contour` ·
images `.cadre` `.cadre-arche` `.cadre-zoom` `.ratio-portrait` (4/5) `.ratio-paysage` (4/3) `.ratio-large` (16/9) `.ratio-carre` `.voile`
`.zoom-lent` (hero, 1.06 -> 1 sur 1,8 s) `.fondu-entree` · cartes et grilles `.carte` `.carte-survol` `.grille` `.grille-2|3|4` ·
mouvement `.apparait` (+ `-gauche` `-droite` `-zoom`), `.serie` (décalage de 80 ms entre enfants) ·
formulaires `.champ` `.etiquette` `.saisie` `.erreur-champ` · utilitaires `.invisible-accessible` `.evitement` `.centre` `.pile` `.rangee` `.sans-puces`.
Styles locaux : un CSS Module à côté du composant. `backdrop-filter` : écrire `-webkit-backdrop-filter` AVANT. Une classe globale
(`.bouton`) et une classe de module ont la même spécificité : pour masquer un `.bouton` dans un module, préfixer par un parent.

## 10. Proxy, en-têtes, déploiement (vérifiés)

- `/${ADMIN_PATH}/*` réécrit vers `/bo/*` avec `X-Robots-Tag: noindex, nofollow`, `Cache-Control: private, no-store`,
  `Referrer-Policy: same-origin`, `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'`. `/bo/*`, `/__bo/*`, `/admin` : 404 ordinaire.
- Public : `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, CSP minimale
  (`object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'`), `Permissions-Policy`, nosniff, HSTS en production HTTPS ;
  `NOINDEX=1` : `X-Robots-Tag` partout et robots `Disallow: /`. Tout formulaire doit poster sur le site (form-action 'self').
- `/media/*` : en-têtes posés par le Route Handler seul (CSP `sandbox` sur les images, sans `sandbox` sur les PDF, cache 1 an), `tmp/` jamais servi.
- Redirections 301 (next.config) : `/a-propos` -> `/la-maison`, `/services` et `/traiteur` -> `/traiteur-roanne`, `/boucherie` -> `/boucherie-roanne`,
  `/carte` et `/menu` -> `/carte-traiteur`, `/noel` -> `/menus-de-fetes`, `/traiteur-roanne/broche-barbecue-fumoir` -> `/traiteur-roanne/broche-barbecue`.
- Corps de requête : server.js refuse avant Next tout corps > 2 Mo hors `/${ADMIN_PATH}/api/upload` (413), > 26 Mo sur celle-ci.
  Valeurs liées : `POIDS_MAX_UPLOAD` 25 Mo, `proxyClientMaxBodySize` 26 Mo, `MAX_UPLOAD_BODY_BYTES` 26 Mo (server.js).
- Coolify : `Dockerfile` multi-stage `node:24-bookworm-slim`, utilisateur `node`, volume `/data` (`DATABASE_PATH=/data/cherblanc.db`,
  `UPLOADS_DIR=/data/uploads`), port 3000, `TRUST_PROXY=1`, healthcheck sur `/robots.txt`. Seed : `npm run seed` dans le conteneur
  (l'image embarque `seed-medias/`). Le build télécharge Fraunces et DM Sans (réseau requis au build seulement).
  Checklist de mise en ligne et réglage Traefik des tailles de corps : reprendre `~/Projects/woods/docs/FONDATION.md` section 9
  (mêmes valeurs ; adapter les noms de routeurs).

## 11. Découpage proposé en 3 lots (fichiers disjoints)

**Lot A, pages publiques** (crée ou remplace UNIQUEMENT) :
`app/(site)/page.tsx` + `accueil.module.css` (remplacer l'accueil provisoire), `app/(site)/{boucherie-roanne, traiteur-roanne,
traiteur-roanne/mariage, traiteur-roanne/cocktail-dinatoire, traiteur-roanne/broche-barbecue, carte-traiteur, menus-de-fetes,
realisations, la-maison, actualites, actualites/[slug], contact, mentions-legales, politique-de-confidentialite}/page.tsx` (+ leurs
`*.module.css`), `components/site/*` NOUVEAUX (sections, carte, galerie avec filtres, formulaire de contact, fil d'Ariane...),
`app/global-not-found.tsx` (mise en forme de la 404). Peut retoucher `entete.*` / `pied.*` / `habillage.tsx` si besoin, en restant
seul propriétaire de `components/site/`. Ne touche pas à `lib/` (demander au coordinateur si une fonction manque).

**Lot B, backoffice** : `app/(admin)/bo/(espace)/**` (remplacer les 9 écrans provisoires et ajouter les sous-pages),
`app/(admin)/bo/admin.css`, `components/admin/**` (supprimer `ecran-a-venir.tsx` à la fin), et si nécessaire les Server Actions
`lib/actions/*.ts` (seul lot autorisé à les modifier). Exigences du contrat : glisser-déposer + flèches, confirmations avant
suppression, messages de succès, aperçu « Voir sur le site » (`rel="noreferrer"`), badge « à remplacer » des visuels provisoires,
`reprendreTraitements()` en tête des pages qui affichent des médias, envoi par `/api/upload` avec progression.

**Lot C, SEO** : `lib/seo.ts` (enrichissements), `app/(site)/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`,
`app/opengraph-image.*` éventuel, `config/site.ts` (titres, descriptions, champs SEO), `next.config.ts` (redirections). Fournit
au lot A les `construireMetadata`/JSON-LD par page via ce document (les pages appellent les builders, le lot C ne les édite pas).

Fichiers communs gelés (changement = coordinateur) : `lib/db.ts` (schéma), `lib/*.ts` hors seo, `proxy.ts`, `server.js`,
`app/layout.tsx`, `app/globals.css` (les lots ajoutent leurs styles en CSS Modules ; un jeton manquant se demande).

## 12. Pièges rencontrés pendant la fondation

1. **create-next-app 16.4 active `cacheComponents` et `partialPrefetching`** : retirés (incompatibles avec force-dynamic + SQLite synchrone).
2. **`next dev` réécrit AGENTS.md** (texte avec tiret cadratin) : `agentRules: false` dans next.config. Doc de la version installée :
   `node_modules/next/dist/docs/`.
3. **React 19 / eslint `react-hooks/set-state-in-effect`** : pas de `setState` direct dans un `useEffect` (ex. fermer un menu au
   changement de page) ; utiliser l'ajustement pendant le rendu (`if (chemin !== precedent) {…}`), comme dans `entete.tsx`.
4. **Spécificité CSS** : `.bouton` (global) et une classe de module ont le même poids ; l'ordre de chargement décide. Préfixer par un parent.
5. **`backdrop-filter` crée un bloc conteneur** pour les descendants `position: fixed` : le panneau du menu mobile est positionné
   sous le bas réel de l'en-tête (variable `--bas-entete` posée à l'ouverture) et le flou est retiré quand le menu est ouvert.
6. **Préchargement des liens** : `<Link>` précharge les pages pointées ; tant que les pages du lot A n'existent pas, la console
   montre des 404 `?_rsc=` (normal, disparaissent avec les pages).
7. **Chrome headless `--window-size` < 500 px** est élargi d'office : pour le mobile, utiliser Playwright (viewport exact).
8. **Le logo fourni n'a pas de monogramme seul** (les 9 PDF sont le logo circulaire complet en différentes couleurs) : le monogramme
   est extrait du premier tracé du PDF par `scripts/generer-logos.ts`.
9. **Un seul serveur par dossier** (`next dev`) ; si `tsc` se plaint de `LayoutRoutes`, `rm -rf .next && npm run typecheck`.
10. Tester une Server Action sans navigateur : le formulaire rendu contient `$ACTION_REF_1`, `$ACTION_1:0`, `$ACTION_1:1`,
    `$ACTION_KEY` ; un POST multipart de ces champs + `Origin` sur l'URL de la page exécute l'action (recette de connexion faite ainsi).

## 13. Questions ouvertes (client)

- Directeur de publication, hébergeur (coordonnées), crédits photos : `null` + TODO dans `config/site.ts`.
- E-mail : la carte 2027 imprime `boucheriecherblanc@gmail.com`, le contrat fixe `contact@maisoncherblanc.fr` (utilisé).
- Menu de fêtes : les entrées et plats de chaque menu sont-ils un choix (« ou ») ou servis ensemble ? Le PDF les liste sans le dire ;
  le seed les reproduit tels quels sous « Entrée » / « Plat ». Prix des menus sans mention « par personne » (non ajoutée).
- Horaires des 24 et 31 décembre : seule l'heure limite de retrait (17h00) est connue. Fermeture des 2, 3 et 4 janvier 2027 déduite
  de « Réouverture le mardi 5 janvier 2027 ».
- Photos : le croquembouche et le gâteau aux framboises montrent les prénoms et la date d'un mariage (accord du client avant publication).
- Carte 2027 valable à partir du 1er janvier 2027 : prix de 2026 non fournis (le contrat indique les mêmes plats).
