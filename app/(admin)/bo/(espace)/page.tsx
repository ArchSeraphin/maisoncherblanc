import Link from "next/link";
import { NAVIGATION_ADMIN } from "@/components/admin/navigation";
import { compterArticles } from "@/lib/articles";
import { syntheseVues } from "@/lib/audience";
import { requireUser } from "@/lib/auth";
import { lienAdmin } from "@/lib/chemin-admin";
import { compterMessagesNonLus } from "@/lib/messages";
import { compterMenus } from "@/lib/menus";
import { annonceEnCours } from "@/lib/reglages";

export const metadata = { title: "Tableau de bord" };

/**
 * Tableau de bord SQUELETTE (lot fondation) : chiffres réels et raccourcis.
 * Mise en forme et graphique des visites : lot backoffice.
 */
export default async function TableauDeBord() {
  const u = await requireUser();
  const vues = syntheseVues(30);
  const nonLus = compterMessagesNonLus();
  const menus = compterMenus();
  const articles = compterArticles();
  const annonce = annonceEnCours();
  const raccourcis = [
    { href: "/menus", libelle: "Changer un prix" },
    { href: "/horaires", libelle: "Ajouter une fermeture" },
    { href: "/actualites", libelle: "Publier une actualité" },
  ];
  return (
    <div className="bo-pile-large">
      <header>
        <h1 className="bo-titre">Bonjour{u.name ? ` ${u.name}` : ""}</h1>
        <p className="bo-discret">Voici l’essentiel du site sur les 30 derniers jours.</p>
      </header>

      <section className="bo-grille-chiffres" aria-label="Chiffres clés">
        <div className="bo-carte bo-chiffre">
          <span className="bo-chiffre-valeur">{vues.total}</span>
          <span>pages vues en 30 jours</span>
          <span className="bo-discret">dont {vues.aujourdhui} aujourd’hui</span>
        </div>
        <Link href={lienAdmin("/messages")} className="bo-carte bo-chiffre">
          <span className="bo-chiffre-valeur">{nonLus}</span>
          <span>message{nonLus > 1 ? "s" : ""} non lu{nonLus > 1 ? "s" : ""}</span>
        </Link>
        <div className="bo-carte bo-chiffre">
          <span className="bo-chiffre-valeur">{menus.plats}</span>
          <span>plats dans {menus.menus} menu{menus.menus > 1 ? "s" : ""}</span>
        </div>
        <div className="bo-carte bo-chiffre">
          <span className="bo-chiffre-valeur">{articles.publies ?? 0}</span>
          <span>actualité{(articles.publies ?? 0) > 1 ? "s" : ""} publiée{(articles.publies ?? 0) > 1 ? "s" : ""}</span>
        </div>
      </section>

      <section aria-labelledby="raccourcis">
        <h2 id="raccourcis" className="bo-sous-titre">
          Raccourcis
        </h2>
        <div className="bo-rangee">
          {raccourcis.map((r) => (
            <Link key={r.href} href={lienAdmin(r.href)} className="bo-bouton bo-bouton-principal">
              {r.libelle}
            </Link>
          ))}
        </div>
        <p className="bo-discret">Bandeau d’annonce : {annonce ? `affiché (« ${annonce.texte} »)` : "aucun en ce moment"}.</p>
      </section>

      <section aria-labelledby="modules">
        <h2 id="modules" className="bo-sous-titre">
          Tous les modules
        </h2>
        <ul className="bo-grille-modules">
          {NAVIGATION_ADMIN.filter((m) => m.href).map((m) => (
            <li key={m.href}>
              <Link href={lienAdmin(m.href)} className="bo-carte bo-module">
                <strong>{m.libelle}</strong>
                <span className="bo-discret">{m.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {vues.pagesLesPlusVues.length ? (
        <section aria-labelledby="pages">
          <h2 id="pages" className="bo-sous-titre">
            Pages les plus vues
          </h2>
          <table className="bo-tableau">
            <thead>
              <tr>
                <th scope="col">Page</th>
                <th scope="col">Vues</th>
              </tr>
            </thead>
            <tbody>
              {vues.pagesLesPlusVues.map((p) => (
                <tr key={p.chemin}>
                  <td>{p.chemin}</td>
                  <td>{p.compte}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}
