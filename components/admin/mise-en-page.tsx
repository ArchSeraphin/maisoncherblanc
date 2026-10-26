/**
 * Éléments de mise en page communs aux écrans du backoffice (sans état :
 * utilisables côté serveur et côté client).
 */

import Link from "next/link";
import { Icone } from "./icones";

/** Titre de l'écran, phrase d'introduction, lien de retour et actions principales. */
export function EntetePage({
  titre,
  introduction,
  retour,
  actions,
  etiquettes,
}: {
  titre: React.ReactNode;
  introduction?: React.ReactNode;
  /** `{ href, libelle }` : lien « ← Carte & menus » (href déjà construit par lienAdmin/useLienAdmin). */
  retour?: { href: string; libelle: string };
  actions?: React.ReactNode;
  etiquettes?: React.ReactNode;
}) {
  return (
    <header className="bo-entete">
      {retour ? (
        <Link href={retour.href} className="bo-retour">
          <Icone nom="chevron" taille={18} />
          {retour.libelle}
        </Link>
      ) : null}
      <div className="bo-entete-ligne">
        <div className="bo-pile" style={{ gap: "0.4rem" }}>
          <h1 className="bo-titre">{titre}</h1>
          {etiquettes ? <div className="bo-menu-infos">{etiquettes}</div> : null}
        </div>
        {actions ? <div className="bo-actions-formulaire">{actions}</div> : null}
      </div>
      {introduction ? <p className="bo-introduction">{introduction}</p> : null}
    </header>
  );
}

/** Lien « Voir sur le site » : nouvel onglet, sans Referer (le chemin secret ne fuit pas). */
export function VoirSurLeSite({ chemin, libelle = "Voir sur le site", petit = false }: { chemin: string; libelle?: string; petit?: boolean }) {
  return (
    <a href={chemin} target="_blank" rel="noreferrer" className={`bo-bouton bo-bouton-secondaire${petit ? " bo-bouton-petit" : ""}`}>
      <Icone nom="externe" taille={18} />
      {libelle}
      <span className="bo-invisible"> (nouvel onglet)</span>
    </a>
  );
}

/** État vide utile : ce qu'il faut faire, avec l'action principale. */
export function EtatVide({ titre, children, action }: { titre: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bo-vide">
      <strong>{titre}</strong>
      {children ? <p>{children}</p> : null}
      {action}
    </div>
  );
}
