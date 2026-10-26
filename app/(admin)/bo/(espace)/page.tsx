import Link from "next/link";
import { Etiquette } from "@/components/admin/champs";
import { Icone, type NomIconeAdmin } from "@/components/admin/icones";
import { cheminPublicMenu, etatMenu, LIBELLES_TYPE_MENU } from "@/components/admin/menus/etat-menu";
import { CourbeVues } from "@/components/admin/tableau-de-bord/courbe-vues";
import { syntheseVues } from "@/lib/audience";
import { requireUser } from "@/lib/auth";
import { lienAdmin } from "@/lib/chemin-admin";
import { formaterHorodatage, formaterJourLong, jourParis } from "@/lib/dates";
import { chargerEmplacements, EMPLACEMENTS } from "@/lib/emplacements";
import { horairesExceptionnelsAVenir } from "@/lib/horaires-exceptionnels";
import { formaterJour } from "@/lib/horaires";
import { listerMenus } from "@/lib/menus";
import { compterMessagesNonLus, LIBELLES_TYPES_MESSAGE, listerMessages } from "@/lib/messages";
import { annonceEnCours, lireAnnonce } from "@/lib/reglages";

export const metadata = { title: "Tableau de bord" };

const RACCOURCIS: { href: string; libelle: string; icone: NomIconeAdmin }[] = [
  { href: "/menus?chercher=1", libelle: "Changer un prix", icone: "prix" },
  { href: "/horaires#ajouter", libelle: "Ajouter une fermeture", icone: "calendrier" },
  { href: "/actualites/nouvelle", libelle: "Publier une actualité", icone: "journal" },
  { href: "/annonce", libelle: "Modifier le bandeau", icone: "annonce" },
];

