import Link from "next/link";
import { AppelFinal } from "@/components/site/appel-final";
import { AvisClients } from "@/components/site/avis-clients";
import { CadrePhoto } from "@/components/site/cadre-photo";
import { TableauHoraires } from "@/components/site/horaires";
import { ListePrix, lignePlat } from "@/components/site/liste-prix";
import { anneeDuTitre, joursOuverts, trouverPlat } from "@/components/site/outils";
import s from "@/components/site/sections.module.css";
import { JsonLd } from "@/components/ui/json-ld";
import { Logo } from "@/components/ui/logo";
import { FiletLosange, FlecheDroite } from "@/components/ui/motifs";
import { Visuel } from "@/components/ui/visuel";
import { siteConfig } from "@/config/site";
import { compterVue } from "@/lib/compter-vue";
import { chargerEmplacements } from "@/lib/emplacements";
import { horairesExceptionnelsAVenir } from "@/lib/horaires-exceptionnels";
import { formaterHeure } from "@/lib/horaires";
import { carteTraiteur, menusDeSaisonEnCours } from "@/lib/menus";
import { listerRealisationsPubliques, type RealisationPublique } from "@/lib/realisations";
import { coordonnees, lireHoraires } from "@/lib/reglages";
import { commerceJsonLd, construireMetadata, siteWebJsonLd } from "@/lib/seo";
import styles from "./accueil.module.css";

export async function generateMetadata() {
  // Carte de partage générée (/opengraph-image), meilleure pour l'accueil (docs/FONDATION.md section 14).
  return construireMetadata({ chemin: "/" });
}

/**
 * Six photos pour la mosaïque : une par catégorie à tour de rôle (variété).
 * Ordre pensé pour l'équilibre boucherie / traiteur : plateau de charcuterie
 * (grande tuile), boucherie, broche, mariage, puis cocktail et buffet.
 */
function choisirMosaique(toutes: RealisationPublique[], n = 6): RealisationPublique[] {
  const ordre = ["plateaux", "boucherie", "broche-barbecue", "mariage", "cocktail", "buffet"];
  const parCat = new Map<string, RealisationPublique[]>();
  for (const r of toutes) parCat.set(r.categorie, [...(parCat.get(r.categorie) ?? []), r]);
  const files = [...parCat.entries()].sort((a, b) => ordre.indexOf(a[0]) - ordre.indexOf(b[0])).map(([, liste]) => liste);
  const choix: RealisationPublique[] = [];
  for (let i = 0; choix.length < n && files.some((f) => f.length); i = (i + 1) % files.length) {
    const r = files[i].shift();
    if (r) choix.push(r);
  }
  return choix;
}

