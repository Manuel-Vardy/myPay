FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Install all dependencies (needed for build)
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_ values are inlined into the client bundle at build time —
# prod builds must pass --build-arg NEXT_PUBLIC_CHECKOUT_BASE_URL=https://pay.xx.com
# and --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.xx.com
ARG NEXT_PUBLIC_CHECKOUT_BASE_URL
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_CHECKOUT_BASE_URL=$NEXT_PUBLIC_CHECKOUT_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN npm run build

# Migration job — full deps (knex CLI needs ts-node for .ts migrations).
# Must stay above `runner` so plain `docker build .` still targets the app.
FROM base AS migrate
ENV NODE_ENV=production
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .
USER node
CMD ["npm", "run", "db:migrate"]

# Production runner — standalone output only
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
