"use server";

/**
 * Formulaire de contact PUBLIC (Server Action) : devis traiteur, commande
 * boucherie, autre question. Le lot « pages publiques » construit le formulaire.
 *
 * Champs attendus : `type` (devis-traiteur | commande-boucherie | autre),
 * `prenom`, `nom`, `email`, `telephone`, `date_evenement` (AAAA-MM-JJ),
 * `nb_personnes`, `message`, `jeton` (champ caché : `emettreJeton(USAGE_CONTACT)`
 * rendu par la page) et le champ piège `site_web` (masqué, doit rester vide).
 *
 * Anti-spam sans service tiers : champ piège + jeton signé à usage unique
 * (lib/jeton-formulaire.ts, refusé s'il a moins de 3 s ou plus de 24 h) + refus
 * des liens + limites de débit par adresse (5 / 15 min, 1 au-delà de 60 envois
 * au global, refus pour tous au-delà de 300).
 * Retour : `message` = "envoye" | "verifier" (jeton à renouveler, renvoyé dans
 * `valeurs.jeton`) | "limite" | "erreur", ou `erreurs` par champ + `valeurs`.
 * Notification e-mail envoyée APRÈS la réponse (`after`).
 */

import { after } from "next/server";
import { adresseClient } from "@/lib/auth";
import { champTexte, type EtatAction } from "@/lib/formulaire";
import { consommerJeton, emettreJeton, USAGE_CONTACT, verifierJeton } from "@/lib/jeton-formulaire";
import { enregistrerCoup, estLimite, groupeClient, statistiques } from "@/lib/limiteur";
import { notifierNouveauMessage } from "@/lib/mail";
import { creerMessage, LIMITES_MESSAGE, TYPES_MESSAGE, validerMessage } from "@/lib/messages";

const FENETRE = 15 * 60 * 1000;
const MAX_PAR_IP = 5;
const SEUIL_CHARGE = 60;
const MAX_PAR_IP_EN_CHARGE = 1;
const PLAFOND_GLOBAL = 300;
const CLE_GLOBALE = "contact:global";
const RE_LIEN = /https?:\/\/|www\.|\[url|<a\s/i;

export async function envoyerMessageAction(_prec: EtatAction, fd: FormData): Promise<EtatAction> {
  // Champ piège rempli = robot : succès simulé, rien n'est enregistré.
  if (champTexte(fd, "site_web", 200)) return { ok: true, message: "envoye" };

  const typeBrut = champTexte(fd, "type", 40);
  const valeurs: Record<string, string> = {
    type: (TYPES_MESSAGE as readonly string[]).includes(typeBrut) ? typeBrut : "autre",
    prenom: champTexte(fd, "prenom", LIMITES_MESSAGE.prenom),
    nom: champTexte(fd, "nom", LIMITES_MESSAGE.nom),
    email: champTexte(fd, "email", LIMITES_MESSAGE.email),
    telephone: champTexte(fd, "telephone", LIMITES_MESSAGE.telephone),
    date_evenement: champTexte(fd, "date_evenement", 10),
    nb_personnes: champTexte(fd, "nb_personnes", 6),
    message: champTexte(fd, "message", LIMITES_MESSAGE.message),
    jeton: champTexte(fd, "jeton", 200),
  };

  const verdict = verifierJeton(USAGE_CONTACT, valeurs.jeton);
  if (verdict !== "ok") {
    const neuf = verdict === "too-early" ? valeurs.jeton : emettreJeton(USAGE_CONTACT);
    return { ok: false, message: "verifier", valeurs: { ...valeurs, jeton: neuf } };
  }

  const ip = await adresseClient();
  const cleIp = ip ? `contact:ip:${groupeClient(ip)}` : null;
  const total = statistiques(CLE_GLOBALE, FENETRE).count;
  const parIp = total >= SEUIL_CHARGE ? MAX_PAR_IP_EN_CHARGE : MAX_PAR_IP;
  if (total >= PLAFOND_GLOBAL || (cleIp && estLimite(cleIp, parIp, FENETRE))) return { ok: false, message: "limite", valeurs };

  const v = validerMessage(valeurs);
  const erreurs: Record<string, string> = v.ok ? {} : (v.erreurs as Record<string, string>);
  if (RE_LIEN.test(valeurs.message)) erreurs.message = "Merci de ne pas mettre de lien dans le message.";
  if (!v.ok || Object.keys(erreurs).length) return { ok: false, erreurs, valeurs };

  try {
    const r = consommerJeton(USAGE_CONTACT, valeurs.jeton, () => creerMessage(v.donnees));
    if (r.spent) {
      if (cleIp) enregistrerCoup(cleIp, FENETRE);
      enregistrerCoup(CLE_GLOBALE, FENETRE);
      const m = r.value;
      after(() => notifierNouveauMessage(m));
    }
    return { ok: true, message: "envoye" };
  } catch (err) {
    console.error("[contact] enregistrement impossible :", err);
    return { ok: false, message: "erreur", valeurs };
  }
}
