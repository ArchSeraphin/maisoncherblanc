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
  return (
    <html lang="fr" className={classesHtml}>
      <body>{children}</body>
    </html>
  );
}
