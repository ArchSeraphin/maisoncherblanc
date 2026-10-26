/**
 * Point d'entrée de production : Passenger (Plesk) ET Docker (Coolify).
 *
 * - Charge `.env` via Next (loadEnvConfig) : source unique pour l'app.
 * - Transmet l'adresse de la socket à l'app (`x-cherblanc-ip-socket`, écrasé à
 *   chaque requête, jamais repris du client) pour le rate-limit du login
 *   quand TRUST_PROXY n'est pas activé.
 * - Refuse AVANT Next les corps de requête trop lourds (`bodyGate`) : Next
 *   tamponne en mémoire le corps de toute requête non-GET qui traverse le
 *   proxy (jusqu'à `experimental.proxyClientMaxBodySize`) dès l'entrée dans
 *   proxy.ts, et attend la fin de l'envoi avant de répondre ; un 413 posé par
 *   proxy.ts arriverait donc trop tard. Seule la route d'upload du backoffice
 *   a droit à plus de 2 Mo.
 * - Avertit une fois au démarrage si TRUST_PROXY n'est pas défini en production.
 * - Passenger intercepte `listen()` : le port importe peu sous Plesk.
 *
 * Prérequis : `npm run build` effectué (dossier .next présent).
 */

"use strict";

if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";

const { createServer } = require("node:http");
const next = require("next");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOSTNAME || "0.0.0.0";

const app = next({ dev: false, dir: __dirname, hostname, port });
const handle = app.getRequestHandler();

/** Corps maximal hors upload : celui des Server Actions (`serverActions.bodySizeLimit`). */
const MAX_BODY_BYTES = 2 * 1024 * 1024;
/**
 * Corps maximal de la route d'upload : `proxyClientMaxBodySize` (26 Mo) de
 * next.config.ts, soit POIDS_MAX_UPLOAD (25 Mo, lib/media-pipeline.ts) plus
 * l'enveloppe multipart. Les trois valeurs vont ensemble.
 */
const MAX_UPLOAD_BODY_BYTES = 26 * 1024 * 1024;

/** `/${ADMIN_PATH}/api/upload`, ou `null` (même validation que getAdminPath() de lib/env.ts). */
function uploadPathFromEnv() {
  const raw = (process.env.ADMIN_PATH || "").trim().replace(/^\/+|\/+$/g, "");
  return /^[a-z0-9][a-z0-9-]{5,63}$/i.test(raw) ? `/${raw}/api/upload` : null;
}

/**
 * Refus précoce d'un corps trop lourd, sur la seule foi des en-têtes (rien
 * n'est lu) : `Content-Length` au-delà de la limite du chemin = 413 ; corps
 * sans `Content-Length` (`Transfer-Encoding: chunked`, qu'aucun formulaire ni
 * `fetch` du site n'émet) = 411. Renvoie `true` si la requête est refusée.
 */
function bodyGate(req, res, uploadPath) {
  const pathname = (req.url || "/").split("?")[0];
  const limit = uploadPath && pathname === uploadPath ? MAX_UPLOAD_BODY_BYTES : MAX_BODY_BYTES;
  const len = req.headers["content-length"];
  let status = 0;
  if (len !== undefined) {
    if (!/^\d{1,15}$/.test(len) || Number(len) > limit) status = 413;
  } else if (req.headers["transfer-encoding"]) {
    status = 411;
  }
  if (!status) return false;
  // `Connection: close` : la socket est fermée après la réponse, le reste du
  // corps n'est jamais lu (ni tamponné, ni drainé).
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    Connection: "close",
  });
  res.end(status === 413 ? "Requête trop volumineuse.\n" : "Longueur de requête requise.\n");
  return true;
}

app
  .prepare()
  .then(() => {
    // Lu après `prepare()` : le `.env` est alors chargé (loadEnvConfig).
    const uploadPath = uploadPathFromEnv();
    createServer((req, res) => {
      if (bodyGate(req, res, uploadPath)) return;
      // Toujours écrasé (ou retiré) : jamais repris d'un en-tête client.
      const socketIp = req.socket.remoteAddress;
      if (socketIp) req.headers["x-cherblanc-ip-socket"] = socketIp;
      else delete req.headers["x-cherblanc-ip-socket"];
      handle(req, res);
    }).listen(port, hostname, () => {
      console.log(`> Maison Cherblanc prête sur http://${hostname}:${port} (NODE_ENV=${process.env.NODE_ENV})`);
      // Avertissement unique au démarrage (aucune adresse IP journalisée).
      if (process.env.NODE_ENV === "production" && !process.env.TRUST_PROXY) {
        console.warn(
          "> [cherblanc] TRUST_PROXY non défini. Derrière nginx / Plesk / Coolify, ajoutez TRUST_PROXY=1 dans .env : " +
            "sinon toutes les requêtes semblent venir du reverse proxy et les limites par adresse (connexion, contact) " +
            "s'appliquent à tous les visiteurs à la fois. Sans reverse proxy, TRUST_PROXY=0 fait taire ce message.",
        );
      }
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
