import Link from "next/link";
import { CarteMenu } from "@/components/site/carte-menu";
import { EnTetePage } from "@/components/site/en-tete-page";
import { majuscule } from "@/components/site/horaires";
import { datesLimitesFetes, jourCourt, lignes, photoPartage } from "@/components/site/outils";
import s from "@/components/site/sections.module.css";
import { JsonLd } from "@/components/ui/json-ld";
import { FlecheDroite } from "@/components/ui/motifs";
import { articlePublie } from "@/lib/articles";
import { compterVue } from "@/lib/compter-vue";
import { ajouterJours, formaterJourLong, jourParis } from "@/lib/dates";
import { chargerEmplacements } from "@/lib/emplacements";
import { listerHorairesExceptionnels, type HoraireExceptionnel } from "@/lib/horaires-exceptionnels";
import { formaterPoids } from "@/lib/media-url";
import { menusDeSaisonEnCours, type MenuComplet } from "@/lib/menus";
import { construireMetadata, elementsFilAriane, filArianeJsonLd, menuJsonLd, seoMenusDeFetes } from "@/lib/seo";
import styles from "./fetes.module.css";

const CHEMIN = "/menus-de-fetes";
const ARIANE = elementsFilAriane(CHEMIN);
const GUIDE_VOLAILLE = "volaille-de-fete-choisir-cuire";

export async function generateMetadata() {
  const t = seoMenusDeFetes(menusDeSaisonEnCours());
  const image = photoPartage(chargerEmplacements(["fetes-hero"] as const)["fetes-hero"]);
  return construireMetadata({ chemin: CHEMIN, titreAbsolu: t.titre, description: t.description, image });
}

type Groupe = { du: string; au: string; h: HoraireExceptionnel };

/** Jours fermés consécutifs à la même note regroupés (« Du vendredi 1er au lundi 4 janvier 2027 »). */
function grouperFermetures(liste: HoraireExceptionnel[]): Groupe[] {
  const groupes: Groupe[] = [];
  for (const h of liste) {
    const dernier = groupes[groupes.length - 1];
    if (dernier && ajouterJours(dernier.au, 1) === h.date && dernier.h.note === h.note) dernier.au = h.date;
    else groupes.push({ du: h.date, au: h.date, h });
  }
  return groupes;
}

function libelleGroupe(g: Groupe): string {
  if (g.du === g.au) return majuscule(formaterJourLong(g.du));
  const debut = formaterJourLong(g.du).replace(/ \d{4}$/, "");
  return `Du ${g.du.slice(5, 7) === g.au.slice(5, 7) ? debut.replace(/ [a-zéû]+$/, "") : debut} au ${formaterJourLong(g.au)}`;
}

function Menu({ menu, premier }: { menu: MenuComplet; premier: boolean }) {
  return (
    <section className={`section ${premier ? "fond-lin" : ""}`} aria-labelledby={`menu-${menu.id}`}>
      <div className="contenu">
        <div className={s.tete}>
          {menu.sous_titre ? <p className="surtitre">{menu.sous_titre}</p> : null}
          <h2 id={`menu-${menu.id}`} className="titre-l">
            {menu.titre}
          </h2>
          {menu.intro ? <p>{menu.intro}</p> : null}
        </div>
        <CarteMenu sections={menu.sections} niveauTitre={3} />
      </div>
    </section>
  );
}

