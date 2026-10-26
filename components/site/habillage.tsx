import { connection } from "next/server";
import { siteConfig } from "@/config/site";
import { horairesExceptionnelsAVenir } from "@/lib/horaires-exceptionnels";
import { annonceEnCours, coordonnees, lireHoraires } from "@/lib/reglages";
import { BandeauAnnonce } from "./bandeau-annonce";
import { Entete } from "./entete";
import { Pied } from "./pied";
import { Revelations } from "./revelations";

/**
 * Habillage commun du site public : lien d'évitement, bandeau d'annonce, en-tête,
 * contenu (`<main id="contenu">`), pied de page, révélation au défilement.
 * Utilisé par app/(site)/layout.tsx et app/global-not-found.tsx.
 *
 * `await connection()` : rendu toujours dynamique (jamais de base ouverte au
 * build). Ne compte AUCUNE vue (chaque page appelle `compterVue`).
 */
export async function Habillage({ children }: { children: React.ReactNode }) {
  await connection();
  const annonce = annonceEnCours();
  const coord = coordonnees();
  return (
    <>
      <a href="#contenu" className="evitement">
        Aller au contenu
      </a>
      {annonce ? <BandeauAnnonce annonce={annonce} /> : null}
      <Entete
        navigation={siteConfig.navigation}
        appelAction={siteConfig.appelAction}
        telephone={coord.telephone}
        nom={siteConfig.nom}
        signature={siteConfig.signature}
      />
      <main id="contenu" tabIndex={-1}>
        {children}
      </main>
      <Pied horaires={lireHoraires()} exceptionnels={horairesExceptionnelsAVenir(30)} coordonnees={coord} />
      <Revelations />
    </>
  );
}
