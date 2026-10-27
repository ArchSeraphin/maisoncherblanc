"use client";

/**
 * En-tête du site public : logo, navigation du contrat (sous-menu « Le
 * traiteur »), téléphone et appel à l'action. Se compacte et prend un fond
 * crème translucide au défilement. Mobile : menu plein écran (Échap ferme,
 * défilement de la page bloqué, focus rendu au bouton).
 * Ne lie JAMAIS le backoffice.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { LienNavigation } from "@/config/site";
import { Logo } from "@/components/ui/logo";
import styles from "./entete.module.css";

type Props = {
  navigation: readonly LienNavigation[];
  appelAction: { href: string; libelle: string };
  telephone: { affichage: string; href: string };
  nom: string;
  signature: string;
};

function estActif(chemin: string, href: string): boolean {
  return href === "/" ? chemin === "/" : chemin === href || chemin.startsWith(`${href}/`);
}

export function Entete({ navigation, appelAction, telephone, nom, signature }: Props) {
  const chemin = usePathname() ?? "/";
  const [compact, setCompact] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [sousMenu, setSousMenu] = useState<string | null>(null);
  /**
   * Sous-menu refermé par Échap alors que le focus est encore dedans : sans cet
   * état, `:focus-within` le garderait affiché. Levé quand le pointeur revient ou
   * que le focus quitte l'entrée.
   */
  const [sousMenuMasque, setSousMenuMasque] = useState<string | null>(null);
  const boutonMenu = useRef<HTMLButtonElement>(null);
  const refEntete = useRef<HTMLElement>(null);

  /** Ouvre ou ferme le menu mobile ; le panneau démarre sous le bas réel de l'en-tête (bandeau d'annonce compris). */
  const basculerMenu = () => {
    const entete = refEntete.current;
    if (entete) entete.style.setProperty("--bas-entete", `${Math.max(0, entete.getBoundingClientRect().bottom)}px`);
    setMenuOuvert((o) => !o);
  };
  const idMenu = useId();

  useEffect(() => {
    const surDefilement = () => setCompact(window.scrollY > 24);
    surDefilement();
    window.addEventListener("scroll", surDefilement, { passive: true });
    return () => window.removeEventListener("scroll", surDefilement);
  }, []);

  // Fermeture à chaque changement de page (ajustement pendant le rendu, sans effet).
  const [cheminPrecedent, setCheminPrecedent] = useState(chemin);
  if (chemin !== cheminPrecedent) {
    setCheminPrecedent(chemin);
    setMenuOuvert(false);
    setSousMenu(null);
  }

  useEffect(() => {
    if (!menuOuvert && !sousMenu) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (menuOuvert) {
        setMenuOuvert(false);
        boutonMenu.current?.focus();
      }
      setSousMenu(null);
    };
    window.addEventListener("keydown", surTouche);
    const precedent = document.body.style.overflow;
    if (menuOuvert) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", surTouche);
      document.body.style.overflow = precedent;
    };
  }, [menuOuvert, sousMenu]);

  return (
    <header ref={refEntete} className={`${styles.entete} ${compact ? styles.compact : ""} ${menuOuvert ? styles.ouvert : ""}`}>
      <div className={styles.barre}>
        <Link href="/" className={styles.marque} aria-label={`${nom}, accueil`}>
          <Logo variante="monogramme" couleur="olive" taille={48} className={styles.monogramme} />
          <span className={styles.nom}>
            <span className={styles.nomPrincipal}>{nom}</span>
            <span className={styles.signature}>{signature}</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Navigation principale">
          <ul className={styles.liste}>
            {navigation.map((l) =>
              l.enfants?.length ? (
                <li
                  key={l.href}
                  className={styles.avecSousMenu}
                  data-ouvert={sousMenu === l.href ? "" : undefined}
                  data-masque={sousMenuMasque === l.href ? "" : undefined}
                  onMouseEnter={() => setSousMenuMasque((m) => (m === l.href ? null : m))}
                  onMouseLeave={() => setSousMenu((s) => (s === l.href ? null : s))}
                  onKeyDown={(e) => {
                    if (e.key !== "Escape") return;
                    setSousMenu(null);
                    setSousMenuMasque(l.href);
                    // Le focus revient sur l'entrée « Le traiteur » (il était peut-être dans le sous-menu).
                    (e.currentTarget.querySelector(`.${styles.lien}`) as HTMLElement | null)?.focus();
                  }}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSousMenuMasque((m) => (m === l.href ? null : m));
                  }}
                >
                  <Link href={l.href} className={`${styles.lien} lien-souligne`} aria-current={estActif(chemin, l.href) ? "page" : undefined}>
                    {l.libelle}
                  </Link>
                  <button
                    type="button"
                    className={styles.chevron}
                    aria-expanded={sousMenu === l.href}
                    aria-label={`Afficher les prestations : ${l.libelle}`}
                    onClick={() => {
                      setSousMenuMasque(null);
                      setSousMenu((s) => (s === l.href ? null : l.href));
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                  <ul className={styles.sousMenu}>
                    {l.enfants.map((e) => (
                      <li key={e.href}>
                        <Link href={e.href} className={styles.sousLien} aria-current={chemin === e.href ? "page" : undefined}>
                          {e.libelle}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={l.href}>
                  <Link href={l.href} className={`${styles.lien} lien-souligne`} aria-current={estActif(chemin, l.href) ? "page" : undefined}>
                    {l.libelle}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className={styles.actions}>
          <a href={telephone.href} className={styles.telephone}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            <span>{telephone.affichage}</span>
          </a>
          <Link href={appelAction.href} className={`bouton bouton-petit ${styles.cta}`}>
            {appelAction.libelle}
          </Link>
          <button
            ref={boutonMenu}
            type="button"
            className={styles.burger}
            aria-expanded={menuOuvert}
            aria-controls={idMenu}
            onClick={basculerMenu}
          >
            <span className={styles.burgerTraits} aria-hidden="true" />
            <span className="invisible-accessible">{menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}</span>
          </button>
        </div>
      </div>

      <div id={idMenu} className={styles.panneau} hidden={!menuOuvert}>
        <nav aria-label="Navigation mobile">
          <ul className={styles.listeMobile}>
            {navigation.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={styles.lienMobile} aria-current={estActif(chemin, l.href) ? "page" : undefined}>
                  {l.libelle}
                </Link>
                {l.enfants?.length ? (
                  <ul className={styles.sousListeMobile}>
                    {l.enfants
                      .filter((e) => e.href !== l.href)
                      .map((e) => (
                        <li key={e.href}>
                          <Link href={e.href} aria-current={chemin === e.href ? "page" : undefined}>
                            {e.libelle}
                          </Link>
                        </li>
                      ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.piedPanneau}>
          <Link href={appelAction.href} className="bouton">
            {appelAction.libelle}
          </Link>
          <a href={telephone.href} className="bouton bouton-contour">
            Appeler le {telephone.affichage}
          </a>
        </div>
      </div>
    </header>
  );
}
