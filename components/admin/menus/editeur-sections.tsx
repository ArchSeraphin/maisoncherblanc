"use client";

/**
 * Sections et plats d'un menu : ouverture section par section (lisible au
 * téléphone), édition en ligne du nom, du prix et de l'unité (Entrée enregistre),
 * détails (composition, étiquette, changement de section), masquer, supprimer
 * avec confirmation, ordre par glisser-déposer ou flèches.
 *
 * Toutes les actions sont liées au menu édité (`bind(null, menuId, …)`) : le
 * serveur vérifie que la section ou le plat lui appartient.
 */

import { useEffect, useRef, useState } from "react";
import {
  basculerPlatVisibleAction,
  basculerSectionVisibleAction,
  changerSectionPlatAction,
  creerPlatAction,
  creerSectionAction,
  modifierPlatAction,
  modifierSectionAction,
  ordonnerPlatsAction,
  ordonnerSectionsAction,
  supprimerPlatAction,
  supprimerSectionAction,
} from "@/lib/actions/menus";
import { normaliserPrix } from "@/lib/prix";
import { ChampPrix } from "./champ-prix";
import { attributsChamp, Champ, Etiquette } from "../champs";
import { useExecuter, useFormulaire } from "../executer";
import { Icone } from "../icones";
import { ListeTriable } from "../liste-triable";
import { useConfirmer } from "../retours";

export type PlatEdite = {
  id: number;
  section_id: number;
  nom: string;
  description: string;
  prix: string;
  unite: string;
  badge: string | null;
  visible: boolean;
};
export type SectionEditee = {
  id: number;
  titre: string;
  note: string;
  mise_en_avant: boolean;
  visible: boolean;
  plats: PlatEdite[];
};

type Contexte = { menuId: number; sections: SectionEditee[]; badges: readonly string[] };

const ID_UNITES = "unites-suggerees";

