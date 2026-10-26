import { EcranAVenir } from "@/components/admin/ecran-a-venir";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Photos des pages" };

/** PROVISOIRE (lot fondation) : écran à construire par le lot backoffice (voir docs/FONDATION.md). */
export default async function Page() {
  await requireUser();
  return <EcranAVenir titre="Photos des pages" />;
}
