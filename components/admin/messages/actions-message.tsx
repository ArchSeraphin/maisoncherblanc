"use client";

/** Actions sur un message : marquer lu à l'ouverture, non lu, supprimer, effacer les messages d'une adresse (RGPD). */

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { marquerLuAction, supprimerMessageAction, supprimerMessagesParEmailAction } from "@/lib/actions/messages";
import { useLienAdmin } from "../contexte-admin";
import { useExecuter } from "../executer";
import { Icone } from "../icones";
import { useConfirmer } from "../retours";

/** Ouvrir un message le marque comme lu (une fois, côté client : jamais au préchargement d'un lien). */
export function MarquerLuALouverture({ id, nonLu }: { id: number; nonLu: boolean }) {
  const fait = useRef(false);
  useEffect(() => {
    if (!nonLu || fait.current) return;
    fait.current = true;
    void marquerLuAction(id, true);
  }, [id, nonLu]);
  return null;
}

export function BoutonsMessage({ id, nom }: { id: number; nom: string }) {
  const [executer, enCours] = useExecuter();
  const confirmer = useConfirmer();
  const router = useRouter();
  const lien = useLienAdmin();
  return (
    <>
      <button
        type="button"
        className="bo-bouton bo-bouton-secondaire"
        disabled={enCours}
        onClick={() => executer(() => marquerLuAction(id, false), { apres: (r) => r?.ok && router.push(lien("/messages")) })}
      >
        <Icone nom="message" taille={18} />
        Marquer comme non lu
      </button>
      <button
        type="button"
        className="bo-bouton bo-bouton-danger"
        disabled={enCours}
        onClick={async () => {
          if (
            await confirmer({
              titre: `Supprimer le message de ${nom} ?`,
              message: "Il sera effacé définitivement.",
              confirmer: "Supprimer le message",
              danger: true,
            })
          )
            executer(() => supprimerMessageAction(id), { apres: (r) => r?.ok && router.push(lien("/messages")) });
        }}
      >
        <Icone nom="poubelle" taille={18} />
        Supprimer
      </button>
    </>
  );
}

/** Droit à l'effacement : supprime tous les messages d'une adresse exacte. */
export function EffacerMessagesAdresse({ email, nombre }: { email: string; nombre: number }) {
  const [executer, enCours] = useExecuter();
  const confirmer = useConfirmer();
  const router = useRouter();
  const lien = useLienAdmin();
  return (
    <button
      type="button"
      className="bo-bouton bo-bouton-danger"
      disabled={enCours}
      onClick={async () => {
        const ok = await confirmer({
          titre: `Effacer ${nombre > 1 ? `les ${nombre} messages` : "le message"} de ${email} ?`,
          message: "À faire quand la personne demande la suppression de ses données. C’est définitif.",
          confirmer: "Tout effacer",
          danger: true,
        });
        if (!ok) return;
        const fd = new FormData();
        fd.set("email", email);
        executer(() => supprimerMessagesParEmailAction({ ok: false }, fd), { apres: (r) => r?.ok && router.push(lien("/messages")) });
      }}
    >
      <Icone nom="poubelle" taille={18} />
      Effacer tous les messages de cette adresse
    </button>
  );
}
