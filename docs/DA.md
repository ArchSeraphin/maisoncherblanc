# MAISON CHERBLANC · Direction artistique (web)

## Intention
Une **maison de bouche** élégante, chaleureuse et précise : l'esprit d'une épicerie fine ou d'une table de
bistrot chic, pas d'une boucherie de supermarché. Le site prolonge la charte des cartes imprimées 2027
(vert olive, crème, cuivre, Fraunces). On doit sentir le **geste artisan** et la **générosité** (traiteur) sans jamais
tomber dans les clichés.

**Interdits** : vichy rouge et blanc, rouge sang, couperet, tête de vache/cochon en pictogramme, ardoise à la craie,
typographie « western », photos de viande crue sanguinolente en très gros plan, emojis, dégradés criards,
cartes à ombre portée lourde, icônes clipart. Pas de fond noir pur ni de blanc pur.

## Couleurs (jetons à définir dans `app/globals.css`)
| Rôle | Jeton | Valeur |
|---|---|---|
| Fond de page | `--creme` | `#F3EBDC` |
| Surface claire | `--lin` | `#F8F3EA` |
| Surface sable | `--sable` | `#E9DDC6` |
| Vert principal (sections sombres, pied) | `--olive` | `#3F4530` |
| Vert profond | `--olive-profond` | `#2F3424` |
| Texte | `--encre` | `#2A2B24` (variantes `--encre-douce`, `--encre-tres-douce`) |
| Accent cuivre (rare : prix, filets, surtitres) | `--cuivre` | `#A3702A` (texte sur crème : vérifier AA, sinon `--cuivre-fonce` `#8A5C1E`) |
| Or clair (sur fond olive) | `--or` | `#E4CB8F` |
| Filets | `--trait` | encre à 14 % |
Ombres teintées olive, jamais noires. Contraste AA partout (vérifier le cuivre).

## Typographie
- Titres : **Fraunces** (variable, axes opsz/SOFT/WONK si dispo), graisse 350–420, italique pour les mots-clés
  d'accent (« *Boucherie* », « *Traiteur* »), `letter-spacing: -0.02em`.
- Texte : **DM Sans** (corps 1.0625rem, interligne 1.65).
- Surtitres : DM Sans capitales, `letter-spacing: 0.22em`, petite taille, couleur cuivre (comme « PLATEAUX & FORMULES » des cartes).
- Prix : Fraunces chiffres elzéviriens/tabulaires selon contexte, unité en petites capitales (« 6 € PAR PERS. »).
- Polices via `next/font` uniquement.

## Motifs de marque
- Le **monogramme MC** (logo circulaire) : en SVG, utilisé avec parcimonie (en-tête, pied, séparateur, favicon).
- **Arches** (reprises des cartes de fêtes) pour encadrer un visuel fort ou un bloc d'horaires. Une ou deux par page, pas plus.
- **Filets fins** cuivre avec petit losange central (séparateurs de section, comme sur les cartes imprimées).
- **Lignes de carte à points de conduite** (nom ........ prix) pour la carte traiteur : c'est l'élément signature qui rappelle le print.
- Grain papier très léger sur les fonds crème (SVG noise en CSS, opacité ≤ 4 %), optionnel.

## Mise en page
- Beaucoup d'air, grille éditoriale asymétrique, mesure de texte limitée (~62ch).
- Accueil : **deux portes égales** dès le premier écran, *La Boucherie* et *Le Traiteur*, côte à côte en desktop (diptyque
  pleine hauteur, photo + titre + lien), empilées en mobile. Le H1 de page domine le diptyque ou s'y intègre, et contient
  « boucherie » + « traiteur » + « Roanne ».
- Alternance de fonds : crème, lin, olive (une section olive par page environ), pied de page olive profond.
- Les photos réelles sont de qualité smartphone : les présenter en formats maîtrisés (recadrage, mosaïque, petits
  formats), jamais étirées en plein écran. Les grands formats plein écran vont aux visuels les plus nets.

## Mouvement (« un peu, pas surchargé »)
- Entrée au défilement : fondu + translation 16px, 600ms, `cubic-bezier(.2,.7,.2,1)`, décalage 80ms entre éléments frères.
- Hero : léger zoom lent de l'image (scale 1.06 -> 1 sur 1.8s) au chargement, texte qui apparaît en fondu.
- Survol : zoom 1.03 sur les visuels de cartes, soulignement animé des liens, flèche qui glisse de 4px.
- En-tête : se compacte et prend un fond crème translucide (`-webkit-backdrop-filter` AVANT `backdrop-filter`) au défilement.
- Diptyque d'accueil : au survol d'une porte, elle s'élargit légèrement (flex 1 -> 1.15), transition 700ms.
- Aucun carrousel automatique, aucune parallaxe lourde, aucun texte qui tourne. Tout neutralisé sous `prefers-reduced-motion`.

## Ton des textes
Vouvoiement, phrases courtes, concret (produits, gestes, saisons), chaleureux sans superlatifs creux
(« d'exception », « passion » avec parcimonie). Voir `docs/COPY.md`.
