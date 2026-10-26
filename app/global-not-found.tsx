import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Habillage } from "@/components/site/habillage";
import styles from "@/components/site/introuvable.module.css";
import { Logo } from "@/components/ui/logo";
import { FiletLosange } from "@/components/ui/motifs";
import { siteConfig } from "@/config/site";
import { urlSite } from "@/lib/env";
import { coordonnees } from "@/lib/reglages";
import { classesHtml } from "./fonts";
import "./globals.css";

/**
 * 404 du site pour toute URL sans route : URL inconnue, `/admin`, accès direct
 * au segment interne (réécrit par proxy.ts vers `/introuvable-404`).
 * REQUIERT `experimental.globalNotFound: true` (next.config.ts).
 * Contourne le layout racine : document et métadonnées repris de app/layout.tsx.
 * Aucune vue comptée. Textes : docs/COPY.md, section « Page 404 ».
 */

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(urlSite()),
    title: { absolute: "Page introuvable | Maison Cherblanc, Roanne" },
    description: siteConfig.description,
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = { themeColor: siteConfig.theme.creme, colorScheme: "light" };

export default function GlobalNotFound() {
  const coord = coordonnees();
  return (
    <html lang="fr" className={classesHtml}>
      <body>
        <Habillage>
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
        </Habillage>
      </body>
    </html>
  );
}
