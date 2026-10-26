"use client";

/** Actions d'en-tête d'un menu : afficher/masquer, mettre en ligne comme carte, supprimer. */

import { useRouter } from "next/navigation";
import { basculerMenuVisibleAction, remplacerCarteTraiteurAction, supprimerMenuAction } from "@/lib/actions/menus";
import { useLienAdmin } from "../contexte-admin";
import { useExecuter } from "../executer";
import { Icone } from "../icones";
import { useConfirmer } from "../retours";

export function BasculerMenuVisible({ menuId, visible }: { menuId: number; visible: boolean }) {
  const [executer, enCours] = useExecuter();
  return (
    <button
      type="button"
      className={`bo-bouton ${visible ? "bo-bouton-secondaire" : "bo-bouton-principal"}`}
      disabled={enCours}
      onClick={() => executer(() => basculerMenuVisibleAction(menuId, !visible))}
    >
      <Icone nom={visible ? "masque" : "oeil"} taille={18} />
      {visible ? "Masquer du site" : "Afficher sur le site"}
    </button>
  );
}

export function MettreEnLigneCommeCarte({ menuId, titre, titreActuel }: { menuId: number; titre: string; titreActuel: string | null }) {
  const [executer, enCours] = useExecuter();
  const confirmer = useConfirmer();
  return (
    <button
      type="button"
      className="bo-bouton bo-bouton-attention"
      disabled={enCours}
      onClick={async () => {
        const ok = await confirmer({
          titre: `Mettre « ${titre} » en ligne comme carte traiteur ?`,
          message: titreActuel
            ? `Elle remplacera « ${titreActuel} » sur la page Carte traiteur. L’ancienne carte n’est pas supprimée : elle reste ici, masquée.`
            : "Elle s’affichera sur la page Carte traiteur.",
          confirmer: "Mettre en ligne",
        });
        if (ok) executer(() => remplacerCarteTraiteurAction(menuId));
      }}
    >
      <Icone nom="coche" taille={18} />
      Mettre en ligne comme carte traiteur
    </button>
  );
}

export function SupprimerMenu({ menuId, titre, protege }: { menuId: number; titre: string; protege: boolean }) {
  const [executer, enCours] = useExecuter();
  const confirmer = useConfirmer();
  const router = useRouter();
  const lien = useLienAdmin();
  if (protege)
    return (
      <p className="bo-discret">
        C’est la carte affichée sur le site : elle ne peut pas être supprimée. Pour la remplacer, dupliquez-la, préparez la nouvelle carte, puis
        utilisez « Mettre en ligne comme carte traiteur » sur la copie.
      </p>
    );
  return (
    <div className="bo-pile">
      <p className="bo-discret">
        La suppression efface le menu, ses sections et tous ses plats. Pour le retirer du site sans le perdre, masquez-le plutôt.
      </p>
      <div>
        <button
          type="button"
          className="bo-bouton bo-bouton-danger"
          disabled={enCours}
          onClick={async () => {
            const ok = await confirmer({
              titre: `Supprimer « ${titre} » ?`,
              message: "Le menu, ses sections et ses plats seront effacés définitivement.",
              confirmer: "Supprimer le menu",
              danger: true,
            });
            if (ok) executer(() => supprimerMenuAction(menuId), { apres: (r) => r?.ok && router.push(lien("/menus")) });
          }}
        >
          <Icone nom="poubelle" taille={18} />
          Supprimer ce menu
        </button>
      </div>
    </div>
  );
}
