import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import styles from "./appel-final.module.css";

/**
 * Appel à l'action de fin de page (fond olive profond, qui s'enchaîne avec le
 * pied de page) : un H2, une phrase, un ou deux boutons.
 */
export function AppelFinal({ titre, texte, actions }: { titre: ReactNode; texte?: ReactNode; actions: ReactNode }) {
  return (
    <section className={`fond-olive-profond ${styles.appel}`}>
      <div className={`contenu ${styles.grille}`}>
        <Logo variante="monogramme" couleur="or" taille={56} className={`apparait ${styles.monogramme}`} />
        <h2 className={`titre-l apparait ${styles.titre}`}>{titre}</h2>
        {texte ? <p className={`chapo apparait ${styles.texte}`}>{texte}</p> : null}
        <div className={`rangee apparait ${styles.actions}`}>{actions}</div>
      </div>
    </section>
  );
}