export default async function PageFetes() {
  await compterVue(CHEMIN);
  const menus = menusDeSaisonEnCours();
  const img = chargerEmplacements(["fetes-hero"] as const);
  const menu = menus[0] ?? null;

  if (!menu) {
    return (
      <>
        <JsonLd donnees={filArianeJsonLd(ARIANE)} />
        <EnTetePage
          ariane={ARIANE}
          surtitre="Menus de saison"
          titre={
            <>
              Menus de <em>fêtes</em>
            </>
          }
          chapo={
            <p>
              Nos menus de fêtes sont publiés ici quelques semaines avant chaque période, avec les dates limites de commande et les horaires d’ouverture
              exceptionnels. Le prochain arrive bientôt.
            </p>
          }
          image={img["fetes-hero"]}
        />
        <section className="section fond-lin" aria-labelledby="en-attendant">
          <div className={`contenu-etroit centre ${styles.vide}`}>
            <h2 id="en-attendant" className="titre-l">
              En attendant
            </h2>
            <p className="chapo">
              Toute l’année, la carte traiteur reste disponible : plateaux, plats cuisinés, petit dînatoire et desserts. Pour une commande particulière ou une
              date à réserver dès maintenant, écrivez-nous : nous vous répondrons, et nous vous préviendrons à la sortie du prochain menu si vous le précisez
              dans votre message.
            </p>
            <div className={`rangee ${styles.videActions}`}>
              <Link href="/carte-traiteur" className="bouton">
                Voir la carte traiteur
              </Link>
              <Link href="/contact" className="bouton bouton-contour">
                Nous écrire
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const { annee } = datesLimitesFetes(menu);
  const aujourdhui = jourParis();
  const fin = menu.publie_au ?? ajouterJours(aujourdhui, 90);
  const exceptionnels = listerHorairesExceptionnels({ aPartirDu: aujourdhui }).filter((h) => h.date <= ajouterJours(fin, 7));
  const ouvertures = exceptionnels.filter((h) => !h.ferme);
  const fermetures = grouperFermetures(exceptionnels.filter((h) => h.ferme));
  const reouverture = [...new Set(exceptionnels.filter((h) => h.ferme && /réouverture/i.test(h.note)).map((h) => h.note))];
  const volailles = menu.sections.find((x) => /volaille/i.test(x.titre) && x.note);
  const guide = articlePublie(GUIDE_VOLAILLE);
  const pdf = menu.pdf;
  const nbMenus = menu.sections.filter((x) => x.mise_en_avant).reduce((n, x) => n + x.plats.length, 0);

  return (
    <>
      <JsonLd donnees={[...menus.map((m) => menuJsonLd(m, CHEMIN)), filArianeJsonLd(ARIANE)]} />

      <EnTetePage
        ariane={ARIANE}
        surtitre="Fêtes de fin d’année · Traiteur à Roanne"
        titre={
          <>
            Menus de <em>fêtes</em>
            {annee ? ` ${annee}` : ""}
          </>
        }
        chapo={
          <p>
            {menu.intro ||
              `Pour Noël et le jour de l’An, Maison Cherblanc vous propose ${nbMenus === 2 ? "deux menus de fêtes" : nbMenus > 1 ? `${nbMenus} menus de fêtes` : "un menu de fêtes"}, une carte d’entrées, de plats cuisinés et d’accompagnements, des volailles fermières sur commande et un petit dînatoire de Noël.`}{" "}
            {lignes(menu.infos_commande)[0] ?? ""}
          </p>
        }
        actions={
          <>
            {pdf ? (
              <a href={pdf.urlTelechargement} className="bouton" download>
                Télécharger le menu (PDF)
              </a>
            ) : null}
            <Link href="/contact?type=devis-traiteur" className={`bouton ${pdf ? "bouton-contour" : ""}`}>
              Passer commande
            </Link>
          </>
        }
        pied={pdf ? <p className="mention">PDF, {formaterPoids(pdf.poids)}</p> : null}
        image={img["fetes-hero"]}
      />

      {/* Dates à retenir */}
      <section className="section" aria-labelledby="dates">
        <div className="contenu">
          <div className={`arche-contour ${styles.dates}`}>
            <div className={`centre ${styles.datesTete}`}>
              <p className="surtitre">Dates à retenir</p>
              <h2 id="dates" className="titre-l">
                Dates de commande et horaires des fêtes{annee ? ` ${annee}` : ""}
              </h2>
            </div>
            <div className={styles.datesGrille}>
              <div>
                <h3 className={styles.datesTitre}>Dates limites de commande</h3>
                <ul className="sans-puces">
                  {lignes(menu.infos_commande).map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                  {volailles ? (
                    <li>
                      {volailles.titre} : {volailles.note.charAt(0).toLowerCase()}
                      {volailles.note.slice(1)}.
                    </li>
                  ) : null}
                </ul>
              </div>
              {ouvertures.length ? (
                <div>
                  <h3 className={styles.datesTitre}>Ouvertures exceptionnelles</h3>
                  <ul className="sans-puces">
                    {ouvertures.map((h) => (
                      <li key={h.id}>
                        <strong>{majuscule(formaterJourLong(h.date))}</strong> : {h.plages === null ? h.note : jourCourt(h.plages)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {fermetures.length ? (
                <div>
                  <h3 className={styles.datesTitre}>Jours de fermeture</h3>
                  <ul className="sans-puces">
                    {fermetures.map((g) => (
                      <li key={g.du}>
                        <strong>{libelleGroupe(g)}</strong>
                        {g.h.note && !/réouverture/i.test(g.h.note) ? ` : ${g.h.note}` : ""}
                      </li>
                    ))}
                    {reouverture.map((n) => (
                      <li key={n}>{n.replace(/\.$/, "")}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {menus.map((m, i) => (
        <Menu key={m.id} menu={m} premier={i === 0} />
      ))}

      {/* Remerciements */}
      <section className="section-serree fond-olive grain" aria-label="Remerciements">
        <div className={`contenu-etroit centre ${styles.merci}`}>
          {menu.note_bas ? <p className={styles.merciTexte}>{menu.note_bas}</p> : null}
          <ul className={`sans-puces ${styles.merciLiens}`}>
            <li>
              <Link href="/boucherie-roanne" className="lien-fleche">
                Les volailles et la charcuterie de fête à la boucherie <FlecheDroite />
              </Link>
            </li>
            {guide ? (
              <li>
                <Link href={`/actualites/${GUIDE_VOLAILLE}`} className="lien-fleche">
                  Conseils : bien choisir et cuire sa volaille de fête <FlecheDroite />
                </Link>
              </li>
            ) : null}
          </ul>
        </div>
      </section>

    </>
  );
}
