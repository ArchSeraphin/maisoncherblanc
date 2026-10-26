"use client";

/**
 * Éditeur d'actualité : titre, adresse (automatique, modifiable), chapô, texte
 * en Markdown simple avec petite barre d'aide (gras, intertitre, liste, lien) et
 * aperçu rendu, photo de couverture, brouillon / publication / programmation,
 * titre et description pour Google avec compteurs et aperçu du résultat.
 */

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Markdown } from "@/components/ui/markdown";
import { creerArticleAction, modifierArticleAction, supprimerArticleAction } from "@/lib/actions/articles";
import { lienSur, texteBrut } from "@/lib/markdown";
import type { ImageMedia } from "@/lib/media-url";
import { slugifier } from "@/lib/slug";
import { attributsChamp, Champ, Compteur } from "../champs";
import { useLienAdmin } from "../contexte-admin";
import { useExecuter, useFormulaire } from "../executer";
import { Icone } from "../icones";
import { EnvoiFichier, Mediatheque, Vignette } from "../photos/choix-photo";
import { useConfirmer } from "../retours";

export type ArticleEdite = {
  id: number;
  slug: string;
  titre: string;
  chapo: string;
  corps: string;
  couverture_media_id: number | null;
  statut: "brouillon" | "publie";
  /** Valeur du champ datetime-local (heure de Paris), "" si aucune. */
  publie_le: string;
  titre_seo: string;
  description_seo: string;
  etat: "brouillon" | "programme" | "publie";
};

const RECO_TITRE_SEO = 60;
const MAX_TITRE_SEO = 70;
const RECO_DESC_SEO = 155;
const MAX_DESC_SEO = 170;

