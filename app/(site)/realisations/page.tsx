import Link from "next/link";
import { AppelFinal } from "@/components/site/appel-final";
import { EnTetePage } from "@/components/site/en-tete-page";
import { Galerie } from "@/components/site/galerie";
import s from "@/components/site/sections.module.css";
import { JsonLd } from "@/components/ui/json-ld";
import { compterVue } from "@/lib/compter-vue";
import {
  categoriesUtilisees,
  estCategorieRealisation,
  LIBELLES_CATEGORIES,
  listerRealisationsPubliques,
  type CategorieRealisation,
} from "@/lib/realisations";
import { construireMetadata, elementsFilAriane, filArianeJsonLd, galerieJsonLd } from "@/lib/seo";
import { photoPartage } from "@/components/site/outils";
import styles from "./realisations.module.css";

const CHEMIN = "/realisations";
const ARIANE = elementsFilAriane(CHEMIN);

export async function generateMetadata() {
  // Les variantes filtrées (?categorie=) ont la galerie complète pour canonique.
  return construireMetadata({ chemin: CHEMIN, image: photoPartage([...listerRealisationsPubliques("plateaux"), ...listerRealisationsPubliques()].find((r) => !r.image.provisoire)?.image) });
}

/** Phrase de maillage sous la grille, selon le filtre (docs/COPY.md). */
function Renvoi({ categorie }: { categorie: CategorieRealisation | null }) {
  const lien = (href: string, texte: string) => (
    <Link href={href} className={s.lienTexte}>
      {texte}
    </Link>
  );
  switch (categorie) {
    case "mariage":
      return <>Vin d’honneur, buffet, pièce montée : découvrez notre service de {lien("/traiteur-roanne/mariage", "traiteur mariage")}.</>;
    case "cocktail":
    case "buffet":
    case "plateaux":
      return <>Pièces à l’unité, plateaux à la personne : voir le {lien("/traiteur-roanne/cocktail-dinatoire", "cocktail dînatoire et les buffets")}.</>;
    case "broche-barbecue":
      return <>Une rôtissoire installée chez vous : {lien("/traiteur-roanne/broche-barbecue", "jambon à la broche et barbecue")}.</>;
    case "boucherie":
      return <>Viandes, charcuterie et volailles : {lien("/boucherie-roanne", "la boucherie de la rue Mulsant")}.</>;
    default:
      return (
        <>
          Pour aller plus loin : {lien("/traiteur-roanne/mariage", "traiteur mariage")}, {lien("/traiteur-roanne/cocktail-dinatoire", "cocktail dînatoire et buffets")},{" "}
          {lien("/traiteur-roanne/broche-barbecue", "jambon à la broche et barbecue")}.
        </>
      );
  }
}

export default async function PageRealisations({ searchParams }: PageProps<"/realisations">) {
  await compterVue(CHEMIN);
  const brut = (await searchParams).categorie;
  const demande = typeof brut === "string" ? brut : null;
  const categorie = estCategorieRealisation(demande) ? demande : null;
  const filtres = categoriesUtilisees();
  const photos = listerRealisationsPubliques(categorie ?? undefined);

  return (
    <>
      <JsonLd donnees={[filArianeJsonLd(ARIANE), galerieJsonLd(photos.map((p) => ({ image: p.image, legende: p.legende })))]} />

      <EnTetePage
        ariane={ARIANE}
        sansImage
        surtitre="En images"
        titre={
          <>
            Nos <em>réalisations</em>
          </>
        }
        chapo={
          <p>
            Des plateaux du dimanche aux réceptions de mariage : voici quelques tables que nous avons préparées à Roanne et dans le Roannais. Toutes les photos
            sont les nôtres, prises en cuisine ou sur place.
          </p>
        }
      />

      <section className={`section-serree ${styles.zone}`} aria-labelledby="galerie-titre">
        <div className="contenu-large">
          <h2 id="galerie-titre" className="invisible-accessible">
            {categorie ? `Photos : ${LIBELLES_CATEGORIES[categorie]}` : "Toutes les photos"}
          </h2>
          {filtres.length > 1 ? (
            <nav className={styles.filtres} aria-label="Filtrer les photos par catégorie">
              <ul className="sans-puces">
                <li>
                  <Link href={CHEMIN} scroll={false} aria-current={categorie === null ? "page" : undefined} className={styles.filtre}>
                    Tout
                  </Link>
                </li>
                {filtres.map((f) => (
                  <li key={f.categorie}>
                    <Link
                      href={`${CHEMIN}?categorie=${f.categorie}`}
                      scroll={false}
                      aria-current={categorie === f.categorie ? "page" : undefined}
                      className={styles.filtre}
                    >
                      {f.libelle}
                      <span className={styles.nombre}>
                        {f.nombre}
                        <span className="invisible-accessible"> photos</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {photos.length ? (
            <Galerie key={categorie ?? "tout"} photos={photos.map((p) => ({ id: p.id, image: p.image, legende: p.legende }))} />
          ) : (
            <div className={`centre ${styles.vide}`}>
              <p className="chapo">Pas encore de photo dans cette catégorie. Revenez bientôt, ou parcourez toutes nos réalisations.</p>
              <Link href={CHEMIN} className="bouton">
                Voir tout
              </Link>
            </div>
          )}

          {photos.length ? (
            <p className={styles.renvoi}>
              <Renvoi categorie={categorie} />
            </p>
          ) : null}
        </div>
      </section>

      <AppelFinal
        titre="Votre réception sera la prochaine ?"
        actions={
          <Link href="/contact?type=devis-traiteur" className="bouton">
            Demander un devis
          </Link>
        }
      />
    </>
  );
}
