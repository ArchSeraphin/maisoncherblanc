"use server";

/** Server Actions « Messages » du BO (lecture, suppression, droit à l'effacement). */

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { champTexte, type EtatAction } from "@/lib/formulaire";
import { estEmailValide, lireMessage, marquerMessageLu, supprimerMessage, supprimerMessagesParEmail } from "@/lib/messages";
import { booleen, idsValides } from "./schemas";

function message(id: unknown) {
  const ids = idsValides(id);
  return ids ? lireMessage(ids[0]) : null;
}

export async function marquerLuAction(id: number, lu: boolean): Promise<EtatAction> {
  await requireUser();
  const m = message(id);
  const v = booleen(lu);
  if (!m || v === null) return { ok: false, message: "Message introuvable." };
  marquerMessageLu(m.id, v);
  refresh();
  return { ok: true, message: v ? "Marqué comme lu." : "Marqué comme non lu." };
}

export async function supprimerMessageAction(id: number): Promise<EtatAction> {
  await requireUser();
  const m = message(id);
  if (!m || !supprimerMessage(m.id)) return { ok: false, message: "Message introuvable." };
  refresh();
  return { ok: true, message: "Message supprimé." };
}

/** Droit à l'effacement : champ `email` (adresse exacte). */
export async function supprimerMessagesParEmailAction(_prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const email = champTexte(fd, "email", 254).toLowerCase();
  if (!estEmailValide(email)) return { ok: false, erreurs: { email: "Adresse e-mail invalide." } };
  const n = supprimerMessagesParEmail(email).length;
  refresh();
  return { ok: true, message: n ? `${n} message${n > 1 ? "s" : ""} de ${email} supprimé${n > 1 ? "s" : ""}.` : "Aucun message pour cette adresse." };
}
