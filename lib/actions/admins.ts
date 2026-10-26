"use server";

/** Server Actions « Administrateurs ». */

import { refresh } from "next/cache";
import { changerSonMotDePasse, creerAdmin, definirMotDePasse, lireAdmin, modifierProfilAdmin, supprimerAdmin } from "@/lib/admins";
import { rafraichirSaSession, requireUser } from "@/lib/auth";
import { champTexte, type EtatAction } from "@/lib/formulaire";

const mdp = (fd: FormData, nom: string) => (typeof fd.get(nom) === "string" ? String(fd.get(nom)).slice(0, 200) : "");

/** Champs : `email`, `name`, `mot_de_passe`. */
export async function creerAdminAction(_prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const r = await creerAdmin({ email: champTexte(fd, "email", 254), name: champTexte(fd, "name", 80), motDePasse: mdp(fd, "mot_de_passe") });
  if (!r.ok) return { ok: false, message: r.erreur };
  refresh();
  return { ok: true, message: `Compte créé pour ${r.admin.email}.`, id: r.admin.id };
}

/** Son propre profil : `name`, `email`. */
export async function modifierSonProfilAction(_prec: EtatAction, fd: FormData): Promise<EtatAction> {
  const moi = await requireUser();
  const r = modifierProfilAdmin(moi.id, { name: champTexte(fd, "name", 80), email: champTexte(fd, "email", 254) });
  if (!r.ok) return { ok: false, message: r.erreur };
  refresh();
  return { ok: true, message: "Profil enregistré." };
}

/** Son propre mot de passe : `actuel`, `nouveau`, `confirmation`. Les autres sessions sont fermées. */
export async function changerSonMotDePasseAction(_prec: EtatAction, fd: FormData): Promise<EtatAction> {
  const moi = await requireUser();
  const nouveau = mdp(fd, "nouveau");
  if (nouveau !== mdp(fd, "confirmation")) return { ok: false, erreurs: { confirmation: "Les deux mots de passe ne sont pas identiques." } };
  const r = await changerSonMotDePasse(moi.id, mdp(fd, "actuel"), nouveau);
  if (!r.ok) return { ok: false, message: r.erreur };
  await rafraichirSaSession(moi.id, r.sessionVersion);
  return { ok: true, message: "Mot de passe changé. Vos autres appareils sont déconnectés." };
}

/** Réinitialise le mot de passe d'un AUTRE compte (`nouveau`). Ses sessions sont fermées. */
export async function reinitialiserMotDePasseAction(adminId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  const moi = await requireUser();
  if (adminId === moi.id) return { ok: false, message: "Pour votre propre compte, utilisez « Changer mon mot de passe »." };
  if (!lireAdmin(adminId)) return { ok: false, message: "Compte introuvable." };
  const r = await definirMotDePasse(adminId, mdp(fd, "nouveau"));
  if (!r.ok) return { ok: false, message: r.erreur };
  refresh();
  return { ok: true, message: "Mot de passe réinitialisé." };
}

export async function supprimerAdminAction(adminId: number): Promise<EtatAction> {
  const moi = await requireUser();
  if (adminId === moi.id) return { ok: false, message: "Vous ne pouvez pas supprimer votre propre compte." };
  const r = supprimerAdmin(adminId);
  if (!r.ok) return { ok: false, message: r.erreur };
  refresh();
  return { ok: true, message: `Compte ${r.admin.email} supprimé.` };
}
