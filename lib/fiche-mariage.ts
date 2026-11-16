/**
 * Fiche mariage (module PUR, importable côté client) : la version en ligne de la
 * « Demande de devis mariage » papier que la boutique envoie après un premier
 * contact. Le formulaire en étapes (components/site/fiche-mariage.tsx), la
 * Server Action (lib/actions/fiche-mariage.ts), l'e-mail de notification et le
 * backoffice partagent ce module : mêmes champs, mêmes libellés, mêmes règles.
 *
 * Enregistrement : un message `devis-traiteur` ordinaire (table `messages`,
 * même conservation, même effacement RGPD) dont `message` contient le
 * récapitulatif en texte et `details` la fiche en JSON (`formulaire: "fiche-mariage"`).
 */

import { ajouterJours, estJourIso, formaterJourLong } from "./dates";

export const FORMULAIRE_FICHE_MARIAGE = "fiche-mariage";

export type OuiNon = "" | "oui" | "non";
export type ChoixVinHonneur = "" | "oui" | "non" | "a-voir";
export type ChoixCours = "" | "envies" | "proposer" | "sans";
export type ChoixService = "" | "self-service" | "assiette" | "a-voir";
export type ChoixPlat = "" | "viande" | "poisson" | "les-deux";

export const COURS = ["entree", "plat", "legumes", "feculents", "fromage", "dessert", "piece_montee"] as const;
export type CleCours = (typeof COURS)[number];

// Clés stables (stockées dans les fiches déjà envoyées) : on ajoute, on ne renomme pas.
export const MATERIEL = [
  "nappes",
  "serviettes",
  "verres_vin",
  "verres_eau",
  "verres_champagne",
  "assiettes_repas",
  "assiettes_gateau",
  "fourchettes",
  "cuilleres",
  "couteaux",
  "tasses_cafe",
] as const;
export type CleMateriel = (typeof MATERIEL)[number];

/** Regroupement à l'affichage du formulaire (même ordre que MATERIEL). */
export const GROUPES_MATERIEL: { titre: string; cles: CleMateriel[] }[] = [
  { titre: "Linge", cles: ["nappes", "serviettes"] },
  { titre: "Verres", cles: ["verres_vin", "verres_eau", "verres_champagne"] },
  { titre: "Assiettes", cles: ["assiettes_repas", "assiettes_gateau"] },
  { titre: "Couverts et café", cles: ["fourchettes", "cuilleres", "couteaux", "tasses_cafe"] },
];

export type Fiche = {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  date: string;
  lieu: string;
  convives: string;
  heure_repas: string;
  vin_honneur: ChoixVinHonneur;
  vh_convives: string;
  vh_heure: string;
  vh_envies: string;
  cours: Record<CleCours, { choix: ChoixCours; detail: string }>;
  plat_type: ChoixPlat;
  cafe: boolean;
  the: boolean;
  service_type: ChoixService;
  materiel: CleMateriel[];
  service: OuiNon;
  livraison: OuiNon;
  alcools: string;
  softs: string;
  enfants: string;
  regimes: string;
  remarques: string;
};

/** Longueurs maximales (mêmes bornes dans le navigateur et sur le serveur). */
export const LIMITES_FICHE = {
  prenom: 80,
  nom: 80,
  email: 254,
  telephone: 30,
  lieu: 200,
  detailCours: 400,
  vh_envies: 800,
  alcools: 200,
  softs: 200,
  regimes: 400,
  remarques: 1500,
  convives: 5000,
} as const;

export const LIBELLES_COURS: Record<CleCours, { titre: string; sans: string; exemple: string }> = {
  entree: { titre: "Entrée", sans: "Pas d’entrée", exemple: "Terrine maison, salade de saison, entrée chaude…" },
  plat: { titre: "Plat", sans: "Pas de plat", exemple: "Filet mignon, suprême de volaille, pavé de saumon…" },
  legumes: { titre: "Légumes", sans: "Pas de légumes", exemple: "Légumes de saison rôtis, haricots verts, poêlée…" },
  feculents: { titre: "Féculents", sans: "Pas de féculents", exemple: "Gratin dauphinois, pommes de terre grenaille, risotto…" },
  fromage: { titre: "Fromage", sans: "Pas de fromage", exemple: "Plateau de fromages, fromage blanc, assiette individuelle…" },
  dessert: { titre: "Dessert", sans: "Pas de dessert", exemple: "Entremets, tour de macarons, café gourmand…" },
  piece_montee: { titre: "Pièce montée", sans: "Pas de pièce montée", exemple: "Nombre de choux, plaque aux prénoms…" },
};

