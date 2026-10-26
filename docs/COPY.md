# MAISON CHERBLANC · Textes du site et stratégie SEO locale

Site maisoncherblanc.fr (v2). Requêtes principales : **boucherie roanne** et **traiteur roanne**, travaillées à égalité. Secondaires : boucher Roanne, boucherie charcuterie Roanne, charcuterie Roanne, traiteur mariage Roanne, cocktail dînatoire Roanne, buffet Roanne, plateau charcuterie Roanne, plats cuisinés Roanne, traiteur Noël Roanne, menu de fêtes Roanne, jambon à la broche Roanne, traiteur Loire, Roannais.

Document rédigé le 26 octobre 2026. Il fait foi pour les textes affichés, les balises `title` et `meta description`, les textes alternatifs et le contenu des actualités de lancement.

## Mode d’emploi pour l’intégration

- Chaque page suit le même ordre : `title`, `meta`, `H1`, puis les sections dans l’ordre d’affichage.
- `surtitre` = petit label en capitales espacées (DM Sans, cuivre) au-dessus d’un titre. `chapô` = paragraphe d’introduction plus grand. `bouton` = libellé exact du lien ou du bouton, avec sa cible entre parenthèses.
- Les longueurs indiquées après chaque `title` et `meta` sont en caractères, espaces compris (vérifiées par script).
- `alt` : textes alternatifs proposés pour les emplacements d’images du contrat (`accueil-hero-boucherie`, etc.). Ils décrivent la photo réelle du dossier `seed-medias/photos/` proposée entre crochets. Si la photo change dans le backoffice, l’alt doit suivre.
- Adresse, téléphones, e-mail et horaires viennent de `config/site.ts` et des réglages du backoffice : ils sont écrits en clair ici pour la relecture, mais doivent être injectés depuis la source de vérité.
- Les prix cités dans les textes éditoriaux proviennent de la carte traiteur 2027 et du menu de fêtes 2026. Sur `/carte-traiteur` et `/menus-de-fetes`, ils viennent de la base. Dans les textes fixes, ne citer que les quelques prix repères indiqués ici (et les mettre à jour si la carte change).
- Les passages marqués **[À VALIDER]** dépendent d’une réponse du client (voir la section « Questions au client »). Tant qu’il n’y a pas de réponse, utiliser la version par défaut indiquée, qui ne promet rien de non sourcé.
- Typographie : espace insécable avant `:` `?` `!` `;` et dans `6 €`, `7h30–13h` (demi-cadratin pour les intervalles seulement). Apostrophe typographique (’) partout dans les textes affichés. Aucun tiret cadratin.

---

## 0. Ce que la recherche a montré

### 0.1 Résultats de recherche et concurrence (octobre 2026)

**« boucherie roanne », « boucher roanne »**
- La première page est occupée surtout par des **annuaires** (PagesJaunes, laptiteboucherie.fr, annuaire-roanne.com, bottin.fr, boucherie-charcuterie.tel, villepratique.fr, Gault&Millau « bouchers de la Loire ») et par quelques sites de boucheries : Maison Gouttenoire (rue de Charlieu, site boucherie-charcuterie-traiteur, histoire familiale datée), Maison Grisard (deux boutiques, « depuis un demi-siècle »), Boucherie Demont, Boucherie Seon-Vial (Halles Diderot), Boucherie Bourg (Saint-Haon-le-Vieux, livraison de colis).
- Le domaine exact **boucherie-roanne.fr** est une page commerciale d’un prestataire (ReflexPrinting) qui liste les boucheries de la ville et propose le domaine à la location : elle se positionne sur la requête sans être un commerce. Signe que la concurrence organique est faible et que des pages bien construites peuvent monter vite.
- Intention : **locale et transactionnelle** (adresse, horaires, téléphone, ce qu’on trouve en boutique, commandes). Pack local Google déterminant : la fiche Google Business Profile compte autant que le site.
- Maison Cherblanc apparaît seulement via des annuaires, avec des données incohérentes (horaires différents, nom commercial « Boucherie Viallon et Filles » au registre, téléphone parfois masqué). Pas de site en ligne (le domaine affiche une page par défaut).

**« traiteur roanne », « traiteur mariage roanne », « cocktail dînatoire roanne »**
- Agrégateurs très présents : mariages.net, mariagepresta.fr, 1001traiteurs.com, evenementielpourtous.com, starofservice.com, chef-domicile.fr, PagesJaunes.
- Sites concurrents : Maison Grange (« Traiteur à Roanne : Événements, Livraison, Plateaux repas », orientée entreprises et plateaux repas, FAQ courte, zones Feurs, Balbigny, Charlieu, Riorges, Mably, Le Coteau), Jean-Yves Demont (page « Traiteur à Roanne », pages par commune Riorges et Mably, articles guides), Maison Grisard (seul concurrent qui affiche des prix et des conditions de réservation), Arnaud Bulliot (chef à domicile, une page par mot clé), Pierre Mazuy, Les Tabliers Rouges (Clermont-Ferrand, article de mariage à Roanne).
- Intention : **comparaison puis devis**. Les internautes cherchent des exemples concrets (photos, menus), des prix indicatifs et la façon de commander.

**« traiteur noël roanne »**
- Peu de pages dédiées et souvent périmées (une page « menus fêtes » encore datée de 2020 chez un concurrent). Gault&Millau liste quelques traiteurs. Aucun concurrent repéré ne publie clairement **dates limites de commande, horaires des fêtes et prix au kilo des volailles**.

**Angles qui manquent chez les concurrents, et que Maison Cherblanc peut occuper**
1. **Prix publics** : plateaux par personne, formule du chef, pièces de cocktail à l’unité, volailles de fête au kilo. Quasi personne ne les affiche à Roanne. C’est l’argument le plus citable par les moteurs IA.
2. **Les deux métiers sous un même toit**, présentés à égalité et avec soin (les concurrents boucher-traiteur ont des sites datés).
3. **Calendrier de fêtes précis** (dates limites, horaires exceptionnels, jours de fermeture), mis à jour chaque année.
4. **Animations sur place** (jambon à la broche, côtes de bœuf au barbecue) illustrées par de vraies photos.
5. **Contenus utiles** : quantités par personne, composition d’un plateau, choix et cuisson des volailles. Un seul concurrent (Demont) fait des articles guides.

### 0.2 Faits vérifiés sur Maison Cherblanc

| Fait | Valeur | Source |
|---|---|---|
| Dénomination | MAISON CHERBLANC | Registre (API Recherche d’entreprises, BODACC) |
| Forme juridique | Société à responsabilité limitée (SARL) | BODACC, avis de création du 27/07/2023 |
| Capital social | 5 000 € | BODACC, avis de création du 27/07/2023 |
| SIREN / SIRET (siège) | 977 639 780 / 977 639 780 00013 | API Recherche d’entreprises |
| RCS | Roanne 977 639 780, immatriculée le 20 juillet 2023 | BODACC |
| TVA intracommunautaire | FR95977639780 | API Recherche d’entreprises |
| Code NAF | 10.11Z, transformation et conservation de la viande de boucherie | API Recherche d’entreprises |
| Activité déclarée | « Boucherie, charcuterie et traiteur, épicerie fine » | BODACC, avis du 01/09/2023 |
| Début d’activité | 9 août 2023 (achat du fonds de commerce du 55 rue Mulsant, acte du 09/08/2023) | BODACC, avis du 24/08/2023 |
| Gérants | Thibaut Cherblanc (orthographe du registre : « Thibaut Alphonse ») et Emilie Viallon | BODACC, API Recherche d’entreprises |
| Nom commercial au registre | « BOUCHERIE VIALLON ET FILLES » (pas encore « Maison Cherblanc ») | API Recherche d’entreprises |
| Prédécesseur | SARL Boucherie Viallon et Filles (SIREN 851 337 618), 55 rue Mulsant, créée le 1er juin 2019, radiée (fermeture au 3 janvier 2024). Article de 2020 : Sébastien Viallon et ses filles Charlène, Lucie et Emilie, même numéro de téléphone 04 77 71 16 11. | API Recherche d’entreprises, Le Bruit Qui Court (27/11/2020) |
| Adresse, téléphones, horaires, conditions traiteur | 55 rue Mulsant, 42300 Roanne · 04 77 71 16 11 · 06 22 22 49 68 · commande une semaine avant · option service à table · devis gratuit | Carte traiteur 2027 imprimée (seed-medias) |
| E-mail imprimé sur la carte 2027 | boucheriecherblanc@gmail.com (le contrat prévoit contact@maisoncherblanc.fr) | Carte traiteur 2027 |
| Instagram | @maisoncherblanc existe (profil « Maison Cherblanc », 1 publication, 0 abonné d’après les métadonnées publiques au 26/10/2026) : à confirmer comme compte officiel | instagram.com/maisoncherblanc |
| Facebook | Une page « Maison Cherblanc \| Roanne » existe à l’adresse facebook.com/profile.php?id=100094509101001 (lien utilisé par l’annuaire villepratique.fr). L’adresse facebook.com/maisoncherblanc n’a pas pu être vérifiée (mur de connexion). | facebook.com, villepratique.fr |
| Presse | Aucun article du Progrès trouvé sur Maison Cherblanc. Un article du magazine local Le Bruit Qui Court (2020) concerne le prédécesseur. | Recherches web |

**Le lien avec la « Boucherie Viallon » est donc établi** : Maison Cherblanc a racheté en août 2023 le fonds de la Boucherie Viallon et Filles, au même 55 rue Mulsant, et Emilie Viallon est cogérante de la nouvelle société. Les engagements publiés en 2020 par le prédécesseur (viande charolaise, volailles fermières, charcuterie sans colorant ni conservateur) **ne sont pas repris** dans les textes : rien ne prouve qu’ils valent toujours. Ils font l’objet de questions au client.

**À ne pas publier** : le prix d’achat du fonds (public au BODACC mais sans intérêt pour le client), les dates de naissance des dirigeants.

---

## 1. Stratégie SEO

### 1.1 Mots clés par URL (une intention par page, pas de cannibalisation)

| URL | Mot clé principal | Secondaires | Rôle |
|---|---|---|---|
| `/` | **Maison Cherblanc** + « boucherie et traiteur à Roanne » | boucherie charcuterie traiteur Roanne | Marque et porte d’entrée des deux métiers. Ne développe aucun des deux en profondeur : elle renvoie vers les pages piliers. |
| `/boucherie-roanne` | **boucherie roanne** | boucher Roanne, boucherie charcuterie Roanne, charcuterie Roanne, volailles fermières Roanne | Page pilier boucherie. Seule page dont le H1 commence par « Boucherie ». |
| `/traiteur-roanne` | **traiteur roanne** | traiteur Loire, traiteur Roannais, traiteur Riorges / Mably / Le Coteau (mentions naturelles), devis traiteur Roanne | Page pilier traiteur, hub vers les trois sous-pages et la carte. |
| `/traiteur-roanne/mariage` | **traiteur mariage roanne** | repas de mariage Loire, vin d’honneur Roanne, pièce montée | Sous-page. |
| `/traiteur-roanne/cocktail-dinatoire` | **cocktail dînatoire roanne** | buffet Roanne, apéritif dînatoire, plateaux apéritifs | Sous-page. |
| `/traiteur-roanne/broche-barbecue` | **jambon à la broche roanne** | barbecue traiteur Roanne, animation culinaire réception (cochon à la broche et fumoir seulement si confirmés) | Sous-page. |
| `/carte-traiteur` | **carte traiteur roanne** | plats cuisinés Roanne, plateau charcuterie Roanne, prix traiteur | Page transactionnelle (prix). |
| `/menus-de-fetes` | **traiteur noël roanne** | menu de fêtes Roanne, volaille de Noël Roanne, chapon Roanne | Page saisonnière, URL stable d’une année sur l’autre. |
| `/realisations` | (aucun mot clé dédié) | photos traiteur Roanne | Preuve visuelle, maillage vers les sous-pages. |
| `/la-maison` | Maison Cherblanc (marque) | boucherie rue Mulsant Roanne | Confiance (E-E-A-T) : qui, depuis quand, où. |
| `/actualites/*` | longue traîne | voir les articles | Questions concrètes, renvois vers les pages commerciales. |
| `/contact` | **devis traiteur roanne** | horaires boucherie Roanne, commande boucherie | Conversion. |

Règles anti-cannibalisation :
- « boucherie roanne » exact n’apparaît en `title` et en H1 que sur `/boucherie-roanne` ; « traiteur roanne » exact seulement sur `/traiteur-roanne`. L’accueil emploie la tournure « boucherie, charcuterie et traiteur à Roanne » (requête de marque et requête combinée).
- Les sous-pages traiteur portent leur prestation en tête de `title` (« Traiteur mariage à Roanne », « Cocktail dînatoire à Roanne »…), jamais « Traiteur à Roanne » seul.
- Les articles ne visent pas les têtes de requête : ils renvoient vers la page pilier avec une ancre explicite.

### 1.2 Maillage interne

| Page source | Lien vers | Ancre (texte exact) |
|---|---|---|
| `/` porte Boucherie | `/boucherie-roanne` | Découvrir la boucherie |
| `/` porte Traiteur | `/traiteur-roanne` | Découvrir le traiteur |
| `/` section savoir-faire | `/carte-traiteur` | Voir la carte et les prix |
| `/` section fêtes | `/menus-de-fetes` | Menus de fêtes et dates de commande |
| `/` section maison | `/la-maison` | L’histoire de la maison |
| `/boucherie-roanne` | `/traiteur-roanne` | notre service traiteur à Roanne |
| `/boucherie-roanne` | `/carte-traiteur` | plateau de charcuterie |
| `/boucherie-roanne` | `/menus-de-fetes` | volailles de fête sur commande |
| `/boucherie-roanne` | `/contact` | Commander à la boutique |
| `/traiteur-roanne` | `/traiteur-roanne/mariage` | Traiteur mariage |
| `/traiteur-roanne` | `/traiteur-roanne/cocktail-dinatoire` | Cocktail dînatoire et buffets |
| `/traiteur-roanne` | `/traiteur-roanne/broche-barbecue` | Jambon à la broche et barbecue |
| `/traiteur-roanne` | `/carte-traiteur` | Voir la carte traiteur et les prix |
| `/traiteur-roanne` | `/boucherie-roanne` | la boucherie de la rue Mulsant |
| `/traiteur-roanne` | `/contact` | Demander un devis gratuit |
| chaque sous-page traiteur | `/traiteur-roanne` | Toutes nos prestations traiteur |
| chaque sous-page traiteur | les deux autres sous-pages | ancres ci-dessus |
| chaque sous-page traiteur | `/realisations` (filtre de la catégorie) | Voir les photos de réceptions |
| `/carte-traiteur` | `/traiteur-roanne` et `/contact` | traiteur à Roanne · Demander un devis |
| `/menus-de-fetes` | `/boucherie-roanne` | la boucherie |
| `/realisations` | sous-pages traiteur selon la catégorie | ancres ci-dessus |
| articles | page pilier ou sous-page concernée + `/contact` | ancres données dans chaque article |
| pied de page (toutes pages) | `/boucherie-roanne`, `/traiteur-roanne`, `/carte-traiteur`, `/menus-de-fetes`, `/contact` | Boucherie à Roanne · Traiteur à Roanne · Carte traiteur · Menus de fêtes · Contact |

Fil d’Ariane visible et en JSON-LD (`BreadcrumbList`) sur toutes les pages sauf l’accueil : « Accueil › Traiteur à Roanne › Mariage ».

### 1.3 Zones géographiques

- **Roanne** est le cœur de toutes les pages (adresse, H1, title).
- **Roannais**, **Loire (42)** : une ou deux mentions par page pilier, dans des phrases utiles.
- **Riorges, Mably, Le Coteau, Villerest** : cités une fois sur `/boucherie-roanne` (proximité géographique de la boutique, fait objectif) et une fois sur `/traiteur-roanne` (lieux de réception), sans promesse de livraison ni de zone d’intervention tant que le client ne l’a pas précisée. Pas de liste de communes en pied de page, pas de pages par commune (contenu mince, risque de pages satellites).
- Si le client confirme une zone d’intervention traiteur (question n° 6), ajouter une phrase factuelle sur `/traiteur-roanne` et dans la FAQ, par exemple : « Nous nous déplaçons dans un rayon de X km autour de Roanne. »

### 1.4 Signaux hors site (à faire en parallèle, gains les plus rapides sur le pack local)

1. **Google Business Profile** : revendiquer ou créer la fiche « Maison Cherblanc », catégorie principale *Boucherie*, catégories secondaires *Traiteur*, *Charcuterie* (et *Épicerie fine* si pertinent). Horaires identiques au site, horaires exceptionnels des fêtes, lien vers `https://maisoncherblanc.fr/`, photos réelles, publications pour les fêtes. Demander des avis aux clients traiteur après chaque réception.
2. **Nom commercial au registre** : le registre affiche toujours « Boucherie Viallon et Filles ». Faire la modification au guichet unique (INPI) pour que les annuaires repris de la base Sirene affichent « Maison Cherblanc ».
3. **Cohérence NAP** (nom, adresse, téléphone) : corriger les horaires sur PagesJaunes, villepratique.fr, laptiteboucherie.fr, annuaire-roanne.com, bottin.fr, boucherie-charcuterie.tel (plusieurs affichent des horaires erronés, notamment le jeudi après-midi).
4. **Facebook** : réserver l’adresse courte facebook.com/maisoncherblanc pour la page existante, mettre le lien du site.
5. **Annuaires traiteur** (mariages.net, 1001traiteurs) : une fiche gratuite avec lien vers `/traiteur-roanne/mariage` ou `/traiteur-roanne`, selon l’envie du client.

### 1.5 Moteurs IA et données structurées

- Chaque page pilier contient des **passages autonomes** qui répondent seuls à une question : où, quand, combien, comment commander. Ils sont rédigés pour être cités tels quels (adresse complète, horaires complets, délai d’une semaine, prix au kilo ou par personne).
- JSON-LD (via `lib/seo.ts`) : `LocalBusiness` avec `@type: ["Store", "FoodEstablishment"]`, `name`, `address`, `geo`, `telephone`, `openingHoursSpecification`, `specialOpeningHoursSpecification` (fêtes), `sameAs` (réseaux validés), `hasMenu` vers `/carte-traiteur`. `FAQPage` sur les deux pages piliers (Google n’affiche plus ces résultats enrichis pour les commerces, mais le balisage aide la compréhension par les moteurs). `Article` sur les actualités. **Pas d’`aggregateRating`** (contrat).
- `robots.txt` : ne pas bloquer GPTBot, ClaudeBot, PerplexityBot, Google-Extended sur les pages publiques (décision à confirmer par l’agence).

