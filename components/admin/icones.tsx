import type { NomIcone } from "./navigation";

/** Icônes au trait du backoffice (décoratives : aria-hidden). */
const CHEMINS = {
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
  haut: "M12 19V5M6 11l6-6 6 6",
  bas: "M12 5v14M6 13l6 6 6-6",
  poignee: "M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01",
  poubelle: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  oeil: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  masque:
    "M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2",
  crayon: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
  plus: "M12 5v14M5 12h14",
  copie: "M8 8h12v12H8zM16 8V4H4v12h4",
  recherche: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  envoi: "M12 16V4M7 9l5-5 5 5M4 16v4h16v-4",
  document: "M6 3h9l4 4v14H6zM14 3v5h5",
  coche: "M5 12l5 5 9-10",
  alerte: "M12 3 2 20h20zM12 10v4M12 17h.01",
  calendrier: "M4 6h16v14H4zM4 10h16M8 3v5M16 3v5",
  repondre: "M10 8 4 13l6 5M4 13h10a6 6 0 0 1 6 6",
  telephone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  cle: "M14 10a4 4 0 1 0-1.2 2.8L20 20M17 17l2-2",
  prix: "M20 12 12 20l-8-8V4h8zM8 8h.01",
  chevron: "m9 6 6 6-6 6",
};

/** Toutes les icônes de la navigation doivent exister (vérifié à la compilation). */
const _icones: Record<NomIcone, string> = CHEMINS;
void _icones;

export type NomIconeAdmin = keyof typeof CHEMINS;

export function Icone({ nom, taille = 20 }: { nom: NomIconeAdmin; taille?: number }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={nom === "poignee" ? 3 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={CHEMINS[nom]} />
    </svg>
  );
}
