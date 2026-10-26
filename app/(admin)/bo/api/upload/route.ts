/**
 * Envoi de fichiers du backoffice : POST /${ADMIN_PATH}/api/upload (multipart/form-data).
 *
 * Route Handler (et non Server Action) : contourne la limite de 2 Mo des
 * Server Actions et permet une progression par fichier (XHR + upload.onprogress,
 * un fichier par requête recommandé).
 *
 * Champs :
 * - `file` (1 à 30) : images (JPEG, PNG, WebP, AVIF, GIF) ou PDF selon l'usage, 25 Mo max chacun ;
 * - `usage` : "media" (défaut, médiathèque seule) | "realisation" (crée une réalisation :
 *   `categorie`, `legende`) | "emplacement" (`cle` : remplace la photo d'un emplacement)
 *   | "menu-pdf" (`menu_id` : remplace le PDF du menu) | "menu-couverture" (`menu_id`) ;
 * - `alt` : texte alternatif ; `provisoire` = "1" pour un visuel à remplacer.
 *
 * Réponse : { ok, items: [{ nom, ok, mediaId?, statut?, realisationId?, erreur? }] }.
 * Images traitées en arrière-plan : suivre `statut` via GET /${ADMIN_PATH}/api/media/<id>.
 * Sécurité : `lireUtilisateur()` + 401 (jamais de redirection d'un fetch), contrôle d'origine.
 */

import { lireUtilisateur } from "@/lib/auth";
import { definirEmplacement, estCleEmplacement, lireIdsEmplacements } from "@/lib/emplacements";
import { memeOrigine } from "@/lib/http";
import { supprimerMediaEtFichiers, supprimerMediaSiOrphelin } from "@/lib/media";
import { enregistrerFichier } from "@/lib/media-pipeline";
import { definirCouvertureMenu, definirPdfMenu, lireMenu } from "@/lib/menus";
import { creerRealisation, estCategorieRealisation } from "@/lib/realisations";

export const dynamic = "force-dynamic";

const USAGES = ["media", "realisation", "emplacement", "menu-pdf", "menu-couverture"] as const;
type Usage = (typeof USAGES)[number];

type Resultat = { nom: string; ok: boolean; mediaId?: number; statut?: string; realisationId?: number; erreur?: string };

const json = (corps: unknown, status = 200) => Response.json(corps, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  if (!(await lireUtilisateur())) return json({ ok: false, erreur: "Non connecté." }, 401);
  if (!memeOrigine(req)) return json({ ok: false, erreur: "Origine refusée." }, 403);

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return json({ ok: false, erreur: "Requête invalide." }, 400);
  }

  const usage = String(fd.get("usage") ?? "media") as Usage;
  if (!USAGES.includes(usage)) return json({ ok: false, erreur: "Usage inconnu." }, 400);
  const alt = String(fd.get("alt") ?? "").slice(0, 300);
  const legende = String(fd.get("legende") ?? "").slice(0, 300);
  const categorieBrute = String(fd.get("categorie") ?? "buffet");
  const categorie = estCategorieRealisation(categorieBrute) ? categorieBrute : "buffet";
  const provisoire = fd.get("provisoire") === "1";
  const cle = String(fd.get("cle") ?? "");
  const menuId = Number(fd.get("menu_id"));

  if (usage === "emplacement" && !estCleEmplacement(cle)) return json({ ok: false, erreur: "Emplacement inconnu." }, 400);
  if ((usage === "menu-pdf" || usage === "menu-couverture") && !(Number.isInteger(menuId) && lireMenu(menuId)))
    return json({ ok: false, erreur: "Menu introuvable." }, 404);

  const fichiers = fd.getAll("file").filter((f): f is File => f instanceof File);
  if (!fichiers.length) return json({ ok: false, erreur: "Aucun fichier reçu." }, 400);
  if (fichiers.length > 30) return json({ ok: false, erreur: "30 fichiers au maximum par envoi." }, 400);
  if (usage !== "media" && usage !== "realisation" && fichiers.length > 1) return json({ ok: false, erreur: "Un seul fichier pour cet usage." }, 400);

  const items: Resultat[] = [];
  for (const f of fichiers) {
    const r = await enregistrerFichier({
      buffer: Buffer.from(await f.arrayBuffer()),
      nomOriginal: f.name || "fichier",
      alt,
      provisoire,
      accepte: usage === "menu-pdf" ? ["pdf"] : ["image"],
    });
    if (!r.ok) {
      items.push({ nom: f.name, ok: false, erreur: r.erreur });
      continue;
    }
    const item: Resultat = { nom: f.name, ok: true, mediaId: r.media.id, statut: r.media.statut };
    try {
      if (usage === "realisation") {
        item.realisationId = creerRealisation({ media_id: r.media.id, legende, categorie }).id;
      } else if (usage === "emplacement" && estCleEmplacement(cle)) {
        const ancien = lireIdsEmplacements()[cle];
        definirEmplacement(cle, r.media.id);
        if (ancien && ancien !== r.media.id) supprimerMediaSiOrphelin(ancien);
      } else if (usage === "menu-pdf") {
        supprimerMediaSiOrphelin(definirPdfMenu(menuId, r.media.id));
      } else if (usage === "menu-couverture") {
        supprimerMediaSiOrphelin(definirCouvertureMenu(menuId, r.media.id));
      }
    } catch (err) {
      console.error("[upload] rattachement impossible :", err);
      supprimerMediaEtFichiers(r.media.id);
      items.push({ nom: f.name, ok: false, erreur: "Enregistrement impossible. Réessayez." });
      continue;
    }
    items.push(item);
  }
  return json({ ok: items.every((i) => i.ok), items });
}
