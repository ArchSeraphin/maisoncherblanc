import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/** Manifeste web (/manifest.webmanifest) : nom, couleurs de marque, icônes générées par `npm run logos`. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${siteConfig.nom}, ${siteConfig.descriptionCourte.charAt(0).toLowerCase()}${siteConfig.descriptionCourte.slice(1)}`,
    short_name: siteConfig.nom,
    description: siteConfig.description,
    lang: "fr",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "browser",
    background_color: siteConfig.theme.creme,
    theme_color: siteConfig.theme.olive,
    categories: ["food", "shopping"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
