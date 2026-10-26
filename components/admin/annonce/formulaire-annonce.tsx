"use client";

/** Bandeau d'annonce : activer, texte, lien, dates, avec aperçu fidèle au site. */

import { useState } from "react";
import { enregistrerAnnonceAction } from "@/lib/actions/horaires";
import { dansFenetre, formaterJourLong } from "@/lib/dates";
import { attributsChamp, Champ, Compteur, Etiquette } from "../champs";
import { useFormulaire } from "../executer";

export type AnnonceEditee = { active: boolean; texte: string; lien: string; debut: string | null; fin: string | null };

const CONSEILLE = 120;
const MAX = 200;

export function FormulaireAnnonce({ annonce, jour }: { annonce: AnnonceEditee; jour: string }) {
  const [a, setA] = useState(annonce);
  const { enCours, surSoumission, surChangement, erreurs } = useFormulaire(enregistrerAnnonceAction);
  const maj = (patch: Partial<AnnonceEditee>) => setA((x) => ({ ...x, ...patch }));

  const affichee = a.active && a.texte.trim() && dansFenetre(jour, a.debut || null, a.fin || null);
  const etat = !a.active
    ? { genre: "discret" as const, texte: "Désactivé : rien ne s’affiche sur le site" }
    : !a.texte.trim()
      ? { genre: "attention" as const, texte: "Écrivez un texte pour l’afficher" }
      : a.debut && jour < a.debut
        ? { genre: "neutre" as const, texte: `Programmé : s’affichera à partir du ${formaterJourLong(a.debut)}` }
        : a.fin && jour > a.fin
          ? { genre: "discret" as const, texte: `Terminé : plus affiché depuis le ${formaterJourLong(a.fin)}` }
          : {
              genre: "succes" as const,
              texte: a.fin ? `Affiché jusqu’au ${formaterJourLong(a.fin)} inclus` : "Affiché en ce moment, sans date de fin",
            };

  return (
    <form onSubmit={surSoumission} onChange={surChangement} className="bo-formulaire" noValidate>
      <div className="bo-pile" style={{ gap: "0.5rem" }}>
        <p className="bo-discret">Aperçu (avec les modifications en cours)</p>
        <div className="bo-apercu-bandeau" aria-hidden="true">
          {affichee ? (
            <div className="bo-apercu-bandeau-barre">
              <span className="bo-apercu-losange" />
              <span className={a.lien ? "bo-apercu-lien" : undefined}>{a.texte}</span>
            </div>
          ) : null}
          <div className="bo-apercu-bandeau-site">Maison Cherblanc{affichee ? "" : " (pas de bandeau affiché)"}</div>
        </div>
        <div>
          <Etiquette genre={etat.genre}>{etat.texte}</Etiquette>
        </div>
      </div>

      <label className="bo-interrupteur" style={{ fontSize: "1.05rem" }}>
        <input type="checkbox" name="active" checked={a.active} onChange={(e) => maj({ active: e.target.checked })} />
        {a.active ? "Bandeau activé" : "Bandeau désactivé"}
      </label>

      <Champ id="texte" libelle="Texte du bandeau" erreur={erreurs.texte}>
        <textarea
          {...attributsChamp("texte", erreurs.texte)}
          aria-describedby={["texte-compteur", erreurs.texte ? "texte-erreur" : ""].filter(Boolean).join(" ")}
          name="texte"
          value={a.texte}
          onChange={(e) => maj({ texte: e.target.value.replace(/\n/g, " ") })}
          maxLength={MAX}
          rows={2}
          className="bo-saisie"
          style={{ minHeight: "4.5rem" }}
          placeholder="Ex. Commandes de fêtes : jusqu’au dimanche 20 décembre pour Noël"
        />
        <Compteur id="texte-compteur" valeur={a.texte} conseille={CONSEILLE} max={MAX} />
      </Champ>

      <Champ
        id="lien"
        libelle="Lien du bandeau"
        aide="Le texte du bandeau devient cliquable. Une page du site (ex. /menus-de-fetes, /contact) ou une adresse complète commençant par https://. Laissez vide pour ne pas mettre de lien."
        erreur={erreurs.lien}
        facultatif
      >
        <input
          {...attributsChamp("lien", erreurs.lien, true)}
          name="lien"
          value={a.lien}
          onChange={(e) => maj({ lien: e.target.value })}
          className="bo-saisie"
          inputMode="url"
          autoCapitalize="off"
        />
      </Champ>

      <fieldset className="bo-groupe">
        <legend>Dates d’affichage</legend>
        <p className="bo-aide" style={{ marginTop: "-0.3rem" }}>
          Le bandeau apparaît et disparaît tout seul. Laissez vide pour « dès maintenant » ou « sans fin ».
        </p>
        <div className="bo-grille-2">
          <Champ id="debut" libelle="À partir du" erreur={erreurs.debut} facultatif>
            <input
              {...attributsChamp("debut", erreurs.debut)}
              type="date"
              name="debut"
              value={a.debut ?? ""}
              onChange={(e) => maj({ debut: e.target.value || null })}
              className="bo-saisie"
            />
          </Champ>
          <Champ id="fin" libelle="Jusqu’au (inclus)" erreur={erreurs.fin} facultatif>
            <input
              {...attributsChamp("fin", erreurs.fin)}
              type="date"
              name="fin"
              value={a.fin ?? ""}
              onChange={(e) => maj({ fin: e.target.value || null })}
              className="bo-saisie"
            />
          </Champ>
        </div>
      </fieldset>

      <div>
        <button type="submit" className="bo-bouton bo-bouton-principal" disabled={enCours}>
          {enCours ? "Enregistrement…" : "Enregistrer le bandeau"}
        </button>
      </div>
    </form>
  );
}
