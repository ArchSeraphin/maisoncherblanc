/**
 * Markdown RESTREINT des articles (module PUR, importable côté client pour l'aperçu).
 *
 * Aucun HTML brut n'est jamais interprété : le texte est analysé en un arbre
 * (blocs + éléments en ligne) que `components/ui/markdown.tsx` rend en éléments
 * React (échappement automatique). Syntaxe acceptée :
 *
 *   ## Intertitre          ### Sous-intertitre
 *   - élément de liste     1. élément numéroté
 *   > citation
 *   **gras**   *italique*   [texte du lien](/contact ou https://...)
 *
 * Paragraphes séparés par une ligne vide ; un saut de ligne simple est conservé.
 * Lien : chemin interne (« / » puis un caractère de chemin) ou https:// ; tout
 * autre lien (javascript:, http:, //hote) est rendu comme du texte simple.
 */

export type EnLigne =
  | { t: "texte"; v: string }
  | { t: "saut" }
  | { t: "gras"; enfants: EnLigne[] }
  | { t: "italique"; enfants: EnLigne[] }
  | { t: "lien"; href: string; externe: boolean; enfants: EnLigne[] };

export type Bloc =
  | { t: "p"; enfants: EnLigne[] }
  | { t: "h2"; enfants: EnLigne[] }
  | { t: "h3"; enfants: EnLigne[] }
  | { t: "ul"; items: EnLigne[][] }
  | { t: "ol"; items: EnLigne[][] }
  | { t: "citation"; enfants: EnLigne[] };

const LIEN_INTERNE = /^\/(?:[A-Za-z0-9\-._~%!$&'()*+,;=:@?#][A-Za-z0-9\-._~%!$&'()*+,;=:@?#/]*)?$/;

/** Lien sûr : chemin interne ou https:// (sans identifiants), sinon `null`. */
export function lienSur(href: string): { href: string; externe: boolean } | null {
  const h = href.trim();
  if (LIEN_INTERNE.test(h)) return { href: h, externe: false };
  if (/^https:\/\//i.test(h)) {
    try {
      const u = new URL(h);
      if (u.protocol === "https:" && !u.username && !u.password && u.hostname.includes(".")) return { href: u.toString(), externe: true };
    } catch {
      return null;
    }
  }
  return null;
}

/** Analyse les éléments en ligne d'un texte. */
export function analyserEnLigne(texte: string): EnLigne[] {
  const out: EnLigne[] = [];
  let tampon = "";
  const vider = () => {
    if (tampon) out.push({ t: "texte", v: tampon });
    tampon = "";
  };
  let i = 0;
  while (i < texte.length) {
    const reste = texte.slice(i);
    if (reste.startsWith("\n")) {
      vider();
      out.push({ t: "saut" });
      i += 1;
      continue;
    }
    if (reste.startsWith("**")) {
      const fin = texte.indexOf("**", i + 2);
      if (fin > i + 2) {
        vider();
        out.push({ t: "gras", enfants: analyserEnLigne(texte.slice(i + 2, fin)) });
        i = fin + 2;
        continue;
      }
    }
    if ((reste[0] === "*" || reste[0] === "_") && reste[1] && reste[1] !== " ") {
      const marque = reste[0];
      const fin = texte.indexOf(marque, i + 1);
      if (fin > i + 1 && texte[fin - 1] !== " ") {
        vider();
        out.push({ t: "italique", enfants: analyserEnLigne(texte.slice(i + 1, fin)) });
        i = fin + 1;
        continue;
      }
    }
    if (reste[0] === "[") {
      const m = /^\[([^\]\n]+)\]\(([^)\s]+)\)/.exec(reste);
      if (m) {
        const sur = lienSur(m[2]);
        vider();
        if (sur) out.push({ t: "lien", href: sur.href, externe: sur.externe, enfants: analyserEnLigne(m[1]) });
        else out.push({ t: "texte", v: m[1] });
        i += m[0].length;
        continue;
      }
    }
    tampon += reste[0];
    i += 1;
  }
  vider();
  return out;
}

/** Analyse un document complet en blocs. */
export function analyserMarkdown(source: string): Bloc[] {
  const lignes = source.replace(/\r\n?/g, "\n").split("\n");
  const blocs: Bloc[] = [];
  let paragraphe: string[] = [];
  const finirParagraphe = () => {
    if (paragraphe.length) blocs.push({ t: "p", enfants: analyserEnLigne(paragraphe.join("\n").trim()) });
    paragraphe = [];
  };
  for (let i = 0; i < lignes.length; i++) {
    const ligne = lignes[i].trimEnd();
    if (!ligne.trim()) {
      finirParagraphe();
      continue;
    }
    let m: RegExpExecArray | null;
    if ((m = /^###\s+(.+)$/.exec(ligne))) {
      finirParagraphe();
      blocs.push({ t: "h3", enfants: analyserEnLigne(m[1].trim()) });
    } else if ((m = /^##\s+(.+)$/.exec(ligne))) {
      finirParagraphe();
      blocs.push({ t: "h2", enfants: analyserEnLigne(m[1].trim()) });
    } else if (/^[-*]\s+/.test(ligne) || /^\d+[.)]\s+/.test(ligne)) {
      finirParagraphe();
      const ordonnee = /^\d/.test(ligne);
      const re = ordonnee ? /^\d+[.)]\s+(.*)$/ : /^[-*]\s+(.*)$/;
      const items: EnLigne[][] = [];
      while (i < lignes.length && re.test(lignes[i].trimEnd())) {
        items.push(analyserEnLigne(re.exec(lignes[i].trimEnd())![1].trim()));
        i++;
      }
      i--;
      blocs.push({ t: ordonnee ? "ol" : "ul", items });
    } else if (/^>\s?/.test(ligne)) {
      finirParagraphe();
      const contenu: string[] = [];
      while (i < lignes.length && /^>\s?/.test(lignes[i])) {
        contenu.push(lignes[i].replace(/^>\s?/, ""));
        i++;
      }
      i--;
      blocs.push({ t: "citation", enfants: analyserEnLigne(contenu.join("\n").trim()) });
    } else {
      paragraphe.push(ligne);
    }
  }
  finirParagraphe();
  return blocs;
}

function texteDe(n: EnLigne[]): string {
  return n.map((x) => (x.t === "texte" ? x.v : x.t === "saut" ? " " : texteDe(x.enfants))).join("");
}

/** Texte brut (sans syntaxe), tronqué proprement à `max` caractères (meta description). */
export function texteBrut(source: string, max = Infinity): string {
  const texte = analyserMarkdown(source)
    .map((b) => (b.t === "ul" || b.t === "ol" ? b.items.map(texteDe).join(", ") : texteDe(b.enfants)))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (texte.length <= max) return texte;
  const coupe = texte.slice(0, max - 1);
  return `${coupe.slice(0, Math.max(coupe.lastIndexOf(" "), max * 0.6)).trimEnd()}…`;
}

/** Temps de lecture estimé en minutes (220 mots/min, 1 minimum). */
export function tempsLecture(source: string): number {
  return Math.max(1, Math.round(texteBrut(source).split(/\s+/).filter(Boolean).length / 220));
}
