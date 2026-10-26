import type { ReactNode } from "react";
import { LigneCarte } from "@/components/ui/motifs";
import type { Plat } from "@/lib/menus";
import s from "./sections.module.css";

export type LignePrix = { nom: ReactNode; prix: string; unite?: string; detail?: ReactNode };

/** Plat de la base -> ligne de prix (le nom affiché peut être reformulé). */
export function lignePlat(p: Plat | null, nom?: ReactNode, detail?: ReactNode): LignePrix | null {
  if (!p || !p.prix) return null;
  return { nom: nom ?? p.nom, prix: p.prix, unite: p.unite, detail };
}

/**
 * Repères de prix à points de conduite (« nom ........ prix UNITÉ »), tirés de
 * la carte en base. Les lignes `null` (plat absent ou masqué) sont omises.
 */
export function ListePrix({ lignes, className }: { lignes: (LignePrix | null)[]; className?: string }) {
  const valides = lignes.filter((l): l is LignePrix => l !== null);
  if (!valides.length) return null;
  return (
    <ul className={`sans-puces ${s.prix} ${className ?? ""}`}>
      {valides.map((l, i) => (
        <li key={i}>
          <LigneCarte nom={l.nom} prix={l.prix} unite={l.unite} detail={l.detail} />
        </li>
      ))}
    </ul>
  );
}
