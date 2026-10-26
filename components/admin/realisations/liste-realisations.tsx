"use client";

/** Galerie des réalisations : ordre par glisser-déposer ou flèches, description, catégorie, masquer, supprimer. */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  basculerRealisationVisibleAction,
  modifierRealisationAction,
  ordonnerRealisationsAction,
  supprimerRealisationAction,
} from "@/lib/actions/realisations";
import type { ImageMedia } from "@/lib/media-url";
import { attributsChamp, Champ, Etiquette } from "../champs";
import { libelleStatut } from "../envoi";
import { useExecuter, useFormulaire } from "../executer";
import { Icone } from "../icones";
import { ListeTriable } from "../liste-triable";
import { Vignette } from "../photos/choix-photo";
import { useConfirmer } from "../retours";

export type RealisationEditee = {
  id: number;
  legende: string;
  categorie: string;
  visible: boolean;
  alt: string;
  provisoire: boolean;
  statut: string;
  image: ImageMedia | null;
};
type Categorie = { valeur: string; libelle: string };

function FormulaireRealisation({ r, categories, fermer }: { r: RealisationEditee; categories: Categorie[]; fermer: () => void }) {
  const { enCours, surSoumission, surChangement, erreurs } = useFormulaire(modifierRealisationAction.bind(null, r.id), { apresSucces: fermer });
  const p = `real-${r.id}`;
  return (
    <form onSubmit={surSoumission} onChange={surChangement} className="bo-plat-details" noValidate>
      <Champ
        id={`${p}-alt`}
        libelle="Description de la photo"
        aide="Ce qu’on voit, simplement (lu par les personnes malvoyantes et Google)."
        erreur={erreurs.alt}
      >
        <textarea
          {...attributsChamp(`${p}-alt`, erreurs.alt, true)}
          name="alt"
          defaultValue={r.alt}
          className="bo-saisie"
          rows={2}
          maxLength={300}
          style={{ minHeight: "4rem" }}
        />
      </Champ>
      <Champ id={`${p}-leg`} libelle="Légende" facultatif>
        <input id={`${p}-leg`} name="legende" defaultValue={r.legende} className="bo-saisie" maxLength={200} />
      </Champ>
      <Champ id={`${p}-cat`} libelle="Catégorie">
        <select id={`${p}-cat`} name="categorie" defaultValue={r.categorie} className="bo-saisie">
          {categories.map((c) => (
            <option key={c.valeur} value={c.valeur}>
              {c.libelle}
            </option>
          ))}
        </select>
      </Champ>
      <div className="bo-actions-formulaire">
        <button type="submit" className="bo-bouton bo-bouton-principal bo-bouton-petit" disabled={enCours}>
          {enCours ? "…" : "Enregistrer"}
        </button>
        <button type="button" className="bo-bouton bo-bouton-discret bo-bouton-petit" onClick={fermer}>
          Annuler
        </button>
      </div>
    </form>
  );
}

function CarteRealisation({ r, categories, controles }: { r: RealisationEditee; categories: Categorie[]; controles: React.ReactNode }) {
  const [edition, setEdition] = useState(false);
  const [executer, enCours] = useExecuter();
  const confirmer = useConfirmer();
  const libelle = categories.find((c) => c.valeur === r.categorie)?.libelle ?? r.categorie;
  return (
    <div className="bo-carte-photo" data-masquee={r.visible ? undefined : "oui"}>
      <div className="bo-carte-photo-image">
        {r.image ? <Vignette image={r.image} alt="" /> : <div className="bo-vignette-vide">{libelleStatut(r.statut) || "Photo indisponible"}</div>}
        {r.provisoire ? (
          <Etiquette genre="provisoire">Visuel provisoire à remplacer</Etiquette>
        ) : !r.visible ? (
          <Etiquette genre="attention">Masquée</Etiquette>
        ) : null}
      </div>
      <div className="bo-carte-photo-texte">
        <span className="bo-discret">{libelle}</span>
        {r.alt ? <p>{r.alt}</p> : <p className="bo-erreur">Description manquante : ajoutez-la avec « Modifier ».</p>}
        {r.legende ? <p className="bo-discret">Légende : {r.legende}</p> : null}
      </div>
      {edition ? <FormulaireRealisation r={r} categories={categories} fermer={() => setEdition(false)} /> : null}
      <div className="bo-carte-photo-actions">
        {controles}
        <button
          type="button"
          className="bo-bouton-icone"
          aria-label={`Modifier la photo « ${r.alt || libelle} »`}
          title="Modifier"
          aria-expanded={edition}
          onClick={() => setEdition((v) => !v)}
        >
          <Icone nom="crayon" />
        </button>
        <button
          type="button"
          className="bo-bouton-icone"
          aria-label={r.visible ? "Masquer du site" : "Afficher sur le site"}
          title={r.visible ? "Masquer du site" : "Afficher sur le site"}
          disabled={enCours}
          onClick={() => executer(() => basculerRealisationVisibleAction(r.id, !r.visible))}
        >
          <Icone nom={r.visible ? "oeil" : "masque"} />
        </button>
        <button
          type="button"
          className="bo-bouton-icone bo-danger"
          aria-label="Supprimer la photo"
          title="Supprimer"
          disabled={enCours}
          onClick={async () => {
            if (
              await confirmer({
                titre: "Supprimer cette photo ?",
                message: "Elle disparaîtra de la galerie et le fichier sera effacé.",
                confirmer: "Supprimer la photo",
                danger: true,
              })
            )
              executer(() => supprimerRealisationAction(r.id));
          }}
        >
          <Icone nom="poubelle" />
        </button>
      </div>
    </div>
  );
}

export function ListeRealisations({ realisations, categories }: { realisations: RealisationEditee[]; categories: Categorie[] }) {
  const router = useRouter();
  const enPreparation = realisations.some((r) => r.statut === "pending" || r.statut === "processing");
  // Photos encore en préparation : la liste se met à jour seule.
  useEffect(() => {
    if (!enPreparation) return;
    const t = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(t);
  }, [enPreparation, router]);
  return (
    <ListeTriable
      elements={realisations}
      idDe={(r) => r.id}
      nomDe={(r) => r.alt || "Photo"}
      surReordonner={ordonnerRealisationsAction}
      disposition="grille"
      libelle="Photos de la galerie"
      rendu={(r, c) => <CarteRealisation r={r} categories={categories} controles={c.controles} />}
    />
  );
}
