/**
 * Menu de fêtes 2026 (source : seed-medias/menus/menu-fetes-2026.txt, prix
 * relus sur le PDF seed-medias/documents/menu-fetes-2026-maison-cherblanc.pdf).
 * Dans la description d'un menu, « # Entrée » / « # Plat » sont des
 * intertitres (lib/composition.ts).
 */

import type { EntreeHoraireExceptionnel } from "../../lib/horaires-exceptionnels";
import type { EntreeMenu, ImportSection } from "../../lib/menus";

export const MENU_FETES_2026: EntreeMenu = {
  slug: "menu-de-fetes-2026",
  type: "saison",
  titre: "Fêtes de fin d’année 2026",
  sous_titre: "Nos menus de fête",
  intro: "",
  note_bas: "La Maison Cherblanc vous remercie de votre confiance et vous présente ses meilleurs vœux pour 2027.",
  infos_commande:
    "Merci de passer vos commandes avant le dimanche 20 décembre pour Noël, et avant le jeudi 24 décembre pour le jour de l’An.\nLes jeudis 24 et 31 décembre, les commandes sont à récupérer avant 17h00.",
  valable_du: null,
  valable_au: null,
  publie_du: null,
  publie_au: "2027-01-05",
  visible: true,
};

const plats = (unite: string, liste: [string, string][]) => liste.map(([nom, prix]) => ({ nom, prix, unite }));

export const SECTIONS_FETES_2026: ImportSection[] = [
  {
    titre: "Nos menus de fête",
    note: "",
    mise_en_avant: true,
    plats: [
      {
        nom: "Menu Gourmandise",
        prix: "35",
        unite: "",
        description: [
          "# Entrée",
          "Foie gras et son confit d’oignon, pain d’épices",
          "Verrine de crème de châtaigne, crumble aux pommes",
          "Cassolette de la mer",
          "# Plat",
          "Ballotine de canette confite, châtaignes et sauce morilles",
          "Écrasé de pommes de terre au sel de Guérande",
          "Poêlée de légumes d’hiver glacés au miel et épices douces",
        ].join("\n"),
      },
      {
        nom: "Menu Plaisir",
        prix: "29",
        unite: "",
        description: [
          "# Entrée",
          "Saumon fumé",
          "Brioche aux escargots",
          "# Plat",
          "Civet de chevreuil, sauce chasseur",
          "Gratin dauphinois",
          "Marrons et champignons persillés",
        ].join("\n"),
      },
    ],
  },
  {
    titre: "Entrées froides",
    plats: [
      { nom: "Galantine de chapon aux pistaches", prix: "3,50", unite: "les 100 g" },
      { nom: "Galantine de pintade forestière", prix: "3,50", unite: "les 100 g" },
      { nom: "Terrine de la mer", prix: "4,50", unite: "la part" },
      { nom: "Terrine de sanglier", prix: "4,00", unite: "la part" },
      { nom: "Saumon fumé", prix: "7,50", unite: "les 100 g" },
      { nom: "Foie gras de canard mi-cuit, confit d’oignon et pain d’épices", prix: "9,50", unite: "la part" },
      { nom: "Foie gras de canard (à la coupe)", prix: "12,00", unite: "les 100 g" },
    ],
  },
  {
    titre: "Entrées chaudes",
    plats: [
      { nom: "Coquille Saint-Jacques et ses fruits de mer", prix: "7,90", unite: "pièce" },
      { nom: "Cassolette de la mer", prix: "7,90", unite: "pièce" },
      { nom: "Brioche aux escargots", prix: "7,50", unite: "pièce" },
      { nom: "Escargots (la douzaine)", prix: "7,50", unite: "la part" },
      { nom: "Vol-au-vent au ris de veau", prix: "7,10", unite: "la part" },
      { nom: "Boudin blanc au porto", prix: "24,99", unite: "le kg" },
      { nom: "Boudin blanc au foie gras", prix: "32,99", unite: "le kg" },
      { nom: "Boudin blanc aux morilles", prix: "27,99", unite: "le kg" },
    ],
  },
  {
    titre: "Plats cuisinés",
    plats: plats("la part", [
      ["Ballotine de canette aux châtaignes, sauce morilles", "8,90"],
      ["Ballotine de chapon farcie aux châtaignes", "8,90"],
      ["Délice de dinde, sauce morilles", "5,40"],
      ["Délice de canard, sauce au poivre", "5,90"],
      ["Cuisse de canard, sauce morilles", "8,50"],
      ["Paupiette de saumon au beurre citronné", "7,90"],
      ["Chevreuil, sauce chasseur", "8,50"],
      ["Gratin de fruits de mer", "6,50"],
      ["Quenelle de brochet, sauce homardine", "4,90"],
    ]),
  },
  {
    titre: "Accompagnements",
    plats: [
      ...plats("la part", [
        ["Gratin dauphinois", "3,90"],
        ["Gratin dauphinois truffé", "4,10"],
        ["Gratin dauphinois sauce morilles", "4,10"],
        ["Purée de butternut et noisettes", "3,80"],
        ["Marrons et champignons persillés", "3,80"],
        ["Poêlée de légumes d’hiver glacés au miel et épices douces", "3,90"],
        ["Gratin de cardons, sauce morilles", "4,10"],
        ["Écrasé de pommes de terre au sel de Guérande", "3,90"],
      ]),
      { nom: "Pommes dauphine", prix: "23,99", unite: "le kg" },
    ],
  },
  {
    titre: "Volailles",
    note: "Uniquement sur commande avant le 20 décembre",
    plats: [
      { nom: "Dinde fermière", prix: "19,99", unite: "le kg" },
      { nom: "Poularde fermière", prix: "19,99", unite: "le kg" },
      { nom: "Chapon fermier", prix: "19,99", unite: "le kg" },
      { nom: "Poulet de Bresse", prix: "26,99", unite: "le kg" },
      { nom: "Pintade fermière", prix: "15,99", unite: "le kg" },
      { nom: "Caille", prix: "4,90", unite: "pièce" },
      { nom: "Canard ou canette", prix: "18,99", unite: "le kg" },
    ],
  },
  {
    titre: "Petit dînatoire de Noël",
    plats: [
      { nom: "Mini hamburger foie gras, oignon confit", prix: "3", unite: "pièce" },
      { nom: "Mini hamburger bœuf cheddar", prix: "2", unite: "pièce" },
      { nom: "Mini hot-dog", prix: "2", unite: "pièce" },
      { nom: "Navette saumon fumé", prix: "3", unite: "pièce" },
      { nom: "Trio de verrines de Noël", prix: "9", unite: "les trois" },
      { nom: "Cuillère de saumon au tartare", prix: "3", unite: "pièce" },
    ],
  },
];

