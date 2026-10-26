import { FormulaireAnnonce } from "@/components/admin/annonce/formulaire-annonce";
import { EntetePage, VoirSurLeSite } from "@/components/admin/mise-en-page";
import { requireUser } from "@/lib/auth";
import { jourParis } from "@/lib/dates";
import { lireAnnonce } from "@/lib/reglages";

export const metadata = { title: "Bandeau d’annonce" };

export default async function PageAnnonce() {
  await requireUser();
  return (
    <div className="bo-pile-large">
      <EntetePage
        titre="Bandeau d’annonce"
        introduction="Une phrase courte affichée tout en haut de chaque page du site : commandes de fêtes, congés, nouveauté…"
        actions={<VoirSurLeSite chemin="/" />}
      />
      <div className="bo-carte">
        <FormulaireAnnonce annonce={lireAnnonce()} jour={jourParis()} />
      </div>
    </div>
  );
}
