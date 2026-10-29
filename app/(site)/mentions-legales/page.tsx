import Link from "next/link";
import { EnTetePage } from "@/components/site/en-tete-page";
import { JsonLd } from "@/components/ui/json-ld";
import { siteConfig } from "@/config/site";
import { compterVue } from "@/lib/compter-vue";
import { idGoogleAnalytics } from "@/lib/env";
import { visuelsProvisoiresPublies } from "@/lib/lecture-site";
import { coordonnees } from "@/lib/reglages";
import { construireMetadata, elementsFilAriane, filArianeJsonLd } from "@/lib/seo";
import styles from "../legal.module.css";

const CHEMIN = "/mentions-legales";
const ARIANE = elementsFilAriane(CHEMIN);
const EN_COURS = "Information en cours de mise à jour.";

export async function generateMetadata() {
  return construireMetadata({ chemin: CHEMIN });
}

export default async function PageMentions() {
  await compterVue(CHEMIN);
  const e = siteConfig.legal.editeur;
  const h = siteConfig.legal.hebergeur;
  const coord = coordonnees();
  const provisoires = visuelsProvisoiresPublies();
  const ga = Boolean(idGoogleAnalytics());
  const lignesHebergeur = [h.nom, h.adresse, h.telephone ? `Téléphone : ${h.telephone}` : null, h.pays].filter(Boolean);

  return (
    <>
      <JsonLd donnees={filArianeJsonLd(ARIANE)} />
      <EnTetePage
        ariane={ARIANE}
        sansImage
        titre="Mentions légales"
        chapo={<p>Informations prévues par l’article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique (LCEN).</p>}
      />

      <div className={`contenu-etroit ${styles.page}`}>
        <div className="prose">
          <h2>Éditeur du site</h2>
          <p>Le site maisoncherblanc.fr est édité par :</p>
          <p>
            <strong>{e.nomCommercial}</strong>
            {e.denomination && e.denomination.toLowerCase() !== e.nomCommercial.toLowerCase() ? ` (${e.denomination})` : ""}
            {e.formeJuridique ? (
              <>
                <br />
                {e.formeJuridique}
                {e.capital ? ` au capital de ${e.capital}` : ""}
              </>
            ) : null}
            <br />
            Siège social : {e.adresse}
            {e.rcs ? (
              <>
                <br />
                {e.rcs}
              </>
            ) : null}
            {e.siret ? (
              <>
                <br />
                SIRET : {e.siret}
              </>
            ) : null}
            {e.tva ? (
              <>
                <br />
                N° de TVA intracommunautaire : {e.tva}
              </>
            ) : null}
            <br />
            Téléphone : <a href={coord.telephone.href}>{coord.telephone.affichage}</a>
            <br />
            E-mail : <a href={`mailto:${coord.email}`}>{coord.email}</a>
          </p>

          <h2>Directeur de la publication</h2>
          <p>{e.directeurPublication ?? EN_COURS}</p>

          <h2>Hébergeur</h2>
          <p>
            {lignesHebergeur.length
              ? lignesHebergeur.map((l, i) => (
                  <span key={i}>
                    {i ? <br /> : null}
                    {l}
                  </span>
                ))
              : EN_COURS}
          </p>

          <h2>Conception et réalisation</h2>
          <p>Agence Voilà Voilà.</p>

          <h2>Crédits photographiques</h2>
          <p>
            {siteConfig.legal.creditsPhotos ?? "Photographies : Maison Cherblanc."}
            {provisoires
              ? " Certains visuels d’illustration provisoires ont été générés par intelligence artificielle et seront remplacés par des photographies de la maison."
              : ""}
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            L’ensemble des contenus du site (textes, photographies, logo, cartes et menus) est la propriété de Maison Cherblanc ou de ses partenaires. Toute
            reproduction, même partielle, sans autorisation écrite préalable est interdite.
          </p>

          <h2>Prix et commandes</h2>
          <p>
            Les prix affichés sur le site sont indiqués en euros, toutes taxes comprises, et correspondent aux cartes en vigueur aux dates indiquées. Ils sont
            donnés à titre d’information : seuls le devis et la confirmation de commande engagent les deux parties.
          </p>

          <h2>Médiation de la consommation</h2>
          <p>
            Conformément aux articles L. 612-1 et suivants du Code de la consommation, en cas de litige non résolu avec nous, vous pouvez recourir gratuitement
            à un médiateur de la consommation. Coordonnées du médiateur : {EN_COURS.charAt(0).toLowerCase() + EN_COURS.slice(1)}
          </p>

          <h2>Données personnelles et cookies</h2>
          <p>
            Le traitement de vos données et {ga ? "la mesure d’audience soumise à votre consentement" : "l’absence de cookies de mesure d’audience"} sont décrits dans la{" "}
            <Link href="/politique-de-confidentialite">politique de confidentialité</Link>.
          </p>

          <h2>Droit applicable</h2>
          <p>Le présent site et ses mentions légales sont soumis au droit français.</p>
        </div>
      </div>
    </>
  );
}
