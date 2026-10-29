"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import styles from "./consentement.module.css";

/**
 * Bandeau de consentement et chargement de Google Analytics (GA4).
 *
 * Rendu par l'habillage seulement si `GA_MEASUREMENT_ID` est défini (hors préproduction).
 * Aucun script Google n'est chargé avant « Accepter ». Le choix est gardé dans le
 * stockage local (pas de cookie) pendant 6 mois, puis le bandeau est reproposé.
 * « Refuser » est aussi simple qu'« Accepter » (recommandation CNIL) ; le lien
 * « Gérer les cookies » (pied de page, politique de confidentialité) rouvre le bandeau.
 * Signaux publicitaires désactivés ; cookies `_ga*` limités à 13 mois.
 */

type Choix = "accepte" | "refuse";

const CLE = "mc-cookies";
const EVENEMENT_CHOIX = "mc:cookies-choix";
const EVENEMENT_GERER = "mc:cookies-gerer";
const DUREE_CHOIX_MS = 182 * 24 * 60 * 60 * 1000;
const DUREE_COOKIE_S = 13 * 30 * 24 * 60 * 60;

function lireChoix(): Choix | "aucun" {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return "aucun";
    const { choix, le } = JSON.parse(brut) as { choix?: string; le?: number };
    if ((choix !== "accepte" && choix !== "refuse") || typeof le !== "number" || Date.now() - le > DUREE_CHOIX_MS) return "aucun";
    return choix;
  } catch {
    return "aucun";
  }
}

function ecrireChoix(choix: Choix) {
  try {
    localStorage.setItem(CLE, JSON.stringify({ choix, le: Date.now() }));
  } catch {
    // Stockage indisponible (navigation privée stricte) : le choix vaut pour la page en cours.
  }
  window.dispatchEvent(new CustomEvent(EVENEMENT_CHOIX, { detail: choix }));
}

function abonner(rappel: () => void) {
  window.addEventListener(EVENEMENT_CHOIX, rappel);
  window.addEventListener("storage", rappel);
  return () => {
    window.removeEventListener(EVENEMENT_CHOIX, rappel);
    window.removeEventListener("storage", rappel);
  };
}

type FenetreGa = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void } & Record<string, unknown>;

let gaCharge = false;

function chargerGa(id: string) {
  const w = window as unknown as FenetreGa;
  w[`ga-disable-${id}`] = false;
  if (gaCharge) return;
  gaCharge = true;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // gtag.js attend l'objet `arguments` lui-même, pas un tableau.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  w.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  w.gtag("js", new Date());
  w.gtag("config", id, { allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: DUREE_COOKIE_S });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

/** Retrait du consentement : coupe la collecte et efface les cookies `_ga*` (domaine du site et domaine parent). */
function couperGa(id: string) {
  const w = window as unknown as FenetreGa;
  w[`ga-disable-${id}`] = true;
  w.gtag?.("consent", "update", { analytics_storage: "denied" });
  const hote = location.hostname;
  const parent = hote.split(".").slice(-2).join(".");
  for (const morceau of document.cookie.split(";")) {
    const nom = morceau.split("=")[0].trim();
    if (!nom.startsWith("_ga")) continue;
    for (const domaine of ["", `; domain=${hote}`, `; domain=.${parent}`]) {
      document.cookie = `${nom}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domaine}`;
    }
  }
}

export function Consentement({ idGa }: { idGa: string }) {
  const choix = useSyncExternalStore(abonner, lireChoix, () => "attente" as const);
  const [rouvert, setRouvert] = useState(false);

  useEffect(() => {
    const ouvrir = () => setRouvert(true);
    window.addEventListener(EVENEMENT_GERER, ouvrir);
    return () => window.removeEventListener(EVENEMENT_GERER, ouvrir);
  }, []);

  useEffect(() => {
    if (choix === "accepte") chargerGa(idGa);
    else if (choix === "refuse" && gaCharge) couperGa(idGa);
  }, [choix, idGa]);

  if (choix === "attente" || (choix !== "aucun" && !rouvert)) return null;

  const decider = (c: Choix) => {
    ecrireChoix(c);
    setRouvert(false);
  };

  return (
    <section className={`${styles.bandeau} fond-olive-profond`} aria-labelledby="cookies-titre">
      <h2 id="cookies-titre" className={styles.titre}>
        Mesure d’audience
      </h2>
      <p className={styles.texte}>
        Avec votre accord, nous utilisons Google Analytics pour savoir quelles pages vous sont utiles. Aucun cookie publicitaire.{" "}
        <Link href="/politique-de-confidentialite" className="lien-souligne">
          En savoir plus
        </Link>
      </p>
      <div className={styles.actions}>
        <button type="button" className="bouton bouton-petit" onClick={() => decider("refuse")}>
          Refuser
        </button>
        <button type="button" className="bouton bouton-petit" onClick={() => decider("accepte")}>
          Accepter
        </button>
      </div>
    </section>
  );
}

/** Lien « Gérer les cookies » : rouvre le bandeau. */
export function BoutonCookies({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={`${styles.lienBouton} ${className ?? ""}`}
      onClick={() => window.dispatchEvent(new Event(EVENEMENT_GERER))}
    >
      Gérer les cookies
    </button>
  );
}
