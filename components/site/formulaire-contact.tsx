"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { envoyerMessageAction } from "@/lib/actions/contact";
import { etatInitial, type EtatAction } from "@/lib/formulaire";
import styles from "./formulaire-contact.module.css";

type TypeDemande = "devis-traiteur" | "commande-boucherie" | "autre";

const TYPES: { valeur: TypeDemande; libelle: string }[] = [
  { valeur: "devis-traiteur", libelle: "Devis traiteur" },
  { valeur: "commande-boucherie", libelle: "Commande boucherie" },
  { valeur: "autre", libelle: "Autre question" },
];

const PLACEHOLDERS: Record<TypeDemande, string> = {
  "devis-traiteur": "Le lieu, le type de réception (cocktail, buffet, repas), vos envies, le service à table…",
  "commande-boucherie": "Les pièces, les quantités, le jour et l’heure de retrait souhaités…",
  autre: "Votre question…",
};

/** Messages d'erreur par champ (docs/COPY.md), à la place des messages génériques du serveur. */
function messageErreur(champ: string, serveur: string, valeurs?: Record<string, string>): string {
  switch (champ) {
    case "type":
      return "Choisissez le type de demande.";
    case "prenom":
      return "Indiquez votre prénom.";
    case "nom":
      return "Indiquez votre nom.";
    case "email":
      return "Cette adresse e-mail ne semble pas valide.";
    case "telephone":
      return "Ce numéro de téléphone ne semble pas valide.";
    case "nb_personnes":
      return "Indiquez un nombre de personnes.";
    case "message":
      return valeurs && !valeurs.message?.trim() ? "Votre message est vide." : serveur;
    default:
      return serveur;
  }
}

/** Jour ISO local du navigateur (AAAA-MM-JJ). */
function aujourdhuiIso(decalage = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + decalage);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const ORDRE_CHAMPS = ["type", "prenom", "nom", "email", "telephone", "date_evenement", "nb_personnes", "message"];

/**
 * Formulaire de contact public : devis traiteur, commande boucherie, autre.
 * Branché sur la Server Action `envoyerMessageAction` (anti-robot : jeton
 * signé `jeton` rendu par la page + champ piège `site_web`). Les saisies sont
 * conservées en cas d'erreur ; le focus va à la première erreur, ou au message
 * de confirmation après l'envoi.
 */
