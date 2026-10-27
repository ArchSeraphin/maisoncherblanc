"use client";

import Link from "next/link";
import { useEffect } from "react";
import { siteConfig } from "@/config/site";
import styles from "./introuvable.module.css";

/**
 * Contenu des pages d'erreur (docs/COPY.md, « Page 500 ») : app/(site)/error.tsx
 * (dans le layout du site) et app/error.tsx (repli hors site public). Sobre :
 * aucun détail technique affiché, un bouton pour réessayer.
 */
export function Contretemps({ erreur, reessayer }: { erreur: Error & { digest?: string }; reessayer: () => void }) {
  useEffect(() => {
    console.error(erreur);
  }, [erreur]);
  const tel = siteConfig.telephones.boutique;
  return (
    <section className={`section ${styles.introuvable}`}>
      <div className={`contenu-etroit centre ${styles.contenu}`}>
        <div className={`arche-contour ${styles.arche}`}>
          <p className="surtitre">Erreur</p>
          <h1 className={`titre-l ${styles.titre}`}>
            Un contretemps en <em>cuisine</em>
          </h1>
          <p className="chapo">
            La page n’a pas pu s’afficher. Réessayez dans un instant, ou appelez la boutique au{" "}
            <a href={tel.href} className="lien-souligne">
              {tel.affichage}
            </a>
            .
          </p>
          <div className={`rangee ${styles.actions}`}>
            <button type="button" className="bouton" onClick={reessayer}>
              Réessayer
            </button>
            <Link href="/" className="bouton bouton-contour">
              Retour à l’accueil
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
