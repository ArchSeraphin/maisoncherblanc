# MAISON CHERBLANC · Contrat d'architecture (site vitrine + backoffice)

Refonte complète de maisoncherblanc.fr (l'ancienne v1 Express + React n'a jamais été mise en ligne : le domaine
affiche une page Plesk par défaut, donc **aucun référencement existant à préserver**). Branche `v2` du dépôt
`ArchSeraphin/maisoncherblanc`. Ligne directrice : skill `archi-vitrine-cms`.

Maison Cherblanc est une **boucherie, charcuterie et traiteur** à Roanne (55 rue Mulsant). Les deux métiers
(boucherie ET traiteur) doivent être mis en avant **à égalité**.

**Mots clés prioritaires** : `boucherie roanne` et `traiteur roanne`. Secondaires : boucher Roanne, boucherie
charcuterie Roanne, charcuterie artisanale Roanne, traiteur mariage Roanne, cocktail dînatoire Roanne, plateau
charcuterie Roanne, plats cuisinés Roanne, traiteur Noël Roanne, broche et barbecue traiteur Roanne, traiteur Loire
(42), Roannais, Riorges, Mably, Le Coteau.

## Projets de référence (code éprouvé, à réutiliser plutôt que réécrire)
- `~/Projects/woods` : **référence principale**, même stack, déployé sur **Coolify** (Dockerfile, `server.js`,
  volume `/data`). Contient déjà carte avec prix, horaires, galerie, messages, e-mail Brevo, compteur de vues,
  proxy du chemin secret, pipeline médias. Lire `docs/CONTRAT.md` et `docs/FONDATION.md` de Woods.
- `~/Projects/gtpaysage` : articles de blog (éditeur, aperçu), avis, emplacements d'images éditables
  (`lib/emplacements.ts`), anti-spam formulaire sans service tiers, `CONVENTIONS.md`.
- Adapter (noms, entités, textes), ne pas copier aveuglément : chaque fichier repris doit être relu.

## Règles transversales (non négociables)
- **Jamais de tiret cadratin** (U+2014) nulle part : code, commentaires, textes, alt, meta, commits. Utiliser virgule,
  point, deux-points, parenthèses. Le demi-cadratin (U+2013) uniquement pour les intervalles (`7h30–13h`).
- Français impeccable, accents compris, apostrophe typographique (’) dans les textes affichés.
- Aucune dépendance tierce chargée côté visiteur : pas de CDN, pas de Google Fonts en runtime, pas d'iframe
  Maps/YouTube. Polices via `next/font` (auto-hébergées). Carte : image statique ou bloc dessiné + lien itinéraire.
- **Aucune info inventée** : pas d'année de création, pas de nombre de convives max, pas de label/prix non sourcé,
  pas d'avis clients fictifs, pas de note Google. Seuls les faits listés plus bas (ou sourcés dans `docs/COPY.md`).
- Une page/composant ne parle **jamais** à la DB : toujours via `lib/`.
- Tout le code métier en **français** (noms de fichiers, variables métier, commentaires), comme gtpaysage.

## Stack (versions résolues au registre au moment de l'install, pinnées en exact)
- Next.js dernière stable (16.4.x au 26/10/2026, à re-vérifier avec `npm view next version`), App Router, TypeScript.
  Compagnons tels qu'installés par `create-next-app@latest` (ne pas monter TypeScript à une majeure non supportée).
