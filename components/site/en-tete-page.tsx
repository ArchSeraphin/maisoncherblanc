import type { ReactNode } from "react";
import type { ImageMedia } from "@/lib/media-url";
import { CadrePhoto } from "./cadre-photo";
import { FilAriane, type ElementAriane } from "./fil-ariane";
import styles from "./en-tete-page.module.css";

/**
 * En-tête des pages internes : fil d'Ariane, surtitre, H1 unique, chapô et
 * actions à gauche ; photo dans une arche à droite (format maîtrisé : les
 * photos réelles sont de qualité smartphone, jamais étirées en plein écran).
 * Sans `image` (pages légales, actualités) : variante typographique seule.
 * La photo est l'élément LCP : chargement prioritaire, léger zoom d'arrivée.
 */
export function EnTetePage({
  ariane,
  surtitre,
  titre,
  chapo,
  actions,
  image,
  sansImage = false,
  altImage,
  pied,
}: {
  ariane: ElementAriane[];
  surtitre?: ReactNode;
  titre: ReactNode;
  chapo?: ReactNode;
  actions?: ReactNode;
  /** Photo de l'emplacement (null = emplacement vide, monogramme de secours). */
  image?: ImageMedia | null;
  /** Variante sans visuel. */
  sansImage?: boolean;
  altImage?: string;
  /** Contenu sous les actions (ex. mention du PDF). */
  pied?: ReactNode;
}) {
  return (
    <section className={`${styles.entete} ${sansImage ? styles.sobre : ""}`}>
      <div className={`contenu-large ${styles.grille}`}>
        <div className={styles.texte}>
          <FilAriane elements={ariane} />
          {surtitre ? <p className="surtitre fondu-entree">{surtitre}</p> : null}
          <h1 className={`titre-xl fondu-entree ${styles.titre}`}>{titre}</h1>
          {chapo ? <div className={`chapo fondu-entree ${styles.chapo}`}>{chapo}</div> : null}
          {actions ? <div className={`rangee fondu-entree ${styles.actions}`}>{actions}</div> : null}
          {pied ? <div className={`fondu-entree ${styles.pied}`}>{pied}</div> : null}
        </div>
        {sansImage ? null : (
          <div className={styles.visuel}>
            <CadrePhoto
              image={image}
              alt={altImage}
              className={`cadre-arche zoom-lent ${styles.cadre}`}
              sizes="(min-width: 960px) min(40vw, 560px), 92vw"
              largeurCible={960}
              priorite
            />
            <span className={styles.filet} aria-hidden="true" />
          </div>
        )}
      </div>
    </section>
  );
}
