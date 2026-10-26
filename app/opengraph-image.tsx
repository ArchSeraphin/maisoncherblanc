import fs from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { siteConfig } from "@/config/site";
import { imageEmplacement } from "@/lib/emplacements";
import { dossierUploads } from "@/lib/env";
import { jointureSure } from "@/lib/media";

/**
 * Image de partage par défaut (/opengraph-image, PNG 1200 x 630), servie par
 * `construireMetadata()` quand une page ne fournit pas sa propre image.
 *
 * Fond olive, monogramme or, « Maison Cherblanc » en Fraunces, signature en
 * DM Sans capitales. Si l'emplacement `og-defaut` (BO « Photos des pages ») a
 * une photo, elle occupe le volet gauche ; sinon la composition est centrée.
 * Polices locales (public/fonts/og, licence OFL), aucun appel réseau.
 * Dynamique : reflète le choix fait dans le backoffice (cache 1 h).
 */

export const dynamic = "force-dynamic";
export const alt = siteConfig.imagePartageParDefaut.alt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LARGEUR_VOLET = 470;
const t = siteConfig.theme;

async function police(fichier: string): Promise<Buffer> {
  return readFile(path.join(process.cwd(), "public/fonts/og", fichier));
}

/** Photo `og-defaut` recadrée pour le volet gauche (data URI JPEG), ou `null`. */
async function photoVolet(): Promise<string | null> {
  try {
    const img = imageEmplacement("og-defaut");
    const source = img?.variantes.original ?? img?.variantes.sources.at(-1);
    if (!source) return null;
    const abs = jointureSure(dossierUploads(), source.chemin);
    if (!abs || !fs.existsSync(abs)) return null;
    const jpeg = await sharp(abs).resize(LARGEUR_VOLET * 2, size.height * 2, { fit: "cover", position: "attention" }).jpeg({ quality: 82 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image() {
  const [fraunces, frauncesItalique, dmSans500, dmSans400, monogramme, photo] = await Promise.all([
    police("fraunces-400.woff"),
    police("fraunces-400-italique.woff"),
    police("dm-sans-500.woff"),
    police("dm-sans-400.woff"),
    readFile(path.join(process.cwd(), "public/logo/monogramme-or.svg")),
    photoVolet(),
  ]);
  const logo = `data:image/svg+xml;base64,${monogramme.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: t.olive, color: t.creme }}>
        {photo ? (
          <div style={{ display: "flex", width: LARGEUR_VOLET, height: "100%", position: "relative" }}>
            <img src={photo} alt="" width={LARGEUR_VOLET} height={size.height} style={{ objectFit: "cover" }} />
            <div style={{ position: "absolute", top: 0, right: 0, width: 6, height: "100%", background: t.cuivre }} />
          </div>
        ) : null}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 56px",
            border: `2px solid rgba(228, 203, 143, 0.35)`,
            margin: 28,
            borderRadius: photo ? 6 : "300px 300px 6px 6px",
          }}
        >
          <img src={logo} alt="" width={photo ? 132 : 150} height={photo ? 132 : 150} />
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontFamily: "Fraunces",
              fontSize: photo ? 78 : 92,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              color: t.creme,
            }}
          >
            <span>Maison&nbsp;</span>
            <span style={{ fontStyle: "italic", color: t.or }}>Cherblanc</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 30 }}>
            <div style={{ width: 90, height: 1, background: t.or, opacity: 0.7 }} />
            <div style={{ width: 9, height: 9, margin: "0 14px", background: t.or, transform: "rotate(45deg)" }} />
            <div style={{ width: 90, height: 1, background: t.or, opacity: 0.7 }} />
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontFamily: "DM Sans",
              fontWeight: 500,
              fontSize: photo ? 17 : 22,
              letterSpacing: "0.2em",
              whiteSpace: "nowrap",
              textTransform: "uppercase",
              color: t.or,
            }}
          >
            Boucherie · Charcuterie · Traiteur · Roanne
          </div>
          <div style={{ display: "flex", marginTop: 18, fontFamily: "DM Sans", fontWeight: 400, fontSize: 24, color: "rgba(243, 235, 220, 0.82)" }}>
            {`${siteConfig.adresse.rue}, ${siteConfig.adresse.codePostal} ${siteConfig.adresse.ville}`}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: fraunces, style: "normal", weight: 400 },
        { name: "Fraunces", data: frauncesItalique, style: "italic", weight: 400 },
        { name: "DM Sans", data: dmSans500, style: "normal", weight: 500 },
        { name: "DM Sans", data: dmSans400, style: "normal", weight: 400 },
      ],
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    },
  );
}
