"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { envoyerFicheMariageAction } from "@/lib/actions/fiche-mariage";
import { formaterJourLong, jourParis } from "@/lib/dates";
import {
  COURS,
  dateTropProche,
  erreursEtape,
  ETAPES,
  ficheVide,
  LIBELLES_CHOIX_COURS,
  LIBELLES_COURS,
  LIBELLES_MATERIEL,
  LIBELLES_PLAT,
  LIBELLES_SERVICE,
  LIBELLES_VIN_HONNEUR,
  LIMITES_FICHE,
  MATERIEL,
  normaliserFiche,
  premiereEtapeEnErreur,
  sectionsFiche,
  type CleCours,
  type Fiche,
} from "@/lib/fiche-mariage";
import { etatInitial, type EtatAction } from "@/lib/formulaire";
import styles from "./fiche-mariage.module.css";

/** Brouillon conservé dans ce navigateur (rien ne part tant que la fiche n'est pas envoyée). */
const CLE_BROUILLON = "cherblanc:fiche-mariage:v1";
const DERNIERE = ETAPES.length - 1;

const INTROS: ReactNode[] = [
  "Pour commencer, vos coordonnées : nous vous rappelons pour affiner le menu et le devis ensemble.",
  "Les informations essentielles. Une estimation suffit : rien n’est figé à ce stade.",
  "Le premier moment où tous vos invités se retrouvent. Dites-nous si vous l’imaginez avec nous.",
  "Pour chaque moment du repas, donnez-nous vos envies, ou laissez-nous vous faire une proposition.",
  "La façon dont vous voulez être servis, et ce que nous apportons le jour J.",
  "Tout ce qui nous aidera à préparer une proposition juste.",
  "Relisez votre fiche avant de nous l’envoyer. Chaque partie reste modifiable.",
];

