import { JOURS, LIBELLES_JOURS, type HorairesSemaine } from "@/config/site";
import { formaterJourLong, jourDeSemaine, jourParis } from "@/lib/dates";
import type { HoraireExceptionnel } from "@/lib/horaires-exceptionnels";
import { jourCourt } from "./outils";
import styles from "./horaires.module.css";

/**
 * Tableau des horaires de la semaine type (lus en base), le jour courant mis
 * en évidence. Les plages d'un jour sont séparées par un point médian.
 */
export function TableauHoraires({ horaires, legende }: { horaires: HorairesSemaine; legende?: string }) {
  const aujourdhui = jourDeSemaine(jourParis());
  return (
    <table className={styles.tableau}>
      {legende ? <caption className="invisible-accessible">{legende}</caption> : null}
      <tbody>
        {JOURS.map((j) => {
          const ferme = horaires[j].length === 0;
          return (
            <tr key={j} className={j === aujourdhui ? styles.aujourdhui : undefined} aria-current={j === aujourdhui ? "date" : undefined}>
              <th scope="row">
                {LIBELLES_JOURS[j]}
                {j === aujourdhui ? <span className="invisible-accessible"> (aujourd’hui)</span> : null}
              </th>
              <td className={ferme ? styles.ferme : undefined}>{jourCourt(horaires[j], " · ")}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** Texte d'un horaire exceptionnel : plages, « fermé » ou la note. */
export function texteExceptionnel(h: HoraireExceptionnel): string {
  if (h.plages === null) return h.note || "Horaires particuliers";
  if (h.plages.length === 0) return "fermé";
  return jourCourt(h.plages);
}

/** Liste « {date} : {libellé} ({plages} ou fermé) » des jours exceptionnels. */
export function ListeExceptionnels({ exceptionnels, titre }: { exceptionnels: HoraireExceptionnel[]; titre?: string }) {
  if (!exceptionnels.length) return null;
  return (
    <div className={styles.exceptionnels}>
      {titre ? <p className={styles.titreExc}>{titre}</p> : null}
      <ul className="sans-puces">
        {exceptionnels.map((h) => (
          <li key={h.id}>
            <span className={styles.date}>{majuscule(formaterJourLong(h.date))}</span>
            {" : "}
            {h.libelle ? `${h.libelle} (${texteExceptionnel(h)})` : texteExceptionnel(h)}
            {h.plages !== null && h.note ? <span className={styles.noteExc}> {h.note}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const majuscule = (t: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
