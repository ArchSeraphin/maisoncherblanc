"use server";

/**
 * Fiche mariage PUBLIQUE (Server Action), envoyée depuis
 * /traiteur-roanne/mariage/fiche (components/site/fiche-mariage.tsx).
 *
 * Champs attendus : `fiche` (JSON d'une Fiche, lib/fiche-mariage.ts), `jeton`
 * (champ caché : `emettreJeton(USAGE_FICHE_MARIAGE)` rendu par la page) et le
 * champ piège `site_web` (masqué, doit rester vide).
 *
 * Même anti-spam que le formulaire de contact (lib/actions/contact.ts) : champ
 * piège, jeton signé à usage unique, refus des liens, limites de débit par
 * adresse (3 fiches / 15 min, 1 au-delà de 30 envois au global, refus pour tous
 * au-delà de 150).
 * Enregistrement : un message `devis-traiteur` (récapitulatif en texte dans
 * `message`, fiche en JSON dans `details`), notifié par e-mail APRÈS la réponse.
 * Retour : `message` = "envoye" | "verifier" (jeton renouvelé dans
 * `valeurs.jeton`) | "limite" | "erreur", ou `erreurs` par champ.
 */

import { after } from "next/server";
import { adresseClient } from "@/lib/auth";
import { jourParis } from "@/lib/dates";
import { detailsFiche, texteFiche, validerFiche } from "@/lib/fiche-mariage";
import { champJson, champTexte, type EtatAction } from "@/lib/formulaire";
import { consommerJeton, emettreJeton, USAGE_FICHE_MARIAGE, verifierJeton } from "@/lib/jeton-formulaire";
import { enregistrerCoup, estLimite, groupeClient, statistiques } from "@/lib/limiteur";
import { notifierNouveauMessage } from "@/lib/mail";
import { creerMessage } from "@/lib/messages";

const FENETRE = 15 * 60 * 1000;
const MAX_PAR_IP = 3;
const SEUIL_CHARGE = 30;
const MAX_PAR_IP_EN_CHARGE = 1;
const PLAFOND_GLOBAL = 150;
const CLE_GLOBALE = "fiche-mariage:global";

export async function envoyerFicheMariageAction(_prec: EtatAction, fd: FormData): Promise<EtatAction> {
  // Champ piège rempli = robot : succès simulé, rien n'est enregistré.
  if (champTexte(fd, "site_web", 200)) return { ok: true, message: "envoye" };

  const jeton = champTexte(fd, "jeton", 200);
  const verdict = verifierJeton(USAGE_FICHE_MARIAGE, jeton);
  if (verdict !== "ok") {
    const neuf = verdict === "too-early" ? jeton : emettreJeton(USAGE_FICHE_MARIAGE);
    return { ok: false, message: "verifier", valeurs: { jeton: neuf } };
  }

  const ip = await adresseClient();
  const cleIp = ip ? `fiche-mariage:ip:${groupeClient(ip)}` : null;
  const total = statistiques(CLE_GLOBALE, FENETRE).count;
  const parIp = total >= SEUIL_CHARGE ? MAX_PAR_IP_EN_CHARGE : MAX_PAR_IP;
  if (total >= PLAFOND_GLOBAL || (cleIp && estLimite(cleIp, parIp, FENETRE))) return { ok: false, message: "limite", valeurs: { jeton } };

  const v = validerFiche(champJson<unknown>(fd, "fiche", {}, 60_000), jourParis());
  if (!v.ok) return { ok: false, erreurs: v.erreurs, valeurs: { jeton } };
  const f = v.fiche;

  try {
    const r = consommerJeton(USAGE_FICHE_MARIAGE, jeton, () =>
      creerMessage({
        type: "devis-traiteur",
        prenom: f.prenom,
        nom: f.nom,
        email: f.email,
        telephone: f.telephone,
        date_evenement: f.date,
        nb_personnes: Number(f.convives),
        message: texteFiche(f),
        details: detailsFiche(f),
      }),
    );
    if (r.spent) {
      if (cleIp) enregistrerCoup(cleIp, FENETRE);
      enregistrerCoup(CLE_GLOBALE, FENETRE);
      const m = r.value;
      after(() => notifierNouveauMessage(m));
    }
    return { ok: true, message: "envoye" };
  } catch (err) {
    console.error("[fiche-mariage] enregistrement impossible :", err);
    return { ok: false, message: "erreur", valeurs: { jeton } };
  }
}
