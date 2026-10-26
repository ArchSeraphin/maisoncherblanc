/**
 * Pipeline médias : réception d'un fichier, file d'attente, worker sharp.
 *
 * - L'envoi écrit le brut dans `UPLOADS_DIR/tmp/` (jamais servi), crée un média
 *   `pending` + un job, et répond IMMÉDIATEMENT.
 * - Un worker en process, SÉQUENTIEL (un job à la fois, sûr pour la RAM), draine
 *   la file : orientation EXIF appliquée, métadonnées retirées, variantes WebP
 *   480/960/1600/2400 (bornées à la taille source) et un original ré-encodé
 *   plafonné à 3000 px. Le brut est ensuite supprimé.
 * - Résilience : jobs bloqués remis en attente au démarrage (instrumentation.ts)
 *   et à l'ouverture des pages BO concernées (`reprendreTraitements()`).
 * - Les PDF (cartes, menus) sont stockés tels quels après vérification de signature.
 * - SVG et TIFF refusés : jamais de format actif ni de décodeur exotique.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { dossierUploads } from "./env";
import {
  creerMediaDocument,
  creerMediaEnAttente,
  definirStatutMedia,
  echouerJob,
  jointureSure,
  lireMedia,
  marquerMediaPret,
  reprendreJobsBloques,
  reserverProchainJob,
  terminerJob,
  type Job,
  type Media,
} from "./media";
import { LARGEURS_MEDIA, type VarianteImage, type VariantesMedia } from "./media-url";

/**
 * Poids maximal par fichier : 25 Mo. Cohérent avec `proxyClientMaxBodySize`
 * (26 Mo, next.config.ts) et `MAX_CORPS_UPLOAD` (server.js).
 */
export const POIDS_MAX_UPLOAD = 25 * 1024 * 1024;
const BORD_MAX_ORIGINAL = 3000;
/** Garde-fou contre les bombes de décompression. */
const PIXELS_MAX = 50_000_000;

sharp.cache(false);
sharp.concurrency(2);

export type TypeDetecte =
  | { genre: "image"; mime: string; ext: string }
  | { genre: "pdf"; mime: "application/pdf"; ext: "pdf" };

/** Type réel par signature binaire (l'extension et le MIME du client ne font pas foi). */
export function detecterType(buf: Buffer): TypeDetecte | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { genre: "image", mime: "image/jpeg", ext: "jpg" };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return { genre: "image", mime: "image/png", ext: "png" };
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP")
    return { genre: "image", mime: "image/webp", ext: "webp" };
  if (buf.toString("ascii", 0, 4) === "GIF8") return { genre: "image", mime: "image/gif", ext: "gif" };
  if (buf.toString("ascii", 4, 8) === "ftyp") {
    const marque = buf.toString("ascii", 8, 12);
    if (marque === "avif" || marque === "avis") return { genre: "image", mime: "image/avif", ext: "avif" };
  }
  if (buf.toString("ascii", 0, 5) === "%PDF-") return { genre: "pdf", mime: "application/pdf", ext: "pdf" };
  return null;
}

/** Nom de fichier sûr (ASCII, sans chemin ni extension). */
export function nomFichierSur(nom: string, secours = "fichier"): string {
  const base = path.basename(nom).replace(/\.[^.]+$/, "");
  const propre = base
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return propre || secours;
}

export type ResultatEnvoi = { ok: true; media: Media } | { ok: false; erreur: string };

/**
 * Enregistre un fichier. Image : média `pending` + job, puis le worker est
 * relancé. PDF : stocké et prêt immédiatement (type `document`).
 * `accepte` restreint les genres admis (ex. ["pdf"] pour le PDF d'un menu).
 * `source` : clé d'import unique (seed), `provisoire` : visuel IA à remplacer.
 */