function majuscule(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** « dans 7 mois », « dans 3 semaines », « dans 5 jours ». */
function delaiAvant(date: string, aujourdhui: string): string {
  const jours = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${aujourdhui}T00:00:00Z`)) / 86_400_000);
  if (jours <= 0) return "aujourd’hui";
  if (jours === 1) return "demain";
  if (jours < 14) return `dans ${jours} jours`;
  if (jours < 61) return `dans ${Math.round(jours / 7)} semaines`;
  const mois = Math.round(jours / 30.44);
  return mois >= 24 ? `dans ${Math.floor(mois / 12)} ans` : `dans ${mois} mois`;
}

type Options<T extends string> = { valeur: T; libelle: string; texte?: string }[];

export function FicheMariage({
  jeton,
  telephone,
  mobile,
  conservationMois,
}: {
  jeton: string;
  telephone: { affichage: string; href: string };
  mobile: { affichage: string; href: string };
  conservationMois: number;
}) {
  const [etat, envoyer, enCours] = useActionState<EtatAction, FormData>(envoyerFicheMariageAction, etatInitial);
  const [fiche, setFiche] = useState<Fiche>(ficheVide);
  const [etape, setEtape] = useState(0);
  /** Étape la plus avancée atteinte : on peut y revenir directement depuis le sommaire. */
  const [atteinte, setAtteinte] = useState(0);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [brouillon, setBrouillon] = useState<"aucun" | "retrouve">("aucun");
  const [charge, setCharge] = useState(false);
  const refCadre = useRef<HTMLDivElement>(null);
  const refTitre = useRef<HTMLHeadingElement>(null);
  const refRetour = useRef<HTMLDivElement>(null);
  const premierRendu = useRef(true);
  const aujourdhui = jourParis();

  // Nouvelle réponse du serveur : erreurs reprises et retour à la première étape concernée.
  const [etatVu, setEtatVu] = useState(etat);
  if (etat !== etatVu) {
    setEtatVu(etat);
    if (etat.erreurs && Object.keys(etat.erreurs).length) {
      setErreurs(etat.erreurs);
      const e = premiereEtapeEnErreur(etat.erreurs);
      if (e >= 0) setEtape(e);
    }
  }
  const jetonCourant = etat.valeurs?.jeton || jeton;
  const envoye = etat.ok && etat.message === "envoye";

  // Brouillon : relu une fois au chargement (le stockage peut être indisponible).
  useEffect(() => {
    try {
      const brut = window.localStorage.getItem(CLE_BROUILLON);
      if (brut) {
        const d = JSON.parse(brut) as { fiche?: unknown; etape?: unknown; atteinte?: unknown };
        const f = normaliserFiche(d.fiche);
        const a = Math.min(Math.max(Number(d.atteinte) || 0, 0), DERNIERE);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique du stockage local après l'hydratation
        setFiche(f);
        setAtteinte(a);
        setEtape(Math.min(Math.max(Number(d.etape) || 0, 0), a));
        setBrouillon("retrouve");
      }
    } catch {
      /* stockage indisponible : on part d'une fiche vide */
    }
    setCharge(true);
  }, []);

  // Enregistrement du brouillon à chaque changement ; effacé une fois la fiche envoyée.
  useEffect(() => {
    if (!charge) return;
    try {
      if (envoye) window.localStorage.removeItem(CLE_BROUILLON);
      else window.localStorage.setItem(CLE_BROUILLON, JSON.stringify({ fiche, etape, atteinte }));
    } catch {
      /* stockage indisponible : la fiche reste utilisable */
    }
  }, [charge, envoye, fiche, etape, atteinte]);

  // Changement d'étape : retour en haut de la fiche, focus sur le titre de l'étape.
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    refCadre.current?.scrollIntoView({ behavior: reduit ? "auto" : "smooth", block: "start" });
    refTitre.current?.focus({ preventScroll: true });
  }, [etape]);

  // Après l'envoi (ou un refus global) : focus sur le message de retour.
  useEffect(() => {
    if (etat === etatInitial) return;
    if (etat.ok || etat.message) {
      refRetour.current?.focus({ preventScroll: true });
      refRetour.current?.scrollIntoView({ block: "start" });
    }
  }, [etat]);

  function maj<K extends keyof Fiche>(cle: K, valeur: Fiche[K]) {
    setFiche((f) => ({ ...f, [cle]: valeur }));
    if (erreurs[cle as string]) {
      setErreurs((e) => {
        const reste = { ...e };
        delete reste[cle as string];
        return reste;
      });
    }
  }

  function majCours(c: CleCours, partiel: Partial<Fiche["cours"][CleCours]>) {
    setFiche((f) => ({ ...f, cours: { ...f.cours, [c]: { ...f.cours[c], ...partiel } } }));
  }

  function focusErreur(e: Record<string, string>) {
    const premier = Object.keys(e)[0];
    if (premier) requestAnimationFrame(() => document.getElementById(`fiche-${premier}`)?.focus());
  }

  function aller(i: number) {
    setBrouillon("aucun");
    setEtape(i);
    setAtteinte((a) => Math.max(a, i));
  }

  function suivant() {
    const e = erreursEtape(etape, fiche, aujourdhui);
    setErreurs(e);
    if (Object.keys(e).length) return focusErreur(e);
    aller(Math.min(etape + 1, DERNIERE));
  }

  function recommencer() {
    try {
      window.localStorage.removeItem(CLE_BROUILLON);
    } catch {
      /* rien à effacer */
    }
    setFiche(ficheVide());
    setErreurs({});
    setAtteinte(0);
    setEtape(0);
    setBrouillon("aucun");
  }

  const ctx: Ctx = { fiche, erreurs, maj };

  /* ------------------------------------------------------------------ */
  /* Étapes                                                               */
  /* ------------------------------------------------------------------ */

  const ouiNon: Options<"oui" | "non"> = [
    { valeur: "oui", libelle: "Oui" },
    { valeur: "non", libelle: "Non" },
  ];

  function contenuEtape(): ReactNode {
    switch (etape) {
      case 0:
        return (
          <>
            <div className={styles.rangee}>
              <ChampTexte ctx={ctx} nom="prenom" libelle="Prénom" requis autoComplete="given-name" placeholder="Camille" max={LIMITES_FICHE.prenom} />
              <ChampTexte ctx={ctx} nom="nom" libelle="Nom" requis autoComplete="family-name" placeholder="Martin" max={LIMITES_FICHE.nom} />
            </div>
            <div className={styles.rangee}>
              <ChampTexte ctx={ctx} nom="email" libelle="Adresse e-mail" requis type="email" inputMode="email" autoComplete="email" placeholder="camille@exemple.fr" max={LIMITES_FICHE.email} />
              <ChampTexte ctx={ctx} nom="telephone" libelle="Téléphone" requis type="tel" inputMode="tel" autoComplete="tel" placeholder="06 12 34 56 78" max={LIMITES_FICHE.telephone} />
            </div>
          </>
        );
      case 1:
        return (
          <>
            <div className="champ">
              <label htmlFor="fiche-date">
                Date du mariage <span aria-hidden="true">*</span>
              </label>
              <input
                id="fiche-date"
                name="date"
                className="saisie"
                type="date"
                min={aujourdhui}
                value={fiche.date}
                onChange={(e) => maj("date", e.target.value)}
                aria-invalid={erreurs.date ? true : undefined}
                aria-describedby={decrit(erreurs, "date", !!fiche.date)}
                aria-required
              />
              {fiche.date && fiche.date >= aujourdhui ? (
                <p id="fiche-date-aide" className={styles.dateLisible}>
                  {majuscule(formaterJourLong(fiche.date))}, <em>{delaiAvant(fiche.date, aujourdhui)}</em>
                </p>
              ) : null}
              <Erreur erreurs={erreurs} nom="date" />
              {dateTropProche(fiche.date, aujourdhui) && !erreurs.date ? (
                <p className={styles.avertissement} role="status">
                  Votre mariage est dans moins d’une semaine : appelez-nous au <a href={mobile.href}>{mobile.affichage}</a> pour vérifier que c’est encore possible.
                </p>
              ) : null}
            </div>
            <ChampTexte ctx={ctx} nom="lieu" libelle="Adresse ou lieu de réception" requis autoComplete="off" placeholder="Nom de la salle, du domaine, et la commune" max={LIMITES_FICHE.lieu} />
            <div className={styles.rangee}>
              <Compteur ctx={ctx} nom="convives" libelle="Nombre approximatif de convives" requis pas={10} texteAide="Une estimation suffit, elle s’affinera." />
              <ChampTexte ctx={ctx} nom="heure_repas" libelle="Heure souhaitée du repas" type="time" texteAide="Approximative, elle aussi." />
            </div>
          </>
        );
      case 2:
        return (
          <>
            <Choix ctx={ctx}
              nom="vin_honneur"
              legende="Souhaitez-vous un vin d’honneur ?"
              requis
              cartes
              valeur={fiche.vin_honneur}
              onChoix={(v) => maj("vin_honneur", v)}
              options={[
                { valeur: "oui", libelle: LIBELLES_VIN_HONNEUR.oui, texte: "Nous le préparons avec vous." },
                { valeur: "non", libelle: LIBELLES_VIN_HONNEUR.non, texte: "Le repas suffira." },
                { valeur: "a-voir", libelle: LIBELLES_VIN_HONNEUR["a-voir"], texte: "Vous hésitez encore." },
              ]}
            />
            {fiche.vin_honneur === "oui" ? (
              <div className={`${styles.revele} ${styles.pile}`}>
                <div className={styles.rangee}>
                  <Compteur ctx={ctx} nom="vh_convives" libelle="Invités au vin d’honneur" pas={10} texteAide="Souvent plus nombreux qu’au repas." />
                  <ChampTexte ctx={ctx} nom="vh_heure" libelle="Heure du vin d’honneur" type="time" />
                </div>
                <ChampTexte ctx={ctx}
                  nom="vh_envies"
                  libelle="Vos envies pour le vin d’honneur"
                  multiligne
                  max={LIMITES_FICHE.vh_envies}
                  placeholder="Pièces à grignoter, verrines, plateau de charcuterie, jambon à la broche…"
                />
              </div>
            ) : null}
          </>
        );
      case 3:
        return (
          <>
            <ol className={`sans-puces ${styles.cours}`}>
              {COURS.map((c) => {
                const { choix, detail } = fiche.cours[c];
                const l = LIBELLES_COURS[c];
                return (
                  <li key={c} className={styles.coursLigne} data-rempli={choix ? "oui" : undefined}>
                    <fieldset className={styles.groupe}>
                      <legend className={styles.coursTitre}>
                        <span className={styles.coursPastille} aria-hidden="true">
                          {choix ? (
                            <svg viewBox="0 0 16 16" width="12" height="12">
                              <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : null}
                        </span>
                        {l.titre}
                      </legend>
                      <div className={styles.segments}>
                        {(["envies", "proposer", "sans"] as const).map((v) => (
                          <label key={v} className={styles.segment}>
                            <input type="radio" name={`cours-${c}`} value={v} checked={choix === v} onChange={() => majCours(c, { choix: v })} />
                            <span>{v === "sans" ? l.sans : LIBELLES_CHOIX_COURS[v]}</span>
                          </label>
                        ))}
                      </div>
                      {c === "plat" && choix && choix !== "sans" ? (
                        <div className={`${styles.revele} ${styles.pastilles}`} role="group" aria-label="Viande ou poisson">
                          {(["viande", "poisson", "les-deux"] as const).map((v) => (
                            <label key={v} className={styles.pastille}>
                              <input type="radio" name="plat_type" value={v} checked={fiche.plat_type === v} onChange={() => maj("plat_type", v)} />
                              <span>{LIBELLES_PLAT[v]}</span>
                            </label>
                          ))}
                        </div>
                      ) : null}
                      {choix === "envies" || choix === "proposer" ? (
                        <div className={styles.revele}>
                          <label htmlFor={`fiche-cours-${c}`} className="invisible-accessible">
                            {choix === "envies" ? `Vos envies pour : ${l.titre}` : `Une préférence pour : ${l.titre} (facultatif)`}
                          </label>
                          <textarea
                            id={`fiche-cours-${c}`}
                            className={`saisie ${styles.coursDetail}`}
                            rows={2}
                            maxLength={LIMITES_FICHE.detailCours}
                            value={detail}
                            placeholder={choix === "envies" ? l.exemple : "Une préférence, une contrainte ? (facultatif)"}
                            onChange={(e) => majCours(c, { detail: e.target.value })}
                          />
                        </div>
                      ) : null}
                    </fieldset>
                  </li>
                );
              })}
            </ol>
            <fieldset className={styles.groupe}>
              <legend className="etiquette">Café et thé en fin de repas</legend>
              <div className={styles.pastilles}>
                <Case nom="cafe" libelle="Café" coche={fiche.cafe} onBascule={(v) => maj("cafe", v)} />
                <Case nom="the" libelle="Thé" coche={fiche.the} onBascule={(v) => maj("the", v)} />
              </div>
            </fieldset>
          </>
        );
      case 4:
        return (
          <>
            <Choix ctx={ctx}
              nom="service_type"
              legende="Type de service"
              cartes
              valeur={fiche.service_type}
              onChoix={(v) => maj("service_type", v)}
              options={(["self-service", "assiette", "a-voir"] as const).map((v) => ({ valeur: v, libelle: LIBELLES_SERVICE[v].titre, texte: LIBELLES_SERVICE[v].texte }))}
            />
            <fieldset className={styles.groupe} aria-describedby="fiche-materiel-aide">
              <legend className="etiquette">Vaisselle et linge</legend>
              <div className={styles.pastilles}>
                {MATERIEL.map((m) => (
                  <Case
                    key={m}
                    nom="materiel"
                    libelle={LIBELLES_MATERIEL[m]}
                    coche={fiche.materiel.includes(m)}
                    onBascule={(v) => maj("materiel", v ? MATERIEL.filter((x) => x === m || fiche.materiel.includes(x)) : fiche.materiel.filter((x) => x !== m))}
                  />
                ))}
              </div>
              <p id="fiche-materiel-aide" className={styles.aide}>
                Cochez ce que vous souhaitez que nous prévoyions.
              </p>
            </fieldset>
            <div className={styles.rangee}>
              <Choix ctx={ctx} nom="service" legende="Service" valeur={fiche.service} onChoix={(v) => maj("service", v)} options={ouiNon} texteAide="Une équipe sur place pour servir vos invités." />
              <Choix ctx={ctx} nom="livraison" legende="Livraison et installation" valeur={fiche.livraison} onChoix={(v) => maj("livraison", v)} options={ouiNon} texteAide="Sur le lieu de réception." />
            </div>
            <fieldset className={styles.groupe}>
              <legend className="etiquette">Boissons</legend>
              <div className={styles.rangee}>
                <ChampTexte ctx={ctx} nom="alcools" libelle="Alcools" max={LIMITES_FICHE.alcools} placeholder="Vins, champagne, apéritif… ou rien" />
                <ChampTexte ctx={ctx} nom="softs" libelle="Softs" max={LIMITES_FICHE.softs} placeholder="Jus de fruits, eaux, sodas…" />
              </div>
            </fieldset>
          </>
        );
      case 5:
        return (
          <>
            <Compteur ctx={ctx} nom="enfants" libelle="Dont enfants" pas={1} texteAide="Pour prévoir des menus adaptés. Laissez vide s’il n’y en a pas." />
            <ChampTexte ctx={ctx}
              nom="regimes"
              libelle="Régimes particuliers et allergies"
              multiligne
              max={LIMITES_FICHE.regimes}
              placeholder="Végétariens, sans porc, allergies… avec le nombre de personnes concernées"
            />
            <ChampTexte ctx={ctx}
              nom="remarques"
              libelle="Informations complémentaires, demandes particulières"
              multiligne
              max={LIMITES_FICHE.remarques}
              placeholder="Le déroulé de la journée, l’accès à la salle, une idée qui vous tient à cœur…"
            />
          </>
        );
      default:
        return <Recapitulatif fiche={fiche} onModifier={(i) => aller(i)} />;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Confirmation                                                         */
  /* ------------------------------------------------------------------ */

  if (envoye) {
    return (
      <div className={styles.fin}>
        <div ref={refRetour} tabIndex={-1} className={styles.confirmation} role="status">
          <p className={styles.confirmationTitre}>Merci{fiche.prenom ? ` ${fiche.prenom}` : ""}, votre fiche est bien arrivée.</p>
          <p>
            Nous l’étudions et revenons vers vous avec une proposition de menu et un devis. Une question d’ici là ? Appelez-nous au{" "}
            <a href={mobile.href} className="lien-souligne">
              {mobile.affichage}
            </a>{" "}
            ou à la boutique au{" "}
            <a href={telephone.href} className="lien-souligne">
              {telephone.affichage}
            </a>
            .
          </p>
          <div className="rangee">
            <button type="button" className="bouton bouton-contour bouton-petit" onClick={() => window.print()}>
              Imprimer ma fiche
            </button>
            <Link href="/traiteur-roanne/mariage" className="lien-fleche">
              Retour à la page mariage
            </Link>
          </div>
        </div>
        <div className={styles.imprimable}>
          <p className={styles.impressionTitre}>Demande de devis, mariage · Maison Cherblanc</p>
          <Recapitulatif fiche={fiche} />
        </div>
      </div>
    );
  }

  const alerte =
    etat.message === "erreur" ? (
      <>
        <strong>La fiche n’est pas partie.</strong> Un souci technique de notre côté. Réessayez dans un instant, ou appelez-nous au{" "}
        <a href={mobile.href}>{mobile.affichage}</a>. Votre saisie est conservée sur cet appareil.
      </>
    ) : etat.message === "limite" ? (
      <>Plusieurs fiches ont été envoyées en peu de temps. Patientez quelques minutes avant de réessayer : votre saisie est conservée.</>
    ) : etat.message === "verifier" ? (
      <>Votre envoi n’a pas pu être vérifié. Cliquez de nouveau sur « Envoyer ma fiche ».</>
    ) : Object.keys(erreurs).length && etape === DERNIERE ? (
      <>Certaines informations sont à compléter.</>
    ) : null;

  const pourcentage = Math.round((etape / DERNIERE) * 100);

  return (
    <div className={styles.fiche}>
      {/* Sommaire des étapes (bureau) ; barre de progression (mobile). */}
      <nav className={styles.sommaire} aria-label="Étapes de la fiche">
        <ol className="sans-puces">
          {ETAPES.map((e, i) => (
            <li key={e.cle}>
              <button
                type="button"
                className={styles.etapeBouton}
                data-etat={i === etape ? "courante" : i <= atteinte ? "faite" : "a-venir"}
                aria-current={i === etape ? "step" : undefined}
                disabled={i > atteinte || i === etape}
                onClick={() => aller(i)}
              >
                <span className={styles.etapeNumero} aria-hidden="true">
                  {i < atteinte && i !== etape ? (
                    <svg viewBox="0 0 16 16" width="12" height="12">
                      <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span>{e.titre}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div ref={refCadre} className={styles.cadre}>
        <div className={styles.progression} aria-hidden="true">
          <span>
            Étape {etape + 1} sur {ETAPES.length}
          </span>
          <span className={styles.barre}>
            <span style={{ width: `${Math.max(pourcentage, 4)}%` }} />
          </span>
        </div>

        {brouillon === "retrouve" ? (
          <p className={styles.brouillon}>
            Nous avons retrouvé la fiche que vous aviez commencée sur cet appareil.{" "}
            <button type="button" className={styles.lienBouton} onClick={recommencer}>
              Tout effacer et recommencer
            </button>
          </p>
        ) : null}

        <form
          action={envoyer}
          noValidate
          className={styles.formulaire}
          onSubmit={(e) => {
            if (etape < DERNIERE) {
              e.preventDefault();
              suivant();
              return;
            }
            // Dernière vérification complète avant l'envoi : retour à la première étape incomplète.
            const toutes: Record<string, string> = {};
            for (let i = 0; i < DERNIERE; i++) Object.assign(toutes, erreursEtape(i, fiche, aujourdhui));
            if (Object.keys(toutes).length) {
              e.preventDefault();
              setErreurs(toutes);
              setEtape(premiereEtapeEnErreur(toutes));
            }
          }}
        >
          <div ref={refRetour} tabIndex={-1} className={styles.retour} aria-live="polite">
            {alerte ? <p className={styles.alerte}>{alerte}</p> : null}
          </div>

          <header className={styles.entete}>
            <p className="surtitre">
              {etape + 1}. {ETAPES[etape].titre}
            </p>
            <h2 ref={refTitre} tabIndex={-1} className={`titre-m ${styles.titre}`}>
              {
                [
                  "Vos coordonnées",
                  "Votre mariage",
                  "Le vin d’honneur",
                  "Votre repas",
                  "Les prestations souhaitées",
                  "Les derniers détails",
                  "Votre fiche, en un coup d’œil",
                ][etape]
              }
            </h2>
            <p className={styles.intro}>{INTROS[etape]}</p>
            {etape <= 1 ? <p className={styles.obligatoires}>Les champs marqués d’un astérisque sont obligatoires.</p> : null}
          </header>

          <div key={etape} className={`${styles.corps} ${styles.pile}`}>
            {contenuEtape()}
          </div>

          {/* Envoi : la fiche entière en JSON, jeton signé et champ piège invisible. */}
          <input type="hidden" name="fiche" value={JSON.stringify(fiche)} />
          <input type="hidden" name="jeton" value={jetonCourant} />
          <div className={styles.piege} aria-hidden="true">
            <label htmlFor="fiche-site_web">Ne pas remplir ce champ</label>
            <input id="fiche-site_web" name="site_web" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>

          <div className={styles.navigation}>
            {etape > 0 ? (
              <button type="button" className="bouton bouton-contour" onClick={() => aller(etape - 1)}>
                Retour
              </button>
            ) : (
              <span />
            )}
            {etape < DERNIERE ? (
              <button type="submit" className="bouton">
                {etape === DERNIERE - 1 ? "Voir le récapitulatif" : "Continuer"}
              </button>
            ) : (
              <button type="submit" className="bouton" disabled={enCours} aria-disabled={enCours}>
                {enCours ? "Envoi en cours…" : "Envoyer ma fiche"}
              </button>
            )}
          </div>

          <p className={styles.rgpd}>
            {etape === DERNIERE ? (
              <>
                Vos données servent uniquement à préparer votre devis et sont conservées {conservationMois} mois.{" "}
                <Link href="/politique-de-confidentialite" className="lien-souligne">
                  En savoir plus
                </Link>
              </>
            ) : (
              <>Votre saisie est gardée sur cet appareil jusqu’à l’envoi : vous pouvez revenir la terminer plus tard.</>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}

/** Récapitulatif par section (étape finale et version imprimable). */
function Recapitulatif({ fiche, onModifier }: { fiche: Fiche; onModifier?: (etape: number) => void }) {
  return (
    <div className={styles.recap}>
      {sectionsFiche(fiche).map((s) => (
        <section key={s.titre} className={styles.recapSection} aria-label={s.titre}>
          <div className={styles.recapTete}>
            <h3 className={styles.recapTitre}>{s.titre}</h3>
            {onModifier ? (
              <button type="button" className={styles.lienBouton} onClick={() => onModifier(s.etape)}>
                Modifier <span className="invisible-accessible">: {s.titre}</span>
              </button>
            ) : null}
          </div>
          <dl className={styles.recapListe}>
            {s.lignes.map((l) => (
              <div key={l.libelle}>
                <dt>{l.libelle}</dt>
                <dd>{l.valeur}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Champs (au niveau du module : identité stable, le focus n'est jamais    */
/* perdu pendant la saisie)                                                */
/* ---------------------------------------------------------------------- */

type Ctx = { fiche: Fiche; erreurs: Record<string, string>; maj: <K extends keyof Fiche>(cle: K, valeur: Fiche[K]) => void };

function decrit(erreurs: Record<string, string>, nom: string, aide?: boolean): string | undefined {
  return [erreurs[nom] ? `fiche-${nom}-erreur` : null, aide ? `fiche-${nom}-aide` : null].filter(Boolean).join(" ") || undefined;
}

function Erreur({ erreurs, nom }: { erreurs: Record<string, string>; nom: string }) {
  return erreurs[nom] ? (
    <p id={`fiche-${nom}-erreur`} className="erreur-champ">
      {erreurs[nom]}
    </p>
  ) : null;
}

function Aide({ nom, texte }: { nom: string; texte?: ReactNode }) {
  return texte ? (
    <p id={`fiche-${nom}-aide`} className={styles.aide}>
      {texte}
    </p>
  ) : null;
}

type NomTexte = "prenom" | "nom" | "email" | "telephone" | "lieu" | "vh_envies" | "alcools" | "softs" | "regimes" | "remarques" | "heure_repas" | "vh_heure";

function ChampTexte({
  ctx,
  nom,
  libelle,
  requis,
  texteAide,
  multiligne,
  max,
  ...autres
}: {
  ctx: Ctx;
  nom: NomTexte;
  libelle: ReactNode;
  requis?: boolean;
  texteAide?: ReactNode;
  multiligne?: boolean;
  max?: number;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: "text" | "email" | "tel";
}) {
  const { fiche, erreurs, maj } = ctx;
  const props = {
    id: `fiche-${nom}`,
    name: nom,
    className: "saisie",
    value: fiche[nom],
    maxLength: max,
    "aria-invalid": erreurs[nom] ? (true as const) : undefined,
    "aria-describedby": decrit(erreurs, nom, !!texteAide),
    "aria-required": requis || undefined,
  };
  return (
    <div className="champ">
      <label htmlFor={`fiche-${nom}`}>
        {libelle} {requis ? <span aria-hidden="true">*</span> : null}
      </label>
      {multiligne ? (
        <textarea {...props} rows={4} placeholder={autres.placeholder} onChange={(e) => maj(nom, e.target.value)} />
      ) : (
        <input {...props} {...autres} onChange={(e) => maj(nom, e.target.value)} />
      )}
      <Aide nom={nom} texte={texteAide} />
      <Erreur erreurs={erreurs} nom={nom} />
    </div>
  );
}

function Compteur({
  ctx,
  nom,
  libelle,
  requis,
  texteAide,
  pas = 5,
}: {
  ctx: Ctx;
  nom: "convives" | "vh_convives" | "enfants";
  libelle: ReactNode;
  requis?: boolean;
  texteAide?: ReactNode;
  pas?: number;
}) {
  const { fiche, erreurs, maj } = ctx;
  const n = Number(fiche[nom]) || 0;
  const regler = (v: number) => maj(nom, v > 0 ? String(Math.min(v, LIMITES_FICHE.convives)) : "");
  return (
    <div className="champ">
      <label htmlFor={`fiche-${nom}`}>
        {libelle} {requis ? <span aria-hidden="true">*</span> : null}
      </label>
      <div className={styles.compteur}>
        <button type="button" className={styles.pas} onClick={() => regler(n - pas)} disabled={n <= 0} aria-label={`Retirer ${pas}`}>
          −{pas}
        </button>
        <input
          id={`fiche-${nom}`}
          name={nom}
          className={`saisie ${styles.nombre}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={fiche[nom]}
          placeholder="0"
          onChange={(e) => maj(nom, e.target.value.replace(/[^\d]/g, "").slice(0, 5))}
          aria-invalid={erreurs[nom] ? true : undefined}
          aria-describedby={decrit(erreurs, nom, !!texteAide)}
          aria-required={requis || undefined}
        />
        <button type="button" className={styles.pas} onClick={() => regler(n + pas)} aria-label={`Ajouter ${pas}`}>
          +{pas}
        </button>
      </div>
      <Aide nom={nom} texte={texteAide} />
      <Erreur erreurs={erreurs} nom={nom} />
    </div>
  );
}

