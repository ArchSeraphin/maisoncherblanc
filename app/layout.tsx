import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { estNoindex, urlSite } from "@/lib/env";
import { classesHtml } from "./fonts";
import "./globals.css";

/** Lu au runtime (SITE_URL, NOINDEX) : jamais de valeur figée au build. */
export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(urlSite()),
    title: { default: siteConfig.titreParDefaut, template: siteConfig.modeleTitre },
    description: siteConfig.description,
    applicationName: siteConfig.nom,
    formatDetection: { telephone: false },
    ...(estNoindex() ? { robots: { index: false, follow: false } } : {}),
  };
}

export const viewport: Viewport = {
  themeColor: siteConfig.theme.creme,
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // `data-scroll-behavior="smooth"` : Next 16 coupe le défilement doux (posé en CSS
  // pour les ancres) le temps de remonter en haut à chaque changement de page.
  // Sans cet attribut, la remise à zéro était animée, Next la croyait ratée et
  // faisait un `scrollIntoView` du contenu : arrivée à 24-43 px du haut, bandeau
  // d'annonce masqué et en-tête qui glissait.
  return (
    <html lang="fr" className={classesHtml} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
