import { Habillage } from "@/components/site/habillage";

/**
 * Layout du site public.
 *
 * `force-dynamic` au niveau du layout : toutes les pages publiques lisent la
 * base au rendu (carte, horaires, annonce...) et reflètent immédiatement les
 * modifications du backoffice ; couvre aussi toute future page « statique »
 * (mentions légales...) contre un gel au build.
 *
 * NE PAS compter les vues ici (le layout s'exécute aussi avant un notFound()) :
 * chaque page appelle `compterVue(chemin)` (lib/compter-vue.ts).
 * Le site public ne lie JAMAIS le backoffice.
 */

export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <Habillage>{children}</Habillage>;
}
