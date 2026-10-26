import Link from "next/link";
import { FlecheDroite } from "@/components/ui/motifs";
import s from "./sections.module.css";

/** Section « À voir aussi » : maillage interne avec les ancres de docs/COPY.md. */
export function VoirAussi({ liens, titre = "À voir aussi" }: { liens: { href: string; libelle: string }[]; titre?: string }) {
  return (
    <section className="section-serree" aria-labelledby="voir-aussi">
      <div className="contenu">
        <h2 id="voir-aussi" className={`titre-m ${s.voirAussiTitre}`}>
          {titre}
        </h2>
        <ul className={`sans-puces ${s.voirAussi}`}>
          {liens.map((l) => (
            <li key={l.href}>
              <Link href={l.href}>
                <span>{l.libelle}</span>
                <FlecheDroite taille={18} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
