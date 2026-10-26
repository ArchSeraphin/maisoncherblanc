import Link from "next/link";
import { AppelFinal } from "@/components/site/appel-final";
import { BandePhotos } from "@/components/site/bande-photos";
import { EnTetePage } from "@/components/site/en-tete-page";
import { ListePrix, lignePlat } from "@/components/site/liste-prix";
import { anneeDuTitre, photoPartage, trouverPlat } from "@/components/site/outils";
import s from "@/components/site/sections.module.css";
import { VoirAussi } from "@/components/site/voir-aussi";
import { JsonLd } from "@/components/ui/json-ld";
import { compterVue } from "@/lib/compter-vue";
import { chargerEmplacements } from "@/lib/emplacements";
import { carteTraiteur } from "@/lib/menus";
import { coordonnees } from "@/lib/reglages";
import { construireMetadata, elementsFilAriane, filArianeJsonLd, serviceJsonLd } from "@/lib/seo";
import p from "../prestation.module.css";

const CHEMIN = "/traiteur-roanne/broche-barbecue";
const ARIANE = elementsFilAriane(CHEMIN);

/** Emplacement d'en-tête, ou à défaut la photo de la carte « Broche » du hub traiteur (même sujet). */
function imageHero() {
  const img = chargerEmplacements(["broche-hero", "traiteur-broche"] as const);
  return img["broche-hero"] ?? img["traiteur-broche"];
}

export async function generateMetadata() {
  return construireMetadata({ chemin: CHEMIN, image: photoPartage(imageHero()) });
}

