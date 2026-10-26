import Link from "next/link";

export const metadata = {
  title: { absolute: "Page introuvable | Maison Cherblanc" },
  robots: { index: false, follow: false },
};

/**
 * Repli minimal des `notFound()` levés par une route (ex. article inconnu,
 * backoffice sans ADMIN_PATH). Les URL sans route passent par
 * app/global-not-found.tsx. Volontairement minuscule : Next sérialise cet
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
