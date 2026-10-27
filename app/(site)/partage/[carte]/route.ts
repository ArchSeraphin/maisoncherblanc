import { rendreCartePartage } from "@/components/site/carte-partage";

/**
 * Cartes de partage des deux pages métier (/partage/boucherie, /partage/traiteur),
 * JPEG 1200 x 630 : la boucherie a sa propre image (et non une photo traiteur)
 * tant que ses visuels d'en-tête sont provisoires. Utilisées par
 * `construireMetadata({ image })` de /boucherie-roanne et /traiteur-roanne quand
 * l'en-tête n'a pas de vraie photo. Aucune donnée de la base : cache 1 jour.
 */

const CARTES = {
  boucherie: { titre: "Boucherie", accent: "à Roanne", signature: "Viandes · Volailles · Charcuterie" },
  traiteur: { titre: "Traiteur", accent: "à Roanne", signature: "Plateaux · Buffets · Cocktails · Mariages" },
} as const;


export async function GET(_req: Request, { params }: RouteContext<"/partage/[carte]">) {
  const { carte } = await params;
  if (!(carte in CARTES)) return new Response("Introuvable", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  const c = CARTES[carte as keyof typeof CARTES];
  return rendreCartePartage({ ...c, pied: "Maison Cherblanc · 55 rue Mulsant" }, "public, max-age=86400, stale-while-revalidate=604800");
}