export async function enregistrerFichier(entree: {
  buffer: Buffer;
  nomOriginal: string;
  alt?: string;
  accepte?: Array<"image" | "pdf">;
  provisoire?: boolean;
  source?: string | null;
}): Promise<ResultatEnvoi> {
  const { buffer, nomOriginal } = entree;
  const accepte = entree.accepte ?? ["image"];
  if (buffer.length === 0) return { ok: false, erreur: "Fichier vide." };
  if (buffer.length > POIDS_MAX_UPLOAD)
    return { ok: false, erreur: `Fichier trop lourd (${POIDS_MAX_UPLOAD / 1024 / 1024} Mo maximum).` };
  const type = detecterType(buffer);
  if (!type || !accepte.includes(type.genre)) {
    return {
      ok: false,
      erreur: accepte.includes("pdf") && !accepte.includes("image") ? "Ce fichier n’est pas un PDF." : "Format non pris en charge (JPEG, PNG, WebP, AVIF ou GIF).",
    };
  }

  const racine = dossierUploads();

  if (type.genre === "pdf") {
    const nomFichier = `${nomFichierSur(nomOriginal, "document")}.pdf`;
    const tmpAbs = jointureSure(racine, `tmp/${crypto.randomUUID()}.pdf`)!;
    try {
      fs.mkdirSync(path.dirname(tmpAbs), { recursive: true });
      fs.writeFileSync(tmpAbs, buffer);
      const media = creerMediaDocument({
        nom_original: nomOriginal,
        mime: type.mime,
        poids: buffer.length,
        alt: entree.alt,
        source: entree.source,
        construireChemin: (id) => `${id}/${nomFichier}`,
        placer: (rel) => {
          const dest = jointureSure(racine, rel);
          if (!dest) throw new Error("Chemin de destination invalide.");
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.renameSync(tmpAbs, dest);
        },
      });
      return { ok: true, media };
    } catch (err) {
      fs.rmSync(tmpAbs, { force: true });
      console.error("[media] enregistrement du PDF impossible :", err);
      return { ok: false, erreur: "Enregistrement du fichier impossible. Réessayez." };
    }
  }

  const brutRel = `tmp/${crypto.randomUUID()}.${type.ext}`;
  const brutAbs = jointureSure(racine, brutRel)!;
  let media: Media;
  try {
    fs.mkdirSync(path.dirname(brutAbs), { recursive: true });
    fs.writeFileSync(brutAbs, buffer);
    media = creerMediaEnAttente({
      nom_original: nomOriginal,
      mime: type.mime,
      poids: buffer.length,
      alt: entree.alt,
      provisoire: entree.provisoire,
      source: entree.source,
      chemin_brut: brutRel,
    }).media;
  } catch (err) {
    fs.rmSync(brutAbs, { force: true });
    console.error("[media] enregistrement de l'image impossible :", err);
    return { ok: false, erreur: "Enregistrement du fichier impossible. Réessayez." };
  }
  relancerWorker();
  return { ok: true, media };
}

// ---------------------------------------------------------------------------
// Traitement d'une image
// ---------------------------------------------------------------------------