---

## 2. Accueil `/`

**title:** Boucherie, charcuterie, traiteur à Roanne | Maison Cherblanc (60 car.)

**meta:** Maison Cherblanc, 55 rue Mulsant à Roanne : boucherie, charcuterie et traiteur. Viandes, volailles, plateaux, buffets et mariages. Devis gratuit. (145 car.)

**H1:** Boucherie, charcuterie et traiteur à Roanne

> Mise en page : le H1 surplombe le diptyque, en Fraunces, « Boucherie » et « traiteur » en italique d’accent. Sur mobile, il passe au-dessus des deux portes empilées.

### Section : hero (diptyque, deux portes égales)

**surtitre:** Maison Cherblanc · 55 rue Mulsant, Roanne

**H1:** Boucherie, charcuterie et traiteur à Roanne

**porte 1 (gauche)**
- **titre de porte (H2):** *La Boucherie*
- **texte:** Viandes, volailles et charcuterie, servies et conseillées au comptoir. Ouvert six jours sur sept, dimanche matin compris.
- **bouton:** Découvrir la boucherie (`/boucherie-roanne`)
- **emplacement:** `accueil-hero-boucherie`

**porte 2 (droite)**
- **titre de porte (H2):** *Le Traiteur*
- **texte:** Plateaux, buffets, cocktails dînatoires et repas de mariage, préparés par la maison. Service à table en option.
- **bouton:** Découvrir le traiteur (`/traiteur-roanne`)
- **emplacement:** `accueil-hero-traiteur`

### Section : introduction (premier paragraphe de la page)

**chapô:**
Maison Cherblanc est une boucherie, charcuterie et traiteur installée au 55 rue Mulsant, à Roanne. Au comptoir, vous trouvez viandes, volailles et charcuterie pour la semaine. En coulisses, la même équipe prépare plateaux, plats cuisinés, buffets et cocktails pour vos réceptions dans le Roannais. Deux métiers, une seule adresse, et une règle commune : bien choisir, bien préparer, bien servir.

### Section : deux métiers (blocs miroirs)

**surtitre:** Deux métiers, une maison

**H2:** Au comptoir comme à votre table

**bloc boucherie**
**H3:** La boucherie de la rue Mulsant
Bœuf, veau, porc et volailles, découpés à la demande. Un rôti ficelé pour le dimanche, des côtes à griller, une volaille entière : dites-nous combien vous serez, nous vous conseillons la pièce, le poids et la cuisson.
**lien:** Voir la boucherie (`/boucherie-roanne`)

**bloc traiteur**
**H3:** Le traiteur des grandes et des petites tablées
Un plateau de charcuterie pour dix, une formule du chef pour cinquante, un cocktail dînatoire ou un repas de mariage : vous choisissez à la carte ou sur devis, vous récupérez en boutique, ou nous assurons le service à table.
**lien:** Voir le traiteur (`/traiteur-roanne`)

### Section : repères (bandeau de 4 chiffres et faits, fond sable)

1. **Une semaine** · Le délai conseillé pour commander le traiteur.
2. **6 € par pers.** · Le plateau de charcuterie (carte 2027).
3. **Service à table** · En option pour vos réceptions.
4. **Devis gratuit** · Pour toute demande sur mesure.

> Les prix viennent de la carte en base : si le prix du plateau change dans le backoffice, ce bandeau doit suivre (injection depuis `menu_plats`).

### Section : savoir-faire traiteur (fond lin)

**surtitre:** Le traiteur

**H2:** Une carte claire, des prix affichés

Plateau de charcuterie, de fromages ou de légumes croquants à la personne. Formule du chef avec entrée froide, plat, accompagnement et fromage ou dessert. Plats cuisinés à la part, quiches et pizzas à la plaque, petit dînatoire à la pièce. Toute la carte traiteur est en ligne avec ses prix, pour composer votre réception tranquillement, puis nous appeler pour la confirmer.

**bouton:** Voir la carte et les prix (`/carte-traiteur`)

**emplacement:** `accueil-savoir-faire`

### Section : prestations (3 cartes visuelles)

**surtitre:** Vos réceptions

**H2:** Ce que nous préparons pour vous

**carte 1 · Mariages**
Vin d’honneur, buffet, repas assis et desserts : pièce montée, entremets, macarons.
*lien:* Traiteur mariage (`/traiteur-roanne/mariage`)

**carte 2 · Cocktails et buffets**
Mini burgers, wraps, navettes, verrines, plateaux de charcuterie et de fromages, à la pièce ou à la personne.
*lien:* Cocktail dînatoire et buffets (`/traiteur-roanne/cocktail-dinatoire`)

**carte 3 · Broche et barbecue**
Jambons cuits à la broche et côtes de bœuf grillées sur place, devant vos invités.
*lien:* Jambon à la broche et barbecue (`/traiteur-roanne/broche-barbecue`)

### Section : fêtes (fond olive, arche)

**surtitre:** Fêtes de fin d’année

**H2:** Noël et le jour de l’An se commandent en avance

Volailles fermières, foies gras, boudins blancs, plats cuisinés et menus de fêtes : la carte des fêtes est en ligne, avec les dates limites de commande et les horaires d’ouverture exceptionnels. Pour les volailles, la commande est obligatoire.

**bouton:** Menus de fêtes et dates de commande (`/menus-de-fetes`)

> Hors saison (aucun menu `saison` publié), remplacer cette section par :
> **surtitre:** Au fil de l’année · **H2:** Les menus de saison arrivent ici · **texte:** Fêtes de fin d’année, Pâques, beaux jours : nos menus de saison sont publiés quelques semaines avant chaque période, avec leurs dates de commande. · **bouton:** Voir la carte traiteur (`/carte-traiteur`)

### Section : la maison (fond crème)

**surtitre:** La maison

**H2:** Une boutique de quartier, rue Mulsant

Depuis l’été 2023, la boucherie du 55 rue Mulsant s’appelle Maison Cherblanc. Le comptoir est resté un comptoir de quartier : on y vient chercher sa viande de la semaine, on y demande un conseil de cuisson, on y passe commande pour le week-end. Derrière, la même équipe prépare le traiteur, du plateau pour un anniversaire au buffet d’une salle des fêtes.

**bouton:** L’histoire de la maison (`/la-maison`)

**emplacement:** `accueil-maison`

### Section : réalisations (mosaïque de 6 photos)

**surtitre:** En images

**H2:** Quelques réceptions récentes

**bouton:** Voir toutes les réalisations (`/realisations`)

### Section : avis (si au moins un avis visible en base, sinon masquer)

**surtitre:** Ils nous ont confié leur table

**H2:** Ce qu’en disent nos clients

> Avis saisis à la main dans le backoffice. Aucun avis fictif, aucune note moyenne affichée.

### Section : infos pratiques

**surtitre:** Infos pratiques

**H2:** Nous trouver à Roanne

**Adresse**
Maison Cherblanc
55 rue Mulsant
42300 Roanne

**Téléphone** · 04 77 71 16 11 (boutique) · 06 22 22 49 68 (mobile)

**Horaires**
Lundi : fermé
Mardi : 7h30–13h et 15h–19h
Mercredi : 7h30–13h
Jeudi : 7h30–13h
Vendredi : 7h30–13h et 15h–19h
Samedi : 7h30–18h (journée continue)
Dimanche : 8h–12h

**boutons:**
- Itinéraire (lien externe Google Maps, nouvel onglet)
- Nous contacter (`/contact`)

### Section : CTA final (fond olive profond)

**H2:** Une réception en vue ?

Dites-nous la date, le nombre de personnes et ce qui vous ferait plaisir. Nous vous répondons avec une proposition et un devis gratuit. Pour le traiteur, pensez à commander au moins une semaine avant.

**bouton 1:** Demander un devis (`/contact?type=devis-traiteur`)
**bouton 2:** Appeler la boutique (`tel:+33477711611`)

### Alt d’images suggérés (accueil)

- `accueil-hero-boucherie` [photo boutique ou vitrine à produire ; provisoire : `jambon-fume-artisanal-boucherie-cherblanc-roanne.jpg`] : `Jambons cuits à la broche, dorés, dans la rôtissoire de Maison Cherblanc, boucherie à Roanne`
- `accueil-hero-traiteur` [`buffet-cocktail-traiteur-roanne-maison-cherblanc.jpg`] : `Pièces de cocktail en brochettes alignées par une serveuse de Maison Cherblanc, traiteur à Roanne`
- `accueil-savoir-faire` [`plateau-charcuterie-fromages-traiteur-maison-cherblanc-roanne.jpg`] : `Plateau de charcuterie et de fromages : jambon cru, rosette, chorizo, terrine et fromages en dés`
- `accueil-maison` [`equipe-traiteur-maison-cherblanc-roanne-service-evenement.jpg`] : `Deux membres de l’équipe Maison Cherblanc portent des planches de roulés et de feuilletés avant le service`
- `og-defaut` [`plateau-charcuterie-fromages-traiteur-maison-cherblanc-roanne.jpg` recadrée 1200×630 avec logo] : `Maison Cherblanc, boucherie, charcuterie et traiteur à Roanne`

---

## 3. La boucherie `/boucherie-roanne`

**title:** Boucherie à Roanne, rue Mulsant | Maison Cherblanc (50 car.)

**meta:** Boucherie-charcuterie à Roanne, 55 rue Mulsant : bœuf, veau, porc, volailles et charcuterie. Ouvert du mardi au dimanche matin. Conseils au comptoir. (149 car.)

**H1:** Boucherie à Roanne, rue Mulsant

### Section : hero

**surtitre:** La Boucherie · Charcuterie

**H1:** Boucherie à Roanne, rue Mulsant

**chapô (premier paragraphe de la page):**
Maison Cherblanc est une boucherie à Roanne, au 55 rue Mulsant. Bœuf, veau, porc, volailles et charcuterie y sont servis à la coupe, au poids que vous demandez, avec un conseil de cuisson si vous le souhaitez. La boutique est ouverte du mardi au dimanche matin.

**bouton 1:** Horaires et accès (`#horaires`)
**bouton 2:** Commander à la boutique (`/contact?type=commande-boucherie`)

**emplacement:** `boucherie-hero`

### Section : le comptoir

**surtitre:** Au comptoir

**H2:** Votre boucherie à Roanne : ce que vous trouvez en boutique

Une boucherie de quartier se juge à son comptoir : des morceaux bien parés, une découpe faite devant vous, et quelqu’un pour vous dire quelle pièce choisir. C’est ce que nous voulons pour la rue Mulsant. Vous venez avec un plat en tête, ou simplement un nombre de convives, et nous trouvons ensemble le bon morceau.

#### H3 : Le bœuf, le veau, le porc

Pièces à rôtir, à griller, à mijoter : côtes et entrecôtes pour le barbecue, rôtis ficelés, morceaux à bourguignon ou à blanquette, escalopes, côtes de porc, viande hachée à la demande. Nous préparons aussi les pièces sur commande, pour un repas de famille ou une grande tablée : un rôti de la taille voulue, une découpe particulière, une quantité inhabituelle.

> [À VALIDER] Si le client confirme une race, une région d’origine ou des éleveurs partenaires (question n° 2), ajouter ici une phrase factuelle, par exemple : « Notre bœuf est de race … , élevé à … ». En attendant, ne rien affirmer sur la provenance.

**emplacement:** `boucherie-viandes`

#### H3 : La charcuterie

Jambon blanc, jambon cru, rosette, chorizo, terrine : la charcuterie se prend à la tranche pour la semaine, ou en plateau pour recevoir. Pour les fêtes, la vitrine s’enrichit de galantines de chapon aux pistaches et de pintade forestière, de terrine de sanglier, de boudins blancs (au porto, au foie gras, aux morilles) et de foie gras de canard à la coupe.

Vous recevez ? Le plateau de charcuterie est composé pour vous, à la personne, sur la [carte traiteur](/carte-traiteur) (6 € par personne sur la carte 2027).

> [À VALIDER] Préciser ce qui est fabriqué par la maison (question n° 3). Si le client confirme, remplacer la première phrase par : « Terrines, jambons, … : une partie de notre charcuterie est fabriquée ici, … ».

**emplacement:** `boucherie-charcuterie`

#### H3 : Les volailles

Toute l’année, demandez au comptoir les volailles du moment, entières ou découpées selon votre recette. Pour Noël et le jour de l’An, nous proposons dinde fermière, poularde fermière, chapon fermier, poulet de Bresse, pintade fermière, canard ou canette, et caille. Ces [volailles de fête se commandent obligatoirement à l’avance](/menus-de-fetes) : pour 2026, avant le 20 décembre.

**emplacement:** `boucherie-volailles`

#### H3 : La broche

Les jambons que nous servons en réception cuisent lentement à la broche, en rôtissoire, jusqu’à ce que la couenne dore et que la chair reste moelleuse. C’est la même rôtissoire que nous installons chez vous pour une fête : voir la page [jambon à la broche et barbecue](/traiteur-roanne/broche-barbecue).

> [À VALIDER] Version B, si le client confirme un fumoir et une production fumée maison (question n° 4) : **H3 : Le fumoir** · « Jambon, lard, saucisses : certaines de nos charcuteries passent par le fumoir de la maison. Le bois, la durée et la température font le goût : demandez-nous ce qui sort du fumoir cette semaine. » Remplacer alors la clé `boucherie-fumoir` par une vraie photo de fumoir.

**emplacement:** `boucherie-fumoir`

#### H3 : Et pour accompagner

Quelques fromages et produits d’épicerie fine complètent la vitrine, pour finir un repas ou composer un plateau.

> [À VALIDER] Paragraphe à conserver seulement si la boutique vend bien des fromages et de l’épicerie fine au détail (question n° 5). L’activité déclarée au registre inclut l’épicerie fine, et deux photos montrent des fromages, mais la vente au comptoir n’est pas confirmée.

### Section : conseils du boucher (fond lin)

**surtitre:** Conseils

**H2:** Les conseils du boucher

**Combien prévoir par personne ?**
Comptez environ 150 à 200 g de viande sans os par adulte pour un rôti ou une pièce à griller, et un peu plus pour une viande à mijoter qui réduit à la cuisson. Pour une côte avec os, prévoyez 300 à 400 g par personne. Dites-nous le nombre de convives : nous ajustons la pièce.

**Avant la cuisson**
Sortez la viande du réfrigérateur 30 minutes à une heure avant de la cuire, selon la taille de la pièce. Une viande à température ambiante cuit plus régulièrement.

**Après la cuisson**
Laissez reposer un rôti ou une côte quelques minutes sous une feuille de papier aluminium avant de trancher. Les jus se répartissent, la viande reste tendre.

**Le bon morceau pour le bon plat**
Bourguignon, blanquette, pot-au-feu : les morceaux à mijoter supportent une cuisson longue. Côte, entrecôte, filet : une cuisson courte et vive. Au comptoir, nous vous orientons selon la recette, le temps dont vous disposez et votre budget.

> Ces repères sont des usages de cuisine courants, sans prétention de chiffre exact pour toutes les pièces.

### Section : boucherie et traiteur (bloc en miroir)

**surtitre:** La même maison

**H2:** De la boucherie au traiteur

Les plats cuisinés, les rôtis froids et les plateaux de notre service traiteur partent de la même boutique et des mêmes viandes. Rôti de bœuf, de porc ou de veau en tranches pour un buffet, blanquette ou bœuf bourguignon à la part pour un repas en famille : tout est sur la carte, avec les prix.

**bouton 1:** Découvrir notre service traiteur à Roanne (`/traiteur-roanne`)
**bouton 2:** Voir la carte traiteur (`/carte-traiteur`)

### Section : horaires et accès (ancre `#horaires`, arche)

**surtitre:** Horaires

**H2:** Horaires de la boucherie et accès

La boucherie Maison Cherblanc se trouve au 55 rue Mulsant, 42300 Roanne. Elle est ouverte le mardi et le vendredi de 7h30 à 13h et de 15h à 19h, le mercredi et le jeudi de 7h30 à 13h, le samedi de 7h30 à 18h sans interruption et le dimanche de 8h à 12h. Elle est fermée le lundi. Téléphone : 04 77 71 16 11.

La rue Mulsant est à quelques minutes en voiture de Riorges, Mably, Le Coteau et Villerest.

> Le tableau des horaires et les fermetures exceptionnelles viennent des réglages (`horaires`, `horaires_exceptionnels`). Le paragraphe ci-dessus doit être généré depuis ces réglages pour rester juste.

> [À VALIDER] Ajouter une phrase sur le stationnement (question n° 9) si le client la fournit.

**boutons:**
- Itinéraire (lien externe Google Maps, nouvel onglet)
- Appeler la boutique (`tel:+33477711611`)

### Section : FAQ

**H2:** Questions fréquentes sur la boucherie

**Quels sont les horaires de la boucherie Maison Cherblanc à Roanne ?**
Mardi et vendredi : 7h30–13h et 15h–19h. Mercredi et jeudi : 7h30–13h. Samedi : 7h30–18h en continu. Dimanche : 8h–12h. Fermé le lundi. Les horaires changent pendant les fêtes de fin d’année : ils sont publiés sur la page des menus de fêtes.

**Êtes-vous ouverts le dimanche ?**
Oui, le dimanche matin de 8h à 12h.

**Peut-on commander sa viande à l’avance ?**
Oui. Appelez la boutique au 04 77 71 16 11, passez au comptoir, ou écrivez-nous depuis la page contact en précisant les pièces, les quantités et le jour de retrait. C’est conseillé pour une grosse pièce, une découpe particulière ou une grande quantité.

**Faut-il commander les volailles de Noël ?**
Oui. Les volailles de fête (dinde, poularde, chapon, poulet de Bresse, pintade, canard ou canette, caille) sont vendues uniquement sur commande. Pour Noël 2026, la date limite est le dimanche 20 décembre.

