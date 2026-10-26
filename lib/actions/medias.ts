"use server";

/** Server Actions médias : texte alternatif, visuel provisoire, emplacements des pages, suppression. */

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { definirEmplacement, estCleEmplacement, lireIdsEmplacements } from "@/lib/emplacements";
import { champTexte, type EtatAction } from "@/lib/formulaire";
import { definirProvisoire, lireMedia, mediaReference, modifierAltMedia, supprimerMediaEtFichiers } from "@/lib/media";
import { nettoyerMedia } from "./nettoyage";
import { booleen, idsValides } from "./schemas";

function media(id: unknown) {
  const ids = idsValides(id);
  return ids ? lireMedia(ids[0]) : null;
}

/** Description de la photo (texte alternatif, `alt`). */
export async function modifierAltAction(mediaId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const m = media(mediaId);
  if (!m) return { ok: false, message: "Photo introuvable." };
  const alt = champTexte(fd, "alt", 300).replace(/\s+/g, " ");
  if (m.type === "image" && alt.length < 5) return { ok: false, erreurs: { alt: "Décrivez ce que montre la photo (quelques mots)." } };
  modifierAltMedia(m.id, alt);
  refresh();
  return { ok: true, message: "Description de la photo enregistrée." };
}

export async function definirProvisoireAction(mediaId: number, provisoire: boolean): Promise<EtatAction> {
  await requireUser();
  const m = media(mediaId);
  const v = booleen(provisoire);
  if (!m || v === null) return { ok: false, message: "Photo introuvable." };
  definirProvisoire(m.id, v);
  refresh();
  return { ok: true, message: v ? "Photo marquée « à remplacer »." : "Photo marquée comme définitive." };
}

/**
 * Associe une photo à un emplacement (`null` = vider) : photo de la médiathèque,
 * ou photo tout juste envoyée par /api/upload (usage `media`). L'ancienne photo
 * reste dans la médiathèque si elle vient du seed (vraies photos), sinon elle est
 * supprimée avec ses fichiers dès qu'elle ne sert plus.
 */
export async function definirEmplacementAction(cle: string, mediaId: number | null): Promise<EtatAction> {
  await requireUser();
  if (!estCleEmplacement(cle)) return { ok: false, message: "Emplacement inconnu." };
  if (mediaId !== null) {
    const m = media(mediaId);
    if (!m || m.type !== "image" || m.statut !== "ready") return { ok: false, message: "Photo introuvable." };
  }
  const ancien = lireIdsEmplacements()[cle];
  definirEmplacement(cle, mediaId);
  if (ancien && ancien !== mediaId) nettoyerMedia(ancien);
  refresh();
  return { ok: true, message: mediaId ? "Photo mise en place sur la page." : "Photo retirée de la page." };
}

/** Supprime un média seulement s'il ne sert nulle part (sinon message explicite). */
export async function supprimerMediaAction(mediaId: number): Promise<EtatAction> {
  await requireUser();
  const m = media(mediaId);
  if (!m) return { ok: false, message: "Fichier introuvable." };
  if (mediaReference(m.id)) return { ok: false, message: "Ce fichier est utilisé sur le site : retirez-le d’abord de la page qui l’affiche." };
  supprimerMediaEtFichiers(m.id);
  refresh();
  return { ok: true, message: "Fichier supprimé." };
}
