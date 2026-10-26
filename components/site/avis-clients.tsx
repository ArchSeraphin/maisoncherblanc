import { formaterJourLong } from "@/lib/dates";
import { listerAvisPublics } from "@/lib/avis";
import styles from "./avis-clients.module.css";

/**
 * Avis clients saisis à la main dans le backoffice. La section entière
 * disparaît tant qu'aucun avis n'est visible (aucun avis fictif, aucune note
 * moyenne, jamais d'`aggregateRating`).
 */
export function AvisClients({ limite = 3 }: { limite?: number }) {
  const avis = listerAvisPublics(limite);
  if (!avis.length) return null;
  return (
    <section className="section fond-lin" aria-labelledby="avis-titre">
      <div className="contenu">
        <div className={`centre ${styles.entete}`}>
          <p className="surtitre apparait">Ils nous ont confié leur table</p>
          <h2 id="avis-titre" className="titre-l apparait">
            Ce qu’en disent nos clients
          </h2>
        </div>
        <ul className={`sans-puces serie ${styles.liste}`}>
          {avis.map((a) => (
            <li key={a.id} className={`apparait ${styles.avis}`}>
              <figure className={styles.figure}>
                <blockquote className={styles.citation}>
                  <p>{a.texte}</p>
                </blockquote>
                <figcaption className={styles.auteur}>
                  <span>{a.auteur}</span>
                  <span className={styles.meta}>
                    {a.source === "google" ? "Avis Google" : "Avis client"}
                    {a.date ? `, ${formaterJourLong(a.date).replace(/^\S+ /, "")}` : ""}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
