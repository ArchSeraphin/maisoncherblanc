/**
 * Réglages éditables (table `settings`, valeur JSON par clé).
 *
 * Clés : `horaires` (semaine type), `annonce` (bandeau), `emplacements`
 * (photos des pages, voir lib/emplacements.ts), `coordonnees_affichage`
 * (surcharge optionnelle de config/site.ts). Chaque lecture renvoie une valeur
 * complète et typée (défauts fusionnés), jamais `undefined`.
 */

import { JOURS, siteConfig, type CleJour, type HorairesSemaine, type Plage } from "@/config/site";
import { dansFenetre, estJourIso, jourParis } from "./dates";
import { lireJson, stmt } from "./db";

export type Annonce = {
  active: boolean;
  texte: string;
  /** Lien interne ("/menus-de-fetes") ou https://, vide = pas de lien. */
  lien: string;
  /** Fenêtre d'affichage optionnelle (jours ISO inclus). */
  debut: string | null;
  fin: string | null;
};

/** Surcharge d'affichage des coordonnées (vide = config/site.ts fait foi). */
export type CoordonneesAffichage = { telephone: string; mobile: string; email: string };

export type Reglages = {
  horaires: HorairesSemaine;
  annonce: Annonce;
  emplacements: Record<string, number>;
  coordonnees_affichage: CoordonneesAffichage;
};
export type CleReglage = keyof Reglages;

export const REGLAGES_PAR_DEFAUT: Reglages = {
  horaires: siteConfig.horairesParDefaut,
  annonce: { active: false, texte: "", lien: "", debut: null, fin: null },
  emplacements: {},
  coordonnees_affichage: { telephone: "", mobile: "", email: "" },
};

const RE_HEURE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Normalise des plages (format valide uniquement, ouverture < fermeture). */
export function normaliserPlages(entree: unknown): Plage[] {
  if (!Array.isArray(entree)) return [];
  return entree
    .filter(
      (p): p is Plage =>
        !!p && typeof p === "object" && RE_HEURE.test(String((p as Plage).ouverture)) && RE_HEURE.test(String((p as Plage).fermeture)),
    )
    .map((p) => ({ ouverture: p.ouverture, fermeture: p.fermeture }))
    .filter((p) => p.ouverture < p.fermeture);
}

/** Normalise une semaine type complète. */
export function normaliserHoraires(entree: unknown): HorairesSemaine {
  const src = (entree && typeof entree === "object" ? entree : {}) as Partial<Record<CleJour, unknown>>;
  const out = {} as HorairesSemaine;
  for (const j of JOURS) out[j] = normaliserPlages(src[j]);
  return out;
}

function normaliser<K extends CleReglage>(cle: K, valeur: unknown): Reglages[K] {
  const v = (valeur && typeof valeur === "object" ? valeur : {}) as Record<string, unknown>;
  switch (cle) {
    case "horaires":
      return normaliserHoraires(valeur) as Reglages[K];
    case "annonce":
      return {
        active: v.active === true,
        texte: typeof v.texte === "string" ? v.texte : "",
        lien: typeof v.lien === "string" ? v.lien : "",
        debut: estJourIso(v.debut) ? v.debut : null,
        fin: estJourIso(v.fin) ? v.fin : null,
      } as Reglages[K];
    case "emplacements": {
      const out: Record<string, number> = {};
      for (const [k, id] of Object.entries(v)) if (typeof id === "number" && Number.isInteger(id) && id > 0) out[k] = id;
      return out as Reglages[K];
    }
    case "coordonnees_affichage":
      return {
        telephone: typeof v.telephone === "string" ? v.telephone : "",
        mobile: typeof v.mobile === "string" ? v.mobile : "",
        email: typeof v.email === "string" ? v.email : "",
      } as Reglages[K];
    default:
      return REGLAGES_PAR_DEFAUT[cle];
  }
}

/** Lit un réglage (défaut fusionné si absent ou partiel). */
export function lireReglage<K extends CleReglage>(cle: K): Reglages[K] {
  const r = stmt("SELECT value FROM settings WHERE key = ?").get(cle) as { value: string } | undefined;
  if (!r) return normaliser(cle, REGLAGES_PAR_DEFAUT[cle]);
  return normaliser(cle, lireJson<unknown>(r.value, REGLAGES_PAR_DEFAUT[cle]));
}

