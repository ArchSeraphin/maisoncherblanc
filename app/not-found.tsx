import Link from "next/link";

/** Next pose lui-même `noindex` sur une 404 : pas de second `robots` ici. */
export const metadata = {
  title: { absolute: "Page introuvable | Maison Cherblanc" },
};

/**
 * Repli minimal des `notFound()` levés hors du site public (ex. backoffice
 * sans ADMIN_PATH). Les pages publiques ont app/(site)/not-found.tsx (avec
 * en-tête et pied) ; les URL sans route passent par app/global-not-found.tsx. Volontairement minuscule : Next sérialise cet
 * élément dans le payload RSC de toutes les pages.
 */
export default function NotFound() {
  return (
    <section className="section contenu">
      <h1 className="titre-l">Page introuvable</h1>
      <Link href="/" className="bouton" style={{ marginTop: "2rem" }}>
        Retour à l’accueil
      </Link>
    </section>
  );
}