export default async function Accueil() {
  await compterVue("/");
  const img = chargerEmplacements([
    "accueil-hero-boucherie",
    "accueil-hero-traiteur",
    "accueil-savoir-faire",
    "accueil-maison",
    "boucherie-hero",
    "boucherie-viandes",
    "boucherie-charcuterie",
    "boucherie-volailles",
    "boucherie-fumoir",
    "traiteur-mariage",
    "traiteur-cocktail",
    "traiteur-broche",
    "fetes-hero",
  ] as const);
  const horaires = lireHoraires();
  const coord = coordonnees();
  const carte = carteTraiteur();
  const anneeCarte = anneeDuTitre(carte?.titre);
  const saison = menusDeSaisonEnCours()[0] ?? null;
  const mosaique = choisirMosaique(listerRealisationsPubliques());
  const nbJours = joursOuverts(horaires);

  // Les deux portes du premier écran (images qui se répondent en lumière et en palette).
  const portes = [
    { article: "La", nom: "boucherie", href: "/boucherie-roanne", image: img["accueil-hero-boucherie"] },
    { article: "Le", nom: "traiteur", href: "/traiteur-roanne", image: img["accueil-hero-traiteur"] },
  ];

  // Repères : deux pour la boucherie, deux pour le traiteur, faits réels uniquement
  // (horaires lus en base, délai et service à table de la carte imprimée).
  const dimanche = horaires.dimanche;
  const dimancheMatin = dimanche.length > 0 && dimanche[dimanche.length - 1].fermeture <= "13:00";
  const ouvertureBoucherie =
    horaires.lundi.length === 0 && nbJours === 6
      ? `Du mardi au dimanche${dimancheMatin ? `, ${dimanche.map((p) => `de ${formaterHeure(p.ouverture)} à ${formaterHeure(p.fermeture)}`).join(" et ")} le dimanche` : ""}.`
      : "Horaires détaillés en bas de page.";
  const reperes = [
    { metier: "Boucherie", valeur: nbJours === 6 ? "Six jours sur sept" : `${nbJours} jours sur sept`, texte: ouvertureBoucherie },
    { metier: "Boucherie", valeur: "Le conseil", texte: "Pièce, poids et cuisson : on vous oriente au comptoir." },
    { metier: "Traiteur", valeur: "Une semaine", texte: "Le délai conseillé pour commander le traiteur." },
    { metier: "Traiteur", valeur: "Service à table", texte: "En option pour vos réceptions, devis gratuit." },
  ];

  const rayons = [
    {
      titre: "Bœuf, veau, porc",
      texte: "Pièces à rôtir, à griller ou à mijoter, découpées devant vous, au poids demandé.",
      href: "/boucherie-roanne#viandes",
      lien: "Les viandes",
      image: img["boucherie-viandes"],
    },
    {
      titre: "La charcuterie",
      texte: "Jambon blanc, jambon cru, rosette, chorizo, terrine : à la tranche ou en plateau.",
      href: "/boucherie-roanne#charcuterie",
      lien: "La charcuterie",
      image: img["boucherie-charcuterie"],
    },
    {
      titre: "Les volailles",
      texte: "Les volailles du moment toute l’année, et les volailles de fête sur commande.",
      href: "/boucherie-roanne#volailles",
      lien: "Les volailles",
      image: img["boucherie-volailles"],
    },
    {
      titre: "La broche",
      texte: "Des jambons cuits lentement en rôtissoire : couenne dorée, chair moelleuse.",
      href: "/boucherie-roanne#broche",
      lien: "La broche",
      image: img["boucherie-fumoir"],
    },
  ];

  const prestations = [
    {
      titre: "Mariages",
      texte: "Vin d’honneur, buffet, repas assis et desserts : pièce montée, entremets, macarons.",
      href: "/traiteur-roanne/mariage",
      lien: "Traiteur mariage",
      image: img["traiteur-mariage"],
    },
    {
      titre: "Cocktails et buffets",
      texte: "Mini burgers, wraps, navettes, verrines, plateaux de charcuterie et de fromages, à la pièce ou à la personne.",
      href: "/traiteur-roanne/cocktail-dinatoire",
      lien: "Cocktail dînatoire et buffets",
      image: img["traiteur-cocktail"],
    },
    {
      titre: "Broche et barbecue",
      texte: "Jambons cuits à la broche et côtes de bœuf grillées sur place, devant vos invités.",
      href: "/traiteur-roanne/broche-barbecue",
      lien: "Jambon à la broche et barbecue",
      image: img["traiteur-broche"],
    },
  ];

  return (
    <>
      <JsonLd
        donnees={[
          commerceJsonLd({
            horaires,
            exceptionnels: horairesExceptionnelsAVenir(60),
            images: [img["accueil-hero-boucherie"], img["accueil-hero-traiteur"], img["accueil-savoir-faire"], img["accueil-maison"]],
            menusSaison: saison ? [saison] : [],
            carteEnLigne: !!carte,
          }),
          siteWebJsonLd(),
        ]}
      />

      {/* Premier écran plein cadre : diptyque bord à bord, deux portes égales.
          Le H1 est centré à cheval sur les deux photos (au-dessus en bureau, sur la
          jointure en mobile), visible dès le premier affichage (pas d'opacité nulle :
          il glisse seulement). Image LCP : la boucherie, en priorité haute ; le
          traiteur se charge aussitôt, sans priorité. */}
      <section className={styles.hero} aria-labelledby="titre-accueil">
        <div className={styles.titreBloc}>
          <Logo variante="monogramme" couleur="or" taille={64} className={`${styles.monogramme} ${styles.fondu}`} />
          <p className={`${styles.heroAdresse} ${styles.fondu}`}>
            {siteConfig.nom} · {siteConfig.adresse.rue}, {siteConfig.adresse.ville}
          </p>
          <h1 id="titre-accueil" className={`glisse-entree ${styles.titre}`}>
            <em>Boucherie</em>, charcuterie et <em>traiteur</em> à Roanne
          </h1>
          <FiletLosange className={`${styles.filet} ${styles.fondu}`} />
        </div>
        <div className={styles.portes}>
          {portes.map((p, i) => (
            <Link key={p.href} href={p.href} className={styles.porte}>
              <span className={`zoom-lent ${styles.porteVisuel}`}>
                <Visuel image={p.image} alt="" sizes="(min-width: 700px) 50vw, 100vw" priorite={i === 0} immediat largeurCible={960} />
              </span>
              <span className={`${styles.appel} ${styles.fondu}`}>
                <span>
                  {p.article} <em>{p.nom}</em>
                </span>
                <FlecheDroite />
              </span>
            </Link>
          ))}
        </div>
        <span className={`${styles.defiler} ${styles.fondu}`} aria-hidden="true" />
      </section>

      {/* Introduction */}
      <section className={`section-serree ${styles.intro}`}>
        <div className="contenu-etroit centre">
          <FiletLosange className="apparait" />
          <p className={`apparait ${styles.introTexte}`}>
            Maison Cherblanc est une boucherie, charcuterie et traiteur installée au 55 rue Mulsant, à Roanne. Au comptoir, vous trouvez viandes,
            volailles et charcuterie pour la semaine. En coulisses, la même équipe prépare plateaux, plats cuisinés, buffets et cocktails pour vos
            réceptions dans le Roannais. Deux métiers, une seule adresse, et une règle commune : bien choisir, bien préparer, bien servir.
          </p>
        </div>
      </section>

      {/* Repères : deux boucherie, deux traiteur */}
      <section className={`fond-sable ${styles.reperes}`} aria-label="Repères">
        <div className="contenu">
          <ul className={`sans-puces serie ${styles.reperesListe}`}>
            {reperes.map((r) => (
              <li key={r.valeur} className={`apparait ${styles.repere}`}>
                <p className={styles.repereMetier}>{r.metier}</p>
                <p className={styles.repereValeur}>{r.valeur}</p>
                <p className={styles.repereTexte}>{r.texte}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* La boucherie */}
      <section className="section fond-lin" aria-labelledby="la-boucherie">
        <div className="contenu">
          <div className={`${s.duo} ${styles.metierTete}`}>
            <div className={s.duoTexte}>
              <p className="surtitre apparait">La boucherie</p>
              <h2 id="la-boucherie" className="titre-l apparait">
                Au comptoir de la rue Mulsant
              </h2>
              <p className="apparait">
                Bœuf, veau, porc et volailles, découpés à la demande. Un rôti ficelé pour le dimanche, des côtes à griller, une volaille entière : dites-nous
                combien vous serez, nous vous conseillons la pièce, le poids et la cuisson.
              </p>
              <div className={`rangee apparait ${s.duoActions}`}>
                <Link href="/boucherie-roanne" className="bouton">
                  Découvrir la boucherie
                </Link>
                <Link href="/contact?type=commande-boucherie" className="bouton bouton-contour">
                  Commander à la boutique
                </Link>
              </div>
            </div>
            <div className={`apparait ${s.duoImage}`}>
              <CadrePhoto image={img["boucherie-hero"]} className="ratio-paysage" sizes="(min-width: 900px) min(560px, 42vw), calc(100vw - 2.5rem)" />
            </div>
          </div>
          <ul className={`sans-puces serie ${s.prestations} ${styles.rayons} ${styles.cartesMetier}`}>
            {rayons.map((r) => (
              <li key={r.href} className={`apparait ${s.prestation}`}>
                <Link href={r.href} tabIndex={-1} aria-hidden="true">
                  <CadrePhoto image={r.image} alt="" className="ratio-portrait cadre-zoom" sizes="(min-width: 1100px) 270px, (min-width: 560px) 45vw, calc(100vw - 2.5rem)" />
                </Link>
                <h3>{r.titre}</h3>
                <p>{r.texte}</p>
                <Link href={r.href} className={`lien-fleche ${s.prestationLien}`}>
                  {r.lien} <FlecheDroite />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Le traiteur */}
      <section className="section" aria-labelledby="le-traiteur">
        <div className="contenu">
          <div className={`${s.duo} ${s.duoInverse} ${styles.metierTete}`}>
            <div className={s.duoTexte}>
              <p className="surtitre apparait">Le traiteur</p>
              <h2 id="le-traiteur" className="titre-l apparait">
                Des grandes et des petites tablées
              </h2>
              <p className="apparait">
                Un plateau de charcuterie pour dix, une formule du chef pour cinquante, un cocktail dînatoire ou un repas de mariage : vous choisissez à la carte
                ou sur devis, vous récupérez en boutique, ou nous assurons le service à table.
              </p>
              <div className={`apparait ${styles.extrait}`}>
                <ListePrix
                  lignes={[
                    lignePlat(trouverPlat(carte, "Plateau de charcuterie")),
                    lignePlat(trouverPlat(carte, "La formule du chef")),
                    lignePlat(trouverPlat(carte, "Mini hamburger bœuf cheddar")),
                  ]}
                />
                {anneeCarte ? <p className={styles.extraitNote}>Prix de la carte traiteur {anneeCarte}.</p> : null}
              </div>
              <div className={`rangee apparait ${s.duoActions}`}>
                <Link href="/carte-traiteur" className="bouton">
                  Voir la carte et les prix
                </Link>
                <Link href="/traiteur-roanne" className="bouton bouton-contour">
                  Découvrir le traiteur
                </Link>
              </div>
            </div>
            <div className={`apparait ${s.duoImage}`}>
              <CadrePhoto image={img["accueil-savoir-faire"]} className="ratio-paysage" sizes="(min-width: 900px) min(560px, 42vw), calc(100vw - 2.5rem)" />
            </div>
          </div>
          <ul className={`sans-puces serie ${s.prestations} ${styles.cartesMetier}`}>
            {prestations.map((p) => (
              <li key={p.href} className={`apparait ${s.prestation}`}>
                <Link href={p.href} tabIndex={-1} aria-hidden="true">
                  <CadrePhoto image={p.image} alt="" className="ratio-portrait cadre-zoom" sizes="(min-width: 1100px) 370px, (min-width: 700px) 45vw, calc(100vw - 2.5rem)" />
                </Link>
                <h3>{p.titre}</h3>
                <p>{p.texte}</p>
                <Link href={p.href} className={`lien-fleche ${s.prestationLien}`}>
                  {p.lien} <FlecheDroite />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Fêtes */}
      <section className="section fond-olive grain" aria-labelledby="fetes">
        <div className={`contenu ${s.duo} ${s.duoInverse}`}>
          <div className={s.duoTexte}>
            {saison ? (
              <>
                <p className="surtitre apparait">Fêtes de fin d’année</p>
                <h2 id="fetes" className="titre-l apparait">
                  Noël et le jour de l’An se commandent en avance
                </h2>
                <p className="apparait">
                  Volailles fermières, foies gras, boudins blancs, plats cuisinés et menus de fêtes : la carte des fêtes est en ligne, avec les dates limites
                  de commande et les horaires d’ouverture exceptionnels. Pour les volailles, la commande est obligatoire.
                </p>
                <div className={`apparait ${s.duoActions}`}>
                  <Link href="/menus-de-fetes" className="bouton">
                    Menus de fêtes et dates de commande
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="surtitre apparait">Au fil de l’année</p>
                <h2 id="fetes" className="titre-l apparait">
                  Les menus de saison arrivent ici
                </h2>
                <p className="apparait">
                  Fêtes de fin d’année, Pâques, beaux jours : nos menus de saison sont publiés quelques semaines avant chaque période, avec leurs dates de
                  commande.
                </p>
                <div className={`apparait ${s.duoActions}`}>
                  <Link href="/carte-traiteur" className="bouton">
                    Voir la carte traiteur
                  </Link>
                </div>
              </>
            )}
          </div>
          <div className={`apparait ${s.duoImage} ${styles.archeFetes}`}>
            <CadrePhoto image={img["fetes-hero"]} alt="" className="cadre-arche ratio-portrait" sizes="(min-width: 900px) 420px, 80vw" />
          </div>
        </div>
      </section>

      {/* La maison */}
      <section className="section" aria-labelledby="la-maison">
        <div className={`contenu ${s.duo}`}>
          <div className={s.duoTexte}>
            <p className="surtitre apparait">La maison</p>
            <h2 id="la-maison" className="titre-l apparait">
              Une boutique de quartier, rue Mulsant
            </h2>
            <p className="apparait">
              Depuis l’été 2023, la boucherie du 55 rue Mulsant s’appelle Maison Cherblanc. Le comptoir est resté un comptoir de quartier : on y vient
              chercher sa viande de la semaine, on y demande un conseil de cuisson, on y passe commande pour le week-end. Derrière, la même équipe prépare le
              traiteur, du plateau pour un anniversaire au buffet d’une salle des fêtes.
            </p>
            <div className={`apparait ${s.duoActions}`}>
              <Link href="/la-maison" className="bouton bouton-contour">
                L’histoire de la maison
              </Link>
            </div>
          </div>
          <div className={`apparait ${s.duoImage}`}>
            <CadrePhoto image={img["accueil-maison"]} className="ratio-portrait" sizes="(min-width: 900px) 40vw, 92vw" />
          </div>
        </div>
      </section>

      {/* Réalisations */}
      {mosaique.length >= 3 ? (
        <section className="section fond-lin" aria-labelledby="realisations">
          <div className="contenu-large">
            <div className={styles.mosaiqueTete}>
              <div>
                <p className="surtitre apparait">En images</p>
                <h2 id="realisations" className="titre-l apparait">
                  Quelques réceptions récentes
                </h2>
              </div>
              <Link href="/realisations" className="lien-fleche apparait">
                Voir toutes les réalisations <FlecheDroite />
              </Link>
            </div>
            <ul className={`sans-puces serie ${styles.mosaique}`}>
              {mosaique.map((r) => (
                <li key={r.id} className="apparait">
                  <Link href={`/realisations?categorie=${r.categorie}`} className={`cadre cadre-zoom ${styles.tuile}`}>
                    <Visuel image={r.image} sizes="(min-width: 900px) 33vw, 46vw" />
                    <span className="invisible-accessible">{r.legende || r.image.alt}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <AvisClients />

      {/* Infos pratiques */}
      <section className="section" aria-labelledby="infos">
        <div className={`contenu ${styles.infos}`}>
          <div className={styles.infosTexte}>
            <p className="surtitre apparait">Infos pratiques</p>
            <h2 id="infos" className="titre-l apparait">
              Nous trouver à Roanne
            </h2>
            <div className={`apparait ${styles.infosBlocs}`}>
              <div>
                <h3 className={styles.infosTitre}>Adresse</h3>
                <address className={styles.adresse}>
                  {siteConfig.nom}
                  <br />
                  {siteConfig.adresse.rue}
                  <br />
                  {siteConfig.adresse.codePostal} {siteConfig.adresse.ville}
                </address>
              </div>
              <div>
                <h3 className={styles.infosTitre}>Téléphone</h3>
                <p className={styles.adresse}>
                  <a href={coord.telephone.href} className="lien-souligne">
                    {coord.telephone.affichage}
                  </a>{" "}
                  <span className="texte-doux">(boutique)</span>
                  <br />
                  <a href={coord.mobile.href} className="lien-souligne">
                    {coord.mobile.affichage}
                  </a>{" "}
                  <span className="texte-doux">(mobile)</span>
                </p>
              </div>
            </div>
            <div className={`rangee apparait ${s.duoActions}`}>
              <a href={siteConfig.itineraire} className="bouton" target="_blank" rel="noopener noreferrer">
                Itinéraire<span className="invisible-accessible"> (Google Maps, nouvel onglet)</span>
              </a>
              <Link href="/contact" className="bouton bouton-contour">
                Nous contacter
              </Link>
            </div>
          </div>
          <div className={`arche-contour apparait ${styles.horaires}`}>
            <h3 className={`titre-m ${styles.horairesTitre}`}>Horaires</h3>
            <p className={styles.horairesSous}>{nbJours === 6 ? "Six jours sur sept" : `${nbJours} jours sur sept`}</p>
            <TableauHoraires horaires={horaires} legende="Horaires d’ouverture de la boutique" />
          </div>
        </div>
      </section>

      <AppelFinal
        titre="Une réception en vue ?"
        texte="Dites-nous la date, le nombre de personnes et ce qui vous ferait plaisir. Nous vous répondons avec une proposition et un devis gratuit. Pour le traiteur, pensez à commander au moins une semaine avant."
        actions={
          <>
            <Link href="/contact?type=devis-traiteur" className="bouton">
              Demander un devis
            </Link>
            <a href={coord.telephone.href} className="bouton bouton-contour">
              Appeler la boutique
            </a>
          </>
        }
      />
    </>
  );
}
