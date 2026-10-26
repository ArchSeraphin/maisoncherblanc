"use server";

/** Server Actions « Actualités ». La couverture s'envoie par /api/upload (purpose=media) puis son ID est passé ici. */

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { creerArticle, definirStatutArticle, lireArticle, modifierArticle, supprimerArticle, validerArticle } from "@/lib/articles";
import { requireUser } from "@/lib/auth";
import { lienAdmin } from "@/lib/chemin-admin";
import { isoDepuisHeureParis } from "@/lib/dates";
import { champChoix, champId, champTexte, type EtatAction } from "@/lib/formulaire";
import { lireMedia, supprimerMediaSiOrphelin } from "@/lib/media";

/**
 * Champs : `titre`, `slug` (optionnel), `chapo`, `corps` (Markdown restreint),
 * `couverture_media_id`, `statut` ("brouillon" | "publie"), `publie_le`
 * (datetime-local, heure de Paris ; vide = maintenant à la publication),
 * `titre_seo`, `description_seo`.
 */
function lireChamps(fd: FormData) {
  const local = champTexte(fd, "publie_le", 20);
  const couverture = champId(fd, "couverture_media_id");
  return {
    titre: champTexte(fd, "titre", 300),
    slug: champTexte(fd, "slug", 120),
    chapo: champTexte(fd, "chapo", 800),
    corps: champTexte(fd, "corps", 60_000),
    couverture_media_id: couverture && lireMedia(couverture)?.type === "image" ? couverture : null,
    statut: champChoix(fd, "statut", ["brouillon", "publie"] as const, "brouillon"),
    publie_le: local ? (isoDepuisHeureParis(local) ?? "invalide") : null,
    titre_seo: champTexte(fd, "titre_seo", 120),
    description_seo: champTexte(fd, "description_seo", 300),
  };
}

export async function creerArticleAction(_prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const champs = lireChamps(fd);
  const v = validerArticle(champs);
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string>, valeurs: { titre: champs.titre, chapo: champs.chapo, corps: champs.corps } };
  const a = creerArticle(v.donnees);
  redirect(lienAdmin(`/actualites/${a.id}`));
}

export async function modifierArticleAction(id: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const cur = lireArticle(id);
  if (!cur) return { ok: false, message: "Actualité introuvable." };
  const v = validerArticle(lireChamps(fd), id);
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string> };
  modifierArticle(id, v.donnees);
  if (cur.couverture_media_id && cur.couverture_media_id !== v.donnees.couverture_media_id) supprimerMediaSiOrphelin(cur.couverture_media_id);
  refresh();
  return { ok: true, message: v.donnees.statut === "publie" ? "Actualité enregistrée et publiée." : "Brouillon enregistré." };
}

export async function definirStatutArticleAction(id: number, statut: "brouillon" | "publie"): Promise<EtatAction> {
  await requireUser();
  if (!definirStatutArticle(id, statut === "publie" ? "publie" : "brouillon")) return { ok: false, message: "Actualité introuvable." };
  refresh();
  return { ok: true, message: statut === "publie" ? "Actualité publiée." : "Actualité repassée en brouillon." };
}

export async function supprimerArticleAction(id: number): Promise<EtatAction> {
  await requireUser();
  const a = supprimerArticle(id);
  if (!a) return { ok: false, message: "Actualité introuvable." };
  supprimerMediaSiOrphelin(a.couverture_media_id);
  refresh();
  return { ok: true, message: "Actualité supprimée." };
}