- CSS : **CSS Modules + variables globales** (`app/globals.css`), comme gtpaysage. Pas de Tailwind.
- better-sqlite3, sharp, iron-session, zod. Mot de passe `node:crypto` scrypt **asynchrone**.
- Node 24 LTS (`@types/node@24`). `serverExternalPackages: ['better-sqlite3','sharp']`.
- Animation : **CSS + IntersectionObserver maison** (aucune lib d'animation). Neutralisé sous `prefers-reduced-motion`.

## Arborescence
```
config/site.ts            source de vérité : nom, adresse, tél, e-mail, réseaux, légal, SEO de base, navigation
lib/db.ts                 singleton, schéma IF NOT EXISTS, ensureColumn, PRAGMA WAL/foreign_keys/busy_timeout
lib/<entité>.ts           un module par entité (voir Données)
lib/auth.ts               iron-session, getUser(), requireUser(), session_version
lib/seo.ts                construireMetadata(), builders JSON-LD
lib/media-pipeline.ts     sharp + file d'attente jobs + worker séquentiel
components/ui/*           partagé (Visuel, Section, Bouton…)
components/site/*         public (Server Components par défaut)
components/admin/*        backoffice
app/(site)/...            pages publiques (layout force-dynamic)
app/(admin)/bo/...        backoffice (servi via ADMIN_PATH réécrit par proxy.ts)
app/media/[...path]       Route Handler des médias uploadés
proxy.ts                  /${ADMIN_PATH}/* -> /bo/*, 404 sur /bo/* et /__bo/* en direct, en-têtes admin, NOINDEX
scripts/                  seed.ts, create-admin.ts, list-admins.ts, import-medias.ts, purge-messages.ts
seed-medias/              médias source importés par le seed (photos/, ia/, logo/, documents/), voir plus bas
docs/                     CONTRAT.md, FONDATION.md, COPY.md (textes et SEO), DA.md
Dockerfile, server.js     production Coolify (modèle Woods)
```

## URLs publiques
| URL | Rôle | Cible SEO principale |
|---|---|---|
| `/` | Accueil, deux portes égales Boucherie / Traiteur | **boucherie roanne**, **traiteur roanne**, boucherie charcuterie traiteur Roanne |
| `/boucherie-roanne` | La boucherie-charcuterie : viandes, charcuterie maison, fumoir, volailles, conseils | **boucherie roanne**, boucher Roanne, charcuterie Roanne |
| `/traiteur-roanne` | Hub traiteur : prestations, comment ça marche, carte, devis | **traiteur roanne**, traiteur Loire |
| `/traiteur-roanne/mariage` | Traiteur mariage | traiteur mariage Roanne |
| `/traiteur-roanne/cocktail-dinatoire` | Cocktails, petit dînatoire, buffets, plateaux | cocktail dînatoire Roanne, buffet Roanne |
| `/traiteur-roanne/broche-barbecue` | Animations rôtissoire à broche et barbecue (remorque mobile) | broche Roanne, barbecue traiteur Roanne |
| `/carte-traiteur` | Carte et tarifs (DB) + PDF téléchargeable | carte traiteur Roanne, plats cuisinés Roanne, plateau charcuterie Roanne |
| `/menus-de-fetes` | Menu de saison en cours (DB, ex. Noël 2026) + dates de commande + PDF | traiteur Noël Roanne, menu de fêtes Roanne |
| `/realisations` | Galerie (DB) filtrable par catégorie | |
| `/la-maison` | Histoire, équipe, savoir-faire, engagements | |
| `/actualites`, `/actualites/[slug]` | Articles (DB) | longue traîne locale |
| `/contact` | Coordonnées, horaires, plan, formulaire devis/commande | devis traiteur Roanne |
| `/mentions-legales`, `/politique-de-confidentialite` | Légal (depuis config) | |

Redirections 301 de confort (anciennes routes v1, jamais indexées) : `/a-propos` -> `/la-maison`, `/services` ->
`/traiteur-roanne`, `/boucherie` -> `/boucherie-roanne`, `/traiteur` -> `/traiteur-roanne`, `/carte` et `/menu` ->
`/carte-traiteur`, `/noel` -> `/menus-de-fetes`, `/traiteur-roanne/broche-barbecue-fumoir` -> `/traiteur-roanne/broche-barbecue`. **`/admin` reste un 404 ordinaire.**

## Données (SQLite)
- `admins(id, email UNIQUE, name, password_hash, session_version, created_at)`
- `settings(key PRIMARY KEY, value TEXT JSON)`. Clés :
  - `horaires` : 7 jours, plages `[{ouverture:"07:30", fermeture:"13:00"}]` (vide = fermé)
  - `annonce` : `{active, texte, lien, debut?, fin?}` (bandeau en haut du site, ex. « Commandes de fêtes jusqu’au 20 décembre »)
  - `emplacements` : `{ "<cle-emplacement>": media_id }` (photos des pages, éditables, voir liste ci-dessous)
  - `coordonnees_affichage` éventuel si besoin de surcharger config (optionnel, sinon config fait foi)
- `horaires_exceptionnels(id, date ISO UNIQUE, libelle, plages JSON ([] = fermé), note)` : fermetures et
  ouvertures exceptionnelles. Affichés sur le site (contact, pied de page si dans les 30 jours) et en JSON-LD
  `specialOpeningHoursSpecification`. Purge auto des dates passées de plus de 60 jours.
- `menus(id, slug UNIQUE, type 'permanent'|'saison', titre, sous_titre, intro, note_bas, infos_commande, valable_du, valable_au,
  publie_du, publie_au, pdf_media_id NULL, couverture_media_id NULL, visible, position, created_at, updated_at)`
  - La carte traiteur 2027 = 1 menu `permanent` (slug `carte-traiteur`). Le menu de fêtes 2026 = 1 menu `saison`.
  - `/menus-de-fetes` affiche le(s) menu(s) `saison` visibles dont la fenêtre de publication couvre aujourd'hui ;
    sinon un état « prochains menus bientôt » + inscription implicite via contact (pas de newsletter).
- `menu_sections(id, menu_id FK CASCADE, titre, note (ex. « À la part », « Plaque de 50 parts environ »), mise_en_avant BOOL
  (formules encadrées), position, visible)`
- `menu_plats(id, section_id FK CASCADE, nom, description (multiligne, 1 ligne = 1 élément de composition), prix TEXT ("6 €", "14 €", "23,99 €"),
  unite TEXT ("par pers.", "la part", "pièce", "le kg", "les 100 g", "la plaque", ""), badge NULL ('Fait maison','Nouveau','Végétarien','Sur commande'), position, visible)`
- `media(id, nom_original, alt, largeur, hauteur, variantes JSON, statut 'pending'|'processing'|'ready'|'error', type 'image'|'document', provisoire BOOL, created_at)`
  + `jobs(id, media_id, statut, tentatives, erreur, created_at)`. `provisoire` = visuel IA à remplacer (badge dans le BO).
- `realisations(id, media_id FK, legende, categorie 'mariage'|'cocktail'|'buffet'|'broche-barbecue'|'plateaux'|'boucherie', position, visible)`
- `articles(id, slug UNIQUE, titre, chapo, corps (Markdown restreint rendu côté serveur, sans HTML brut), couverture_media_id NULL,
  statut 'brouillon'|'publie', publie_le, titre_seo, description_seo, created_at, updated_at)`
- `avis(id, auteur, texte, note 1–5, source 'google'|'direct', date, visible, position)` : saisis à la main. **Pas d'aggregateRating** en JSON-LD.
- `messages(id, type 'devis-traiteur'|'commande-boucherie'|'autre', prenom, nom, email, telephone, date_evenement NULL, nb_personnes NULL,
  message, created_at INDEX, lu_le)` : purge auto à 12 mois. Notification e-mail (Brevo API si `BREVO_API_KEY`, sinon
  stockage seul) vers `CONTACT_EMAIL`. Anti-spam maison (jeton horodaté + champ piège), rate-limit.
- `page_views(jour, chemin, compte, PRIMARY KEY(jour,chemin))` : compteur maison, sans IP, sans cookie => **aucun bandeau cookies**.

### Emplacements d'images (clés stables, éditables dans le BO « Photos des pages »)
`accueil-hero-boucherie`, `accueil-hero-traiteur`, `accueil-savoir-faire`, `accueil-maison`,
`boucherie-hero`, `boucherie-viandes`, `boucherie-charcuterie`, `boucherie-fumoir`, `boucherie-volailles`,
`traiteur-hero`, `traiteur-mariage`, `traiteur-cocktail`, `traiteur-broche`, `traiteur-plats`,
`mariage-hero`, `cocktail-hero`, `broche-hero`, `carte-hero`, `fetes-hero`, `maison-hero`, `maison-equipe`, `contact-boutique`, `og-defaut`.
Le seed remplit chaque emplacement depuis `seed-medias/*/manifest.json` (champ `emplacement`).

### Format `seed-medias/<dossier>/manifest.json`
```json
[{ "fichier": "nom.jpg", "alt": "Texte alternatif descriptif", "emplacement": "boucherie-hero" | null,
   "realisation": "mariage" | null, "legende": "…" | null, "provisoire": false }]
```
`photos/` (46 vraies photos, déjà nommées SEO), `ia/` (visuels Freepik provisoires, `provisoire: true`),
`logo/` (logos PNG/PDF, à convertir en SVG pour le site), `documents/` (PDF carte traiteur 2027, menu de fêtes 2026),
`menus/` (extraits texte des PDF, source du seed des menus).

## Auth / backoffice (objectif : **facile pour un artisan non technicien**)
- Chemin secret `ADMIN_PATH` (env, runtime), segment interne `/bo`. Jamais de lien public vers le BO. `/admin` = 404.
- `requireUser()` en tête de chaque page/action ; routes API BO : `getUser()` + 401. Rate-limit login (TRUST_PROXY,
  dernier élément XFF), messages génériques. Cookie session `path=/`.
- Ergonomie : libellés en français simple (pas de jargon : « Publier », « Masquer du site », « Prix », « Photo »),
  gros boutons, aperçu « Voir sur le site » (lien `rel="noreferrer"`), confirmations avant suppression, messages
  de succès clairs, utilisable sur téléphone (le boucher modifiera un prix depuis son mobile).
- Modules : **Tableau de bord** (vues 30 jours, messages non lus, raccourcis « Changer un prix », « Ajouter une
  fermeture », « Publier une actualité »), **Carte & menus** (menus, sections, plats CRUD, prix/unité, masquer,
  réordonnancement drag-and-drop + flèches, PDF, dupliquer un menu pour l'année suivante), **Horaires** (semaine type
  + fermetures/ouvertures exceptionnelles), **Bandeau d'annonce**, **Actualités** (éditeur simple, brouillon/publié,
  aperçu), **Avis**, **Réalisations** (upload multiple, alt, catégorie, ordre), **Photos des pages** (emplacements),
  **Messages** (lecture, marquer lu, recherche par e-mail, suppression), **Administrateurs** (multi, mot de passe).

