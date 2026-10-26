import type { ReactNode } from "react";
import styles from "./faq.module.css";

export type QuestionFaq = { question: string; reponse: string; reponseRiche?: ReactNode };

/**
 * Questions fréquentes en accordéon natif (`<details>`), sans JavaScript.
 * Les questions sont des H3 sous le H2 de la section. Le JSON-LD `FAQPage`
 * se pose à côté avec `faqJsonLd(questions)` (même texte).
 */
export function Faq({ titre, questions, id }: { titre: string; questions: QuestionFaq[]; id?: string }) {
  return (
    <section className={`section ${styles.faq}`} id={id} aria-labelledby={id ? `${id}-titre` : undefined}>
      <div className={`contenu ${styles.grille}`}>
        <div className={styles.entete}>
          <p className="surtitre">Questions fréquentes</p>
          <h2 className="titre-l" id={id ? `${id}-titre` : undefined}>
            {titre}
          </h2>
        </div>
        <div className={styles.liste}>
          {questions.map((q) => (
            <details key={q.question} className={styles.question}>
              <summary className={styles.resume}>
                <h3 className={styles.intitule}>{q.question}</h3>
                <span className={styles.signe} aria-hidden="true" />
              </summary>
              <div className={styles.reponse}>{q.reponseRiche ?? <p>{q.reponse}</p>}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
