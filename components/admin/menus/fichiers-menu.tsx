"use client";

/** PDF à télécharger et photo de couverture d'un menu. */

import { definirCouvertureMenuAction, retirerCouvertureMenuAction, retirerPdfMenuAction } from "@/lib/actions/menus";
import { formaterPoids, type DocumentMedia, type ImageMedia } from "@/lib/media-url";
import { useExecuter } from "../executer";
import { Icone } from "../icones";
import { EnvoiFichier, Mediatheque, Vignette, type ImagePourChoix } from "../photos/choix-photo";
import { useConfirmer } from "../retours";

export function FichiersMenu({
  menuId,
  pdf,
  couverture,
  mediatheque,
}: {
  menuId: number;
  pdf: DocumentMedia | null;
  couverture: ImageMedia | null;
  mediatheque: ImagePourChoix[];
}) {
  const [executer, enCours] = useExecuter();
  const confirmer = useConfirmer();
  return (
    <div className="bo-pile-large" style={{ gap: "1.75rem" }}>
      <div className="bo-pile">
        <h3 className="bo-sous-titre" style={{ fontSize: "1.1rem", margin: 0 }}>
          PDF à télécharger
        </h3>
        <p className="bo-discret">Le menu imprimé, proposé au téléchargement sur le site. Envoyer un nouveau PDF remplace l’ancien.</p>
        {pdf ? (
          <div className="bo-rangee" style={{ margin: 0 }}>
            <a href={pdf.url} target="_blank" rel="noreferrer" className="bo-bouton bo-bouton-secondaire">
              <Icone nom="document" taille={18} />
              Ouvrir le PDF actuel ({formaterPoids(pdf.poids)})<span className="bo-invisible"> (nouvel onglet)</span>
            </a>
            <button
              type="button"
              className="bo-bouton bo-bouton-danger"
              disabled={enCours}
              onClick={async () => {
                if (
                  await confirmer({
                    titre: "Retirer le PDF ?",
                    message: "Le bouton de téléchargement disparaîtra du site.",
                    confirmer: "Retirer le PDF",
                    danger: true,
                  })
                )
                  executer(() => retirerPdfMenuAction(menuId));
              }}
            >
              Retirer le PDF
            </button>
          </div>
        ) : (
          <p className="bo-alerte">Aucun PDF : le site n’affiche pas de bouton de téléchargement pour ce menu.</p>
        )}
        <div>
          <EnvoiFichier
            genre="pdf"
            champs={{ usage: "menu-pdf", menu_id: String(menuId) }}
            libelleBouton={pdf ? "Remplacer le PDF" : "Envoyer le PDF"}
          />
        </div>
      </div>

      <div className="bo-pile">
        <h3 className="bo-sous-titre" style={{ fontSize: "1.1rem", margin: 0 }}>
          Photo de couverture
        </h3>
        <p className="bo-discret">Facultative : illustre ce menu sur le site.</p>
        <div className="bo-fichier">
          <Vignette image={couverture} />
          <div className="bo-pile">
            <div className="bo-rangee" style={{ margin: 0 }}>
              <Mediatheque
                images={mediatheque}
                selection={couverture?.id}
                surChoix={(img) => executer(() => definirCouvertureMenuAction(menuId, img.id))}
              />
              {couverture ? (
                <button
                  type="button"
                  className="bo-bouton bo-bouton-discret"
                  disabled={enCours}
                  onClick={() => executer(() => retirerCouvertureMenuAction(menuId))}
                >
                  Retirer la photo
                </button>
              ) : null}
            </div>
            <div>
              <EnvoiFichier
                champs={{ usage: "media" }}
                libelleBouton="Envoyer une nouvelle photo"
                silencieux
                surTermine={(id) => executer(() => definirCouvertureMenuAction(menuId, id))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