export default async function PageBroche() {
  await compterVue(CHEMIN);
  const coord = coordonnees();
  const carte = carteTraiteur();
  const anneeCarte = anneeDuTitre(carte?.titre);

  return (
    <>
      <JsonLd donnees={[filArianeJsonLd(ARIANE), serviceJsonLd(CHEMIN, { image: photoPartage(imageHero()) })]} />

      <EnTetePage
        ariane={ARIANE}
        surtitre="Animations · Le Traiteur"
        titre={
          <>
            <em>Jambon à la broche</em> et barbecue à Roanne
          </>
        }
        chapo={
          <p>
            Pour une réception en plein air, rien ne réunit les invités comme une cuisson qui se fait sous leurs yeux. Maison Cherblanc installe sa rôtissoire
            mobile sur le lieu de votre fête à Roanne et dans le Roannais : jambons à la broche qui dorent lentement, côtes de bœuf saisies au barbecue. Le
            boucher choisit la viande, le traiteur la cuit et la sert.
          </p>
        }
        actions={
          <Link href="/contact?type=devis-traiteur" className="bouton">
            Demander un devis
          </Link>
        }
        image={imageHero()}
      />

      {/* La broche et le barbecue */}
      <section className="section fond-lin" aria-labelledby="broche">
        <div className="contenu">
          <div className={`serie ${p.moments}`}>
            <article className={`apparait ${p.moment}`}>
              <p className="surtitre">La broche</p>
              <h2 id="broche" className="titre-m">
                Le jambon à la broche, cuit devant vos invités
              </h2>
              <p>
                Les jambons sont maintenus dans une grille, embrochés, puis tournent lentement devant la chaleur pendant de longues heures. La couenne dore, la
                chair cuit doucement et reste moelleuse. C’est une cuisson de patience, et c’est aussi un spectacle : les invités viennent voir, sentent,
                demandent quand on tranche.
              </p>
              <p>Une fois cuit, le jambon se tranche et se sert chaud, avec ses accompagnements.</p>
            </article>
            <article className={`apparait ${p.moment}`}>
              <p className="surtitre">Le barbecue</p>
              <h2 className="titre-m">Côtes de bœuf et grillades</h2>
              <p>
                Sur la même rôtissoire, la grille accueille des côtes de bœuf épaisses, choisies et préparées à notre boucherie. Elles sont saisies, retournées,
                puis reposent avant d’être tranchées. Une cuisson vive et courte, à l’opposé de la broche, et tout aussi généreuse.
              </p>
            </article>
          </div>
          <div className={p.photos}>
            <BandePhotos categorie="broche-barbecue" lien="Voir les photos de broche et barbecue" />
          </div>
        </div>
      </section>

      {/* Déroulé */}
      <section className="section" aria-labelledby="pratique">
        <div className="contenu">
          <div className={s.tete}>
            <p className="surtitre apparait">En pratique</p>
            <h2 id="pratique" className="titre-l apparait">
              Comment se passe une animation broche ou barbecue
            </h2>
          </div>
          <ol className={`serie ${s.etapes}`}>
            <li className={`apparait ${s.etape}`}>
              <h3>Avant</h3>
              <p>Nous fixons ensemble le nombre d’invités, la ou les viandes, les accompagnements et l’horaire du service. Le devis est gratuit.</p>
            </li>
            <li className={`apparait ${s.etape}`}>
              <h3>Sur place</h3>
              <p>
                La rôtissoire arrive sur remorque. Prévoyez un emplacement extérieur, plat et accessible, à l’écart du passage. Nous vous précisons au moment du
                devis ce dont nous avons besoin sur place.
              </p>
            </li>
            <li className={`apparait ${s.etape}`}>
              <h3>Le service</h3>
              <p>L’équipe surveille la cuisson, tranche et sert. Vous restez avec vos invités.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* Accompagnements */}
      <section className="section fond-lin" aria-labelledby="accompagnements">
        <div className={`contenu ${p.prix}`}>
          <div className={s.tete}>
            <p className="surtitre apparait">À côté</p>
            <h2 id="accompagnements" className="titre-l apparait">
              Les accompagnements
            </h2>
            <p className="apparait">Les accompagnements viennent de notre carte traiteur{anneeCarte ? ` ${anneeCarte}` : ""}, à la part :</p>
          </div>
          <div className="apparait">
            <ListePrix
              lignes={["Gratin dauphinois", "Gratin dauphinois truffé", "Pomme grenaille au romarin", "Poêlée de légumes de saison", "Tomate provençale"].map((n) =>
                lignePlat(trouverPlat(carte, n)),
              )}
            />
            <p className={s.prixNote}>
              Ajoutez une salade de la carte (lentilles, taboulé, salade de riz), un plateau de fromages et un dessert, et le repas est complet.
            </p>
          </div>
        </div>
      </section>

      {/* Occasions */}
      <section className="section-serree" aria-labelledby="occasions">
        <div className={`contenu ${p.colonnes}`}>
          <h2 id="occasions" className="titre-l apparait">
            Pour quelles réceptions ?
          </h2>
          <p className="chapo apparait">
            Mariage et vin d’honneur, anniversaire dans un jardin, fête de famille, repas d’association ou de fin de saison, fête de quartier : la broche et le
            barbecue conviennent à toutes les réceptions en extérieur, aux beaux jours comme en arrière-saison.
          </p>
        </div>
      </section>

      <VoirAussi
        liens={[
          { href: "/traiteur-roanne", libelle: "Toutes nos prestations traiteur" },
          { href: "/traiteur-roanne/mariage", libelle: "Traiteur mariage" },
          { href: "/traiteur-roanne/cocktail-dinatoire", libelle: "Cocktail dînatoire et buffets" },
          { href: "/realisations?categorie=broche-barbecue", libelle: "Voir les photos de broche et barbecue" },
        ]}
      />

      <AppelFinal
        titre="Une fête en plein air en préparation ?"
        texte="Dites-nous la date, le lieu et le nombre d’invités. Nous vous proposons la cuisson la mieux adaptée et un devis gratuit."
        actions={
          <>
            <Link href="/contact?type=devis-traiteur" className="bouton">
              Demander un devis
            </Link>
            <a href={coord.mobile.href} className="bouton bouton-contour">
              Appeler le {coord.mobile.affichage}
            </a>
          </>
        }
      />
    </>
  );
}
