import Link from "next/link";
import { Etiquette } from "@/components/admin/champs";
import { Icone } from "@/components/admin/icones";
import { EntetePage, EtatVide } from "@/components/admin/mise-en-page";
import { Vignette } from "@/components/admin/photos/choix-photo";
import { LIBELLES_ETAT_ARTICLE, listerArticlesAdmin } from "@/lib/articles";
import { requireUser } from "@/lib/auth";
import { lienAdmin } from "@/lib/chemin-admin";
import { formaterHorodatage } from "@/lib/dates";
import { reprendreTraitements } from "@/lib/media-pipeline";

export const metadata = { title: "Actualités" };

const GENRES = { publie: "succes", programme: "neutre", brouillon: "discret" } as const;

export default async function PageActualites() {
  await requireUser();
  reprendreTraitements();
  const articles = listerArticlesAdmin();
  const nouvelle = (
    <Link href={lienAdmin("/actualites/nouvelle")} className="bo-bouton bo-bouton-principal">
      <Icone nom="plus" taille={18} />
      Nouvelle actualité
    </Link>
  );
  return (
    <div className="bo-pile-large">
      <EntetePage
        titre="Actualités"
        introduction="Nouveautés de la boutique, menus de saison, événements : chaque actualité a sa page sur le site et aide à être trouvé sur Google."
        actions={nouvelle}
      />
      {articles.length ? (
        <ul className="bo-articles">
          {articles.map((a) => (
            <li key={a.id} className="bo-carte bo-article">
              <Vignette image={a.couverture} alt="" />
              <div className="bo-pile" style={{ gap: "0.3rem" }}>
                <h3>
                  <Link href={lienAdmin(`/actualites/${a.id}`)}>{a.titre}</Link>
                </h3>
                <div className="bo-menu-infos">
                  <Etiquette genre={GENRES[a.etat]}>{LIBELLES_ETAT_ARTICLE[a.etat]}</Etiquette>
                  <span className="bo-discret">
                    {a.etat === "brouillon"
                      ? `Modifiée le ${formaterHorodatage(a.updated_at)}`
                      : a.etat === "programme"
                        ? `En ligne le ${formaterHorodatage(a.publie_le!)}`
                        : `Publiée le ${formaterHorodatage(a.publie_le!)}`}
                  </span>
                </div>
              </div>
              <div className="bo-article-actions">
                <Link href={lienAdmin(`/actualites/${a.id}`)} className="bo-bouton bo-bouton-secondaire bo-bouton-petit">
                  <Icone nom="crayon" taille={18} />
                  Modifier
                </Link>
                {a.etat === "publie" ? (
                  <a href={`/actualites/${a.slug}`} target="_blank" rel="noreferrer" className="bo-bouton bo-bouton-discret bo-bouton-petit">
                    <Icone nom="externe" taille={18} />
                    Voir<span className="bo-invisible"> « {a.titre} » sur le site (nouvel onglet)</span>
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EtatVide titre="Aucune actualité pour l’instant" action={nouvelle}>
          Une idée pour commencer : présenter le menu de fêtes, une nouveauté de la vitrine, ou un mariage récent (avec l’accord des mariés).
        </EtatVide>
      )}
    </div>
  );
}
