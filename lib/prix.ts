/**
 * Saisie et affichage des prix (module PUR : importable côté client et serveur).
 *
 * Normalisation (à l'enregistrement, et à la sortie du champ dans le BO) :
 * - vide -> vide (prix non affiché) ;
 * - un nombre, avec ou sans « € », virgule ou point, est formaté à la française :
 *   « 12 » -> « 12 € », « 12,5 » -> « 12,50 € », « 3.2 » -> « 3,20 € », « 30,00 » -> « 30 € » ;
 * - tout autre texte (« Sur devis », « Selon arrivage ») est conservé tel quel.
 * Montant accepté : 0 à 9999,99.
 */

export const PRIX_LONGUEUR_MAX = 40;

export const AIDE_PRIX =
  "Tapez juste le nombre : « 12 » devient « 12 € », « 3,2 » devient « 3,20 € ». Un texte (ex. « Sur devis ») est gardé tel quel. Vide = pas de prix.";

const RE_NOMBRE = /^(\d{1,4})(?:[.,](\d{1,2}))?$/;

function compacter(brut: string): string {
  return brut.replace(/euros?|eur|€/gi, "").replace(/[\s  ]/g, "");
}

/** Normalise une saisie de prix (voir la règle en tête de module). */
export function normaliserPrix(brut: unknown): string {
  if (typeof brut !== "string") return "";
  const texte = brut.replace(/\s+/g, " ").trim().slice(0, PRIX_LONGUEUR_MAX);
  if (!texte) return "";
  const m = RE_NOMBRE.exec(compacter(texte));
  if (!m) return texte;
  const euros = String(Number(m[1]));
  const centimes = m[2] ? m[2].padEnd(2, "0") : "";
  return centimes && centimes !== "00" ? `${euros},${centimes} €` : `${euros} €`;
}

/** Vrai si la saisie est un montant reconnu. */
export function estPrixNumerique(brut: string): boolean {
  return RE_NOMBRE.test(compacter(brut));
}

/**
 * Montant décimal pour schema.org (« 3,20 € » -> "3.20"), `null` si non numérique.
 */
export function montantSchema(prix: string): string | null {
  const m = RE_NOMBRE.exec(compacter(prix));
  if (!m) return null;
  return m[2] ? `${Number(m[1])}.${m[2].padEnd(2, "0")}` : String(Number(m[1]));
}

/**
 * Affichage « carte imprimée » : centimes toujours visibles (« 2 € » -> « 2,00 € »).
 * Un texte non numérique est renvoyé tel quel.
 */
export function prixAvecCentimes(prix: string): string {
  const m = RE_NOMBRE.exec(compacter(prix));
  if (!m) return prix;
  return `${Number(m[1])},${(m[2] ?? "00").padEnd(2, "0")} €`;
}
