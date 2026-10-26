import { serialiserJsonLd, type JsonLdDonnees } from "@/lib/seo";

/** Bloc JSON-LD (Server Component), `<` échappé. `<JsonLd donnees={commerceJsonLd({...})} />` */
export function JsonLd({ donnees }: { donnees: JsonLdDonnees | JsonLdDonnees[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiserJsonLd(donnees) }} />;
}
