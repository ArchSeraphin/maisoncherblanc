/**
 * Notification e-mail des messages du formulaire, par l'API transactionnelle
 * Brevo (HTTPS, aucune dépendance). Le message est D'ABORD enregistré en base :
 * un envoi raté (clé absente, Brevo indisponible) ne fait rien perdre.
 *
 * Variables (lues à l'appel) : `BREVO_API_KEY` (absente = aucun e-mail),
 * `CONTACT_EMAIL` (destinataire(s), virgules), `MAIL_FROM` (expéditeur validé
 * dans Brevo). « Répondre » écrit directement au visiteur (Reply-To).
 */

import "server-only";
import { formaterHorodatage, formaterJourLong } from "./dates";
import { emailContact, emailExpediteur } from "./env";
import { estEmailValide, LIBELLES_TYPES_MESSAGE, type Message } from "./messages";
import { siteConfig } from "@/config/site";

const URL_BREVO = "https://api.brevo.com/v3/smtp/email";
const DELAI_MS = 10_000;

function uneLigne(s: string, max = 150): string {
  return s.replace(/[\x00-\x1f\x7f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function echapper(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function destinataires(): { email: string }[] {
  return emailContact()
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(estEmailValide)
    .map((email) => ({ email }));
}

/** Contenu de l'e-mail (pur, exporté pour les vérifications). */
export function construireEmailMessage(m: Message): { sujet: string; texte: string; html: string } {
  const nom = uneLigne(`${m.prenom} ${m.nom}`, 170);
  const type = LIBELLES_TYPES_MESSAGE[m.type];
  const details = [
    `Type : ${type}`,
    m.telephone ? `Téléphone : ${m.telephone}` : null,
    m.date_evenement ? `Date de l’événement : ${formaterJourLong(m.date_evenement)}` : null,
    m.nb_personnes ? `Nombre de personnes : ${m.nb_personnes}` : null,
    `Reçu le : ${formaterHorodatage(m.created_at)}`,
  ].filter((x): x is string => !!x);
  const pied = `Pour répondre, utilisez « Répondre » : la réponse part directement à ${m.email}.\nLe message est aussi conservé ${siteConfig.confidentialite.conservationMessagesMois} mois dans le backoffice.`;
  const sujet = `Site ${siteConfig.nom} : ${type} (${nom})`;
  const texte = ["Nouveau message reçu par le formulaire du site.", "", `De : ${nom} <${m.email}>`, ...details, "", m.message, "", "--", pied].join("\n");
  const nl2br = (s: string) => echapper(s).replace(/\r?\n/g, "<br>");
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#2A2B24">
<p>Nouveau message reçu par le formulaire du site.</p>
<p><strong>De :</strong> ${echapper(nom)} &lt;${echapper(m.email)}&gt;<br>${details.map((d) => echapper(d)).join("<br>")}</p>
<p style="padding:12px 16px;background:#F3EBDC;border-left:3px solid #A3702A">${nl2br(m.message)}</p>
<p style="font-size:13px;color:#3F4530">${nl2br(pied)}</p>
</div>`;
  return { sujet, texte, html };
}

/** Envoie la notification d'un message enregistré. Ne lève jamais : journalise l'échec. */
export async function notifierNouveauMessage(m: Message): Promise<void> {
  const cle = process.env.BREVO_API_KEY?.trim();
  if (!cle) return;
  const a = destinataires();
  const de = emailExpediteur().toLowerCase();
  if (!a.length || !estEmailValide(de)) {
    console.error("[mail] CONTACT_EMAIL ou MAIL_FROM invalide : notification non envoyée (message #%d).", m.id);
    return;
  }
  const { sujet, texte, html } = construireEmailMessage(m);
  try {
    const res = await fetch(URL_BREVO, {
      method: "POST",
      headers: { "api-key": cle, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { email: de, name: `Site ${siteConfig.nom}` },
        to: a,
        replyTo: { email: m.email, name: uneLigne(`${m.prenom} ${m.nom}`, 170) },
        subject: sujet,
        textContent: texte,
        htmlContent: html,
        tags: ["contact", m.type],
      }),
      signal: AbortSignal.timeout(DELAI_MS),
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      console.error("[mail] Brevo a refusé la notification du message #%d : HTTP %d %s", m.id, res.status, detail);
    }
  } catch (err) {
    console.error("[mail] envoi Brevo impossible pour le message #%d :", m.id, err);
  }
}
