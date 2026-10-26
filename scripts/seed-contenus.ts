/**
 * Amorçage des CONTENUS éditoriaux (appelé par scripts/seed.ts, après les médias).
 *
 * 1. Les 4 actualités de lancement de docs/COPY.md section 15 : statut publié,
 *    dates échelonnées sur les trois semaines précédant le 26/10/2026 (heure de
 *    Paris), couverture prise parmi les médias importés (clé `source`), title
 *    et meta SEO de COPY.md, liens internes « à placer à l'intégration » posés
 *    dans le Markdown. IDEMPOTENT PAR SLUG : un article déjà présent (même
 *    modifié ou dépublié dans le BO) n'est jamais recréé ni écrasé.
 * 2. Emplacement `contact-boutique` : aucune photo réelle de la boutique
 *    n'existe (COPY.md, question n° 25). Rempli, s'il est vide, par une nature
 *    morte du savoir-faire (billot, couteau, balance), visuel provisoire qui ne
 *    se fait pas passer pour la boutique ; à remplacer par une photo de la façade.
 *    Les emplacements `broche-hero` et `maison-hero` sont remplis par
 *    seed-medias/photos/manifest.json (vraies photos).
 */

type ArticleSeed = {
  slug: string;
  titre: string;
  chapo: string;
  titre_seo: string;
  description_seo: string;
  /** Clé `source` du média de couverture (« dossier/fichier »). */
  couverture: string;
  /** Date de publication, heure de Paris (AAAA-MM-JJTHH:MM). */
  publieLe: string;
  corps: string;
};

