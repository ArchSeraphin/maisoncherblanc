import { DM_Sans, Fraunces } from "next/font/google";

/**
 * Polices du site (docs/DA.md), téléchargées au build et servies depuis notre
 * domaine (aucun appel à Google Fonts côté visiteur). Partagées par
 * app/layout.tsx et app/global-not-found.tsx (qui contourne le layout racine).
 */

/** Fraunces variable (wght, opsz, SOFT, WONK) : titres, prix. Romain et italique. */
export const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
  variable: "--police-fraunces",
  display: "swap",
});

/** DM Sans variable (wght, opsz) : texte, surtitres, interface. */
export const dmSans = DM_Sans({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--police-dm-sans",
  display: "swap",
});

/** Classes du `<html>` : variables des polices. */
export const classesHtml = `${fraunces.variable} ${dmSans.variable}`;
