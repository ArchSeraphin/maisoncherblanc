/**
 * Champs de formulaire du backoffice : libellé, aide, erreur, compteur.
 * Composants sans état (utilisables côté serveur comme côté client).
 *
 *   <Champ id="prix" libelle="Prix" aide="Tapez juste le nombre" erreur={erreurs.prix}>
 *     <input {...attributsChamp("prix", erreurs.prix, true)} name="prix" className="bo-saisie" />
 *   </Champ>
 */

export function attributsChamp(id: string, erreur?: string, avecAide = false) {
  const decrit = [avecAide ? `${id}-aide` : "", erreur ? `${id}-erreur` : ""].filter(Boolean).join(" ");
  return { id, "aria-invalid": erreur ? (true as const) : undefined, "aria-describedby": decrit || undefined };
}

export function Champ({
  id,
  libelle,
  aide,
  erreur,
  facultatif = false,
  className,
  children,
}: {
  id: string;
  libelle: React.ReactNode;
  aide?: React.ReactNode;
  erreur?: string;
  facultatif?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`bo-champ${className ? ` ${className}` : ""}`}>
      <label htmlFor={id}>
        {libelle}
        {facultatif ? <span className="bo-facultatif"> (facultatif)</span> : null}
      </label>
      {children}
      {aide ? (
        <p id={`${id}-aide`} className="bo-aide">
          {aide}
        </p>
      ) : null}
      {erreur ? (
        <p id={`${id}-erreur`} className="bo-erreur" role="alert">
          {erreur}
        </p>
      ) : null}
    </div>
  );
}

/** Compteur de caractères : vert jusqu'à `conseille`, orange au-delà, rouge au-delà de `max`. */
export function Compteur({ valeur, conseille, max, id }: { valeur: string; conseille: number; max?: number; id?: string }) {
  const n = [...valeur].length;
  const etat = max && n > max ? "trop" : n > conseille ? "long" : "ok";
  return (
    <p id={id} className={`bo-compteur bo-compteur-${etat}`} aria-live="polite">
      {n} caractère{n > 1 ? "s" : ""} sur {conseille} conseillés
      {etat === "long" ? " : un peu long, la fin risque d’être coupée" : ""}
      {etat === "trop" ? ` : ${max} au maximum` : ""}
    </p>
  );
}

/** Message d'état sous un titre (« En ligne », « Masqué »…). */
export function Etiquette({
  genre = "neutre",
  children,
}: {
  genre?: "neutre" | "succes" | "attention" | "provisoire" | "discret";
  children: React.ReactNode;
}) {
  return <span className={`bo-etiquette bo-etiquette-${genre}`}>{children}</span>;
}
