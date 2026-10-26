/**
 * État lisible d'un menu pour le backoffice (module PUR : client et serveur).
 * Règles du site : la carte traiteur = le menu permanent `carte-traiteur` visible ;
 * un menu de saison est affiché sur /menus-de-fetes s'il est visible et que sa
 * période de publication couvre aujourd'hui.
 */

import { dansFenetre, formaterJourCourt, formaterJourLong } from "@/lib/dates";

/** = SLUG_CARTE_TRAITEUR de lib/menus.ts (module serveur, non importable côté client). */
export const SLUG_CARTE = "carte-traiteur";

type MenuEtat = { slug: string; type: "permanent" | "saison"; visible: boolean; publie_du: string | null; publie_au: string | null };

export type EtatMenu = { libelle: string; detail?: string; genre: "succes" | "attention" | "discret" | "neutre"; enLigne: boolean };

export function etatMenu(m: MenuEtat, jour: string): EtatMenu {
  if (m.type === "permanent") {
    if (m.slug !== SLUG_CARTE) return { libelle: "En préparation", detail: "Pas encore la carte du site", genre: "neutre", enLigne: false };
    return m.visible
      ? { libelle: "En ligne", detail: "C’est la carte du site", genre: "succes", enLigne: true }
      : {
          libelle: "Masquée",
          detail: "N’apparaît plus sur le site : la page Carte traiteur annonce une carte en cours de mise à jour",
          genre: "attention",
          enLigne: false,
        };
  }
  if (!m.visible) return { libelle: "Masqué", detail: "Non affiché sur le site", genre: "discret", enLigne: false };
  if (m.publie_du && jour < m.publie_du)
    return { libelle: "Programmé", detail: `En ligne à partir du ${formaterJourLong(m.publie_du)}`, genre: "neutre", enLigne: false };
  if (m.publie_au && jour > m.publie_au)
    return { libelle: "Terminé", detail: `Plus affiché depuis le ${formaterJourCourt(m.publie_au)}`, genre: "discret", enLigne: false };
  if (dansFenetre(jour, m.publie_du, m.publie_au))
    return {
      libelle: "En ligne",
      detail: m.publie_au ? `Jusqu’au ${formaterJourLong(m.publie_au)}` : "Sans date de fin",
      genre: "succes",
      enLigne: true,
    };
  return { libelle: "Masqué", genre: "discret", enLigne: false };
}

/** Avertissement affiché dans le BO quand la carte traiteur n'est plus visible sur le site. */
export const ALERTE_CARTE_MASQUEE =
  "La carte traiteur est masquée : elle n’apparaît plus sur le site. La page Carte traiteur indique seulement aux visiteurs que la carte est en cours de mise à jour.";

/** Page publique qui affiche ce type de menu. */
export function cheminPublicMenu(m: { type: "permanent" | "saison"; slug: string }): string | null {
  if (m.type === "saison") return "/menus-de-fetes";
  return m.slug === SLUG_CARTE ? "/carte-traiteur" : null;
}

export const LIBELLES_TYPE_MENU = { permanent: "Carte permanente", saison: "Menu de saison" } as const;

/** Titre proposé pour une copie : l'année est avancée d'un an (« 2027 » devient « 2028 »). */
export function titreCopie(titre: string): string {
  const avance = titre.replace(/\b(20\d{2})\b/g, (a) => String(Number(a) + 1));
  return avance !== titre ? avance : `${titre} (copie)`;
}