export const LIBELLES_CHOIX_COURS: Record<Exclude<ChoixCours, "">, string> = {
  envies: "J’ai mes envies",
  proposer: "Proposez-nous",
  sans: "Sans",
};

export const LIBELLES_PLAT: Record<Exclude<ChoixPlat, "">, string> = {
  viande: "Viande",
  poisson: "Poisson",
  "les-deux": "Viande et poisson",
};

export const LIBELLES_VIN_HONNEUR: Record<Exclude<ChoixVinHonneur, "">, string> = {
  oui: "Oui",
  non: "Non",
  "a-voir": "À voir ensemble",
};

export const LIBELLES_SERVICE: Record<Exclude<ChoixService, "">, { titre: string; texte: string }> = {
  "self-service": { titre: "Self-service", texte: "Les invités viennent se servir auprès de nous." },
  assiette: { titre: "Service à l’assiette", texte: "Les plats sont servis à l’assiette aux invités." },
  "a-voir": { titre: "À voir ensemble", texte: "Vous hésitez encore : nous en parlerons." },
};

export const LIBELLES_MATERIEL: Record<CleMateriel, string> = {
  nappes: "Nappes",
  serviettes: "Serviettes",
  verres_vin: "Verres à vin",
  verres_eau: "Verres à eau",
  verres_champagne: "Verres à champagne",
  assiettes_repas: "Assiettes repas",
  assiettes_gateau: "Assiettes à gâteau",
  fourchettes: "Fourchettes",
  cuilleres: "Cuillères",
  couteaux: "Couteaux",
  tasses_cafe: "Tasses et cuillères à café",
};

/** Étapes du formulaire, dans l'ordre. La dernière est le récapitulatif. */
export const ETAPES = [
  { cle: "vous", titre: "Vous" },
  { cle: "mariage", titre: "Le mariage" },
  { cle: "vin-honneur", titre: "Vin d’honneur" },
  { cle: "repas", titre: "Le repas" },
  { cle: "prestations", titre: "Prestations" },
  { cle: "details", titre: "Derniers détails" },
  { cle: "recapitulatif", titre: "Récapitulatif" },
] as const;

/** Étape où se trouve chaque champ (pour y revenir quand il est à corriger). */
export const ETAPE_DU_CHAMP: Record<string, number> = {
  prenom: 0,
  nom: 0,
  email: 0,
  telephone: 0,
  date: 1,
  lieu: 1,
  convives: 1,
  heure_repas: 1,
  vin_honneur: 2,
  vh_convives: 2,
  vh_heure: 2,
  enfants: 5,
};

export function ficheVide(): Fiche {
  return {
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    date: "",
    lieu: "",
    convives: "",
    heure_repas: "",
    vin_honneur: "",
    vh_convives: "",
    vh_heure: "",
    vh_envies: "",
    cours: Object.fromEntries(COURS.map((c) => [c, { choix: "", detail: "" }])) as Fiche["cours"],
    plat_type: "",
    cafe: false,
    the: false,
    service_type: "",
    materiel: [],
    service: "",
    livraison: "",
    alcools: "",
    softs: "",
    enfants: "",
    regimes: "",
    remarques: "",
  };
}

/* -------------------------------------------------------------------------
   Normalisation : toute entrée (JSON du navigateur, brouillon local, base)
   devient une Fiche bornée, sans valeur hors liste.
   ------------------------------------------------------------------------- */

function texte(v: unknown, max: number, multiligne = false): string {
  if (typeof v !== "string") return "";
  const t = v.replace(/\r\n?/g, "\n").replace(/[\x00-\x08\x0b-\x1f\x7f]/g, "");
  const propre = multiligne
    ? t
        .split("\n")
        .map((l) => l.trimEnd())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
    : t.replace(/\s+/g, " ");
  return propre.trim().slice(0, max);
}

function parmi<T extends string>(v: unknown, autorises: readonly T[]): T | "" {
  return typeof v === "string" && (autorises as readonly string[]).includes(v) ? (v as T) : "";
}

function heure(v: unknown): string {
  return typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : "";
}

