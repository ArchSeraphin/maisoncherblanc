"use client";

/**
 * Retours visuels du backoffice, montés une fois par la coquille :
 * - notifications (« Prix enregistré »), région `aria-live` toujours présente ;
 * - confirmation avant une action risquée (élément <dialog> natif : focus piégé,
 *   Échap = annuler, focus initial sur « Annuler », le choix sans risque).
 *
 *   const notifier = useNotifier();      notifier("Prix enregistré.");  notifier("Oups.", "erreur");
 *   const confirmer = useConfirmer();    if (await confirmer({ titre: "Supprimer ce plat ?", danger: true })) …
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Icone } from "./icones";

export type GenreNotification = "succes" | "erreur" | "info";
type Notification = { id: number; genre: GenreNotification; texte: string };
type FonctionNotifier = (texte: string, genre?: GenreNotification) => void;

export type OptionsConfirmation = {
  titre: string;
  message?: React.ReactNode;
  confirmer?: string;
  annuler?: string;
  danger?: boolean;
};
type FonctionConfirmer = (o: OptionsConfirmation) => Promise<boolean>;

const ContexteNotifier = createContext<FonctionNotifier | null>(null);
const ContexteConfirmer = createContext<FonctionConfirmer | null>(null);

export function FournisseurRetours({ children }: { children: React.ReactNode }) {
  // --- Notifications ---
  const [liste, setListe] = useState<Notification[]>([]);
  const suite = useRef(0);
  const retirer = useCallback((id: number) => setListe((l) => l.filter((n) => n.id !== id)), []);
  const notifier = useCallback<FonctionNotifier>(
    (texte, genre = "succes") => {
      const id = ++suite.current;
      setListe((l) => [...l.slice(-2), { id, genre, texte }]);
      window.setTimeout(() => retirer(id), genre === "erreur" ? 8000 : 4000);
    },
    [retirer],
  );

  // --- Confirmation ---
  const [options, setOptions] = useState<OptionsConfirmation | null>(null);
  const resolution = useRef<((v: boolean) => void) | null>(null);
  const dialogue = useRef<HTMLDialogElement>(null);
  const retourFocus = useRef<HTMLElement | null>(null);

  const confirmer = useCallback<FonctionConfirmer>((o) => {
    resolution.current?.(false);
    retourFocus.current = document.activeElement as HTMLElement | null;
    setOptions(o);
    return new Promise<boolean>((resoudre) => {
      resolution.current = resoudre;
    });
  }, []);

  useEffect(() => {
    const d = dialogue.current;
    if (options && d && !d.open) d.showModal();
  }, [options]);

  const surFermeture = () => {
    const ok = dialogue.current?.returnValue === "oui";
    resolution.current?.(ok);
    resolution.current = null;
    setOptions(null);
    if (dialogue.current) dialogue.current.returnValue = "";
    retourFocus.current?.focus?.();
  };

  return (
    <ContexteNotifier.Provider value={notifier}>
      <ContexteConfirmer.Provider value={confirmer}>
        {children}
        <div className="bo-notifications" role="status" aria-live="polite">
          {liste.map((n) => (
            <div key={n.id} className={`bo-notification bo-notification-${n.genre}`}>
              <Icone nom={n.genre === "erreur" ? "alerte" : "coche"} taille={20} />
              <span>{n.texte}</span>
              <button type="button" onClick={() => retirer(n.id)} aria-label="Fermer ce message" className="bo-notification-fermer">
                <Icone nom="fermer" taille={16} />
              </button>
            </div>
          ))}
        </div>
        <dialog
          ref={dialogue}
          className="bo-dialogue"
          aria-labelledby="bo-confirmation-titre"
          aria-describedby={options?.message ? "bo-confirmation-texte" : undefined}
          onClose={surFermeture}
        >
          {options ? (
            <form method="dialog" className="bo-pile">
              <h2 id="bo-confirmation-titre" className="bo-sous-titre">
                {options.titre}
              </h2>
              {options.message ? (
                <div id="bo-confirmation-texte" className="bo-discret">
                  {options.message}
                </div>
              ) : null}
              <div className="bo-dialogue-actions">
                <button type="submit" value="non" className="bo-bouton bo-bouton-secondaire" autoFocus>
                  {options.annuler ?? "Annuler"}
                </button>
                <button type="submit" value="oui" className={`bo-bouton ${options.danger ? "bo-bouton-danger-plein" : "bo-bouton-principal"}`}>
                  {options.confirmer ?? "Confirmer"}
                </button>
              </div>
            </form>
          ) : null}
        </dialog>
      </ContexteConfirmer.Provider>
    </ContexteNotifier.Provider>
  );
}

export function useNotifier(): FonctionNotifier {
  const f = useContext(ContexteNotifier);
  if (!f) throw new Error("useNotifier() doit être utilisé sous <FournisseurRetours>.");
  return f;
}

export function useConfirmer(): FonctionConfirmer {
  const f = useContext(ContexteConfirmer);
  if (!f) throw new Error("useConfirmer() doit être utilisé sous <FournisseurRetours>.");
  return f;
}
