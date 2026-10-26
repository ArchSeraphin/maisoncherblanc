import Link from "next/link";
import { AppelFinal } from "@/components/site/appel-final";
import { CadrePhoto } from "@/components/site/cadre-photo";
import { EnTetePage } from "@/components/site/en-tete-page";
import { Faq } from "@/components/site/faq";
import { ListeExceptionnels, TableauHoraires } from "@/components/site/horaires";
import { anneeDuTitre, datesLimitesFetes, photoPartage, phraseHoraires, trouverPlat } from "@/components/site/outils";
import s from "@/components/site/sections.module.css";
import { JsonLd } from "@/components/ui/json-ld";
import { siteConfig } from "@/config/site";
import { compterVue } from "@/lib/compter-vue";
import { chargerEmplacements } from "@/lib/emplacements";
import { horairesExceptionnelsAVenir } from "@/lib/horaires-exceptionnels";
import { carteTraiteur, menusDeSaisonEnCours } from "@/lib/menus";
import { coordonnees, lireHoraires } from "@/lib/reglages";
import { construireMetadata, elementsFilAriane, faqBoucherie, faqJsonLd, filArianeJsonLd } from "@/lib/seo";
import styles from "./boucherie.module.css";

const CHEMIN = "/boucherie-roanne";
const ARIANE = elementsFilAriane(CHEMIN);

export async function generateMetadata() {
  return construireMetadata({ chemin: CHEMIN, image: photoPartage(chargerEmplacements(["boucherie-hero"] as const)["boucherie-hero"]) });
}

