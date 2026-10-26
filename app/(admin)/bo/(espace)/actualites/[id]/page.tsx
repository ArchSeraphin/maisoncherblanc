import Link from "next/link";
import { EditeurArticle } from "@/components/admin/actualites/editeur-article";
import { Etiquette } from "@/components/admin/champs";
import { EntetePage } from "@/components/admin/mise-en-page";
import { siteConfig } from "@/config/site";
import { etatArticle, LIBELLES_ETAT_ARTICLE, lireArticle } from "@/lib/articles";
import { requireUser } from "@/lib/auth";
import { lienAdmin } from "@/lib/chemin-admin";
import { heureParisPourChamp } from "@/lib/dates";
import { urlSite } from "@/lib/env";
import { listerImagesPretes } from "@/lib/media";
import { reprendreTraitements } from "@/lib/media-pipeline";

const GENRES = { publie: "succes", programme: "neutre", brouillon: "discret" } as const;

function lire(id: string) {
  return /^\d{1,12}$/.test(id) ? lireArticle(Number(id)) : null;
}

export async function generateMetadata({ params }: PageProps<"/bo/actualites/[id]">) {
  const a = lire((await params).id);
  return { title: a ? a.titre : "Actualité" };
}

export default async function PageActualite({ params }: PageProps<"/bo/actualites/[id]">) {
  await requireUser();
  reprendreTraitements();
  const a = lire((await params).id);
  if (!a) {
    return (
      <div className="bo-pile">
        <h1 className="bo-titre">Actualité introuvable</h1>
        <p className="bo-discret">Cette actualité n’existe plus (elle a peut-être été supprimée).</p>
        <p>
          <Link href={lienAdmin("/actualites")} className="bo-bouton bo-bouton-principal">
            Retour aux actualités
          </Link>
        </p>
      </div>
    );
  }
  const etat = etatArticle(a);
  return (
    <div className="bo-pile-large">
      <EntetePage
        retour={{ href: lienAdmin("/actualites"), libelle: "Actualités" }}
        titre="Modifier l’actualité"
        etiquettes={<Etiquette genre={GENRES[etat]}>{LIBELLES_ETAT_ARTICLE[etat]}</Etiquette>}
      />
      <EditeurArticle
        key={a.updated_at}
        article={{
          id: a.id,
          slug: a.slug,
          titre: a.titre,
          chapo: a.chapo,
          corps: a.corps,
          couverture_media_id: a.couverture_media_id,
          statut: a.statut,
          publie_le: heureParisPourChamp(a.publie_le),
          titre_seo: a.titre_seo,
          description_seo: a.description_seo,
          etat,
        }}
        mediatheque={listerImagesPretes()}
        domaine={urlSite()}
        modeleTitre={siteConfig.modeleTitre}
      />
    </div>
  );
}
