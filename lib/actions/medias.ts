"use server";

/** Server Actions médias : texte alternatif, visuel provisoire, emplacements des pages, suppression. */

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { definirEmplacement, estCleEmplacement } from "@/lib/emplacements";
import { champTexte, type EtatAction } from "@/lib/formulaire";
import { definirProvisoire, lireMedia, mediaReference, modifierAltMedia, supprimerMediaEtFichiers } from "@/lib/media";

export async function modifierAltAction(mediaId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  if (!lireMedia(mediaId)) return { ok: false, message: "Photo introuvable." };
  modifierAltMedia(mediaId, champTexte(fd, "alt", 300));
  refresh();
  return { ok: true, message: "Description enregistrée." };
}

export async function definirProvisoireAction(mediaId: number, provisoire: boolean): Promise<EtatAction> {
  await requireUser();
  if (!lireMedia(mediaId)) return { ok: false, message: "Photo introuvable." };
  definirProvisoire(mediaId, provisoire);
  refresh();
  return { ok: true, message: provisoire ? "Marquée « à remplacer »." : "Marquée définitive." };
}

/** Associe une photo de la médiathèque à un emplacement (`null` = vider). L'envoi d'une nouvelle photo passe par /api/upload. */
export async function definirEmplacementAction(cle: string, mediaId: number | null): Promise<EtatAction> {
  await requireUser();
  if (!estCleEmplacement(cle)) return { ok: false, message: "Emplacement inconnu." };
  if (mediaId !== null) {
    const m = lireMedia(mediaId);
    if (!m || m.type !== "image") return { ok: false, message: "Photo introuvable." };
  }
  definirEmplacement(cle, mediaId);
  refresh();
  return { ok: true, message: mediaId ? "Photo mise en place." : "Emplacement vidé." };
}

/** Supprime un média seulement s'il ne sert nulle part (sinon message explicite). */
export async function supprimerMediaAction(mediaId: number): Promise<EtatAction> {
  await requireUser();
  if (!lireMedia(mediaId)) return { ok: false, message: "Fichier introuvable." };
  if (mediaReference(mediaId)) return { ok: false, message: "Ce fichier est utilisé sur le site : retirez-le d’abord de la page qui l’affiche." };
  supprimerMediaEtFichiers(mediaId);
  refresh();
  return { ok: true, message: "Fichier supprimé." };
}
