import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { siteConfig } from "@/config/site";

/**
 * Cartes de partage (Open Graph, 1200 x 630) aux couleurs de la maison : fond
 * olive, monogramme or, titre en Fraunces, signature en DM Sans capitales.
 * Utilisées par app/opengraph-image.tsx (carte par défaut, photo `og-defaut`
 * en volet gauche si elle est renseignée) et par /partage/[carte] (cartes des
 * pages boucherie et traiteur, sans photo : leurs visuels d'en-tête sont
 * provisoires).
 *
 * Rendu en PNG par `ImageResponse`, puis ré-encodé en JPEG par sharp : 40 à
 * 120 Kio au lieu de 800 Kio (le PNG d'une photo pèse lourd). Polices locales
 * (public/fonts/og, licence OFL), aucun appel réseau.
 */

export const TAILLE_PARTAGE = { width: 1200, height: 630 } as const;
const LARGEUR_VOLET = 470;
const t = siteConfig.theme;

async function police(fichier: string): Promise<Buffer> {
  return readFile(path.join(process.cwd(), "public/fonts/og", fichier));
}

export type CartePartage = {
  /** Mot en romain, puis mot d'accent en italique or (« Maison » + « Cherblanc »). */
  titre: string;
  accent: string;
  /** Ligne en capitales sous le filet. */
  signature: string;
  /** Dernière ligne (adresse par défaut). */
  pied?: string;
  /** Photo du volet gauche (data URI JPEG), ou rien. */
  photo?: string | null;
};

/** Recadre une image locale pour le volet gauche (data URI JPEG), `null` si illisible. */
export async function photoVolet(cheminAbsolu: string): Promise<string | null> {
  try {
    const jpeg = await sharp(cheminAbsolu)
      .resize(LARGEUR_VOLET * 2, TAILLE_PARTAGE.height * 2, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82 })
      .toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Carte de partage en JPEG (réponse prête à renvoyer). */
export async function rendreCartePartage(c: CartePartage, cache = "public, max-age=3600, stale-while-revalidate=86400"): Promise<Response> {
  const [fraunces, frauncesItalique, dmSans500, dmSans400, monogramme] = await Promise.all([
    police("fraunces-400.woff"),
    police("fraunces-400-italique.woff"),
    police("dm-sans-500.woff"),
    police("dm-sans-400.woff"),
    readFile(path.join(process.cwd(), "public/logo/monogramme-or.svg")),
  ]);
  const logo = `data:image/svg+xml;base64,${monogramme.toString("base64")}`;
  const photo = c.photo ?? null;
  const pied = c.pied ?? `${siteConfig.adresse.rue}, ${siteConfig.adresse.codePostal} ${siteConfig.adresse.ville}`;

  const png = new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: t.olive, color: t.creme }}>
        {photo ? (
          <div style={{ display: "flex", width: LARGEUR_VOLET, height: "100%", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- rendu Satori (ImageResponse) : <img> seul accepté */}
            <img src={photo} alt="" width={LARGEUR_VOLET} height={TAILLE_PARTAGE.height} style={{ objectFit: "cover" }} />
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
          {/* eslint-disable-next-line @next/next/no-img-element -- rendu Satori (ImageResponse) : <img> seul accepté */}
          <img src={logo} alt="" width={photo ? 132 : 150} height={photo ? 132 : 150} />
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontFamily: "Fraunces",
              fontSize: photo ? 78 : 88,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              color: t.creme,
            }}
          >
            <span>{c.titre}&nbsp;</span>
            <span style={{ fontStyle: "italic", color: t.or }}>{c.accent}</span>
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
            {c.signature}
          </div>
          <div style={{ display: "flex", marginTop: 18, fontFamily: "DM Sans", fontWeight: 400, fontSize: 24, color: "rgba(243, 235, 220, 0.82)" }}>{pied}</div>
        </div>
      </div>
    ),
    {
      ...TAILLE_PARTAGE,
      fonts: [
        { name: "Fraunces", data: fraunces, style: "normal", weight: 400 },
        { name: "Fraunces", data: frauncesItalique, style: "italic", weight: 400 },
        { name: "DM Sans", data: dmSans500, style: "normal", weight: 500 },
        { name: "DM Sans", data: dmSans400, style: "normal", weight: 400 },
      ],
    },
  );
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": "image/jpeg", "Cache-Control": cache } });
}