**D’où vient votre viande ?**
L’origine des viandes est indiquée en boutique. Demandez-nous, nous vous dirons d’où vient chaque pièce.

> [À VALIDER] Réponse à enrichir dès que le client précise races, régions et éleveurs (question n° 2).

**Faites-vous aussi traiteur ?**
Oui. Maison Cherblanc est aussi traiteur : plateaux, plats cuisinés, cocktails, buffets et repas de mariage, avec une option service à table. La carte et les prix sont en ligne sur la page carte traiteur.

**Livrez-vous à domicile ?**
Les commandes de la boucherie se retirent en boutique.

> [À VALIDER] Réponse par défaut, à remplacer si le client livre (question n° 7) : « Oui, nous livrons à … , à partir de … , du … au … ».

### Section : CTA final

**H2:** Une commande pour ce week-end ?

Appelez la boutique ou écrivez-nous : nous préparons votre commande pour l’heure qui vous arrange.

**bouton 1:** Commander à la boutique (`/contact?type=commande-boucherie`)
**bouton 2:** 04 77 71 16 11 (`tel:+33477711611`)

### Alt d’images suggérés (boucherie)

- `boucherie-hero` [photo de la boutique ou du comptoir à produire ; provisoire : visuel IA] : `Comptoir de la boucherie Maison Cherblanc, 55 rue Mulsant à Roanne`
- `boucherie-viandes` [photo à produire ; provisoire : visuel IA] : `Pièces de bœuf et rôtis ficelés en vitrine de la boucherie Maison Cherblanc à Roanne`
- `boucherie-charcuterie` [`aperitif-charcuterie-artisanale-traiteur-maison-cherblanc-roanne.jpg`] : `Charcuterie tranchée en plateau : jambon cru, rosette et saucisson sec, préparée par Maison Cherblanc`
- `boucherie-fumoir` [`fumage-artisanal-viande-boucherie-maison-cherblanc-roanne.jpg`] : `Jambon en cuisson à la broche dans la rôtissoire de Maison Cherblanc`
- `boucherie-volailles` [photo à produire ; provisoire : visuel IA] : `Volailles fermières entières prêtes à cuire, boucherie Maison Cherblanc à Roanne`
- photo fromage (si le paragraphe épicerie fine est conservé) [`fromage-artisanal-aux-noix-boucherie-cherblanc-roanne.jpg`] : `Fromage à pâte molle fourré aux noix, entamé, sur un plateau noir`

---

## 4. Le traiteur `/traiteur-roanne`

**title:** Traiteur à Roanne : buffets, cocktails, mariages | Cherblanc (60 car.)

**meta:** Traiteur à Roanne : plateaux, plats cuisinés, cocktails dînatoires, buffets et mariages. Carte et prix en ligne, service à table en option, devis gratuit. (154 car.)

**H1:** Traiteur à Roanne

### Section : hero

**surtitre:** Le Traiteur · Maison Cherblanc

**H1:** Traiteur à Roanne

**chapô (premier paragraphe de la page):**
Maison Cherblanc est traiteur à Roanne, au 55 rue Mulsant. Plateaux à la personne, plats cuisinés à la part, petit dînatoire à la pièce, buffets et repas de mariage : vous composez à partir de notre carte, ou nous construisons ensemble une proposition sur mesure. Commande une semaine avant, devis gratuit, service à table en option.

**bouton 1:** Demander un devis gratuit (`/contact?type=devis-traiteur`)
**bouton 2:** Voir la carte traiteur et les prix (`/carte-traiteur`)

**emplacement:** `traiteur-hero`

### Section : prestations (4 cartes, 3 avec page dédiée)

**surtitre:** Nos prestations

**H2:** Votre traiteur à Roanne, de la carte au sur-mesure

**Traiteur mariage**
Vin d’honneur, buffet ou repas, fromages et desserts jusqu’à la pièce montée. Nous préparons la réception avec vous, du premier rendez-vous au jour J.
*lien:* Traiteur mariage (`/traiteur-roanne/mariage`)
*emplacement:* `traiteur-mariage`

**Cocktail dînatoire et buffets**
Mini burgers, wraps, navettes, verrines, toasts de saison, plateaux de charcuterie et de fromages. Pour un apéritif, un anniversaire ou une soirée entière debout.
*lien:* Cocktail dînatoire et buffets (`/traiteur-roanne/cocktail-dinatoire`)
*emplacement:* `traiteur-cocktail`

**Jambon à la broche et barbecue**
Une rôtissoire installée sur place, des jambons qui dorent lentement, des côtes de bœuf grillées devant vos invités.
*lien:* Jambon à la broche et barbecue (`/traiteur-roanne/broche-barbecue`)
*emplacement:* `traiteur-broche`

**Plats cuisinés et plateaux**
Blanquette de veau, bœuf bourguignon, gratin dauphinois, quiches à la plaque, rôtis froids : de quoi recevoir sans passer la journée en cuisine.
*lien:* Voir la carte traiteur et les prix (`/carte-traiteur`)
*emplacement:* `traiteur-plats`

### Section : comment ça marche (4 étapes numérotées)

**surtitre:** Comment ça marche

**H2:** Commander un traiteur à Roanne, en quatre étapes

**1. Vous nous parlez de votre réception**
La date, le lieu, le nombre de personnes, le moment de la journée, et vos envies. Par téléphone, au comptoir ou avec le formulaire de contact.

**2. Nous vous proposons une formule**
À partir de la carte ou sur mesure. Le devis est gratuit.

**3. Vous confirmez au moins une semaine avant**
Une semaine, c’est le délai qui nous permet de commander, préparer et cuisiner correctement. Pour un mariage ou une grande réception, prenez contact bien plus tôt, dès que la date est fixée.

**4. Vous récupérez, ou nous servons**
Vous passez prendre votre commande à la boutique, rue Mulsant. Ou vous choisissez l’option service à table : l’équipe assure le service le jour de votre réception.

> [À VALIDER] Étape 4 : ajouter « ou nous livrons » seulement si la livraison est confirmée (question n° 7).

### Section : repères de prix (fond lin, lignes à points de conduite comme la carte imprimée)

**surtitre:** Repères de prix · Carte 2027

**H2:** Combien coûte un traiteur à Roanne chez Maison Cherblanc ?

Nos prix sont publics et valables toute l’année civile. Quelques repères tirés de la carte traiteur 2027 :

- Plateau de charcuterie ........ 6 € par personne
- Plateau de fromages ........ 4,90 € par personne
- Plateau de légumes crus, sauce au choix ........ 4 € par personne
- La formule du chef (entrée froide, plat et accompagnements, fromage ou dessert) ........ 14 € par personne
- Plats chauds à la part ........ de 4 € à 12,50 €
- Petit dînatoire, la plupart des pièces ........ de 1 € à 2,50 € la pièce
- Quiche ou pizza, plaque d’environ 50 parts ........ de 25 € à 30 €

Le prix final dépend de votre composition et des options (service à table notamment) : il est précisé dans le devis.

**bouton:** Voir toute la carte (`/carte-traiteur`)

> Ces repères sont à générer depuis la base (`menu_plats` du menu `carte-traiteur`) pour rester justes. Jusqu’au 31 décembre 2026, la carte 2026 a les mêmes plats : vérifier avec le client que ses prix sont identiques (question n° 12) avant d’afficher « Carte 2027 » en surtitre.

### Section : service à table (bloc image + texte)

**surtitre:** Le jour J

**H2:** Service à table : vous recevez, nous servons

Avec l’option service à table, vous n’êtes plus l’hôte qui fait des allers-retours en cuisine. L’équipe Maison Cherblanc dresse les plats, sert vos invités et veille au rythme du repas. Vous profitez de votre réception.

Le service s’ajoute à n’importe quelle formule et se chiffre dans le devis, selon le nombre de convives et la durée.

> [À VALIDER] Questions n° 8 et n° 10 : vaisselle, nappage, matériel, rangement. Ne rien ajouter tant que le client n’a pas précisé ce qui est inclus.

### Section : pour quelles occasions

**surtitre:** Pour quelles occasions

**H2:** Des repas de famille aux grandes réceptions

Repas de famille, anniversaires, communions et baptêmes, mariages, fêtes d’associations, pots de départ ou repas d’équipe : une réception n’a pas besoin d’être grande pour mériter un traiteur. Un plateau de charcuterie et un plateau de fromages pour dix personnes se commandent aussi simplement qu’un buffet pour une salle des fêtes.

Nous préparons vos réceptions à Roanne et dans le Roannais, que vous receviez chez vous, dans une salle municipale ou dans un domaine, de Riorges à Mably, du Coteau à Villerest.

> [À VALIDER] Si le client donne une zone d’intervention précise (question n° 6), ajouter : « Nous nous déplaçons jusqu’à … km autour de Roanne. »

### Section : la boucherie derrière le traiteur

**surtitre:** Boucher et traiteur

**H2:** Un traiteur qui est aussi boucher

Nos rôtis froids, nos plats mijotés et nos plateaux sortent de la même maison que la viande vendue au comptoir. C’est l’avantage d’un traiteur qui est aussi boucher : nous savons d’où partent les produits et comment ils ont été préparés, du morceau choisi à l’assiette servie.

**lien:** Découvrir la boucherie de la rue Mulsant (`/boucherie-roanne`)

### Section : FAQ

**H2:** Questions fréquentes sur le traiteur

**Combien de temps à l’avance faut-il commander ?**
Une semaine avant la date, au minimum. Pour un mariage, une grande réception ou une date de fin d’année, contactez-nous dès que la date est fixée. Pour les fêtes, les dates limites sont publiées sur la page menus de fêtes : pour 2026, le dimanche 20 décembre pour Noël et le jeudi 24 décembre pour le jour de l’An.

**Proposez-vous le service à table ?**
Oui. L’option service à table est disponible pour vos réceptions. Elle est chiffrée dans le devis, selon le nombre d’invités et la durée du service.

**Le devis est-il gratuit ?**
Oui, le devis est gratuit. Écrivez-nous depuis la page contact ou appelez le 04 77 71 16 11 ou le 06 22 22 49 68.

**Combien coûte un plateau par personne ?**
Sur la carte 2027 : 6 € par personne pour le plateau de charcuterie (jambon blanc, jambon cru, rosette, terrine, chorizo), 4,90 € pour le plateau de fromages (brie de Meaux, camembert, chèvre, comté), 4 € pour le plateau de légumes crus avec sa sauce. La formule du chef est à 14 € par personne.

**Livrez-vous ?**
Les commandes se retirent à la boutique, 55 rue Mulsant à Roanne. Pour une réception avec service à table, l’équipe vient sur le lieu de l’événement.

> [À VALIDER] Réponse par défaut. À remplacer si la livraison est confirmée (question n° 7), avec zone et conditions.

**Avez-vous des options végétariennes ?**
Oui : le petit dînatoire compte un toast de saison vegan, le plateau de légumes crus et le plateau de fromages conviennent aux végétariens. Pour d’autres régimes, dites-le-nous à la demande de devis.

> [À VALIDER] Allergènes (question n° 11) : la réglementation impose d’informer sur les 14 allergènes majeurs. Ajouter la phrase que le client choisira, par exemple « La liste des allergènes de chaque plat est disponible sur simple demande. »

**Faites-vous les commandes de fêtes ?**
Oui. Chaque année, nous publions un menu de fêtes avec entrées, plats cuisinés, accompagnements, volailles sur commande et petit dînatoire de Noël, ainsi que les horaires d’ouverture exceptionnels.

### Section : CTA final (fond olive profond)

**H2:** Parlons de votre réception

Une date, un lieu, un nombre de personnes : c’est tout ce qu’il nous faut pour commencer. Le devis est gratuit.

**bouton 1:** Demander un devis gratuit (`/contact?type=devis-traiteur`)
**bouton 2:** Appeler le 06 22 22 49 68 (`tel:+33622224968`)

### Alt d’images suggérés (traiteur)

- `traiteur-hero` [`buffet-cocktail-exterieur-reception-traiteur-roanne-loire.jpg`] : `Buffet traiteur Maison Cherblanc dressé en extérieur pour une réception près de Roanne`
- `traiteur-mariage` [`table-maries-decoration-mariage-traiteur-maison-cherblanc-roanne.jpg`] : `Table d’honneur dressée pour un repas de mariage par Maison Cherblanc, traiteur à Roanne`
- `traiteur-cocktail` [`plateau-aperitif-mini-burgers-verrines-traiteur-roanne.jpg`] : `Planches de cocktail : mini burgers, verrines et brochettes préparés par Maison Cherblanc`
- `traiteur-broche` [`chef-traiteur-fumoir-mobile-maison-cherblanc-roanne.jpg`] : `Cuisinier de Maison Cherblanc surveillant des jambons à la broche dans une rôtissoire mobile, en extérieur`
- `traiteur-plats` [`preparation-buffet-traiteur-maison-cherblanc-roanne.jpg`] : `Préparation d’un buffet en cuisine : verrines, feuilletés et plateaux alignés sur le plan de travail`

---

## 5. Traiteur mariage `/traiteur-roanne/mariage`

**title:** Traiteur mariage à Roanne | Maison Cherblanc (44 car.)

**meta:** Traiteur mariage à Roanne et dans le Roannais : vin d’honneur, buffet ou repas servi, fromages, pièce montée et macarons. Service à table, devis gratuit. (153 car.)

**H1:** Traiteur mariage à Roanne

**fil d’Ariane:** Accueil › Traiteur à Roanne › Mariage

### Section : hero

**surtitre:** Mariages · Le Traiteur

**H1:** Traiteur mariage à Roanne

**chapô (premier paragraphe de la page):**
Votre mariage se prépare des mois à l’avance, le repas aussi. Maison Cherblanc, traiteur mariage à Roanne, prépare le vin d’honneur, le buffet ou le repas servi à table, les plateaux de fromages et les desserts, jusqu’à la pièce montée. Vous nous dites comment vous imaginez la journée, nous construisons le menu et le devis avec vous.

**bouton:** Parler de votre mariage (`/contact?type=devis-traiteur`)

**emplacement:** `mariage-hero`

### Section : le déroulé gourmand

**surtitre:** De l’apéritif au dessert

**H2:** Un traiteur pour chaque moment du mariage

#### H3 : Le vin d’honneur

C’est souvent le premier moment où tous vos invités se retrouvent. Nous le composons en pièces à grignoter debout, faciles à prendre en main : mini burgers, navettes, wraps, verrines et toasts de saison, mini brochettes de fromage. Ajoutez un plateau de charcuterie tranchée, et le vin d’honneur devient un vrai moment de table, même sans table.

#### H3 : Le repas, en buffet ou servi

Buffet froid, buffet chaud, repas assis : le format dépend de votre salle, du nombre d’invités et du rythme que vous voulez donner à la soirée. Entrées froides et chaudes, plats mijotés, rôtis, accompagnements, tout part de notre carte, et le menu s’ajuste à vos goûts. Avec l’option service à table, l’équipe sert vos invités et s’occupe du rythme du repas.

#### H3 : Le plateau de fromages

Brie, camembert, saint-marcellin, bleu, comté : dressés en grands plateaux avec des fruits frais et des noix, les fromages font le lien entre le plat et le dessert. Ils trouvent aussi leur place sur un buffet de fin de soirée.

#### H3 : Les desserts

Pièce montée en choux, avec une plaque aux prénoms des mariés. Entremets à partager, à partir de 20 parts. Tour de macarons, mini gâteaux de soirée, café gourmand. Le dessert est souvent la photo que vos invités gardent : nous le préparons avec soin.

### Section : repères de prix (lignes à points de conduite)

**surtitre:** Repères de prix · Carte 2027

**H2:** Combien coûte un traiteur mariage à Roanne ?

Chaque mariage a son devis, mais quelques prix de la carte 2027 donnent une idée :

- Pièce montée (3 choux) ........ 3,90 € par personne
- Entremets (20 parts minimum) ........ 4,10 € la part
- Macaron ........ 1,30 € pièce
- Mini gâteau de soirée ........ 1,30 € pièce
- Café gourmand ........ 6,90 € par personne
- Plateau de fromages ........ 4,90 € par personne
- Pièces du petit dînatoire ........ la plupart de 1 € à 2,50 €

Le service à table et les prestations particulières sont chiffrés dans le devis, qui est gratuit.

### Section : comment nous travaillons

**surtitre:** Pas à pas

**H2:** Préparer votre mariage avec nous

**Le premier échange.** Date, lieu, nombre d’invités, déroulé de la journée, envies et contraintes (enfants, régimes particuliers). Un appel ou un message suffit pour commencer.

**La proposition.** Nous vous envoyons un menu et un devis gratuit. Vous ajustez, nous affinons.

**La confirmation.** Comme toute commande traiteur, la commande définitive (nombre d’invités, menu) se confirme au plus tard une semaine avant la date. Pour un mariage, réservez votre date avec nous dès qu’elle est fixée.

**Le jour J.** Vous récupérez la commande, ou l’équipe est sur place avec l’option service à table.

> [À VALIDER] Questions n° 10 et n° 13 : dégustation, acompte, date limite d’ajustement du nombre d’invités, vaisselle et nappage. Ajouter une ligne par information confirmée, sans rien supposer.

### Section : animations

**surtitre:** Pour aller plus loin

**H2:** Une animation pour le vin d’honneur

Jambons cuits à la broche dans une rôtissoire installée sur place, côtes de bœuf grillées devant les invités : une animation culinaire rassemble les invités autour de la rôtissoire et donne au vin d’honneur son moment fort.

**lien:** Jambon à la broche et barbecue (`/traiteur-roanne/broche-barbecue`)

> [À VALIDER] Bars à thème (bar à bière, tiki bar, bar à limonades) : des photos existent, mais il faut savoir si Maison Cherblanc les fournit elle-même (question n° 14). Si oui, ajouter : « Bar à bière, bar à cocktails façon tiki ou bar à limonades : demandez-nous les animations disponibles pour votre date. »

### Section : liens

**H2:** À voir aussi

- Toutes nos prestations traiteur (`/traiteur-roanne`)
- Cocktail dînatoire et buffets (`/traiteur-roanne/cocktail-dinatoire`)
- Voir les photos de mariages (`/realisations?categorie=mariage`)
- Voir la carte traiteur et les prix (`/carte-traiteur`)

### Section : CTA final

