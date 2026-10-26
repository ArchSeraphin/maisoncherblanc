/**
 * Lecture typée et bornée des champs de formulaire (Server Actions).
 * Module PUR : aucune base. Toute entrée utilisateur passe par ici.
 */

/** Chaîne trimée et tronquée (`""` si absente). */
export function champTexte(fd: FormData, nom: string, max = 1000): string {
  const v = fd.get(nom);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Texte multiligne : fins de ligne normalisées, espaces de fin retirés par ligne. */
export function champMultiligne(fd: FormData, nom: string, max = 5000): string {
  return champTexte(fd, nom, max)
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

/** Entier strictement positif ou `null`. */
export function champId(fd: FormData, nom: string): number | null {
  const n = Number(champTexte(fd, nom, 20));
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Entier borné ou `secours`. */
export function champEntier(fd: FormData, nom: string, secours: number, min = -1e9, max = 1e9): number {
  const brut = champTexte(fd, nom, 20);
  const n = Number(brut);
  if (brut === "" || !Number.isInteger(n)) return secours;
  return Math.min(Math.max(n, min), max);
}

/** Entier borné ou `null` si vide/invalide. */
export function champEntierOuNull(fd: FormData, nom: string, min = 0, max = 1e9): number | null {
  const brut = champTexte(fd, nom, 20);
  const n = Number(brut);
  if (brut === "" || !Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

/** Case à cocher : présente et différente de "0"/"false"/"". */
export function champBooleen(fd: FormData, nom: string): boolean {
  const v = fd.get(nom);
  return v !== null && v !== "0" && v !== "false" && v !== "";
}

/** Valeur parmi une liste autorisée, sinon `secours`. */
export function champChoix<T extends string>(fd: FormData, nom: string, autorises: readonly T[], secours: T): T {
  const v = champTexte(fd, nom, 100);
  return (autorises as readonly string[]).includes(v) ? (v as T) : secours;
}

/** JSON parsé (champ caché), ou `secours`. */
export function champJson<T>(fd: FormData, nom: string, secours: T, max = 100_000): T {
  const brut = champTexte(fd, nom, max);
  if (!brut) return secours;
  try {
    return JSON.parse(brut) as T;
  } catch {
    return secours;
  }
}

/** Liste d'IDs (ordre du glisser-déposer) depuis un champ JSON ou "1,2,3". */
export function champListeIds(fd: FormData, nom: string): number[] {
  const brut = champTexte(fd, nom, 20_000);
  const parts = brut.startsWith("[") ? champJson<unknown[]>(fd, nom, []) : brut.split(",");
  return (Array.isArray(parts) ? parts : []).map((p) => Number(p)).filter((n) => Number.isInteger(n) && n > 0);
}

/** État standard renvoyé par une Server Action à `useActionState`. */
export type EtatAction = {
  ok: boolean;
  message?: string;
  erreurs?: Record<string, string>;
  /** Valeurs saisies renvoyées après une erreur (rien n'est perdu). */
  valeurs?: Record<string, string>;
  /** ID créé, le cas échéant (ex. nouveau plat). */
  id?: number;
};

export const etatInitial: EtatAction = { ok: false };
