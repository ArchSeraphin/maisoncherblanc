"use client";

/**
 * « Changer un prix » en quelques secondes : on tape quelques lettres du plat,
 * on corrige le prix, Entrée. Recherche instantanée (sans accents ni majuscules)
 * sur tous les plats de tous les menus, transmis par la page.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { modifierPrixAction } from "@/lib/actions/menus";
import { normaliserPrix } from "@/lib/prix";
import { ChampPrix } from "./champ-prix";
import { useLienAdmin } from "../contexte-admin";
import { useFormulaire } from "../executer";
import { Icone } from "../icones";

export type PlatRecherche = {
  menuId: number;
  menuTitre: string;
  sectionTitre: string;
  platId: number;
  nom: string;
  prix: string;
  unite: string;
  visible: boolean;
};

const simplifier = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/œ/g, "oe").trim();

export function RecherchePlat({ plats, focusAuChargement = false }: { plats: PlatRecherche[]; focusAuChargement?: boolean }) {
  const [texte, setTexte] = useState("");
  const index = useMemo(() => plats.map((p) => ({ p, cle: simplifier(`${p.nom} ${p.sectionTitre}`) })), [plats]);
  const mots = simplifier(texte).split(/\s+/).filter(Boolean);
  const resultats = mots.length ? index.filter(({ cle }) => mots.every((m) => cle.includes(m))).map(({ p }) => p) : [];

  return (
    <section className="bo-carte bo-pile" aria-labelledby="changer-un-prix" id="changer-un-prix">
      <div className="bo-pile" style={{ gap: "0.3rem" }}>
        <h2 id="changer-un-prix" className="bo-sous-titre" style={{ margin: 0 }}>
          Changer un prix
        </h2>
        <p className="bo-discret">Tapez quelques lettres du plat (ex. « jambon », « tarte »), corrigez le prix puis appuyez sur Entrée.</p>
      </div>
      <div className="bo-recherche">
        <Icone nom="recherche" />
        <label htmlFor="recherche-plat" className="bo-invisible">
          Nom du plat
        </label>
        <input
          id="recherche-plat"
          type="search"
          className="bo-saisie"
          placeholder="Rechercher un plat…"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          autoFocus={focusAuChargement}
          autoComplete="off"
          enterKeyHint="search"
        />
      </div>
      {mots.length ? (
        resultats.length ? (
          <>
            <p className="bo-discret" aria-live="polite">
              {resultats.length > 30
                ? `30 premiers plats sur ${resultats.length} : précisez la recherche.`
                : `${resultats.length} plat${resultats.length > 1 ? "s" : ""} trouvé${resultats.length > 1 ? "s" : ""}.`}
            </p>
            <ul className="bo-resultats">
              {resultats.slice(0, 30).map((p) => (
                <LignePrix key={p.platId} plat={p} />
              ))}
            </ul>
          </>
        ) : (
          <p className="bo-alerte" aria-live="polite">
            Aucun plat ne correspond à « {texte} ». Vérifiez l’orthographe ou ouvrez le menu concerné ci-dessous.
          </p>
        )
      ) : null}
    </section>
  );
}

function LignePrix({ plat }: { plat: PlatRecherche }) {
  const lien = useLienAdmin();
  const { enCours, surSoumission, surChangement, erreurs } = useFormulaire(modifierPrixAction.bind(null, plat.menuId, plat.platId), {
    apresSucces: (_r, f) => {
      const champ = f.elements.namedItem("prix") as HTMLInputElement | null;
      if (champ) champ.value = normaliserPrix(champ.value);
    },
  });
  const id = `prix-${plat.platId}`;
  return (
    <li className="bo-resultat">
      <div className="bo-pile" style={{ gap: "0.15rem" }}>
        <strong>{plat.nom}</strong>
        <span className="bo-discret">
          {plat.menuTitre}, {plat.sectionTitre}
          {plat.unite ? `, ${plat.unite}` : ""}
          {plat.visible ? "" : " (masqué du site)"}
        </span>
        <Link href={lien(`/menus/${plat.menuId}?plat=${plat.platId}`)} className="bo-lien" style={{ fontSize: "0.88rem" }}>
          Modifier tout le plat
        </Link>
      </div>
      <form onSubmit={surSoumission} onChange={surChangement} className="bo-resultat-prix" noValidate>
        <ChampPrix id={id} defaut={plat.prix} erreur={erreurs.prix} libelle={`Prix de ${plat.nom}`} libelleInvisible />
        <button type="submit" className="bo-bouton bo-bouton-principal" disabled={enCours}>
          {enCours ? "…" : "Enregistrer"}
        </button>
      </form>
    </li>
  );
}
