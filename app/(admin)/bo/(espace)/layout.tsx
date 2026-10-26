/**
 * Écrans protégés du backoffice. `requireUser()` ici ET en tête de chaque page
 * et Server Action (la sécurité ne repose jamais sur le seul layout).
 */

import { CoqueAdmin } from "@/components/admin/coque";
import { actionDeconnexion } from "@/lib/actions/auth";
import { requireUser } from "@/lib/auth";
import { compterMessagesNonLus } from "@/lib/messages";

export default async function LayoutEspace({ children }: LayoutProps<"/bo">) {
  const u = await requireUser();
  return (
    <CoqueAdmin
      utilisateur={{ name: u.name, email: u.email }}
      actionDeconnexion={actionDeconnexion}
      pastilles={{ "/messages": compterMessagesNonLus() }}
    >
      {children}
    </CoqueAdmin>
  );
}
