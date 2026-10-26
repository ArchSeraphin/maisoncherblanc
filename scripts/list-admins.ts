/**
 * Liste les administrateurs de la base RÉELLEMENT utilisée (diagnostic : le
 * script et l'app pointent-ils sur le même fichier ?).
 *
 *   npm run list-admins
 */

import { banniere, lancer } from "./_amorce";

lancer(async () => {
  await banniere("Administrateurs");
  const { closeDb } = await import("../lib/db");
  const { listerAdmins } = await import("../lib/admins");
  const admins = listerAdmins();
  if (!admins.length) console.log("Aucun administrateur. Lancez `npm run seed` ou `npm run create-admin`.");
  for (const a of admins) console.log(`n° ${a.id}  ${a.email}  ${a.name ? `(${a.name})  ` : ""}créé le ${a.created_at}  session v${a.session_version}`);
  closeDb();
});
