import { EntetePage } from "@/components/admin/mise-en-page";
import { Emplacement } from "@/components/admin/photos/emplacement";
import { requireUser } from "@/lib/auth";
import { chargerEmplacements, EMPLACEMENTS } from "@/lib/emplacements";
import { listerImagesPretes } from "@/lib/media";
import { reprendreTraitements } from "@/lib/media-pipeline";

export const metadata = { title: "Photos des pages" };

/** Pages du site, dans l'ordre de la navigation, avec un nom simple. */
const PAGES: { chemin: string; nom: string }[] = [
  { chemin: "/", nom: "Accueil" },
  { chemin: "/boucherie-roanne", nom: "La boucherie" },
  { chemin: "/traiteur-roanne", nom: "Le traiteur" },
  { chemin: "/traiteur-roanne/mariage", nom: "Traiteur : mariage" },
  { chemin: "/traiteur-roanne/cocktail-dinatoire", nom: "Traiteur : cocktail dînatoire" },
  { chemin: "/traiteur-roanne/broche-barbecue", nom: "Traiteur : broche et barbecue" },
  { chemin: "/carte-traiteur", nom: "Carte traiteur" },
  { chemin: "/menus-de-fetes", nom: "Menus de fêtes" },
  { chemin: "/la-maison", nom: "La maison" },
  { chemin: "/contact", nom: "Contact" },
  { chemin: "", nom: "Partage sur les réseaux sociaux" },
];

export default async function PagePhotos() {
  await requireUser();
  reprendreTraitements();
  const images = chargerEmplacements(EMPLACEMENTS.map((e) => e.cle));
  const mediatheque = listerImagesPretes();
  const aRemplacer = Object.values(images).filter((i) => i?.provisoire).length;
  const vides = Object.values(images).filter((i) => !i).length;

  return (
    <div className="bo-pile-large">
      <EntetePage
        titre="Photos des pages"
        introduction="Les grandes photos de chaque page du site. Remplacez-les par une photo de la médiathèque ou par une nouvelle photo, prise par exemple avec votre téléphone."
      />
      {aRemplacer || vides ? (
        <p className="bo-alerte">
          {aRemplacer
            ? `${aRemplacer} visuel${aRemplacer > 1 ? "s" : ""} provisoire${aRemplacer > 1 ? "s" : ""} (illustrations en attendant de vraies photos)`
            : ""}
          {aRemplacer && vides ? " et " : ""}
          {vides ? `${vides} emplacement${vides > 1 ? "s" : ""} sans photo` : ""} : repérez le badge « Visuel provisoire à remplacer ».
        </p>
      ) : (
        <p className="bo-alerte bo-alerte-succes">Toutes les pages ont leur photo définitive.</p>
      )}
      {PAGES.map((p) => {
        const liste = EMPLACEMENTS.filter((e) => e.page === p.chemin);
        if (!liste.length) return null;
        return (
          <section key={p.chemin || "partage"} className="bo-section" aria-labelledby={`page-${p.chemin || "partage"}`}>
            <h2 id={`page-${p.chemin || "partage"}`} className="bo-sous-titre">
              {p.nom}
            </h2>
            {p.chemin === "" ? (
              <p className="bo-discret">Image affichée quand une page du site est partagée sur Facebook, WhatsApp… (format paysage).</p>
            ) : null}
            <div className="bo-emplacements">
              {liste.map((e) => (
                <Emplacement
                  key={e.cle}
                  e={{ cle: e.cle, libelle: e.libelle, page: e.page, ratio: e.ratio, image: images[e.cle] }}
                  mediatheque={mediatheque}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
