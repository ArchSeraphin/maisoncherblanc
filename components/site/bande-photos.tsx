import Link from "next/link";
import { Visuel } from "@/components/ui/visuel";
import { FlecheDroite } from "@/components/ui/motifs";
import { listerRealisationsPubliques, type CategorieRealisation } from "@/lib/realisations";
import styles from "./bande-photos.module.css";

/**
 * Bande de petites photos réelles d'une catégorie de réalisations (format
 * maîtrisé : vignettes carrées), avec le lien vers la galerie filtrée.
 * Rien n'est affiché sans photo.
 */
export function BandePhotos({ categorie, lien, nombre = 4 }: { categorie: CategorieRealisation; lien: string; nombre?: number }) {
  const photos = listerRealisationsPubliques(categorie, nombre);
  if (!photos.length) return null;
  return (
    <div className={styles.bande}>
      <ul className={`sans-puces serie ${styles.liste}`}>
        {photos.map((r) => (
          <li key={r.id} className={`apparait ${styles.tuile}`}>
            <figure className={styles.figure}>
              <div className="cadre">
                <Visuel image={r.image} sizes="(min-width: 900px) 280px, 46vw" />
              </div>
              {r.legende ? <figcaption className={styles.legende}>{r.legende}</figcaption> : null}
            </figure>
          </li>
        ))}
      </ul>
      <Link href={`/realisations?categorie=${categorie}`} className={`lien-fleche ${styles.lien}`}>
        {lien} <FlecheDroite />
      </Link>
    </div>
  );
}
