/**
 * Génère les logos SVG du site et les icônes (favicon, icon, apple-icon,
 * icônes du manifeste) depuis le logo vectoriel fourni par le client.
 *
 *   npm run logos   (outil de développement : nécessite `pdftocairo` de Poppler)
 *
 * Source : seed-medias/logo/logo-vectoriel.pdf (logo circulaire complet :
 * monogramme « MC » au centre, cercle, « Maison Cherblanc » en haut et
 * « Boucherie - Charcuterie - Traiteur » en bas). Les autres fichiers du
 * dossier (Fichier 1 à 8) sont des déclinaisons de couleur du même logo :
 * aucun ne contient le monogramme seul, il est donc extrait ici (premier
 * tracé du PDF, le seul qui couvre le centre).
 *
 * Sorties (commitées, régénérables) :
 * - public/logo/logo-complet-{encre,olive,creme,or}.svg
 * - public/logo/monogramme-{encre,olive,creme,or}.svg
 * - app/icon.svg (favicon vectoriel), app/favicon.ico, app/icon.png (512),
 *   app/apple-icon.png (180), public/icons/icon-{192,512}.png, public/icons/maskable-512.png
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const RACINE = process.cwd();
const SOURCE = path.join(RACINE, "seed-medias/logo/logo-vectoriel.pdf");

/** Couleurs de la DA (docs/DA.md). */
const COULEURS = {
  encre: "#2A2B24",
  olive: "#3F4530",
  creme: "#F3EBDC",
  or: "#E4CB8F",
} as const;

type Trace = { d: string; clip: string | null };

/** Arrondit les coordonnées à 2 décimales (fichiers plus légers, rendu identique). */
function alleger(d: string): string {
  return d
    .replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n) * 100) / 100))
    .replace(/\s+/g, " ")
    .trim();
}

function lireTraces(svg: string): { traces: Trace[]; clips: Map<string, string>; largeur: number; hauteur: number } {
  const vb = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
  if (!vb) throw new Error("viewBox introuvable dans le SVG converti.");
  const clips = new Map<string, string>();
  for (const m of svg.matchAll(/<clipPath id="([^"]+)">\s*<path[^>]*\sd="([^"]+)"/g)) clips.set(m[1], alleger(m[2]));
  const corps = svg.slice(svg.indexOf("</defs>"));
  const traces: Trace[] = [];
  // Un tracé est soit nu, soit enveloppé dans <g clip-path="url(#clip-N)">.
  const re = /(<g clip-path="url\(#([^)]+)\)">\s*)?<path[^>]*\sd="([^"]+)"[^>]*\/>/g;
  for (const m of corps.matchAll(re)) traces.push({ d: alleger(m[3]), clip: m[2] ?? null });
  return { traces, clips, largeur: Number(vb[1]), hauteur: Number(vb[2]) };
}

function svgDe(traces: Trace[], clips: Map<string, string>, viewBox: string, couleur: string, titre: string): string {
  const utilises = [...new Set(traces.map((t) => t.clip).filter((c): c is string => !!c))];
  const defs = utilises.length
    ? `<defs>${utilises.map((id) => `<clipPath id="${id}"><path d="${clips.get(id)}"/></clipPath>`).join("")}</defs>`
    : "";
  const chemins = traces
    .map((t) => (t.clip ? `<path clip-path="url(#${t.clip})" d="${t.d}"/>` : `<path d="${t.d}"/>`))
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${titre}"><title>${titre}</title>${defs}<g fill="${couleur}">${chemins}</g></svg>\n`;
}

/** Boîte englobante réelle d'un SVG (rendu puis rognage), en unités du viewBox. */
async function boiteReelle(svg: string, largeur: number, hauteur: number) {
  const echelle = 2;
  const { info } = await sharp(Buffer.from(svg), { density: 72 * echelle })
    .flatten({ background: "#ffffff" })
    .trim({ threshold: 10 })
    .toBuffer({ resolveWithObject: true });
  const x = -(info.trimOffsetLeft ?? 0) / echelle;
  const y = -(info.trimOffsetTop ?? 0) / echelle;
  const w = info.width / echelle;
  const h = info.height / echelle;
  return { x: Math.max(0, x), y: Math.max(0, y), w: Math.min(w, largeur), h: Math.min(h, hauteur) };
}

function viewBoxCarre(b: { x: number; y: number; w: number; h: number }, marge: number): string {
  const cote = Math.max(b.w, b.h) * (1 + marge * 2);
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const r = (n: number) => Math.round(n * 100) / 100;
  return `${r(cx - cote / 2)} ${r(cy - cote / 2)} ${r(cote)} ${r(cote)}`;
}

