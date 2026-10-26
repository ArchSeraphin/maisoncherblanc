import Link from "next/link";
import { AppelFinal } from "@/components/site/appel-final";
import { CadrePhoto } from "@/components/site/cadre-photo";
import { EnTetePage } from "@/components/site/en-tete-page";
import s from "@/components/site/sections.module.css";
import { JsonLd } from "@/components/ui/json-ld";
import { siteConfig } from "@/config/site";
import { compterVue } from "@/lib/compter-vue";
import { chargerEmplacements } from "@/lib/emplacements";
import { construireMetadata, elementsFilAriane, filArianeJsonLd, pageWebJsonLd } from "@/lib/seo";
import { photoPartage } from "@/components/site/outils";
import styles from "./maison.module.css";

const CHEMIN = "/la-maison";
const ARIANE = elementsFilAriane(CHEMIN);

export async function generateMetadata() {
  const img = chargerEmplacements(["maison-hero", "maison-equipe"] as const);
  return construireMetadata({ chemin: CHEMIN, image: photoPartage(img["maison-hero"]) ?? photoPartage(img["maison-equipe"]) });
}

const ENGAGEMENTS = [
  {
    titre: "Des prix affichés.",
    texte: "La carte traiteur est publique, avec ses prix à la personne, à la part ou à la pièce. Vous savez ce que vous commandez.",
  },
  { titre: "Un délai réaliste.", texte: "Nous demandons une semaine pour une commande traiteur : c’est le temps de bien faire." },
  { titre: "Le service si vous le voulez.", texte: "Retrait en boutique, ou service à table le jour de votre réception." },
  { titre: "Une boutique ouverte six jours sur sept.", texte: "Du mardi au samedi, et le dimanche matin." },
];

export default async function PageMaison() {
  await compterVue(CHEMIN);
  const img = chargerEmplacements(["maison-hero", "maison-equipe"] as const);
  const gerants = siteConfig.gerants;

  return (
    <>
      <JsonLd donnees={[filArianeJsonLd(ARIANE), pageWebJsonLd({ chemin: CHEMIN, type: "AboutPage", image: photoPartage(img["maison-hero"]) ?? photoPartage(img["maison-equipe"]) })]} />

      <EnTetePage
        ariane={ARIANE}
        surtitre="La maison"
        titre={
          <>
            La maison <em>Cherblanc</em>
          </>
        }
        chapo={
          <p>
            Une boucherie de quartier et un traiteur, réunis sous le même nom, au 55 rue Mulsant à Roanne. Voici qui nous sommes et comment nous travaillons.
          </p>
        }
        image={img["maison-hero"]}
      />

      {/* Histoire */}
      <section className="section fond-lin" aria-labelledby="histoire">
        <div className={`contenu ${styles.histoire}`}>
          <div>
            <p className="surtitre apparait">Rue Mulsant</p>
            <h2 id="histoire" className="titre-l apparait">
              Une boucherie reprise en 2023
            </h2>
          </div>
          <div className={`apparait ${styles.histoireTexte}`}>
            <p className={styles.lettrine}>
              En août 2023, Maison Cherblanc a repris la boucherie du 55 rue Mulsant, à Roanne. La boutique a gardé son comptoir, son numéro de téléphone et sa
              vocation : servir chaque semaine les habitants du quartier en viande, en volailles et en charcuterie. Elle y exerce deux métiers à parts égales :
              la boucherie-charcuterie et le traiteur (plateaux, plats cuisinés, cocktails, buffets et repas de mariage).
            </p>
            <p>
              La maison est dirigée par {gerants.length > 1 ? `${gerants.slice(0, -1).join(", ")} et ${gerants[gerants.length - 1]}` : gerants[0]}.
            </p>
          </div>
        </div>
      </section>

      {/* Deux métiers */}
      <section className="section fond-olive grain" aria-labelledby="deux-metiers">
        <div className={`contenu-etroit centre ${styles.metiers}`}>
          <p className="surtitre apparait">Deux métiers</p>
          <h2 id="deux-metiers" className="titre-l apparait">
            Boucher et <em>traiteur</em>, à égalité
          </h2>
          <p className={`apparait ${styles.metiersTexte}`}>
            Au comptoir, le métier de boucher : choisir, découper, parer, conseiller. En cuisine, le métier de traiteur : cuisiner, dresser, préparer pour
            l’heure dite et, si vous le souhaitez, servir. Les deux se nourrissent l’un l’autre. Les rôtis du buffet viennent de la boucherie ; le savoir-faire du
            traiteur se retrouve dans les plats cuisinés vendus à la part.
          </p>
        </div>
      </section>

      {/* Façon de travailler */}
      <section className="section" aria-labelledby="facon">
        <div className="contenu">
          <div className={s.tete}>
            <p className="surtitre apparait">Notre façon de travailler</p>
            <h2 id="facon" className="titre-l apparait">
              Ce sur quoi vous pouvez compter
            </h2>
          </div>
          <ul className={`sans-puces serie ${s.points} ${styles.engagements}`}>
            {ENGAGEMENTS.map((e) => (
              <li key={e.titre} className={`apparait ${s.point}`}>
                <h3>{e.titre}</h3>
                <p>{e.texte}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* L'équipe */}
      <section className="section fond-lin" aria-labelledby="equipe">
        <div className={`contenu ${s.duo} ${s.duoInverse}`}>
          <div className={s.duoTexte}>
            <p className="surtitre apparait">L’équipe</p>
            <h2 id="equipe" className="titre-l apparait">
              Les visages de la maison
            </h2>
            <p className="apparait">
              Au comptoir, en cuisine et en salle le jour de vos réceptions, c’est la même équipe. Vous la reconnaîtrez souvent à sa tenue noire, brodée du
              monogramme MC.
            </p>
          </div>
          <div className={`apparait ${s.duoImage}`}>
            <CadrePhoto image={img["maison-equipe"]} className="ratio-portrait" sizes="(min-width: 900px) 40vw, 92vw" />
          </div>
        </div>
      </section>

      <AppelFinal
        titre="Passez nous voir"
        texte={`${siteConfig.adresse.rue}, ${siteConfig.adresse.codePostal} ${siteConfig.adresse.ville}. Du mardi au dimanche matin.`}
        actions={
          <>
            <Link href="/boucherie-roanne" className="bouton">
              La boucherie
            </Link>
            <Link href="/traiteur-roanne" className="bouton">
              Le traiteur
            </Link>
            <Link href="/contact" className="bouton bouton-contour">
              Horaires et contact
            </Link>
          </>
        }
      />
    </>
  );
}
