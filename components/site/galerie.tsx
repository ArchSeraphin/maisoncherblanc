"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Visuel } from "@/components/ui/visuel";
import type { ImageMedia } from "@/lib/media-url";
import styles from "./galerie.module.css";

export type PhotoGalerie = { id: number; image: ImageMedia; legende: string };

/**
 * Galerie des réalisations : vignettes aux proportions réelles (colonnes),
 * visionneuse plein écran au clic (`<dialog>` natif : piège du focus, Échap).
 * Flèches gauche/droite du clavier pour passer d'une photo à l'autre ; à la
 * fermeture, le focus revient sur la vignette ouverte.
 */
export function Galerie({ photos }: { photos: PhotoGalerie[] }) {
  const [indice, setIndice] = useState<number | null>(null);
  const dialogue = useRef<HTMLDialogElement>(null);
  const vignettes = useRef<(HTMLButtonElement | null)[]>([]);
  const dernier = useRef<number | null>(null);

  const ouvrir = (i: number) => {
    dernier.current = i;
    setIndice(i);
    dialogue.current?.showModal();
  };

  const fermer = useCallback(() => dialogue.current?.close(), []);

  const aller = useCallback(
    (sens: 1 | -1) => {
      setIndice((i) => {
        if (i === null) return i;
        const n = (i + sens + photos.length) % photos.length;
        dernier.current = n;
        return n;
      });
    },
    [photos.length],
  );

  useEffect(() => {
    const d = dialogue.current;
    if (!d) return;
    const surFermeture = () => {
      setIndice(null);
      const i = dernier.current;
      if (i !== null) vignettes.current[i]?.focus();
    };
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        aller(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        aller(-1);
      }
    };
    d.addEventListener("close", surFermeture);
    d.addEventListener("keydown", surTouche);
    return () => {
      d.removeEventListener("close", surFermeture);
      d.removeEventListener("keydown", surTouche);
    };
  }, [aller]);

  const courante = indice !== null ? photos[indice] : null;

  return (
    <>
      <ul className={`sans-puces ${styles.grille}`}>
        {photos.map((p, i) => (
          <li key={p.id} className={styles.element}>
            <button
              type="button"
              ref={(el) => {
                vignettes.current[i] = el;
              }}
              className={`cadre ${styles.vignette}`}
              onClick={() => ouvrir(i)}
              aria-haspopup="dialog"
            >
              <Visuel
                image={p.image}
                sizes="(min-width: 1440px) 440px, (min-width: 900px) calc((100vw - 7rem) / 3), calc((100vw - 3.25rem) / 2)"
                largeurMax={960}
              />
              <span className="invisible-accessible">Agrandir la photo : </span>
              {p.legende ? <span className={styles.legende}>{p.legende}</span> : <span className="invisible-accessible">{p.image.alt}</span>}
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogue}
        className={styles.visionneuse}
        aria-label="Visionneuse de photos"
        onClick={(e) => {
          // Clic sur le fond (hors photo et boutons) : fermeture.
          if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.fond !== undefined) fermer();
        }}
      >
        {courante ? (
          <div className={styles.scene} data-fond="">
            <figure className={styles.figure}>
              <Visuel key={courante.id} image={courante.image} sizes="92vw" largeurCible={1600} className={styles.grande} />
              <figcaption className={styles.legendeGrande}>
                <span>{courante.legende || courante.image.alt}</span>
                <span className={styles.compteur} aria-live="polite">
                  {(indice ?? 0) + 1} / {photos.length}
                </span>
              </figcaption>
            </figure>
            {photos.length > 1 ? (
              <>
                <button type="button" className={`${styles.nav} ${styles.precedent}`} onClick={() => aller(-1)} aria-label="Photo précédente">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button type="button" className={`${styles.nav} ${styles.suivant}`} onClick={() => aller(1)} aria-label="Photo suivante">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            ) : null}
            <button type="button" className={styles.fermer} onClick={fermer} aria-label="Fermer la visionneuse" autoFocus>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
