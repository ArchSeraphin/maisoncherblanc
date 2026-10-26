import Link from "next/link";
import { CadrePhoto } from "@/components/site/cadre-photo";
import { EnTetePage } from "@/components/site/en-tete-page";
import { dateArticle } from "@/components/site/outils";
import { JsonLd } from "@/components/ui/json-ld";
import { FlecheDroite } from "@/components/ui/motifs";
import { listerArticlesPublies } from "@/lib/articles";
import { compterVue } from "@/lib/compter-vue";
import { texteBrut } from "@/lib/markdown";
import { construireMetadata, elementsFilAriane, filArianeJsonLd, listeArticlesJsonLd } from "@/lib/seo";
import styles from "./actualites.module.css";

const CHEMIN = "/actualites";
const ARIANE = elementsFilAriane(CHEMIN);

export async function generateMetadata() {
  return construireMetadata({ chemin: CHEMIN });
}

function tronquer(texte: string, max = 160): string {
  if (texte.length <= max) return texte;
  return `${texte.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

export default async function PageActualites() {
  await compterVue(CHEMIN);
  const articles = listerArticlesPublies({ limite: 60 });

  return (
    <>
      <JsonLd donnees={[filArianeJsonLd(ARIANE), listeArticlesJsonLd(articles)]} />
      <EnTetePage
        ariane={ARIANE}
        sansImage
        surtitre="Le journal de la maison"
        titre={
          <>
            Actualités et <em>conseils</em>
          </>
        }
        chapo={
          <p>
            Dates de commande, nouveautés de la carte, conseils du boucher et du traiteur : ce qui se passe rue Mulsant, et ce qui peut vous servir en cuisine.
          </p>
        }
      />

      <section className={`section-serree ${styles.zone}`}>
        <div className="contenu">
          {articles.length ? (
            <ul className={`sans-puces serie ${styles.liste}`}>
              {articles.map((a) => (
                <li key={a.id} className={`apparait ${styles.article}`}>
                  <article className={styles.carte}>
                    {a.couverture ? (
                      <CadrePhoto image={a.couverture} alt="" className={`ratio-paysage cadre-zoom ${styles.image}`} sizes="(min-width: 900px) 360px, 92vw" />
                    ) : null}
                    <div className={styles.texte}>
                      <p className="surtitre">
                        <time dateTime={a.publie_le ?? undefined}>{dateArticle(a.publie_le)}</time>
                      </p>
                      <h2 className={`titre-m ${styles.titre}`}>
                        <Link href={`/actualites/${a.slug}`} className={styles.lien}>
                          {a.titre}
                        </Link>
                      </h2>
                      <p className={styles.chapo}>{tronquer(a.chapo || texteBrut(a.corps, 400))}</p>
                      <span className={`lien-fleche ${styles.lire}`} aria-hidden="true">
                        Lire l’article <FlecheDroite />
                      </span>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <div className={`centre ${styles.vide}`}>
              <h2 className="titre-l">Les premières nouvelles arrivent</h2>
              <p className="chapo">
                Nous publierons ici les dates des commandes de fêtes, les nouveautés de la carte et quelques conseils du boucher et du traiteur. En attendant, la
                carte traiteur et les horaires sont à jour.
              </p>
              <div className={`rangee ${styles.videActions}`}>
                <Link href="/carte-traiteur" className="bouton">
                  Voir la carte traiteur
                </Link>
                <Link href="/contact" className="bouton bouton-contour">
                  Horaires et contact
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
