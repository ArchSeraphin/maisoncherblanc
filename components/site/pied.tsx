import Link from "next/link";
import { adresseUneLigne, siteConfig, type HorairesSemaine } from "@/config/site";
import { Logo } from "@/components/ui/logo";
import { formaterJourCourt, jourDeSemaine } from "@/lib/dates";
import type { HoraireExceptionnel } from "@/lib/horaires-exceptionnels";
import { grouperHoraires } from "@/lib/horaires";
import { jourCourt } from "./outils";
import styles from "./pied.module.css";

type Coordonnees = {
  telephone: { affichage: string; href: string };
  mobile: { affichage: string; href: string };
  email: string;
};

/** Libellé d'un horaire exceptionnel : « Fermé », « 8h–12h » ou la note. */
function texteExceptionnel(h: HoraireExceptionnel): string {
  if (h.plages === null) return h.note || "Horaires particuliers";
  if (h.plages.length === 0) return "Fermé";
  return jourCourt(h.plages, " · ");
}

/**
 * Pied de page (fond olive profond) : logo, coordonnées, horaires de la semaine
 * type (base, même format que partout : « 7h30–13h · 15h–19h »), horaires exceptionnels des 30 prochains jours, navigation,
 * liens légaux et réseaux. Ne lie JAMAIS le backoffice.
 */
export function Pied({
  horaires,
  exceptionnels,
  coordonnees,
}: {
  horaires: HorairesSemaine;
  exceptionnels: HoraireExceptionnel[];
  coordonnees: Coordonnees;
}) {
  const groupes = grouperHoraires(horaires);
  const annee = new Date().getFullYear();
  return (
    <footer className={`${styles.pied} fond-olive-profond`}>
      <div className={`contenu-large ${styles.grille}`}>
        <div className={styles.marque}>
          <Logo variante="complet" couleur="or" taille={150} differe alt={`${siteConfig.nom}, ${siteConfig.activite.toLowerCase()}`} />
          <p className={styles.accroche}>
            Boucherie, charcuterie et traiteur
            <br />
            au cœur de Roanne.
          </p>
        </div>

        <div className={styles.colonne}>
          <h2 className={styles.titre}>Nous trouver</h2>
          <address className={styles.adresse}>
            <span>{siteConfig.adresse.rue}</span>
            <span>
              {siteConfig.adresse.codePostal} {siteConfig.adresse.ville}
            </span>
          </address>
          <ul className={`sans-puces ${styles.contacts}`}>
            <li>
              <span className={styles.etiquette}>Boutique</span>
              <a href={coordonnees.telephone.href} className={styles.numero}>
                {coordonnees.telephone.affichage}
              </a>
            </li>
            <li>
              <span className={styles.etiquette}>Mobile</span>
              <a href={coordonnees.mobile.href} className={styles.numero}>
                {coordonnees.mobile.affichage}
              </a>
            </li>
            <li>
              <a href={`mailto:${coordonnees.email}`} className="lien-souligne">
                {coordonnees.email}
              </a>
            </li>
          </ul>
          <a href={siteConfig.itineraire} className="lien-fleche" rel="noopener" target="_blank">
            Itinéraire
            <span className="invisible-accessible"> vers {adresseUneLigne()} (nouvel onglet)</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <div className={styles.colonne}>
          <h2 className={styles.titre}>Horaires de la boutique</h2>
          <dl className={styles.horaires}>
            {groupes.map((g) => (
              <div key={g.jours.join("-")} className={styles.ligneHoraire}>
                <dt>{g.libelle}</dt>
                <dd className={g.ferme ? styles.ferme : undefined}>{g.ferme ? "Fermé" : jourCourt(horaires[g.jours[0]], " · ")}</dd>
              </div>
            ))}
          </dl>
          {exceptionnels.length ? (
            <div className={styles.exceptionnels}>
              <p className={styles.sousTitre}>Horaires exceptionnels</p>
              <ul className="sans-puces">
                {exceptionnels.map((h) => (
                  <li key={h.id}>
                    <span className={styles.date}>
                      {jourDeSemaine(h.date).replace(/^./, (c) => c.toUpperCase())} {formaterJourCourt(h.date)}
                    </span>
                    <span>
                      {texteExceptionnel(h)}
                      {h.plages !== null && h.note ? `. ${h.note}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <nav className={styles.colonne} aria-label="Plan du site">
          <h2 className={styles.titre}>La maison</h2>
          <ul className={`sans-puces ${styles.liens}`}>
            {siteConfig.navigation.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="lien-souligne">
                  {l.libelle}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/contact" className="lien-souligne">
                Contact et devis
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className={`contenu-large ${styles.bas}`}>
        <p>
          © {annee} {siteConfig.nom}
        </p>
        <ul className={`sans-puces ${styles.legal}`}>
          <li>
            <Link href="/mentions-legales" className="lien-souligne">
              Mentions légales
            </Link>
          </li>
          <li>
            <Link href="/politique-de-confidentialite" className="lien-souligne">
              Politique de confidentialité
            </Link>
          </li>
          <li>
            <a href={siteConfig.reseaux.facebook} rel="noopener" target="_blank" className="lien-souligne">
              Facebook<span className="invisible-accessible"> (nouvel onglet)</span>
            </a>
          </li>
          <li>
            <a href={siteConfig.reseaux.instagram} rel="noopener" target="_blank" className="lien-souligne">
              Instagram<span className="invisible-accessible"> (nouvel onglet)</span>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