export function FormulaireContact({
  jeton,
  typeInitial,
  telephone,
  mobile,
  conservationMois,
}: {
  jeton: string;
  typeInitial: TypeDemande;
  telephone: { affichage: string; href: string };
  mobile: { affichage: string; href: string };
  conservationMois: number;
}) {
  const [etat, envoyer, enCours] = useActionState<EtatAction, FormData>(envoyerMessageAction, etatInitial);
  const [type, setType] = useState<TypeDemande>(typeInitial);
  const [dateEvenement, setDateEvenement] = useState("");
  const [erreurDate, setErreurDate] = useState<string | null>(null);
  const refFormulaire = useRef<HTMLFormElement>(null);
  const refRetour = useRef<HTMLDivElement>(null);

  const v = etat.valeurs ?? {};
  const erreurs: Record<string, string> = {};
  for (const [champ, texte] of Object.entries(etat.erreurs ?? {})) erreurs[champ] = messageErreur(champ, texte, etat.valeurs);
  if (erreurDate) erreurs.date_evenement = erreurDate;

  const dateProche = type === "devis-traiteur" && dateEvenement && dateEvenement >= aujourdhuiIso() && dateEvenement < aujourdhuiIso(7);

  // Après chaque réponse : focus sur le message de retour ou sur la première erreur.
  useEffect(() => {
    if (etat === etatInitial) return;
    const premier = ORDRE_CHAMPS.find((c) => etat.erreurs?.[c]);
    if (premier) refFormulaire.current?.querySelector<HTMLElement>(`[name="${premier}"]`)?.focus();
    else refRetour.current?.focus();
  }, [etat]);

  if (etat.ok && etat.message === "envoye") {
    return (
      <div ref={refRetour} tabIndex={-1} className={styles.confirmation} role="status">
        <p className={styles.confirmationTitre}>Merci, votre demande est bien arrivée.</p>
        <p>
          Nous vous répondons rapidement, par e-mail ou par téléphone. Pour une commande urgente, appelez la boutique au{" "}
          <a href={telephone.href} className="lien-souligne">
            {telephone.affichage}
          </a>
          .
        </p>
      </div>
    );
  }

  const alerte =
    etat.message === "erreur" ? (
      <>
        <strong>Le message n’est pas parti.</strong> Un souci technique de notre côté. Réessayez dans un instant, ou appelez la boutique au{" "}
        <a href={telephone.href}>{telephone.affichage}</a>.
      </>
    ) : etat.message === "limite" ? (
      <>Vous avez envoyé plusieurs messages en peu de temps. Patientez quelques minutes avant de réessayer.</>
    ) : etat.message === "verifier" ? (
      <>Votre envoi n’a pas pu être vérifié. Relisez le formulaire, puis cliquez de nouveau sur « Envoyer ma demande ».</>
    ) : Object.keys(erreurs).length ? (
      <>Certains champs sont à corriger : ils sont signalés ci-dessous.</>
    ) : null;

  const champ = (nom: string) => ({
    id: `contact-${nom}`,
    name: nom,
    "aria-invalid": erreurs[nom] ? (true as const) : undefined,
    "aria-describedby": [erreurs[nom] ? `contact-${nom}-erreur` : null, nom === "date_evenement" ? "contact-date-aide" : null, nom === "telephone" ? "contact-telephone-aide" : null]
      .filter(Boolean)
      .join(" ") || undefined,
  });

  const erreur = (nom: string) =>
    erreurs[nom] ? (
      <p id={`contact-${nom}-erreur`} className="erreur-champ">
        {erreurs[nom]}
      </p>
    ) : null;

  return (
    <form
      ref={refFormulaire}
      action={envoyer}
      noValidate
      className={styles.formulaire}
      onSubmit={(e) => {
        const date = (e.currentTarget.elements.namedItem("date_evenement") as HTMLInputElement | null)?.value ?? "";
        if (type === "devis-traiteur" && date && date < aujourdhuiIso()) {
          e.preventDefault();
          setErreurDate("Cette date est déjà passée.");
          (e.currentTarget.elements.namedItem("date_evenement") as HTMLInputElement).focus();
        } else setErreurDate(null);
      }}
    >
      <div ref={refRetour} tabIndex={-1} className={styles.retour} aria-live="polite">
        {alerte ? <p className={styles.alerte}>{alerte}</p> : null}
      </div>

      <p className={styles.obligatoires}>Les champs marqués d’un astérisque sont obligatoires.</p>

      <fieldset className={styles.types}>
        <legend className="etiquette">
          Votre demande <span aria-hidden="true">*</span>
        </legend>
        <div className={styles.choix}>
          {TYPES.map((t) => (
            <label key={t.valeur} className={styles.option}>
              <input type="radio" name="type" value={t.valeur} checked={type === t.valeur} onChange={() => setType(t.valeur)} required />
              <span>{t.libelle}</span>
            </label>
          ))}
        </div>
        {erreur("type")}
      </fieldset>

      <div className={styles.rangee}>
        <div className="champ">
          <label htmlFor="contact-prenom">
            Prénom <span aria-hidden="true">*</span>
          </label>
          <input {...champ("prenom")} className="saisie" type="text" autoComplete="given-name" placeholder="Camille" defaultValue={v.prenom} required />
          {erreur("prenom")}
        </div>
        <div className="champ">
          <label htmlFor="contact-nom">
            Nom <span aria-hidden="true">*</span>
          </label>
          <input {...champ("nom")} className="saisie" type="text" autoComplete="family-name" placeholder="Martin" defaultValue={v.nom} required />
          {erreur("nom")}
        </div>
      </div>

      <div className={styles.rangee}>
        <div className="champ">
          <label htmlFor="contact-email">
            E-mail <span aria-hidden="true">*</span>
          </label>
          <input {...champ("email")} className="saisie" type="email" autoComplete="email" placeholder="camille@exemple.fr" defaultValue={v.email} required />
          {erreur("email")}
        </div>
        <div className="champ">
          <label htmlFor="contact-telephone">Téléphone</label>
          <input {...champ("telephone")} className="saisie" type="tel" autoComplete="tel" placeholder="06 12 34 56 78" defaultValue={v.telephone} />
          <p id="contact-telephone-aide" className={styles.aide}>
            Pour vous rappeler plus vite.
          </p>
          {erreur("telephone")}
        </div>
      </div>

      {type === "devis-traiteur" ? (
        <div className={styles.rangee}>
          <div className="champ">
            <label htmlFor="contact-date_evenement">Date de l’événement</label>
            <input
              {...champ("date_evenement")}
              className="saisie"
              type="date"
              min={aujourdhuiIso()}
              defaultValue={v.date_evenement}
              onChange={(e) => {
                setDateEvenement(e.target.value);
                setErreurDate(null);
              }}
            />
            <p id="contact-date-aide" className={styles.aide}>
              Les commandes traiteur se passent au moins une semaine avant.
            </p>
            {erreur("date_evenement")}
            {dateProche && !erreurs.date_evenement ? (
              <p className={styles.avertissement} role="status">
                Cette date est dans moins d’une semaine : appelez-nous au <a href={mobile.href}>{mobile.affichage}</a> pour vérifier que c’est encore possible.
              </p>
            ) : null}
          </div>
          <div className="champ">
            <label htmlFor="contact-nb_personnes">Nombre de personnes</label>
            <input {...champ("nb_personnes")} className="saisie" type="number" inputMode="numeric" min={1} max={5000} step={1} placeholder="40" defaultValue={v.nb_personnes} />
            {erreur("nb_personnes")}
          </div>
        </div>
      ) : null}

      <div className="champ">
        <label htmlFor="contact-message">
          Votre message <span aria-hidden="true">*</span>
        </label>
        <textarea {...champ("message")} className="saisie" rows={6} placeholder={PLACEHOLDERS[type]} defaultValue={v.message} required />
        {erreur("message")}
      </div>

      {/* Anti-robot : jeton signé (rendu par le serveur) et champ piège invisible. */}
      <input type="hidden" name="jeton" value={v.jeton || jeton} />
      <div className={styles.piege} aria-hidden="true">
        <label htmlFor="contact-site_web">Ne pas remplir ce champ</label>
        <input id="contact-site_web" name="site_web" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className={styles.envoi}>
        <button type="submit" className="bouton" disabled={enCours} aria-disabled={enCours}>
          {enCours ? "Envoi en cours…" : "Envoyer ma demande"}
        </button>
        <p className={styles.rgpd}>
          Vos données servent uniquement à répondre à votre demande et sont conservées {conservationMois} mois.{" "}
          <Link href="/politique-de-confidentialite" className="lien-souligne">
            En savoir plus
          </Link>
        </p>
      </div>
    </form>
  );
}
