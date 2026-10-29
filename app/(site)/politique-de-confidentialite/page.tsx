import Link from "next/link";
import { BoutonCookies } from "@/components/site/consentement";
import { EnTetePage } from "@/components/site/en-tete-page";
import { JsonLd } from "@/components/ui/json-ld";
import { siteConfig } from "@/config/site";
import { compterVue } from "@/lib/compter-vue";
import { idGoogleAnalytics } from "@/lib/env";
import { notificationEmailActive } from "@/lib/lecture-site";
import { coordonnees } from "@/lib/reglages";
import { construireMetadata, elementsFilAriane, filArianeJsonLd } from "@/lib/seo";
import styles from "../legal.module.css";

const CHEMIN = "/politique-de-confidentialite";
const ARIANE = elementsFilAriane(CHEMIN);
/** Date de rédaction de cette politique (à changer à chaque modification du texte). */
const DERNIERE_MISE_A_JOUR = "29 octobre 2026";

export async function generateMetadata() {
  return construireMetadata({ chemin: CHEMIN });
}

export default async function PageConfidentialite() {
  await compterVue(CHEMIN);
  const e = siteConfig.legal.editeur;
  const h = siteConfig.legal.hebergeur;
  const conf = siteConfig.confidentialite;
  const coord = coordonnees();
  const brevo = notificationEmailActive();
  const ga = Boolean(idGoogleAnalytics());
  const gm = conf.prestataireMesure;
  const hebergeur = [h.nom, h.adresse, h.telephone, h.pays].filter(Boolean).join(", ");
  const mail = <a href={`mailto:${coord.email}`}>{coord.email}</a>;

  return (
    <>
      <JsonLd donnees={filArianeJsonLd(ARIANE)} />
      <EnTetePage
        ariane={ARIANE}
        sansImage
        titre="Politique de confidentialité"
        chapo={
          <p>
            Cette page explique simplement quelles données personnelles le site maisoncherblanc.fr collecte, pourquoi, combien de temps, et comment exercer vos
            droits. Elle répond à l’article 13 du Règlement général sur la protection des données (RGPD).
          </p>
        }
        pied={<p className={styles.maj}>Dernière mise à jour : {DERNIERE_MISE_A_JOUR}</p>}
      />

      <div className={`contenu-etroit ${styles.page}`}>
        <div className="prose">
          <h2>Qui est responsable de vos données ?</h2>
          <p>Le responsable du traitement est :</p>
          <p>
            {e.nomCommercial}
            {e.formeJuridique ? `, ${e.formeJuridique.replace(/ \(SARL\)$/, "").toLowerCase()}${e.capital ? ` au capital de ${e.capital}` : ""}` : ""}
            <br />
            {e.adresse}
            {e.rcs ? (
              <>
                <br />
                {e.rcs}
              </>
            ) : null}
            <br />
            Téléphone : <a href={coord.telephone.href}>{coord.telephone.affichage}</a>
            <br />
            E-mail : {mail}
          </p>
          <p>
            Maison Cherblanc n’a pas désigné de délégué à la protection des données, cette désignation n’étant pas obligatoire pour son activité. Pour toute
            question sur vos données, écrivez à {mail}.
          </p>

          <h2>Ce que nous collectons, et pourquoi</h2>
          <h3>Le formulaire de contact et de devis</h3>
          <p>
            <strong>Données collectées :</strong> type de demande, prénom, nom, adresse e-mail, numéro de téléphone, date de l’événement et nombre de personnes
            (si vous les indiquez), contenu de votre message, date d’envoi.
          </p>
          <p>
            <strong>Finalité :</strong> répondre à votre demande (question, commande à la boucherie, demande de devis traiteur) et, le cas échéant, préparer
            votre commande.
          </p>
          <p>
            <strong>Base légale :</strong> l’exécution de mesures précontractuelles prises à votre demande lorsque vous demandez un devis ou passez commande
            (article 6.1.b du RGPD) ; notre intérêt légitime à répondre aux personnes qui nous écrivent pour toute autre question (article 6.1.f).
          </p>
          <p>
            <strong>Durée de conservation :</strong> {conf.conservationMessagesMois} mois à compter de la réception du message, puis suppression automatique. Si
            votre demande aboutit à une commande, les informations nécessaires à la facturation sont conservées le temps imposé par la loi (10 ans pour les
            pièces comptables).
          </p>
          <p>
            <strong>Destinataires :</strong> uniquement les personnes de Maison Cherblanc chargées de répondre aux demandes. Vos données ne sont ni vendues, ni
            louées, ni utilisées pour de la prospection commerciale.
          </p>
          {brevo ? (
            <p>
              <strong>Notification par e-mail :</strong> lorsque vous envoyez le formulaire, une copie de votre message nous est transmise par e-mail via le
              service {conf.prestataireEmail.nom} ({conf.prestataireEmail.societe}, {conf.prestataireEmail.ville}), qui agit comme sous-traitant pour le seul
              envoi de ce message. La suppression automatique ne concerne que la base du site : cette copie reçue dans notre messagerie est supprimée par
              Maison Cherblanc dans le même délai de {conf.conservationMessagesMois} mois.
            </p>
          ) : null}

          <h3>La mesure d’audience</h3>
          <p>
            Pour savoir quelles pages sont consultées, le site utilise un compteur interne qui enregistre uniquement, pour chaque jour, l’adresse de la page vue
            et le nombre de visites qu’elle a reçues.
          </p>
          <p>
            Ce compteur ne dépose aucun cookie, ne lit rien sur votre appareil, n’enregistre pas votre adresse IP et ne permet ni de vous identifier, ni de
            suivre votre navigation d’une page à l’autre.
          </p>
          <p>
            <strong>Base légale :</strong> notre intérêt légitime à mesurer la fréquentation du site pour l’améliorer (article 6.1.f). Aucune donnée permettant
            de vous identifier n’étant collectée, ce compteur ne demande pas votre consentement.
          </p>
          {ga ? (
            <>
              <h3>Google Analytics, seulement avec votre accord</h3>
              <p>
                Si vous l’acceptez dans le bandeau affiché lors de votre première visite, le site utilise aussi {gm.nom} ({gm.societe}, {gm.adresse}) pour
                mieux comprendre sa fréquentation : pages consultées, durée de visite, type d’appareil et de navigateur, ville approximative, site de
                provenance. Sans votre accord, aucun script Google n’est chargé.
              </p>
              <p>
                <strong>Traceurs déposés :</strong> les cookies <code>_ga</code> et <code>_ga_…</code>, valables 13 mois au plus. Les signaux publicitaires
                et la personnalisation des annonces sont désactivés.
              </p>
              <p>
                <strong>Base légale :</strong> votre consentement (article 6.1.a du RGPD et article 82 de la loi Informatique et Libertés), que vous pouvez
                retirer à tout moment : <BoutonCookies />.
              </p>
              <p>
                <strong>Durée de conservation :</strong> {conf.conservationAnalyticsMois} mois dans {gm.nom}, puis suppression automatique.
              </p>
              <p>
                <strong>Transferts hors de l’Union européenne :</strong> Google LLC peut traiter ces données aux États-Unis. Ces transferts sont encadrés par
                le Data Privacy Framework entre l’Union européenne et les États-Unis (décision d’adéquation de la Commission européenne du 10 juillet 2023)
                et par les clauses contractuelles types de la Commission européenne.
              </p>
            </>
          ) : null}

          <h3>Les comptes administrateurs</h3>
          <p>L’espace d’administration du site est réservé à l’équipe de Maison Cherblanc et à son prestataire technique.</p>
          <p>
            <strong>Données collectées :</strong> nom, adresse e-mail, mot de passe (stocké uniquement sous forme chiffrée et irréversible), cookie de session.
          </p>
          <p>
            <strong>Finalité :</strong> sécuriser l’accès à l’administration du site.
          </p>
          <p>
            <strong>Base légale :</strong> intérêt légitime à protéger le site (article 6.1.f).
          </p>
          <p>
            <strong>Durée de conservation :</strong> tant que le compte est actif.
          </p>
          <p>
            Le cookie de session n’est déposé que sur l’appareil d’un administrateur connecté. Il est strictement nécessaire au fonctionnement de
            l’administration et n’est pas soumis au consentement.
          </p>

          <h3>Les journaux techniques du serveur</h3>
          <p>
            Comme tout site web, le serveur peut enregistrer des journaux techniques (adresse IP, date et heure, page demandée, navigateur) pour assurer la
            sécurité et le bon fonctionnement du site. Ces journaux sont conservés pour une durée limitée et ne servent à aucune autre fin.
          </p>
          <p>
            <strong>Base légale :</strong> intérêt légitime à sécuriser le site (article 6.1.f).
          </p>

          <h2>Cookies et traceurs</h2>
          {ga ? (
            <>
              <p>
                Le site public de Maison Cherblanc ne dépose <strong>aucun cookie</strong> de publicité ou de réseau social. Le seul traceur tiers est{" "}
                {gm.nom}, chargé <strong>uniquement si vous l’acceptez</strong>. Le site ne charge <strong>aucun contenu intégré</strong> : pas de carte
                Google Maps, pas de vidéo YouTube, pas de module Facebook ou Instagram dans les pages. Les polices de caractères sont hébergées sur le
                serveur du site.
              </p>
              <p>
                Votre choix (accepter ou refuser) est enregistré dans le stockage local de votre navigateur, sans cookie, pendant 6 mois ; le bandeau vous
                est ensuite reproposé. Refuser est aussi simple qu’accepter et ne limite en rien l’accès au site. Pour changer d’avis à tout moment :{" "}
                <BoutonCookies /> (lien également présent en bas de chaque page).
              </p>
            </>
          ) : (
            <p>
              Le site public de Maison Cherblanc ne dépose <strong>aucun cookie</strong> de mesure d’audience, de publicité ou de réseau social. Il ne charge{" "}
              <strong>aucun traceur tiers</strong> et <strong>aucun contenu intégré</strong> : pas de carte Google Maps, pas de vidéo YouTube, pas de module
              Facebook ou Instagram dans les pages. Les polices de caractères sont hébergées sur le serveur du site.
            </p>
          )}
          <p>
            Les liens vers Google Maps, Facebook ou Instagram sont de simples liens : ces services ne reçoivent aucune donnée tant que vous ne cliquez pas. Une
            fois sur leur site, c’est leur propre politique qui s’applique.
          </p>

          <h2>Hébergement et sécurité</h2>
          <p>Le site est hébergé par : {hebergeur || "information en cours de mise à jour"}.</p>
          <p>
            L’hébergeur agit comme sous-traitant de Maison Cherblanc au sens de l’article 28 du RGPD. Les données sont protégées par des mesures adaptées :
            connexion chiffrée (HTTPS), mots de passe chiffrés, accès à l’administration restreint, suppression automatique des messages après{" "}
            {conf.conservationMessagesMois} mois.
          </p>

          <h2>Vos droits</h2>
          <p>Vous disposez sur vos données des droits suivants :</p>
          <ul>
            <li>
              <strong>Accès</strong> : savoir quelles données nous détenons sur vous.
            </li>
            <li>
              <strong>Rectification</strong> : corriger des données inexactes.
            </li>
            <li>
              <strong>Effacement</strong> : demander la suppression de vos données.
            </li>
            <li>
              <strong>Limitation</strong> : geler temporairement l’utilisation de vos données.
            </li>
            <li>
              <strong>Opposition</strong> : vous opposer à un traitement fondé sur notre intérêt légitime.
            </li>
            <li>
              <strong>Portabilité</strong> : récupérer les données que vous nous avez fournies, dans un format lisible.
            </li>
            <li>
              <strong>Directives post-mortem</strong> : définir le sort de vos données après votre décès.
            </li>
          </ul>
          <p>
            Pour exercer ces droits, écrivez à {mail} ou par courrier à {e.nomCommercial}, {e.adresse}. Nous vous répondons dans un délai d’un mois. Une pièce
            d’identité pourra vous être demandée en cas de doute raisonnable sur votre identité.
          </p>

          <h2>Réclamation</h2>
          <p>
            Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la Commission nationale de
            l’informatique et des libertés (CNIL) : 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, ou en ligne sur{" "}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
              www.cnil.fr
            </a>
            .
          </p>

          <h2>Modifications</h2>
          <p>
            Cette politique peut évoluer, notamment si le site ajoute de nouvelles fonctionnalités. La date de dernière mise à jour figure en haut de la page.
            Voir aussi les <Link href="/mentions-legales">mentions légales</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
