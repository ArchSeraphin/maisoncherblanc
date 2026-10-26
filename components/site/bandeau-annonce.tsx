import Link from "next/link";
import type { Annonce } from "@/lib/reglages";
import styles from "./bandeau-annonce.module.css";

/** Bandeau d'annonce en haut du site (réglage `annonce`, éditable dans le BO). */
export function BandeauAnnonce({ annonce }: { annonce: Annonce }) {
  const externe = /^https:\/\//i.test(annonce.lien);
  return (
    <div className={styles.bandeau} role="region" aria-label="Annonce">
      <p className={styles.texte}>
        <span className={styles.losange} aria-hidden="true" />
        {annonce.lien ? (
          externe ? (
            <a href={annonce.lien} rel="noopener" className={styles.lien}>
              {annonce.texte}
            </a>
          ) : (
            <Link href={annonce.lien} className={styles.lien}>
              {annonce.texte}
            </Link>
          )
        ) : (
          annonce.texte
        )}
      </p>
    </div>
  );
}
