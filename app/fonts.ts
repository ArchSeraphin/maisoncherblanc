import localFont from "next/font/local";

/**
 * Polices du site (docs/DA.md), auto-hébergées (aucun appel à Google Fonts).
 * Partagées par app/layout.tsx et app/global-not-found.tsx (qui contourne le
 * layout racine).
 *
 * Fichiers de app/polices/ (licence OFL) dérivés des fichiers variables Google
 * Fonts (sous-ensemble « latin ») avec fontTools, pour alléger le premier
 * affichage (399 Kio -> 190 Kio, mesure du 26/10/2026) :
 * - jeu de caractères réduit au français : ASCII, Latin-1, œ Œ Ÿ, guillemets et
 *   apostrophes typographiques, demi-cadratin, points de suspension, € ; un
 *   caractère absent s'affiche dans la police de repli ;
 * - Fraunces : axes `opsz` et `wght` (300 à 500) conservés, axes `SOFT` et `WONK`
 *   figés aux valeurs de la DA (romain SOFT 30 WONK 0, italique SOFT 60 WONK 1) ;
 * - DM Sans : `opsz` conservé, `wght` 400 à 700 (italique 400 à 600).
 * Seule Fraunces (police des H1 : romain et italique des mots d'accent) est
 * préchargée ; DM Sans se charge à l'usage. `display: swap` et métriques de repli ajustées
 * (`adjustFontFallback`) : pas de texte invisible ni de saut de mise en page.
 */

/** Fraunces variable (opsz, wght) : titres, prix. Romain et italique. */
export const fraunces = localFont({
  src: [
    { path: "./polices/fraunces.woff2", weight: "300 500", style: "normal" },
    { path: "./polices/fraunces-italique.woff2", weight: "300 500", style: "italic" },
  ],
  variable: "--police-fraunces",
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
  fallback: ["Iowan Old Style", "Georgia", "serif"],
});

/** DM Sans variable (opsz, wght) : texte, surtitres, interface. */
export const dmSans = localFont({
  src: [
    { path: "./polices/dm-sans.woff2", weight: "400 700", style: "normal" },
    { path: "./polices/dm-sans-italique.woff2", weight: "400 600", style: "italic" },
  ],
  variable: "--police-dm-sans",
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

/** Classes du `<html>` : variables des polices. */
export const classesHtml = `${fraunces.variable} ${dmSans.variable}`;
