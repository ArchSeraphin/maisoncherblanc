import { EnTetePage } from "@/components/site/en-tete-page";
import { FormulaireContact } from "@/components/site/formulaire-contact";
import { ListeExceptionnels, TableauHoraires } from "@/components/site/horaires";
import { JsonLd } from "@/components/ui/json-ld";
import { Logo } from "@/components/ui/logo";
import { FlecheDroite } from "@/components/ui/motifs";
import { siteConfig } from "@/config/site";
import { compterVue } from "@/lib/compter-vue";
import { chargerEmplacements } from "@/lib/emplacements";
import { horairesExceptionnelsAVenir } from "@/lib/horaires-exceptionnels";
import { emettreJeton, USAGE_CONTACT } from "@/lib/jeton-formulaire";
import { coordonnees, lireHoraires } from "@/lib/reglages";
import { commerceJsonLd, construireMetadata, elementsFilAriane, filArianeJsonLd, pageWebJsonLd } from "@/lib/seo";
import { photoPartage } from "@/components/site/outils";
import { menusDeSaisonEnCours } from "@/lib/menus";
import styles from "./contact.module.css";

const CHEMIN = "/contact";
const ARIANE = elementsFilAriane(CHEMIN);
const TYPES = ["devis-traiteur", "commande-boucherie", "autre"] as const;

export async function generateMetadata() {
  return construireMetadata({ chemin: CHEMIN });
}

export default async function PageContact({ searchParams }: PageProps<"/contact">) {
  await compterVue(CHEMIN);
  const brut = (await searchParams).type;
  const typeInitial = TYPES.find((t) => t === brut) ?? "devis-traiteur";
  const img = chargerEmplacements(["contact-boutique"] as const);
  const coord = coordonnees();
  const horaires = lireHoraires();
  const exceptionnels = horairesExceptionnelsAVenir(30);
  const a = siteConfig.adresse;
  const adresseRequete = encodeURIComponent(`${a.rue}, ${a.codePostal} ${a.ville}`);
  const applePlans = `https://maps.apple.com/?q=${encodeURIComponent(siteConfig.nom)}&address=${adresseRequete}`;

  return (
    <>
      <JsonLd
        donnees={[
          filArianeJsonLd(ARIANE),
          pageWebJsonLd({ chemin: CHEMIN, type: "ContactPage", image: photoPartage(img["contact-boutique"]) }),
          commerceJsonLd({ horaires, exceptionnels: horairesExceptionnelsAVenir(60), menusSaison: menusDeSaisonEnCours() }),
        ]}
      />

      <EnTetePage
        ariane={ARIANE}
        surtitre="Contact"
        titre={
          <>
            Contact et <em>horaires</em>
          </>
        }
        chapo={
          <p>
            Une commande pour la boucherie, un devis traiteur, une question sur la carte : appelez la boutique, passez nous voir rue Mulsant, ou écrivez-nous avec
            le formulaire ci-dessous. Pour le traiteur, pensez à commander au moins une semaine avant.
          </p>
        }
        actions={
          <>
            <a href={coord.telephone.href} className="bouton">
              Appeler la boutique
            </a>
            <a href="#formulaire" className="bouton bouton-contour">
              Écrire un message
            </a>
          </>
        }
        image={img["contact-boutique"]}
      />

      <section className="section fond-lin" aria-label="Coordonnées et formulaire">
        <div className={`contenu ${styles.grille}`}>
          <div className={styles.infos}>
            <section aria-labelledby="coordonnees">
              <h2 id="coordonnees" className="titre-m">
                Coordonnées
              </h2>
              <dl className={styles.coordonnees}>
                <div>
                  <dt>Adresse</dt>
                  <dd>
                    <address>
                      {siteConfig.nom}
                      <br />
                      {a.rue}
                      <br />
                      {a.codePostal} {a.ville}
                    </address>
                  </dd>
                </div>
                <div>
                  <dt>Téléphone boutique</dt>
                  <dd>
                    <a href={coord.telephone.href} className="lien-souligne">
                      {coord.telephone.affichage}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Mobile</dt>
                  <dd>
                    <a href={coord.mobile.href} className="lien-souligne">
                      {coord.mobile.affichage}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>E-mail</dt>
                  <dd>
                    <a href={`mailto:${coord.email}`} className="lien-souligne">
                      {coord.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Réseaux</dt>
                  <dd className={styles.reseaux}>
                    <a href={siteConfig.reseaux.facebook} className="lien-souligne" target="_blank" rel="noopener noreferrer">
                      Facebook<span className="invisible-accessible"> (nouvel onglet)</span>
                    </a>
                    <a href={siteConfig.reseaux.instagram} className="lien-souligne" target="_blank" rel="noopener noreferrer">
                      Instagram<span className="invisible-accessible"> (nouvel onglet)</span>
                    </a>
                  </dd>
                </div>
              </dl>
            </section>

            <section className={`arche-contour ${styles.horaires}`} aria-labelledby="horaires">
              <h2 id="horaires" className="titre-m">
                Horaires d’ouverture
              </h2>
              <TableauHoraires horaires={horaires} legende="Horaires d’ouverture de la boutique" />
              <ListeExceptionnels exceptionnels={exceptionnels} titre="Dans les prochains jours" />
            </section>
          </div>

          <section className={styles.formulaire} id="formulaire" aria-labelledby="ecrire">
            <h2 id="ecrire" className="titre-l">
              Écrivez-nous
            </h2>
            <FormulaireContact
              jeton={emettreJeton(USAGE_CONTACT)}
              typeInitial={typeInitial}
              telephone={coord.telephone}
              mobile={coord.mobile}
              conservationMois={siteConfig.confidentialite.conservationMessagesMois}
            />
          </section>
        </div>
      </section>

      {/* Accès : pas de carte intégrée, un plan dessiné et les liens d'itinéraire. */}
      <section className="section" aria-labelledby="acces">
        <div className={`contenu ${styles.acces}`}>
          <div>
            <h2 id="acces" className="titre-l">
              Venir à la boutique
            </h2>
            <p className={styles.accesTexte}>
              La boutique se trouve au {a.rue}, à {a.ville} ({a.codePostal}).
            </p>
            <ul className={`sans-puces ${styles.accesLiens}`}>
              <li>
                <a href={siteConfig.itineraire} className="lien-fleche" target="_blank" rel="noopener noreferrer">
                  Itinéraire avec Google Maps<span className="invisible-accessible"> (nouvel onglet)</span> <FlecheDroite />
                </a>
              </li>
              <li>
                <a href={applePlans} className="lien-fleche" target="_blank" rel="noopener noreferrer">
                  Ouvrir dans Plans (Apple)<span className="invisible-accessible"> (nouvel onglet)</span> <FlecheDroite />
                </a>
              </li>
            </ul>
          </div>
          <a href={siteConfig.itineraire} className={styles.plan} target="_blank" rel="noopener noreferrer" aria-label={`Itinéraire vers ${a.rue}, ${a.codePostal} ${a.ville} (Google Maps, nouvel onglet)`}>
            <span className={styles.planBoussole} aria-hidden="true">
              N
            </span>
            <Logo variante="monogramme" couleur="or" taille={64} className={styles.planRepere} />
            <span className={styles.planAdresse}>
              <span className={styles.planRue}>{a.rue}</span>
              <span>
                {a.codePostal} {a.ville}, {a.departement}
              </span>
            </span>
            <span className={`lien-fleche ${styles.planLien}`}>
              Itinéraire <FlecheDroite />
            </span>
          </a>
        </div>
      </section>
    </>
  );
}
