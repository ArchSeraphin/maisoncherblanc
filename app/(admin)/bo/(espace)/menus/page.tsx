import { EcranAVenir } from "@/components/admin/ecran-a-venir";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Carte & menus" };

/** PROVISOIRE (lot fondation) : écran à construire par le lot backoffice (voir docs/FONDATION.md). */
export default async function Page() {
  await requireUser();
  return <EcranAVenir titre="Carte & menus" />;
}