function Choix<T extends string>({
  ctx,
  nom,
  legende,
  options,
  valeur,
  onChoix,
  cartes,
  requis,
  texteAide,
}: {
  ctx: Ctx;
  nom: string;
  legende: ReactNode;
  options: Options<T>;
  valeur: T | "";
  onChoix: (v: T) => void;
  cartes?: boolean;
  requis?: boolean;
  texteAide?: ReactNode;
}) {
  const { erreurs } = ctx;
  return (
    <fieldset className={styles.groupe} aria-describedby={decrit(erreurs, nom, !!texteAide)} data-invalide={erreurs[nom] ? "" : undefined}>
      <legend className="etiquette">
        {legende} {requis ? <span aria-hidden="true">*</span> : null}
      </legend>
      <div className={cartes ? styles.cartes : styles.pastilles}>
        {options.map((o, i) => (
          <label key={o.valeur} className={cartes ? styles.carte : styles.pastille}>
            <input
              type="radio"
              name={nom}
              id={i === 0 ? `fiche-${nom}` : undefined}
              value={o.valeur}
              checked={valeur === o.valeur}
              onChange={() => onChoix(o.valeur)}
            />
            <span>
              {cartes ? <strong>{o.libelle}</strong> : o.libelle}
              {o.texte ? <small>{o.texte}</small> : null}
            </span>
          </label>
        ))}
      </div>
      <Aide nom={nom} texte={texteAide} />
      <Erreur erreurs={erreurs} nom={nom} />
    </fieldset>
  );
}

function Case({ nom, libelle, coche, onBascule }: { nom: string; libelle: string; coche: boolean; onBascule: (v: boolean) => void }) {
  return (
    <label className={`${styles.pastille} ${styles.case}`}>
      <input type="checkbox" name={nom} checked={coche} onChange={(e) => onBascule(e.target.checked)} />
      <span>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className={styles.coche}>
          <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {libelle}
      </span>
    </label>
  );
}
