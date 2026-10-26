"use server";

/** Server Actions « Réalisations » (galerie). L'envoi de photos passe par /api/upload (purpose=realisation). */

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { champBooleen, champChoix, champListeIds, champTexte, type EtatAction } from "@/lib/formulaire";
import { modifierAltMedia } from "@/lib/media";
import {
  CATEGORIES_REALISATION,
  deplacerRealisation,
  lireRealisation,
  modifierRealisation,
  ordonnerRealisations,
  supprimerRealisation,
} from "@/lib/realisations";

/** Champs : `legende`, `categorie`, `visible`, `alt` (porté par le média). */
export async function modifierRealisationAction(id: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const r = lireRealisation(id);
  if (!r) return { ok: false, message: "Réalisation introuvable." };
  modifierRealisation(id, {
    legende: champTexte(fd, "legende", 300),
    categorie: champChoix(fd, "categorie", CATEGORIES_REALISATION, r.categorie),
    visible: champBooleen(fd, "visible"),
  });
  if (fd.has("alt")) modifierAltMedia(r.media_id, champTexte(fd, "alt", 300));
  refresh();
  return { ok: true, message: "Réalisation enregistrée." };
}

export async function basculerRealisationVisibleAction(id: number, visible: boolean): Promise<EtatAction> {
  await requireUser();
  if (!modifierRealisation(id, { visible })) return { ok: false, message: "Réalisation introuvable." };
  refresh();
  return { ok: true, message: visible ? "Photo affichée." : "Photo masquée du site." };
}

/** Supprime la réalisation (et la photo si elle ne sert nulle part ailleurs). */
export async function supprimerRealisationAction(id: number): Promise<EtatAction> {
  await requireUser();
  if (!supprimerRealisation(id)) return { ok: false, message: "Réalisation introuvable." };
  refresh();
  return { ok: true, message: "Photo supprimée." };
}

export async function deplacerRealisationAction(id: number, sens: "haut" | "bas"): Promise<void> {
  await requireUser();
  deplacerRealisation(id, sens === "haut" ? "haut" : "bas");
  refresh();
}

export async function ordonnerRealisationsAction(ids: number[]): Promise<void> {
  await requireUser();
  ordonnerRealisations(Array.isArray(ids) ? ids : []);
  refresh();
}

export async function ordonnerRealisationsFormAction(fd: FormData): Promise<void> {
  await requireUser();
  ordonnerRealisations(champListeIds(fd, "ordre"));
  refresh();
}
