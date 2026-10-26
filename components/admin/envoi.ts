"use client";

/**
 * Envoi de fichiers au Route Handler du backoffice (`/api/upload`, un fichier
 * par requête : XHR pour la progression) et suivi du traitement par interrogation
 * de `/api/media/<id>`. Les URLs viennent de `useLienAdmin()` : jamais de chemin en dur.
 */

export type ResultatEnvoi = {
  nom: string;
  ok: boolean;
  mediaId?: number;
  statut?: string;
  realisationId?: number;
  erreur?: string;
};

export type EnvoiEnCours = { promesse: Promise<ResultatEnvoi>; annuler: () => void };

/** Formats acceptés par le navigateur (le serveur revérifie la signature du fichier). */
export const FORMATS_IMAGE = "image/jpeg,image/png,image/webp,image/avif,image/gif";
export const FORMATS_PDF = "application/pdf";
/** = POIDS_MAX_UPLOAD de lib/media-pipeline.ts (module serveur, non importable ici). */
export const POIDS_MAX_MO = 25;

export function envoyerFichier(url: string, fichier: File, champs: Record<string, string>, progression: (fraction: number) => void): EnvoiEnCours {
  const xhr = new XMLHttpRequest();
  const promesse = new Promise<ResultatEnvoi>((resoudre) => {
    if (fichier.size > POIDS_MAX_MO * 1024 * 1024) {
      resoudre({ nom: fichier.name, ok: false, erreur: `Fichier trop lourd (${POIDS_MAX_MO} Mo au maximum).` });
      return;
    }
    const fd = new FormData();
    for (const [k, v] of Object.entries(champs)) fd.append(k, v);
    fd.append("file", fichier, fichier.name);
    xhr.open("POST", url);
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) progression(e.loaded / e.total);
    };
    xhr.onload = () => {
      const corps = xhr.response as { ok?: boolean; erreur?: string; items?: ResultatEnvoi[] } | null;
      if (xhr.status === 401) return resoudre({ nom: fichier.name, ok: false, erreur: "Session expirée : reconnectez-vous." });
      if (xhr.status === 413) return resoudre({ nom: fichier.name, ok: false, erreur: "Fichier trop lourd pour le serveur." });
      const item = corps?.items?.[0];
      resoudre(item ?? { nom: fichier.name, ok: false, erreur: corps?.erreur ?? `Erreur du serveur (${xhr.status}).` });
    };
    xhr.onerror = () => resoudre({ nom: fichier.name, ok: false, erreur: "Connexion interrompue." });
    xhr.onabort = () => resoudre({ nom: fichier.name, ok: false, erreur: "Envoi annulé." });
    xhr.send(fd);
  });
  return { promesse, annuler: () => xhr.abort() };
}

export type StatutTraitement = "pending" | "processing" | "ready" | "error";

/**
 * Interroge le statut d'un média jusqu'à `ready` ou `error` (toutes les 1,5 s,
 * 4 minutes au plus). `surStatut` reçoit chaque statut intermédiaire.
 */
export async function attendreMedia(
  url: string,
  surStatut?: (s: StatutTraitement) => void,
  signal?: AbortSignal,
): Promise<{ statut: StatutTraitement; erreur: string | null }> {
  const limite = Date.now() + 4 * 60 * 1000;
  while (Date.now() < limite) {
    if (signal?.aborted) return { statut: "error", erreur: "Suivi interrompu." };
    try {
      const rep = await fetch(url, { cache: "no-store", signal });
      if (rep.ok) {
        const corps = (await rep.json()) as { statut: StatutTraitement; erreur: string | null };
        surStatut?.(corps.statut);
        if (corps.statut === "ready" || corps.statut === "error") return corps;
      } else if (rep.status === 404) {
        return { statut: "error", erreur: "Fichier introuvable." };
      }
    } catch {
      if (signal?.aborted) return { statut: "error", erreur: "Suivi interrompu." };
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return { statut: "processing", erreur: null };
}

/** « 2,4 Mo » */
export function formaterOctets(n: number): string {
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} Ko`;
  return `${(n / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`;
}

/** Libellé humain d'un statut de traitement. */
export function libelleStatut(s: string | undefined): string {
  switch (s) {
    case "pending":
      return "En attente de traitement";
    case "processing":
      return "Préparation de la photo…";
    case "ready":
      return "Prête";
    case "error":
      return "Échec du traitement";
    default:
      return "";
  }
}
