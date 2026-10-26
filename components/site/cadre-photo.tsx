import { Logo } from "@/components/ui/logo";
import { Visuel } from "@/components/ui/visuel";
import type { ImageMedia } from "@/lib/media-url";
import styles from "./cadre-photo.module.css";

/**
 * Photo recadrée dans un `.cadre` (classes de ratio et d'arche passées par
 * `className`). Emplacement vide : aplat sable et monogramme discret, jamais
 * d'image cassée ni de trou dans la mise en page.
 */
export function CadrePhoto({
  image,
  sizes,
  className,
  alt,
  priorite = false,
  largeurCible,
}: {
  image: ImageMedia | null | undefined;
  sizes: string;
  className?: string;
  alt?: string;
  priorite?: boolean;
  largeurCible?: number;
}) {
  return (
    <div className={`cadre ${className ?? ""}`}>
      {image ? (
        <Visuel image={image} sizes={sizes} alt={alt} priorite={priorite} largeurCible={largeurCible} />
      ) : (
        <div className={styles.vide} aria-hidden="true">
          <Logo variante="monogramme" couleur="olive" taille={72} className={styles.monogramme} />
        </div>
      )}
    </div>
  );
}