async function main() {
  if (!fs.existsSync(SOURCE)) throw new Error(`Source absente : ${SOURCE}`);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "logos-"));
  const brut = path.join(tmp, "logo.svg");
  execFileSync("pdftocairo", ["-svg", SOURCE, brut]);
  const { traces, clips, largeur, hauteur } = lireTraces(fs.readFileSync(brut, "utf8"));
  if (traces.length < 10) throw new Error(`Tracés inattendus (${traces.length}).`);

  // Le monogramme est le premier tracé (le seul qui couvre le centre du logo).
  const monogramme = [traces[0]];
  const vbPage = `0 0 ${largeur} ${hauteur}`;

  const boiteComplet = await boiteReelle(svgDe(traces, clips, vbPage, "#000", "x"), largeur, hauteur);
  const boiteMono = await boiteReelle(svgDe(monogramme, clips, vbPage, "#000", "x"), largeur, hauteur);
  const vbComplet = viewBoxCarre(boiteComplet, 0.01);
  const vbMono = viewBoxCarre(boiteMono, 0.02);

  const dossier = path.join(RACINE, "public/logo");
  fs.mkdirSync(dossier, { recursive: true });
  for (const [nom, couleur] of Object.entries(COULEURS)) {
    fs.writeFileSync(
      path.join(dossier, `logo-complet-${nom}.svg`),
      svgDe(traces, clips, vbComplet, couleur, "Maison Cherblanc, boucherie, charcuterie, traiteur"),
    );
    fs.writeFileSync(path.join(dossier, `monogramme-${nom}.svg`), svgDe(monogramme, clips, vbMono, couleur, "Maison Cherblanc"));
  }

  // Icônes : monogramme or sur pastille olive (lisible de 16 à 512 px).
  const [mx, my, mc] = vbMono.split(" ").map(Number);
  const pastille = (taille: number, rond: boolean, marge: number) => {
    const interieur = mc * (1 + marge * 2);
    const ox = mx - mc * marge;
    const oy = my - mc * marge;
    const fond = rond
      ? `<circle cx="${ox + interieur / 2}" cy="${oy + interieur / 2}" r="${interieur / 2}" fill="${COULEURS.olive}"/>`
      : `<rect x="${ox}" y="${oy}" width="${interieur}" height="${interieur}" fill="${COULEURS.olive}"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ox} ${oy} ${interieur} ${interieur}" width="${taille}" height="${taille}">${fond}<g fill="${COULEURS.or}"><path d="${monogramme[0].d}"/></g></svg>`;
  };
  const versPng = (svg: string, taille: number) => sharp(Buffer.from(svg), { density: 300 }).resize(taille, taille).png().toBuffer();

  fs.writeFileSync(path.join(RACINE, "app/icon.svg"), pastille(64, true, 0.16).replace(/ width="64" height="64"/, "") + "\n");
  fs.writeFileSync(path.join(RACINE, "app/icon.png"), await versPng(pastille(512, true, 0.16), 512));
  fs.writeFileSync(path.join(RACINE, "app/apple-icon.png"), await versPng(pastille(180, false, 0.22), 180));
  const icones = path.join(RACINE, "public/icons");
  fs.mkdirSync(icones, { recursive: true });
  fs.writeFileSync(path.join(icones, "icon-192.png"), await versPng(pastille(192, true, 0.16), 192));
  fs.writeFileSync(path.join(icones, "icon-512.png"), await versPng(pastille(512, true, 0.16), 512));
  fs.writeFileSync(path.join(icones, "maskable-512.png"), await versPng(pastille(512, false, 0.32), 512));

  // favicon.ico (16, 32, 48) via ImageMagick si disponible, sinon PNG 32 renommé.
  const ico = path.join(RACINE, "app/favicon.ico");
  const tailles = [16, 32, 48];
  const pngs = await Promise.all(tailles.map(async (t) => {
    const f = path.join(tmp, `f${t}.png`);
    fs.writeFileSync(f, await versPng(pastille(t, true, 0.1), t));
    return f;
  }));
  try {
    execFileSync("magick", [...pngs, ico]);
  } catch {
    fs.copyFileSync(pngs[1], ico);
  }

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`Logos : ${traces.length} tracés (monogramme : 1). viewBox complet ${vbComplet}, monogramme ${vbMono}.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