**H2:** Votre date est fixée ?

Écrivez-nous dès maintenant : date, lieu, nombre d’invités. Nous revenons vers vous avec une première proposition.

**bouton 1:** Demander un devis mariage (`/contact?type=devis-traiteur`)
**bouton 2:** Appeler le 06 22 22 49 68 (`tel:+33622224968`)

### Alt d’images suggérés (mariage)

- `mariage-hero` [`salle-reception-mariage-dressage-traiteur-roanne-loire.jpg`] : `Salle de réception dressée de longues tables pour un mariage, traiteur Maison Cherblanc dans le Roannais`
- [`croquembouche-mariage-traiteur-maison-cherblanc-roanne.jpg`] : `Pièce montée en choux surmontée d’un cœur aux prénoms des mariés, préparée par Maison Cherblanc`
- [`tour-macarons-dessert-reception-mariage-traiteur-roanne.jpg`] : `Tour de macarons sur présentoir à étages pour un dessert de mariage`
- [`gateau-mariage-framboises-personnalise-traiteur-roanne.jpg`] : `Gâteau de mariage rond recouvert de framboises, personnalisé aux prénoms et à la date des mariés`
- [`plateau-fromages-prestige-fruits-passion-mariage-traiteur-roanne.jpg`] : `Grand plateau de fromages décoré de fruits de la passion, de raisin et d’orange pour un mariage`
- [`table-cocktail-aperitif-mariage-traiteur-maison-cherblanc.jpg`] : `Table de vin d’honneur en extérieur avec plateaux de charcuterie et feuilletés`

---

## 6. Cocktail dînatoire et buffets `/traiteur-roanne/cocktail-dinatoire`

**title:** Cocktail dînatoire à Roanne, buffets | Maison Cherblanc (55 car.)

**meta:** Cocktail dînatoire et buffets à Roanne : mini burgers, wraps, verrines, plateaux de charcuterie et de fromages. Prix à la pièce, commande 1 semaine avant. (154 car.)

**H1:** Cocktail dînatoire et buffets à Roanne

**fil d’Ariane:** Accueil › Traiteur à Roanne › Cocktail dînatoire

### Section : hero

**surtitre:** Cocktails · Buffets · Plateaux

**H1:** Cocktail dînatoire et buffets à Roanne

**chapô (premier paragraphe de la page):**
Un cocktail dînatoire à Roanne, c’est une réception où l’on dîne debout, en bavardant, sans jamais passer à table. Maison Cherblanc prépare les pièces de cocktail : mini burgers, wraps, navettes, verrines, toasts de saison, accompagnés de plateaux de charcuterie et de fromages. Vous choisissez à la pièce sur notre carte, ou nous composons l’assortiment pour vous.

**bouton 1:** Composer mon cocktail (`/contact?type=devis-traiteur`)
**bouton 2:** Voir les prix à la pièce (`/carte-traiteur#petit-dinatoire`)

**emplacement:** `cocktail-hero`

### Section : trois formats

**surtitre:** Trois formats

**H2:** Apéritif, cocktail dînatoire ou buffet : que choisir ?

**L’apéritif.** Quelques pièces par personne avant un repas, ou pour un pot entre collègues. Court, léger, facile à servir.

**Le cocktail dînatoire.** Il remplace le repas. Les pièces s’enchaînent, du salé au sucré, sur deux à trois heures. C’est le format le plus convivial pour un anniversaire, une inauguration ou une soirée de mariage.

**Le buffet.** Les invités se servent, souvent assis ensuite. Salades, viandes froides tranchées, quiches à la plaque, fromages et desserts : un buffet nourrit bien et se prête aux grandes tablées.

### Section : la carte du petit dînatoire (extraits, lignes à points de conduite)

**surtitre:** Petit dînatoire · À la pièce · Carte 2027

**H2:** Les pièces de cocktail

- Mini hamburger bœuf cheddar ........ 2 €
- Mini hamburger poulet césar ........ 2 €
- Mini hot dog ........ 2 €
- Mini croque jambon ........ 1,50 €
- Mini focaccia mozzarella jambon cru ........ 1,50 €
- Mini navette charcutière (jambon blanc, rosette) ........ 2 €
- Wrap poulet curry ........ 0,70 €
- Mini bagel de saison ........ 2,50 €
- Verrine de saison ........ 1,50 €
- Toast de saison vegan ........ 1,50 €
- Mini brochette de fromage ........ 1,50 €
- Sablé parmesan ........ 1 €

Et pour finir : macarons et mini gâteaux de soirée à 1,30 € pièce.

**bouton:** Voir toute la carte du petit dînatoire (`/carte-traiteur#petit-dinatoire`)

> Liste à générer depuis la base (section « Petit dînatoire » du menu `carte-traiteur`), limitée à une douzaine de lignes ici.

### Section : combien prévoir (passage autonome, fond lin)

**surtitre:** Quantités

**H2:** Combien de pièces prévoir par personne ?

Les repères courants chez les traiteurs : 4 à 6 pièces par personne pour un apéritif avant un repas, 12 à 15 pièces par personne pour un cocktail dînatoire qui remplace le dîner, un peu plus si la soirée dure ou si vos invités ont bon appétit. Comptez environ deux tiers de pièces salées et un tiers de sucrées.

**Exemple chiffré sur la carte 2027 (12 pièces par personne) :** 1 mini hamburger bœuf cheddar, 1 mini hamburger poulet césar, 1 mini hot dog, 2 wraps jambon fromage, 1 mini croque jambon, 1 mini focaccia, 1 verrine de saison, 1 toast de saison, 1 sablé parmesan et 2 macarons. Total : **17 € par personne**, hors service à table.

Nous ajustons les quantités avec vous selon l’heure, la durée et le public.

**lien:** Lire le guide complet : combien prévoir pour un cocktail dînatoire (`/actualites/cocktail-dinatoire-combien-de-pieces-par-personne`)

### Section : plateaux et buffets

**surtitre:** Plateaux et buffets

**H2:** Les plateaux à la personne

Pour accompagner les pièces ou composer un buffet, nos plateaux se commandent à la personne :

- **Plateau de charcuterie, 6 € par personne :** ½ tranche de jambon blanc, 1 tranche de jambon cru, 3 tranches de rosette, ½ tranche de terrine, 2 tranches de chorizo.
- **Plateau de fromages, 4,90 € par personne :** brie de Meaux, camembert, chèvre, comté.
- **Plateau de légumes crus, 4 € par personne :** carotte, chou-fleur, tomate, brocoli, sauce au choix.

Pour un buffet plus complet : salades (lentilles, taboulé, salade de riz, perle marine…), viandes froides à la part (rôti de bœuf, de porc ou de veau, cuisse de poulet), quiches et pizzas en plaques d’environ 50 parts.

**lien:** Plateau de charcuterie : comment le composer et le présenter (`/actualites/plateau-de-charcuterie-composer-presenter`)

### Section : service

**H2:** Retiré à la boutique ou servi par l’équipe

Les plateaux et les pièces se récupèrent à la boutique, rue Mulsant, prêts à poser sur la table. Avec l’option service à table, l’équipe dresse le buffet et sert vos invités pendant la réception.

> [À VALIDER] Si la livraison est confirmée (question n° 7), titre : **Retiré, livré ou servi par l’équipe**, et ajouter une phrase sur la zone et les conditions.

### Section : liens

**H2:** À voir aussi

- Toutes nos prestations traiteur (`/traiteur-roanne`)
- Traiteur mariage (`/traiteur-roanne/mariage`)
- Jambon à la broche et barbecue (`/traiteur-roanne/broche-barbecue`)
- Voir les photos de cocktails et buffets (`/realisations?categorie=cocktail`)

### Section : CTA final

**H2:** Un cocktail à organiser ?

Donnez-nous la date, le nombre d’invités et l’heure : nous vous proposons un assortiment et un devis gratuit. Commande au moins une semaine avant.

**bouton:** Demander un devis (`/contact?type=devis-traiteur`)

### Alt d’images suggérés (cocktail)

- `cocktail-hero` [`plateau-petits-fours-canapes-roules-traiteur-roanne.jpg`] : `Plateau de cocktail Maison Cherblanc : canapés, roulés, mini navettes et petits pains garnis`
- [`plateau-mini-burgers-hot-dogs-wraps-traiteur-roanne.jpg`] : `Coffret de mini burgers, mini hot dogs et wraps roulés pour un cocktail dînatoire à Roanne`
- [`plateau-cocktail-bagels-wraps-club-sandwich-traiteur-rhone-alpes.jpg`] : `Plateau de bagels, wraps, club sandwichs et verrines de crevettes`
- [`plateau-charcuterie-fromages-traiteur-maison-cherblanc-roanne.jpg`] : `Plateau de charcuterie et de fromages : jambon, rosette, chorizo, terrine et fromages en cubes`
- [`grande-table-buffet-traiteur-evenement-roanne-loire.jpg`] : `Rangées de mini burgers et de petits pains garnis prêts pour un buffet de réception`
- [`service-cocktail-exterieur-charcuterie-traiteur-roanne.jpg`] : `Serveuse de Maison Cherblanc dressant un buffet de cocktail en extérieur`

---

## 7. Broche et barbecue `/traiteur-roanne/broche-barbecue`

> URL retenue : `/traiteur-roanne/broche-barbecue` (les photos montrent une rôtissoire mobile, pas un fumoir). Les textes parlent de broche et de barbecue, sans promettre de fumoir ni de cochon à la broche (questions n° 4 et n° 15).

**title:** Jambon à la broche et barbecue à Roanne | Maison Cherblanc (58 car.)

**meta:** Jambon à la broche et côtes de bœuf au barbecue pour vos réceptions à Roanne : rôtissoire installée sur place, cuisson devant vos invités. Devis gratuit. (153 car.)

**H1:** Jambon à la broche et barbecue à Roanne

**fil d’Ariane:** Accueil › Traiteur à Roanne › Broche et barbecue

### Section : hero

**surtitre:** Animations · Le Traiteur

**H1:** Jambon à la broche et barbecue à Roanne

**chapô (premier paragraphe de la page):**
Pour une réception en plein air, rien ne réunit les invités comme une cuisson qui se fait sous leurs yeux. Maison Cherblanc installe sa rôtissoire mobile sur le lieu de votre fête à Roanne et dans le Roannais : jambons à la broche qui dorent lentement, côtes de bœuf saisies au barbecue. Le boucher choisit la viande, le traiteur la cuit et la sert.

**bouton:** Demander un devis (`/contact?type=devis-traiteur`)

**emplacement:** `broche-hero`

### Section : le jambon à la broche

**surtitre:** La broche

**H2:** Le jambon à la broche, cuit devant vos invités

Les jambons sont maintenus dans une grille, embrochés, puis tournent lentement devant la chaleur pendant de longues heures. La couenne dore, la chair cuit doucement et reste moelleuse. C’est une cuisson de patience, et c’est aussi un spectacle : les invités viennent voir, sentent, demandent quand on tranche.

Une fois cuit, le jambon se tranche et se sert chaud, avec ses accompagnements.

### Section : le barbecue

**surtitre:** Le barbecue

**H2:** Côtes de bœuf et grillades

Sur la même rôtissoire, la grille accueille des côtes de bœuf épaisses, choisies et préparées à notre boucherie. Elles sont saisies, retournées, puis reposent avant d’être tranchées. Une cuisson vive et courte, à l’opposé de la broche, et tout aussi généreuse.

> [À VALIDER] Ajouter d’autres viandes (saucisses, brochettes, volailles…) seulement si le client les propose en animation (question n° 15).

### Section : déroulé

**surtitre:** En pratique

**H2:** Comment se passe une animation broche ou barbecue

**Avant.** Nous fixons ensemble le nombre d’invités, la ou les viandes, les accompagnements et l’horaire du service. Le devis est gratuit.

**Sur place.** La rôtissoire arrive sur remorque. Prévoyez un emplacement extérieur, plat et accessible, à l’écart du passage. Nous vous précisons au moment du devis ce dont nous avons besoin sur place.

**Le service.** L’équipe surveille la cuisson, tranche et sert. Vous restez avec vos invités.

> [À VALIDER] Branchement électrique, gaz ou charbon, durée de présence, nombre minimum de convives (question n° 15). Ne rien préciser de plus sans réponse.

### Section : accompagnements (lignes à points de conduite, prix carte 2027)

**surtitre:** À côté

**H2:** Les accompagnements

Les accompagnements viennent de notre carte traiteur, à la part :

- Gratin dauphinois ........ 3,90 €
- Gratin dauphinois truffé ........ 4,10 €
- Pomme grenaille au romarin ........ 3,50 €
- Poêlée de légumes de saison ........ 3,50 €
- Tomate provençale ........ 2,90 €

Ajoutez une salade de la carte (lentilles, taboulé, salade de riz), un plateau de fromages et un dessert, et le repas est complet.

### Section : occasions

**H2:** Pour quelles réceptions ?

Mariage et vin d’honneur, anniversaire dans un jardin, fête de famille, repas d’association ou de fin de saison, fête de quartier : la broche et le barbecue conviennent à toutes les réceptions en extérieur, aux beaux jours comme en arrière-saison.

### Section : liens

**H2:** À voir aussi

- Toutes nos prestations traiteur (`/traiteur-roanne`)
- Traiteur mariage (`/traiteur-roanne/mariage`)
- Cocktail dînatoire et buffets (`/traiteur-roanne/cocktail-dinatoire`)
- Voir les photos de broche et barbecue (`/realisations?categorie=broche-barbecue`)

### Section : CTA final

**H2:** Une fête en plein air en préparation ?

Dites-nous la date, le lieu et le nombre d’invités. Nous vous proposons la cuisson la mieux adaptée et un devis gratuit.

**bouton 1:** Demander un devis (`/contact?type=devis-traiteur`)
**bouton 2:** Appeler le 06 22 22 49 68 (`tel:+33622224968`)

### Alt d’images suggérés (broche)

- `broche-hero` [`chef-traiteur-fumoir-mobile-maison-cherblanc-roanne.jpg`] : `Cuisinier de Maison Cherblanc surveillant des jambons à la broche dans une rôtissoire mobile, en extérieur`
- [`fumoir-mobile-cuisson-jambons-traiteur-evenement-roanne.jpg`] : `Trois jambons en cuisson à la broche dans une rôtissoire mobile installée pour une réception`
- [`jambon-fume-artisanal-boucherie-cherblanc-roanne.jpg`] : `Gros plan sur deux jambons dorés à la broche, maintenus dans leur grille`
- [`cuisson-cotes-boeuf-barbecue-traiteur-evenement-roanne.jpg`] : `Côtes de bœuf grillées sur la rôtissoire au-dessus de jambons à la broche, lors d’une réception`

> Les noms de fichiers des photos mentionnent un « fumoir » : ce sont des photos de rôtissoire. Renommer les fichiers à l’import (ex. `rotissoire-mobile-jambons-broche-traiteur-roanne.jpg`) si le fumoir n’est pas confirmé.

---

## 8. Carte traiteur `/carte-traiteur`

**title:** Carte traiteur à Roanne, prix 2027 | Maison Cherblanc (53 car.)

**meta:** Carte traiteur 2027 de Maison Cherblanc à Roanne : plateaux par personne, formule du chef à 14 €, plats cuisinés à la part, petit dînatoire. PDF en ligne. (154 car.)

**H1:** Carte traiteur et tarifs

> Le H1 reste court pour la lisibilité ; le mot clé « carte traiteur Roanne » est porté par le `title`, le chapô et le surtitre. Le titre et les sections de carte viennent de la base (menu `carte-traiteur`).

### Section : hero

**surtitre:** Carte traiteur 2027 · Roanne

**H1:** Carte traiteur et tarifs

**chapô:**
Toute la carte traiteur de Maison Cherblanc, avec ses prix : plateaux et formules à la personne, entrées et plats cuisinés à la part, quiches et pizzas à la plaque, petit dînatoire à la pièce, desserts. Tarifs valables du 1er janvier au 31 décembre 2027. Commande une semaine avant, à la boutique, 55 rue Mulsant à Roanne.

**bouton 1:** Télécharger la carte (PDF) (`pdf_media_id`)
**bouton 2:** Demander un devis (`/contact?type=devis-traiteur`)

**emplacement:** `carte-hero`

### Section : sommaire (ancres)

Nos formules · Entrées froides · Entrées chaudes · Quiches et pizzas · Viande froide · Plats chauds · Accompagnements · Petit dînatoire · Desserts

> Ancres stables à générer depuis les titres de section (`#nos-formules`, `#petit-dinatoire`, etc.), utilisées par les liens des autres pages.

### Section : la carte (depuis la base)

> Rendu : une section par `menu_sections`, lignes « nom ........ prix unité » ; la note de section (« À la part », « Plaque de 50 parts environ ») en petites capitales cuivre ; les formules mises en avant dans un encadré.

### Section : informations de commande (encadré, texte de `menus.infos_commande`)

**H2:** Commander

- **Délai :** merci de passer commande une semaine avant.
- **Service :** option service à table disponible.
- **Sur mesure :** plein d’autres options sont disponibles, n’hésitez pas à nous contacter pour un devis gratuit.
- **Retrait :** à la boutique, 55 rue Mulsant, aux horaires d’ouverture.
- **Téléphone :** 04 77 71 16 11 ou 06 22 22 49 68.

### Section : note de bas de carte (`menus.note_bas`)

Prix TTC. Tarifs valables du 1er janvier au 31 décembre 2027. Photos non contractuelles.

> [À VALIDER] Mention allergènes (question n° 11), par exemple : « Informations sur les allergènes disponibles en boutique et sur simple demande. »

### Section : CTA final

**H2:** Vous ne trouvez pas exactement ce que vous cherchez ?

La carte est un point de départ. Dites-nous ce que vous imaginez, nous vous faisons une proposition et un devis gratuit.

**bouton 1:** Demander un devis (`/contact?type=devis-traiteur`)
**bouton 2:** Découvrir le traiteur à Roanne (`/traiteur-roanne`)

### Alt d’images suggérés (carte)

- `carte-hero` [`plateau-cocktail-viande-charcuterie-traiteur-maison-cherblanc.jpg`] : `Plateau traiteur Maison Cherblanc : mini burgers, mini hot dogs, roulés et bouchées de tartare`

---

