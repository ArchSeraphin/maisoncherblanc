"use client";

import { Contretemps } from "@/components/site/contretemps";

/** Erreur d'une page publique : message sobre dans le layout du site (en-tête et pied conservés). */
export default function ErreurSite({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <Contretemps erreur={error} reessayer={reset} />;
}