const REOUVERTURE = "Réouverture le mardi 5 janvier 2027.";
const RECUPERATION = "Les commandes sont à récupérer avant 17h00.";

/**
 * Horaires exceptionnels des fêtes 2026 (page 1 du PDF). Les 2, 3 et 4 janvier
 * sont déduits de « Réouverture le mardi 5 janvier 2027 » (le 4 est un lundi,
 * fermé d'ordinaire). Les 24 et 31 décembre : horaires non précisés sur le
 * document, seulement l'heure limite de retrait (plages `null` + note).
 */
export const HORAIRES_FETES_2026: EntreeHoraireExceptionnel[] = [
  { date: "2026-12-20", libelle: "Magasin ouvert", plages: [{ ouverture: "08:00", fermeture: "12:00" }], note: "" },
  { date: "2026-12-21", libelle: "Magasin ouvert (ouverture exceptionnelle)", plages: [{ ouverture: "08:00", fermeture: "12:00" }], note: "" },
  { date: "2026-12-24", libelle: "Veille de Noël", plages: null, note: RECUPERATION },
  { date: "2026-12-25", libelle: "Noël", plages: [], note: "" },
  { date: "2026-12-27", libelle: "Magasin ouvert", plages: [{ ouverture: "08:00", fermeture: "12:00" }], note: "" },
  { date: "2026-12-31", libelle: "Saint-Sylvestre", plages: null, note: RECUPERATION },
  { date: "2027-01-01", libelle: "Jour de l’An", plages: [], note: REOUVERTURE },
  { date: "2027-01-02", libelle: "Fermé", plages: [], note: REOUVERTURE },
  { date: "2027-01-03", libelle: "Fermé", plages: [], note: REOUVERTURE },
  { date: "2027-01-04", libelle: "Fermé", plages: [], note: REOUVERTURE },
];

/** Annonce de démonstration (bandeau), active jusqu'au 20 décembre 2026. */
export const ANNONCE_FETES_2026 = {
  active: true,
  texte: "Commandes de fêtes : jusqu’au dimanche 20 décembre pour Noël",
  lien: "/menus-de-fetes",
  debut: null,
  fin: "2026-12-20",
};
