/**
 * Composition d'un plat ou d'une formule (module PUR, importable côté client).
 *
 * `menu_plats.description` est multiligne : 1 ligne = 1 élément de composition.
 * Une ligne qui commence par `# ` est un intertitre (ex. « # Entrée », « # Plat »
 * dans un menu de fêtes). Les lignes vides sont ignorées.
 *
 *   Plateau de charcuterie     ->  ½ tranche de jambon blanc
 *                                  1 tranche de jambon cru ...
 *   Menu Gourmandise           ->  # Entrée / Foie gras ... / # Plat / Ballotine ...
 */

export type LigneComposition = { genre: "intertitre" | "element"; texte: string };

export function lignesComposition(description: string): LigneComposition[] {
  return description
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (l.startsWith("# ") ? { genre: "intertitre" as const, texte: l.slice(2).trim() } : { genre: "element" as const, texte: l }));
}

/** Composition groupée par intertitre (groupe sans titre en tête si besoin). */
export function groupesComposition(description: string): { titre: string | null; elements: string[] }[] {
  const groupes: { titre: string | null; elements: string[] }[] = [];
  for (const l of lignesComposition(description)) {
    if (l.genre === "intertitre") groupes.push({ titre: l.texte, elements: [] });
    else {
      if (!groupes.length) groupes.push({ titre: null, elements: [] });
      groupes[groupes.length - 1].elements.push(l.texte);
    }
  }
  return groupes;
}

/** Texte brut sur une ligne (JSON-LD, meta description). */
export function compositionEnTexte(description: string): string {
  return groupesComposition(description)
    .map((g) => (g.titre ? `${g.titre} : ${g.elements.join(", ")}` : g.elements.join(", ")))
    .join(". ");
}
