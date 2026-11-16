import Link from "next/link";
import { EnTetePage } from "@/components/site/en-tete-page";
import { FicheMariage } from "@/components/site/fiche-mariage";
import { siteConfig } from "@/config/site";
import { compterVue } from "@/lib/compter-vue";
import { emettreJeton, USAGE_FICHE_MARIAGE } from "@/lib/jeton-formulaire";
import { coordonnees } from "@/lib/reglages";
import { construireMetadata, elementsFilAriane } from "@/lib/seo";

/**
 * Fiche mariage : la « Demande de devis mariage » papier, en ligne et en
 * étapes. Lien envoyé par la boutique après un premier contact, proposé aussi
 * depuis la page Mariage et la confirmation d'une demande de devis traiteur.
 * Non indexée, absente du sitemap.
 */
const CHEMIN = "/traiteur-roanne/mariage/fiche";
const ARIANE = elementsFilAriane(CHEMIN);

export async function generateMetadata() {
  return construireMetadata({ chemin: CHEMIN, noindex: true });
}

export default async function PageFicheMariage() {
  await compterVue(CHEMIN);
  const coord = coordonnees();

  return (
    <>
      <EnTetePage
        ariane={ARIANE}
        sansImage
        surtitre="Mariages · Demande de devis"
        titre={
          <>
            Votre fiche <em>mariage</em>
          </>
        }
        chapo={
          <p>
            Quelques étapes pour nous raconter votre journée : la date, le lieu, le vin d’honneur, le menu et le service. Comptez une dizaine de minutes. Rien
            n’est définitif : à partir de vos réponses, nous préparons une proposition de menu et un devis gratuit, puis nous l’ajustons ensemble.
          </p>
        }
      />

      <section className="section-serree" aria-label="Fiche mariage">
        <div className="contenu">
          <noscript>
            <p className="chapo">
              Cette fiche a besoin de JavaScript. Vous pouvez aussi nous écrire depuis la <Link href="/contact?type=devis-traiteur">page Contact</Link>, ou
              nous appeler au <a href={coord.mobile.href}>{coord.mobile.affichage}</a>.
            </p>
          </noscript>
          <FicheMariage
            jeton={emettreJeton(USAGE_FICHE_MARIAGE)}
            telephone={coord.telephone}
            mobile={coord.mobile}
            conservationMois={siteConfig.confidentialite.conservationMessagesMois}
          />
        </div>
      </section>
    </>
  );
}