export default async function PageBoucherie() {
  await compterVue(CHEMIN);
  const img = chargerEmplacements(["boucherie-hero", "boucherie-viandes", "boucherie-charcuterie", "boucherie-fumoir", "boucherie-volailles"] as const);
  const horaires = lireHoraires();
  const coord = coordonnees();
  const carte = carteTraiteur();
  const plateau = trouverPlat(carte, "Plateau de charcuterie");
  const anneeCarte = anneeDuTitre(carte?.titre);
  const saison = menusDeSaisonEnCours()[0] ?? null;
  const fetes = datesLimitesFetes(saison);
  const exceptionnels = horairesExceptionnelsAVenir(30);

  const dateVolailles = fetes.noel ? `pour ${fetes.annee ?? "cette année"}, avant le ${fetes.noel.replace(/^\S+ /, "")}` : null;

  // FAQ de lib/seo.ts (lot C) : même texte affiché et balisé.
  const questions = faqBoucherie(horaires);

  return (
    <>
      <JsonLd donnees={[filArianeJsonLd(ARIANE), faqJsonLd(questions)]} />

      <EnTetePage
        ariane={ARIANE}
        surtitre="La Boucherie · Charcuterie"
        titre={
          <>
            <em>Boucherie</em> à Roanne, rue Mulsant
          </>
        }
        chapo={
          <p>
            Maison Cherblanc est une boucherie à Roanne, au 55 rue Mulsant. Bœuf, veau, porc, volailles et charcuterie y sont servis à la coupe, au poids que
            vous demandez, avec un conseil de cuisson si vous le souhaitez. La boutique est ouverte du mardi au dimanche matin.
          </p>
        }
        actions={
          <>
            <a href="#horaires" className="bouton">
              Horaires et accès
            </a>
            <Link href="/contact?type=commande-boucherie" className="bouton bouton-contour">
              Commander à la boutique
            </Link>
          </>
        }
        image={img["boucherie-hero"]}
      />

      {/* Le comptoir */}
      <section className="section fond-lin" aria-labelledby="comptoir">
        <div className="contenu">
          <div className={s.tete}>
            <p className="surtitre apparait">Au comptoir</p>
            <h2 id="comptoir" className="titre-l apparait">
              Votre boucherie à Roanne : ce que vous trouvez en boutique
            </h2>
            <p className="apparait">
              Une boucherie de quartier se juge à son comptoir : des morceaux bien parés, une découpe faite devant vous, et quelqu’un pour vous dire quelle
              pièce choisir. C’est ce que nous voulons pour la rue Mulsant. Vous venez avec un plat en tête, ou simplement un nombre de convives, et nous
              trouvons ensemble le bon morceau.
            </p>
          </div>

          <div className={s.rubriques}>
            <article className={`apparait ${s.rubrique}`}>
              <div>
                <h3 className="titre-m">Le bœuf, le veau, le porc</h3>
                <p>
                  Pièces à rôtir, à griller, à mijoter : côtes et entrecôtes pour le barbecue, rôtis ficelés, morceaux à bourguignon ou à blanquette, escalopes,
                  côtes de porc, viande hachée à la demande. Nous préparons aussi les pièces sur commande, pour un repas de famille ou une grande tablée : un
                  rôti de la taille voulue, une découpe particulière, une quantité inhabituelle.
                </p>
              </div>
              <CadrePhoto image={img["boucherie-viandes"]} className={`ratio-paysage ${s.rubriqueImage}`} sizes="(min-width: 900px) 380px, 92vw" />
            </article>

            <article className={`apparait ${s.rubrique}`}>
              <div>
                <h3 className="titre-m">La charcuterie</h3>
                <p>
                  Jambon blanc, jambon cru, rosette, chorizo, terrine : la charcuterie se prend à la tranche pour la semaine, ou en plateau pour recevoir. Pour
                  les fêtes, la vitrine s’enrichit de galantines de chapon aux pistaches et de pintade forestière, de terrine de sanglier, de boudins blancs (au
                  porto, au foie gras, aux morilles) et de foie gras de canard à la coupe.
                </p>
                <p>
                  Vous recevez ? Le{" "}
                  <Link href="/carte-traiteur#nos-formules" className={s.lienTexte}>
                    plateau de charcuterie
                  </Link>{" "}
                  est composé pour vous, à la personne, sur la carte traiteur
                  {plateau ? ` (${plateau.prix} ${plateau.unite === "par pers." ? "par personne" : plateau.unite}${anneeCarte ? ` sur la carte ${anneeCarte}` : ""})` : ""}.
                </p>
              </div>
              <CadrePhoto image={img["boucherie-charcuterie"]} className={`ratio-paysage ${s.rubriqueImage}`} sizes="(min-width: 900px) 380px, 92vw" />
            </article>

            <article className={`apparait ${s.rubrique}`}>
              <div>
                <h3 className="titre-m">Les volailles</h3>
                <p>
                  Toute l’année, demandez au comptoir les volailles du moment, entières ou découpées selon votre recette. Pour Noël et le jour de l’An, nous
                  proposons dinde fermière, poularde fermière, chapon fermier, poulet de Bresse, pintade fermière, canard ou canette, et caille. Ces{" "}
                  <Link href="/menus-de-fetes" className={s.lienTexte}>
                    volailles de fête sur commande
                  </Link>{" "}
                  se commandent obligatoirement à l’avance{dateVolailles ? ` : ${dateVolailles}` : ""}.
                </p>
              </div>
              <CadrePhoto image={img["boucherie-volailles"]} className={`ratio-paysage ${s.rubriqueImage}`} sizes="(min-width: 900px) 380px, 92vw" />
            </article>

            <article className={`apparait ${s.rubrique}`}>
              <div>
                <h3 className="titre-m">La broche</h3>
                <p>
                  Les jambons que nous servons en réception cuisent lentement à la broche, en rôtissoire, jusqu’à ce que la couenne dore et que la chair reste
                  moelleuse. C’est la même rôtissoire que nous installons chez vous pour une fête : voir la page{" "}
                  <Link href="/traiteur-roanne/broche-barbecue" className={s.lienTexte}>
                    jambon à la broche et barbecue
                  </Link>
                  .
                </p>
              </div>
              <CadrePhoto image={img["boucherie-fumoir"]} className={`ratio-paysage ${s.rubriqueImage}`} sizes="(min-width: 900px) 380px, 92vw" />
            </article>
          </div>
        </div>
      </section>

      {/* Conseils */}
      <section className="section" aria-labelledby="conseils">
        <div className="contenu">
          <div className={s.tete}>
            <p className="surtitre apparait">Conseils</p>
            <h2 id="conseils" className="titre-l apparait">
              Les conseils du boucher
            </h2>
          </div>
          <div className={`serie ${styles.conseils}`}>
            <article className={`apparait ${styles.conseil}`}>
              <h3>Combien prévoir par personne ?</h3>
              <p>
                Comptez environ 150 à 200 g de viande sans os par adulte pour un rôti ou une pièce à griller, et un peu plus pour une viande à mijoter qui
                réduit à la cuisson. Pour une côte avec os, prévoyez 300 à 400 g par personne. Dites-nous le nombre de convives : nous ajustons la pièce.
              </p>
            </article>
            <article className={`apparait ${styles.conseil}`}>
              <h3>Avant la cuisson</h3>
              <p>
                Sortez la viande du réfrigérateur 30 minutes à une heure avant de la cuire, selon la taille de la pièce. Une viande à température ambiante cuit
                plus régulièrement.
              </p>
            </article>
            <article className={`apparait ${styles.conseil}`}>
              <h3>Après la cuisson</h3>
              <p>
                Laissez reposer un rôti ou une côte quelques minutes sous une feuille de papier aluminium avant de trancher. Les jus se répartissent, la viande
                reste tendre.
              </p>
            </article>
            <article className={`apparait ${styles.conseil}`}>
              <h3>Le bon morceau pour le bon plat</h3>
              <p>
                Bourguignon, blanquette, pot-au-feu : les morceaux à mijoter supportent une cuisson longue. Côte, entrecôte, filet : une cuisson courte et vive.
                Au comptoir, nous vous orientons selon la recette, le temps dont vous disposez et votre budget.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Boucherie et traiteur */}
      <section className="section fond-olive grain" aria-labelledby="meme-maison">
        <div className={`contenu ${styles.miroir}`}>
          <div>
            <p className="surtitre apparait">La même maison</p>
            <h2 id="meme-maison" className="titre-l apparait">
              De la boucherie au <em>traiteur</em>
            </h2>
          </div>
          <div>
            <p className={`apparait ${styles.miroirTexte}`}>
              Les plats cuisinés, les rôtis froids et les plateaux de notre service traiteur partent de la même boutique et des mêmes viandes. Rôti de bœuf,
              de porc ou de veau en tranches pour un buffet, blanquette ou bœuf bourguignon à la part pour un repas en famille : tout est sur la carte, avec les
              prix.
            </p>
            <div className="rangee apparait">
              <Link href="/traiteur-roanne" className="bouton">
                Découvrir notre service traiteur à Roanne
              </Link>
              <Link href="/carte-traiteur" className="bouton bouton-contour">
                Voir la carte traiteur
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Horaires et accès */}
      <section className="section" id="horaires" aria-labelledby="horaires-titre">
        <div className={`contenu ${styles.horaires}`}>
          <div className={styles.horairesTexte}>
            <p className="surtitre apparait">Horaires</p>
            <h2 id="horaires-titre" className="titre-l apparait">
              Horaires de la boucherie et accès
            </h2>
            <p className="apparait">
              La boucherie Maison Cherblanc se trouve au {siteConfig.adresse.rue}, {siteConfig.adresse.codePostal} {siteConfig.adresse.ville}.{" "}
              {phraseHoraires(horaires)} Téléphone :{" "}
              <a href={coord.telephone.href} className={s.lienTexte}>
                {coord.telephone.affichage}
              </a>
              .
            </p>
            <p className="apparait">La rue Mulsant est à quelques minutes en voiture de Riorges, Mably, Le Coteau et Villerest.</p>
            <div className={`rangee apparait ${s.duoActions}`}>
              <a href={siteConfig.itineraire} className="bouton" target="_blank" rel="noopener noreferrer">
                Itinéraire<span className="invisible-accessible"> (Google Maps, nouvel onglet)</span>
              </a>
              <a href={coord.telephone.href} className="bouton bouton-contour">
                Appeler la boutique
              </a>
            </div>
          </div>
          <div className={`arche-contour apparait ${styles.arche}`}>
            <p className={`titre-m ${styles.archeTitre}`}>La semaine</p>
            <TableauHoraires horaires={horaires} legende="Horaires d’ouverture de la boucherie" />
            <ListeExceptionnels exceptionnels={exceptionnels} titre="Horaires exceptionnels à venir" />
          </div>
        </div>
      </section>

      <Faq id="faq" titre="Questions fréquentes sur la boucherie" questions={questions} />

      <AppelFinal
        titre="Une commande pour ce week-end ?"
        texte="Appelez la boutique ou écrivez-nous : nous préparons votre commande pour l’heure qui vous arrange."
        actions={
          <>
            <Link href="/contact?type=commande-boucherie" className="bouton">
              Commander à la boutique
            </Link>
            <a href={coord.telephone.href} className="bouton bouton-contour">
              {coord.telephone.affichage}
            </a>
          </>
        }
      />
    </>
  );
}
