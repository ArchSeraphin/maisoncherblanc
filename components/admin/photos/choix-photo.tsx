"use client";

/**
 * Briques photo du backoffice :
 * - `Vignette` : aperçu d'une image de la médiathèque (variante 480 px) ;
 * - `Mediatheque` : bouton + fenêtre « Choisir dans mes photos » ;
 * - `EnvoiFichier` : envoi d'UNE photo (description obligatoire) ou d'un PDF,
 *   avec barre de progression puis attente de la fin du traitement.
 */

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { choisirVariante, urlMedia, type ImageMedia } from "@/lib/media-url";
import { useLienAdmin } from "../contexte-admin";
import { attendreMedia, envoyerFichier, FORMATS_IMAGE, FORMATS_PDF, libelleStatut, POIDS_MAX_MO } from "../envoi";
import { Icone } from "../icones";
import { useNotifier } from "../retours";

export function Vignette({ image, alt, className = "bo-vignette" }: { image: ImageMedia | null; alt?: string; className?: string }) {
  if (!image) return <div className="bo-vignette-vide">Aucune photo</div>;
  const v = choisirVariante(image, 480);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- variantes déjà générées par la pipeline sharp
    <img src={urlMedia(v.chemin)} width={v.largeur} height={v.hauteur} alt={alt ?? image.alt} className={className} loading="lazy" decoding="async" />
  );
}

