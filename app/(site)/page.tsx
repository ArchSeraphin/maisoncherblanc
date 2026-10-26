import Link from "next/link";
import { FlecheDroite, Surtitre } from "@/components/ui/motifs";
import { JsonLd } from "@/components/ui/json-ld";
import { Visuel } from "@/components/ui/visuel";
import { siteConfig } from "@/config/site";
import { compterVue } from "@/lib/compter-vue";
import { chargerEmplacements, imageEmplacement } from "@/lib/emplacements";
import { horairesExceptionnelsAVenir } from "@/lib/horaires-exceptionnels";
import { lireHoraires } from "@/lib/reglages";
import { commerceJsonLd, construireMetadata, siteWebJsonLd } from "@/lib/seo";
import styles from "./accueil.module.css";

/**
 * Accueil PROVISOIRE (lot fondation) : diptyque « deux portes égales » et JSON-LD.
 * À compléter par le lot « pages publiques » (sections de docs/COPY.md, section 2).
 */

export async function generateMetadata() {
  return construireMetadata({
    titreAbsolu: "Boucherie, charcuterie, traiteur à Roanne | Maison Cherblanc",
    description:
      "Maison Cherblanc, 55 rue Mulsant à Roanne : boucherie, charcuterie et traiteur. Viandes, volailles, plateaux, buffets et mariages. Devis gratuit.",
    chemin: "/",
    image: imageEmplacement("og-defaut"),
  });
}

export default async function Accueil() {
  await compterVue("/");
  const img = chargerEmplacements(["accueil-hero-boucherie", "accueil-hero-traiteur"] as const);
  const portes = [
    {
      titre: "Boucherie",
      article: "La",
      texte: "Viandes, volailles et charcuterie, servies et conseillées au comptoir. Ouvert six jours sur sept, dimanche matin compris.",
      href: "/boucherie-roanne",
      bouton: "Découvrir la boucherie",
      image: img["accueil-hero-boucherie"],
    },
    {
      titre: "Traiteur",
      article: "Le",
      texte: "Plateaux, buffets, cocktails dînatoires et repas de mariage, préparés par la maison. Service à table en option.",
      href: "/traiteur-roanne",
      bouton: "Découvrir le traiteur",
      image: img["accueil-hero-traiteur"],
    },
  ];

  return (
    <>
      <JsonLd donnees={[commerceJsonLd({ horaires: lireHoraires(), exceptionnels: horairesExceptionnelsAVenir(60) }), siteWebJsonLd()]} />
      <section className={styles.hero}>
        <div className={`contenu-large ${styles.entete}`}>
          <Surtitre>
            {siteConfig.nom} · {siteConfig.adresse.rue}, {siteConfig.adresse.ville}
          </Surtitre>
          <h1 className={`titre-xl fondu-entree ${styles.titre}`}>
            <em>Boucherie</em>, charcuterie et <em>traiteur</em> à Roanne
          </h1>
        </div>
        <div className={`contenu-large ${styles.diptyque}`}>
          {portes.map((p, i) => (
            <Link key={p.href} href={p.href} className={styles.porte}>
              <div className={`cadre zoom-lent ${styles.visuel}`}>
                <Visuel image={p.image} alt="" sizes="(min-width: 900px) 50vw, 100vw" priorite={i === 0} largeurCible={1600} />
              </div>
              <div className={styles.texte}>
                <h2 className="titre-l">
                  {p.article} <em>{p.titre}</em>
                </h2>
                <p>{p.texte}</p>
                <span className="lien-fleche">
                  {p.bouton}
                  <FlecheDroite />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
