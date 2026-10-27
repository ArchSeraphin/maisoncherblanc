import fs from "node:fs";
import { photoVolet, rendreCartePartage, TAILLE_PARTAGE } from "@/components/site/carte-partage";
import { siteConfig } from "@/config/site";
import { imageEmplacement } from "@/lib/emplacements";
import { dossierUploads } from "@/lib/env";
import { jointureSure } from "@/lib/media";

/**
 * Image de partage par défaut (/opengraph-image, JPEG 1200 x 630), servie par
 * `construireMetadata()` quand une page ne fournit pas sa propre image.
 *
 * Fond olive, monogramme or, « Maison Cherblanc » en Fraunces, signature en
 * DM Sans capitales (components/site/carte-partage.tsx). Si l'emplacement
 * `og-defaut` (BO « Photos des pages ») a une photo, elle occupe le volet
 * gauche ; sinon (choix par défaut depuis le 26/10/2026) la composition est
 * centrée, sans photo. Dynamique : reflète le choix fait dans le backoffice
 * (cache 1 h).
 */

export const dynamic = "force-dynamic";
export const alt = siteConfig.imagePartageParDefaut.alt;
export const size = TAILLE_PARTAGE;
export const contentType = "image/jpeg";

/** Photo `og-defaut` (fichier original de la médiathèque), ou `null`. */
async function photoOgDefaut(): Promise<string | null> {
  const img = imageEmplacement("og-defaut");
  const source = img?.variantes.original ?? img?.variantes.sources.at(-1);
  if (!source) return null;
  const abs = jointureSure(dossierUploads(), source.chemin);
  if (!abs || !fs.existsSync(abs)) return null;
  return photoVolet(abs);
}

export default async function Image() {
  return rendreCartePartage({
    titre: "Maison",
    accent: "Cherblanc",
    signature: "Boucherie · Charcuterie · Traiteur · Roanne",
    photo: await photoOgDefaut(),
  });
}
