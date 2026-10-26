/**
 * Purge manuelle des données personnelles (la maintenance le fait déjà chaque jour).
 *
 *   npm run purge-messages                       (messages de plus de 12 mois)
 *   npm run purge-messages -- --mois 6           (autre durée)
 *   npm run purge-messages -- --email x@y.fr     (droit à l'effacement : tous les messages de cette adresse)
 */

import { banniere, lancer, option } from "./_amorce";

lancer(async () => {
  await banniere("Purge des messages");
  const { closeDb } = await import("../lib/db");
  const { purgerMessagesAnciens, supprimerMessagesParEmail, estEmailValide } = await import("../lib/messages");
  const email = option("email");
  if (email) {
    if (!estEmailValide(email.trim().toLowerCase())) throw new Error("Adresse e-mail invalide.");
    console.log(`${supprimerMessagesParEmail(email.trim().toLowerCase()).length} message(s) supprimé(s) pour ${email}.`);
  } else {
    const mois = option("mois") ? Number(option("mois")) : undefined;
    if (mois !== undefined && (!Number.isInteger(mois) || mois < 1)) throw new Error("--mois doit être un entier positif.");
    console.log(`${purgerMessagesAnciens(mois)} message(s) de plus de ${mois ?? 12} mois supprimé(s).`);
  }
  closeDb();
});