export function EditeurSections({
  menuId,
  sections,
  unites,
  badges,
  ciblePlatId,
}: {
  menuId: number;
  sections: SectionEditee[];
  unites: readonly string[];
  badges: readonly string[];
  ciblePlatId?: number;
}) {
  const sectionCible = sections.find((s) => s.plats.some((p) => p.id === ciblePlatId))?.id;
  const [ouvertes, setOuvertes] = useState<Set<number>>(() =>
    sections.length <= 2 ? new Set(sections.map((s) => s.id)) : new Set(sectionCible ? [sectionCible] : []),
  );
  const basculer = (id: number) =>
    setOuvertes((o) => {
      const n = new Set(o);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const ctx: Contexte = { menuId, sections, badges };
  const toutOuvert = sections.length > 0 && sections.every((s) => ouvertes.has(s.id));

  return (
    <div className="bo-pile">
      <datalist id={ID_UNITES}>
        {unites.filter(Boolean).map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>
      {sections.length ? (
        <>
          <div className="bo-section-entete">
            <p className="bo-discret">Touchez une section pour voir et modifier ses plats.</p>
            <button
              type="button"
              className="bo-bouton bo-bouton-discret bo-bouton-petit"
              onClick={() => setOuvertes(toutOuvert ? new Set() : new Set(sections.map((s) => s.id)))}
            >
              {toutOuvert ? "Tout replier" : "Tout déplier"}
            </button>
          </div>
          <ListeTriable
            elements={sections}
            idDe={(s) => s.id}
            nomDe={(s) => s.titre}
            surReordonner={ordonnerSectionsAction.bind(null, menuId)}
            libelle="Sections du menu"
            rendu={(s, c) => (
              <BlocSection
                section={s}
                controles={c.controles}
                ouverte={ouvertes.has(s.id)}
                basculer={() => basculer(s.id)}
                ctx={ctx}
                ciblePlatId={ciblePlatId}
              />
            )}
          />
        </>
      ) : (
        <p className="bo-alerte">Ce menu est vide : commencez par ajouter une section (par exemple « Entrées froides »).</p>
      )}
      <AjoutSection menuId={menuId} surAjout={(id) => setOuvertes((o) => new Set(o).add(id))} />
    </div>
  );
}

function BlocSection({
  section: s,
  controles,
  ouverte,
  basculer,
  ctx,
  ciblePlatId,
}: {
  section: SectionEditee;
  controles: React.ReactNode;
  ouverte: boolean;
  basculer: () => void;
  ctx: Contexte;
  ciblePlatId?: number;
}) {
  const [executer, enCours] = useExecuter();
  const confirmer = useConfirmer();
  const [reglages, setReglages] = useState(false);
  const corps = `section-${s.id}-corps`;
  const masques = s.plats.filter((p) => !p.visible).length;

  const supprimer = async () => {
    const ok = await confirmer({
      titre: `Supprimer la section « ${s.titre} » ?`,
      message: s.plats.length
        ? `Ses ${s.plats.length} plat${s.plats.length > 1 ? "s" : ""} seront supprimés aussi. Cette action est définitive. Pour la retirer du site sans la perdre, utilisez plutôt « Masquer ».`
        : "Cette action est définitive.",
      confirmer: "Supprimer la section",
      danger: true,
    });
    if (ok) executer(() => supprimerSectionAction(ctx.menuId, s.id));
  };

  return (
    <div className="bo-bloc-section" data-masquee={s.visible ? undefined : "oui"}>
      <div className="bo-bloc-section-tete">
        {controles}
        <button type="button" className="bo-bloc-section-titre" aria-expanded={ouverte} aria-controls={corps} onClick={basculer}>
          <Icone nom="chevron" />
          <span style={{ minWidth: 0 }}>
            <strong>{s.titre}</strong>
            <span className="bo-discret">
              {s.plats.length} plat{s.plats.length > 1 ? "s" : ""}
              {masques ? `, dont ${masques} masqué${masques > 1 ? "s" : ""}` : ""}
              {s.note ? `, ${s.note}` : ""}
            </span>
          </span>
        </button>
        {!s.visible ? <Etiquette genre="attention">Masquée</Etiquette> : null}
      </div>
      {ouverte ? (
        <div id={corps} className="bo-bloc-section-corps">
          {s.mise_en_avant ? <p className="bo-discret">Section mise en avant : ses plats s’affichent en formules encadrées.</p> : null}
          {s.plats.length ? (
            <ListeTriable
              elements={s.plats}
              idDe={(p) => p.id}
              nomDe={(p) => p.nom}
              surReordonner={ordonnerPlatsAction.bind(null, ctx.menuId, s.id)}
              libelle={`Plats de la section ${s.titre}`}
              rendu={(p, c) => <LignePlat plat={p} controles={c.controles} ctx={ctx} cible={p.id === ciblePlatId} />}
            />
          ) : (
            <p className="bo-discret">Aucun plat dans cette section pour l’instant.</p>
          )}
          <AjoutPlat menuId={ctx.menuId} sectionId={s.id} />
          <div className="bo-outils-section">
            <button
              type="button"
              className="bo-bouton bo-bouton-secondaire bo-bouton-petit"
              aria-expanded={reglages}
              onClick={() => setReglages((v) => !v)}
            >
              <Icone nom="crayon" taille={18} />
              Renommer la section
            </button>
            <button
              type="button"
              className="bo-bouton bo-bouton-secondaire bo-bouton-petit"
              disabled={enCours}
              onClick={() => executer(() => basculerSectionVisibleAction(ctx.menuId, s.id, !s.visible))}
            >
              <Icone nom={s.visible ? "masque" : "oeil"} taille={18} />
              {s.visible ? "Masquer la section" : "Afficher la section"}
            </button>
            <button type="button" className="bo-bouton bo-bouton-danger bo-bouton-petit" disabled={enCours} onClick={supprimer}>
              <Icone nom="poubelle" taille={18} />
              Supprimer la section
            </button>
          </div>
          {reglages ? <ReglagesSection menuId={ctx.menuId} section={s} fermer={() => setReglages(false)} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function ReglagesSection({ menuId, section: s, fermer }: { menuId: number; section: SectionEditee; fermer: () => void }) {
  const { enCours, surSoumission, surChangement, erreurs } = useFormulaire(modifierSectionAction.bind(null, menuId, s.id), { apresSucces: fermer });
  const p = `section-${s.id}`;
  return (
    <form onSubmit={surSoumission} onChange={surChangement} className="bo-plat-details" noValidate>
      <div className="bo-grille-2">
        <Champ id={`${p}-titre`} libelle="Titre de la section" erreur={erreurs.titre}>
          <input {...attributsChamp(`${p}-titre`, erreurs.titre)} name="titre" defaultValue={s.titre} className="bo-saisie" required />
        </Champ>
        <Champ id={`${p}-note`} libelle="Précision" aide="Affichée sous le titre, ex. « À la part »" facultatif>
          <input {...attributsChamp(`${p}-note`, undefined, true)} name="note" defaultValue={s.note} className="bo-saisie" />
        </Champ>
      </div>
      <label className="bo-case">
        <input type="checkbox" name="mise_en_avant" defaultChecked={s.mise_en_avant} />
        <span>
          Mettre en avant (formules encadrées)
          <small>Pour les formules et plateaux : chaque plat s’affiche dans un cadre.</small>
        </span>
      </label>
      <div className="bo-actions-formulaire">
        <button type="submit" className="bo-bouton bo-bouton-principal" disabled={enCours}>
          {enCours ? "Enregistrement…" : "Enregistrer la section"}
        </button>
        <button type="button" className="bo-bouton bo-bouton-discret" onClick={fermer}>
          Annuler
        </button>
      </div>
    </form>
  );
}

function LignePlat({ plat: p, controles, ctx, cible }: { plat: PlatEdite; controles: React.ReactNode; ctx: Contexte; cible: boolean }) {
  const [executer, enCours] = useExecuter();
  const confirmer = useConfirmer();
  const [details, setDetails] = useState(cible && !!p.description);
  const [modifie, setModifie] = useState(false);
  const formulaire = useRef<HTMLFormElement>(null);
  const racine = useRef<HTMLDivElement>(null);
  const f = useFormulaire(modifierPlatAction.bind(null, ctx.menuId, p.id), {
    apresSucces: (_r, form) => {
      const prix = form.elements.namedItem("prix") as HTMLInputElement | null;
      if (prix) prix.value = normaliserPrix(prix.value);
      setModifie(false);
    },
  });
  const pre = `plat-${p.id}`;

  useEffect(() => {
    if (!cible) return;
    racine.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    (racine.current?.querySelector(`#${pre}-prix`) as HTMLInputElement | null)?.focus({ preventScroll: true });
  }, [cible, pre]);

  const surSaisie = () => {
    const form = formulaire.current;
    if (!form) return;
    const v = (n: string) => (form.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null)?.value ?? null;
    const change =
      v("nom") !== p.nom ||
      normaliserPrix(v("prix") ?? "") !== p.prix ||
      v("unite") !== p.unite ||
      (v("description") !== null && v("description") !== p.description) ||
      (v("badge") !== null && (v("badge") || null) !== p.badge);
    setModifie(change);
  };

  const supprimer = async () => {
    const ok = await confirmer({
      titre: `Supprimer « ${p.nom} » ?`,
      message: "Le plat disparaîtra du site et du menu. Pour le retirer seulement pour un temps, utilisez plutôt « Masquer ».",
      confirmer: "Supprimer le plat",
      danger: true,
    });
    if (ok) executer(() => supprimerPlatAction(ctx.menuId, p.id));
  };

  return (
    <div ref={racine} className="bo-plat" data-masque={p.visible ? undefined : "oui"} data-cible={cible ? "oui" : undefined}>
      <form
        ref={formulaire}
        onSubmit={f.surSoumission}
        onChange={f.surChangement}
        onInput={surSaisie}
        className="bo-pile"
        style={{ gap: "0.6rem" }}
        noValidate
      >
        <div className="bo-plat-ligne">
          <Champ id={`${pre}-nom`} libelle="Nom du plat" erreur={f.erreurs.nom} className="bo-plat-nom">
            <input
              {...attributsChamp(`${pre}-nom`, f.erreurs.nom)}
              name="nom"
              defaultValue={p.nom}
              className="bo-saisie"
              required
              autoComplete="off"
            />
          </Champ>
          <ChampPrix id={`${pre}-prix`} defaut={p.prix} erreur={f.erreurs.prix} className="bo-plat-prix" />
          <Champ id={`${pre}-unite`} libelle="Unité" className="bo-plat-unite">
            <input
              id={`${pre}-unite`}
              name="unite"
              defaultValue={p.unite}
              className="bo-saisie"
              list={ID_UNITES}
              autoComplete="off"
              placeholder="ex. la part"
            />
          </Champ>
        </div>
        {details ? (
          <div className="bo-plat-details">
            <Champ
              id={`${pre}-description`}
              libelle="Composition ou description"
              aide="Une ligne par élément. Une ligne qui commence par # devient un intertitre (ex. « # Entrée »)."
              facultatif
            >
              <textarea
                {...attributsChamp(`${pre}-description`, undefined, true)}
                name="description"
                defaultValue={p.description}
                className="bo-saisie"
                rows={4}
              />
            </Champ>
            <Champ id={`${pre}-badge`} libelle="Étiquette" facultatif>
              <select id={`${pre}-badge`} name="badge" defaultValue={p.badge ?? ""} className="bo-saisie">
                <option value="">Aucune</option>
                {ctx.badges.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Champ>
          </div>
        ) : null}
        <div className="bo-plat-pied">
          {controles}
          <div className="bo-plat-boutons">
            {!p.visible ? <Etiquette genre="attention">Masqué du site</Etiquette> : null}
            {p.badge && !details ? <Etiquette>{p.badge}</Etiquette> : null}
            {modifie ? <span className="bo-modifie">Non enregistré</span> : null}
            <button
              type="submit"
              className={`bo-bouton bo-bouton-petit ${modifie ? "bo-bouton-attention" : "bo-bouton-secondaire"}`}
              disabled={f.enCours}
            >
              <Icone nom="coche" taille={18} />
              {f.enCours ? "…" : "Enregistrer"}
            </button>
            <button
              type="button"
              className="bo-bouton bo-bouton-discret bo-bouton-petit"
              aria-expanded={details}
              onClick={() => setDetails((d) => !d)}
            >
              {details ? "Moins" : "Détails"}
            </button>
            <button
              type="button"
              className="bo-bouton-icone"
              aria-label={p.visible ? `Masquer « ${p.nom} » du site` : `Afficher « ${p.nom} » sur le site`}
              title={p.visible ? "Masquer du site" : "Afficher sur le site"}
              disabled={enCours}
              onClick={() => executer(() => basculerPlatVisibleAction(ctx.menuId, p.id, !p.visible))}
            >
              <Icone nom={p.visible ? "oeil" : "masque"} />
            </button>
            <button
              type="button"
              className="bo-bouton-icone bo-danger"
              aria-label={`Supprimer « ${p.nom} »`}
              title="Supprimer"
              disabled={enCours}
              onClick={supprimer}
            >
              <Icone nom="poubelle" />
            </button>
          </div>
        </div>
      </form>
      {details && ctx.sections.length > 1 ? <ChangerSection plat={p} ctx={ctx} /> : null}
    </div>
  );
}

function ChangerSection({ plat: p, ctx }: { plat: PlatEdite; ctx: Contexte }) {
  const { enCours, surSoumission } = useFormulaire(changerSectionPlatAction.bind(null, ctx.menuId, p.id));
  const id = `plat-${p.id}-section`;
  return (
    <form onSubmit={surSoumission} className="bo-rangee" style={{ margin: 0, alignItems: "end" }}>
      <Champ id={id} libelle="Déplacer dans une autre section" className="bo-plat-nom">
        <select id={id} name="section_id" defaultValue={p.section_id} className="bo-saisie">
          {ctx.sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.titre}
            </option>
          ))}
        </select>
      </Champ>
      <button type="submit" className="bo-bouton bo-bouton-secondaire bo-bouton-petit" disabled={enCours}>
        Déplacer
      </button>
    </form>
  );
}

function AjoutPlat({ menuId, sectionId }: { menuId: number; sectionId: number }) {
  const { enCours, surSoumission, surChangement, erreurs } = useFormulaire(creerPlatAction.bind(null, menuId, sectionId), {
    viderApresSucces: true,
    apresSucces: (_r, form) => (form.elements.namedItem("nom") as HTMLInputElement | null)?.focus(),
  });
  const pre = `ajout-${sectionId}`;
  return (
    <form onSubmit={surSoumission} onChange={surChangement} className="bo-ajout" noValidate>
      <p className="bo-ajout-titre">Ajouter un plat dans cette section</p>
      <div className="bo-plat-ligne">
        <Champ id={`${pre}-nom`} libelle="Nom du plat" erreur={erreurs.nom} className="bo-plat-nom">
          <input {...attributsChamp(`${pre}-nom`, erreurs.nom)} name="nom" className="bo-saisie" required autoComplete="off" />
        </Champ>
        <ChampPrix id={`${pre}-prix`} erreur={erreurs.prix} className="bo-plat-prix" />
        <Champ id={`${pre}-unite`} libelle="Unité" className="bo-plat-unite">
          <input id={`${pre}-unite`} name="unite" className="bo-saisie" list={ID_UNITES} autoComplete="off" placeholder="ex. la part" />
        </Champ>
      </div>
      <div>
        <button type="submit" className="bo-bouton bo-bouton-principal" disabled={enCours}>
          <Icone nom="plus" taille={18} />
          {enCours ? "Ajout…" : "Ajouter le plat"}
        </button>
      </div>
    </form>
  );
}

function AjoutSection({ menuId, surAjout }: { menuId: number; surAjout: (id: number) => void }) {
  const [ouvert, setOuvert] = useState(false);
  const { enCours, surSoumission, surChangement, erreurs } = useFormulaire(creerSectionAction.bind(null, menuId), {
    viderApresSucces: true,
    apresSucces: (r) => {
      if (r.id) surAjout(r.id);
      setOuvert(false);
    },
  });
  if (!ouvert)
    return (
      <div>
        <button type="button" className="bo-bouton bo-bouton-secondaire" onClick={() => setOuvert(true)}>
          <Icone nom="plus" taille={18} />
          Ajouter une section
        </button>
      </div>
    );
  return (
    <form onSubmit={surSoumission} onChange={surChangement} className="bo-ajout" noValidate>
      <p className="bo-ajout-titre">Nouvelle section</p>
      <div className="bo-grille-2">
        <Champ id="nouvelle-section-titre" libelle="Titre" aide="Ex. « Entrées froides », « Desserts »" erreur={erreurs.titre}>
          <input {...attributsChamp("nouvelle-section-titre", erreurs.titre, true)} name="titre" className="bo-saisie" required autoFocus />
        </Champ>
        <Champ id="nouvelle-section-note" libelle="Précision" aide="Ex. « À la part », « Par personne »" facultatif>
          <input {...attributsChamp("nouvelle-section-note", undefined, true)} name="note" className="bo-saisie" />
        </Champ>
      </div>
      <label className="bo-case">
        <input type="checkbox" name="mise_en_avant" />
        <span>
          Mettre en avant (formules encadrées)
          <small>Pour les formules et plateaux.</small>
        </span>
      </label>
      <div className="bo-actions-formulaire">
        <button type="submit" className="bo-bouton bo-bouton-principal" disabled={enCours}>
          {enCours ? "Ajout…" : "Ajouter la section"}
        </button>
        <button type="button" className="bo-bouton bo-bouton-discret" onClick={() => setOuvert(false)}>
          Annuler
        </button>
      </div>
    </form>
  );
}
