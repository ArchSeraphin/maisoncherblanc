import { EditeurArticle } from "@/components/admin/actualites/editeur-article";
import { EntetePage } from "@/components/admin/mise-en-page";
import { siteConfig } from "@/config/site";
import { requireUser } from "@/lib/auth";
import { lienAdmin } from "@/lib/chemin-admin";
import { urlSite } from "@/lib/env";
import { listerImagesPretes } from "@/lib/media";
import { reprendreTraitements } from "@/lib/media-pipeline";

export const metadata = { title: "Nouvelle actualité" };

export default async function PageNouvelleActualite() {
  await requireUser();
  reprendreTraitements();
  return (
    <div className="bo-pile-large">
      <EntetePage retour={{ href: lienAdmin("/actualites"), libelle: "Actualités" }} titre="Nouvelle actualité" />
      <EditeurArticle article={null} mediatheque={listerImagesPretes()} domaine={urlSite()} modeleTitre={siteConfig.modeleTitre} />
    </div>
  );
}
