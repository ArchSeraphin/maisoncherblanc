"use client";

/**
 * Envoi de plusieurs photos de réalisations : on choisit (ou glisse) les photos,
 * on décrit chacune (obligatoire), on choisit la catégorie, puis envoi un par un
 * avec une barre de progression par fichier et le suivi de la préparation.
 */

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLienAdmin } from "../contexte-admin";
import { attendreMedia, envoyerFichier, FORMATS_IMAGE, formaterOctets, libelleStatut, POIDS_MAX_MO } from "../envoi";
import { Icone } from "../icones";
import { useNotifier } from "../retours";

type Etat = "a-envoyer" | "envoi" | "traitement" | "fini" | "erreur";
type Element = {
  cle: string;
  fichier: File;
  apercu: string;
  alt: string;
  categorie: string;
  legende: string;
  etat: Etat;
  fraction: number;
  statut?: string;
  erreur?: string;
  erreurAlt?: string;
};

const CONSEILS_ALT = [
  "Dites ce qu’on voit, simplement : « Buffet froid dressé pour un mariage, avec plateaux de charcuterie ».",
  "Précisez le lieu ou l’occasion si c’est utile : « Côtes de bœuf cuites au barbecue lors d’une fête de village ».",
  "Inutile d’écrire « photo de » ou « image de ».",
];

