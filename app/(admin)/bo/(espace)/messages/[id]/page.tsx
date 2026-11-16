import Link from "next/link";
import { Etiquette } from "@/components/admin/champs";
import { Icone } from "@/components/admin/icones";
import { BoutonImprimer, BoutonsMessage, MarquerLuALouverture } from "@/components/admin/messages/actions-message";
import { EntetePage } from "@/components/admin/mise-en-page";
import { siteConfig } from "@/config/site";
import { requireUser } from "@/lib/auth";
import { lienAdmin } from "@/lib/chemin-admin";
import { formaterHorodatage, formaterJourLong } from "@/lib/dates";
import { lireDetailsFiche, sectionsFiche } from "@/lib/fiche-mariage";
import { libelleMessage, lireMessage } from "@/lib/messages";

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
  const fiche = lireDetailsFiche(m.details);
  const libelle = libelleMessage(m);
  const sujet = fiche ? `Votre mariage : votre demande de devis à ${siteConfig.nom}` : `${libelle} : votre demande à ${siteConfig.nom}`;
  const citation = m.message
    .split("\n")
    .map((l) => `> ${l}`)
    .join("\n");
  // Fiche mariage : pas de citation (le récapitulatif entier rendrait le lien mailto trop long).
  const corps = fiche
    ? `Bonjour ${m.prenom},\n\nMerci pour votre fiche mariage du ${formaterHorodatage(m.created_at)}.\n\n\n\n${siteConfig.nom}`
    : `Bonjour ${m.prenom},\n\n\n\n${siteConfig.nom}\n\n${"Votre message du " + formaterHorodatage(m.created_at)} :\n${citation}`;
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
            <Etiquette genre={m.type === "devis-traiteur" ? "succes" : "neutre"}>{libelle}</Etiquette>
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
        {fiche ? <BoutonImprimer /> : null}
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

      {fiche ? (
        sectionsFiche(fiche)
          .slice(1)
          .map((s) => (
            <section key={s.titre} className="bo-carte bo-pile bo-fiche-section" aria-labelledby={`fiche-${s.etape}`}>
              <h2 id={`fiche-${s.etape}`} className="bo-sous-titre" style={{ margin: 0 }}>
                {s.titre}
              </h2>
              <dl className="bo-definitions">
                {s.lignes.map((l) => (
                  <div key={l.libelle} style={{ display: "contents" }}>
                    <dt>{l.libelle}</dt>
                    <dd style={{ whiteSpace: "pre-line" }}>{l.valeur}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))
      ) : (
        <section className="bo-carte bo-pile" aria-labelledby="titre-message">
          <h2 id="titre-message" className="bo-sous-titre" style={{ margin: 0 }}>
            Message
          </h2>
          <p className="bo-message-corps">{m.message}</p>
        </section>
      )}

      <div className="bo-rangee" style={{ margin: 0 }}>
        <BoutonsMessage id={m.id} nom={nom} />
        <Link href={lienAdmin(`/messages?email=${encodeURIComponent(m.email)}`)} className="bo-bouton bo-bouton-discret">
          Tous les messages de cette personne
        </Link>
      </div>
    </div>
  );
}
