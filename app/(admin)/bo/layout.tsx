/**
 * Layout racine du backoffice (servi via /${ADMIN_PATH}/*, réécrit par proxy.ts).
 *
 * Expose le chemin secret aux composants clients (`FournisseurCheminAdmin`),
 * lu au runtime : jamais en dur. Pas d'authentification ici : la connexion vit
 * sous ce layout ; les écrans protégés sont dans `(espace)` (requireUser).
 * `admin.css` n'est importé QU'ICI (classes `bo-*`).
 */

import type { Metadata } from "next";
import { FournisseurCheminAdmin } from "@/components/admin/contexte-admin";
import { cheminAdmin } from "@/lib/chemin-admin";
import "./admin.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Gestion du site", template: "%s · Gestion Maison Cherblanc" },
  robots: { index: false, follow: false, nocache: true },
  referrer: "same-origin",
};

export default function LayoutAdmin({ children }: LayoutProps<"/bo">) {
  return (
    <FournisseurCheminAdmin base={cheminAdmin()}>
      <div className="bo-racine">{children}</div>
    </FournisseurCheminAdmin>
  );
}
