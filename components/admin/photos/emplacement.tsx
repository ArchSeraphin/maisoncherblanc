"use client";

/** Un emplacement photo d'une page du site : photo actuelle, remplacement (médiathèque ou envoi), description. */

import { useId, useState } from "react";
import { definirEmplacementAction, modifierAltAction } from "@/lib/actions/medias";
import type { ImageMedia } from "@/lib/media-url";
import { attributsChamp, Champ, Etiquette } from "../champs";
import { useExecuter, useFormulaire } from "../executer";
import { Icone } from "../icones";
import { EnvoiFichier, Mediatheque, Vignette } from "./choix-photo";

export type EmplacementEdite = { cle: string; libelle: string; page: string; ratio: string; image: ImageMedia | null };

function Description({ image, fermer }: { image: ImageMedia; fermer: () => void }) {
  const { enCours, surSoumission, surChangement, erreurs } = useFormulaire(modifierAltAction.bind(null, image.id), { apresSucces: fermer });
  const id = `alt${useId()}`;
  return (
    <form onSubmit={surSoumission} onChange={surChangement} className="bo-plat-details" noValidate>
      <Champ
        id={id}
        libelle="Description de la photo"
        aide="Ce qu’on voit, simplement. Lu par les personnes malvoyantes et par Google."
        erreur={erreurs.alt}
      >
        <textarea
          {...attributsChamp(id, erreurs.alt, true)}
          name="alt"
          defaultValue={image.alt}
          className="bo-saisie"
          rows={2}
          maxLength={300}
          style={{ minHeight: "4rem" }}
        />
      </Champ>
      <div className="bo-actions-formulaire">
        <button type="submit" className="bo-bouton bo-bouton-principal bo-bouton-petit" disabled={enCours}>
          Enregistrer
        </button>
        <button type="button" className="bo-bouton bo-bouton-discret bo-bouton-petit" onClick={fermer}>
          Annuler
        </button>
      </div>
    </form>
  );
}

export function Emplacement({ e, mediatheque }: { e: EmplacementEdite; mediatheque: ImageMedia[] }) {
  const [executer, enCours] = useExecuter();
  const [description, setDescription] = useState(false);
  return (
    <article className="bo-carte bo-emplacement" aria-labelledby={`empl-${e.cle}`}>
      <h3 id={`empl-${e.cle}`}>{e.libelle}</h3>
      <div className="bo-carte-photo-image">
        <Vignette image={e.image} alt={e.image ? `Photo actuelle : ${e.image.alt}` : undefined} />
        {e.image?.provisoire ? <Etiquette genre="provisoire">Visuel provisoire à remplacer</Etiquette> : null}
        {!e.image ? <Etiquette genre="attention">Aucune photo</Etiquette> : null}
      </div>
      {e.image ? (
        <div className="bo-pile" style={{ gap: "0.2rem", justifyItems: "start" }}>
          <p className="bo-discret" style={{ fontSize: "0.88rem" }}>
            {e.image.alt || "Pas de description."}
          </p>
          <button
            type="button"
            className="bo-bouton bo-bouton-discret bo-bouton-petit"
            aria-expanded={description}
            onClick={() => setDescription((v) => !v)}
          >
            Modifier la description
          </button>
        </div>
      ) : null}
      {description && e.image ? <Description image={e.image} fermer={() => setDescription(false)} /> : null}
      <div className="bo-rangee" style={{ margin: 0 }}>
        <Mediatheque
          images={mediatheque}
          selection={e.image?.id}
          titre={`Choisir la photo : ${e.libelle}`}
          surChoix={(img) => {
            if (!enCours) executer(() => definirEmplacementAction(e.cle, img.id));
          }}
        />
        {e.page ? (
          <a href={e.page} target="_blank" rel="noreferrer" className="bo-bouton bo-bouton-discret">
            <Icone nom="externe" taille={18} />
            Voir la page<span className="bo-invisible"> (nouvel onglet)</span>
          </a>
        ) : null}
      </div>
      <EnvoiFichier
        champs={{ usage: "media" }}
        libelleBouton="Envoyer une nouvelle photo"
        silencieux
        surTermine={(id) => executer(() => definirEmplacementAction(e.cle, id))}
      />
    </article>
  );
}
