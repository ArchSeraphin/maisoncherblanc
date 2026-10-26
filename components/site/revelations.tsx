"use client";

import { useEffect } from "react";

/**
 * Révélation des blocs au défilement : un seul IntersectionObserver pour la
 * page, aucune dépendance. Les éléments `.apparait` reçoivent `.est-visible`
 * une fois entrés dans le champ, puis sont oubliés.
 *
 * L'état masqué n'existe qu'en CSS sous `(prefers-reduced-motion: no-preference)
 * and (scripting: enabled)` (app/globals.css) : sans JavaScript ou avec
 * « réduire les animations », tout est visible d'emblée et ce composant ne fait rien.
 * Monté une fois par le layout public (components/site/habillage.tsx).
 */
export function Revelations() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("est-visible");
          observateur.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const observerTout = () => {
      for (const el of document.querySelectorAll(".apparait:not(.est-visible)")) observateur.observe(el);
    };
    observerTout();

    // Navigation client : on observe aussi les blocs ajoutés ensuite.
    const veille = new MutationObserver(observerTout);
    veille.observe(document.body, { childList: true, subtree: true });

    return () => {
      observateur.disconnect();
      veille.disconnect();
    };
  }, []);

  return null;
}
