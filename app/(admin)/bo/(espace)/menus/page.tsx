import Link from "next/link";
import { Etiquette } from "@/components/admin/champs";
import { Icone } from "@/components/admin/icones";
import { DupliquerMenu } from "@/components/admin/menus/dupliquer-menu";
import { ALERTE_CARTE_MASQUEE, cheminPublicMenu, etatMenu, LIBELLES_TYPE_MENU, SLUG_CARTE } from "@/components/admin/menus/etat-menu";
import { NouveauMenu } from "@/components/admin/menus/nouveau-menu";
import { RecherchePlat, type PlatRecherche } from "@/components/admin/menus/recherche-plat";
import { EntetePage, VoirSurLeSite } from "@/components/admin/mise-en-page";
import { requireUser } from "@/lib/auth";
import { lienAdmin } from "@/lib/chemin-admin";
import { formaterJourLong, jourParis } from "@/lib/dates";
import { listerMenus, menuComplet, type MenuComplet } from "@/lib/menus";

export const metadata = { title: "Carte & menus" };

export default async function PageMenus({ searchParams }: PageProps<"/bo/menus">) {
  await requireUser();
  const { chercher } = await searchParams;
  const jour = jourParis();
  const menus = listerMenus()
    .map((m) => menuComplet(m))
    .filter((m): m is MenuComplet => !!m);
  const plats: PlatRecherche[] = menus.flatMap((m) =>
    m.sections.flatMap((s) =>
      s.plats.map((p) => ({
        menuId: m.id,
        menuTitre: m.titre,
        sectionTitre: s.titre,
        platId: p.id,
        nom: p.nom,
        prix: p.prix,
        unite: p.unite,
        visible: p.visible && s.visible,
      })),
    ),
  );

  return (
    <div className="bo-pile-large">
      <EntetePage
        titre="Carte & menus"
        introduction="La carte traiteur et les menus de saison du site : plats, prix, PDF à télécharger. Un changement est visible sur le site tout de suite."
      />

      {menus.some((m) => m.slug === SLUG_CARTE && !m.visible) ? (
        <p className="bo-alerte" role="status">
          {ALERTE_CARTE_MASQUEE} Ouvrez-la puis cliquez sur « Afficher sur le site » pour la remettre en ligne.
        </p>
      ) : null}

      <RecherchePlat plats={plats} focusAuChargement={chercher !== undefined} />

      <section className="bo-section" aria-labelledby="titre-liste-menus">
        <h2 id="titre-liste-menus" className="bo-sous-titre">
          Vos menus
        </h2>
        <ul className="bo-menus" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {menus.map((m) => {
            const e = etatMenu(m, jour);
            const chemin = cheminPublicMenu(m);
            const nbPlats = m.sections.reduce((n, s) => n + s.plats.length, 0);
            return (
              <li key={m.id} className="bo-carte bo-menu-carte">
                <div className="bo-pile" style={{ gap: "0.45rem" }}>
                  <h3>
                    <Link href={lienAdmin(`/menus/${m.id}`)}>{m.titre}</Link>
                  </h3>
                  <div className="bo-menu-infos">
                    <Etiquette genre={e.genre}>{e.libelle}</Etiquette>
                    <span className="bo-discret">{LIBELLES_TYPE_MENU[m.type]}</span>
                  </div>
                  <p className="bo-discret">
                    {e.detail ? `${e.detail}. ` : ""}
                    {m.sections.length} section{m.sections.length > 1 ? "s" : ""}, {nbPlats} plat{nbPlats > 1 ? "s" : ""}
                    {m.pdf ? ", PDF joint" : ", pas de PDF"}.
                    {m.type === "permanent" && m.valable_du && m.valable_au
                      ? ` Valable du ${formaterJourLong(m.valable_du)} au ${formaterJourLong(m.valable_au)}.`
                      : ""}
                  </p>
                </div>
                <div className="bo-actions-formulaire">
                  <Link href={lienAdmin(`/menus/${m.id}`)} className="bo-bouton bo-bouton-principal">
                    <Icone nom="crayon" taille={18} />
                    Plats et prix
                  </Link>
                  <DupliquerMenu menuId={m.id} titre={m.titre} />
                  {e.enLigne && chemin ? <VoirSurLeSite chemin={chemin} libelle="Voir" /> : null}
                </div>
              </li>
            );
          })}
        </ul>
        <NouveauMenu />
      </section>
    </div>
  );
}
