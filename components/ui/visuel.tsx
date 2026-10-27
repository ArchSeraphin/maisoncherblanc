import { preload } from "react-dom";
import { attributsImage, urlMedia, type ImageMedia } from "@/lib/media-url";

/**
 * Image de la médiathèque : `srcset`/`sizes` (variantes WebP de la pipeline)
 * et `width`/`height` réels (anti-CLS). Média absent : aplat discret (jamais
 * d'image cassée), aux proportions de `ratio` si fourni.
 *
 *   <Visuel image={img} sizes="(min-width: 1024px) 50vw, 100vw" />
 *   <div className="cadre ratio-paysage cadre-zoom"><Visuel image={img} sizes="33vw" /></div>
 */
export function Visuel({
  image,
  sizes,
  className,
  alt,
  priorite = false,
  immediat = false,
  ratio,
  largeurCible,
  largeurMax,
  prioriteSi,
}: {
  image: ImageMedia | null | undefined;
  /** Attribut `sizes` (largeur affichée), obligatoire pour un `srcset` utile. */
  sizes: string;
  className?: string;
  /** Remplace l'alt du média (ex. "" pour une image décorative). */
  alt?: string;
  /** Image principale au-dessus de la ligne de flottaison : chargement immédiat, priorité haute. */
  priorite?: boolean;
  /**
   * Chargement immédiat (jamais différé) sans priorité haute : seconde image d'un
   * premier écran, qui ne doit pas disputer la bande passante à l'image LCP.
   */
  immediat?: boolean;
  /** Proportions de l'aplat de secours (ex. "4/3") quand le média est absent. */
  ratio?: string;
  /** Largeur de la variante utilisée en `src` (navigateurs sans srcset). */
  largeurCible?: number;
  /**
   * Variantes plus larges exclues du `srcset` (vignettes : inutile de servir
   * 1600 px à un téléphone 3x pour une image de 170 px).
   */
  largeurMax?: number;
  /**
   * Priorité haute SEULEMENT quand cette requête média est vraie (ex.
   * "(min-width: 960px)") : préchargement `fetchpriority=high` limité à ces
   * écrans, qui part dès la lecture du <head> (l'attribut `loading="lazy"` de
   * l'image ne le retarde donc pas). Ailleurs, chargement différé ordinaire.
   * Pour une image qui n'est l'élément principal qu'en bureau (en mobile, elle
   * est sous le titre, qui passe devant).
   */
  prioriteSi?: string;
}) {
  if (!image) {
    return <div className={className} style={ratio ? { aspectRatio: ratio, background: "var(--sable)" } : { background: "var(--sable)" }} aria-hidden="true" />;
  }
  const a = attributsImage(image, { sizes, largeurCible });
  if (largeurMax) {
    const sources = image.variantes.sources.filter((v) => v.largeur <= largeurMax);
    const retenues = sources.length ? sources : image.variantes.sources.slice(0, 1);
    a.srcSet = retenues.map((v) => `${urlMedia(v.chemin)} ${v.largeur}w`).join(", ");
    a.src = urlMedia(retenues[retenues.length - 1].chemin);
  }
  if (prioriteSi && !priorite) {
    preload(a.src, { as: "image", imageSrcSet: a.srcSet, imageSizes: a.sizes, fetchPriority: "high", media: prioriteSi });
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- variantes déjà générées par la pipeline sharp, servies par /media
    <img
      src={a.src}
      srcSet={a.srcSet}
      sizes={a.sizes}
      width={a.width}
      height={a.height}
      alt={alt ?? a.alt}
      className={className}
      loading={priorite || immediat ? "eager" : "lazy"}
      fetchPriority={priorite ? "high" : "auto"}
      decoding="async"
    />
  );
}
