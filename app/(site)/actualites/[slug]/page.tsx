import Link from "next/link";
import { notFound } from "next/navigation";
import { CadrePhoto } from "@/components/site/cadre-photo";
import { FilAriane } from "@/components/site/fil-ariane";
import { META_INTROUVABLE } from "@/components/site/introuvable";
import { dateArticle, photoPartage } from "@/components/site/outils";
import { JsonLd } from "@/components/ui/json-ld";
import { Markdown } from "@/components/ui/markdown";
import { FiletLosange } from "@/components/ui/motifs";
import { articlePublie } from "@/lib/articles";
import { compterVue } from "@/lib/compter-vue";
import { texteBrut, tempsLecture } from "@/lib/markdown";
import { coordonnees } from "@/lib/reglages";
import { articleJsonLd, construireMetadata, elementsFilAriane, filArianeJsonLd } from "@/lib/seo";
import styles from "./article.module.css";

export async function generateMetadata({ params }: PageProps<"/actualites/[slug]">) {
  const { slug } = await params;
  const a = articlePublie(slug);
  // Article inconnu : métadonnées de la 404 (Next pose lui-même le seul `noindex`).
  if (!a) return META_INTROUVABLE;
  return construireMetadata({
    chemin: `/actualites/${a.slug}`,
    titreAbsolu: a.titre_seo || `${a.titre} | Maison Cherblanc`,
    description: a.description_seo || a.chapo || texteBrut(a.corps, 160),
    image: photoPartage(a.couverture),
    type: "article",
    publieLe: a.publie_le,
    modifieLe: a.updated_at,
  });
}

export default async function PageArticle({ params }: PageProps<"/actualites/[slug]">) {
  const { slug } = await params;
  const a = articlePublie(slug);
  if (!a) notFound();
  await compterVue(`/actualites/${a.slug}`);
  const coord = coordonnees();
  const ariane = elementsFilAriane(`/actualites/${a.slug}`, a.titre);
  const minutes = tempsLecture(a.corps);

  return (
    <>
      <JsonLd donnees={[articleJsonLd(a), filArianeJsonLd(ariane)]} />

      <article className={styles.article}>
        <header className={`contenu-etroit ${styles.entete}`}>
          <FilAriane elements={ariane} />
          <p className="surtitre fondu-entree">
            Actualités · <time dateTime={a.publie_le ?? undefined}>{dateArticle(a.publie_le)}</time>
            {minutes ? ` · ${minutes} min de lecture` : ""}
          </p>
          <h1 className={`titre-l glisse-entree ${styles.titre}`}>{a.titre}</h1>
          {a.chapo ? <p className={`chapo fondu-entree ${styles.chapo}`}>{a.chapo}</p> : null}
        </header>

        {a.couverture ? (
          <div className={`contenu ${styles.couverture}`}>
            <CadrePhoto image={a.couverture} className="ratio-large zoom-lent" sizes="(min-width: 1240px) 1100px, 94vw" priorite largeurCible={1600} />
          </div>
        ) : (
          <div className="contenu-etroit">
            <FiletLosange className={styles.filet} />
          </div>
        )}

        <div className={`contenu-etroit ${styles.corps}`}>
          <Markdown source={a.corps} className="prose" />
        </div>

        <aside className={`contenu-etroit ${styles.fin}`} aria-labelledby="question">
          <div className={styles.finBloc}>
            <h2 id="question" className="titre-m">
              Une question, une commande ?
            </h2>
            <p>
              Appelez la boutique au{" "}
              <a href={coord.telephone.href} className="lien-souligne">
                {coord.telephone.affichage}
              </a>{" "}
              ou écrivez-nous.
            </p>
            <Link href="/contact" className="bouton">
              Nous contacter
            </Link>
          </div>
          <Link href="/actualites" className={`lien-souligne ${styles.retour}`}>
            Toutes les actualités
          </Link>
        </aside>
      </article>
    </>
  );
}
