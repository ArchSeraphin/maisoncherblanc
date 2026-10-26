# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# Maison Cherblanc : image de production (Coolify). Node 24 LTS, multi-stage.
# Données persistantes dans le volume /data (base SQLite + fichiers envoyés).
#
# Coolify : volume persistant sur /data, variables SESSION_SECRET, ADMIN_PATH,
# ADMIN_EMAIL, ADMIN_PASSWORD (seed seulement), SITE_URL, TRUST_PROXY=1,
# CONTACT_EMAIL, MAIL_FROM, BREVO_API_KEY ; port 3000.
# Seed : `npm run seed` dans le conteneur (médias de départ dans seed-medias/).
# ---------------------------------------------------------------------------

ARG NODE_IMAGE=node:24-bookworm-slim

# 1) Dépendances complètes (build)
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund

# 2) Build Next.js
FROM ${NODE_IMAGE} AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3) Image d'exécution
FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_PATH=/data/cherblanc.db \
    UPLOADS_DIR=/data/uploads \
    TRUST_PROXY=1

RUN mkdir -p /data/uploads && chown -R node:node /data

# Code possédé par root, en lecture seule pour `node` qui l'exécute.
# node_modules complet : les scripts d'exploitation (seed, create-admin...) tournent avec tsx.
COPY --from=build /app/package.json /app/package-lock.json /app/next.config.ts /app/server.js /app/tsconfig.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/lib ./lib
COPY --from=build /app/config ./config
COPY --from=build /app/seed-medias ./seed-medias
# Les fichiers source peuvent arriver en 600 (exports du client) : lisibles par `node`, toujours en lecture seule.
RUN chmod -R a+rX seed-medias public

# Seule écriture de Next sous /app : le cache de l'optimiseur d'images.
RUN rm -rf .next/cache && mkdir -p .next/cache && chown node:node .next/cache

USER node
VOLUME ["/data"]
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
