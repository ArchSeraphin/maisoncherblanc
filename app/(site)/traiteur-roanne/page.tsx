import Link from "next/link";
import { AppelFinal } from "@/components/site/appel-final";
import { CadrePhoto } from "@/components/site/cadre-photo";
import { EnTetePage } from "@/components/site/en-tete-page";
import { Faq } from "@/components/site/faq";
import { ListePrix, lignePlat } from "@/components/site/liste-prix";
import { anneeDuTitre, fourchette, photoPartage, trouverPlat, trouverSection } from "@/components/site/outils";
import s from "@/components/site/sections.module.css";
import { JsonLd } from "@/components/ui/json-ld";
import { FlecheDroite } from "@/components/ui/motifs";
import { compterVue } from "@/lib/compter-vue";
import { chargerEmplacements } from "@/lib/emplacements";
import { groupesComposition } from "@/lib/composition";
import { carteTraiteur, menusDeSaisonEnCours } from "@/lib/menus";
import { coordonnees } from "@/lib/reglages";
import { construireMetadata, elementsFilAriane, faqJsonLd, faqTraiteur, filArianeJsonLd, serviceJsonLd } from "@/lib/seo";
import styles from "./traiteur.module.css";

const CHEMIN = "/traiteur-roanne";
const ARIANE = elementsFilAriane(CHEMIN);

export async function generateMetadata() {
  // Vraie photo d'en-tête si elle existe, sinon la carte de partage du traiteur (/partage/traiteur).
  const photo = photoPartage(chargerEmplacements(["traiteur-hero"] as const)["traiteur-hero"]);
  return construireMetadata({ chemin: CHEMIN, image: photo ?? { url: "/partage/traiteur", width: 1200, height: 630, alt: "Traiteur à Roanne, Maison Cherblanc", type: "image/jpeg" } });
}