export const ARTICLES_LANCEMENT: ArticleSeed[] = [
  {
    slug: "commandes-de-fetes-2026-roanne",
    titre: "Commandes de fêtes 2026 à Roanne : dates, horaires et conseils",
    chapo: "Pour Noël, les commandes se passent avant le dimanche 20 décembre, et pour le jour de l’An avant le jeudi 24 décembre. Voici toutes les dates, les horaires d’ouverture des fêtes et nos conseils pour commander sereinement.",
    titre_seo: "Commandes de fêtes 2026 à Roanne : dates et horaires",
    description_seo: "Noël et jour de l’An 2026 chez Maison Cherblanc à Roanne : dates limites de commande, ouvertures exceptionnelles, menus de fêtes et volailles fermières.",
    couverture: "ia/table-de-fete-foie-gras-volaille-rotie-traiteur-roanne.jpg",
    publieLe: "2026-10-23T09:00",
    corps: `Les fêtes de fin d’année sont la période la plus chargée de la boutique. Pour que votre commande soit prête à l’heure, sans attente, voici tout ce qu’il faut savoir sur les fêtes 2026 chez Maison Cherblanc, au 55 rue Mulsant à Roanne.

## Les dates limites de commande

- **Pour Noël** : commandez avant le **dimanche 20 décembre 2026**.
- **Pour le jour de l’An** : commandez avant le **jeudi 24 décembre 2026**.
- **Volailles de fête** : uniquement sur commande, **avant le 20 décembre**.

Vous pouvez commander au comptoir, par téléphone au 04 77 71 16 11 ou au 06 22 22 49 68, ou en nous écrivant depuis la [page contact](/contact) du site.

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

Tous les prix sont sur la page **[Menus de fêtes](/menus-de-fetes)** du site.

## Les volailles, uniquement sur commande

Dinde fermière, poularde fermière et chapon fermier à 19,99 € le kilo, poulet de Bresse à 26,99 € le kilo, pintade fermière à 15,99 € le kilo, canard ou canette à 18,99 € le kilo, caille à 4,90 € pièce. Les [volailles](/actualites/volaille-de-fete-choisir-cuire) ne sont vendues **que sur commande, avant le 20 décembre** : n’attendez pas la dernière semaine.

## Le petit dînatoire de Noël

Pour l’apéritif du réveillon : mini hamburger au foie gras et oignon confit (3 € pièce), mini hamburger bœuf cheddar (2 €), mini hot-dog (2 €), navette au saumon fumé (3 €), cuillère de saumon au tartare (3 €) et trio de verrines de Noël (9 € les trois).

## Nos conseils pour une commande sans stress

1. **Commandez tôt.** Les dates limites sont des dates limites, pas des dates conseillées. Les premières commandes sont aussi celles qui ont le plus de choix, surtout pour les volailles.
2. **Comptez vos convives, enfants compris.** Indiquez-nous le nombre exact de personnes : nous vous aidons à ajuster les quantités, notamment pour le poids d’une volaille.
3. **Notez votre jour et votre heure de retrait.** Les 24 et 31 décembre, les commandes sont à récupérer avant 17h.
4. **Prévoyez la place au réfrigérateur.** Une volaille de 3 à 4 kilos, un foie gras et quelques plats cuisinés prennent vite toute une étagère.
5. **Pensez au lendemain.** Le 25 décembre et le 1er janvier, la boutique est fermée.

Pour toute question, appelez la boutique : nous sommes là pour vous aider à composer un repas de fêtes à la mesure de votre tablée.`,
  },
  {
    slug: "cocktail-dinatoire-combien-de-pieces-par-personne",
    titre: "Cocktail dînatoire : combien de pièces prévoir par personne ?",
    chapo: "Quatre à six pièces pour un apéritif, douze à quinze pour un cocktail dînatoire qui remplace le dîner : voici les repères que nous utilisons pour vous conseiller, et un exemple chiffré à partir de notre carte.",
    titre_seo: "Cocktail dînatoire : combien de pièces par personne ?",
    description_seo: "Combien de pièces prévoir pour un cocktail dînatoire ou un apéritif ? Repères par personne, équilibre salé-sucré, exemple chiffré d’un traiteur de Roanne.",
    couverture: "photos/buffet-cocktail-crevettes-wraps-traiteur-roanne.jpg",
    publieLe: "2026-10-13T09:00",
    corps: `C’est la question que l’on nous pose le plus souvent au moment d’un devis : « Combien faut-il prévoir par personne ? » Trop peu, et vos invités repartent avec la faim. Trop, et vous finissez la semaine avec des mini burgers. Voici nos repères.

## D’abord, quel type de réception ?

Tout dépend du rôle que joue le cocktail dans votre soirée.

- **Un apéritif avant un repas** : vos invités passeront ensuite à table. Comptez **4 à 6 pièces par personne**.
- **Un vin d’honneur** (mariage, inauguration) : souvent en fin d’après-midi, avant un dîner pour une partie des invités seulement. Comptez **6 à 10 pièces par personne**.
- **Un [cocktail dînatoire](/traiteur-roanne/cocktail-dinatoire)** : il remplace le repas. Comptez **12 à 15 pièces par personne**, un peu plus si la soirée dure longtemps.

Ces repères sont des usages courants chez les traiteurs. Nous les ajustons ensuite à votre public et à votre horaire.

## Les facteurs qui font varier les quantités

- **L’heure.** Un cocktail à 19h, à l’heure du dîner, appelle plus de pièces qu’un cocktail à 17h.
- **La durée.** Au-delà de trois heures, prévoyez une ou deux pièces de plus par personne, ou un plateau en relais.
- **Le public.** Une équipe sportive ou une tablée de jeunes adultes ne mange pas comme un pot de départ en milieu d’après-midi.
- **Les plateaux.** Un plateau de charcuterie ou de fromages en complément réduit d’autant le nombre de pièces.

## L’équilibre salé, sucré

Pour un cocktail dînatoire, visez environ **deux tiers de pièces salées et un tiers de sucrées**. Alternez les textures : du pain moelleux (mini burgers, navettes), du croustillant (sablés, toasts), du frais (verrines, wraps). Et prévoyez au moins une pièce végétarienne pour que chacun trouve son compte.

## Un exemple chiffré, sur notre carte 2027

Voici une composition de **12 pièces par personne** pour un cocktail dînatoire, avec les prix à la pièce de notre [carte traiteur](/carte-traiteur#petit-dinatoire) :

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

Avec ces cinq réponses, nous vous proposons une composition et un [devis gratuit](/contact?type=devis-traiteur). Pensez à commander au moins une semaine avant la date.`,
  },
  {
    slug: "plateau-de-charcuterie-composer-presenter",
    titre: "Plateau de charcuterie : comment le composer et le présenter",
    chapo: "Un bon plateau de charcuterie tient en trois règles : de la variété, les bonnes quantités, une présentation qui donne envie. Voici comment nous composons le nôtre, et comment dresser le vôtre à la maison.",
    titre_seo: "Plateau de charcuterie : composer et présenter | Roanne",
    description_seo: "Quelles charcuteries choisir, combien de tranches par personne, comment dresser un plateau de charcuterie : les conseils d’une boucherie de Roanne.",
    couverture: "photos/plateau-charcuterie-fromages-traiteur-maison-cherblanc-roanne.jpg",
    publieLe: "2026-10-06T09:00",
    corps: `Le plateau de charcuterie est un classique de toutes les réceptions. Bien composé, il fait un apéritif généreux ou le cœur d’un buffet. Voici nos conseils de boucher et de traiteur.

## Varier les familles

Un plateau réussi mélange plusieurs familles de charcuterie, pour les goûts comme pour les textures :

- **Les jambons** : un jambon blanc moelleux, un jambon cru plus salé et plus sec.
- **Les saucissons et charcuteries sèches** : rosette, chorizo pour la note épicée.
- **Les terrines et pâtés** : une tranche de terrine apporte du fondant et de la couleur.

Pour les fêtes, on peut monter d’un cran : galantine de volaille, terrine de gibier, foie gras.

## Combien par personne ?

Notre repère est le [plateau de charcuterie de notre carte traiteur](/carte-traiteur#nos-formules), à **6 € par personne**. Il compte, pour chaque convive :

- ½ tranche de jambon blanc
- 1 tranche de jambon cru
- 3 tranches de rosette
- ½ tranche de terrine
- 2 tranches de chorizo

Cette quantité convient pour un apéritif ou en accompagnement d’un buffet. Si le plateau est le plat principal d’un repas froid, doublez les quantités ou ajoutez un plateau de fromages et des salades.

## Trancher au bon moment

La charcuterie se tranche le plus tard possible : elle sèche à l’air. Si vous préparez votre plateau vous-même, demandez au [comptoir](/boucherie-roanne) de trancher le jour même, et gardez les tranches au frais, filmées, jusqu’au dressage. Sortez le plateau du réfrigérateur un quart d’heure avant de servir : les arômes se libèrent à température ambiante.

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

Pour six personnes, un plateau maison se prépare en vingt minutes avec une charcuterie tranchée au comptoir. À partir de quinze ou vingt convives, ou si vous voulez profiter de votre réception, [commandez-le tout prêt](/contact?type=devis-traiteur) : il est dressé, filmé, prêt à poser sur la table. Pensez à le commander une semaine avant.`,
  },
  {
    slug: "volaille-de-fete-choisir-cuire",
    titre: "Volaille de fête : bien la choisir et bien la cuire",
    chapo: "Chapon, poularde, dinde, pintade, poulet de Bresse, canard : chaque volaille de fête a son caractère et sa cuisson. Voici comment choisir la bonne pour votre tablée, puis la réussir au four.",
    titre_seo: "Volaille de fête : choisir et cuire chapon, dinde, poularde",
    description_seo: "Chapon, poularde, dinde, pintade ou poulet de Bresse : quel poids par personne, comment la cuire et la servir. Conseils de la boucherie Maison Cherblanc.",
    couverture: "ia/volaille-fermiere-de-fete-ficelee-boucherie-maison-cherblanc-roanne.jpg",
    publieLe: "2026-10-19T09:00",
    corps: `La volaille reste le plat central du repas de Noël dans beaucoup de familles. Encore faut-il choisir la bonne, au bon poids, et ne pas la dessécher au four. Voici nos repères de boucher.

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

Pour les fêtes 2026, nos volailles sont vendues **[uniquement sur commande](/menus-de-fetes), avant le 20 décembre** :

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

Marrons et champignons persillés, gratin dauphinois, purée de butternut et noisettes, poêlée de légumes d’hiver : [nos accompagnements de fêtes](/menus-de-fetes) se commandent à la part, en même temps que la volaille.

Vous avez une question sur la cuisson de votre volaille ? Demandez au [comptoir](/boucherie-roanne) en venant la chercher : c’est aussi notre métier.`,
  },
];

