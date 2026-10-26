import { AjoutAvis, ListeAvis } from "@/components/admin/avis/avis";
import { EntetePage, EtatVide } from "@/components/admin/mise-en-page";
import { requireUser } from "@/lib/auth";
import { listerAvisAdmin } from "@/lib/avis";

export const metadata = { title: "Avis clients" };

export default async function PageAvis() {
  await requireUser();
  const avis = listerAvisAdmin();
  return (
    <div className="bo-pile-large">
      <EntetePage
        titre="Avis clients"
        introduction="Recopiez ici de vrais avis (Google ou reçus en direct, avec l’accord de la personne). Ils s’affichent sur le site dans l’ordre choisi ; sans avis, la rubrique n’apparaît pas."
      />

      <section className="bo-section" aria-labelledby="titre-avis">
        <div className="bo-section-entete">
          <h2 id="titre-avis" className="bo-sous-titre">
            Avis affichés
          </h2>
          <span className="bo-discret">
            {avis.length} avis{avis.length ? `, dont ${avis.filter((a) => a.visible).length} sur le site` : ""}
          </span>
        </div>
        {avis.length ? (
          <ListeAvis
            avis={avis.map((a) => ({ id: a.id, auteur: a.auteur, texte: a.texte, note: a.note, source: a.source, date: a.date, visible: a.visible }))}
          />
        ) : (
          <EtatVide titre="Aucun avis pour l’instant">
            Ajoutez votre premier avis avec le formulaire ci-dessous. Jamais d’avis inventé : uniquement des avis réels, recopiés tels quels.
          </EtatVide>
        )}
      </section>

      <section className="bo-section bo-carte" aria-labelledby="titre-ajout-avis">
        <h2 id="titre-ajout-avis" className="bo-sous-titre" style={{ margin: 0 }}>
          Ajouter un avis
        </h2>
        <AjoutAvis />
      </section>
    </div>
  );
}
