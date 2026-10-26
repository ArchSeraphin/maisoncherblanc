/**
 * Carte traiteur 2027 (source : seed-medias/menus/carte-traiteur-2027.txt,
 * prix relus sur INT.jpg et EXT.jpg). Prix normalisés à l'import
 * (« 3,20 » -> « 3,20 € », « 30,00 » -> « 30 € »).
 * Unité de chaque plat = en-tête de sa colonne sur la carte imprimée.
 */

import type { EntreeMenu, ImportSection } from "../../lib/menus";

export const MENU_CARTE_2027: EntreeMenu = {
  slug: "carte-traiteur",
  type: "permanent",
  titre: "Carte traiteur 2027",
  sous_titre: "Formules · Plats cuisinés · Petit dînatoire",
  intro: "",
  note_bas: "Plein d’autres options sont disponibles, n’hésitez pas à nous contacter pour un devis gratuit.",
  infos_commande: "Merci de passer commande une semaine avant.\nOption service à table disponible.",
  valable_du: "2027-01-01",
  valable_au: "2027-12-31",
  publie_du: null,
  publie_au: null,
  visible: true,
};

const plats = (unite: string, liste: [string, string][]) => liste.map(([nom, prix]) => ({ nom, prix, unite }));

export const SECTIONS_CARTE_2027: ImportSection[] = [
  {
    titre: "Nos formules",
    note: "Plateaux & formules",
    mise_en_avant: true,
    plats: [
      {
        nom: "Plateau de charcuterie",
        prix: "6",
        unite: "par pers.",
        description: "½ tranche de jambon blanc\n1 tranche de jambon cru\n3 tranches de rosette\n½ tranche de terrine\n2 tranches de chorizo",
      },
      { nom: "Plateau de légumes crus", prix: "4", unite: "par pers.", description: "Carotte\nChou-fleur\nTomate\nBrocolis\nSauce au choix" },
      { nom: "Plateau de fromages", prix: "4,90", unite: "par pers.", description: "Brie de Meaux\nCamembert\nChèvre\nComté" },
      { nom: "La formule du chef", prix: "14", unite: "par pers.", description: "Entrée froide\nPlats + accompagnements\nFromage ou dessert" },
    ],
  },
  {
    titre: "Entrées froides",
    note: "À la part",
    plats: plats("la part", [
      ["Salade de lentilles", "3,20"],
      ["Macédoine de légumes", "3,20"],
      ["Salade de museau de bœuf", "3,80"],
      ["Salade de riz", "3,20"],
      ["Salade de bœuf", "3,80"],
      ["Salade perle marine", "4,20"],
      ["Taboulé", "3,20"],
      ["Salade chou comté", "3,60"],
    ]),
  },
  {
    titre: "Entrées chaudes",
    note: "À la part",
    plats: plats("la part", [
      ["Vol-au-vent ris de veau", "6,90"],
      ["Coquille Saint-Jacques", "7,90"],
      ["Terrine de poisson", "3,80"],
      ["Gâteau de foie / Quenelle", "6,90"],
    ]),
  },
  {
    titre: "Quiche / Pizza",
    note: "À la plaque, plaque de 50 parts environ",
    plats: plats("la plaque", [
      ["Quiche lorraine", "30,00"],
      ["Quiche oignons", "30,00"],
      ["Pizza jambon fromage", "25,00"],
      ["Pizza 4 fromages", "25,00"],
      ["Pizza anchois", "25,00"],
      ["Pizza chèvre miel noix", "25,00"],
      ["Pizza tartiflette", "25,00"],
    ]),
  },
  {
    titre: "Viande froide",
    note: "À la part",
    plats: plats("la part", [
      ["Cuisse de poulet", "3,90"],
      ["Rôti de bœuf", "2,50"],
      ["Rôti de porc", "2,10"],
      ["Rôti de veau", "2,30"],
      ["Cuisse de pintade", "4,00"],
    ]),
  },
  {
    titre: "Plats chauds",
    note: "À la part",
    plats: plats("la part", [
      ["Blanquette de veau", "5,50"],
      ["Veau marengo", "5,50"],
      ["Bœuf bourguignon", "5,50"],
      ["Bœuf à la provençale", "5,50"],
      ["Rôti de porc en sauce", "4,00"],
      ["Rôti de veau farci sauce morilles", "4,50"],
      ["Lasagne", "7,50"],
      ["Hachis Parmentier de bœuf", "9,50"],
      ["Hachis Parmentier de canard", "12,50"],
      ["Choucroute et sa garniture", "8,50"],
      ["Paëlla", "8,90"],
      ["Rougail saucisse", "5,80"],
      ["Poulet basquaise", "7,90"],
      ["Magret de canard cuisiné", "7,90"],
      ["Rôti de veau sauce morilles", "6,90"],
      ["Délice de dinde sauce morilles", "5,90"],
      ["Délice de canard sauce poivre", "5,90"],
      ["Poulet curry", "4,90"],
      ["Dinde à l’espagnole", "4,90"],
      ["Jambon Madère", "4,50"],
      ["Suprême de poulet sauce champignons", "6,50"],
    ]),
  },
  {
    titre: "Accompagnements",
    note: "À la part",
    plats: [
      ...plats("la part", [
        ["Gratin dauphinois", "3,90"],
        ["Gratin dauphinois truffé", "4,10"],
        ["Gratin de légumes", "3,90"],
        ["Poêlée de légumes de saison", "3,50"],
        ["Pomme grenaille au romarin", "3,50"],
      ]),
      { nom: "Pommes dauphine", prix: "23,99", unite: "le kg" },
      { nom: "Tomate provençale", prix: "2,90", unite: "la part" },
    ],
  },
  {
    titre: "Petit dînatoire",
    note: "À la pièce",
    plats: plats("pièce", [
      ["Mini hamburger poulet césar", "2,00"],
      ["Mini hamburger bœuf cheddar", "2,00"],
      ["Mini hot dog", "2,00"],
      ["Mini croque jambon", "1,50"],
      ["Bouchée suédoise jambon cheddar", "1,50"],
      ["Wrap jambon fromage", "0,70"],
      ["Wrap poulet curry", "0,70"],
      ["Wrap ranch poulet barbecue", "2,00"],
      ["Navette italienne", "2,10"],
      ["Préfou ail persil", "7,50"],
      ["Sablé parmesan", "1,00"],
      ["Avocat toast italien", "2,00"],
      ["Toast de saison vegan", "1,50"],
      ["Toast de saison", "1,50"],
      ["Mini bouchée de saison", "1,50"],
      ["Mini bagel de saison", "2,50"],
      ["Mini pain bagnat thon concombre", "2,00"],
      ["Verrine de saison", "1,50"],
      ["Mini focaccia mozzarella jambon cru", "1,50"],
      ["Mini brochette de fromage", "1,50"],
      ["Mini navette charcutière (jambon blanc, rosette)", "2,00"],
      ["Mini pita poulet curry", "2,00"],
    ]),
  },
  {
    titre: "Desserts",
    note: "Par personne",
    plats: plats("par pers.", [
      ["Tarte aux pommes", "3,50"],
      ["Tarte aux fruits", "3,50"],
      ["Café gourmand", "6,90"],
      ["Pièce montée (3 choux)", "3,90"],
      ["Entremets (20 parts minimum)", "4,10"],
      ["Macaron", "1,30"],
      ["Mini gâteau de soirée", "1,30"],
    ]),
  },
];
