import { EntetePage, EtatVide, VoirSurLeSite } from "@/components/admin/mise-en-page";
import { EnvoiRealisations } from "@/components/admin/realisations/envoi-realisations";
import { ListeRealisations } from "@/components/admin/realisations/liste-realisations";
import { requireUser } from "@/lib/auth";
import { reprendreTraitements } from "@/lib/media-pipeline";
import { CATEGORIES_REALISATION, LIBELLES_CATEGORIES, listerRealisationsAdmin } from "@/lib/realisations";

export const metadata = { title: "Réalisations" };

export default async function PageRealisations() {
  await requireUser();
  reprendreTraitements();
  const realisations = listerRealisationsAdmin();
  const categories = CATEGORIES_REALISATION.map((c) => ({ valeur: c, libelle: LIBELLES_CATEGORIES[c] }));
  const visibles = realisations.filter((r) => r.visible).length;
  const sansAlt = realisations.filter((r) => !r.alt.trim()).length;
  return (
    <div className="bo-pile-large">
      <EntetePage
        titre="Réalisations"
        introduction="Les photos de la galerie du site (mariages, buffets, plateaux…), filtrables par catégorie. L’ordre ici est celui du site."
        actions={<VoirSurLeSite chemin="/realisations" />}
      />

      <section className="bo-section" aria-labelledby="titre-envoi">
        <h2 id="titre-envoi" className="bo-sous-titre">
          Ajouter des photos
        </h2>
        <EnvoiRealisations categories={categories} />
      </section>

      <section className="bo-section" aria-labelledby="titre-galerie">
        <div className="bo-section-entete">
          <h2 id="titre-galerie" className="bo-sous-titre">
            Galerie
          </h2>
          <span className="bo-discret">
            {realisations.length} photo{realisations.length > 1 ? "s" : ""}, dont {visibles} sur le site
          </span>
        </div>
        {sansAlt ? (
          <p className="bo-alerte bo-alerte-erreur">
            {sansAlt} photo{sansAlt > 1 ? "s n’ont" : " n’a"} pas de description : ajoutez-la avec le crayon.
          </p>
        ) : null}
        <p className="bo-discret">Pour changer l’ordre : glissez une photo par sa poignée, ou utilisez les flèches.</p>
        {realisations.length ? (
          <ListeRealisations
            categories={categories}
            realisations={realisations.map((r) => ({
              id: r.id,
              legende: r.legende,
              categorie: r.categorie,
              visible: r.visible,
              alt: r.alt,
              provisoire: r.provisoire,
              statut: r.statut_media,
              image: r.image,
            }))}
          />
        ) : (
          <EtatVide titre="La galerie est vide">Ajoutez vos premières photos avec le bouton « Choisir des photos » ci-dessus.</EtatVide>
        )}
      </section>
    </div>
  );
}
