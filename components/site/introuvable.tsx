import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { FiletLosange } from "@/components/ui/motifs";
import { siteConfig } from "@/config/site";
import { coordonnees } from "@/lib/reglages";
import styles from "./introuvable.module.css";

/** Métadonnées communes des pages 404 (Next ajoute lui-même le `noindex`). */
export const META_INTROUVABLE = {
  title: { absolute: "Page introuvable | Maison Cherblanc, Roanne" },
  description: "Cette page n’existe pas ou plus. Maison Cherblanc, boucherie et traiteur, 55 rue Mulsant à Roanne.",
};

/**
 * Contenu de la page 404 (docs/COPY.md, « Page 404 ») : partagé par
 * app/global-not-found.tsx (URL sans route) et app/(site)/not-found.tsx
 * (`notFound()` d'une page publique, ex. article inconnu).
 */
export function ContenuIntrouvable() {
  const coord = coordonnees();
  return (
    <section className={`section grain ${styles.introuvable}`}>
      <div className={`contenu-etroit centre ${styles.contenu}`}>
        <div className={`arche-contour ${styles.arche}`}>
          <Logo variante="monogramme" couleur="olive" taille={64} className={styles.monogramme} />
          <p className="surtitre">Erreur 404</p>
          <h1 className={`titre-l ${styles.titre}`}>
            Cette page n’est plus en <em>vitrine</em>
          </h1>
          <p className="chapo">
            L’adresse demandée n’existe pas, ou plus. La boucherie et le traiteur, eux, sont toujours au {siteConfig.adresse.rue}.
          </p>
          <FiletLosange className={styles.filet} />
          <div className={`rangee ${styles.actions}`}>
            <Link href="/" className="bouton">
              Retour à l’accueil
            </Link>
            <Link href="/boucherie-roanne" className="bouton bouton-contour">
              La boucherie
            </Link>
            <Link href="/traiteur-roanne" className="bouton bouton-contour">
              Le traiteur
            </Link>
          </div>
          <p className="mention">
            Vous cherchiez quelque chose de précis ? Appelez-nous au{" "}
            <a href={coord.telephone.href} className="lien-souligne">
              {coord.telephone.affichage}
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
