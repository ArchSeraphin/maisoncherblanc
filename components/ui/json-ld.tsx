import { serialiserJsonLd, type JsonLdDonnees } from "@/lib/seo";

/**
 * Bloc JSON-LD (Server Component) : `<JsonLd donnees={[commerceJsonLd({...}), filArianeJsonLd([...])]} />`.
 * Sérialisation sûre (`<` échappé : un texte saisi au BO ne peut pas fermer la balise).
 * Les entrées `null`/`undefined`/`false` d'un tableau sont ignorées (blocs conditionnels).
 */
export function JsonLd({ donnees }: { donnees: JsonLdDonnees | (JsonLdDonnees | null | undefined | false)[] }) {
  if (!Array.isArray(donnees)) return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiserJsonLd(donnees) }} />;
  const liste = donnees.filter((d): d is JsonLdDonnees => !!d);
  if (liste.length === 0) return null;
  const contenu = liste.length === 1 ? liste[0] : liste;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiserJsonLd(contenu) }} />;
}
