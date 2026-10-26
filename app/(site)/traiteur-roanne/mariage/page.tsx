import Link from "next/link";
import { AppelFinal } from "@/components/site/appel-final";
import { BandePhotos } from "@/components/site/bande-photos";
import { EnTetePage } from "@/components/site/en-tete-page";
import { ListePrix, lignePlat } from "@/components/site/liste-prix";
import { anneeDuTitre, fourchette, photoPartage, trouverPlat, trouverSection } from "@/components/site/outils";
import s from "@/components/site/sections.module.css";
import { VoirAussi } from "@/components/site/voir-aussi";
import { JsonLd } from "@/components/ui/json-ld";
import { FlecheDroite } from "@/components/ui/motifs";
import { compterVue } from "@/lib/compter-vue";
import { chargerEmplacements } from "@/lib/emplacements";
import { carteTraiteur } from "@/lib/menus";
import { coordonnees } from "@/lib/reglages";
import { construireMetadata, elementsFilAriane, filArianeJsonLd, serviceJsonLd } from "@/lib/seo";
import p from "../prestation.module.css";

const CHEMIN = "/traiteur-roanne/mariage";
const ARIANE = elementsFilAriane(CHEMIN);

export async function generateMetadata() {
  return construireMetadata({ chemin: CHEMIN, image: photoPartage(chargerEmplacements(["mariage-hero"] as const)["mariage-hero"]) });
}

