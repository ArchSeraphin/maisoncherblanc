"use client";

import { Contretemps } from "@/components/site/contretemps";

/** Repli des erreurs hors du site public (le site a app/(site)/error.tsx). */
export default function Erreur({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="contenu">
      <Contretemps erreur={error} reessayer={reset} />
    </main>
  );
}
