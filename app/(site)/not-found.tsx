import { ContenuIntrouvable, META_INTROUVABLE } from "@/components/site/introuvable";

/**
 * 404 des pages publiques qui appellent `notFound()` (ex. /actualites/inexistant) :
 * rendue DANS le layout du site (en-tête, pied de page), comme la 404 globale.
 * Next ajoute le `noindex` (une seule balise robots).
 */
export const metadata = META_INTROUVABLE;

export default function IntrouvableSite() {
  return <ContenuIntrouvable />;
}
