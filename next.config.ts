import type { NextConfig } from "next";

/**
 * Configuration Next.js de Maison Cherblanc (modèle éprouvé du projet Woods).
 *
 * - Modèle de cache classique : pas de `cacheComponents` ni de `partialPrefetching`
 *   (create-next-app 16.4 les active ; incompatibles avec `force-dynamic` + SQLite synchrone).
 * - Modules natifs en `serverExternalPackages`.
 * - Redirections de confort des routes de la v1 (jamais indexées) en 301 explicite
 *   (`statusCode`), `permanent: true` produirait un 308.
 * - En-têtes de sécurité posés par proxy.ts (pas ici, pour ne pas les doubler) ;
 *   `/media/*` par sa route ; HSTS seulement en production HTTPS (proxy.ts) : ne pas
 *   l'ajouter aussi dans les étiquettes Traefik de Coolify (en-tête doublé).
 */
const nextConfig: NextConfig = {
  // Next 16.4 réécrit AGENTS.md à chaque `next dev` (texte avec tiret cadratin) : désactivé.
  agentRules: false,
  poweredByHeader: false,
  serverExternalPackages: ["better-sqlite3", "sharp"],
  experimental: {
    // Les envois du BO passent par la réécriture du proxy : le corps est tamponné
    // en mémoire et tronqué au-delà de cette limite (10 Mo par défaut). 26 Mo =
    // POIDS_MAX_UPLOAD (25 Mo, lib/media-pipeline.ts) + enveloppe multipart.
    // À garder cohérent avec server.js et le reverse proxy.
    proxyClientMaxBodySize: "26mb",
    // 404 des URL inconnues rendue par app/global-not-found.tsx, hors layouts.
    globalNotFound: true,
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    // Fichiers de public/ : cache de 30 jours. Un visuel modifié doit changer de NOM.
    const cache = [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }];
    return ["img", "logo", "icons", "fonts"].map((dossier) => ({ source: `/${dossier}/:path*`, headers: cache }));
  },
  async redirects() {
    const vers = (destination: string, ...sources: string[]) => sources.map((source) => ({ source, destination, statusCode: 301 as const }));
    return [
      ...vers("/la-maison", "/a-propos"),
      ...vers("/traiteur-roanne", "/services", "/traiteur"),
      ...vers("/boucherie-roanne", "/boucherie"),
      ...vers("/carte-traiteur", "/carte", "/menu"),
      ...vers("/menus-de-fetes", "/noel"),
      // Ancienne forme de l'URL (les photos montrent une rôtissoire à broche, pas un fumoir).
      ...vers("/traiteur-roanne/broche-barbecue", "/traiteur-roanne/broche-barbecue-fumoir"),
      // Hôte unique : www -> domaine nu (canonical et sitemap utilisent https://maisoncherblanc.fr).
      // Sans effet tant que le DNS de www ne pointe pas sur l'application.
      {
        source: "/:chemin*",
        has: [{ type: "host" as const, value: "www.maisoncherblanc.fr" }],
        destination: "https://maisoncherblanc.fr/:chemin*",
        statusCode: 301 as const,
      },
    ];
  },
};

export default nextConfig;
