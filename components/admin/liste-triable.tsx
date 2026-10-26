"use client";

/**
 * Liste réordonnable maison (aucune dépendance) :
 * - glisser-déposer à la poignée (pointer events : souris ET doigt) ;
 * - flèches « Monter » / « Descendre » (téléphone, clavier) ; flèches du clavier sur la poignée.
 * L'ordre change tout de suite à l'écran puis est enregistré par `surReordonner(ids)` ;
 * en cas d'échec, l'ordre précédent revient et un message l'explique.
 */

import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import type { EtatAction } from "@/lib/formulaire";
import { Icone } from "./icones";
import { useNotifier } from "./retours";

export type ControlesTri = {
  index: number;
  total: number;
  enDeplacement: boolean;
  /** Poignée + flèches, prêtes à placer dans la ligne. */
  controles: React.ReactNode;
};

type Props<T> = {
  elements: readonly T[];
  idDe: (e: T) => number;
  nomDe: (e: T) => string;
  surReordonner: (ids: number[]) => Promise<EtatAction>;
  rendu: (e: T, c: ControlesTri) => React.ReactNode;
  disposition?: "liste" | "grille";
  className?: string;
  classeElement?: string;
  /** Nom de la liste pour les lecteurs d'écran. */
  libelle?: string;
};

