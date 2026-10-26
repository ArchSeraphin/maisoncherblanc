/**
 * Saisie et affichage des prix (module PUR : importable côté client et serveur).
 *
 * Normalisation (à l'enregistrement, et à la sortie du champ dans le BO) :
 * - vide -> vide (prix non affiché) ;
 * - un nombre, avec ou sans « € », virgule ou point, est formaté à la française :
 *   « 12 » -> « 12 € », « 12,5 » -> « 12,50 € », « 3.2 » -> « 3,20 € », « 30,00 » -> « 30 € » ;
 * - tout autre texte (« Sur devis », « Selon arrivage ») est conservé tel quel.
 * Montant accepté : 0 à 9999,99.
 *
 * VALIDATION des saisies du backoffice (`validerPrix`) : seuls sont acceptés
 * un montant (« 3,40 », « 3,4 », « 3.40 », « 12 », avec ou sans « € »),
 * normalisé en « 3,40 € », ou un texte de la liste `PRIX_SUR_DEMANDE`
 * (case « Prix sur demande »). « abc » est refusé avec un message clair au
 * lieu d'être enregistré tel quel (et de faire sortir le plat du JSON-LD).
 */

export const PRIX_LONGUEUR_MAX = 40;

export const AIDE_PRIX =
  "Tapez juste le nombre : « 12 » devient « 12 € », « 3,2 » devient « 3,20 € ». Sans montant : cochez « Prix sur demande ». Vide = pas de prix.";

/** Textes acceptés à la place d'un montant (case « Prix sur demande »). Liste à compléter au besoin. */
export const PRIX_SUR_DEMANDE = ["Sur devis", "Selon arrivage", "Prix au poids"] as const;

export const ERREUR_PRIX = "Prix non reconnu : tapez un montant (ex. 3,40) ou cochez « Prix sur demande ».";

export type ResultatPrix = { ok: true; prix: string } | { ok: false; erreur: string };

const sansAccents = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/** Texte de `PRIX_SUR_DEMANDE` correspondant à la saisie (casse et accents ignorés), ou `null`. */
export function prixSurDemande(brut: string): (typeof PRIX_SUR_DEMANDE)[number] | null {
  const cle = sansAccents(brut);
  return PRIX_SUR_DEMANDE.find((t) => sansAccents(t) === cle) ?? null;
}

/** Valide et normalise une saisie de prix du backoffice (voir la règle en tête de module). */
export function validerPrix(brut: unknown): ResultatPrix {
  const texte = typeof brut === "string" ? brut.replace(/\s+/g, " ").trim() : "";
  if (!texte) return { ok: true, prix: "" };
  if (texte.length <= PRIX_LONGUEUR_MAX && estPrixNumerique(texte)) return { ok: true, prix: normaliserPrix(texte) };
  const libre = prixSurDemande(texte);
  return libre ? { ok: true, prix: libre } : { ok: false, erreur: ERREUR_PRIX };
}

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