/** Écrit un réglage complet (normalisé avant écriture). */
export function ecrireReglage<K extends CleReglage>(cle: K, valeur: Reglages[K]): Reglages[K] {
  const propre = normaliser(cle, valeur);
  stmt("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(
    cle,
    JSON.stringify(propre),
  );
  return propre;
}

/** Insère la valeur seulement si la clé n'existe pas (seed idempotent). Renvoie `true` si créée. */
export function initialiserReglage<K extends CleReglage>(cle: K, valeur?: Reglages[K]): boolean {
  const res = stmt("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run(
    cle,
    JSON.stringify(normaliser(cle, valeur ?? REGLAGES_PAR_DEFAUT[cle])),
  );
  return res.changes > 0;
}

// ---------------------------------------------------------------------------
// Horaires
// ---------------------------------------------------------------------------

export function lireHoraires(): HorairesSemaine {
  return lireReglage("horaires");
}

export type ResultatValidation<T, K extends string = string> = { ok: true; donnees: T } | { ok: false; erreurs: Partial<Record<K, string>> };

/**
 * Valide une semaine type saisie au BO. Par jour : au plus 2 plages, heures
 * HH:MM, ouverture avant fermeture, 2e plage après la 1re (pas d'horaire après minuit).
 */
export function validerHoraires(entree: unknown): ResultatValidation<HorairesSemaine, CleJour> {
  const src = (entree && typeof entree === "object" ? entree : {}) as Partial<Record<CleJour, unknown>>;
  const erreurs: Partial<Record<CleJour, string>> = {};
  const out = {} as HorairesSemaine;
  for (const j of JOURS) {
    const brutes = Array.isArray(src[j]) ? (src[j] as unknown[]) : [];
    const plages = brutes.map((p) => {
      const o = (p && typeof p === "object" ? p : {}) as Record<string, unknown>;
      return { ouverture: String(o.ouverture ?? "").slice(0, 5), fermeture: String(o.fermeture ?? "").slice(0, 5) };
    });
    out[j] = plages;
    const e = erreurPlages(plages);
    if (e) erreurs[j] = e;
  }
  return Object.keys(erreurs).length ? { ok: false, erreurs } : { ok: true, donnees: normaliserHoraires(out) };
}

/** Message d'erreur pour une liste de plages, ou `null` si elle est valide. */
export function erreurPlages(plages: Plage[]): string | null {
  if (plages.length > 2) return "Deux plages horaires au maximum par jour.";
  for (const [i, p] of plages.entries()) {
    if (!RE_HEURE.test(p.ouverture) || !RE_HEURE.test(p.fermeture))
      return `Plage ${i + 1} : indiquez une heure d’ouverture et une heure de fermeture.`;
    if (p.ouverture >= p.fermeture) return `Plage ${i + 1} : l’ouverture doit être avant la fermeture.`;
  }
  if (plages.length === 2 && plages[1].ouverture < plages[0].fermeture) return "La 2e plage doit commencer après la fin de la 1re.";
  return null;
}

// ---------------------------------------------------------------------------
// Annonce (bandeau en haut du site)
// ---------------------------------------------------------------------------

export const LIMITES_ANNONCE = { texte: 200, conseille: 120, lien: 300 } as const;

