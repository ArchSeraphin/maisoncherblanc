"use server";

/** Connexion et déconnexion du backoffice. */

import { redirect } from "next/navigation";
import { connecter, deconnecter } from "@/lib/auth";
import { lienAdmin } from "@/lib/chemin-admin";
import { champTexte, type EtatAction } from "@/lib/formulaire";

export async function actionConnexion(_prec: EtatAction, fd: FormData): Promise<EtatAction> {
  const email = champTexte(fd, "email", 254);
  const mdp = typeof fd.get("mot_de_passe") === "string" ? String(fd.get("mot_de_passe")) : "";
  const r = await connecter(email, mdp);
  if (!r.ok) return { ok: false, message: r.erreur, valeurs: { email } };
  redirect(lienAdmin());
}

export async function actionDeconnexion(): Promise<void> {
  await deconnecter();
  redirect(lienAdmin("/connexion"));
}