export function Mediatheque({
  images,
  surChoix,
  libelle = "Choisir dans mes photos",
  titre = "Choisir une photo",
  selection,
}: {
  images: ImageMedia[];
  surChoix: (image: ImageMedia) => void;
  libelle?: string;
  titre?: string;
  selection?: number | null;
}) {
  const dialogue = useRef<HTMLDialogElement>(null);
  const id = useId();
  return (
    <>
      <button type="button" className="bo-bouton bo-bouton-secondaire" onClick={() => dialogue.current?.showModal()}>
        <Icone nom="galerie" taille={18} />
        {libelle}
      </button>
      <dialog ref={dialogue} className="bo-dialogue bo-dialogue-large" aria-labelledby={`${id}-titre`}>
        <div className="bo-dialogue-tete">
          <h2 id={`${id}-titre`} className="bo-sous-titre">
            {titre}
          </h2>
          <button type="button" className="bo-bouton-icone" aria-label="Fermer" onClick={() => dialogue.current?.close()}>
            <Icone nom="fermer" />
          </button>
        </div>
        {images.length ? (
          <ul className="bo-mediatheque">
            {images.map((img) => (
              <li key={img.id}>
                <button
                  type="button"
                  aria-pressed={selection === img.id}
                  onClick={() => {
                    surChoix(img);
                    dialogue.current?.close();
                  }}
                >
                  <Vignette image={img} alt="" />
                  <span>
                    {img.alt || "Photo sans description"}
                    {img.provisoire ? " (provisoire)" : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="bo-discret">Aucune photo dans la médiathèque pour l’instant.</p>
        )}
      </dialog>
    </>
  );
}

type Etape =
  | { phase: "attente" }
  | { phase: "envoi"; fraction: number }
  | { phase: "traitement"; statut: string }
  | { phase: "fini" }
  | { phase: "erreur"; texte: string };

/**
 * Envoi d'un fichier au serveur. `champs` complète la requête (`usage`, `cle`, `menu_id`…).
 * Après le traitement : `surTermine(mediaId)` puis rafraîchissement de la page.
 */
export function EnvoiFichier({
  champs,
  genre = "image",
  libelleBouton = "Envoyer une photo",
  surTermine,
  altInitial = "",
  ouvertAuDepart = false,
  silencieux = false,
}: {
  champs: Record<string, string>;
  genre?: "image" | "pdf";
  libelleBouton?: string;
  surTermine?: (mediaId: number) => void;
  altInitial?: string;
  ouvertAuDepart?: boolean;
  /** Pas de notification à la fin (l'action appelée par `surTermine` en affiche une). */
  silencieux?: boolean;
}) {
  const lien = useLienAdmin();
  const router = useRouter();
  const notifier = useNotifier();
  const id = useId();
  const [ouvert, setOuvert] = useState(ouvertAuDepart);
  const [fichier, setFichier] = useState<File | null>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [alt, setAlt] = useState(altInitial);
  const [erreurAlt, setErreurAlt] = useState("");
  const [etape, setEtape] = useState<Etape>({ phase: "attente" });
  const arret = useRef<AbortController | null>(null);

  useEffect(() => () => arret.current?.abort(), []);
  useEffect(() => {
    if (!apercu) return;
    return () => URL.revokeObjectURL(apercu);
  }, [apercu]);

  const choisir = (f: File | null) => {
    setFichier(f);
    setEtape({ phase: "attente" });
    setApercu(f && genre === "image" ? URL.createObjectURL(f) : null);
  };

  const envoyer = async () => {
    if (!fichier) return;
    if (genre === "image" && alt.trim().length < 5) {
      setErreurAlt("Décrivez la photo en quelques mots : c’est obligatoire (personnes malvoyantes, Google).");
      return;
    }
    setErreurAlt("");
    setEtape({ phase: "envoi", fraction: 0 });
    const r = await envoyerFichier(lien("/api/upload"), fichier, { ...champs, ...(genre === "image" ? { alt: alt.trim() } : {}) }, (fraction) =>
      setEtape({ phase: "envoi", fraction }),
    ).promesse;
    if (!r.ok || !r.mediaId) {
      setEtape({ phase: "erreur", texte: r.erreur ?? "L’envoi a échoué." });
      notifier(r.erreur ?? "L’envoi a échoué.", "erreur");
      return;
    }
    if (r.statut !== "ready") {
      setEtape({ phase: "traitement", statut: r.statut ?? "pending" });
      arret.current = new AbortController();
      const fin = await attendreMedia(lien(`/api/media/${r.mediaId}`), (statut) => setEtape({ phase: "traitement", statut }), arret.current.signal);
      if (fin.statut === "error") {
        setEtape({ phase: "erreur", texte: fin.erreur ?? "La photo n’a pas pu être préparée." });
        notifier("La photo n’a pas pu être préparée. Essayez avec une autre photo.", "erreur");
        return;
      }
    }
    setEtape({ phase: "fini" });
    if (!silencieux) notifier(genre === "pdf" ? "PDF enregistré." : "Photo enregistrée.");
    surTermine?.(r.mediaId);
    router.refresh();
    setFichier(null);
    setApercu(null);
    setOuvert(false);
  };

  if (!ouvert)
    return (
      <button type="button" className="bo-bouton bo-bouton-principal" onClick={() => setOuvert(true)}>
        <Icone nom="envoi" taille={18} />
        {libelleBouton}
      </button>
    );

  const occupe = etape.phase === "envoi" || etape.phase === "traitement";
  return (
    <div className="bo-ajout">
      <div className="bo-champ">
        <label htmlFor={`${id}-fichier`}>{genre === "pdf" ? "Fichier PDF" : "Photo"}</label>
        <input
          id={`${id}-fichier`}
          type="file"
          accept={genre === "pdf" ? FORMATS_PDF : FORMATS_IMAGE}
          className="bo-saisie"
          disabled={occupe}
          onChange={(e) => choisir(e.target.files?.[0] ?? null)}
        />
        <p className="bo-aide">
          {genre === "pdf" ? "Format PDF" : "JPEG, PNG, WebP ou AVIF"}, {POIDS_MAX_MO} Mo au maximum.
        </p>
      </div>
      {apercu ? (
        // eslint-disable-next-line @next/next/no-img-element -- aperçu local du fichier choisi
        <img src={apercu} alt="" className="bo-vignette" style={{ maxWidth: 260 }} />
      ) : null}
      {genre === "image" ? (
        <div className="bo-champ">
          <label htmlFor={`${id}-alt`}>Description de la photo</label>
          <input
            id={`${id}-alt`}
            className="bo-saisie"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            onKeyDown={(e) => {
              // Entrée envoie la photo (et jamais le formulaire qui contient ce bloc).
              if (e.key === "Enter") {
                e.preventDefault();
                void envoyer();
              }
            }}
            aria-invalid={erreurAlt ? true : undefined}
            aria-describedby={`${id}-alt-aide${erreurAlt ? ` ${id}-alt-erreur` : ""}`}
            disabled={occupe}
            maxLength={300}
          />
          <p id={`${id}-alt-aide`} className="bo-aide">
            Ce qu’on voit, simplement : « Plateau de charcuterie maison sur le comptoir ». Lu par les personnes malvoyantes et par Google.
          </p>
          {erreurAlt ? (
            <p id={`${id}-alt-erreur`} className="bo-erreur" role="alert">
              {erreurAlt}
            </p>
          ) : null}
        </div>
      ) : null}
      {etape.phase === "envoi" ? (
        <div className="bo-pile" style={{ gap: "0.35rem" }}>
          <div
            className="bo-progression"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(etape.fraction * 100)}
            aria-label="Envoi"
          >
            <span style={{ width: `${Math.round(etape.fraction * 100)}%` }} />
          </div>
          <p className="bo-discret">Envoi : {Math.round(etape.fraction * 100)} %</p>
        </div>
      ) : null}
      {etape.phase === "traitement" ? (
        <p className="bo-statut" role="status">
          {libelleStatut(etape.statut)}
        </p>
      ) : null}
      {etape.phase === "erreur" ? (
        <p className="bo-statut bo-statut-erreur" role="alert">
          <Icone nom="alerte" taille={18} />
          {etape.texte}
        </p>
      ) : null}
      <div className="bo-actions-formulaire">
        <button type="button" className="bo-bouton bo-bouton-principal" disabled={!fichier || occupe} onClick={envoyer}>
          <Icone nom="envoi" taille={18} />
          {occupe ? "Envoi en cours…" : "Envoyer"}
        </button>
        <button
          type="button"
          className="bo-bouton bo-bouton-discret"
          disabled={occupe}
          onClick={() => {
            choisir(null);
            setOuvert(false);
          }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
