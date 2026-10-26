import { siteConfig } from "@/config/site";
import { listerArticlesPublies } from "@/lib/articles";
import { formaterJourLong } from "@/lib/dates";
import { formaterPlage } from "@/lib/horaires";
import { horairesExceptionnelsAVenir } from "@/lib/horaires-exceptionnels";
import { menusDeSaisonEnCours } from "@/lib/menus";
import { coordonnees, lireHoraires } from "@/lib/reglages";
import { phraseHoraires, urlCanonique } from "@/lib/seo";

/**
 * /llms.txt : présentation factuelle du commerce pour les moteurs IA
 * (format llms.txt : titre, résumé, sections de liens). Généré à chaque
 * requête depuis la config et la base : horaires, fermetures, menus et
 * articles restent à jour sans intervention. Aucune donnée inventée.
 */
export const dynamic = "force-dynamic";

const LIENS: { chemin: string; libelle: string }[] = [
  { chemin: "/boucherie-roanne", libelle: "La boucherie" },
  { chemin: "/traiteur-roanne", libelle: "Le traiteur" },
  { chemin: "/traiteur-roanne/mariage", libelle: "Traiteur mariage" },
  { chemin: "/traiteur-roanne/cocktail-dinatoire", libelle: "Cocktail dînatoire et buffets" },
  { chemin: "/traiteur-roanne/broche-barbecue", libelle: "Jambon à la broche et barbecue" },
  { chemin: "/carte-traiteur", libelle: "Carte traiteur et tarifs" },
  { chemin: "/menus-de-fetes", libelle: "Menus de fêtes" },
  { chemin: "/realisations", libelle: "Réalisations en photos" },
  { chemin: "/la-maison", libelle: "La maison" },
  { chemin: "/contact", libelle: "Contact, horaires et devis" },
];

export async function GET() {
  const c = coordonnees();
  const a = siteConfig.adresse;
  const e = siteConfig.legal.editeur;
  const exceptionnels = horairesExceptionnelsAVenir(60);
  const saison = menusDeSaisonEnCours();
  const articles = listerArticlesPublies({ limite: 20 });

  const lignes: string[] = [
    `# ${siteConfig.nom}`,
    "",
    `> ${siteConfig.nom} est une boucherie, charcuterie et traiteur située au ${a.rue}, ${a.codePostal} ${a.ville} (${a.departement}, France). La boutique vend viandes de boucherie, volailles et charcuterie ; le service traiteur prépare plateaux, plats cuisinés, cocktails dînatoires, buffets, repas de mariage et animations jambon à la broche et barbecue.`,
    "",
    "## Informations pratiques",
    "",
    `- Adresse : ${a.rue}, ${a.codePostal} ${a.ville}, ${a.nomPays}`,
    `- Téléphone de la boutique : ${c.telephone.affichage}`,
    `- Téléphone mobile : ${c.mobile.affichage}`,
    `- E-mail : ${c.email}`,
    `- Horaires d’ouverture : ${phraseHoraires(lireHoraires())}`,
    `- Traiteur : ${siteConfig.traiteur.delaiCommande} ${siteConfig.traiteur.serviceATable} ${siteConfig.traiteur.devis}`,
    "- Prix repères (carte traiteur 2027) : plateau de charcuterie 6 € par personne, plateau de fromages 4,90 € par personne, plateau de légumes crus 4 € par personne, formule du chef 14 € par personne. Carte complète et prix à jour : page carte traiteur.",
    `- Itinéraire : ${siteConfig.itineraire}`,
  ];

  if (exceptionnels.length) {
    lignes.push("", "## Horaires exceptionnels à venir", "");
    for (const h of exceptionnels) {
      const detail = h.plages === null ? h.note || "ouvert" : h.plages.length === 0 ? "fermé" : `ouvert ${h.plages.map((p) => formaterPlage(p)).join(", ")}`;
      const note = h.plages !== null && h.note ? ` (${h.note})` : "";
      lignes.push(`- ${formaterJourLong(h.date)}${h.libelle ? `, ${h.libelle}` : ""} : ${detail}${note}`);
    }
  }

  if (saison.length) {
    lignes.push("", "## Menus de saison en cours", "");
    for (const m of saison) {
      const commande = m.infos_commande ? ` ${m.infos_commande.replace(/\s*\n\s*/g, " ")}` : "";
      lignes.push(`- [${m.titre}](${urlCanonique("/menus-de-fetes")}) :${commande || " menus, prix et dates de commande."}`);
    }
  }

  lignes.push("", "## Pages principales", "");
  for (const l of LIENS) {
    const d = siteConfig.seo.pages[l.chemin]?.description;
    lignes.push(`- [${l.libelle}](${urlCanonique(l.chemin)})${d ? ` : ${d}` : ""}`);
  }

  if (articles.length) {
    lignes.push("", "## Conseils et actualités", "");
    for (const art of articles) {
      const d = art.description_seo || art.chapo;
      lignes.push(`- [${art.titre}](${urlCanonique(`/actualites/${art.slug}`)})${d ? ` : ${d}` : ""}`);
    }
  }

  lignes.push(
    "",
    "## Entreprise",
    "",
    `- Raison sociale : ${e.denomination ?? siteConfig.nom}${e.formeJuridique ? `, ${e.formeJuridique}` : ""}`,
    ...(e.siren ? [`- SIREN : ${e.siren}`] : []),
    `- Gérants : ${e.gerants.join(" et ")}`,
    `- Facebook : ${siteConfig.reseaux.facebook}`,
    `- Instagram : ${siteConfig.reseaux.instagram}`,
    "",
    "## Optional",
    "",
    `- [Mentions légales](${urlCanonique("/mentions-legales")})`,
    `- [Plan du site (XML)](${urlCanonique("/sitemap.xml")})`,
    "",
  );

  return new Response(lignes.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