## 9. Menus de fêtes `/menus-de-fetes`

**title (en saison, suit le titre du menu en base):** Traiteur Noël à Roanne, menus de fêtes 2026 | Cherblanc (55 car.)

**meta (en saison):** Menus de fêtes 2026 de Maison Cherblanc à Roanne : foie gras, plats cuisinés, volailles fermières sur commande. Commandes avant le 20 décembre pour Noël. (153 car.)

**title (hors saison):** Menus de fêtes à Roanne | Maison Cherblanc (42 car.)

**meta (hors saison):** Menus de fêtes de Maison Cherblanc, boucherie et traiteur à Roanne : Noël, jour de l’An et autres saisons. Les prochains menus sont publiés ici. (144 car.)

**H1 (en saison):** Menus de fêtes 2026

### Section : hero (en saison)

**surtitre:** Fêtes de fin d’année · Traiteur à Roanne

**H1:** Menus de fêtes 2026

**chapô:**
Pour Noël et le jour de l’An, Maison Cherblanc vous propose deux menus de fêtes, une carte d’entrées, de plats cuisinés et d’accompagnements, des volailles fermières sur commande et un petit dînatoire de Noël. Merci de passer vos commandes avant le dimanche 20 décembre pour Noël, et avant le jeudi 24 décembre pour le jour de l’An.

**bouton 1:** Télécharger le menu (PDF)
**bouton 2:** Passer commande (`/contact?type=devis-traiteur`)

**emplacement:** `fetes-hero`

### Section : dates à retenir (encadré en arche, passage autonome)

**surtitre:** Dates à retenir

**H2:** Dates de commande et horaires des fêtes 2026

**Dates limites de commande**
- Pour Noël : avant le dimanche 20 décembre 2026.
- Pour le jour de l’An : avant le jeudi 24 décembre 2026.
- Volailles : uniquement sur commande, avant le 20 décembre.

**Ouvertures exceptionnelles**
- Dimanche 20 décembre 2026 : 8h–12h
- Lundi 21 décembre 2026 : 8h–12h
- Jeudi 24 décembre 2026 : commandes à récupérer avant 17h
- Dimanche 27 décembre 2026 : 8h–12h
- Jeudi 31 décembre 2026 : commandes à récupérer avant 17h

**Jours de fermeture**
- Vendredi 25 décembre 2026
- Vendredi 1er janvier 2027
- Réouverture le mardi 5 janvier 2027

> Contenu à générer depuis `menus.infos_commande` et `horaires_exceptionnels`. [À VALIDER] Horaires des autres jours de la semaine du 21 au 31 décembre (question n° 16) : la carte imprimée ne les précise pas ; ne pas en déduire d’horaires.

### Section : le menu (depuis la base)

> Sections du menu `saison` en base : Nos menus de fête (Menu Gourmandise 35 €, Menu Plaisir 29 €, encadrés), Entrées froides, Entrées chaudes, Plats cuisinés, Accompagnements, Volailles (note : « Uniquement sur commande avant le 20 décembre »), Petit dînatoire de Noël.

### Section : remerciements (bas de page, fond olive)

La Maison Cherblanc vous remercie de votre confiance et vous présente ses meilleurs vœux pour 2027.

**lien:** Les volailles et la charcuterie de fête à la boucherie (`/boucherie-roanne`)
**lien:** Conseils : bien choisir et cuire sa volaille de fête (`/actualites/volaille-de-fete-choisir-cuire`)

### État vide (aucun menu `saison` publié à la date du jour)

**surtitre:** Menus de saison

**H1:** Menus de fêtes

**chapô:**
Nos menus de fêtes sont publiés ici quelques semaines avant chaque période, avec les dates limites de commande et les horaires d’ouverture exceptionnels. Le prochain arrive bientôt.

**H2:** En attendant

Toute l’année, la carte traiteur reste disponible : plateaux, plats cuisinés, petit dînatoire et desserts. Pour une commande particulière ou une date à réserver dès maintenant, écrivez-nous : nous vous répondrons, et nous vous préviendrons à la sortie du prochain menu si vous le précisez dans votre message.

**bouton 1:** Voir la carte traiteur (`/carte-traiteur`)
**bouton 2:** Nous écrire (`/contact`)

### Alt d’images suggérés (fêtes)

- `fetes-hero` [visuel IA provisoire ou photo du menu imprimé] : `Menu de fêtes de fin d’année 2026 de Maison Cherblanc, boucherie et traiteur à Roanne`

---

## 10. Réalisations `/realisations`

**title:** Réalisations traiteur à Roanne, en photos | Maison Cherblanc (60 car.)

**meta:** Mariages, cocktails, buffets, plateaux et jambons à la broche : quelques réceptions préparées par Maison Cherblanc, traiteur et boucherie à Roanne. (147 car.)

**H1:** Nos réalisations

### Section : hero

**surtitre:** En images

**H1:** Nos réalisations

**chapô:**
Des plateaux du dimanche aux réceptions de mariage : voici quelques tables que nous avons préparées à Roanne et dans le Roannais. Toutes les photos sont les nôtres, prises en cuisine ou sur place.

### Section : filtres (libellés)

Tout · Mariages · Cocktails · Buffets · Broche et barbecue · Plateaux · Boucherie

> Clés de catégorie en base : `mariage`, `cocktail`, `buffet`, `broche-barbecue`, `plateaux`, `boucherie`. Libellé affiché pour `broche-barbecue` : « Broche et barbecue » (tant que le fumoir n’est pas confirmé).

### Section : texte sous la grille selon le filtre (une phrase, lien vers la sous-page)

- **Mariages :** Vin d’honneur, buffet, pièce montée : découvrez notre service de [traiteur mariage](/traiteur-roanne/mariage).
- **Cocktails / Buffets / Plateaux :** Pièces à l’unité, plateaux à la personne : voir le [cocktail dînatoire et les buffets](/traiteur-roanne/cocktail-dinatoire).
- **Broche et barbecue :** Une rôtissoire installée chez vous : [jambon à la broche et barbecue](/traiteur-roanne/broche-barbecue).
- **Boucherie :** Viandes, charcuterie et volailles : [la boucherie de la rue Mulsant](/boucherie-roanne).

### Section : état vide (aucune photo dans la catégorie)

Pas encore de photo dans cette catégorie. Revenez bientôt, ou parcourez toutes nos réalisations.
**bouton:** Voir tout

### Section : CTA final

**H2:** Votre réception sera la prochaine ?

**bouton:** Demander un devis (`/contact?type=devis-traiteur`)

### Légendes suggérées (`realisations.legende`, une ligne, sans nom de client)

- `croquembouche-mariage-…` : Pièce montée en choux, cœur aux prénoms des mariés.
- `tour-macarons-…` : Tour de macarons pour un dessert de mariage.
- `gateau-mariage-framboises-…` : Gâteau de mariage personnalisé.
- `table-maries-decoration-…` : Table d’honneur d’un mariage.
- `salle-reception-mariage-dressage-…` : Salle dressée pour un repas de mariage.
- `table-accueil-decoration-reception-…` : Table d’accueil d’une réception.
- `buffet-cocktail-exterieur-reception-…` : Buffet de cocktail en extérieur.
- `plateau-petits-fours-canapes-roules-…` : Plateau de canapés et de roulés.
- `plateau-mini-burgers-hot-dogs-wraps-…` : Mini burgers, mini hot dogs et wraps.
- `plateau-charcuterie-fromages-…` : Plateau de charcuterie et de fromages.
- `plateau-fromages-prestige-fruits-passion-…` : Plateau de fromages aux fruits frais.
- `chef-traiteur-fumoir-mobile-…` : Jambons à la broche, cuits sur place.
- `cuisson-cotes-boeuf-barbecue-…` : Côtes de bœuf sur la grille.
- `equipe-traiteur-maison-cherblanc-…` : L’équipe, juste avant le service.

> Les photos `gateau-mariage-…` et `croquembouche-…` montrent les prénoms et la date d’un mariage réel. Vérifier avec le client que les mariés sont d’accord pour la publication (question n° 17), ou flouter la plaque.

---

## 11. La maison `/la-maison`

**title:** La maison : boucherie et traiteur rue Mulsant | Cherblanc (57 car.)

**meta:** Maison Cherblanc, boucherie, charcuterie et traiteur au 55 rue Mulsant à Roanne depuis 2023 : qui nous sommes, comment nous travaillons, l’équipe. (146 car.)

**H1:** La maison Cherblanc

### Section : hero

**surtitre:** La maison

**H1:** La maison Cherblanc

**chapô:**
Une boucherie de quartier et un traiteur, réunis sous le même nom, au 55 rue Mulsant à Roanne. Voici qui nous sommes et comment nous travaillons.

**emplacement:** `maison-hero`

### Section : histoire

**surtitre:** Rue Mulsant

**H2:** Une boucherie reprise en 2023

En août 2023, Maison Cherblanc a repris la boucherie du 55 rue Mulsant, à Roanne. La boutique a gardé son comptoir, son numéro de téléphone et sa vocation : servir chaque semaine les habitants du quartier en viande, en volailles et en charcuterie. Elle y exerce deux métiers à parts égales : la boucherie-charcuterie et le traiteur (plateaux, plats cuisinés, cocktails, buffets et repas de mariage).

La maison est dirigée par Thibaut Cherblanc et Emilie Viallon.

> [À VALIDER] (question n° 1) Orthographe du prénom : le registre écrit « Thibaut », le contrat « Thibault ». Utiliser l’orthographe confirmée partout (ici, mentions légales, `config/site.ts`).
> [À VALIDER] (question n° 18) Variante si le client souhaite mentionner la continuité avec l’ancienne enseigne : « Jusqu’en 2023, la boutique s’appelait Boucherie Viallon et Filles. Emilie Viallon, qui y travaillait en famille, codirige aujourd’hui Maison Cherblanc. » Ne l’utiliser qu’avec l’accord explicite du client et d’Emilie Viallon : l’article de 2020 qui le laisse penser concerne l’ancienne société.
> [À VALIDER] (question n° 19) Parcours de Thibaut Cherblanc et d’Emilie Viallon (formation, expériences, métier de chacun) : un paragraphe à ajouter s’ils le souhaitent. C’est le contenu qui renforcera le plus la confiance (E-E-A-T).

### Section : deux métiers

**surtitre:** Deux métiers

**H2:** Boucher et traiteur, à égalité

Au comptoir, le métier de boucher : choisir, découper, parer, conseiller. En cuisine, le métier de traiteur : cuisiner, dresser, préparer pour l’heure dite et, si vous le souhaitez, servir. Les deux se nourrissent l’un l’autre. Les rôtis du buffet viennent de la boucherie ; le savoir-faire du traiteur se retrouve dans les plats cuisinés vendus à la part.

> [À VALIDER] Si la livraison est confirmée (question n° 7), remplacer « préparer pour l’heure dite » par « livrer à l’heure dite ».

### Section : notre façon de travailler (4 points, fond lin)

**surtitre:** Notre façon de travailler

**H2:** Ce sur quoi vous pouvez compter

1. **Des prix affichés.** La carte traiteur est publique, avec ses prix à la personne, à la part ou à la pièce. Vous savez ce que vous commandez.
2. **Un délai réaliste.** Nous demandons une semaine pour une commande traiteur : c’est le temps de bien faire.
3. **Le service si vous le voulez.** Retrait en boutique, ou service à table le jour de votre réception.
4. **Une boutique ouverte six jours sur sept.** Du mardi au samedi, et le dimanche matin.

> [À VALIDER] (questions n° 2 et n° 3) Si le client confirme une provenance, des éleveurs, une fabrication maison de la charcuterie ou une démarche particulière (circuits courts, produits locaux), ajouter un cinquième point factuel. Ne rien écrire de tel sans confirmation.

### Section : l’équipe

**surtitre:** L’équipe

**H2:** Les visages de la maison

Au comptoir, en cuisine et en salle le jour de vos réceptions, c’est la même équipe. Vous la reconnaîtrez souvent à sa tenue noire, brodée du monogramme MC.

> [À VALIDER] (question n° 20) Prénoms et rôles des membres de l’équipe qui acceptent d’apparaître, pour une ligne sous la photo : « De gauche à droite : … ».

**emplacement:** `maison-equipe`

### Section : CTA final

**H2:** Passez nous voir

55 rue Mulsant, 42300 Roanne. Du mardi au dimanche matin.

**bouton 1:** La boucherie (`/boucherie-roanne`)
**bouton 2:** Le traiteur (`/traiteur-roanne`)
**bouton 3:** Horaires et contact (`/contact`)

### Alt d’images suggérés (la maison)

- `maison-hero` [photo de la façade à produire ; provisoire : visuel IA] : `Façade de la boutique Maison Cherblanc, 55 rue Mulsant à Roanne`
- `maison-equipe` [`equipe-traiteur-maison-cherblanc-roanne-service-evenement.jpg`] : `Deux membres de l’équipe Maison Cherblanc, en tenue noire brodée MC, présentent des planches de roulés et de feuilletés`
- [`chef-traiteur-fumoir-mobile-maison-cherblanc-roanne.jpg`] : `Le cuisinier de Maison Cherblanc, tablier rouge, à la rôtissoire lors d’une réception`

---

## 12. Actualités `/actualites`

**title:** Actualités et conseils | Maison Cherblanc, Roanne (49 car.)

**meta:** Actualités de Maison Cherblanc, boucherie et traiteur à Roanne : commandes de fêtes, conseils de cuisson, quantités pour vos réceptions, nouveautés. (148 car.)

**H1:** Actualités et conseils

### Section : hero

**surtitre:** Le journal de la maison

**H1:** Actualités et conseils

**chapô:**
Dates de commande, nouveautés de la carte, conseils du boucher et du traiteur : ce qui se passe rue Mulsant, et ce qui peut vous servir en cuisine.

### Carte article (liste)

- surtitre : date de publication (« 26 octobre 2026 »)
- titre de l’article (H2 dans la liste)
- chapô tronqué à 160 caractères
- lien : Lire l’article

### État vide (aucun article publié)

**H2:** Les premières nouvelles arrivent

Nous publierons ici les dates des commandes de fêtes, les nouveautés de la carte et quelques conseils du boucher et du traiteur. En attendant, la carte traiteur et les horaires sont à jour.

**bouton 1:** Voir la carte traiteur (`/carte-traiteur`)
**bouton 2:** Horaires et contact (`/contact`)

### Page article `/actualites/[slug]` (textes fixes)

- surtitre : « Actualités · » + date
- bloc de fin d’article : **Une question, une commande ?** Appelez la boutique au 04 77 71 16 11 ou écrivez-nous. · bouton : Nous contacter (`/contact`)
- lien retour : Toutes les actualités (`/actualites`)

---

## 13. Contact `/contact`

**title:** Contact, horaires et devis traiteur à Roanne | Cherblanc (56 car.)

**meta:** Maison Cherblanc, 55 rue Mulsant, 42300 Roanne. Tél. 04 77 71 16 11. Horaires de la boucherie, demande de devis traiteur gratuit et commandes en ligne. (151 car.)

**H1:** Contact et horaires

### Section : hero

**surtitre:** Contact

**H1:** Contact et horaires

**chapô:**
Une commande pour la boucherie, un devis traiteur, une question sur la carte : appelez la boutique, passez nous voir rue Mulsant, ou écrivez-nous avec le formulaire ci-dessous. Pour le traiteur, pensez à commander au moins une semaine avant.

### Section : coordonnées (passage autonome)

**H2:** Coordonnées

**Adresse**
Maison Cherblanc
55 rue Mulsant
42300 Roanne

**Téléphone boutique** · 04 77 71 16 11
**Mobile** · 06 22 22 49 68
**E-mail** · contact@maisoncherblanc.fr
**Réseaux** · Facebook · Instagram

> [À VALIDER] (question n° 21) La carte imprimée 2027 donne l’adresse boucheriecherblanc@gmail.com. Confirmer l’adresse publique (le contrat prévoit contact@maisoncherblanc.fr) et l’harmoniser sur les prochains documents imprimés. Réseaux : n’afficher que les comptes confirmés (question n° 22).

**boutons:**
- Appeler la boutique (`tel:+33477711611`)
- Itinéraire (lien externe Google Maps, nouvel onglet)

### Section : horaires (arche)

**H2:** Horaires d’ouverture

| Jour | Horaires |
|---|---|
| Lundi | Fermé |
| Mardi | 7h30–13h · 15h–19h |
| Mercredi | 7h30–13h |
| Jeudi | 7h30–13h |
| Vendredi | 7h30–13h · 15h–19h |
| Samedi | 7h30–18h |
| Dimanche | 8h–12h |

**sous le tableau (si fermeture ou ouverture exceptionnelle dans les 30 jours):** `{date} : {libellé} ({plages} ou « fermé »)`

### Section : accès

**H2:** Venir à la boutique

La boutique se trouve au 55 rue Mulsant, à Roanne (42300).

> [À VALIDER] (question n° 9) Stationnement à proximité, accessibilité de l’entrée (une marche, une rampe ?). Ajouter une phrase factuelle par information confirmée.

> Pas de carte intégrée (contrat) : image statique ou bloc dessiné avec le lien « Itinéraire ».

### Section : formulaire

**H2:** Écrivez-nous

**libellés des champs:**
- Votre demande (choix) : Devis traiteur · Commande boucherie · Autre question
- Prénom
- Nom
- E-mail
- Téléphone
- Date de l’événement (affiché si « Devis traiteur »)
- Nombre de personnes (affiché si « Devis traiteur »)
- Votre message

**placeholders:**
- Prénom : `Camille`
- Nom : `Martin`
- E-mail : `camille@exemple.fr`
- Téléphone : `06 12 34 56 78`
- Nombre de personnes : `40`
- Votre message (devis traiteur) : `Le lieu, le type de réception (cocktail, buffet, repas), vos envies, le service à table…`
- Votre message (commande boucherie) : `Les pièces, les quantités, le jour et l’heure de retrait souhaités…`
- Votre message (autre) : `Votre question…`

**aide sous « Date de l’événement »:** Les commandes traiteur se passent au moins une semaine avant.

**mention champs obligatoires:** Les champs marqués d’un astérisque sont obligatoires.

> Champs obligatoires : type, prénom, nom, e-mail, message. Téléphone recommandé (« pour vous rappeler plus vite »), date et nombre de personnes recommandés pour un devis.

