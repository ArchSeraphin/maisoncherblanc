/** Slug d'URL (module PUR) : minuscules ASCII, tirets, 90 caractères au plus. */
export function slugifier(texte: string, max = 90): string {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/œ/gi, "oe")
    .replace(/æ/gi, "ae")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
}

/** Vrai si `v` est un slug valide. */
export function estSlug(v: unknown): v is string {
  return typeof v === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) && v.length <= 90;
}
