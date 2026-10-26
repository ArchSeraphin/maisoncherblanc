import Link from "next/link";
import { notFound } from "next/navigation";
import { AppelFinal } from "@/components/site/appel-final";
import { CarteMenu } from "@/components/site/carte-menu";
import { EnTetePage } from "@/components/site/en-tete-page";
import { ancreSection, lignes, periode, photoPartage } from "@/components/site/outils";
import { JsonLd } from "@/components/ui/json-ld";
import { siteConfig } from "@/config/site";
import { compterVue } from "@/lib/compter-vue";
import { chargerEmplacements } from "@/lib/emplacements";
import { formaterPoids } from "@/lib/media-url";
import { carteTraiteur } from "@/lib/menus";
import { coordonnees } from "@/lib/reglages";
import { construireMetadata, elementsFilAriane, filArianeJsonLd, menuJsonLd } from "@/lib/seo";
import styles from "./carte.module.css";

const CHEMIN = "/carte-traiteur";
const ARIANE = elementsFilAriane(CHEMIN);

export async function generateMetadata() {
  return construireMetadata({ chemin: CHEMIN, image: photoPartage(chargerEmplacements(["carte-hero"] as const)["carte-hero"]) });
}

export default async function PageCarte() {
  await compterVue(CHEMIN);
  const carte = carteTraiteur();
  if (!carte) notFound();
  const img = chargerEmplacements(["carte-hero"] as const);
  const coord = coordonnees();
  const validite = periode(carte.valable_du, carte.valable_au);

  return (
    <>
      <JsonLd donnees={[menuJsonLd(carte, CHEMIN), filArianeJsonLd(ARIANE)]} />

      <EnTetePage
        ariane={ARIANE}
        surtitre={`${carte.titre} · Roanne`}
        titre={
          <>
            Carte <em>traiteur</em> et tarifs
          </>
        }
        chapo={
          <p>
            Toute la carte traiteur de Maison Cherblanc, avec ses prix : plateaux et formules à la personne, entrées et plats cuisinés à la part, quiches et
            pizzas à la plaque, petit dînatoire à la pièce, desserts.{validite ? ` Tarifs valables ${validite}.` : ""} Commande une semaine avant, à la
            boutique, {siteConfig.adresse.rue} à {siteConfig.adresse.ville}.
          </p>
        }
        actions={
          <>
            {carte.pdf ? (
              <a href={carte.pdf.urlTelechargement} className="bouton" download>
                Télécharger la carte (PDF)
              </a>
            ) : null}
            <Link href="/contact?type=devis-traiteur" className={`bouton ${carte.pdf ? "bouton-contour" : ""}`}>
              Demander un devis
            </Link>
          </>
        }
        pied={
          carte.pdf ? (
            <p className="mention">
              PDF, {formaterPoids(carte.pdf.poids)} ·{" "}
              <a href={carte.pdf.url} className="lien-souligne" target="_blank" rel="noopener">
                ouvrir dans le navigateur<span className="invisible-accessible"> (nouvel onglet)</span>
              </a>
            </p>
          ) : null
        }
        image={img["carte-hero"]}
      />

      <section className={`section fond-lin ${styles.zone}`} aria-label="La carte">
        <div className={`contenu-large ${styles.grille}`}>
          <nav className={styles.sommaire} aria-label="Sommaire de la carte">
            <p className={styles.sommaireTitre}>Sommaire</p>
            <ol className="sans-puces">
              {carte.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${ancreSection(s.titre)}`}>{s.titre}</a>
                </li>
              ))}
            </ol>
          </nav>

          <div className={styles.carte}>
            <CarteMenu sections={carte.sections} />

            <div className={styles.infos} id="commander">
              <section className={styles.commander} aria-labelledby="commander-titre">
                <h2 id="commander-titre" className="titre-m">
                  Commander
                </h2>
                <ul className="sans-puces">
                  {lignes(carte.infos_commande).map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                  {carte.note_bas ? <li>{carte.note_bas}</li> : null}
                  <li>
                    <strong>Retrait :</strong> à la boutique, {siteConfig.adresse.rue}, aux horaires d’ouverture.
                  </li>
                  <li>
                    <strong>Téléphone :</strong>{" "}
                    <a href={coord.telephone.href} className="lien-souligne">
                      {coord.telephone.affichage}
                    </a>{" "}
                    ou{" "}
                    <a href={coord.mobile.href} className="lien-souligne">
                      {coord.mobile.affichage}
                    </a>
                    .
                  </li>
                </ul>
              </section>
              <p className={`mention ${styles.noteBas}`}>
                Prix TTC.{validite ? ` Tarifs valables ${validite}.` : ""} Photos non contractuelles.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AppelFinal
        titre="Vous ne trouvez pas exactement ce que vous cherchez ?"
        texte="La carte est un point de départ. Dites-nous ce que vous imaginez, nous vous faisons une proposition et un devis gratuit."
        actions={
          <>
            <Link href="/contact?type=devis-traiteur" className="bouton">
              Demander un devis
            </Link>
            <Link href="/traiteur-roanne" className="bouton bouton-contour">
              Découvrir le traiteur à Roanne
            </Link>
          </>
        }
      />
    </>
  );
}
