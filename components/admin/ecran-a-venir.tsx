import Link from "next/link";
import { lienAdmin } from "@/lib/chemin-admin";

/** Écran provisoire d'un module du BO (remplacé par le lot backoffice). Server Component. */
export function EcranAVenir({ titre }: { titre: string }) {
  return (
    <div className="bo-pile">
      <h1 className="bo-titre">{titre}</h1>
      <p className="bo-alerte">Cet écran sera bientôt disponible.</p>
      <p>
        <Link href={lienAdmin()} className="bo-bouton bo-bouton-secondaire">
          Retour au tableau de bord
        </Link>
      </p>
    </div>
  );
}
