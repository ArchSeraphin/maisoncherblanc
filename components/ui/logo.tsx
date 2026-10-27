/**
 * Logo de Maison Cherblanc (fichiers statiques de public/logo, générés par
 * `npm run logos` depuis le logo vectoriel du client).
 *
 * - `variante="monogramme"` : « MC » seul (en-tête, favicon, séparateur), SVG de 5 Kio.
 * - `variante="complet"` : logo circulaire (monogramme, cercle, « Maison
 *   Cherblanc », « Boucherie - Charcuterie - Traiteur »), pour le pied de page.
 *   Le SVG complet pèse 119 Kio (tracés très détaillés) : en or (seule couleur
 *   utilisée par le site), on sert des WebP rendus depuis ce SVG en 150, 300 et
 *   450 px (7, 17 et 28 Kio), choisis selon la densité de l'écran. À régénérer
 *   si le logo change (même rendu, mêmes noms).
 * - `couleur` : `encre` ou `olive` sur fond clair, `creme` ou `or` sur fond olive.
 * Décoratif par défaut (`alt=""`) : le nom est écrit à côté en texte.
 */

const MATRICIELS: Partial<Record<string, number[]>> = { "complet-or": [150, 300, 450] };

export function Logo({
  variante = "monogramme",
  couleur = "olive",
  taille = 48,
  alt = "",
  className,
  differe = false,
}: {
  variante?: "monogramme" | "complet";
  couleur?: "encre" | "olive" | "creme" | "or";
  taille?: number;
  alt?: string;
  className?: string;
  /** Chargement différé (logo sous la ligne de flottaison, ex. pied de page). */
  differe?: boolean;
}) {
  const largeurs = MATRICIELS[`${variante}-${couleur}`];
  if (largeurs) {
    const base = `/logo/logo-complet-${couleur}`;
    const src1x = largeurs.find((l) => l >= taille) ?? largeurs[largeurs.length - 1];
    return (
      // eslint-disable-next-line @next/next/no-img-element -- variantes WebP statiques déjà dimensionnées
      <img
        src={`${base}-${src1x}.webp`}
        srcSet={largeurs.map((l) => `${base}-${l}.webp ${l}w`).join(", ")}
        sizes={`${taille}px`}
        width={taille}
        height={taille}
        alt={alt}
        className={className}
        loading={differe ? "lazy" : undefined}
        decoding="async"
      />
    );
  }
  const fichier = variante === "complet" ? `logo-complet-${couleur}.svg` : `monogramme-${couleur}.svg`;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG vectoriel statique, pas d'optimisation utile
    <img
      src={`/logo/${fichier}`}
      width={taille}
      height={taille}
      alt={alt}
      className={className}
      loading={differe ? "lazy" : undefined}
      decoding="async"
    />
  );
}