const SOURCE_CONTACT_BOUTIQUE = "ia/planche-couteau-de-boucher-savoir-faire-boucherie-maison-cherblanc-roanne.jpg";

export type BilanContenus = { articlesCrees: number; articlesExistants: number; emplacements: string[] };

export async function amorcerContenus(): Promise<BilanContenus> {
  const { creerArticle, slugArticleDisponible } = await import("../lib/articles");
  const { lireMediaParSource } = await import("../lib/media");
  const { isoDepuisHeureParis } = await import("../lib/dates");
  const { remplirEmplacementSiVide } = await import("../lib/emplacements");

  const bilan: BilanContenus = { articlesCrees: 0, articlesExistants: 0, emplacements: [] };

  for (const a of ARTICLES_LANCEMENT) {
    if (!slugArticleDisponible(a.slug)) {
      bilan.articlesExistants++;
      continue;
    }
    const couverture = lireMediaParSource(a.couverture);
    if (!couverture) console.warn(`  couverture absente (${a.couverture}) : article « ${a.slug} » créé sans image.`);
    const publie_le = isoDepuisHeureParis(a.publieLe);
    if (!publie_le) throw new Error(`Date invalide pour ${a.slug} : ${a.publieLe}`);
    const cree = creerArticle({
      slug: a.slug,
      titre: a.titre,
      chapo: a.chapo,
      corps: a.corps,
      couverture_media_id: couverture?.id ?? null,
      statut: "publie",
      publie_le,
      titre_seo: a.titre_seo,
      description_seo: a.description_seo,
    });
    if (cree.slug !== a.slug) throw new Error(`Slug modifié à la création : ${a.slug} -> ${cree.slug}`);
    bilan.articlesCrees++;
  }

  const nature = lireMediaParSource(SOURCE_CONTACT_BOUTIQUE);
  if (nature && remplirEmplacementSiVide("contact-boutique", nature.id)) bilan.emplacements.push("contact-boutique");

  return bilan;
}
