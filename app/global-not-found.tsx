import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Habillage } from "@/components/site/habillage";
import { siteConfig } from "@/config/site";
import { urlSite } from "@/lib/env";
import { classesHtml } from "./fonts";
import "./globals.css";

/**
 * 404 du site pour toute URL sans route : URL inconnue, `/admin`, accès direct
 * au segment interne (réécrit par proxy.ts vers `/introuvable-404`).
 * REQUIERT `experimental.globalNotFound: true` (next.config.ts).
 * Contourne le layout racine : document et métadonnées repris de app/layout.tsx.
 * Aucune vue comptée. Mise en forme à reprendre par le lot « pages publiques ».
 */

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(urlSite()),
    title: { absolute: `Page introuvable | ${siteConfig.nom}` },
    description: siteConfig.description,
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = { themeColor: siteConfig.theme.creme, colorScheme: "light" };

export default function GlobalNotFound() {
  return (
    <html lang="fr" className={classesHtml}>
      <body>
        <Habillage>
          <section className="section contenu">
            <p className="surtitre">Erreur 404</p>
            <h1 className="titre-l">Cette page est introuvable</h1>
            <p className="chapo" style={{ marginTop: "1.5rem" }}>
              Le lien est peut-être ancien, ou la page a changé d’adresse. Le comptoir, lui, n’a pas bougé.
            </p>
            <div className="rangee" style={{ marginTop: "2rem" }}>
              <Link href="/" className="bouton">
                Retour à l’accueil
              </Link>
              <Link href="/carte-traiteur" className="bouton bouton-contour">
                Voir la carte traiteur
              </Link>
            </div>
          </section>
        </Habillage>
      </body>
    </html>
  );
}
