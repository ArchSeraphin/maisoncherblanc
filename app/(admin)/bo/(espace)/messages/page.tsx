import Link from "next/link";
import { Etiquette } from "@/components/admin/champs";
import { Icone } from "@/components/admin/icones";
import { EffacerMessagesAdresse } from "@/components/admin/messages/actions-message";
import { EntetePage, EtatVide } from "@/components/admin/mise-en-page";
import { siteConfig } from "@/config/site";
import { requireUser } from "@/lib/auth";
import { lienAdmin } from "@/lib/chemin-admin";
import { formaterHorodatage } from "@/lib/dates";
import {
  compterMessages,
  compterMessagesNonLus,
  estEmailValide,
  LIBELLES_TYPES_MESSAGE,
  listerMessages,
  listerMessagesParEmail,
} from "@/lib/messages";

export const metadata = { title: "Messages" };

export default async function PageMessages({ searchParams }: PageProps<"/bo/messages">) {
  await requireUser();
  const sp = await searchParams;
  const filtre = sp.filtre === "non-lus" ? "non-lus" : "tous";
  const email = typeof sp.email === "string" ? sp.email.trim().slice(0, 254) : "";
  const messages = listerMessages({ nonLusSeulement: filtre === "non-lus", email, limite: 200 });
  const total = compterMessages();
  const nonLus = compterMessagesNonLus();
  const exacts = email && estEmailValide(email.toLowerCase()) ? listerMessagesParEmail(email.toLowerCase()) : [];
  const lienFiltre = (f: string) => lienAdmin(`/messages${f === "non-lus" ? "?filtre=non-lus" : ""}`);

  return (
    <div className="bo-pile-large">
      <EntetePage
        titre="Messages"
        introduction={`Les demandes envoyées depuis le formulaire du site. Ils sont effacés automatiquement après ${siteConfig.confidentialite.conservationMessagesMois} mois.`}
      />

      <div className="bo-pile">
        <nav className="bo-filtres" aria-label="Filtrer les messages">
          <Link href={lienFiltre("tous")} aria-current={filtre === "tous" && !email ? "page" : undefined}>
            Tous ({total})
          </Link>
          <Link href={lienFiltre("non-lus")} aria-current={filtre === "non-lus" ? "page" : undefined}>
            Non lus ({nonLus})
          </Link>
        </nav>
        <form method="get" action={lienAdmin("/messages")} className="bo-recherche" role="search">
          <Icone nom="recherche" />
          <label htmlFor="recherche-email" className="bo-invisible">
            Rechercher par adresse e-mail
          </label>
          <input
            id="recherche-email"
            name="email"
            type="search"
            defaultValue={email}
            className="bo-saisie"
            placeholder="Rechercher par adresse e-mail…"
            inputMode="email"
            autoCapitalize="off"
          />
        </form>
      </div>

      {exacts.length ? (
        <section className="bo-carte bo-pile" aria-labelledby="titre-rgpd">
          <h2 id="titre-rgpd" className="bo-sous-titre" style={{ margin: 0 }}>
            Données de {email.toLowerCase()}
          </h2>
          <p className="bo-discret">
            {exacts.length} message{exacts.length > 1 ? "s" : ""} de cette adresse. Si la personne demande à voir ses données, envoyez-lui le contenu
            ci-dessous ; si elle demande leur suppression, effacez-les.
          </p>
          <div>
            <EffacerMessagesAdresse email={email.toLowerCase()} nombre={exacts.length} />
          </div>
        </section>
      ) : null}

      {messages.length ? (
        <ul className="bo-messages">
          {messages.map((m) => (
            <li key={m.id}>
              <Link href={lienAdmin(`/messages/${m.id}`)} className="bo-message-ligne" data-non-lu={m.lu_le ? undefined : "oui"}>
                <span className="bo-point" aria-hidden="true" style={m.lu_le ? { visibility: "hidden" } : undefined} />
                <span>
                  {m.prenom} {m.nom}
                  {m.lu_le ? null : <span className="bo-invisible"> (non lu)</span>}
                </span>
                <span className="bo-pile" style={{ gap: "0.1rem", minWidth: 0 }}>
                  <span>
                    <Etiquette genre={m.type === "devis-traiteur" ? "succes" : "neutre"}>{LIBELLES_TYPES_MESSAGE[m.type]}</Etiquette>
                  </span>
                  <span className="bo-extrait">{m.message}</span>
                </span>
                <span className="bo-discret" style={{ fontWeight: 400 }}>
                  {formaterHorodatage(m.created_at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : email ? (
        <EtatVide titre={`Aucun message pour « ${email} »`}>Vérifiez l’adresse, ou effacez la recherche pour revoir tous les messages.</EtatVide>
      ) : filtre === "non-lus" ? (
        <EtatVide titre="Tout est lu">Aucun message en attente.</EtatVide>
      ) : (
        <EtatVide titre="Aucun message pour l’instant">
          Les demandes de devis et de commande envoyées depuis la page Contact apparaîtront ici.
        </EtatVide>
      )}
    </div>
  );
}
