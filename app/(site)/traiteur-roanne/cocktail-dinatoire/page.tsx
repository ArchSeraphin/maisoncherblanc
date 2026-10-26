import Link from "next/link";
import { AppelFinal } from "@/components/site/appel-final";
import { BandePhotos } from "@/components/site/bande-photos";
import { EnTetePage } from "@/components/site/en-tete-page";
import { ListePrix, lignePlat } from "@/components/site/liste-prix";
import { anneeDuTitre, montant, photoPartage, prixDepuisMontant, trouverPlat } from "@/components/site/outils";
import s from "@/components/site/sections.module.css";
import { VoirAussi } from "@/components/site/voir-aussi";
import { JsonLd } from "@/components/ui/json-ld";
import { FlecheDroite } from "@/components/ui/motifs";
import { articlePublie } from "@/lib/articles";
import { groupesComposition } from "@/lib/composition";
import { compterVue } from "@/lib/compter-vue";
import { chargerEmplacements } from "@/lib/emplacements";
import { carteTraiteur, type MenuComplet } from "@/lib/menus";
import { construireMetadata, elementsFilAriane, filArianeJsonLd, serviceJsonLd } from "@/lib/seo";
import p from "../prestation.module.css";

const CHEMIN = "/traiteur-roanne/cocktail-dinatoire";
const ARIANE = elementsFilAriane(CHEMIN);
const GUIDE_COCKTAIL = "cocktail-dinatoire-combien-de-pieces-par-personne";
const GUIDE_PLATEAU = "plateau-de-charcuterie-composer-presenter";

/** Les douze pièces mises en avant (docs/COPY.md), prix lus dans la carte. */
const PIECES = [
  "Mini hamburger bœuf cheddar",
  "Mini hamburger poulet césar",
  "Mini hot dog",
  "Mini croque jambon",
  "Mini focaccia mozzarella jambon cru",
  "Mini navette charcutière (jambon blanc, rosette)",
  "Wrap poulet curry",
  "Mini bagel de saison",
  "Verrine de saison",
  "Toast de saison vegan",
  "Mini brochette de fromage",
  "Sablé parmesan",
];

/** Exemple chiffré à 12 pièces par personne (docs/COPY.md), calculé sur les prix en base. */
const EXEMPLE: [number, string][] = [
  [1, "Mini hamburger bœuf cheddar"],
  [1, "Mini hamburger poulet césar"],
  [1, "Mini hot dog"],
  [2, "Wrap jambon fromage"],
  [1, "Mini croque jambon"],
  [1, "Mini focaccia mozzarella jambon cru"],
  [1, "Verrine de saison"],
  [1, "Toast de saison"],
  [1, "Sablé parmesan"],
  [2, "Macaron"],
];

function calculerExemple(carte: MenuComplet | null): { lignes: string[]; total: string } | null {
  let total = 0;
  const lignes: string[] = [];
  for (const [n, nom] of EXEMPLE) {
    const plat = trouverPlat(carte, nom);
    const m = plat ? montant(plat.prix) : null;
    if (!plat || m === null) return null;
    total += n * m;
    const libelle = n > 1 ? `${n} ${plat.nom.charAt(0).toLowerCase()}${plat.nom.slice(1)}s` : `${n} ${plat.nom.charAt(0).toLowerCase()}${plat.nom.slice(1)}`;
    lignes.push(libelle.replace(/^(\d+) wrap jambon fromages$/, "$1 wraps jambon fromage"));
  }
  return { lignes, total: prixDepuisMontant(Math.round(total * 100) / 100) };
}

export async function generateMetadata() {
  return construireMetadata({ chemin: CHEMIN, image: photoPartage(chargerEmplacements(["cocktail-hero"] as const)["cocktail-hero"]) });
}