export function ListeTriable<T>({
  elements,
  idDe,
  nomDe,
  surReordonner,
  rendu,
  disposition = "liste",
  className,
  classeElement = "",
  libelle,
}: Props<T>) {
  const notifier = useNotifier();
  const ids = elements.map(idDe);
  const cle = ids.join(",");
  const [ordre, setOrdre] = useState<number[]>(ids);
  const [clePrecedente, setClePrecedente] = useState(cle);
  if (cle !== clePrecedente) {
    setClePrecedente(cle);
    setOrdre(ids);
  }
  const [enGlisse, setEnGlisse] = useState<number | null>(null);
  const [annonce, setAnnonce] = useState("");
  const refs = useRef(new Map<number, HTMLElement>());
  const ordreRef = useRef(ordre);
  const ordreDepart = useRef<number[]>([]);

  useLayoutEffect(() => {
    ordreRef.current = ordre;
  }, [ordre]);

  const parId = new Map(elements.map((e) => [idDe(e), e]));

  async function enregistrer(suivant: number[], precedent: number[]) {
    try {
      const r = await surReordonner(suivant);
      if (!r.ok) {
        setOrdre(precedent);
        notifier(r.message ?? "L’ordre n’a pas pu être enregistré.", "erreur");
      } else notifier(r.message ?? "Ordre enregistré.");
    } catch {
      setOrdre(precedent);
      notifier("L’ordre n’a pas pu être enregistré. Réessayez.", "erreur");
    }
  }

  function deplacer(id: number, sens: "haut" | "bas") {
    const actuel = ordreRef.current;
    const i = actuel.indexOf(id);
    const j = sens === "haut" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= actuel.length) return;
    const suivant = [...actuel];
    [suivant[i], suivant[j]] = [suivant[j], suivant[i]];
    setOrdre(suivant);
    ordreRef.current = suivant;
    const e = parId.get(id);
    setAnnonce(`${e ? nomDe(e) : "Élément"} : position ${j + 1} sur ${suivant.length}.`);
    void enregistrer(suivant, actuel);
  }

  const surMouvement = useEffectEvent((ev: PointerEvent) => {
    if (enGlisse === null) return;
    const actuel = ordreRef.current;
    const depuis = actuel.indexOf(enGlisse);
    const { clientX: x, clientY: y } = ev;
    let cible = -1;
    actuel.forEach((autre, idx) => {
      if (autre === enGlisse) return;
      const el = refs.current.get(autre);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) return;
      if (disposition === "grille") {
        cible = idx;
        return;
      }
      const milieu = r.top + r.height / 2;
      if ((idx > depuis && y > milieu) || (idx < depuis && y < milieu)) cible = idx;
    });
    if (cible >= 0 && cible !== depuis) {
      const suivant = actuel.filter((o) => o !== enGlisse);
      suivant.splice(cible, 0, enGlisse);
      ordreRef.current = suivant;
      setOrdre(suivant);
    }
    // Défilement automatique près des bords de la fenêtre.
    // (sous la barre collante du téléphone, qui masque le haut de la page)
    const haut = (document.querySelector(".bo-barre-mobile")?.getBoundingClientRect().bottom ?? 0) + 56;
    if (y < haut) window.scrollBy(0, -14);
    else if (y > window.innerHeight - 72) window.scrollBy(0, 14);
  });

  const surRelachement = useEffectEvent(() => {
    if (enGlisse === null) return;
    const id = enGlisse;
    setEnGlisse(null);
    const final = ordreRef.current;
    const precedent = ordreDepart.current;
    if (final.join(",") !== precedent.join(",")) {
      const e = parId.get(id);
      setAnnonce(`${e ? nomDe(e) : "Élément"} déposé en position ${final.indexOf(id) + 1} sur ${final.length}.`);
      void enregistrer(final, precedent);
    }
  });

  useEffect(() => {
    if (enGlisse === null) return;
    const bouge = (e: PointerEvent) => surMouvement(e);
    const fin = () => surRelachement();
    window.addEventListener("pointermove", bouge);
    window.addEventListener("pointerup", fin);
    window.addEventListener("pointercancel", fin);
    document.documentElement.classList.add("bo-tri-en-cours");
    return () => {
      window.removeEventListener("pointermove", bouge);
      window.removeEventListener("pointerup", fin);
      window.removeEventListener("pointercancel", fin);
      document.documentElement.classList.remove("bo-tri-en-cours");
    };
  }, [enGlisse]);

  return (
    <>
      <ul className={`bo-triable bo-triable-${disposition}${className ? ` ${className}` : ""}`} aria-label={libelle}>
        {ordre.map((id, index) => {
          const e = parId.get(id);
          if (!e) return null;
          const nom = nomDe(e);
          const controles = (
            <div className="bo-tri-controles">
              <button
                type="button"
                className="bo-bouton-icone bo-poignee"
                aria-label={`Déplacer « ${nom} » (glisser, ou flèches du clavier)`}
                title="Glisser pour déplacer"
                onPointerDown={(ev) => {
                  if (ev.button !== 0) return;
                  ev.preventDefault();
                  ordreDepart.current = ordreRef.current;
                  setEnGlisse(id);
                }}
                onKeyDown={(ev) => {
                  if (ev.key === "ArrowUp" || ev.key === "ArrowLeft") {
                    ev.preventDefault();
                    deplacer(id, "haut");
                  } else if (ev.key === "ArrowDown" || ev.key === "ArrowRight") {
                    ev.preventDefault();
                    deplacer(id, "bas");
                  }
                }}
              >
                <Icone nom="poignee" />
              </button>
              <button
                type="button"
                className="bo-bouton-icone"
                aria-label={`Monter « ${nom} »`}
                title="Monter"
                disabled={index === 0}
                onClick={() => deplacer(id, "haut")}
              >
                <Icone nom="haut" taille={18} />
              </button>
              <button
                type="button"
                className="bo-bouton-icone"
                aria-label={`Descendre « ${nom} »`}
                title="Descendre"
                disabled={index === ordre.length - 1}
                onClick={() => deplacer(id, "bas")}
              >
                <Icone nom="bas" taille={18} />
              </button>
            </div>
          );
          return (
            <li
              key={id}
              ref={(el) => {
                if (el) refs.current.set(id, el);
                else refs.current.delete(id);
              }}
              data-en-deplacement={enGlisse === id ? "oui" : undefined}
              className={`bo-triable-element${classeElement ? ` ${classeElement}` : ""}`}
            >
              {rendu(e, { index, total: ordre.length, enDeplacement: enGlisse === id, controles })}
            </li>
          );
        })}
      </ul>
      <p className="bo-invisible" aria-live="polite">
        {annonce}
      </p>
    </>
  );
}