/** Génère les variantes + l'original. Chemins renvoyés relatifs à UPLOADS_DIR. */
export async function traiterImage(brutAbs: string, mediaId: number): Promise<{ largeur: number; hauteur: number; variantes: VariantesMedia }> {
  const racine = dossierUploads();
  const sortie = jointureSure(racine, String(mediaId))!;
  fs.mkdirSync(sortie, { recursive: true });

  const entree = () => sharp(brutAbs, { limitInputPixels: PIXELS_MAX, failOn: "error" }).rotate();
  const meta = await sharp(brutAbs, { limitInputPixels: PIXELS_MAX }).metadata();
  if (!meta.width || !meta.height) throw new Error("Dimensions illisibles.");
  const pivote = (meta.orientation ?? 1) >= 5;
  const largeurSource = pivote ? meta.height : meta.width;

  const cibles: number[] = LARGEURS_MEDIA.filter((l) => l <= largeurSource);
  const plafond = Math.min(largeurSource, LARGEURS_MEDIA[LARGEURS_MEDIA.length - 1]);
  if (!cibles.includes(plafond)) cibles.push(plafond);

  const sources: VarianteImage[] = [];
  for (const l of cibles) {
    const fichier = `w${l}.webp`;
    const info = await entree()
      .resize({ width: l, withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toFile(path.join(sortie, fichier));
    sources.push({ largeur: info.width, hauteur: info.height, chemin: `${mediaId}/${fichier}` });
  }

  const alpha = !!meta.hasAlpha;
  const fichierOriginal = alpha ? "original.png" : "original.jpg";
  let chaine = entree().resize({ width: BORD_MAX_ORIGINAL, height: BORD_MAX_ORIGINAL, fit: "inside", withoutEnlargement: true });
  chaine = alpha ? chaine.png({ compressionLevel: 9 }) : chaine.jpeg({ quality: 85, mozjpeg: true });
  const orig = await chaine.toFile(path.join(sortie, fichierOriginal));
  const original: VarianteImage = { largeur: orig.width, hauteur: orig.height, chemin: `${mediaId}/${fichierOriginal}` };

  sources.sort((a, b) => a.largeur - b.largeur);
  return { largeur: original.largeur, hauteur: original.hauteur, variantes: { type: "image", sources, original } };
}

// ---------------------------------------------------------------------------
// Worker séquentiel en process
// ---------------------------------------------------------------------------

const etatWorker = globalThis as unknown as { __cherblancWorker?: { actif: boolean; encore: boolean } };

function etat() {
  if (!etatWorker.__cherblancWorker) etatWorker.__cherblancWorker = { actif: false, encore: false };
  return etatWorker.__cherblancWorker;
}

async function traiterJob(job: Job): Promise<void> {
  const racine = dossierUploads();
  const media = lireMedia(job.media_id);
  const brutAbs = job.chemin_brut ? jointureSure(racine, job.chemin_brut) : null;
  const supprimerBrut = () => {
    if (brutAbs) fs.rmSync(brutAbs, { force: true });
  };

  if (!media || media.statut === "ready") {
    terminerJob(job.id);
    supprimerBrut();
    return;
  }
  if (!brutAbs || !fs.existsSync(brutAbs)) {
    echouerJob(job.id, "Fichier source introuvable.", 0);
    definirStatutMedia(media.id, "error");
    return;
  }

  definirStatutMedia(media.id, "processing");
  try {
    const resultat = await traiterImage(brutAbs, media.id);
    marquerMediaPret(media.id, resultat);
    terminerJob(job.id);
    supprimerBrut();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (echouerJob(job.id, message) === "erreur") {
      // Échec définitif : ni le brut ni des variantes partielles.
      definirStatutMedia(media.id, "error");
      supprimerBrut();
      const dossier = jointureSure(racine, String(media.id));
      if (dossier) fs.rmSync(dossier, { recursive: true, force: true });
    } else {
      definirStatutMedia(media.id, "pending");
    }
    console.error(`[media] job ${job.id} (média ${media.id}) : ${message}`);
  }
}

async function boucleWorker(): Promise<void> {
  const e = etat();
  try {
    do {
      e.encore = false;
      let job: Job | null;
      while ((job = reserverProchainJob())) await traiterJob(job);
    } while (e.encore);
  } finally {
    e.actif = false;
  }
}

/** Relance le worker s'il est à l'arrêt (sans effet s'il tourne déjà). */
export function relancerWorker(): void {
  const e = etat();
  if (e.actif) {
    e.encore = true;
    return;
  }
  e.actif = true;
  setImmediate(() => {
    boucleWorker().catch((err) => console.error("[media] worker :", err));
  });
}

/** Attend que la file soit vide (scripts CLI). */
export async function viderFile(): Promise<void> {
  const e = etat();
  if (!e.actif) {
    e.actif = true;
    await boucleWorker();
    return;
  }
  while (e.actif) await new Promise((r) => setTimeout(r, 100));
}

/** Au démarrage du process : les jobs `processing` viennent d'un process mort. */
export function demarrerWorkerMedias(): void {
  const n = reprendreJobsBloques(0);
  if (n > 0) console.info(`[media] ${n} job(s) bloqué(s) remis en attente`);
  relancerWorker();
}

/** À l'ouverture d'une page BO de médias : reprise des jobs bloqués depuis plus de 10 min. */
export function reprendreTraitements(): void {
  reprendreJobsBloques(10 * 60 * 1000);
  relancerWorker();
}