**phrase RGPD (près du bouton):** Vos données servent uniquement à répondre à votre demande et sont conservées 12 mois. [En savoir plus](/politique-de-confidentialite)

**bouton d’envoi:** Envoyer ma demande
**bouton pendant l’envoi:** Envoi en cours…

**messages d’erreur par champ:**
- Type non choisi : `Choisissez le type de demande.`
- Prénom manquant : `Indiquez votre prénom.`
- Nom manquant : `Indiquez votre nom.`
- E-mail invalide : `Cette adresse e-mail ne semble pas valide.`
- Téléphone invalide : `Ce numéro de téléphone ne semble pas valide.`
- Date passée : `Cette date est déjà passée.`
- Date à moins de 7 jours (avertissement, n’empêche pas l’envoi) : `Cette date est dans moins d’une semaine : appelez-nous au 06 22 22 49 68 pour vérifier que c’est encore possible.`
- Nombre de personnes invalide : `Indiquez un nombre de personnes.`
- Message vide : `Votre message est vide.`

**message de confirmation:**
**Merci, votre demande est bien arrivée.** Nous vous répondons rapidement, par e-mail ou par téléphone. Pour une commande urgente, appelez la boutique au 04 77 71 16 11.

**message d’erreur (envoi échoué):**
**Le message n’est pas parti.** Un souci technique de notre côté. Réessayez dans un instant, ou appelez la boutique au 04 77 71 16 11.

**message d’erreur (trop de tentatives):**
Vous avez envoyé plusieurs messages en peu de temps. Patientez quelques minutes avant de réessayer.

### Alt d’images suggérés (contact)

- `contact-boutique` [photo de la façade à produire ; provisoire : visuel IA] : `Devanture de Maison Cherblanc, boucherie et traiteur, 55 rue Mulsant à Roanne`

---

## 14. Textes transverses

### Navigation

**menu principal:**
- La Boucherie (`/boucherie-roanne`)
- Le Traiteur (`/traiteur-roanne`), sous-menu : Mariage · Cocktail dînatoire et buffets · Broche et barbecue · Carte traiteur
- Menus de fêtes (`/menus-de-fetes`), affiché en saison seulement, ou toujours en dernier sous « Le Traiteur »
- Réalisations (`/realisations`)
- La maison (`/la-maison`)
- Actualités (`/actualites`)
- Contact (`/contact`)

**bouton de navigation (toujours visible):** Demander un devis (`/contact?type=devis-traiteur`)
**menu mobile:** Menu · Fermer
**lien d’évitement (accessibilité):** Aller au contenu
**libellé du logo (aria-label):** Maison Cherblanc, retour à l’accueil

### Bandeau d’annonce (exemples prêts à l’emploi, éditables dans le backoffice)

- `Commandes de fêtes : avant le 20 décembre pour Noël, avant le 24 décembre pour le jour de l’An.` · lien : Voir les menus de fêtes (`/menus-de-fetes`)
- `Ouverture exceptionnelle le lundi 21 décembre, de 8h à 12h.` · lien : Horaires des fêtes (`/menus-de-fetes`)
- `La carte traiteur 2027 est en ligne.` · lien : Voir la carte (`/carte-traiteur`)
- `Fermeture exceptionnelle le {date}.` · lien : Horaires (`/contact`)

**libellé du bouton de fermeture:** Masquer l’annonce

### Widget horaires (en-tête ou pied de page, calculé)

- `Ouvert, jusqu’à {heure}`
- `Ouvert, fermeture à {heure} puis réouverture à {heure}`
- `Fermé, ouvre {jour} à {heure}`
- `Ferme bientôt, à {heure}`
- `Fermeture exceptionnelle aujourd’hui`

### Pied de page

**signature (2 lignes):**
Maison Cherblanc, boucherie, charcuterie et traiteur à Roanne.
55 rue Mulsant, 42300 Roanne · 04 77 71 16 11

**colonnes:**
- **La maison** · Boucherie à Roanne · Traiteur à Roanne · Carte traiteur · Menus de fêtes · Réalisations · La maison
- **Réceptions** · Traiteur mariage · Cocktail dînatoire · Broche et barbecue · Demander un devis
- **Horaires** · Mardi et vendredi : 7h30–13h, 15h–19h · Mercredi et jeudi : 7h30–13h · Samedi : 7h30–18h · Dimanche : 8h–12h · Lundi : fermé
- **Nous suivre** · Facebook · Instagram (comptes confirmés seulement)

**ligne légale:** © {année} Maison Cherblanc · Mentions légales · Politique de confidentialité · Site réalisé par l’Agence Voilà Voilà

### Page 404

**title:** Page introuvable | Maison Cherblanc, Roanne (43 car.) (avec `noindex`)

**surtitre:** Erreur 404

**H1:** Cette page n’est plus en vitrine

L’adresse demandée n’existe pas, ou plus. La boucherie et le traiteur, eux, sont toujours au 55 rue Mulsant.

**boutons:**
- Retour à l’accueil (`/`)
- La boucherie (`/boucherie-roanne`)
- Le traiteur (`/traiteur-roanne`)

**petite ligne:** Vous cherchiez quelque chose de précis ? Appelez-nous au 04 77 71 16 11.

### Page 500 (erreur serveur)

**H1:** Un contretemps en cuisine

La page n’a pas pu s’afficher. Réessayez dans un instant, ou appelez la boutique au 04 77 71 16 11.

---

## 15. Actualités de lancement (4 articles prêts à publier)

> Chaque article : `titre`, `slug`, `chapo`, `titre_seo`, `description_seo`, puis `corps` en Markdown restreint (le bloc entre les balises de code est à coller tel quel dans le champ `corps`). Faits utilisés : carte traiteur 2027 et menu de fêtes 2026. Les repères de cuisine et de quantités sont des usages courants, présentés comme tels.
> Ordre de publication conseillé : article 1 tout de suite (fin octobre), articles 2 et 3 dans la foulée, article 4 fin novembre.

### Article 1 · Commandes de fêtes 2026

**titre:** Commandes de fêtes 2026 à Roanne : dates, horaires et conseils

**slug:** `commandes-de-fetes-2026-roanne`

**titre_seo:** Commandes de fêtes 2026 à Roanne : dates et horaires (52 car.)

**description_seo:** Noël et jour de l’An 2026 chez Maison Cherblanc à Roanne : dates limites de commande, ouvertures exceptionnelles, menus de fêtes et volailles fermières. (152 car.)

**chapo:** Pour Noël, les commandes se passent avant le dimanche 20 décembre, et pour le jour de l’An avant le jeudi 24 décembre. Voici toutes les dates, les horaires d’ouverture des fêtes et nos conseils pour commander sereinement.

**corps:**

```markdown
Les fêtes de fin d’année sont la période la plus chargée de la boutique. Pour que votre commande soit prête à l’heure, sans attente, voici tout ce qu’il faut savoir sur les fêtes 2026 chez Maison Cherblanc, au 55 rue Mulsant à Roanne.

## Les dates limites de commande

- **Pour Noël** : commandez avant le **dimanche 20 décembre 2026**.
- **Pour le jour de l’An** : commandez avant le **jeudi 24 décembre 2026**.
- **Volailles de fête** : uniquement sur commande, **avant le 20 décembre**.

Vous pouvez commander au comptoir, par téléphone au 04 77 71 16 11 ou au 06 22 22 49 68, ou en nous écrivant depuis la page contact du site.

## Les horaires d’ouverture des fêtes

La boutique est habituellement fermée le lundi et ferme à midi le dimanche. En décembre, le calendrier change. Voici les ouvertures exceptionnelles :

- **Dimanche 20 décembre** : 8h–12h
- **Lundi 21 décembre** : 8h–12h
- **Jeudi 24 décembre** : commandes à récupérer avant 17h
- **Dimanche 27 décembre** : 8h–12h
- **Jeudi 31 décembre** : commandes à récupérer avant 17h

Et les jours de fermeture :

- **Vendredi 25 décembre 2026**
- **Vendredi 1er janvier 2027**
- **Réouverture le mardi 5 janvier 2027**

## Les deux menus de fêtes

Pour ceux qui veulent un repas complet sans se poser de questions, nous proposons deux menus :

**Menu Gourmandise, 35 €**
- Entrée : foie gras et son confit d’oignon, pain d’épices ; verrine de crème de châtaigne, crumble aux pommes ; cassolette de la mer
- Plat : ballotine de canette confite, châtaignes et sauce morilles, écrasé de pommes de terre au sel de Guérande, poêlée de légumes d’hiver glacés au miel et épices douces

**Menu Plaisir, 29 €**
- Entrée : saumon fumé ; brioche aux escargots
- Plat : civet de chevreuil sauce chasseur, gratin dauphinois, marrons et champignons persillés

## La carte des fêtes, pour composer vous-même

Vous préférez composer votre repas ? Tout se commande aussi à la carte :

- **Entrées froides** : galantine de chapon aux pistaches, galantine de pintade forestière, terrine de la mer, terrine de sanglier, saumon fumé, foie gras de canard mi-cuit ou à la coupe.
- **Entrées chaudes** : coquille Saint-Jacques et ses fruits de mer, cassolette de la mer, brioche aux escargots, escargots à la douzaine, vol-au-vent au ris de veau, boudins blancs (au porto, au foie gras, aux morilles).
- **Plats cuisinés** : ballotines de canette et de chapon aux châtaignes, délices de dinde et de canard, cuisse de canard sauce morilles, paupiette de saumon au beurre citronné, chevreuil sauce chasseur, gratin de fruits de mer, quenelle de brochet sauce homardine.
- **Accompagnements** : gratins dauphinois (nature, truffé, sauce morilles), purée de butternut et noisettes, marrons et champignons persillés, poêlée de légumes d’hiver, gratin de cardons sauce morilles, écrasé de pommes de terre, pommes dauphine.

Tous les prix sont sur la page **Menus de fêtes** du site.

## Les volailles, uniquement sur commande

Dinde fermière, poularde fermière et chapon fermier à 19,99 € le kilo, poulet de Bresse à 26,99 € le kilo, pintade fermière à 15,99 € le kilo, canard ou canette à 18,99 € le kilo, caille à 4,90 € pièce. Les volailles ne sont vendues **que sur commande, avant le 20 décembre** : n’attendez pas la dernière semaine.

## Le petit dînatoire de Noël

Pour l’apéritif du réveillon : mini hamburger au foie gras et oignon confit (3 € pièce), mini hamburger bœuf cheddar (2 €), mini hot-dog (2 €), navette au saumon fumé (3 €), cuillère de saumon au tartare (3 €) et trio de verrines de Noël (9 € les trois).

## Nos conseils pour une commande sans stress

1. **Commandez tôt.** Les dates limites sont des dates limites, pas des dates conseillées. Les premières commandes sont aussi celles qui ont le plus de choix, surtout pour les volailles.
2. **Comptez vos convives, enfants compris.** Indiquez-nous le nombre exact de personnes : nous vous aidons à ajuster les quantités, notamment pour le poids d’une volaille.
3. **Notez votre jour et votre heure de retrait.** Les 24 et 31 décembre, les commandes sont à récupérer avant 17h.
4. **Prévoyez la place au réfrigérateur.** Une volaille de 3 à 4 kilos, un foie gras et quelques plats cuisinés prennent vite toute une étagère.
5. **Pensez au lendemain.** Le 25 décembre et le 1er janvier, la boutique est fermée.

Pour toute question, appelez la boutique : nous sommes là pour vous aider à composer un repas de fêtes à la mesure de votre tablée.
```

**liens internes à placer à l’intégration:** « Menus de fêtes » → `/menus-de-fetes` · « page contact » → `/contact` · « volailles » → `/actualites/volaille-de-fete-choisir-cuire`

---

### Article 2 · Cocktail dînatoire, combien prévoir

**titre:** Cocktail dînatoire : combien de pièces prévoir par personne ?

**slug:** `cocktail-dinatoire-combien-de-pieces-par-personne`

**titre_seo:** Cocktail dînatoire : combien de pièces par personne ? (53 car.)

**description_seo:** Combien de pièces prévoir pour un cocktail dînatoire ou un apéritif ? Repères par personne, équilibre salé-sucré, exemple chiffré d’un traiteur de Roanne. (154 car.)

**chapo:** Quatre à six pièces pour un apéritif, douze à quinze pour un cocktail dînatoire qui remplace le dîner : voici les repères que nous utilisons pour vous conseiller, et un exemple chiffré à partir de notre carte.

**corps:**

```markdown
C’est la question que l’on nous pose le plus souvent au moment d’un devis : « Combien faut-il prévoir par personne ? » Trop peu, et vos invités repartent avec la faim. Trop, et vous finissez la semaine avec des mini burgers. Voici nos repères.

## D’abord, quel type de réception ?

Tout dépend du rôle que joue le cocktail dans votre soirée.

- **Un apéritif avant un repas** : vos invités passeront ensuite à table. Comptez **4 à 6 pièces par personne**.
- **Un vin d’honneur** (mariage, inauguration) : souvent en fin d’après-midi, avant un dîner pour une partie des invités seulement. Comptez **6 à 10 pièces par personne**.
- **Un cocktail dînatoire** : il remplace le repas. Comptez **12 à 15 pièces par personne**, un peu plus si la soirée dure longtemps.

Ces repères sont des usages courants chez les traiteurs. Nous les ajustons ensuite à votre public et à votre horaire.

## Les facteurs qui font varier les quantités

- **L’heure.** Un cocktail à 19h, à l’heure du dîner, appelle plus de pièces qu’un cocktail à 17h.
- **La durée.** Au-delà de trois heures, prévoyez une ou deux pièces de plus par personne, ou un plateau en relais.
- **Le public.** Une équipe sportive ou une tablée de jeunes adultes ne mange pas comme un pot de départ en milieu d’après-midi.
- **Les plateaux.** Un plateau de charcuterie ou de fromages en complément réduit d’autant le nombre de pièces.

## L’équilibre salé, sucré

Pour un cocktail dînatoire, visez environ **deux tiers de pièces salées et un tiers de sucrées**. Alternez les textures : du pain moelleux (mini burgers, navettes), du croustillant (sablés, toasts), du frais (verrines, wraps). Et prévoyez au moins une pièce végétarienne pour que chacun trouve son compte.

## Un exemple chiffré, sur notre carte 2027

Voici une composition de **12 pièces par personne** pour un cocktail dînatoire, avec les prix à la pièce de notre carte traiteur :

- 1 mini hamburger bœuf cheddar : 2 €
- 1 mini hamburger poulet césar : 2 €
- 1 mini hot dog : 2 €
- 2 wraps jambon fromage : 1,40 €
- 1 mini croque jambon : 1,50 €
- 1 mini focaccia mozzarella jambon cru : 1,50 €
- 1 verrine de saison : 1,50 €
- 1 toast de saison : 1,50 €
- 1 sablé parmesan : 1 €
- 2 macarons : 2,60 €

**Total : 17 € par personne**, soit 510 € pour 30 invités, hors service à table. Pour un apéritif de 5 pièces (mini hamburger, mini croque, verrine de saison, toast de saison, sablé parmesan), comptez 7,50 € par personne.

## Pièces ou plateaux ?

Les pièces individuelles sont idéales quand les invités circulent debout. Les plateaux à la personne conviennent quand il y a des tables ou un buffet :

- **plateau de charcuterie** : 6 € par personne ;
- **plateau de fromages** : 4,90 € par personne ;
- **plateau de légumes crus avec sa sauce** : 4 € par personne.

Une bonne formule pour un anniversaire de 30 personnes : 8 pièces par personne et un plateau de charcuterie au centre de la table.

## Et les boissons ?

Prévoyez de l’eau à volonté (plate et gazeuse) et un ou deux softs. Pour le vin ou les bulles, le repère courant est d’une bouteille pour trois à quatre personnes sur une soirée, à adapter à vos invités. Côté verres, voyez large : au fil d’une soirée, chacun en change plusieurs fois.

## Servir soi-même ou se faire servir ?

Pour une trentaine de personnes chez vous, des plateaux posés sur une table suffisent : chacun se sert. Au-delà, ou si vous voulez profiter de vos invités, l’option service à table change tout : l’équipe dresse le buffet et sert vos invités pendant que vous profitez de la réception.

## Les questions à se poser avant de commander

1. Le cocktail remplace-t-il le repas ?
2. Combien de temps dure la réception ?
3. Y a-t-il des tables pour poser un plateau ?
4. Des invités ont-ils un régime particulier ?
5. Souhaitez-vous qu’on assure le service ?

Avec ces cinq réponses, nous vous proposons une composition et un devis gratuit. Pensez à commander au moins une semaine avant la date.
```

**liens internes à placer à l’intégration:** « carte traiteur » → `/carte-traiteur#petit-dinatoire` · « cocktail dînatoire » (première occurrence) → `/traiteur-roanne/cocktail-dinatoire` · « devis gratuit » → `/contact?type=devis-traiteur`

---

### Article 3 · Plateau de charcuterie

**titre:** Plateau de charcuterie : comment le composer et le présenter

**slug:** `plateau-de-charcuterie-composer-presenter`

**titre_seo:** Plateau de charcuterie : composer et présenter | Roanne (55 car.)

**description_seo:** Quelles charcuteries choisir, combien de tranches par personne, comment dresser un plateau de charcuterie : les conseils d’une boucherie de Roanne. (147 car.)

**chapo:** Un bon plateau de charcuterie tient en trois règles : de la variété, les bonnes quantités, une présentation qui donne envie. Voici comment nous composons le nôtre, et comment dresser le vôtre à la maison.

**corps:**

