import Link from "next/link";
import { Etiquette } from "@/components/admin/champs";
import { Icone } from "@/components/admin/icones";
import { BoutonsMessage, MarquerLuALouverture } from "@/components/admin/messages/actions-message";
import { EntetePage } from "@/components/admin/mise-en-page";
import { siteConfig } from "@/config/site";
import { requireUser } from "@/lib/auth";
import { lienAdmin } from "@/lib/chemin-admin";
import { formaterHorodatage, formaterJourLong } from "@/lib/dates";
import { LIBELLES_TYPES_MESSAGE, lireMessage } from "@/lib/messages";

export const metadata = { title: "Message" };

export default async function PageMessage({ params }: PageProps<"/bo/messages/[id]">) {
  await requireUser();
  const { id } = await params;
  const m = /^\d{1,12}$/.test(id) ? lireMessage(Number(id)) : null;
  const retour = { href: lienAdmin("/messages"), libelle: "Messages" };
  if (!m) {
    return (
      <div className="bo-pile">
        <EntetePage retour={retour} titre="Message introuvable" introduction="Ce message n’existe plus (il a peut-être été supprimé)." />
      </div>
    );
  }
  const nom = `${m.prenom} ${m.nom}`.trim();
  const sujet = `${LIBELLES_TYPES_MESSAGE[m.type]} : votre demande à ${siteConfig.nom}`;
  const citation = m.message
    .split("\n")
    .map((l) => `> ${l}`)
    .join("\n");
  const corps = `Bonjour ${m.prenom},\n\n\n\n${siteConfig.nom}\n\n${"Votre message du " + formaterHorodatage(m.created_at)} :\n${citation}`;
  const mailto = `mailto:${m.email}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
  const tel = m.telephone.replace(/[^\d+]/g, "");

  return (
    <div className="bo-pile-large">
      <MarquerLuALouverture id={m.id} nonLu={!m.lu_le} />
      <EntetePage
        retour={retour}
        titre={nom}
        etiquettes={
          <>
            <Etiquette genre={m.type === "devis-traiteur" ? "succes" : "neutre"}>{LIBELLES_TYPES_MESSAGE[m.type]}</Etiquette>
            <span className="bo-discret">Reçu le {formaterHorodatage(m.created_at)}</span>
          </>
        }
      />

      <div className="bo-rangee" style={{ margin: 0 }}>
        <a href={mailto} className="bo-bouton bo-bouton-principal">
          <Icone nom="repondre" taille={18} />
          Répondre par e-mail
        </a>
        {tel ? (
          <a href={`tel:${tel}`} className="bo-bouton bo-bouton-secondaire">
            <Icone nom="telephone" taille={18} />
            Appeler {m.telephone}
          </a>
        ) : null}
      </div>

      <section className="bo-carte bo-pile" aria-label="Coordonnées et détails">
        <dl className="bo-definitions">
          <dt>E-mail</dt>
          <dd>
            <a href={`mailto:${m.email}`} className="bo-lien">
              {m.email}
            </a>
          </dd>
          <dt>Téléphone</dt>
          <dd>{m.telephone || "Non indiqué"}</dd>
          {m.date_evenement ? (
            <>
              <dt>Date de l’événement</dt>
              <dd>{formaterJourLong(m.date_evenement)}</dd>
            </>
          ) : null}
          {m.nb_personnes ? (
            <>
              <dt>Nombre de personnes</dt>
              <dd>{m.nb_personnes}</dd>
            </>
          ) : null}
        </dl>
      </section>

      <section className="bo-carte bo-pile" aria-labelledby="titre-message">
        <h2 id="titre-message" className="bo-sous-titre" style={{ margin: 0 }}>
          Message
        </h2>
        <p className="bo-message-corps">{m.message}</p>
      </section>

      <div className="bo-rangee" style={{ margin: 0 }}>
        <BoutonsMessage id={m.id} nom={nom} />
        <Link href={lienAdmin(`/messages?email=${encodeURIComponent(m.email)}`)} className="bo-bouton bo-bouton-discret">
          Tous les messages de cette personne
        </Link>
      </div>
    </div>
  );
}
