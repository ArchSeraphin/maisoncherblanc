import { AjoutAdmin, ListeAdmins, MonMotDePasse, MonProfil } from "@/components/admin/administrateurs/administrateurs";
import { EntetePage } from "@/components/admin/mise-en-page";
import { listerAdmins } from "@/lib/admins";
import { requireUser } from "@/lib/auth";
import { formaterHorodatage } from "@/lib/dates";

export const metadata = { title: "Administrateurs" };

export default async function PageAdministrateurs() {
  const moi = await requireUser();
  const admins = listerAdmins();
  return (
    <div className="bo-pile-large">
      <EntetePage
        titre="Administrateurs"
        introduction="Les personnes qui peuvent gérer le site. Chacune a son propre compte et son propre mot de passe."
      />

      <section className="bo-section" aria-labelledby="titre-comptes">
        <h2 id="titre-comptes" className="bo-sous-titre">
          Comptes ({admins.length})
        </h2>
        <ListeAdmins
          admins={admins.map((a) => ({ id: a.id, email: a.email, name: a.name, creeLe: formaterHorodatage(a.created_at), moi: a.id === moi.id }))}
        />
        {admins.length <= 1 ? (
          <p className="bo-discret">Vous êtes le seul administrateur : ajoutez un second compte pour ne jamais rester bloqué.</p>
        ) : null}
      </section>

      <details className="bo-replie">
        <summary>Ajouter un administrateur</summary>
        <div className="bo-replie-corps">
          <AjoutAdmin />
        </div>
      </details>

      <section className="bo-section bo-carte" aria-labelledby="titre-mon-compte">
        <h2 id="titre-mon-compte" className="bo-sous-titre" style={{ margin: 0 }}>
          Mon compte
        </h2>
        <MonProfil nom={moi.name} email={moi.email} />
        <hr className="bo-separateur" />
        <h3 className="bo-sous-titre" style={{ fontSize: "1.1rem", margin: 0 }}>
          Changer mon mot de passe
        </h3>
        <p className="bo-discret">Vos autres appareils (téléphone, tablette) seront déconnectés : reconnectez-vous avec le nouveau mot de passe.</p>
        <MonMotDePasse />
      </section>
    </div>
  );
}