```markdown
Le plateau de charcuterie est un classique de toutes les réceptions. Bien composé, il fait un apéritif généreux ou le cœur d’un buffet. Voici nos conseils de boucher et de traiteur.

## Varier les familles

Un plateau réussi mélange plusieurs familles de charcuterie, pour les goûts comme pour les textures :

- **Les jambons** : un jambon blanc moelleux, un jambon cru plus salé et plus sec.
- **Les saucissons et charcuteries sèches** : rosette, chorizo pour la note épicée.
- **Les terrines et pâtés** : une tranche de terrine apporte du fondant et de la couleur.

Pour les fêtes, on peut monter d’un cran : galantine de volaille, terrine de gibier, foie gras.

## Combien par personne ?

Notre repère est le plateau de charcuterie de notre carte traiteur, à **6 € par personne**. Il compte, pour chaque convive :

- ½ tranche de jambon blanc
- 1 tranche de jambon cru
- 3 tranches de rosette
- ½ tranche de terrine
- 2 tranches de chorizo

Cette quantité convient pour un apéritif ou en accompagnement d’un buffet. Si le plateau est le plat principal d’un repas froid, doublez les quantités ou ajoutez un plateau de fromages et des salades.

## Trancher au bon moment

La charcuterie se tranche le plus tard possible : elle sèche à l’air. Si vous préparez votre plateau vous-même, demandez au comptoir de trancher le jour même, et gardez les tranches au frais, filmées, jusqu’au dressage. Sortez le plateau du réfrigérateur un quart d’heure avant de servir : les arômes se libèrent à température ambiante.

## Dresser le plateau

1. **Choisissez un grand support** : planche en bois, plat en ardoise ou en céramique, ou un simple plateau recouvert de papier sulfurisé.
2. **Placez d’abord les grosses pièces** : la terrine en tranches, les jambons pliés en deux ou roulés.
3. **Faites des éventails** avec la rosette et le chorizo, en lignes ou en rosaces.
4. **Comblez les vides** avec les accompagnements : cornichons, petits oignons, quelques noix ou des raisins.
5. **Alternez les couleurs** : le rose du jambon à côté du rouge du chorizo, le blanc du gras de la rosette pour rythmer.

Un plateau bien rempli, sans espace vide, donne une impression de générosité, même avec des quantités raisonnables.

## Les accompagnements

- **Le pain** : une baguette tranchée, un pain de campagne, quelques gressins.
- **Le beurre** : demi-sel ou doux, pour le jambon cru et la rosette.
- **Les condiments** : cornichons, oignons grelots, moutarde à l’ancienne.
- **La fraîcheur** : un plateau de légumes crus (carotte, chou-fleur, tomate, brocoli et sa sauce) équilibre l’ensemble. Il est à 4 € par personne sur notre carte.

## Charcuterie et fromages, ensemble ou séparés ?

Les deux plateaux se marient bien sur une même table, mais gagnent à rester séparés : les fromages ne se servent pas avec les mêmes couverts et ne supportent pas la même durée hors du froid. Notre plateau de fromages (brie de Meaux, camembert, chèvre, comté) est à 4,90 € par personne.

## Les erreurs à éviter

- **Trancher trop tôt.** Une rosette tranchée la veille a perdu son moelleux et sa couleur.
- **Tout mélanger.** Rangez chaque charcuterie dans sa zone : les invités choisissent plus facilement, et le plateau reste lisible jusqu’à la fin.
- **Oublier les gras.** Le jambon cru et la rosette se dégustent avec leur gras : ne le retirez pas, c’est lui qui porte le goût.
- **Laisser le plateau des heures en plein soleil.** En extérieur, l’été, préférez deux petits plateaux servis l’un après l’autre plutôt qu’un grand qui reste dehors toute la soirée.
- **Sous-estimer le pain.** Comptez large : c’est souvent lui qui manque en premier.

## Faire ou faire faire ?

Pour six personnes, un plateau maison se prépare en vingt minutes avec une charcuterie tranchée au comptoir. À partir de quinze ou vingt convives, ou si vous voulez profiter de votre réception, commandez-le tout prêt : il est dressé, filmé, prêt à poser sur la table. Pensez à le commander une semaine avant.
```

**liens internes à placer à l’intégration:** « plateau de charcuterie de notre carte traiteur » → `/carte-traiteur#nos-formules` · « comptoir » → `/boucherie-roanne` · « commandez-le tout prêt » → `/contact?type=devis-traiteur`

---

### Article 4 · Volaille de fête

**titre:** Volaille de fête : bien la choisir et bien la cuire

**slug:** `volaille-de-fete-choisir-cuire`

**titre_seo:** Volaille de fête : choisir et cuire chapon, dinde, poularde (59 car.)

**description_seo:** Chapon, poularde, dinde, pintade ou poulet de Bresse : quel poids par personne, comment la cuire et la servir. Conseils de la boucherie Maison Cherblanc. (153 car.)

**chapo:** Chapon, poularde, dinde, pintade, poulet de Bresse, canard : chaque volaille de fête a son caractère et sa cuisson. Voici comment choisir la bonne pour votre tablée, puis la réussir au four.

**corps:**

```markdown
La volaille reste le plat central du repas de Noël dans beaucoup de familles. Encore faut-il choisir la bonne, au bon poids, et ne pas la dessécher au four. Voici nos repères de boucher.

## Quelle volaille pour quelle tablée ?

- **Le chapon** : un coq castré puis engraissé, à la chair fine et persillée de gras. C’est la volaille de fête par excellence pour une grande table.
- **La poularde** : une jeune poule engraissée avant la ponte. Chair tendre et moelleuse, un peu plus petite que le chapon.
- **La dinde** : la plus grande, pour les grandes familles. Sa chair est plus maigre et demande une cuisson attentive.
- **La pintade** : un goût plus prononcé, proche du gibier à plume, pour quatre ou cinq personnes.
- **Le poulet de Bresse** : la volaille de Bresse bénéficie d’une appellation d’origine protégée. Une chair ferme et goûteuse, pour une table de quatre à six.
- **Le canard ou la canette** : une chair rouge, pour changer des volailles blanches.
- **La caille** : une par personne en entrée, deux en plat.

## Quel poids prévoir ?

Le repère courant est de **300 à 400 g de volaille crue (os compris) par personne**, un peu plus si vous voulez des restes. À titre indicatif :

- 4 personnes : une volaille de 1,5 à 2 kg (pintade, poulet, canette)
- 6 à 8 personnes : 2,5 à 3 kg (poularde, petit chapon)
- 8 à 10 personnes : 3 à 4 kg (chapon)
- 10 personnes et plus : dinde

Au moment de la commande, donnez-nous le nombre de convives : nous vous orientons vers le bon poids.

## Les prix 2026 chez Maison Cherblanc

Pour les fêtes 2026, nos volailles sont vendues **uniquement sur commande, avant le 20 décembre** :

- Dinde fermière, poularde fermière, chapon fermier : 19,99 € le kg
- Poulet de Bresse : 26,99 € le kg
- Pintade fermière : 15,99 € le kg
- Canard ou canette : 18,99 € le kg
- Caille : 4,90 € pièce

## Avant la cuisson

1. **Sortez la volaille du réfrigérateur une heure avant** : elle cuira plus régulièrement.
2. **Préchauffez le four** à température moyenne (160 à 180 °C selon votre four).
3. **Assaisonnez l’intérieur et l’extérieur**, glissez éventuellement un peu de beurre sous la peau des filets.
4. **Si vous la farcissez**, ne la remplissez pas trop serré : la farce gonfle à la cuisson.

## Pendant la cuisson

- **Arrosez** la volaille avec son jus toutes les vingt à trente minutes.
- **Retournez-la** à mi-cuisson si elle est grosse, en commençant sur le côté puis sur le dos.
- **Couvrez d’une feuille de papier aluminium** si la peau colore trop vite.

Le temps de cuisson dépend du poids, de la volaille et de votre four. Le plus sûr est de vérifier la cuisson plutôt que de se fier à une durée.

## Comment savoir si c’est cuit ?

- **Le jus** : piquez le gras de la cuisse, à la jointure. Le jus qui s’écoule doit être clair, sans trace rosée.
- **Le thermomètre** : c’est la méthode la plus fiable. Au plus épais de la cuisse, sans toucher l’os, le repère courant est d’environ 75 °C.
- **La cuisse** : elle doit bouger facilement quand on la tire.

## Le repos, l’étape oubliée

Une fois cuite, laissez reposer la volaille **15 à 20 minutes** hors du four, couverte d’une feuille de papier aluminium. Les jus se répartissent dans la chair, qui reste moelleuse au découpage. Profitez-en pour déglacer le plat avec un peu d’eau ou de bouillon et préparer la sauce.

## Ce qui l’accompagne

Marrons et champignons persillés, gratin dauphinois, purée de butternut et noisettes, poêlée de légumes d’hiver : nos accompagnements de fêtes se commandent à la part, en même temps que la volaille.

Vous avez une question sur la cuisson de votre volaille ? Demandez au comptoir en venant la chercher : c’est aussi notre métier.
```

**liens internes à placer à l’intégration:** « uniquement sur commande » → `/menus-de-fetes` · « nos accompagnements de fêtes » → `/menus-de-fetes` · « comptoir » → `/boucherie-roanne`

---

## 16. Politique de confidentialité `/politique-de-confidentialite`

**title:** Politique de confidentialité | Maison Cherblanc, Roanne (55 car.)

**meta:** Comment Maison Cherblanc, boucherie et traiteur à Roanne, traite vos données : formulaire de contact, mesure d’audience sans cookie, durées et vos droits. (154 car.)

**H1:** Politique de confidentialité

**dernière mise à jour:** {date de mise en ligne}

**chapô:** Cette page explique simplement quelles données personnelles le site maisoncherblanc.fr collecte, pourquoi, combien de temps, et comment exercer vos droits. Elle répond à l’article 13 du Règlement général sur la protection des données (RGPD).

### H2 : Qui est responsable de vos données ?

Le responsable du traitement est :

Maison Cherblanc, société à responsabilité limitée au capital de 5 000 €
55 rue Mulsant, 42300 Roanne
RCS Roanne 977 639 780
Téléphone : 04 77 71 16 11
E-mail : contact@maisoncherblanc.fr

Maison Cherblanc n’a pas désigné de délégué à la protection des données, cette désignation n’étant pas obligatoire pour son activité. Pour toute question sur vos données, écrivez à contact@maisoncherblanc.fr.

### H2 : Ce que nous collectons, et pourquoi

#### H3 : Le formulaire de contact et de devis

**Données collectées :** type de demande, prénom, nom, adresse e-mail, numéro de téléphone, date de l’événement et nombre de personnes (si vous les indiquez), contenu de votre message, date d’envoi.

**Finalité :** répondre à votre demande (question, commande à la boucherie, demande de devis traiteur) et, le cas échéant, préparer votre commande.

**Base légale :** l’exécution de mesures précontractuelles prises à votre demande lorsque vous demandez un devis ou passez commande (article 6.1.b du RGPD) ; notre intérêt légitime à répondre aux personnes qui nous écrivent pour toute autre question (article 6.1.f).

**Durée de conservation :** 12 mois à compter de la réception du message, puis suppression automatique. Si votre demande aboutit à une commande, les informations nécessaires à la facturation sont conservées le temps imposé par la loi (10 ans pour les pièces comptables).

**Destinataires :** uniquement les personnes de Maison Cherblanc chargées de répondre aux demandes. Vos données ne sont ni vendues, ni louées, ni utilisées pour de la prospection commerciale.

**Notification par e-mail :** lorsque vous envoyez le formulaire, une copie de votre message nous est transmise par e-mail via le service Brevo (Sendinblue SAS, France), qui agit comme sous-traitant pour le seul envoi de ce message.

> Paragraphe à afficher uniquement si `BREVO_API_KEY` est configurée en production. Sans Brevo, supprimer ce paragraphe : les messages sont seulement stockés sur le serveur du site. [À VÉRIFIER par l’agence] adresse du siège de Brevo et localisation de l’hébergement des données dans le contrat Brevo, pour compléter la phrase si besoin.

#### H3 : La mesure d’audience

Pour savoir quelles pages sont consultées, le site utilise un compteur interne qui enregistre uniquement, pour chaque jour, l’adresse de la page vue et le nombre de visites qu’elle a reçues.

Ce compteur ne dépose aucun cookie, ne lit rien sur votre appareil, n’enregistre pas votre adresse IP et ne permet ni de vous identifier, ni de suivre votre navigation d’une page à l’autre.

**Base légale :** notre intérêt légitime à mesurer la fréquentation du site pour l’améliorer (article 6.1.f). Aucune donnée permettant de vous identifier n’étant collectée, aucun bandeau de consentement n’est nécessaire.

#### H3 : Les comptes administrateurs

L’espace d’administration du site est réservé à l’équipe de Maison Cherblanc et à son prestataire technique.

**Données collectées :** nom, adresse e-mail, mot de passe (stocké uniquement sous forme chiffrée et irréversible), cookie de session.

**Finalité :** sécuriser l’accès à l’administration du site.

**Base légale :** intérêt légitime à protéger le site (article 6.1.f).

**Durée de conservation :** tant que le compte est actif.

Le cookie de session n’est déposé que sur l’appareil d’un administrateur connecté. Il est strictement nécessaire au fonctionnement de l’administration et n’est pas soumis au consentement.

#### H3 : Les journaux techniques du serveur

Comme tout site web, le serveur peut enregistrer des journaux techniques (adresse IP, date et heure, page demandée, navigateur) pour assurer la sécurité et le bon fonctionnement du site. Ces journaux sont conservés [À COMPLÉTER par l’agence : durée, 12 mois au maximum] et ne servent à aucune autre fin.

**Base légale :** intérêt légitime à sécuriser le site (article 6.1.f).

### H2 : Cookies et traceurs

Le site public de Maison Cherblanc ne dépose **aucun cookie** de mesure d’audience, de publicité ou de réseau social. Il ne charge **aucun traceur tiers** et **aucun contenu intégré** : pas de carte Google Maps, pas de vidéo YouTube, pas de module Facebook ou Instagram dans les pages. Les polices de caractères sont hébergées sur le serveur du site.

Les liens vers Google Maps, Facebook ou Instagram sont de simples liens : ces services ne reçoivent aucune donnée tant que vous ne cliquez pas. Une fois sur leur site, c’est leur propre politique qui s’applique.

### H2 : Hébergement et sécurité

Le site est hébergé par : [À COMPLÉTER par l’agence : nom, adresse, téléphone de l’hébergeur, pays du centre de données].

L’hébergeur agit comme sous-traitant de Maison Cherblanc au sens de l’article 28 du RGPD. Les données sont protégées par des mesures adaptées : connexion chiffrée (HTTPS), mots de passe chiffrés, accès à l’administration restreint, suppression automatique des messages après 12 mois.

[À COMPLÉTER : si le centre de données est dans l’Union européenne, indiquer « Aucune donnée n’est transférée hors de l’Union européenne. » ; sinon préciser le transfert et ses garanties.]

### H2 : Vos droits

Vous disposez sur vos données des droits suivants :

- **Accès** : savoir quelles données nous détenons sur vous.
- **Rectification** : corriger des données inexactes.
- **Effacement** : demander la suppression de vos données.
- **Limitation** : geler temporairement l’utilisation de vos données.
- **Opposition** : vous opposer à un traitement fondé sur notre intérêt légitime.
- **Portabilité** : récupérer les données que vous nous avez fournies, dans un format lisible.
- **Directives post-mortem** : définir le sort de vos données après votre décès.

Pour exercer ces droits, écrivez à contact@maisoncherblanc.fr ou par courrier à Maison Cherblanc, 55 rue Mulsant, 42300 Roanne. Nous vous répondons dans un délai d’un mois. Une pièce d’identité pourra vous être demandée en cas de doute raisonnable sur votre identité.

### H2 : Réclamation

Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la Commission nationale de l’informatique et des libertés (CNIL) : 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, ou en ligne sur www.cnil.fr.

### H2 : Modifications

Cette politique peut évoluer, notamment si le site ajoute de nouvelles fonctionnalités. La date de dernière mise à jour figure en haut de la page.

---

## 17. Mentions légales `/mentions-legales`

**title:** Mentions légales | Maison Cherblanc, Roanne (43 car.)

**meta:** Mentions légales du site de Maison Cherblanc, boucherie, charcuterie et traiteur à Roanne : éditeur, directeur de la publication, hébergeur, crédits. (149 car.)

**H1:** Mentions légales

**chapô:** Informations prévues par l’article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique (LCEN).

### H2 : Éditeur du site

Le site maisoncherblanc.fr est édité par :

**Maison Cherblanc**
Société à responsabilité limitée (SARL) au capital de 5 000 €
Siège social : 55 rue Mulsant, 42300 Roanne
RCS Roanne 977 639 780
SIRET : 977 639 780 00013
N° de TVA intracommunautaire : FR95977639780
Téléphone : 04 77 71 16 11
E-mail : contact@maisoncherblanc.fr

### H2 : Directeur de la publication

Thibaut Cherblanc, gérant.

> [À VALIDER] (question n° 1) Orthographe du prénom, et choix du directeur de la publication (l’un des deux gérants : Thibaut Cherblanc ou Emilie Viallon).

### H2 : Hébergeur

[À COMPLÉTER par l’agence : dénomination, adresse, téléphone de l’hébergeur du serveur.]

### H2 : Conception et réalisation

Agence Voilà Voilà.

### H2 : Crédits photographiques

Photographies : Maison Cherblanc. Certains visuels d’illustration provisoires ont été générés par intelligence artificielle et seront remplacés par des photographies de la maison.

> Retirer la seconde phrase quand plus aucun média `provisoire` n’est publié.

### H2 : Propriété intellectuelle

L’ensemble des contenus du site (textes, photographies, logo, cartes et menus) est la propriété de Maison Cherblanc ou de ses partenaires. Toute reproduction, même partielle, sans autorisation écrite préalable est interdite.

### H2 : Prix et commandes

Les prix affichés sur le site sont indiqués en euros, toutes taxes comprises, et correspondent aux cartes en vigueur aux dates indiquées. Ils sont donnés à titre d’information : seuls le devis et la confirmation de commande engagent les deux parties.

### H2 : Médiation de la consommation

Conformément aux articles L. 612-1 et suivants du Code de la consommation, en cas de litige non résolu avec nous, vous pouvez recourir gratuitement au médiateur de la consommation suivant : [À COMPLÉTER PAR LE CLIENT : nom, adresse et site du médiateur auquel Maison Cherblanc adhère].

### H2 : Données personnelles et cookies

Le traitement de vos données et l’absence de cookies de mesure d’audience sont décrits dans la [politique de confidentialité](/politique-de-confidentialite).

### H2 : Droit applicable

Le présent site et ses mentions légales sont soumis au droit français.

### Informations à obtenir pour finaliser les pages légales

