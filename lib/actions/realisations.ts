"use server";

/** Server Actions « Réalisations » (galerie). L'envoi de photos passe par /api/upload (usage=realisation). */

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { champChoix, champTexte, type EtatAction } from "@/lib/formulaire";
import { modifierAltMedia } from "@/lib/media";
import {
  CATEGORIES_REALISATION,
  deplacerRealisation,
  lireRealisation,
  modifierRealisation,
  ordonnerRealisations,
  supprimerRealisation,
} from "@/lib/realisations";
import { booleen, idsValides, listeIds, sens as lireSens } from "./schemas";

const INTROUVABLE: EtatAction = { ok: false, message: "Photo introuvable : elle a peut-être déjà été supprimée." };

function realisation(id: unknown) {
  const ids = idsValides(id);
  return ids ? lireRealisation(ids[0]) : null;
}

/**
 * Champs : `alt` (description de la photo, obligatoire), `legende`, `categorie`.
 * La visibilité se change par `basculerRealisationVisibleAction`.
 */
export async function modifierRealisationAction(id: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const r = realisation(id);
  if (!r) return INTROUVABLE;
  const alt = champTexte(fd, "alt", 300).replace(/\s+/g, " ");
  if (fd.has("alt") && alt.length < 5) return { ok: false, erreurs: { alt: "Décrivez ce que montre la photo (quelques mots)." } };
  modifierRealisation(r.id, {
    legende: fd.has("legende") ? champTexte(fd, "legende", 300) : undefined,
    categorie: champChoix(fd, "categorie", CATEGORIES_REALISATION, r.categorie),
  });
  if (fd.has("alt")) modifierAltMedia(r.media_id, alt);
  refresh();
  return { ok: true, message: "Photo enregistrée." };
}

export async function basculerRealisationVisibleAction(id: number, visible: boolean): Promise<EtatAction> {
  await requireUser();
  const r = realisation(id);
  const v = booleen(visible);
  if (!r || v === null) return INTROUVABLE;
  modifierRealisation(r.id, { visible: v });
  refresh();
  return { ok: true, message: v ? "Photo affichée sur le site." : "Photo masquée du site." };
}

/** Supprime la réalisation (et la photo, fichiers compris, si elle ne sert nulle part ailleurs). */
export async function supprimerRealisationAction(id: number): Promise<EtatAction> {
  await requireUser();
  const r = realisation(id);
  if (!r || !supprimerRealisation(r.id)) return INTROUVABLE;
  refresh();
  return { ok: true, message: "Photo supprimée." };
}

export async function deplacerRealisationAction(id: number, sens: "haut" | "bas"): Promise<EtatAction> {
  await requireUser();
  const r = realisation(id);
  const sn = lireSens(sens);
  if (!r || !sn) return INTROUVABLE;
  deplacerRealisation(r.id, sn);
  refresh();
  return { ok: true, message: "Ordre enregistré." };
}

export async function ordonnerRealisationsAction(ids: number[]): Promise<EtatAction> {
  await requireUser();
  const liste = listeIds(ids);
  if (!liste) return { ok: false, message: "Ordre invalide." };
  ordonnerRealisations(liste);
  refresh();
  return { ok: true, message: "Ordre des photos enregistré." };
}
