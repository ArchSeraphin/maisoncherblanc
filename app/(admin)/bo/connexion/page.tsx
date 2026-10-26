import { redirect } from "next/navigation";
import { FormulaireConnexion } from "@/components/admin/formulaire-connexion";
import { actionConnexion } from "@/lib/actions/auth";
import { lireUtilisateur } from "@/lib/auth";
import { lienAdmin } from "@/lib/chemin-admin";

export const metadata = { title: "Connexion" };

export default async function PageConnexion() {
  if (await lireUtilisateur()) redirect(lienAdmin());
  return (
    <main className="bo-connexion">
      <div className="bo-carte bo-carte-connexion">
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG statique */}
        <img src="/logo/monogramme-olive.svg" alt="" width={56} height={56} />
        <h1 className="bo-titre-connexion">Maison Cherblanc</h1>
        <p className="bo-discret">Gestion du site</p>
        <FormulaireConnexion action={actionConnexion} />
      </div>
    </main>
  );
}