/** Chemin interne sûr : "/" puis un caractère de chemin ordinaire (jamais "//" ni "/\\"). */
const LIEN_INTERNE = /^\/(?:[A-Za-z0-9\-._~%!$&'()*+,;=:@?#][A-Za-z0-9\-._~%!$&'()*+,;=:@?#/]*)?$/;

/** Lien de l'annonce : vide, chemin interne ou https://. */
export function verifierLien(brut: string): { ok: true; lien: string } | { ok: false; erreur: string } {
  const lien = brut.trim();
  if (!lien) return { ok: true, lien: "" };
  if (lien.length > LIMITES_ANNONCE.lien) return { ok: false, erreur: "Lien trop long." };
  if (/\s/.test(lien)) return { ok: false, erreur: "Le lien ne doit pas contenir d’espace." };
  if (lien.startsWith("/")) {
    return LIEN_INTERNE.test(lien)
      ? { ok: true, lien }
      : { ok: false, erreur: "Lien interne invalide : il doit commencer par une page du site, ex. /menus-de-fetes" };
  }
  if (/[\\\u0000-\u001f\u007f]/.test(lien)) return { ok: false, erreur: "Le lien contient un caractère interdit." };
  if (/^http:\/\//i.test(lien)) return { ok: false, erreur: "Utilisez une adresse sécurisée, commençant par https://" };
  if (/^https:\/\//i.test(lien)) {
    try {
      const u = new URL(lien);
      if (u.protocol === "https:" && u.hostname.includes(".") && !u.username && !u.password) return { ok: true, lien: u.toString() };
    } catch {
      /* invalide */
    }
  }
  return { ok: false, erreur: "Lien invalide : une page du site (ex. /contact) ou une adresse complète en https://" };
}

/** Annonce enregistrée (telle quelle, pour le BO). */
export function lireAnnonce(): Annonce {
  const a = lireReglage("annonce");
  if (a.lien && !verifierLien(a.lien).ok) return { ...a, lien: "" };
  return a;
}

/** Annonce à afficher aujourd'hui sur le site, ou `null` (inactive, vide ou hors fenêtre). */
export function annonceEnCours(jour: string = jourParis()): Annonce | null {
  const a = lireAnnonce();
  if (!a.active || !a.texte.trim()) return null;
  return dansFenetre(jour, a.debut, a.fin) ? a : null;
}

/** Valide la saisie du BO (texte obligatoire si active, lien sûr, fenêtre cohérente). */
export function validerAnnonce(entree: {
  active?: unknown;
  texte?: unknown;
  lien?: unknown;
  debut?: unknown;
  fin?: unknown;
}): ResultatValidation<Annonce, keyof Annonce> {
  const erreurs: Partial<Record<keyof Annonce, string>> = {};
  const texte = typeof entree.texte === "string" ? entree.texte.replace(/\s+/g, " ").trim().slice(0, LIMITES_ANNONCE.texte) : "";
  const verif = verifierLien(typeof entree.lien === "string" ? entree.lien : "");
  if (!verif.ok) erreurs.lien = verif.erreur;
  const active = entree.active === true;
  if (active && !texte) erreurs.texte = "Écrivez le texte de l’annonce pour pouvoir l’afficher.";
  const debut = typeof entree.debut === "string" && entree.debut ? entree.debut : null;
  const fin = typeof entree.fin === "string" && entree.fin ? entree.fin : null;
  if (debut && !estJourIso(debut)) erreurs.debut = "Date de début invalide.";
  if (fin && !estJourIso(fin)) erreurs.fin = "Date de fin invalide.";
  if (debut && fin && estJourIso(debut) && estJourIso(fin) && fin < debut) erreurs.fin = "La fin doit être après le début.";
  if (Object.keys(erreurs).length) return { ok: false, erreurs };
  return { ok: true, donnees: { active, texte, lien: verif.ok ? verif.lien : "", debut, fin } };
}

// ---------------------------------------------------------------------------
// Coordonnées affichées
// ---------------------------------------------------------------------------

/** Coordonnées à afficher : surcharge du BO si renseignée, sinon config/site.ts. */
export function coordonnees(): {
  telephone: { affichage: string; href: string };
  mobile: { affichage: string; href: string };
  email: string;
} {
  const s = lireReglage("coordonnees_affichage");
  const tel = (affichage: string) => ({ affichage, href: `tel:${affichage.replace(/[^\d+]/g, "").replace(/^0/, "+33")}` });
  return {
    telephone: s.telephone ? tel(s.telephone) : { affichage: siteConfig.telephones.boutique.affichage, href: siteConfig.telephones.boutique.href },
    mobile: s.mobile ? tel(s.mobile) : { affichage: siteConfig.telephones.mobile.affichage, href: siteConfig.telephones.mobile.href },
    email: s.email || siteConfig.email,
  };
}