export default async function PageTraiteur() {
  await compterVue(CHEMIN);
  const img = chargerEmplacements(["traiteur-hero", "traiteur-mariage", "traiteur-cocktail", "traiteur-broche", "traiteur-plats", "maison-equipe"] as const);
  const coord = coordonnees();
  const carte = carteTraiteur();
  const anneeCarte = anneeDuTitre(carte?.titre);

  const charcuterie = trouverPlat(carte, "Plateau de charcuterie");
  const fromages = trouverPlat(carte, "Plateau de fromages");
  const legumes = trouverPlat(carte, "Plateau de légumes crus");
  const formule = trouverPlat(carte, "La formule du chef");
  const platsChauds = trouverSection(carte, "Plats chauds");
  const dinatoire = trouverSection(carte, "Petit dînatoire");
  const plaques = trouverSection(carte, "Quiche / Pizza");
  const fPlats = platsChauds ? fourchette(platsChauds.plats) : null;
  const fDinatoire = dinatoire ? fourchette(dinatoire.plats, { min: 1, max: 3 }) : null;
  const fPlaques = plaques ? fourchette(plaques.plats) : null;

  const prestations = [
    {
      titre: "Traiteur mariage",
      texte: "Vin d’honneur, buffet ou repas, fromages et desserts jusqu’à la pièce montée. Nous préparons la réception avec vous, du premier rendez-vous au jour J.",
      href: "/traiteur-roanne/mariage",
      lien: "Traiteur mariage",
      image: img["traiteur-mariage"],
    },
    {
      titre: "Cocktail dînatoire et buffets",
      texte:
        "Mini burgers, wraps, navettes, verrines, toasts de saison, plateaux de charcuterie et de fromages. Pour un apéritif, un anniversaire ou une soirée entière debout.",
      href: "/traiteur-roanne/cocktail-dinatoire",
      lien: "Cocktail dînatoire et buffets",
      image: img["traiteur-cocktail"],
    },
    {
      titre: "Jambon à la broche et barbecue",
      texte: "Une rôtissoire installée sur place, des jambons qui dorent lentement, des côtes de bœuf grillées devant vos invités.",
      href: "/traiteur-roanne/broche-barbecue",
      lien: "Jambon à la broche et barbecue",
      image: img["traiteur-broche"],
    },
    {
      titre: "Plats cuisinés et plateaux",
      texte: "Blanquette de veau, bœuf bourguignon, gratin dauphinois, quiches à la plaque, rôtis froids : de quoi recevoir sans passer la journée en cuisine.",
      href: "/carte-traiteur",
      lien: "Voir la carte traiteur et les prix",
      image: img["traiteur-plats"],
    },
  ];

  // FAQ de lib/seo.ts (lot C) : même texte affiché et balisé.
  const questions = faqTraiteur(carte, menusDeSaisonEnCours()[0] ?? null);

  const compoFormule = formule ? groupesComposition(formule.description).flatMap((g) => g.elements) : [];

  return (
    <>
      <JsonLd donnees={[filArianeJsonLd(ARIANE), serviceJsonLd(CHEMIN, { image: photoPartage(img["traiteur-hero"]), sousServices: true }), faqJsonLd(questions)]} />

      <EnTetePage
        ariane={ARIANE}
        surtitre="Le Traiteur · Maison Cherblanc"
        titre={
          <>
            <em>Traiteur</em> à Roanne
          </>
        }
        chapo={
          <p>
            Maison Cherblanc est traiteur à Roanne, au 55 rue Mulsant. Plateaux à la personne, plats cuisinés à la part, petit dînatoire à la pièce, buffets et
            repas de mariage : vous composez à partir de notre carte, ou nous construisons ensemble une proposition sur mesure. Commande une semaine avant,
            devis gratuit, service à table en option.
          </p>
        }
        actions={
          <>
            <Link href="/contact?type=devis-traiteur" className="bouton">
              Demander un devis gratuit
            </Link>
            <Link href="/carte-traiteur" className="bouton bouton-contour">
              Voir la carte traiteur et les prix
            </Link>
          </>
        }
        image={img["traiteur-hero"]}
      />

      {/* Prestations */}
      <section className="section fond-lin" aria-labelledby="prestations">
        <div className="contenu">
          <div className={s.tete}>
            <p className="surtitre apparait">Nos prestations</p>
            <h2 id="prestations" className="titre-l apparait">
              Votre traiteur à Roanne, de la carte au sur-mesure
            </h2>
          </div>
          <div className={`serie ${s.prestations} ${styles.quatre}`}>
            {prestations.map((p) => (
              <article key={p.titre} className={`apparait ${s.prestation}`}>
                <Link href={p.href} tabIndex={-1} aria-hidden="true">
                  <CadrePhoto image={p.image} alt="" className="ratio-portrait cadre-zoom" sizes="(min-width: 1100px) 280px, (min-width: 700px) 45vw, 92vw" />
                </Link>
                <h3>{p.titre}</h3>
                <p>{p.texte}</p>
                <Link href={p.href} className={`lien-fleche ${s.prestationLien}`}>
                  {p.lien} <FlecheDroite />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="section" aria-labelledby="etapes">
        <div className="contenu">
          <div className={s.tete}>
            <p className="surtitre apparait">Comment ça marche</p>
            <h2 id="etapes" className="titre-l apparait">
              Commander un traiteur à Roanne, en quatre étapes
            </h2>
          </div>
          <ol className={`serie ${s.etapes}`}>
            <li className={`apparait ${s.etape}`}>
              <h3>Vous nous parlez de votre réception</h3>
              <p>La date, le lieu, le nombre de personnes, le moment de la journée, et vos envies. Par téléphone, au comptoir ou avec le formulaire de contact.</p>
            </li>
            <li className={`apparait ${s.etape}`}>
              <h3>Nous vous proposons une formule</h3>
              <p>À partir de la carte ou sur mesure. Le devis est gratuit.</p>
            </li>
            <li className={`apparait ${s.etape}`}>
              <h3>Vous confirmez au moins une semaine avant</h3>
              <p>
                Une semaine, c’est le délai qui nous permet de commander, préparer et cuisiner correctement. Pour un mariage ou une grande réception, prenez
                contact bien plus tôt, dès que la date est fixée.
              </p>
            </li>
            <li className={`apparait ${s.etape}`}>
              <h3>Vous récupérez, ou nous servons</h3>
              <p>
                Vous passez prendre votre commande à la boutique, rue Mulsant. Ou vous choisissez l’option service à table : l’équipe assure le service le jour
                de votre réception.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Repères de prix */}
      <section className="section fond-lin" aria-labelledby="prix">
        <div className={`contenu ${styles.prix}`}>
          <div className={s.tete}>
            <p className="surtitre apparait">Repères de prix{anneeCarte ? ` · Carte ${anneeCarte}` : ""}</p>
            <h2 id="prix" className="titre-l apparait">
              Combien coûte un traiteur à Roanne chez Maison Cherblanc ?
            </h2>
            <p className="apparait">
              Nos prix sont publics et valables toute l’année civile. Quelques repères tirés de la carte traiteur{anneeCarte ? ` ${anneeCarte}` : ""} :
            </p>
          </div>
          <div className="apparait">
            <ListePrix
              lignes={[
                lignePlat(charcuterie),
                lignePlat(fromages),
                lignePlat(legumes, "Plateau de légumes crus, sauce au choix"),
                lignePlat(formule, "La formule du chef", compoFormule.length ? compoFormule.join(", ") : undefined),
                fPlats ? { nom: "Plats chauds à la part", prix: fPlats } : null,
                fDinatoire ? { nom: "Petit dînatoire, la plupart des pièces", prix: fDinatoire, unite: "pièce" } : null,
                fPlaques ? { nom: "Quiche ou pizza, plaque d’environ 50 parts", prix: fPlaques } : null,
              ]}
            />
            <p className={s.prixNote}>
              Le prix final dépend de votre composition et des options (service à table notamment) : il est précisé dans le devis.
            </p>
            <div className={s.duoActions}>
              <Link href="/carte-traiteur" className="bouton">
                Voir toute la carte
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service à table */}
      <section className="section" aria-labelledby="service">
        <div className={`contenu ${s.duo}`}>
          <div className={s.duoTexte}>
            <p className="surtitre apparait">Le jour J</p>
            <h2 id="service" className="titre-l apparait">
              Service à table : vous recevez, nous servons
            </h2>
            <p className="apparait">
              Avec l’option service à table, vous n’êtes plus l’hôte qui fait des allers-retours en cuisine. L’équipe Maison Cherblanc dresse les plats, sert vos
              invités et veille au rythme du repas. Vous profitez de votre réception.
            </p>
            <p className="apparait">Le service s’ajoute à n’importe quelle formule et se chiffre dans le devis, selon le nombre de convives et la durée.</p>
          </div>
          <div className={`apparait ${s.duoImage}`}>
            <CadrePhoto image={img["maison-equipe"]} className="ratio-portrait" sizes="(min-width: 900px) 40vw, 92vw" />
          </div>
        </div>
      </section>

      {/* Occasions */}
      <section className="section-serree" aria-labelledby="occasions">
        <div className={`contenu ${styles.occasions}`}>
          <div>
            <p className="surtitre apparait">Pour quelles occasions</p>
            <h2 id="occasions" className="titre-l apparait">
              Des repas de famille aux grandes réceptions
            </h2>
          </div>
          <div className={`apparait ${s.texte}`}>
            <p>
              Repas de famille, anniversaires, communions et baptêmes, mariages, fêtes d’associations, pots de départ ou repas d’équipe : une réception n’a pas
              besoin d’être grande pour mériter un traiteur. Un plateau de charcuterie et un plateau de fromages pour dix personnes se commandent aussi
              simplement qu’un buffet pour une salle des fêtes.
            </p>
            <p>
              Nous préparons vos réceptions à Roanne et dans le Roannais, que vous receviez chez vous, dans une salle municipale ou dans un domaine, de Riorges à
              Mably, du Coteau à Villerest.
            </p>
          </div>
        </div>
      </section>

      {/* Boucher et traiteur */}
      <section className="section fond-olive grain" aria-labelledby="boucher-traiteur">
        <div className={`contenu ${styles.boucher}`}>
          <p className="surtitre apparait">Boucher et traiteur</p>
          <h2 id="boucher-traiteur" className="titre-l apparait">
            Un traiteur qui est aussi <em>boucher</em>
          </h2>
          <p className="chapo apparait">
            Nos rôtis froids, nos plats mijotés et nos plateaux sortent de la même maison que la viande vendue au comptoir. C’est l’avantage d’un traiteur qui
            est aussi boucher : nous savons d’où partent les produits et comment ils ont été préparés, du morceau choisi à l’assiette servie.
          </p>
          <Link href="/boucherie-roanne" className="lien-fleche apparait">
            Découvrir la boucherie de la rue Mulsant <FlecheDroite />
          </Link>
        </div>
      </section>

      <Faq id="faq" titre="Questions fréquentes sur le traiteur" questions={questions} />

      <AppelFinal
        titre="Parlons de votre réception"
        texte="Une date, un lieu, un nombre de personnes : c’est tout ce qu’il nous faut pour commencer. Le devis est gratuit."
        actions={
          <>
            <Link href="/contact?type=devis-traiteur" className="bouton">
              Demander un devis gratuit
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
