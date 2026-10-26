/**
 * Sert les fichiers uploadés (UPLOADS_DIR), hors build.
 *
 * Sécurité :
 * - ne sert JAMAIS `tmp/` (bruts en attente : un fichier piégé y serait servi
 *   tel quel avant nettoyage) ; seuls les dossiers `<id numérique>/` sont servis ;
 * - extensions en liste blanche, chemin borné à UPLOADS_DIR ;
 * - `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox`
 *   sur les images. Exception PDF : pas de `sandbox` (Chrome refuse d'afficher
 *   un PDF dans un contexte sandboxé) ; la signature `%PDF-` est vérifiée à
 *   l'upload et l'upload est réservé aux admins.
 * - Ces en-têtes sont posés ICI seulement : ni next.config `headers()` ni le
 *   proxy ne doivent en poser sur /media (ils remplaceraient ceux-ci).
 *
 * Cache long : un fichier ne change jamais pour un ID donné (un nouvel upload
 * crée un nouvel ID). `?download=1` force le téléchargement.
 */

import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { dossierUploads } from "@/lib/env";
import { jointureSure } from "@/lib/media";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf",
};

const CSP_IMAGE = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
const CSP_PDF = "default-src 'none'; style-src 'unsafe-inline'; object-src 'self'";

function notFound(): Response {
  return new Response("Introuvable", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function GET(req: Request, ctx: RouteContext<"/media/[...path]">) {
  const { path: segments } = await ctx.params;
  if (!segments || segments.length < 2) return notFound();
  if (!/^\d+$/.test(segments[0])) return notFound(); // refuse tmp/ et tout le reste
  if (segments.some((s) => !s || s.startsWith(".") || /[\\\0/]/.test(s))) return notFound();

  const ext = path.extname(segments[segments.length - 1]).toLowerCase();
  const type = TYPES[ext];
  if (!type) return notFound();

  const abs = jointureSure(dossierUploads(), segments.join("/"));
  if (!abs) return notFound();

  let stat: fs.Stats;
  try {
    stat = fs.statSync(abs);
  } catch {
    return notFound();
  }
  if (!stat.isFile()) return notFound();

  const etag = `"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
  const headers = new Headers({
    "Content-Type": type,
    "Cache-Control": "public, max-age=31536000, immutable",
    ETag: etag,
    "Last-Modified": stat.mtime.toUTCString(),
    "Content-Security-Policy": type === "application/pdf" ? CSP_PDF : CSP_IMAGE,
    "X-Content-Type-Options": "nosniff",
    "Cross-Origin-Resource-Policy": "same-origin",
  });

  const url = new URL(req.url);
  const fileName = path.basename(abs);
  if (url.searchParams.get("download") === "1") {
    headers.set("Content-Disposition", `attachment; filename="${fileName}"`);
  } else if (type === "application/pdf" || fileName.startsWith("original.")) {
    headers.set("Content-Disposition", `inline; filename="${fileName}"`);
  }

  if (req.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers });
  }

  headers.set("Content-Length", String(stat.size));
  const stream = Readable.toWeb(fs.createReadStream(abs)) as ReadableStream<Uint8Array>;
  return new Response(stream, { status: 200, headers });
}