function entier(v: unknown, max: number): string {
  const t = typeof v === "number" ? String(v) : typeof v === "string" ? v.trim() : "";
  return /^\d{1,6}$/.test(t) && Number(t) <= max ? String(Number(t)) : t.slice(0, 7);
}

export function normaliserFiche(brut: unknown): Fiche {
  const b = (brut && typeof brut === "object" ? brut : {}) as Record<string, unknown>;
  const coursBrut = (b.cours && typeof b.cours === "object" ? b.cours : {}) as Record<string, unknown>;
  const cours = Object.fromEntries(
    COURS.map((c) => {
      const x = (coursBrut[c] && typeof coursBrut[c] === "object" ? coursBrut[c] : {}) as Record<string, unknown>;
      return [c, { choix: parmi(x.choix, ["envies", "proposer", "sans"] as const), detail: texte(x.detail, LIMITES_FICHE.detailCours, true) }];
    }),
  ) as Fiche["cours"];
  const materiel = Array.isArray(b.materiel) ? MATERIEL.filter((m) => (b.materiel as unknown[]).includes(m)) : [];
  return {
    prenom: texte(b.prenom, LIMITES_FICHE.prenom),
    nom: texte(b.nom, LIMITES_FICHE.nom),
    email: texte(b.email, LIMITES_FICHE.email).toLowerCase(),
    telephone: texte(b.telephone, LIMITES_FICHE.telephone),
    date: typeof b.date === "string" && estJourIso(b.date) ? b.date : "",
    lieu: texte(b.lieu, LIMITES_FICHE.lieu),
    convives: entier(b.convives, LIMITES_FICHE.convives),
    heure_repas: heure(b.heure_repas),
    vin_honneur: parmi(b.vin_honneur, ["oui", "non", "a-voir"] as const),
    vh_convives: entier(b.vh_convives, LIMITES_FICHE.convives),
    vh_heure: heure(b.vh_heure),
    vh_envies: texte(b.vh_envies, LIMITES_FICHE.vh_envies, true),
    cours,
    plat_type: parmi(b.plat_type, ["viande", "poisson", "les-deux"] as const),
    cafe: b.cafe === true,
    the: b.the === true,
    service_type: parmi(b.service_type, ["self-service", "assiette", "a-voir"] as const),
    materiel,
    service: parmi(b.service, ["oui", "non"] as const),
    livraison: parmi(b.livraison, ["oui", "non"] as const),
    alcools: texte(b.alcools, LIMITES_FICHE.alcools),
    softs: texte(b.softs, LIMITES_FICHE.softs),
    enfants: entier(b.enfants, LIMITES_FICHE.convives),
    regimes: texte(b.regimes, LIMITES_FICHE.regimes, true),
    remarques: texte(b.remarques, LIMITES_FICHE.remarques, true),
  };
}

/* -------------------------------------------------------------------------
   Vérification par étape (navigateur) et complète (serveur).
   ------------------------------------------------------------------------- */

