import { attributsImage, type ImageMedia } from "@/lib/media-url";

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
  ratio,
  largeurCible,
}: {
  image: ImageMedia | null | undefined;
  /** Attribut `sizes` (largeur affichée), obligatoire pour un `srcset` utile. */
  sizes: string;
  className?: string;
  /** Remplace l'alt du média (ex. "" pour une image décorative). */
  alt?: string;
  /** Image principale au-dessus de la ligne de flottaison : chargement immédiat, priorité haute. */
  priorite?: boolean;
  /** Proportions de l'aplat de secours (ex. "4/3") quand le média est absent. */
  ratio?: string;
  /** Largeur de la variante utilisée en `src` (navigateurs sans srcset). */
  largeurCible?: number;
}) {
  if (!image) {
    return <div className={className} style={ratio ? { aspectRatio: ratio, background: "var(--sable)" } : { background: "var(--sable)" }} aria-hidden="true" />;
  }
  const a = attributsImage(image, { sizes, largeurCible });
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
      loading={priorite ? "eager" : "lazy"}
      fetchPriority={priorite ? "high" : "auto"}
      decoding="async"
    />
  );
}
