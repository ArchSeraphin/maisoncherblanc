import Link from "next/link";
import styles from "./fil-ariane.module.css";

export type ElementAriane = { nom: string; chemin: string };

/**
 * Fil d'Ariane visible (« Accueil › Traiteur à Roanne › Mariage »), toutes les
 * pages sauf l'accueil. Le dernier élément est la page courante (`aria-current`).
 * Le JSON-LD `BreadcrumbList` correspondant se pose avec `filArianeJsonLd(elements)`.
 */
export function FilAriane({ elements, className }: { elements: ElementAriane[]; className?: string }) {
  const tous = [{ nom: "Accueil", chemin: "/" }, ...elements];
  return (
    <nav aria-label="Fil d’Ariane" className={`${styles.fil}${className ? ` ${className}` : ""}`}>
      <ol className={styles.liste}>
        {tous.map((e, i) => {
          const dernier = i === tous.length - 1;
          return (
            <li key={e.chemin} className={styles.element}>
              {dernier ? (
                <span aria-current="page">{e.nom}</span>
              ) : (
                <>
                  <Link href={e.chemin} className="lien-souligne">
                    {e.nom}
                  </Link>
                  <span className={styles.separateur} aria-hidden="true">
                    ›
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