/** Tableau de bord : l'essentiel en un coup d'œil et les gestes les plus fréquents. */
export default async function TableauDeBord() {
  const u = await requireUser();
  const jour = jourParis();
  const vues = syntheseVues(30);
  const nonLus = compterMessagesNonLus();
  const derniers = listerMessages({ nonLusSeulement: true, limite: 3 });
  const menus = listerMenus();
  const annonce = lireAnnonce();
  const annonceAffichee = annonceEnCours(jour);
  const exceptionnels = horairesExceptionnelsAVenir(30, jour);
  const photos = chargerEmplacements(EMPLACEMENTS.map((e) => e.cle));
  const aRemplacer = Object.values(photos).filter((p) => p?.provisoire).length;
  const vides = Object.values(photos).filter((p) => !p).length;
  const prenom = u.name.split(" ")[0];

  return (
    <div className="bo-pile-large">
      <header className="bo-entete">
        <h1 className="bo-titre">Bonjour{prenom ? ` ${prenom}` : ""}</h1>
        <p className="bo-introduction">Que voulez-vous faire aujourd’hui ?</p>
      </header>

      <nav aria-label="Raccourcis" className="bo-raccourcis">
        {RACCOURCIS.map((r) => (
          <Link key={r.href} href={lienAdmin(r.href)} className="bo-raccourci">
            <span className="bo-raccourci-icone">
              <Icone nom={r.icone} taille={22} />
            </span>
            {r.libelle}
          </Link>
        ))}
      </nav>

      <div className="bo-tdb-grille">
        <section className="bo-carte bo-pile" aria-labelledby="titre-visites">
          <div className="bo-section-entete">
            <h2 id="titre-visites" className="bo-sous-titre">
              Visites du site
            </h2>
            <span className="bo-discret">30 derniers jours</span>
          </div>
          <div className="bo-chiffre-ligne">
            <span className="bo-chiffre-valeur">{vues.total.toLocaleString("fr-FR")}</span>
            <span>pages vues, dont {vues.aujourdhui} aujourd’hui</span>
          </div>
          <CourbeVues parJour={vues.parJour} />
          {vues.pagesLesPlusVues.length ? (
            <details className="bo-replie">
              <summary>Pages les plus vues</summary>
              <div className="bo-replie-corps">
                <ul className="bo-liste-simple">
                  {vues.pagesLesPlusVues.map((p) => (
                    <li key={p.chemin}>
                      <span>{p.chemin === "/" ? "Accueil" : p.chemin}</span>
                      <strong>{p.compte}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ) : null}
        </section>

        <section className="bo-carte bo-pile" aria-labelledby="titre-messages">
          <div className="bo-section-entete">
            <h2 id="titre-messages" className="bo-sous-titre">
              Messages
            </h2>
            <Link href={lienAdmin("/messages")} className="bo-lien">
              Tous les messages
            </Link>
          </div>
          <div className="bo-chiffre-ligne">
            <span className="bo-chiffre-valeur">{nonLus}</span>
            <span>
              message{nonLus > 1 ? "s" : ""} non lu{nonLus > 1 ? "s" : ""}
            </span>
          </div>
          {derniers.length ? (
            <ul className="bo-liste-simple">
              {derniers.map((m) => (
                <li key={m.id}>
                  <Link href={lienAdmin(`/messages/${m.id}`)} className="bo-lien">
                    {m.prenom} {m.nom}
                  </Link>
                  <span className="bo-discret">
                    {LIBELLES_TYPES_MESSAGE[m.type]}, {formaterHorodatage(m.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="bo-discret">Aucun message en attente de lecture.</p>
          )}
        </section>
      </div>

      <section className="bo-section" aria-labelledby="titre-menus">
        <div className="bo-section-entete">
          <h2 id="titre-menus" className="bo-sous-titre">
            Carte et menus de saison
          </h2>
          <Link href={lienAdmin("/menus")} className="bo-lien">
            Gérer les menus
          </Link>
        </div>
        <ul className="bo-liste-simple bo-carte">
          {menus.map((m) => {
            const e = etatMenu(m, jour);
            const chemin = cheminPublicMenu(m);
            return (
              <li key={m.id}>
                <span className="bo-pile" style={{ gap: "0.15rem" }}>
                  <Link href={lienAdmin(`/menus/${m.id}`)} className="bo-lien">
                    <strong>{m.titre}</strong>
                  </Link>
                  <span className="bo-discret">
                    {LIBELLES_TYPE_MENU[m.type]}
                    {e.detail ? `, ${e.detail.charAt(0).toLowerCase()}${e.detail.slice(1)}` : ""}
                  </span>
                </span>
                <span className="bo-menu-infos">
                  <Etiquette genre={e.genre}>{e.libelle}</Etiquette>
                  {e.enLigne && chemin ? (
                    <a href={chemin} target="_blank" rel="noreferrer" className="bo-lien bo-lien-externe">
                      Voir <Icone nom="externe" taille={16} />
                      <span className="bo-invisible"> {m.titre} sur le site (nouvel onglet)</span>
                    </a>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="bo-tdb-grille">
        <section className="bo-carte bo-pile" aria-labelledby="titre-horaires">
          <div className="bo-section-entete">
            <h2 id="titre-horaires" className="bo-sous-titre">
              Horaires exceptionnels à venir
            </h2>
            <Link href={lienAdmin("/horaires")} className="bo-lien">
              Horaires
            </Link>
          </div>
          {exceptionnels.length ? (
            <ul className="bo-liste-simple">
              {exceptionnels.slice(0, 5).map((h) => (
                <li key={h.id}>
                  <span>
                    <strong>{formaterJourLong(h.date)}</strong>
                    {h.libelle ? ` (${h.libelle})` : ""}
                  </span>
                  <span className="bo-discret">{h.ferme ? "Fermé" : h.plages ? formaterJour(h.plages) : h.note}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="bo-discret">Aucune fermeture ni ouverture exceptionnelle dans les 30 prochains jours.</p>
          )}
        </section>

        <section className="bo-carte bo-pile" aria-labelledby="titre-site">
          <h2 id="titre-site" className="bo-sous-titre">
            Sur le site
          </h2>
          <ul className="bo-liste-simple">
            <li>
              <span>
                Bandeau d’annonce
                <span className="bo-discret" style={{ display: "block" }}>
                  {annonceAffichee ? `« ${annonceAffichee.texte} »` : annonce.active ? "Activé, mais hors de ses dates" : "Désactivé"}
                </span>
              </span>
              <Link href={lienAdmin("/annonce")} className="bo-lien">
                Modifier
              </Link>
            </li>
            <li>
              <span>
                Photos des pages
                <span className="bo-discret" style={{ display: "block" }}>
                  {aRemplacer
                    ? `${aRemplacer} visuel${aRemplacer > 1 ? "s" : ""} provisoire${aRemplacer > 1 ? "s" : ""} à remplacer`
                    : "Toutes définitives"}
                  {vides ? `, ${vides} emplacement${vides > 1 ? "s" : ""} sans photo` : ""}
                </span>
              </span>
              <Link href={lienAdmin("/photos")} className="bo-lien">
                Voir
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
