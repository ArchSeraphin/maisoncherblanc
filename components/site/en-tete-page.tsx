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
 * En bureau, la photo est l'élément LCP : préchargée en priorité haute (seulement
 * au-delà de 960 px ; en mobile, elle est sous le titre, qui passe devant, et
 * se charge à l'approche), `sizes` calé sur la
 * largeur réelle de l'arche (520 px au plus en bureau, 440 px en mobile),
 * léger zoom d'arrivée. Le H1 glisse sans fondu (visible dès le premier affichage).
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
          <h1 className={`titre-xl glisse-entree ${styles.titre}`}>{titre}</h1>
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
              sizes="(min-width: 960px) min(520px, 36vw), min(440px, calc(100vw - 3.75rem))"
              largeurCible={960}
              prioriteSi="(min-width: 960px)"
            />
            <span className={`forme-arche ${styles.filet}`} aria-hidden="true" />
          </div>
        )}
      </div>
    </section>
  );
}
