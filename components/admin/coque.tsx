"use client";

/**
 * Coquille du backoffice : navigation latérale (bureau) ou tiroir (mobile),
 * déconnexion, lien « Voir le site » (rel="noreferrer"). Le chemin secret
 * arrive par le contexte (layout admin).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCheminAdmin } from "./contexte-admin";
import { Icone } from "./icones";
import { NAVIGATION_ADMIN } from "./navigation";
import { FournisseurRetours } from "./retours";

type Props = {
  utilisateur: { name: string; email: string };
  actionDeconnexion: () => Promise<void>;
  /** Pastilles par module (ex. { "/messages": 3 }). */
  pastilles?: Record<string, number>;
  children: React.ReactNode;
};

export function CoqueAdmin({ utilisateur, actionDeconnexion, pastilles = {}, children }: Props) {
  const base = useCheminAdmin();
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);

  const actif = (href: string) => {
    const complet = `${base}${href}`;
    return href === "" ? chemin === base || chemin === `${base}/` : chemin === complet || chemin.startsWith(`${complet}/`);
  };

  // Fermeture du tiroir à chaque changement de page (ajustement pendant le rendu).
  const [cheminPrecedent, setCheminPrecedent] = useState(chemin);
  if (chemin !== cheminPrecedent) {
    setCheminPrecedent(chemin);
    setOuvert(false);
  }
  useEffect(() => {
    if (!ouvert) return;
    const surTouche = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [ouvert]);

  const nav = (
    <nav aria-label="Backoffice" className="bo-nav">
      <ul>
        {NAVIGATION_ADMIN.map((m) => {
          const n = pastilles[m.href] ?? 0;
          return (
            <li key={m.href || "accueil"}>
              <Link href={`${base}${m.href}`} aria-current={actif(m.href) ? "page" : undefined} className="bo-nav-lien">
                <Icone nom={m.icone} />
                <span>{m.libelle}</span>
                {n > 0 ? (
                  <span className="bo-pastille" aria-label={`${n} non lu${n > 1 ? "s" : ""}`}>
                    {n}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="bo-nav-bas">
        <a href="/" target="_blank" rel="noreferrer" className="bo-nav-lien">
          <Icone nom="externe" />
          <span>Voir le site</span>
          <span className="bo-invisible"> (nouvel onglet)</span>
        </a>
        <p className="bo-utilisateur" title={utilisateur.email}>
          {utilisateur.name || utilisateur.email}
        </p>
        <form action={actionDeconnexion}>
          <button type="submit" className="bo-nav-lien bo-nav-bouton">
            <Icone nom="sortie" />
            <span>Se déconnecter</span>
          </button>
        </form>
      </div>
    </nav>
  );

  const marque = (
    <Link href={base} className="bo-marque">
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG statique */}
      <img src="/logo/monogramme-olive.svg" alt="" width={36} height={36} />
      <span>
        Maison Cherblanc
        <small>Gestion du site</small>
      </span>
    </Link>
  );

  return (
    <FournisseurRetours>
      <div className="bo-coque">
        <a href="#bo-contenu" className="bo-evitement">
          Aller au contenu
        </a>
        <header className="bo-barre-mobile">
          {marque}
          <button
            type="button"
            className="bo-bouton bo-bouton-secondaire"
            aria-expanded={ouvert}
            aria-controls="bo-tiroir"
            onClick={() => setOuvert(true)}
          >
            <Icone nom="menu" taille={18} />
            Menu
            {pastilles["/messages"] ? <span className="bo-pastille">{pastilles["/messages"]}</span> : null}
          </button>
        </header>

        {ouvert ? (
          <div className="bo-tiroir-fond">
            <button type="button" className="bo-tiroir-voile" aria-label="Fermer le menu" onClick={() => setOuvert(false)} />
            <div id="bo-tiroir" role="dialog" aria-modal="true" aria-label="Menu du backoffice" className="bo-tiroir">
              <div className="bo-tiroir-tete">
                {marque}
                <button type="button" className="bo-bouton-icone" aria-label="Fermer le menu" onClick={() => setOuvert(false)} autoFocus>
                  <Icone nom="fermer" />
                </button>
              </div>
              {nav}
            </div>
          </div>
        ) : null}

        <aside className="bo-laterale">
          <div className="bo-laterale-interieur">
            {marque}
            {nav}
          </div>
        </aside>

        <main id="bo-contenu" tabIndex={-1} className="bo-principal">
          <div className="bo-largeur">{children}</div>
        </main>
      </div>
    </FournisseurRetours>
  );
}
