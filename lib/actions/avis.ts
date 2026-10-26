"use server";

/** Server Actions « Avis » (saisis à la main depuis de vrais avis, jamais inventés). */

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { creerAvis, definirAvisVisible, deplacerAvis, lireAvis, modifierAvis, ordonnerAvis, supprimerAvis, validerAvis } from "@/lib/avis";
import { champTexte, type EtatAction } from "@/lib/formulaire";
import { booleen, idsValides, listeIds, sens as lireSens } from "./schemas";

const INTROUVABLE: EtatAction = { ok: false, message: "Avis introuvable : il a peut-être déjà été supprimé." };

function avis(id: unknown) {
  const ids = idsValides(id);
  return ids ? lireAvis(ids[0]) : null;
}

/** Champs : `auteur`, `texte`, `note` (1 à 5), `source` (google | direct), `date` (AAAA-MM-JJ, facultative). */
function lireChamps(fd: FormData, visible: boolean) {
  return {
    auteur: champTexte(fd, "auteur", 120),
    texte: champTexte(fd, "texte", 2000),
    note: champTexte(fd, "note", 2),
    source: champTexte(fd, "source", 10),
    date: champTexte(fd, "date", 10),
    visible,
  };
}

/** Nouvel avis, affiché sur le site sauf si la case `masquer` est cochée. */
export async function creerAvisAction(_prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const v = validerAvis(lireChamps(fd, !fd.has("masquer")));
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string> };
  const a = creerAvis(v.donnees);
  refresh();
  return { ok: true, message: `Avis de ${a.auteur} ajouté.`, id: a.id };
}

/** La visibilité est conservée (elle se change par `basculerAvisVisibleAction`). */
export async function modifierAvisAction(id: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const cur = avis(id);
  if (!cur) return INTROUVABLE;
  const v = validerAvis(lireChamps(fd, cur.visible));
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string> };
  modifierAvis(cur.id, v.donnees);
  refresh();
  return { ok: true, message: "Avis enregistré." };
}

export async function basculerAvisVisibleAction(id: number, visible: boolean): Promise<EtatAction> {
  await requireUser();
  const a = avis(id);
  const v = booleen(visible);
  if (!a || v === null) return INTROUVABLE;
  definirAvisVisible(a.id, v);
  refresh();
  return { ok: true, message: v ? "Avis affiché sur le site." : "Avis masqué du site." };
}

export async function supprimerAvisAction(id: number): Promise<EtatAction> {
  await requireUser();
  const a = avis(id);
  if (!a || !supprimerAvis(a.id)) return INTROUVABLE;
  refresh();
  return { ok: true, message: "Avis supprimé." };
}

export async function deplacerAvisAction(id: number, sens: "haut" | "bas"): Promise<EtatAction> {
  await requireUser();
  const a = avis(id);
  const sn = lireSens(sens);
  if (!a || !sn) return INTROUVABLE;
  deplacerAvis(a.id, sn);
  refresh();
  return { ok: true, message: "Ordre enregistré." };
}

export async function ordonnerAvisAction(ids: number[]): Promise<EtatAction> {
  await requireUser();
  const liste = listeIds(ids);
  if (!liste) return { ok: false, message: "Ordre invalide." };
  ordonnerAvis(liste);
  refresh();
  return { ok: true, message: "Ordre des avis enregistré." };
}