export function EditeurArticle({
  article,
  mediatheque,
  domaine,
  modeleTitre,
}: {
  article: ArticleEdite | null;
  mediatheque: ImageMedia[];
  domaine: string;
  modeleTitre: string;
}) {
  const lien = useLienAdmin();
  const router = useRouter();
  const confirmer = useConfirmer();
  const [executer, suppressionEnCours] = useExecuter();
  const [titre, setTitre] = useState(article?.titre ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugManuel, setSlugManuel] = useState(!!article);
  const [chapo, setChapo] = useState(article?.chapo ?? "");
  const [corps, setCorps] = useState(article?.corps ?? "");
  const [couverture, setCouverture] = useState<number | null>(article?.couverture_media_id ?? null);
  const [titreSeo, setTitreSeo] = useState(article?.titre_seo ?? "");
  const [descSeo, setDescSeo] = useState(article?.description_seo ?? "");
  const [onglet, setOnglet] = useState<"ecrire" | "apercu">("ecrire");
  const [lienOuvert, setLienOuvert] = useState(false);
  const [adresseLien, setAdresseLien] = useState("");
  const [erreurLien, setErreurLien] = useState("");
  const zone = useRef<HTMLTextAreaElement>(null);

  const action = article ? modifierArticleAction.bind(null, article.id) : creerArticleAction;
  const { enCours, surSoumission, surChangement, erreurs } = useFormulaire(action, {
    apresSucces: (r) => {
      if (!article && r.id) router.push(lien(`/actualites/${r.id}`));
    },
  });
  const slugAffiche = slugManuel ? slug : slugifier(titre);
  const image = mediatheque.find((m) => m.id === couverture) ?? null;
  const publie = article?.statut === "publie";

  /** Remplace la sélection du texte par `avant + sélection + après` et resélectionne. */
  const entourer = (avant: string, apres: string, defaut: string) => {
    const t = zone.current;
    if (!t) return;
    const { selectionStart: d, selectionEnd: f, value } = t;
    const sel = value.slice(d, f) || defaut;
    const nouveau = value.slice(0, d) + avant + sel + apres + value.slice(f);
    setCorps(nouveau);
    requestAnimationFrame(() => {
      t.focus();
      t.setSelectionRange(d + avant.length, d + avant.length + sel.length);
    });
  };

  /** Préfixe chaque ligne sélectionnée (ou la ligne du curseur). */
  const prefixer = (prefixe: string, defaut: string) => {
    const t = zone.current;
    if (!t) return;
    const { selectionStart: d, selectionEnd: f, value } = t;
    const debutLigne = value.lastIndexOf("\n", d - 1) + 1;
    const finLigne = value.indexOf("\n", f) === -1 ? value.length : value.indexOf("\n", f);
    let bloc = value.slice(debutLigne, finLigne);
    if (!bloc.trim()) bloc = defaut;
    const lignes = bloc.split("\n").map((l) => (l.startsWith(prefixe) ? l : prefixe + l.replace(/^(#{2,3} |- )/, "")));
    const remplace = lignes.join("\n");
    // Un bloc (intertitre, liste) doit être séparé du texte voisin par une ligne vide.
    const avant = debutLigne > 0 && !value.slice(0, debutLigne).endsWith("\n\n") ? "\n" : "";
    const nouveau = value.slice(0, debutLigne) + avant + remplace + value.slice(finLigne);
    setCorps(nouveau);
    requestAnimationFrame(() => {
      t.focus();
      t.setSelectionRange(debutLigne + avant.length, debutLigne + avant.length + remplace.length);
    });
  };

  const insererLien = () => {
    const sur = lienSur(adresseLien.trim());
    if (!sur) {
      setErreurLien("Adresse invalide : une page du site (ex. /contact) ou une adresse complète commençant par https://");
      return;
    }
    const t = zone.current;
    const sel = t ? t.value.slice(t.selectionStart, t.selectionEnd) : "";
    entourer("[", `](${adresseLien.trim()})`, sel || "texte du lien");
    setLienOuvert(false);
    setAdresseLien("");
    setErreurLien("");
  };

  const titreGoogle = (titreSeo || titre || "Titre de l’actualité").trim();
  const descGoogle = (descSeo || chapo || texteBrut(corps, 160) || "Description de l’actualité").trim();

  return (
    <form onSubmit={surSoumission} onChange={surChangement} className="bo-editeur" noValidate>
      <input type="hidden" name="couverture_media_id" value={couverture ?? ""} />
      <input type="hidden" name="slug" value={slugAffiche} />

      <div className="bo-pile-large" style={{ gap: "1.5rem" }}>
        <div className="bo-carte bo-formulaire">
          <Champ id="titre" libelle="Titre" erreur={erreurs.titre}>
            <input
              {...attributsChamp("titre", erreurs.titre)}
              name="titre"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="bo-saisie"
              style={{ fontSize: "1.15rem", fontWeight: 600 }}
              maxLength={160}
              required
            />
          </Champ>
          <div className="bo-champ">
            <label htmlFor="slug-saisie">Adresse de la page</label>
            <p className="bo-adresse">
              {domaine}/actualites/
              {slugManuel ? null : <strong>{slugAffiche || "…"}</strong>}
            </p>
            {slugManuel ? (
              <input
                {...attributsChamp("slug-saisie", erreurs.slug, true)}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                onBlur={() => setSlug((s) => slugifier(s))}
                className="bo-saisie"
                autoCapitalize="off"
              />
            ) : null}
            <p id="slug-saisie-aide" className="bo-aide">
              {slugManuel ? (
                publie ? (
                  "Attention : changer l’adresse d’une actualité publiée casse les liens déjà partagés."
                ) : (
                  "Lettres sans accents, chiffres et tirets."
                )
              ) : (
                <>
                  Calculée à partir du titre.{" "}
                  <button
                    type="button"
                    className="bo-bouton bo-bouton-discret bo-bouton-petit"
                    onClick={() => {
                      setSlug(slugAffiche);
                      setSlugManuel(true);
                    }}
                  >
                    Modifier l’adresse
                  </button>
                </>
              )}
            </p>
            {erreurs.slug ? (
              <p className="bo-erreur" role="alert">
                {erreurs.slug}
              </p>
            ) : null}
          </div>
          <Champ
            id="chapo"
            libelle="Chapô (introduction)"
            aide="Deux ou trois phrases qui donnent envie de lire, affichées en gros sous le titre."
            facultatif
          >
            <textarea
              {...attributsChamp("chapo", undefined, true)}
              name="chapo"
              value={chapo}
              onChange={(e) => setChapo(e.target.value)}
              className="bo-saisie"
              rows={3}
              maxLength={500}
            />
          </Champ>
        </div>

        <div className="bo-carte bo-pile">
          <div className="bo-onglets" role="tablist" aria-label="Texte de l’actualité">
            <button type="button" role="tab" aria-selected={onglet === "ecrire"} aria-controls="panneau-ecrire" onClick={() => setOnglet("ecrire")}>
              Écrire
            </button>
            <button type="button" role="tab" aria-selected={onglet === "apercu"} aria-controls="panneau-apercu" onClick={() => setOnglet("apercu")}>
              Aperçu
            </button>
          </div>
          <div id="panneau-ecrire" role="tabpanel" hidden={onglet !== "ecrire"} className="bo-pile" style={{ gap: 0 }}>
            <label htmlFor="corps" className="bo-champ" style={{ fontWeight: 600, marginBottom: "0.4rem" }}>
              Texte
            </label>
            <div className="bo-barre-outils" role="toolbar" aria-label="Mise en forme" aria-controls="corps">
              <button type="button" onClick={() => entourer("**", "**", "texte en gras")} title="Mettre en gras le texte sélectionné">
                <strong>Gras</strong>
              </button>
              <button type="button" onClick={() => prefixer("## ", "Intertitre")} title="Transformer la ligne en intertitre">
                Intertitre
              </button>
              <button type="button" onClick={() => prefixer("- ", "Élément de liste")} title="Transformer les lignes en liste à puces">
                • Liste
              </button>
              <button type="button" aria-expanded={lienOuvert} onClick={() => setLienOuvert((v) => !v)} title="Ajouter un lien">
                Lien
              </button>
            </div>
            <textarea
              ref={zone}
              {...attributsChamp("corps", erreurs.corps, true)}
              name="corps"
              value={corps}
              onChange={(e) => setCorps(e.target.value)}
              className="bo-saisie bo-corps"
            />
            {lienOuvert ? (
              <div className="bo-plat-details" style={{ marginTop: "0.6rem" }}>
                <Champ
                  id="adresse-lien"
                  libelle="Adresse du lien"
                  aide="Sélectionnez d’abord les mots à rendre cliquables. Ex. /carte-traiteur ou https://…"
                  erreur={erreurLien}
                >
                  <input
                    {...attributsChamp("adresse-lien", erreurLien, true)}
                    value={adresseLien}
                    onChange={(e) => setAdresseLien(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        insererLien();
                      }
                    }}
                    className="bo-saisie"
                    inputMode="url"
                    autoCapitalize="off"
                  />
                </Champ>
                <div className="bo-actions-formulaire">
                  <button type="button" className="bo-bouton bo-bouton-principal bo-bouton-petit" onClick={insererLien}>
                    Insérer le lien
                  </button>
                  <button type="button" className="bo-bouton bo-bouton-discret bo-bouton-petit" onClick={() => setLienOuvert(false)}>
                    Annuler
                  </button>
                </div>
              </div>
            ) : null}
            <p id="corps-aide" className="bo-aide" style={{ marginTop: "0.5rem" }}>
              Laissez une ligne vide entre deux paragraphes. ## au début d’une ligne : intertitre. - au début d’une ligne : liste. **mots** : gras.
            </p>
            {erreurs.corps ? (
              <p id="corps-erreur" className="bo-erreur" role="alert">
                {erreurs.corps}
              </p>
            ) : null}
          </div>
          <div id="panneau-apercu" role="tabpanel" hidden={onglet !== "apercu"}>
            <article className="bo-apercu-article">
              <h1>{titre || "Titre de l’actualité"}</h1>
              {chapo ? <p className="bo-chapo">{chapo}</p> : null}
              {image ? <Vignette image={image} className="bo-vignette" /> : null}
              {corps.trim() ? <Markdown source={corps} className="prose" /> : <p className="bo-discret">Le texte apparaîtra ici.</p>}
            </article>
          </div>
        </div>

        <details className="bo-replie">
          <summary>Référencement Google (facultatif)</summary>
          <div className="bo-replie-corps bo-formulaire">
            <p className="bo-discret">Sans rien remplir, le titre et le chapô sont utilisés. Aperçu du résultat dans Google :</p>
            <div className="bo-serp" aria-label="Aperçu dans Google">
              <span className="bo-serp-url">
                {domaine.replace(/^https?:\/\//, "")} › actualites › {slugAffiche || "…"}
              </span>
              <span className="bo-serp-titre">{modeleTitre.replace("%s", titreGoogle)}</span>
              <span className="bo-serp-texte">{descGoogle.length > 160 ? `${descGoogle.slice(0, 157)}…` : descGoogle}</span>
            </div>
            <Champ id="titre_seo" libelle="Titre pour Google" erreur={erreurs.titre_seo} facultatif>
              <input
                {...attributsChamp("titre_seo", erreurs.titre_seo)}
                aria-describedby="titre_seo-compteur"
                name="titre_seo"
                value={titreSeo}
                onChange={(e) => setTitreSeo(e.target.value)}
                placeholder={titre}
                className="bo-saisie"
                maxLength={MAX_TITRE_SEO}
              />
              <Compteur id="titre_seo-compteur" valeur={titreSeo || titre} conseille={RECO_TITRE_SEO} max={MAX_TITRE_SEO} />
            </Champ>
            <Champ id="description_seo" libelle="Description pour Google" erreur={erreurs.description_seo} facultatif>
              <textarea
                {...attributsChamp("description_seo", erreurs.description_seo)}
                aria-describedby="description_seo-compteur"
                name="description_seo"
                value={descSeo}
                onChange={(e) => setDescSeo(e.target.value)}
                placeholder={chapo}
                className="bo-saisie"
                rows={3}
                maxLength={MAX_DESC_SEO}
              />
              <Compteur id="description_seo-compteur" valeur={descSeo || chapo} conseille={RECO_DESC_SEO} max={MAX_DESC_SEO} />
            </Champ>
          </div>
        </details>
      </div>

      <aside className="bo-editeur-cote" aria-label="Publication">
        <div className="bo-carte bo-pile">
          <h2 className="bo-sous-titre" style={{ fontSize: "1.15rem", margin: 0 }}>
            Publication
          </h2>
          <p className="bo-discret">
            {article?.etat === "publie"
              ? "En ligne sur le site."
              : article?.etat === "programme"
                ? "Programmée : elle sera en ligne à la date choisie."
                : "Brouillon : visible seulement ici."}
          </p>
          <Champ
            id="publie_le"
            libelle="Date de publication"
            aide="Laissez vide pour publier tout de suite. Une date future programme l’actualité : elle apparaîtra seule."
            erreur={erreurs.publie_le}
            facultatif
          >
            <input
              {...attributsChamp("publie_le", erreurs.publie_le, true)}
              type="datetime-local"
              name="publie_le"
              defaultValue={article?.publie_le ?? ""}
              className="bo-saisie"
            />
          </Champ>
          <div className="bo-pile" style={{ gap: "0.5rem" }}>
            {publie ? (
              <>
                <button type="submit" name="statut" value="publie" className="bo-bouton bo-bouton-principal bo-bouton-large" disabled={enCours}>
                  {enCours ? "Enregistrement…" : "Enregistrer les modifications"}
                </button>
                <button type="submit" name="statut" value="brouillon" className="bo-bouton bo-bouton-secondaire bo-bouton-large" disabled={enCours}>
                  Retirer du site (brouillon)
                </button>
              </>
            ) : (
              <>
                <button type="submit" name="statut" value="brouillon" className="bo-bouton bo-bouton-secondaire bo-bouton-large" disabled={enCours}>
                  {enCours ? "Enregistrement…" : "Enregistrer le brouillon"}
                </button>
                <button type="submit" name="statut" value="publie" className="bo-bouton bo-bouton-principal bo-bouton-large" disabled={enCours}>
                  <Icone nom="coche" taille={18} />
                  Publier
                </button>
              </>
            )}
          </div>
          {article?.etat === "publie" ? (
            <a href={`/actualites/${article.slug}`} target="_blank" rel="noreferrer" className="bo-bouton bo-bouton-discret">
              <Icone nom="externe" taille={18} />
              Voir sur le site<span className="bo-invisible"> (nouvel onglet)</span>
            </a>
          ) : null}
        </div>

        <div className="bo-carte bo-pile">
          <h2 className="bo-sous-titre" style={{ fontSize: "1.15rem", margin: 0 }}>
            Photo de couverture
          </h2>
          {couverture && !image ? <div className="bo-vignette-vide">Photo envoyée, en préparation…</div> : <Vignette image={image} />}
          <div className="bo-rangee" style={{ margin: 0 }}>
            <Mediatheque images={mediatheque} selection={couverture} surChoix={(img) => setCouverture(img.id)} />
            {couverture ? (
              <button type="button" className="bo-bouton bo-bouton-discret" onClick={() => setCouverture(null)}>
                Retirer
              </button>
            ) : null}
          </div>
          <EnvoiFichier champs={{ usage: "media" }} libelleBouton="Envoyer une photo" surTermine={(id) => setCouverture(id)} />
          {couverture !== (article?.couverture_media_id ?? null) ? <p className="bo-modifie">Photo changée : pensez à enregistrer.</p> : null}
        </div>

        {article ? (
          <button
            type="button"
            className="bo-bouton bo-bouton-danger"
            disabled={suppressionEnCours}
            onClick={async () => {
              const ok = await confirmer({
                titre: `Supprimer « ${article.titre} » ?`,
                message: "L’actualité sera effacée définitivement. Pour la retirer du site sans la perdre, repassez-la en brouillon.",
                confirmer: "Supprimer l’actualité",
                danger: true,
              });
              if (ok) executer(() => supprimerArticleAction(article.id), { apres: (r) => r?.ok && router.push(lien("/actualites")) });
            }}
          >
            <Icone nom="poubelle" taille={18} />
            Supprimer l’actualité
          </button>
        ) : null}
      </aside>
    </form>
  );
}