export function EnvoiRealisations({ categories }: { categories: { valeur: string; libelle: string }[] }) {
  const lien = useLienAdmin();
  const router = useRouter();
  const notifier = useNotifier();
  const [elements, setElements] = useState<Element[]>([]);
  const [categorie, setCategorie] = useState(categories[0]?.valeur ?? "buffet");
  const [survol, setSurvol] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const entree = useRef<HTMLInputElement>(null);
  const apercus = useRef<string[]>([]);

  useEffect(() => () => apercus.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const ajouter = (fichiers: FileList | File[]) => {
    const nouveaux: Element[] = [...fichiers]
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => {
        const apercu = URL.createObjectURL(f);
        apercus.current.push(apercu);
        return { cle: `${f.name}-${f.size}-${Math.random()}`, fichier: f, apercu, alt: "", categorie, legende: "", etat: "a-envoyer", fraction: 0 };
      });
    if (nouveaux.length < [...fichiers].length) notifier("Certains fichiers ne sont pas des photos et ont été ignorés.", "erreur");
    setElements((l) => [...l, ...nouveaux].slice(0, 30));
  };
  const maj = (cle: string, patch: Partial<Element>) => setElements((l) => l.map((e) => (e.cle === cle ? { ...e, ...patch } : e)));
  const retirer = (cle: string) => setElements((l) => l.filter((e) => e.cle !== cle));

  const aEnvoyer = elements.filter((e) => e.etat === "a-envoyer" || e.etat === "erreur");

  const envoyerTout = async () => {
    const sansAlt = new Set(aEnvoyer.filter((e) => e.alt.trim().length < 5).map((e) => e.cle));
    if (sansAlt.size) {
      setElements((l) => l.map((e) => (sansAlt.has(e.cle) ? { ...e, erreurAlt: "Décrivez la photo (quelques mots)." } : e)));
      notifier("Chaque photo doit avoir une description avant l’envoi.", "erreur");
      return;
    }
    setEnCours(true);
    let reussies = 0;
    const suivis: Promise<void>[] = [];
    for (const e of aEnvoyer) {
      maj(e.cle, { etat: "envoi", fraction: 0, erreur: undefined });
      const r = await envoyerFichier(
        lien("/api/upload"),
        e.fichier,
        { usage: "realisation", categorie: e.categorie, legende: e.legende.trim(), alt: e.alt.trim() },
        (fraction) => maj(e.cle, { fraction }),
      ).promesse;
      if (!r.ok || !r.mediaId) {
        maj(e.cle, { etat: "erreur", erreur: r.erreur ?? "Envoi impossible." });
        continue;
      }
      maj(e.cle, { etat: "traitement", statut: r.statut, fraction: 1 });
      const id = r.mediaId;
      suivis.push(
        attendreMedia(lien(`/api/media/${id}`), (statut) => maj(e.cle, { statut })).then((fin) => {
          if (fin.statut === "error") maj(e.cle, { etat: "erreur", erreur: fin.erreur ?? "La photo n’a pas pu être préparée." });
          else {
            reussies++;
            maj(e.cle, { etat: "fini", statut: fin.statut });
          }
        }),
      );
    }
    await Promise.all(suivis);
    setEnCours(false);
    router.refresh();
    if (reussies) notifier(`${reussies} photo${reussies > 1 ? "s" : ""} ajoutée${reussies > 1 ? "s" : ""} à la galerie.`);
    // Les photos envoyées quittent la file ; celles en erreur restent pour un nouvel essai.
    setTimeout(() => setElements((l) => l.filter((x) => x.etat !== "fini")), 1500);
  };

  return (
    <div className="bo-pile">
      <div
        className="bo-depot"
        data-survol={survol ? "oui" : undefined}
        onDragOver={(e) => {
          e.preventDefault();
          setSurvol(true);
        }}
        onDragLeave={() => setSurvol(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSurvol(false);
          ajouter(e.dataTransfer.files);
        }}
      >
        <Icone nom="galerie" taille={32} />
        <p>
          <strong>Ajoutez des photos</strong>
          <br />
          <span className="bo-discret">
            Glissez-les ici ou choisissez-les sur votre téléphone ou votre ordinateur. JPEG, PNG, WebP, {POIDS_MAX_MO} Mo au maximum chacune, 30 à la
            fois.
          </span>
        </p>
        <input
          ref={entree}
          id="fichiers-realisations"
          type="file"
          accept={FORMATS_IMAGE}
          multiple
          onChange={(e) => {
            if (e.target.files) ajouter(e.target.files);
            e.target.value = "";
          }}
        />
        <button type="button" className="bo-bouton bo-bouton-principal" onClick={() => entree.current?.click()} disabled={enCours}>
          <Icone nom="envoi" taille={18} />
          Choisir des photos
        </button>
      </div>

      {elements.length ? (
        <>
          <div className="bo-grille-2" style={{ alignItems: "end" }}>
            <div className="bo-champ">
              <label htmlFor="categorie-defaut">Catégorie des photos ajoutées</label>
              <select
                id="categorie-defaut"
                className="bo-saisie"
                value={categorie}
                onChange={(e) => {
                  setCategorie(e.target.value);
                  setElements((l) => l.map((x) => (x.etat === "a-envoyer" ? { ...x, categorie: e.target.value } : x)));
                }}
              >
                {categories.map((c) => (
                  <option key={c.valeur} value={c.valeur}>
                    {c.libelle}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <details className="bo-conseils" open>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>Comment bien décrire une photo ?</summary>
            <ul>
              {CONSEILS_ALT.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </details>
          <ul className="bo-file">
            {elements.map((e) => {
              const bloque = e.etat !== "a-envoyer" && e.etat !== "erreur";
              return (
                <li key={e.cle} className="bo-file-element">
                  {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local du fichier choisi */}
                  <img src={e.apercu} alt="" />
                  <div className="bo-pile" style={{ gap: "0.6rem" }}>
                    <p className="bo-discret" style={{ overflowWrap: "anywhere" }}>
                      {e.fichier.name} ({formaterOctets(e.fichier.size)})
                    </p>
                    <div className="bo-champ">
                      <label htmlFor={`${e.cle}-alt`}>Description de la photo</label>
                      <input
                        id={`${e.cle}-alt`}
                        className="bo-saisie"
                        value={e.alt}
                        disabled={bloque}
                        maxLength={300}
                        aria-invalid={e.erreurAlt ? true : undefined}
                        aria-describedby={e.erreurAlt ? `${e.cle}-alt-erreur` : undefined}
                        onChange={(ev) => maj(e.cle, { alt: ev.target.value, erreurAlt: undefined })}
                      />
                      {e.erreurAlt ? (
                        <p id={`${e.cle}-alt-erreur`} className="bo-erreur" role="alert">
                          {e.erreurAlt}
                        </p>
                      ) : null}
                    </div>
                    <div className="bo-grille-2">
                      <div className="bo-champ">
                        <label htmlFor={`${e.cle}-cat`}>Catégorie</label>
                        <select
                          id={`${e.cle}-cat`}
                          className="bo-saisie"
                          value={e.categorie}
                          disabled={bloque}
                          onChange={(ev) => maj(e.cle, { categorie: ev.target.value })}
                        >
                          {categories.map((c) => (
                            <option key={c.valeur} value={c.valeur}>
                              {c.libelle}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="bo-champ">
                        <label htmlFor={`${e.cle}-leg`}>
                          Légende <span className="bo-facultatif">(facultatif)</span>
                        </label>
                        <input
                          id={`${e.cle}-leg`}
                          className="bo-saisie"
                          value={e.legende}
                          disabled={bloque}
                          maxLength={200}
                          onChange={(ev) => maj(e.cle, { legende: ev.target.value })}
                        />
                      </div>
                    </div>
                    {e.etat === "envoi" ? (
                      <div className="bo-pile" style={{ gap: "0.3rem" }}>
                        <div
                          className="bo-progression"
                          role="progressbar"
                          aria-label={`Envoi de ${e.fichier.name}`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={Math.round(e.fraction * 100)}
                        >
                          <span style={{ width: `${Math.round(e.fraction * 100)}%` }} />
                        </div>
                        <p className="bo-discret">Envoi : {Math.round(e.fraction * 100)} %</p>
                      </div>
                    ) : null}
                    {e.etat === "traitement" ? <p className="bo-statut">{libelleStatut(e.statut) || "Préparation de la photo…"}</p> : null}
                    {e.etat === "fini" ? (
                      <p className="bo-statut bo-statut-ok">
                        <Icone nom="coche" taille={18} /> Photo ajoutée à la galerie
                      </p>
                    ) : null}
                    {e.etat === "erreur" ? (
                      <p className="bo-statut bo-statut-erreur" role="alert">
                        <Icone nom="alerte" taille={18} /> {e.erreur}
                      </p>
                    ) : null}
                    {!bloque ? (
                      <div>
                        <button
                          type="button"
                          className="bo-bouton bo-bouton-discret bo-bouton-petit"
                          onClick={() => retirer(e.cle)}
                          disabled={enCours}
                        >
                          Retirer de la liste
                        </button>
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="bo-barre-enregistrer">
            <button type="button" className="bo-bouton bo-bouton-principal" onClick={envoyerTout} disabled={enCours || !aEnvoyer.length}>
              <Icone nom="envoi" taille={18} />
              {enCours ? "Envoi en cours…" : `Envoyer ${aEnvoyer.length > 1 ? `les ${aEnvoyer.length} photos` : "la photo"}`}
            </button>
            {!enCours && aEnvoyer.length ? (
              <button type="button" className="bo-bouton bo-bouton-discret" onClick={() => setElements((l) => l.filter((x) => x.etat === "fini"))}>
                Tout annuler
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
