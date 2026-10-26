/**
 * Petits éléments de marque partagés (Server Components, sans état).
 */

/** Surtitre DM Sans capitales espacées, cuivre (« PLATEAUX & FORMULES »). */
export function Surtitre({ children, centre = false, as: Balise = "p" }: { children: React.ReactNode; centre?: boolean; as?: "p" | "span" | "div" }) {
  return <Balise className={`surtitre${centre ? " surtitre-centre" : ""}`}>{children}</Balise>;
}

/** Filet fin cuivre avec petit losange central (séparateur de section). */
export function FiletLosange({ className }: { className?: string }) {
  return (
    <div className={`filet-losange${className ? ` ${className}` : ""}`} role="presentation" aria-hidden="true">
      <span />
    </div>
  );
}

/** Flèche droite (liens « En savoir plus »), glisse de 4 px au survol dans `.lien-fleche`. */
export function FlecheDroite({ taille = 16 }: { taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Ligne de carte à points de conduite : « nom ........ prix UNITÉ ».
 * `detail` : ligne secondaire (composition courte), facultative.
 */
export function LigneCarte({
  nom,
  prix,
  unite,
  detail,
  badge,
}: {
  nom: React.ReactNode;
  prix: string;
  unite?: string;
  detail?: React.ReactNode;
  badge?: string | null;
}) {
  return (
    <div className="ligne-carte">
      <span className="ligne-carte__nom">
        {nom}
        {badge ? <> <span className="badge">{badge}</span></> : null}
      </span>
      <span className="ligne-carte__points" aria-hidden="true" />
      <span className="ligne-carte__prix">
        {prix ? <span className="prix">{prix}</span> : null}
        {unite ? <span className="unite">{unite}</span> : null}
      </span>
      {detail ? <span className="ligne-carte__detail">{detail}</span> : null}
    </div>
  );
}
