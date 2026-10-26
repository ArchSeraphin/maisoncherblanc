import type { NomIcone } from "./navigation";

/** Icônes au trait du backoffice (décoratives : aria-hidden). */
const CHEMINS: Record<NomIcone | "fermer" | "menu" | "externe" | "sortie", string> = {
  accueil: "M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z",
  carte: "M6 3h10l3 3v15H6zM9 9h7M9 13h7M9 17h4",
  horloge: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4v5l3 2",
  annonce: "M4 10v4h3l6 4V6L7 10zM17 9a4 4 0 0 1 0 6",
  journal: "M5 4h11l3 3v13H5zM8 9h8M8 13h8M8 17h5",
  etoile: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
  galerie: "M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6",
  photo: "M4 7h4l2-2h4l2 2h4v12H4zM12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  message: "M3 5h18v14H3zm0 0 9 7 9-7",
  personnes: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 3a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3",
  fermer: "M6 6l12 12M18 6 6 18",
  menu: "M4 7h16M4 12h16M4 17h16",
  externe: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  sortie: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
};

export function Icone({ nom, taille = 20 }: { nom: keyof typeof CHEMINS; taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={CHEMINS[nom]} />
    </svg>
  );
}
