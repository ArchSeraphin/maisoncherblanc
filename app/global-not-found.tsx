import type { Metadata, Viewport } from "next";
import { Habillage } from "@/components/site/habillage";
import { ContenuIntrouvable, META_INTROUVABLE } from "@/components/site/introuvable";
import { siteConfig } from "@/config/site";
import { urlSite } from "@/lib/env";
import { classesHtml } from "./fonts";
import "./globals.css";

/**
 * 404 du site pour toute URL sans route : URL inconnue, `/admin`, accès direct
 * au segment interne (réécrit par proxy.ts vers `/introuvable-404`).
 * REQUIERT `experimental.globalNotFound: true` (next.config.ts).
 * Contourne le layout racine : document et métadonnées repris de app/layout.tsx.
 * Aucune vue comptée. Pas de `robots` ici : Next pose déjà
 * `<meta name="robots" content="noindex">` sur toute 404 (une seule balise).
 * Textes : docs/COPY.md, section « Page 404 » (components/site/introuvable.tsx).
 */

export async function generateMetadata(): Promise<Metadata> {
  return { metadataBase: new URL(urlSite()), ...META_INTROUVABLE };
}

export const viewport: Viewport = { themeColor: siteConfig.theme.creme, colorScheme: "light" };

export default function GlobalNotFound() {
  return (
    <html lang="fr" className={classesHtml}>
      <body>
        <Habillage>
          <ContenuIntrouvable />
        </Habillage>
      </body>
    </html>
  );
}