const CAR_EMAIL = String.raw`[^\s@?&%#/\\,;<>"'()\x00-\x1f\x7f]`;
const RE_EMAIL = new RegExp(`^${CAR_EMAIL}+@${CAR_EMAIL}+\\.${CAR_EMAIL}{2,}$`);
const RE_LIEN = /https?:\/\/|www\.|\[url|<a\s/i;

function estEntierPositif(v: string, max: number): boolean {
  return /^\d{1,6}$/.test(v) && Number(v) >= 1 && Number(v) <= max;
}

/**
 * Erreurs d'une étape (`aujourdhui` : jour ISO de référence, heure de Paris
 * côté serveur, jour local côté navigateur). Clés = noms de champs.
 */
export function erreursEtape(etape: number, f: Fiche, aujourdhui: string): Record<string, string> {
  const e: Record<string, string> = {};
  if (etape === 0) {
    if (!f.prenom) e.prenom = "Indiquez votre prénom.";
    if (!f.nom) e.nom = "Indiquez votre nom.";
    if (!RE_EMAIL.test(f.email)) e.email = f.email ? "Cette adresse e-mail ne semble pas valide." : "Indiquez votre adresse e-mail.";
    const chiffres = f.telephone.replace(/[\s.\-()]/g, "");
    if (!f.telephone) e.telephone = "Indiquez un numéro pour que nous puissions vous rappeler.";
    else if (!/^\+?\d{9,15}$/.test(chiffres)) e.telephone = "Ce numéro de téléphone ne semble pas valide.";
  }
  if (etape === 1) {
    if (!f.date) e.date = "Indiquez la date du mariage.";
    else if (f.date < aujourdhui) e.date = "Cette date est déjà passée.";
    if (!f.lieu) e.lieu = "Indiquez le lieu de réception, même approximatif (la commune suffit).";
    if (!f.convives) e.convives = "Indiquez un nombre approximatif de convives.";
    else if (!estEntierPositif(f.convives, LIMITES_FICHE.convives)) e.convives = "Indiquez un nombre de convives (un nombre entier).";
  }
  if (etape === 2) {
    if (!f.vin_honneur) e.vin_honneur = "Dites-nous si vous souhaitez un vin d’honneur (vous pouvez répondre « À voir ensemble »).";
    if (f.vin_honneur === "oui" && f.vh_convives && !estEntierPositif(f.vh_convives, LIMITES_FICHE.convives))
      e.vh_convives = "Indiquez un nombre d’invités (un nombre entier).";
  }
  if (etape === 5) {
    if (f.enfants && !/^\d{1,6}$/.test(f.enfants)) e.enfants = "Indiquez un nombre d’enfants (un nombre entier).";
  }
  return e;
}

/** Vérification complète (serveur) : erreurs par champ, ou la fiche propre. */
export function validerFiche(brut: unknown, aujourdhui: string): { ok: true; fiche: Fiche } | { ok: false; fiche: Fiche; erreurs: Record<string, string> } {
  const fiche = normaliserFiche(brut);
  const erreurs: Record<string, string> = {};
  for (let i = 0; i < ETAPES.length - 1; i++) Object.assign(erreurs, erreursEtape(i, fiche, aujourdhui));
  const textesLibres = [fiche.vh_envies, fiche.regimes, fiche.remarques, fiche.alcools, fiche.softs, fiche.lieu, ...COURS.map((c) => fiche.cours[c].detail)];
  if (textesLibres.some((t) => RE_LIEN.test(t))) erreurs.remarques = "Merci de ne pas mettre de lien dans la fiche.";
  return Object.keys(erreurs).length ? { ok: false, fiche, erreurs } : { ok: true, fiche };
}

/** Première étape contenant une erreur (ou -1). */
export function premiereEtapeEnErreur(erreurs: Record<string, string>): number {
  const etapes = Object.keys(erreurs).map((c) => ETAPE_DU_CHAMP[c] ?? 5);
  return etapes.length ? Math.min(...etapes) : -1;
}

/** Vrai si la date tombe dans moins d'une semaine (commandes traiteur : une semaine avant). */
export function dateTropProche(date: string, aujourdhui: string): boolean {
  return !!date && date >= aujourdhui && date < ajouterJours(aujourdhui, 7);
}

/* -------------------------------------------------------------------------
   Récapitulatif : même contenu pour la page, l'e-mail et le backoffice.
   ------------------------------------------------------------------------- */

export type LigneRecap = { libelle: string; valeur: string };
export type SectionRecap = { etape: number; titre: string; lignes: LigneRecap[] };

const NON_PRECISE = "Non précisé";

function ouiNon(v: OuiNon): string {
  return v === "oui" ? "Oui" : v === "non" ? "Non" : NON_PRECISE;
}

function heureLisible(h: string): string {
  return h ? h.replace(":", " h ").replace(/ h 00$/, " h") : "";
}

function valeurCours(f: Fiche, c: CleCours): string {
  const { choix, detail } = f.cours[c];
  const type = c === "plat" && f.plat_type && choix !== "sans" ? `${LIBELLES_PLAT[f.plat_type]}. ` : "";
  if (choix === "sans") return LIBELLES_COURS[c].sans;
  if (choix === "proposer") return `${type}À nous de proposer${detail ? ` (${detail})` : ""}`;
  if (choix === "envies") return `${type}${detail || "Envies à préciser"}`;
  return type ? type.trim() : NON_PRECISE;
}

export function sectionsFiche(f: Fiche): SectionRecap[] {
  const vh: LigneRecap[] = [{ libelle: "Vin d’honneur", valeur: f.vin_honneur ? LIBELLES_VIN_HONNEUR[f.vin_honneur] : NON_PRECISE }];
  if (f.vin_honneur === "oui") {
    if (f.vh_convives) vh.push({ libelle: "Invités au vin d’honneur", valeur: f.vh_convives });
    if (f.vh_heure) vh.push({ libelle: "Heure", valeur: heureLisible(f.vh_heure) });
    if (f.vh_envies) vh.push({ libelle: "Envies", valeur: f.vh_envies });
  }
  const boissonsChaudes = [f.cafe ? "Café" : null, f.the ? "Thé" : null].filter(Boolean).join(" et ");
  return [
    {
      etape: 0,
      titre: "Vos coordonnées",
      lignes: [
        { libelle: "Nom et prénom", valeur: `${f.prenom} ${f.nom}`.trim() },
        { libelle: "Téléphone", valeur: f.telephone },
        { libelle: "E-mail", valeur: f.email },
      ],
    },
    {
      etape: 1,
      titre: "Votre mariage",
      lignes: [
        { libelle: "Date du mariage", valeur: f.date ? formaterJourLong(f.date) : NON_PRECISE },
        { libelle: "Lieu de réception", valeur: f.lieu || NON_PRECISE },
        { libelle: "Convives (environ)", valeur: f.convives || NON_PRECISE },
        { libelle: "Heure du repas", valeur: heureLisible(f.heure_repas) || NON_PRECISE },
      ],
    },
    { etape: 2, titre: "Vin d’honneur", lignes: vh },
    {
      etape: 3,
      titre: "Votre repas",
      lignes: [
        ...COURS.map((c) => ({ libelle: LIBELLES_COURS[c].titre, valeur: valeurCours(f, c) })),
        { libelle: "Café / thé", valeur: boissonsChaudes || "Ni café ni thé" },
      ],
    },
    {
      etape: 4,
      titre: "Prestations souhaitées",
      lignes: [
        { libelle: "Type de service", valeur: f.service_type ? LIBELLES_SERVICE[f.service_type].titre : NON_PRECISE },
        { libelle: "Vaisselle et linge", valeur: f.materiel.length ? f.materiel.map((m) => LIBELLES_MATERIEL[m]).join(", ") : "Rien à prévoir" },
        { libelle: "Service", valeur: ouiNon(f.service) },
        { libelle: "Livraison / installation", valeur: ouiNon(f.livraison) },
        { libelle: "Boissons, alcools", valeur: f.alcools || NON_PRECISE },
        { libelle: "Boissons, softs", valeur: f.softs || NON_PRECISE },
      ],
    },
    {
      etape: 5,
      titre: "Informations complémentaires",
      lignes: [
        { libelle: "Enfants", valeur: f.enfants || NON_PRECISE },
        { libelle: "Régimes et allergies", valeur: f.regimes || "Aucun signalé" },
        { libelle: "Demandes particulières", valeur: f.remarques || "Aucune" },
      ],
    },
  ];
}

/** Récapitulatif en texte brut (colonne `message`, e-mail en texte). */
export function texteFiche(f: Fiche): string {
  return sectionsFiche(f)
    .map((s) => [s.titre.toUpperCase(), ...s.lignes.map((l) => `${l.libelle} : ${l.valeur.includes("\n") ? `\n${l.valeur}` : l.valeur}`)].join("\n"))
    .join("\n\n");
}

/** Résumé en une ligne (liste des messages du backoffice). */
export function extraitFiche(f: Fiche): string {
  return [
    f.date ? `Mariage le ${formaterJourLong(f.date)}` : "Mariage",
    f.convives ? `${f.convives} convives` : null,
    f.lieu || null,
    f.service_type ? LIBELLES_SERVICE[f.service_type].titre.toLowerCase() : null,
  ]
    .filter(Boolean)
    .join(", ");
}

/** Contenu de la colonne `details` d'un message. */
export function detailsFiche(f: Fiche): string {
  return JSON.stringify({ formulaire: FORMULAIRE_FICHE_MARIAGE, version: 1, fiche: f });
}

/** Fiche contenue dans la colonne `details` d'un message, ou null. */
export function lireDetailsFiche(details: string | null | undefined): Fiche | null {
  if (!details) return null;
  try {
    const d = JSON.parse(details) as { formulaire?: unknown; fiche?: unknown };
    return d?.formulaire === FORMULAIRE_FICHE_MARIAGE ? normaliserFiche(d.fiche) : null;
  } catch {
    return null;
  }
}
