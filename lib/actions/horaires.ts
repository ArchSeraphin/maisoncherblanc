"use server";

/** Server Actions « Horaires » : semaine type, horaires exceptionnels, bandeau d'annonce. */

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { formaterJourLong, jourParis } from "@/lib/dates";
import { champBooleen, champJson, champTexte, type EtatAction } from "@/lib/formulaire";
import {
  enregistrerHoraireExceptionnel,
  lireHoraireExceptionnel,
  lireHoraireExceptionnelParDate,
  modifierHoraireExceptionnel,
  supprimerHoraireExceptionnel,
  validerHoraireExceptionnel,
} from "@/lib/horaires-exceptionnels";
import { ecrireReglage, validerAnnonce, validerHoraires } from "@/lib/reglages";
import { idsValides } from "./schemas";

function horaire(id: unknown) {
  const ids = idsValides(id);
  return ids ? lireHoraireExceptionnel(ids[0]) : null;
}

/** Semaine type : champ caché `horaires` = JSON { lundi: [{ouverture, fermeture}], ... }. */
export async function enregistrerHorairesAction(_prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const v = validerHoraires(champJson<unknown>(fd, "horaires", {}));
  if (!v.ok) return { ok: false, message: "Certains horaires sont à corriger (voir en rouge).", erreurs: v.erreurs as Record<string, string> };
  ecrireReglage("horaires", v.donnees);
  refresh();
  return { ok: true, message: "Horaires enregistrés." };
}

/**
 * Champs : `date` (AAAA-MM-JJ), `mode` = "ferme" | "horaires" | "note", `plages`
 * (JSON, mode horaires), `libelle`, `note`.
 */
function lireChampsExceptionnel(fd: FormData) {
  return {
    date: champTexte(fd, "date", 10),
    mode: champTexte(fd, "mode", 10),
    plages: champJson<unknown>(fd, "plages", []),
    libelle: champTexte(fd, "libelle", 200),
    note: champTexte(fd, "note", 400),
  };
}

export async function creerHoraireExceptionnelAction(_prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const v = validerHoraireExceptionnel(lireChampsExceptionnel(fd));
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string> };
  if (lireHoraireExceptionnelParDate(v.donnees.date))
    return { ok: false, erreurs: { date: "Cette date a déjà un horaire exceptionnel : modifiez-le dans la liste." } };
  const h = enregistrerHoraireExceptionnel(v.donnees);
  refresh();
  return { ok: true, message: h.plages && h.plages.length === 0 ? "Fermeture ajoutée." : "Date ajoutée.", id: h.id };
}

export async function modifierHoraireExceptionnelAction(id: number, _prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const cur = horaire(id);
  if (!cur) return { ok: false, message: "Date introuvable." };
  const v = validerHoraireExceptionnel(lireChampsExceptionnel(fd));
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string> };
  try {
    modifierHoraireExceptionnel(cur.id, v.donnees);
  } catch (err) {
    return { ok: false, erreurs: { date: err instanceof Error ? err.message : "Date invalide." } };
  }
  refresh();
  return { ok: true, message: "Date enregistrée." };
}

export async function supprimerHoraireExceptionnelAction(id: number): Promise<EtatAction> {
  await requireUser();
  const cur = horaire(id);
  if (!cur || !supprimerHoraireExceptionnel(cur.id)) return { ok: false, message: "Date introuvable." };
  refresh();
  return { ok: true, message: "Date supprimée." };
}

/** Bandeau d'annonce : `active` (case), `texte`, `lien`, `debut`, `fin` (dates optionnelles). */
export async function enregistrerAnnonceAction(_prec: EtatAction, fd: FormData): Promise<EtatAction> {
  await requireUser();
  const v = validerAnnonce({
    active: champBooleen(fd, "active"),
    texte: champTexte(fd, "texte", 400),
    lien: champTexte(fd, "lien", 400),
    debut: champTexte(fd, "debut", 10),
    fin: champTexte(fd, "fin", 10),
  });
  if (!v.ok) return { ok: false, erreurs: v.erreurs as Record<string, string> };
  ecrireReglage("annonce", v.donnees);
  refresh();
  return { ok: true, message: messageAnnonce(v.donnees) };
}

/** Message fidèle à l'état réel du bandeau après l'enregistrement (affiché, programmé, terminé, désactivé). */
function messageAnnonce(a: { active: boolean; texte: string; debut: string | null; fin: string | null }): string {
  const jour = jourParis();
  if (!a.active) return "Annonce enregistrée. Le bandeau est désactivé : rien ne s’affiche sur le site.";
  if (a.debut && jour < a.debut) return `Annonce enregistrée et programmée : elle s’affichera à partir du ${formaterJourLong(a.debut)}.`;
  if (a.fin && jour > a.fin)
    return `Annonce enregistrée, mais elle n’est pas affichée : sa date de fin (${formaterJourLong(a.fin)}) est passée.`;
  return "Annonce enregistrée et affichée sur le site.";
}
