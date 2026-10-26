import { formaterJourCourt } from "@/lib/dates";

/**
 * Courbe des pages vues sur 30 jours, en SVG maison (aucune librairie, aucun appel réseau).
 * Les données viennent de `syntheseVues()` (lib/audience.ts), mesure agrégée côté serveur.
 */
export function CourbeVues({ parJour }: { parJour: { jour: string; compte: number }[] }) {
  const total = parJour.reduce((s, j) => s + j.compte, 0);
  if (parJour.length < 2 || total === 0) {
    return (
      <p className="bo-discret">Aucune visite mesurée sur les 30 derniers jours. Les chiffres apparaîtront dès les premières visites du site.</p>
    );
  }
  const largeur = 600;
  const hauteur = 160;
  const haut = 14;
  const bas = 6;
  const zone = hauteur - haut - bas;
  const max = Math.max(...parJour.map((j) => j.compte), 1);
  const pas = largeur / (parJour.length - 1);
  const points = parJour.map((j, i) => ({ x: +(i * pas).toFixed(2), y: +(haut + (1 - j.compte / max) * zone).toFixed(2) }));
  const trait = points.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");
  const base = haut + zone;
  const aire = `${trait} L${points.at(-1)!.x} ${base} L0 ${base} Z`;
  const fort = parJour.reduce((a, b) => (b.compte > a.compte ? b : a), parJour[0]);
  const iFort = parJour.indexOf(fort);
  return (
    <figure className="bo-pile" style={{ margin: 0, gap: "0.5rem" }}>
      <svg
        className="bo-courbe"
        viewBox={`0 0 ${largeur} ${hauteur}`}
        role="img"
        aria-label={`Pages vues par jour sur 30 jours : ${total} au total, au plus ${max} le ${formaterJourCourt(fort.jour)}.`}
      >
        <path className="bo-courbe-aire" d={aire} />
        <line className="bo-courbe-base" x1="0" y1={base} x2={largeur} y2={base} />
        <path className="bo-courbe-trait" d={trait} />
        <circle className="bo-courbe-point" cx={points[iFort].x} cy={points[iFort].y} r="4" />
      </svg>
      <figcaption className="bo-courbe-legende">
        <span>{formaterJourCourt(parJour[0].jour)}</span>
        <span>
          Meilleur jour : {max} vue{max > 1 ? "s" : ""} le {formaterJourCourt(fort.jour)}
        </span>
        <span>Aujourd’hui</span>
      </figcaption>
    </figure>
  );
}
