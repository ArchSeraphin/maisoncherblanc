import { LigneCarte } from "@/components/ui/motifs";
import { groupesComposition } from "@/lib/composition";
import type { Plat, SectionAvecPlats } from "@/lib/menus";
import { ancreSection } from "./outils";
import styles from "./carte-menu.module.css";

/**
 * Rendu d'une carte depuis la base (carte traiteur, menus de fêtes) :
 * une section par `menu_sections`, H2 + note de section en petites capitales
 * (« À la part »), lignes « nom ........ prix UNITÉ » ; les sections mises en
 * avant (formules) en encadrés avec leur composition (`# Entrée` = intertitre).
 * Ancres stables dérivées des titres (`#petit-dinatoire`).
 */
export function CarteMenu({ sections, niveauTitre = 2 }: { sections: SectionAvecPlats[]; niveauTitre?: 2 | 3 }) {
  const Titre = niveauTitre === 2 ? "h2" : "h3";
  const SousTitre = niveauTitre === 2 ? "h3" : "h4";
  return (
    <div className={styles.carte}>
      {sections.map((s) => (
        <section key={s.id} id={ancreSection(s.titre)} className={`${styles.section} ${s.mise_en_avant ? styles.misEnAvant : ""}`}>
          <header className={styles.entete}>
            <Titre className={`titre-m ${styles.titre}`}>{s.titre}</Titre>
            {s.note ? <p className={styles.note}>{s.note}</p> : null}
          </header>
          {s.mise_en_avant ? (
            <div className={styles.formules}>
              {s.plats.map((p) => (
                <Formule key={p.id} plat={p} Titre={SousTitre} />
              ))}
            </div>
          ) : (
            <ul className={`sans-puces ${styles.lignes}`}>
              {s.plats.map((p) => {
                const compo = groupesComposition(p.description).flatMap((g) => g.elements);
                return (
                  <li key={p.id}>
                    <LigneCarte nom={p.nom} prix={p.prix} unite={p.unite} badge={p.badge} detail={compo.length ? compo.join(", ") : undefined} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

function Formule({ plat, Titre }: { plat: Plat; Titre: "h3" | "h4" }) {
  const groupes = groupesComposition(plat.description);
  return (
    <article className={styles.formule}>
      <div className={styles.formuleTete}>
        <Titre className={styles.formuleNom}>
          {plat.nom}
          {plat.badge ? (
            <>
              {" "}
              <span className="badge">{plat.badge}</span>
            </>
          ) : null}
        </Titre>
        {plat.prix ? (
          <p className={styles.formulePrix}>
            <span className="prix-fort">{plat.prix}</span>
            {plat.unite ? <span className="unite">{plat.unite}</span> : null}
          </p>
        ) : null}
      </div>
      {groupes.map((g, i) => (
        <div key={i} className={styles.groupe}>
          {g.titre ? <p className={styles.intertitre}>{g.titre}</p> : null}
          <ul className={`sans-puces ${styles.composition}`}>
            {g.elements.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ))}
    </article>
  );
}
