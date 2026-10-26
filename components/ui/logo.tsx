/**
 * Logo de Maison Cherblanc (SVG statiques de public/logo, générés par
 * `npm run logos` depuis le logo vectoriel du client).
 *
 * - `variante="monogramme"` : « MC » seul (en-tête, favicon, séparateur).
 * - `variante="complet"` : logo circulaire (monogramme, cercle, « Maison
 *   Cherblanc », « Boucherie - Charcuterie - Traiteur »), pour le pied de page.
 * - `couleur` : `encre` ou `olive` sur fond clair, `creme` ou `or` sur fond olive.
 * Décoratif par défaut (`alt=""`) : le nom est écrit à côté en texte.
 */
export function Logo({
  variante = "monogramme",
  couleur = "olive",
  taille = 48,
  alt = "",
  className,
}: {
  variante?: "monogramme" | "complet";
  couleur?: "encre" | "olive" | "creme" | "or";
  taille?: number;
  alt?: string;
  className?: string;
}) {
  const fichier = variante === "complet" ? `logo-complet-${couleur}.svg` : `monogramme-${couleur}.svg`;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG vectoriel statique, pas d'optimisation utile
    <img src={`/logo/${fichier}`} width={taille} height={taille} alt={alt} className={className} decoding="async" />
  );
}
