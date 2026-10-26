/**
 * Crée un administrateur, ou réinitialise son mot de passe.
 *
 *   npm run create-admin -- --email prenom@exemple.fr --name "Prénom" [--mot-de-passe "..."]
 *   npm run create-admin -- --email prenom@exemple.fr --reinitialiser [--mot-de-passe "..."]
 *
 * Sans --mot-de-passe, un mot de passe aléatoire est généré et affiché une fois.
 * La réinitialisation ferme toutes les sessions ouvertes du compte.
 */

import crypto from "node:crypto";
import { banniere, drapeau, lancer, option } from "./_amorce";

lancer(async () => {
  await banniere("Administrateur");
  const { closeDb } = await import("../lib/db");
  const { creerAdmin, definirMotDePasse, lireAdminParEmail } = await import("../lib/admins");
  const email = option("email")?.trim().toLowerCase();
  if (!email) throw new Error("Option --email obligatoire.");
  const genere = !option("mot-de-passe");
  const motDePasse = option("mot-de-passe") ?? crypto.randomBytes(18).toString("base64url");
  const existant = lireAdminParEmail(email);
  if (existant) {
    if (!drapeau("reinitialiser")) throw new Error(`${email} existe déjà. Ajoutez --reinitialiser pour changer son mot de passe.`);
    const r = await definirMotDePasse(existant.id, motDePasse);
    if (!r.ok) throw new Error(r.erreur);
    console.log(`Mot de passe de ${email} réinitialisé (sessions fermées).`);
  } else {
    const r = await creerAdmin({ email, name: option("name") ?? "", motDePasse });
    if (!r.ok) throw new Error(r.erreur);
    console.log(`Administrateur ${email} créé (n° ${r.admin.id}).`);
  }
  if (genere) console.log(`Mot de passe généré : ${motDePasse}`);
  closeDb();
});