## Env
`DATABASE_PATH` (défaut `./data/cherblanc.db`, `/data/cherblanc.db` en prod), `UPLOADS_DIR` (défaut `./data/uploads`,
`/data/uploads` en prod), `SESSION_SECRET` (>=32, validé au runtime), `ADMIN_PATH`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
(seed), `SITE_URL` (défaut https://maisoncherblanc.fr), `TRUST_PROXY`, `NOINDEX`, `BREVO_API_KEY`, `CONTACT_EMAIL`
(défaut contact@maisoncherblanc.fr), `MAIL_FROM`.

## Infos factuelles (config/site.ts)
- **Maison Cherblanc**, boucherie, charcuterie, traiteur. SARL MAISON CHERBLANC, capital 5 000 €, RCS Roanne 977 639 780,
  SIRET 977 639 780 00013, TVA FR95977639780, NAF 10.11Z, immatriculée le 20/07/2023 (reprise du fonds de la Boucherie Viallon
  et Filles le 09/08/2023). Gérants : Thibaut Cherblanc (orthographe du registre) et Emilie Viallon.
- **Fumoir NON confirmé** : les photos « fumoir » montrent une rôtissoire à broche mobile. Ne jamais affirmer un fumoir.
- 55 rue Mulsant, 42300 Roanne (Loire). Tél boutique **04 77 71 16 11**, mobile **06 22 22 49 68**.
- E-mail public : **contact@maisoncherblanc.fr**. Réseaux : https://www.instagram.com/maisoncherblanc/ , https://www.facebook.com/profile.php?id=100094509101001
- Horaires (carte 2027) : **lundi fermé** ; mardi et vendredi 7h30–13h00 et 15h00–19h00 ; mercredi et jeudi 7h30–13h00 ;
  samedi 7h30–18h00 ; dimanche 8h00–12h00.
- Traiteur : commande **une semaine avant** ; **option service à table** disponible ; devis gratuit ; carte 2027
  valable du 1er janvier au 31 décembre 2027 (la carte 2026 a les mêmes plats, sert de base jusqu'au 31/12/2026).
- Photos réelles attestant : buffets et cocktails, plateaux charcuterie et fromages, mariages (pièces montées,
  tour de macarons, gâteau personnalisé), fumoir mobile et cuisson de jambons, barbecue de côtes de bœuf,
  animations bar (tiki bar, bar à bière, bar à limonades), équipe en service.
- Mentions légales : forme juridique, SIREN, capital, TVA, hébergeur à compléter (`docs/COPY.md` + recherche
  annuaire-entreprises). Hébergeur : VPS Coolify de l'agence (coordonnées à confirmer, laisser un TODO visible
  dans `config/site.ts` et non sur le site).

## Déploiement
Coolify, Dockerfile multi-stage Node 24 (modèle Woods), port 3000, volume persistant `/data` (DB + uploads),
healthcheck, `TRUST_PROXY=1`. Seed : `npm run seed` dans le conteneur. Préproduction avec `NOINDEX=1`.

## Vérification (avant toute livraison de lot)
`npm run typecheck && npm run lint && npm run build` sans erreur, puis tests runtime réels (curl, Playwright).
Un seul `next dev` à la fois dans le dossier (verrou `.next/dev`).
