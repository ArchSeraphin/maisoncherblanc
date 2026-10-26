"use server";

/** Server Actions « Administrateurs ». */

import { refresh } from "next/cache";
import { changerSonMotDePasse, creerAdmin, definirMotDePasse, lireAdmin, modifierProfilAdmin, supprimerAdmin, verifierMotDePasseAdmin } from "@/lib/admins";
import { rafraichirSaSession, requireUser } from "@/lib/auth";
import { champTexte, type EtatAction } from "@/lib/formulaire";
import { enregistrerCoup, estLimite, reinitialiser } from "@/lib/limiteur";
import { idsValides } from "./schemas";

const mdp = (fd: FormData, nom: string) => (typeof fd.get(nom) === "string" ? String(fd.get(nom)).slice(0, 200) : "");

const MDP_CONFIRMATION_FAUX = "Votre mot de passe est incorrect.";
/** 5 erreurs de confirmation en 15 min : pause (une session volée ne peut pas deviner le mot de passe). */
const REAUTH_MAX = 5;
const REAUTH_FENETRE_MS = 15 * 60 * 1000;

/**
 * Ré-authentification : le mot de passe de l'admin CONNECTÉ (`mon_mot_de_passe`)
 * est exigé pour les actions qui donnent un accès (créer un compte, changer le
 * mot de passe d'un autre). Une session laissée ouverte ne suffit pas.
 */
async function confirmerIdentite(moiId: number, fd: FormData): Promise<EtatAction | null> {
  const saisi = mdp(fd, "mon_mot_de_passe");
  if (!saisi) return { ok: false, message: "Confirmez avec votre mot de passe.", erreurs: { mon_mot_de_passe: "Tapez votre propre mot de passe pour confirmer." } };
  const cle = `reauth:admin:${moiId}`;
  if (estLimite(cle, REAUTH_MAX, REAUTH_FENETRE_MS))
    return { ok: false, message: "Trop d’essais. Patientez un quart d’heure avant de réessayer." };
  if (!(await verifierMotDePasseAdmin(moiId, saisi))) {
    enregistrerCoup(cle, REAUTH_FENETRE_MS);
    return { ok: false, message: MDP_CONFIRMATION_FAUX, erreurs: { mon_mot_de_passe: MDP_CONFIRMATION_FAUX } };
  }
  reinitialiser(cle);
  return null;
}

/** Champs : `email`, `name`, `mot_de_passe` (du nouveau compte), `mon_mot_de_passe` (confirmation). */
export async function creerAdminAction(_prec: EtatAction, fd: FormData): Promise<EtatAction> {
  const moi = await requireUser();
  const refus = await confirmerIdentite(moi.id, fd);
  if (refus) return refus;
  const r = await creerAdmin({ email: champTexte(fd, "email", 254), name: champTexte(fd, "name", 80), motDePasse: mdp(fd, "mot_de_passe") });
  if (!r.ok)
    return {
      ok: false,
      message: r.erreur,
      erreurs: /adresse|compte existe/i.test(r.erreur) ? { email: r.erreur } : { mot_de_passe: r.erreur },
    };
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
  if (nouveau !== mdp(fd, "confirmation"))
    return {
      ok: false,
      message: "Les deux nouveaux mots de passe sont différents.",
      erreurs: { confirmation: "Les deux mots de passe ne sont pas identiques." },
    };
  const r = await changerSonMotDePasse(moi.id, mdp(fd, "actuel"), nouveau);
  if (!r.ok) return { ok: false, message: r.erreur, erreurs: r.erreur.includes("actuel") ? { actuel: r.erreur } : { nouveau: r.erreur } };
  await rafraichirSaSession(moi.id, r.sessionVersion);
  return { ok: true, message: "Mot de passe changé. Vos autres appareils sont déconnectés." };
}

/** Réinitialise le mot de passe d'un AUTRE compte (`nouveau`, `mon_mot_de_passe`). Ses sessions sont fermées. */
export async function reinitialiserMotDePasseAction(adminId: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  const moi = await requireUser();
  const ids = idsValides(adminId);
  if (!ids || !lireAdmin(ids[0])) return { ok: false, message: "Compte introuvable." };
  if (ids[0] === moi.id) return { ok: false, message: "Pour votre propre compte, utilisez « Changer mon mot de passe »." };
  const refus = await confirmerIdentite(moi.id, fd);
  if (refus) return refus;
  const r = await definirMotDePasse(ids[0], mdp(fd, "nouveau"));
  if (!r.ok) return { ok: false, message: r.erreur, erreurs: { nouveau: r.erreur } };
  refresh();
  return { ok: true, message: "Mot de passe réinitialisé." };
}

export async function supprimerAdminAction(adminId: number): Promise<EtatAction> {
  const moi = await requireUser();
  const ids = idsValides(adminId);
  if (!ids) return { ok: false, message: "Compte introuvable." };
  if (ids[0] === moi.id) return { ok: false, message: "Vous ne pouvez pas supprimer votre propre compte." };
  const r = supprimerAdmin(ids[0]);
  if (!r.ok) return { ok: false, message: r.erreur };
  refresh();
  return { ok: true, message: `Compte ${r.admin.email} supprimé.` };
}