export default async function PageCocktail() {
  await compterVue(CHEMIN);
  const img = chargerEmplacements(["cocktail-hero"] as const);
  const carte = carteTraiteur();
  const anneeCarte = anneeDuTitre(carte?.titre);
  const macaron = trouverPlat(carte, "Macaron");
  const miniGateau = trouverPlat(carte, "Mini gâteau de soirée");
  const exemple = calculerExemple(carte);
  const guideCocktail = articlePublie(GUIDE_COCKTAIL);
  const guidePlateau = articlePublie(GUIDE_PLATEAU);
  const plateaux = ["Plateau de charcuterie", "Plateau de fromages", "Plateau de légumes crus"]
    .map((n) => trouverPlat(carte, n))
    .filter((x) => x !== null);

  return (
    <>
      <JsonLd donnees={[filArianeJsonLd(ARIANE), serviceJsonLd(CHEMIN, { image: photoPartage(img["cocktail-hero"]) })]} />

      <EnTetePage
        ariane={ARIANE}
        surtitre="Cocktails · Buffets · Plateaux"
        titre={
          <>
            <em>Cocktail dînatoire</em> et buffets à Roanne
          </>
        }
        chapo={
          <p>
            Un cocktail dînatoire à Roanne, c’est une réception où l’on dîne debout, en bavardant, sans jamais passer à table. Maison Cherblanc prépare les
            pièces de cocktail : mini burgers, wraps, navettes, verrines, toasts de saison, accompagnés de plateaux de charcuterie et de fromages. Vous
            choisissez à la pièce sur notre carte, ou nous composons l’assortiment pour vous.
          </p>
        }
        actions={
          <>
            <Link href="/contact?type=devis-traiteur" className="bouton">
              Composer mon cocktail
            </Link>
            <Link href="/carte-traiteur#petit-dinatoire" className="bouton bouton-contour">
              Voir les prix à la pièce
            </Link>
          </>
        }
        image={img["cocktail-hero"]}
      />

      {/* Trois formats */}
      <section className="section fond-lin" aria-labelledby="formats">
        <div className="contenu">
          <div className={s.tete}>
            <p className="surtitre apparait">Trois formats</p>
            <h2 id="formats" className="titre-l apparait">
              Apéritif, cocktail dînatoire ou buffet : que choisir ?
            </h2>
          </div>
          <div className={`serie ${s.points}`}>
            <article className={`apparait ${s.point}`}>
              <h3>L’apéritif</h3>
              <p>Quelques pièces par personne avant un repas, ou pour un pot entre collègues. Court, léger, facile à servir.</p>
            </article>
            <article className={`apparait ${s.point}`}>
              <h3>Le cocktail dînatoire</h3>
              <p>
                Il remplace le repas. Les pièces s’enchaînent, du salé au sucré, sur deux à trois heures. C’est le format le plus convivial pour un anniversaire,
                une inauguration ou une soirée de mariage.
              </p>
            </article>
            <article className={`apparait ${s.point}`}>
              <h3>Le buffet</h3>
              <p>
                Les invités se servent, souvent assis ensuite. Salades, viandes froides tranchées, quiches à la plaque, fromages et desserts : un buffet nourrit
                bien et se prête aux grandes tablées.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Pièces de cocktail */}
      <section className="section" aria-labelledby="pieces">
        <div className={`contenu ${p.prix}`}>
          <div className={s.tete}>
            <p className="surtitre apparait">Petit dînatoire · À la pièce{anneeCarte ? ` · Carte ${anneeCarte}` : ""}</p>
            <h2 id="pieces" className="titre-l apparait">
              Les pièces de cocktail
            </h2>
          </div>
          <div className="apparait">
            <ListePrix lignes={PIECES.map((n) => lignePlat(trouverPlat(carte, n)))} />
            {macaron && miniGateau && macaron.prix === miniGateau.prix ? (
              <p className={s.prixNote}>Et pour finir : macarons et mini gâteaux de soirée à {macaron.prix} pièce.</p>
            ) : null}
            <div className={s.duoActions}>
              <Link href="/carte-traiteur#petit-dinatoire" className="bouton bouton-contour">
                Voir toute la carte du petit dînatoire
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Combien prévoir */}
      <section className="section fond-lin" aria-labelledby="quantites">
        <div className={`contenu ${p.colonnes}`}>
          <div>
            <p className="surtitre apparait">Quantités</p>
            <h2 id="quantites" className="titre-l apparait">
              Combien de pièces prévoir par personne ?
            </h2>
          </div>
          <div className={`apparait ${s.texte}`}>
            <p>
              Les repères courants chez les traiteurs : 4 à 6 pièces par personne pour un apéritif avant un repas, 12 à 15 pièces par personne pour un cocktail
              dînatoire qui remplace le dîner, un peu plus si la soirée dure ou si vos invités ont bon appétit. Comptez environ deux tiers de pièces salées et un
              tiers de sucrées.
            </p>
            {exemple ? (
              <div className={p.exemple}>
                <h3>Exemple chiffré{anneeCarte ? ` sur la carte ${anneeCarte}` : ""} (12 pièces par personne)</h3>
                <p>{`${exemple.lignes.slice(0, -1).join(", ")} et ${exemple.lignes[exemple.lignes.length - 1]}`}.</p>
                <p className={p.exempleTotal}>
                  <span>Total</span>
                  <span>
                    <span className="prix-fort">{exemple.total}</span> <span className="unite">par personne, hors service à table</span>
                  </span>
                </p>
              </div>
            ) : null}
            <p className={p.apresExemple}>Nous ajustons les quantités avec vous selon l’heure, la durée et le public.</p>
            {guideCocktail ? (
              <Link href={`/actualites/${GUIDE_COCKTAIL}`} className="lien-fleche">
                Lire le guide complet : combien prévoir pour un cocktail dînatoire <FlecheDroite />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* Plateaux et buffets */}
      <section className="section" aria-labelledby="plateaux">
        <div className="contenu">
          <div className={s.tete}>
            <p className="surtitre apparait">Plateaux et buffets</p>
            <h2 id="plateaux" className="titre-l apparait">
              Les plateaux à la personne
            </h2>
            <p className="apparait">Pour accompagner les pièces ou composer un buffet, nos plateaux se commandent à la personne :</p>
          </div>
          <div className={`serie ${p.plateaux}`}>
            {plateaux.map((pl) => (
              <article key={pl.id} className={`apparait ${p.plateau}`}>
                <h3>{pl.nom}</h3>
                <p className={p.plateauPrix}>
                  <span className="prix-fort">{pl.prix}</span>
                  <span className="unite">{pl.unite}</span>
                </p>
                <ul className="sans-puces">
                  {groupesComposition(pl.description)
                    .flatMap((g) => g.elements)
                    .map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                </ul>
              </article>
            ))}
          </div>
          <p className={`apparait ${s.texte} mesure`}>
            Pour un buffet plus complet : salades (lentilles, taboulé, salade de riz, perle marine…), viandes froides à la part (rôti de bœuf, de porc ou de veau,
            cuisse de poulet), quiches et pizzas en plaques d’environ 50 parts.
          </p>
          {guidePlateau ? (
            <Link href={`/actualites/${GUIDE_PLATEAU}`} className="lien-fleche apparait">
              Plateau de charcuterie : comment le composer et le présenter <FlecheDroite />
            </Link>
          ) : null}
          <div className={p.photos}>
            <BandePhotos categorie="cocktail" lien="Voir les photos de cocktails et buffets" />
          </div>
        </div>
      </section>

      {/* Service */}
      <section className="section-serree fond-lin" aria-labelledby="service">
        <div className={`contenu ${p.colonnes}`}>
          <h2 id="service" className="titre-l apparait">
            Retiré à la boutique ou servi par l’équipe
          </h2>
          <p className="chapo apparait">
            Les plateaux et les pièces se récupèrent à la boutique, rue Mulsant, prêts à poser sur la table. Avec l’option service à table, l’équipe dresse le
            buffet et sert vos invités pendant la réception.
          </p>
        </div>
      </section>

      <VoirAussi
        liens={[
          { href: "/traiteur-roanne", libelle: "Toutes nos prestations traiteur" },
          { href: "/traiteur-roanne/mariage", libelle: "Traiteur mariage" },
          { href: "/traiteur-roanne/broche-barbecue", libelle: "Jambon à la broche et barbecue" },
          { href: "/realisations?categorie=cocktail", libelle: "Voir les photos de cocktails et buffets" },
        ]}
      />

      <AppelFinal
        titre="Un cocktail à organiser ?"
        texte="Donnez-nous la date, le nombre d’invités et l’heure : nous vous proposons un assortiment et un devis gratuit. Commande au moins une semaine avant."
        actions={
          <Link href="/contact?type=devis-traiteur" className="bouton">
            Demander un devis
          </Link>
        }
      />
    </>
  );
}
