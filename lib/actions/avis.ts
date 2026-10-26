"use server";

/** Server Actions « Avis » (saisis à la main depuis de vrais avis, jamais inventés). */

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { creerAvis, definirAvisVisible, deplacerAvis, lireAvis, modifierAvis, ordonnerAvis, supprimerAvis, validerAvis } from "@/lib/avis";
import { champBooleen, champTexte, type EtatAction } from "@/lib/formulaire";

function lireChamps(fd: FormData) {
  return {
    auteur: champTexte(fd, "auteur", 120),
    texte: champTexte(fd, "texte", 2000),
    note: champTexte(fd, "note", 2),
    source: champTexte(fd, "source", 10),
    date: champTexte(fd, "date", 10),
    visible: fd.has("visible") ? champBooleen(fd, "visible") : true,
  };
}

export async function creerAvisAction(_prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const v = validerAvis(lireChamps(fd));
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string> };
  const a = creerAvis(v.donnees);
  refresh();
  return { ok: true, message: "Avis ajouté.", id: a.id };
}

export async function modifierAvisAction(id: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  if (!lireAvis(id)) return { ok: false, message: "Avis introuvable." };
  const v = validerAvis(lireChamps(fd));
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string> };
  modifierAvis(id, v.donnees);
  refresh();
  return { ok: true, message: "Avis enregistré." };
}

export async function basculerAvisVisibleAction(id: number, visible: boolean): Promise<EtatAction> {
  await requireUser();
  if (!lireAvis(id)) return { ok: false, message: "Avis introuvable." };
  definirAvisVisible(id, visible);
  refresh();
  return { ok: true, message: visible ? "Avis affiché." : "Avis masqué." };
}

export async function supprimerAvisAction(id: number): Promise<EtatAction> {
  await requireUser();
  if (!supprimerAvis(id)) return { ok: false, message: "Avis introuvable." };
  refresh();
  return { ok: true, message: "Avis supprimé." };
}

export async function deplacerAvisAction(id: number, sens: "haut" | "bas"): Promise<void> {
  await requireUser();
  deplacerAvis(id, sens === "haut" ? "haut" : "bas");
  refresh();
}

export async function ordonnerAvisAction(ids: number[]): Promise<void> {
  await requireUser();
  ordonnerAvis(Array.isArray(ids) ? ids : []);
  refresh();
}