export default async function PageMariage() {
  await compterVue(CHEMIN);
  const img = chargerEmplacements(["mariage-hero"] as const);
  const coord = coordonnees();
  const carte = carteTraiteur();
  const anneeCarte = anneeDuTitre(carte?.titre);
  const dinatoire = trouverSection(carte, "Petit dînatoire");
  const fDinatoire = dinatoire ? fourchette(dinatoire.plats, { min: 1, max: 3 }) : null;

  return (
    <>
      <JsonLd donnees={[filArianeJsonLd(ARIANE), serviceJsonLd(CHEMIN, { image: photoPartage(img["mariage-hero"]) })]} />

      <EnTetePage
        ariane={ARIANE}
        surtitre="Mariages · Le Traiteur"
        titre={
          <>
            <em>Traiteur</em> mariage à Roanne
          </>
        }
        chapo={
          <p>
            Votre mariage se prépare des mois à l’avance, le repas aussi. Maison Cherblanc, traiteur mariage à Roanne, prépare le vin d’honneur, le buffet ou le
            repas servi à table, les plateaux de fromages et les desserts, jusqu’à la pièce montée. Vous nous dites comment vous imaginez la journée, nous
            construisons le menu et le devis avec vous.
          </p>
        }
        actions={
          <Link href="/contact?type=devis-traiteur" className="bouton">
            Parler de votre mariage
          </Link>
        }
        image={img["mariage-hero"]}
      />

      {/* Déroulé gourmand */}
      <section className="section fond-lin" aria-labelledby="deroule">
        <div className="contenu">
          <div className={s.tete}>
            <p className="surtitre apparait">De l’apéritif au dessert</p>
            <h2 id="deroule" className="titre-l apparait">
              Un traiteur pour chaque moment du mariage
            </h2>
          </div>
          <div className={`serie ${p.moments}`}>
            <article className={`apparait ${p.moment}`}>
              <h3 className="titre-m">Le vin d’honneur</h3>
              <p>
                C’est souvent le premier moment où tous vos invités se retrouvent. Nous le composons en pièces à grignoter debout, faciles à prendre en main :
                mini burgers, navettes, wraps, verrines et toasts de saison, mini brochettes de fromage. Ajoutez un plateau de charcuterie tranchée, et le vin
                d’honneur devient un vrai moment de table, même sans table.
              </p>
            </article>
            <article className={`apparait ${p.moment}`}>
              <h3 className="titre-m">Le repas, en buffet ou servi</h3>
              <p>
                Buffet froid, buffet chaud, repas assis : le format dépend de votre salle, du nombre d’invités et du rythme que vous voulez donner à la soirée.
                Entrées froides et chaudes, plats mijotés, rôtis, accompagnements, tout part de notre carte, et le menu s’ajuste à vos goûts. Avec l’option
                service à table, l’équipe sert vos invités et s’occupe du rythme du repas.
              </p>
            </article>
            <article className={`apparait ${p.moment}`}>
              <h3 className="titre-m">Le plateau de fromages</h3>
              <p>
                Brie, camembert, saint-marcellin, bleu, comté : dressés en grands plateaux avec des fruits frais et des noix, les fromages font le lien entre le
                plat et le dessert. Ils trouvent aussi leur place sur un buffet de fin de soirée.
              </p>
            </article>
            <article className={`apparait ${p.moment}`}>
              <h3 className="titre-m">Les desserts</h3>
              <p>
                Pièce montée en choux, avec une plaque aux prénoms des mariés. Entremets à partager, à partir de 20 parts. Tour de macarons, mini gâteaux de
                soirée, café gourmand. Le dessert est souvent la photo que vos invités gardent : nous le préparons avec soin.
              </p>
            </article>
          </div>
          <div className={p.photos}>
            <BandePhotos categorie="mariage" lien="Voir les photos de mariages" />
          </div>
        </div>
      </section>

      {/* Repères de prix */}
      <section className="section" aria-labelledby="prix">
        <div className={`contenu ${p.prix}`}>
          <div className={s.tete}>
            <p className="surtitre apparait">Repères de prix{anneeCarte ? ` · Carte ${anneeCarte}` : ""}</p>
            <h2 id="prix" className="titre-l apparait">
              Combien coûte un traiteur mariage à Roanne ?
            </h2>
            <p className="apparait">Chaque mariage a son devis, mais quelques prix de la carte{anneeCarte ? ` ${anneeCarte}` : ""} donnent une idée :</p>
          </div>
          <div className="apparait">
            <ListePrix
              lignes={[
                lignePlat(trouverPlat(carte, "Pièce montée (3 choux)")),
                lignePlat(trouverPlat(carte, "Entremets (20 parts minimum)")),
                lignePlat(trouverPlat(carte, "Macaron")),
                lignePlat(trouverPlat(carte, "Mini gâteau de soirée")),
                lignePlat(trouverPlat(carte, "Café gourmand")),
                lignePlat(trouverPlat(carte, "Plateau de fromages")),
                fDinatoire ? { nom: "Pièces du petit dînatoire, la plupart", prix: fDinatoire, unite: "pièce" } : null,
              ]}
            />
            <p className={s.prixNote}>Le service à table et les prestations particulières sont chiffrés dans le devis, qui est gratuit.</p>
          </div>
        </div>
      </section>

      {/* Pas à pas */}
      <section className="section fond-lin" aria-labelledby="pas-a-pas">
        <div className={`contenu ${p.colonnes}`}>
          <div>
            <p className="surtitre apparait">Pas à pas</p>
            <h2 id="pas-a-pas" className="titre-l apparait">
              Préparer votre mariage avec nous
            </h2>
          </div>
          <ol className={`sans-puces serie ${p.pas}`}>
            <li className="apparait">
              <p>
                <strong>Le premier échange.</strong> Date, lieu, nombre d’invités, déroulé de la journée, envies et contraintes (enfants, régimes particuliers).
                Un appel ou un message suffit pour commencer.
              </p>
            </li>
            <li className="apparait">
              <p>
                <strong>La proposition.</strong> Nous vous envoyons un menu et un devis gratuit. Vous ajustez, nous affinons.
              </p>
            </li>
            <li className="apparait">
              <p>
                <strong>La confirmation.</strong> Comme toute commande traiteur, la commande définitive (nombre d’invités, menu) se confirme au plus tard une
                semaine avant la date. Pour un mariage, réservez votre date avec nous dès qu’elle est fixée.
              </p>
            </li>
            <li className="apparait">
              <p>
                <strong>Le jour J.</strong> Vous récupérez la commande, ou l’équipe est sur place avec l’option service à table.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Animations */}
      <section className="section fond-olive grain" aria-labelledby="animations">
        <div className={`contenu ${p.colonnes}`}>
          <div>
            <p className="surtitre apparait">Pour aller plus loin</p>
            <h2 id="animations" className="titre-l apparait">
              Une animation pour le vin d’honneur
            </h2>
          </div>
          <div>
            <p className="chapo apparait">
              Jambons cuits à la broche dans une rôtissoire installée sur place, côtes de bœuf grillées devant les invités : une animation culinaire rassemble
              les invités autour de la rôtissoire et donne au vin d’honneur son moment fort.
            </p>
            <div className={`apparait ${s.duoActions}`}>
              <Link href="/traiteur-roanne/broche-barbecue" className="lien-fleche">
                Jambon à la broche et barbecue <FlecheDroite />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <VoirAussi
        liens={[
          { href: "/traiteur-roanne", libelle: "Toutes nos prestations traiteur" },
          { href: "/traiteur-roanne/cocktail-dinatoire", libelle: "Cocktail dînatoire et buffets" },
          { href: "/realisations?categorie=mariage", libelle: "Voir les photos de mariages" },
          { href: "/carte-traiteur", libelle: "Voir la carte traiteur et les prix" },
        ]}
      />

      <AppelFinal
        titre="Votre date est fixée ?"
        texte="Écrivez-nous dès maintenant : date, lieu, nombre d’invités. Nous revenons vers vous avec une première proposition."
        actions={
          <>
            <Link href="/contact?type=devis-traiteur" className="bouton">
              Demander un devis mariage
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
