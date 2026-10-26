import { AjoutExceptionnel, ListeExceptionnels } from "@/components/admin/horaires/exceptionnels";
import { SemaineType } from "@/components/admin/horaires/semaine-type";
import { EntetePage, VoirSurLeSite } from "@/components/admin/mise-en-page";
import { requireUser } from "@/lib/auth";
import { jourParis } from "@/lib/dates";
import { listerHorairesExceptionnels } from "@/lib/horaires-exceptionnels";
import { lireHoraires } from "@/lib/reglages";

export const metadata = { title: "Horaires" };

export default async function PageHoraires() {
  await requireUser();
  const jour = jourParis();
  const tous = listerHorairesExceptionnels();
  const aVenir = tous.filter((h) => h.date >= jour);
  const passes = tous.filter((h) => h.date < jour).reverse();

  return (
    <div className="bo-pile-large">
      <EntetePage
        titre="Horaires"
        introduction="Les horaires de la boutique affichés sur le site (pied de page, page Contact, Google). Une fermeture exceptionnelle s’affiche automatiquement 30 jours avant."
        actions={<VoirSurLeSite chemin="/contact" />}
      />

      <section className="bo-section bo-carte" aria-labelledby="ajouter" id="ajouter-section">
        <h2 id="ajouter" className="bo-sous-titre" style={{ margin: 0 }}>
          Ajouter une fermeture ou un horaire exceptionnel
        </h2>
        <AjoutExceptionnel />
      </section>

      <section className="bo-section" aria-labelledby="a-venir">
        <div className="bo-section-entete">
          <h2 id="a-venir" className="bo-sous-titre">
            Dates à venir
          </h2>
          <span className="bo-discret">
            {aVenir.length} date{aVenir.length > 1 ? "s" : ""}
          </span>
        </div>
        <ListeExceptionnels elements={aVenir} vide="Aucune date exceptionnelle à venir : la semaine type s’applique." />
      </section>

      <section className="bo-section" aria-labelledby="semaine">
        <h2 id="semaine" className="bo-sous-titre">
          Semaine type
        </h2>
        <p className="bo-introduction">Les horaires habituels, jour par jour. Pour une coupure le midi, ajoutez l’après-midi.</p>
        <SemaineType horaires={lireHoraires()} />
      </section>

      {passes.length ? (
        <details className="bo-replie">
          <summary>Dates passées ({passes.length})</summary>
          <div className="bo-replie-corps">
            <p className="bo-discret" style={{ marginBottom: "0.75rem" }}>
              Elles ne sont plus affichées sur le site et sont effacées automatiquement après 60 jours.
            </p>
            <ListeExceptionnels elements={passes} vide="" />
          </div>
        </details>
      ) : null}
    </div>
  );
}