| Information | Statut | Source ou action |
|---|---|---|
| Dénomination, forme, capital, siège, RCS, SIRET, TVA | **Trouvé** | BODACC et API Recherche d’entreprises (voir sources) ; à faire relire par le client |
| Orthographe du gérant, choix du directeur de la publication | À confirmer | Client (question n° 1) |
| E-mail de contact public | À confirmer | Client (question n° 21) |
| Hébergeur : nom, adresse, téléphone, pays du centre de données | Manquant | Agence |
| Durée de conservation des journaux du serveur | Manquant | Agence |
| Utilisation de Brevo en production, localisation des données | À confirmer | Agence |
| Médiateur de la consommation | Manquant | Client (question n° 27) |
| Mention allergènes | Manquant | Client (question n° 11) |
| Conditions de réservation traiteur (acompte, annulation), si le client veut des CGV | Manquant | Client (question n° 13) |

---

## 18. Récapitulatif SEO : title et meta

| Page | Balise | Texte (longueur) |
|---|---|---|
| Accueil `/` | title | Boucherie, charcuterie, traiteur à Roanne \| Maison Cherblanc (60 car.) |
| Accueil `/` | meta | Maison Cherblanc, 55 rue Mulsant à Roanne : boucherie, charcuterie et traiteur. Viandes, volailles, plateaux, buffets et mariages. Devis gratuit. (145 car.) |
| La boucherie `/boucherie-roanne` | title | Boucherie à Roanne, rue Mulsant \| Maison Cherblanc (50 car.) |
| La boucherie `/boucherie-roanne` | meta | Boucherie-charcuterie à Roanne, 55 rue Mulsant : bœuf, veau, porc, volailles et charcuterie. Ouvert du mardi au dimanche matin. Conseils au comptoir. (149 car.) |
| Le traiteur `/traiteur-roanne` | title | Traiteur à Roanne : buffets, cocktails, mariages \| Cherblanc (60 car.) |
| Le traiteur `/traiteur-roanne` | meta | Traiteur à Roanne : plateaux, plats cuisinés, cocktails dînatoires, buffets et mariages. Carte et prix en ligne, service à table en option, devis gratuit. (154 car.) |
| Traiteur mariage `/traiteur-roanne/mariage` | title | Traiteur mariage à Roanne \| Maison Cherblanc (44 car.) |
| Traiteur mariage `/traiteur-roanne/mariage` | meta | Traiteur mariage à Roanne et dans le Roannais : vin d’honneur, buffet ou repas servi, fromages, pièce montée et macarons. Service à table, devis gratuit. (153 car.) |
| Cocktail dînatoire et buffets `/traiteur-roanne/cocktail-dinatoire` | title | Cocktail dînatoire à Roanne, buffets \| Maison Cherblanc (55 car.) |
| Cocktail dînatoire et buffets `/traiteur-roanne/cocktail-dinatoire` | meta | Cocktail dînatoire et buffets à Roanne : mini burgers, wraps, verrines, plateaux de charcuterie et de fromages. Prix à la pièce, commande 1 semaine avant. (154 car.) |
| Broche et barbecue `/traiteur-roanne/broche-barbecue` | title | Jambon à la broche et barbecue à Roanne \| Maison Cherblanc (58 car.) |
| Broche et barbecue `/traiteur-roanne/broche-barbecue` | meta | Jambon à la broche et côtes de bœuf au barbecue pour vos réceptions à Roanne : rôtissoire installée sur place, cuisson devant vos invités. Devis gratuit. (153 car.) |
| Carte traiteur `/carte-traiteur` | title | Carte traiteur à Roanne, prix 2027 \| Maison Cherblanc (53 car.) |
| Carte traiteur `/carte-traiteur` | meta | Carte traiteur 2027 de Maison Cherblanc à Roanne : plateaux par personne, formule du chef à 14 €, plats cuisinés à la part, petit dînatoire. PDF en ligne. (154 car.) |
| Menus de fêtes `/menus-de-fetes` | title (en saison, suit le titre du menu en base) | Traiteur Noël à Roanne, menus de fêtes 2026 \| Cherblanc (55 car.) |
| Menus de fêtes `/menus-de-fetes` | meta (en saison) | Menus de fêtes 2026 de Maison Cherblanc à Roanne : foie gras, plats cuisinés, volailles fermières sur commande. Commandes avant le 20 décembre pour Noël. (153 car.) |
| Menus de fêtes `/menus-de-fetes` | title (hors saison) | Menus de fêtes à Roanne \| Maison Cherblanc (42 car.) |
| Menus de fêtes `/menus-de-fetes` | meta (hors saison) | Menus de fêtes de Maison Cherblanc, boucherie et traiteur à Roanne : Noël, jour de l’An et autres saisons. Les prochains menus sont publiés ici. (144 car.) |
| Réalisations `/realisations` | title | Réalisations traiteur à Roanne, en photos \| Maison Cherblanc (60 car.) |
| Réalisations `/realisations` | meta | Mariages, cocktails, buffets, plateaux et jambons à la broche : quelques réceptions préparées par Maison Cherblanc, traiteur et boucherie à Roanne. (147 car.) |
| La maison `/la-maison` | title | La maison : boucherie et traiteur rue Mulsant \| Cherblanc (57 car.) |
| La maison `/la-maison` | meta | Maison Cherblanc, boucherie, charcuterie et traiteur au 55 rue Mulsant à Roanne depuis 2023 : qui nous sommes, comment nous travaillons, l’équipe. (146 car.) |
| Actualités `/actualites` | title | Actualités et conseils \| Maison Cherblanc, Roanne (49 car.) |
| Actualités `/actualites` | meta | Actualités de Maison Cherblanc, boucherie et traiteur à Roanne : commandes de fêtes, conseils de cuisson, quantités pour vos réceptions, nouveautés. (148 car.) |
| Contact `/contact` | title | Contact, horaires et devis traiteur à Roanne \| Cherblanc (56 car.) |
| Contact `/contact` | meta | Maison Cherblanc, 55 rue Mulsant, 42300 Roanne. Tél. 04 77 71 16 11. Horaires de la boucherie, demande de devis traiteur gratuit et commandes en ligne. (151 car.) |
| Article 1 · Commandes de fêtes 2026 | titre_seo | Commandes de fêtes 2026 à Roanne : dates et horaires (52 car.) |
| Article 1 · Commandes de fêtes 2026 | description_seo | Noël et jour de l’An 2026 chez Maison Cherblanc à Roanne : dates limites de commande, ouvertures exceptionnelles, menus de fêtes et volailles fermières. (152 car.) |
| Article 2 · Cocktail dînatoire, combien prévoir | titre_seo | Cocktail dînatoire : combien de pièces par personne ? (53 car.) |
| Article 2 · Cocktail dînatoire, combien prévoir | description_seo | Combien de pièces prévoir pour un cocktail dînatoire ou un apéritif ? Repères par personne, équilibre salé-sucré, exemple chiffré d’un traiteur de Roanne. (154 car.) |
| Article 3 · Plateau de charcuterie | titre_seo | Plateau de charcuterie : composer et présenter \| Roanne (55 car.) |
| Article 3 · Plateau de charcuterie | description_seo | Quelles charcuteries choisir, combien de tranches par personne, comment dresser un plateau de charcuterie : les conseils d’une boucherie de Roanne. (147 car.) |
| Article 4 · Volaille de fête | titre_seo | Volaille de fête : choisir et cuire chapon, dinde, poularde (59 car.) |
| Article 4 · Volaille de fête | description_seo | Chapon, poularde, dinde, pintade ou poulet de Bresse : quel poids par personne, comment la cuire et la servir. Conseils de la boucherie Maison Cherblanc. (153 car.) |
| Politique de confidentialité `/politique-de-confidentialite` | title | Politique de confidentialité \| Maison Cherblanc, Roanne (55 car.) |
| Politique de confidentialité `/politique-de-confidentialite` | meta | Comment Maison Cherblanc, boucherie et traiteur à Roanne, traite vos données : formulaire de contact, mesure d’audience sans cookie, durées et vos droits. (154 car.) |
| Mentions légales `/mentions-legales` | title | Mentions légales \| Maison Cherblanc, Roanne (43 car.) |
| Mentions légales `/mentions-legales` | meta | Mentions légales du site de Maison Cherblanc, boucherie, charcuterie et traiteur à Roanne : éditeur, directeur de la publication, hébergeur, crédits. (149 car.) |

---

## 19. Questions au client

Les numéros sont ceux cités dans les notes [À VALIDER] des pages. Les questions **en gras** sont prioritaires : leurs réponses enrichissent directement les pages piliers ou conditionnent la mise en ligne.

1. **Orthographe du prénom du gérant** : le registre du commerce écrit « Thibaut Cherblanc », le cahier des charges « Thibault ». Laquelle est la bonne ? Qui sera directeur de la publication (Thibaut Cherblanc ou Emilie Viallon) ?
2. **Provenance des viandes** : races (charolaise, autre ?), régions ou départements d’élevage, éleveurs ou abattoirs partenaires que vous acceptez de citer, labels (Label Rouge, bio, etc.). En 2020, l’ancienne Boucherie Viallon et Filles annonçait de la viande charolaise et des volailles fermières : est-ce toujours le cas chez vous ?
3. **Charcuterie maison** : quelles charcuteries fabriquez-vous vous-mêmes (terrines, jambon blanc, galantines, boudins blancs, saucisses…) ? Une démarche particulière (sans colorant, sans conservateur, recettes maison) ?
4. **Fumoir** : avez-vous un fumoir ? Fumez-vous des produits vous-mêmes (jambon, lard, saucisses) ? Les photos nommées « fumoir » montrent une rôtissoire mobile.
5. Vendez-vous des **fromages et des produits d’épicerie fine** au détail en boutique ?
6. **Zone d’intervention du traiteur** : jusqu’où vous déplacez-vous (kilomètres ou communes) ?
7. **Livraison** : livrez-vous la boucherie et/ou le traiteur ? Si oui, où, à partir de quel montant, à quel prix, quels jours ?
8. **Service à table** : que comprend l’option (nombre de serveurs, durée, mise en place, débarrassage) ? Un tarif indicatif peut-il être publié ?
9. Stationnement près de la boutique, accessibilité de l’entrée (marche, rampe) ?
10. Matériel : fournissez-vous vaisselle, nappage, mobilier, plats de service ? Reprise et nettoyage ?
11. **Allergènes** : comment informez-vous vos clients (affichage en boutique, liste sur demande) ? La mention est obligatoire.
12. Les **prix de la carte 2026** sont-ils identiques à ceux de la carte 2027 ? Sinon, quels prix afficher d’ici le 31 décembre ?
13. Mariages : proposez-vous une dégustation ? Acompte, conditions d’annulation, date limite pour ajuster le nombre d’invités ? Nombre maximum de convives que vous pouvez servir ?
14. Les **bars à thème** (bar à bière, tiki bar, bar à limonades) visibles sur les photos sont-ils une prestation Maison Cherblanc, un partenaire, ou le décor d’une salle ?
15. Animations broche et barbecue : la rôtissoire est-elle à vous ou louée ? Énergie nécessaire sur place (électricité, gaz) ? Nombre minimum de convives ? Autres viandes proposées ? Faites-vous le **cochon à la broche** ?
16. Fêtes 2026 : quels sont les horaires des jours non mentionnés sur la carte (mardi 22, mercredi 23, samedi 26, mardi 29, mercredi 30 décembre, samedi 2 janvier) ?
17. Les mariés dont les prénoms et la date figurent sur la pièce montée et le gâteau (photos) ont-ils donné leur accord pour une publication ?
18. Souhaitez-vous mentionner sur le site la reprise de la Boucherie Viallon et Filles (même adresse, même téléphone) ? C’est utile pour les clients qui cherchent encore l’ancien nom.
19. Parcours de Thibaut Cherblanc et d’Emilie Viallon (formation, expériences) : acceptez-vous d’en dire quelques lignes sur la page « La maison » ?
20. Membres de l’équipe d’accord pour être nommés (prénom, rôle) sous les photos ?
21. **E-mail public** : la carte 2027 indique boucheriecherblanc@gmail.com, le site prévoit contact@maisoncherblanc.fr. Laquelle afficher ? (Conseil : l’adresse du domaine, puis l’harmoniser sur les prochains imprimés.)
22. **Réseaux sociaux** : la page Facebook officielle est-elle bien facebook.com/profile.php?id=100094509101001 (« Maison Cherblanc | Roanne ») ? Le compte Instagram @maisoncherblanc (1 publication) est-il le vôtre ?
23. **Fiche Google** : avez-vous une fiche Google Business Profile ? Qui y a accès ? Sinon, nous la créons.
24. Le registre affiche encore le nom commercial « Boucherie Viallon et Filles » : êtes-vous d’accord pour faire la modification au guichet unique (INPI) ?
25. **Photos à produire** : façade, comptoir, vitrine de viandes, volailles, charcuterie tranchée, équipe en boutique. Aucune photo réelle de la boutique n’existe aujourd’hui.
26. Avis clients que vous acceptez de publier (texte, prénom, date, avec l’accord des auteurs).
27. **Médiateur de la consommation** auquel vous adhérez (obligatoire pour la vente aux particuliers).
28. Distinctions, titre d’artisan ou de maître artisan, adhésion à une organisation professionnelle : y en a-t-il à afficher ?
29. Menus d’autres saisons (Pâques, été, fête des pères…) prévus en 2027 ?
30. Moyens de paiement acceptés (utile pour la FAQ et les données structurées).

---

## 20. Sources consultées (26 octobre 2026)

**Documents du client**
- Carte traiteur 2027 imprimée : `seed-medias/menus/carte-traiteur-2027.txt` et `seed-medias/documents/carte-traiteur-2027-maison-cherblanc.pdf` (horaires, téléphones, e-mail imprimé, conditions, prix).
- Menu de fêtes 2026 : `seed-medias/menus/menu-fetes-2026.txt` et `seed-medias/documents/menu-fetes-2026-maison-cherblanc.pdf` (dates, horaires exceptionnels, menus, prix).
- Photos réelles : `seed-medias/photos/` (46 fichiers, examinés un par un).
- `docs/CONTRAT.md`, `docs/DA.md`.

**Registres officiels**
- API Recherche d’entreprises (données Sirene et RNE) : https://recherche-entreprises.api.gouv.fr/search?q=977639780 (SIREN, SIRET, NAF, date de création, gérants, nom commercial, TVA).
- Fiche du prédécesseur : https://recherche-entreprises.api.gouv.fr/search?q=851337618 (Boucherie Viallon et Filles, créée le 01/06/2019, fermée le 03/01/2024).
- BODACC, annonces commerciales (open data DILA) : https://bodacc-datadila.opendatasoft.com/explore/dataset/annonces-commerciales/ , requête sur le RCS 977 639 780 : avis de création du 27/07/2023 (SARL, capital 5 000 €, gérants), avis de vente du 24/08/2023 (achat du fonds du 55 rue Mulsant, acte du 09/08/2023), avis de modification du 01/09/2023 (activité « boucherie, charcuterie et traiteur, épicerie fine »), dépôts des comptes 2025 et 2026.
- Annuaire des entreprises : https://annuaire-entreprises.data.gouv.fr/entreprise/977639780 (page non lisible par l’outil, données identiques via l’API).
- Societe.com : https://www.societe.com/societe/maison-cherblanc-977639780.html (recoupement capital, TVA, gérants depuis le 27/07/2023).
- Pappers : https://www.pappers.fr/entreprise/maison-cherblanc-977639780 et https://www.pappers.fr/entreprise/boucherie-viallon-et-filles-851337618 (recoupement via résultats de recherche).

**Présence en ligne de Maison Cherblanc**
- Facebook : https://www.facebook.com/profile.php?id=100094509101001 (titre « Maison Cherblanc | Roanne »), https://www.facebook.com/maisoncherblanc (non vérifiable).
- Instagram : https://www.instagram.com/maisoncherblanc/
- Annuaire villepratique.fr : https://www.villepratique.fr/boucheries/roanne-42300/maison-cherblanc
- Le Bruit Qui Court en Roannais, 27/11/2020 (prédécesseur) : http://lebruitquicourtenroannais.fr/2020/11/27/boucherie-charcuterie-viallon-et-filles-traiteur-plat-cuisine-rotisserie-triperie/
- Alentoor (prédécesseur) : https://www.alentoor.fr/roanne/alimentation/boucherie/137920-boucherie-viallon-et-filles
- maisoncherblanc.fr : aucune réponse (pas de site en ligne).

**Concurrence et pages de résultats**
- Boucheries : https://michel-gouttenoire.com/ · https://www.maison-grisard.com/ · https://www.traiteur-demont-loire42.fr/ · https://www.traiteur-demont-loire42.fr/traiteur.php · https://www.boucherie-seonvial.fr/nos-menus-fetes · https://boucheriebourg.fr/ · https://www.boucherie-roanne.fr/
- Traiteurs : https://maisongrange42.fr/traiteur-roanne/ · https://maisongrange42.fr/traiteur-mariage-evenements-familiaux-roanne/ · https://arnaud-chefalyon.fr/traiteur-roanne/ · https://pierremazuy.fr/fr/page/traiteur-mariage/roanne · https://www.lestabliersrouges.fr/traiteur-mariage-roanne/
- Annuaires : https://www.pagesjaunes.fr/annuaire/roanne-42/cocktail-dinatoire · https://www.laptiteboucherie.fr/boucheries/42187-roanne/ · https://www.annuaire-roanne.com/activite/boucherie-roanne/ · https://www.mariages.net/traiteur-mariage/loire/roanne · https://www.mariagepresta.fr/roanne/cat/traiteur · https://www.1001traiteurs.com/traiteur-2-roanne-v.html · https://www.evenementielpourtous.com/mariage/traiteur-pour-mariage/auvergne-rhone-alpes/loire/roanne-42187 · https://fr.gaultmillau.com/fr/auvergne-rhone-alpes/loire/roanne/traiteurs

> Limite de la recherche : les pages de résultats Google n’ont pas pu être relevées directement (outil de recherche différent de Google, sans géolocalisation). La synthèse de la section 0.1 s’appuie sur les résultats obtenus et les sites concurrents consultés ; à recouper avec un relevé de position réel (Search Console ou outil de suivi) un mois après la mise en ligne.
