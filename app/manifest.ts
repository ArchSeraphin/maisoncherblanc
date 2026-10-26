import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.nom,
    short_name: siteConfig.nom,
    description: siteConfig.descriptionCourte,
    lang: "fr",
    start_url: "/",
    display: "browser",
    background_color: siteConfig.theme.creme,
    theme_color: siteConfig.theme.olive,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
