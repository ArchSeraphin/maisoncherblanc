import Link from "next/link";
import { Etiquette } from "@/components/admin/champs";
import { BasculerMenuVisible, MettreEnLigneCommeCarte, SupprimerMenu } from "@/components/admin/menus/actions-menu";
import { DupliquerMenu } from "@/components/admin/menus/dupliquer-menu";
import { EditeurSections } from "@/components/admin/menus/editeur-sections";
import { cheminPublicMenu, etatMenu, LIBELLES_TYPE_MENU, SLUG_CARTE } from "@/components/admin/menus/etat-menu";
import { FichiersMenu } from "@/components/admin/menus/fichiers-menu";
import { InfosMenu } from "@/components/admin/menus/infos-menu";
import { EntetePage, VoirSurLeSite } from "@/components/admin/mise-en-page";
import { requireUser } from "@/lib/auth";
import { lienAdmin } from "@/lib/chemin-admin";
import { jourParis } from "@/lib/dates";
import { listerImagesPretes } from "@/lib/media";
import { reprendreTraitements } from "@/lib/media-pipeline";
import { BADGES, lireMenuParSlug, menuComplet, SLUG_CARTE_TRAITEUR, UNITES_SUGGEREES } from "@/lib/menus";

export async function generateMetadata({ params }: PageProps<"/bo/menus/[id]">) {
  const { id } = await params;
  const m = /^\d+$/.test(id) ? menuComplet(Number(id)) : null;
  return { title: m ? m.titre : "Menu" };
}

export default async function PageMenu({ params, searchParams }: PageProps<"/bo/menus/[id]">) {
  await requireUser();
  reprendreTraitements();
  const { id } = await params;
  const { plat } = await searchParams;
  const m = /^\d{1,12}$/.test(id) ? menuComplet(Number(id)) : null;
  if (!m) {
    return (
      <div className="bo-pile">
        <h1 className="bo-titre">Menu introuvable</h1>
        <p className="bo-discret">Ce menu n’existe plus (il a peut-être été supprimé).</p>
        <p>
          <Link href={lienAdmin("/menus")} className="bo-bouton bo-bouton-principal">
            Retour à la liste des menus
          </Link>
        </p>
      </div>
    );
  }
  const jour = jourParis();
  const e = etatMenu(m, jour);
  const chemin = cheminPublicMenu(m);
  const estCarte = m.slug === SLUG_CARTE_TRAITEUR;
  const carteActuelle = m.type === "permanent" && !estCarte ? lireMenuParSlug(SLUG_CARTE_TRAITEUR) : null;
  const mediatheque = listerImagesPretes();
  const ciblePlatId = typeof plat === "string" && /^\d+$/.test(plat) ? Number(plat) : undefined;
  const nbPlats = m.sections.reduce((n, s) => n + s.plats.length, 0);

  return (
    <div className="bo-pile-large">
      <EntetePage
        retour={{ href: lienAdmin("/menus"), libelle: "Carte & menus" }}
        titre={m.titre}
        etiquettes={
          <>
            <Etiquette genre={e.genre}>{e.libelle}</Etiquette>
            <span className="bo-discret">
              {LIBELLES_TYPE_MENU[m.type]}
              {e.detail ? `, ${e.detail.charAt(0).toLowerCase()}${e.detail.slice(1)}` : ""}
            </span>
          </>
        }
        actions={
          <>
            {e.enLigne && chemin ? <VoirSurLeSite chemin={chemin} /> : null}
            {m.type === "permanent" && !estCarte ? (
              <MettreEnLigneCommeCarte menuId={m.id} titre={m.titre} titreActuel={carteActuelle?.titre ?? null} />
            ) : (
              <BasculerMenuVisible menuId={m.id} visible={m.visible} />
            )}
            <DupliquerMenu menuId={m.id} titre={m.titre} />
          </>
        }
      />

      {m.type === "saison" && !m.visible ? (
        <p className="bo-alerte">
          Ce menu est masqué : relisez les plats et les prix, réglez ses dates d’affichage dans « Informations du menu », puis cliquez sur « Afficher
          sur le site ».
        </p>
      ) : null}
      {m.type === "permanent" && !estCarte ? (
        <p className="bo-alerte">
          Cette carte est en préparation : le site affiche toujours « {carteActuelle?.titre ?? "la carte actuelle"} ». Quand elle est prête, cliquez
          sur « Mettre en ligne comme carte traiteur ».
        </p>
      ) : null}

      <section className="bo-section" aria-labelledby="titre-plats">
        <div className="bo-section-entete">
          <h2 id="titre-plats" className="bo-sous-titre">
            Plats et prix
          </h2>
          <span className="bo-discret">
            {m.sections.length} section{m.sections.length > 1 ? "s" : ""}, {nbPlats} plat{nbPlats > 1 ? "s" : ""}
          </span>
        </div>
        <EditeurSections
          menuId={m.id}
          sections={m.sections.map((s) => ({
            id: s.id,
            titre: s.titre,
            note: s.note,
            mise_en_avant: s.mise_en_avant,
            visible: s.visible,
            plats: s.plats.map((p) => ({
              id: p.id,
              section_id: p.section_id,
              nom: p.nom,
              description: p.description,
              prix: p.prix,
              unite: p.unite,
              badge: p.badge,
              visible: p.visible,
            })),
          }))}
          unites={UNITES_SUGGEREES}
          badges={BADGES}
          ciblePlatId={ciblePlatId}
        />
      </section>

      <details className="bo-replie" id="informations">
        <summary>Informations du menu : titre, dates, textes</summary>
        <div className="bo-replie-corps">
          <InfosMenu
            menu={{
              id: m.id,
              type: m.type,
              titre: m.titre,
              sous_titre: m.sous_titre,
              intro: m.intro,
              note_bas: m.note_bas,
              infos_commande: m.infos_commande,
              valable_du: m.valable_du,
              valable_au: m.valable_au,
              publie_du: m.publie_du,
              publie_au: m.publie_au,
              visible: m.visible,
              estCarte: m.slug === SLUG_CARTE,
            }}
          />
        </div>
      </details>

      <details className="bo-replie">
        <summary>PDF à télécharger et photo de couverture</summary>
        <div className="bo-replie-corps">
          <FichiersMenu menuId={m.id} pdf={m.pdf} couverture={m.couverture} mediatheque={mediatheque} />
        </div>
      </details>

      <details className="bo-replie bo-zone-danger">
        <summary>Supprimer ce menu</summary>
        <div className="bo-replie-corps">
          <SupprimerMenu menuId={m.id} titre={m.titre} protege={estCarte} />
        </div>
      </details>
    </div>
  );
}
