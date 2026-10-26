"use server";

/** Server Actions « Actualités ». La couverture s'envoie par /api/upload (usage=media) puis son ID est passé ici. */

import { refresh } from "next/cache";
import { creerArticle, definirStatutArticle, etatArticle, lireArticle, modifierArticle, supprimerArticle, validerArticle } from "@/lib/articles";
import { requireUser } from "@/lib/auth";
import { formaterHorodatage, isoDepuisHeureParis } from "@/lib/dates";
import { champChoix, champId, champTexte, type EtatAction } from "@/lib/formulaire";
import { lireMedia } from "@/lib/media";
import { nettoyerMedia } from "./nettoyage";
import { idsValides } from "./schemas";

function article(id: unknown) {
  const ids = idsValides(id);
  return ids ? lireArticle(ids[0]) : null;
}

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
  if (!v.ok)
    return {
      ok: false,
      message: "Certains champs sont à corriger.",
      erreurs: v.erreurs as Record<string, string>,
      valeurs: { titre: champs.titre, chapo: champs.chapo, corps: champs.corps },
    };
  const a = creerArticle(v.donnees);
  refresh();
  return { ok: true, message: messageEnregistrement(a), id: a.id };
}

function messageEnregistrement(a: { statut: "brouillon" | "publie"; publie_le: string | null }): string {
  const etat = etatArticle(a);
  if (etat === "publie") return "Actualité publiée : elle est en ligne.";
  if (etat === "programme") return `Actualité programmée : elle sera en ligne le ${formaterHorodatage(a.publie_le!)}.`;
  return "Brouillon enregistré (non visible sur le site).";
}

export async function modifierArticleAction(id: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const cur = article(id);
  if (!cur) return { ok: false, message: "Actualité introuvable." };
  const v = validerArticle(lireChamps(fd), cur.id);
  if (!v.ok) return { ok: false, message: "Certains champs sont à corriger.", erreurs: v.erreurs as Record<string, string> };
  const a = modifierArticle(cur.id, v.donnees);
  if (cur.couverture_media_id && cur.couverture_media_id !== v.donnees.couverture_media_id) nettoyerMedia(cur.couverture_media_id);
  refresh();
  return { ok: true, message: a ? messageEnregistrement(a) : "Actualité enregistrée." };
}

export async function definirStatutArticleAction(id: number, statut: "brouillon" | "publie"): Promise<EtatAction> {
  await requireUser();
  const cur = article(id);
  if (!cur || !definirStatutArticle(cur.id, statut === "publie" ? "publie" : "brouillon")) return { ok: false, message: "Actualité introuvable." };
  refresh();
  return { ok: true, message: statut === "publie" ? "Actualité publiée." : "Actualité repassée en brouillon." };
}

export async function supprimerArticleAction(id: number): Promise<EtatAction> {
  await requireUser();
  const cur = article(id);
  const a = cur ? supprimerArticle(cur.id) : null;
  if (!a) return { ok: false, message: "Actualité introuvable." };
  nettoyerMedia(a.couverture_media_id);
  refresh();
  return { ok: true, message: `Actualité « ${a.titre} » supprimée.` };
}
