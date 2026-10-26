/**
 * Amorce commune des scripts CLI : charge `.env` à la racine (source unique
 * pour l'app ET les scripts), puis affiche la base réellement utilisée.
 * En conteneur (Coolify), les variables d'environnement suffisent.
 */

import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env"), quiet: true });

export async function banniere(titre: string): Promise<void> {
  const { cheminBase, dossierUploads } = await import("../lib/env");
  console.log(`\n== ${titre} ==`);
  console.log(`Base SQLite : ${cheminBase()}`);
  console.log(`Fichiers    : ${dossierUploads()}\n`);
}

/** Lit `--nom valeur` ou `--nom=valeur`. */
export function option(nom: string): string | undefined {
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === `--${nom}`) return argv[i + 1];
    if (a.startsWith(`--${nom}=`)) return a.slice(nom.length + 3);
  }
  return undefined;
}

export function drapeau(nom: string): boolean {
  return process.argv.slice(2).includes(`--${nom}`);
}

/** Arguments positionnels (hors options). */
export function positionnels(): string[] {
  const out: string[] = [];
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      if (!argv[i].includes("=") && argv[i + 1] && !argv[i + 1].startsWith("--")) i++;
      continue;
    }
    out.push(argv[i]);
  }
  return out;
}

export function lancer(principal: () => Promise<void>): void {
  principal().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
