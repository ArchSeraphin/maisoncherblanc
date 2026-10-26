/**
 * Helpers PURS pour afficher un média (aucune base, aucun sharp) :
 * importables depuis un composant client.
 *
 * Un média `ready` de type image expose des variantes WebP (480/960/1600/2400 px
 * de large, bornées à la taille source) et un « original » JPEG plafonné.
 * Un média de type document (PDF) expose un fichier unique.
 */

/** Largeurs des variantes WebP générées par la pipeline. */
export const LARGEURS_MEDIA = [480, 960, 1600, 2400] as const;

export type VarianteImage = { largeur: number; hauteur: number; chemin: string };

export type VariantesMedia =
  | {
      type: "image";
      /** Variantes WebP triées par largeur croissante. */
      sources: VarianteImage[];
      /** Original ré-encodé (JPEG ou PNG, plafonné, sans métadonnées). */
      original: VarianteImage;
    }
  | {
      type: "document";
      chemin: string;
      mime: string;
      poids: number;
    };

/** Ce dont un composant a besoin pour afficher une image. */
export type ImageMedia = {
  id: number;
  alt: string;
  largeur: number;
  hauteur: number;
  provisoire: boolean;
  variantes: Extract<VariantesMedia, { type: "image" }>;
};

/** Ce dont un composant a besoin pour proposer un document (PDF) au téléchargement. */
export type DocumentMedia = {
  id: number;
  nom: string;
  url: string;
  urlTelechargement: string;
  poids: number;
  mime: string;
};

/** URL publique d'un fichier stocké sous UPLOADS_DIR (chemin relatif). */
export function urlMedia(cheminRelatif: string): string {
  return `/media/${cheminRelatif.split("/").map(encodeURIComponent).join("/")}`;
}

/** Attribut `srcSet` à partir des variantes WebP. */
export function construireSrcSet(img: Pick<ImageMedia, "variantes">): string {
  return img.variantes.sources.map((v) => `${urlMedia(v.chemin)} ${v.largeur}w`).join(", ");
}

/** Variante la plus proche (par excès) d'une largeur cible, pour `src`. */
export function choisirVariante(img: Pick<ImageMedia, "variantes">, largeurCible = 960): VarianteImage {
  const sources = img.variantes.sources;
  return sources.find((v) => v.largeur >= largeurCible) ?? sources[sources.length - 1];
}

/**
 * Attributs prêts pour un `<img>` (anti-CLS : width/height réels).
 * `<img {...attributsImage(img, { sizes: "(min-width: 1024px) 50vw, 100vw" })} />`
 */
export function attributsImage(
  img: ImageMedia,
  opts: { sizes?: string; largeurCible?: number } = {},
): { src: string; srcSet: string; sizes: string; width: number; height: number; alt: string } {
  return {
    src: urlMedia(choisirVariante(img, opts.largeurCible).chemin),
    srcSet: construireSrcSet(img),
    sizes: opts.sizes ?? "100vw",
    width: img.largeur,
    height: img.hauteur,
    alt: img.alt,
  };
}

/** Poids lisible (« 4,6 Mo »). */
export function formaterPoids(octets: number): string {
  if (octets < 1024 * 1024) return `${Math.max(1, Math.round(octets / 1024))} ko`;
  return `${(octets / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`;
}
