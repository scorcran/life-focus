# Architecture pins Node 24 LTS; node:24-alpine is unpullable on this dev machine (registry timeout).
# TODO: bump both stages to node:24-alpine when the image is available. Code targets Node 24 semantics.
FROM node:22-alpine AS builder
WORKDIR /app

# Copy workspace manifests for cache layer
COPY package.json package-lock.json .npmrc ./
COPY apps/web/package.json apps/web/
COPY apps/worker/package.json apps/worker/
COPY packages/config/package.json packages/config/
COPY packages/planner/package.json packages/planner/
COPY packages/ledger/package.json packages/ledger/
COPY packages/policy/package.json packages/policy/
COPY packages/interpretation-schema/package.json packages/interpretation-schema/
COPY packages/broker/package.json packages/broker/
COPY packages/connectors/package.json packages/connectors/
COPY packages/llm-gateway/package.json packages/llm-gateway/
COPY packages/db/package.json packages/db/
COPY packages/notify/package.json packages/notify/

# Install all workspace deps
RUN npm ci

# Copy source
COPY tsconfig.base.json tsconfig.build.json ./
COPY apps/web/ apps/web/
COPY packages/config/ packages/config/
COPY packages/db/ packages/db/

# Build packages that web depends on
RUN npm run build --workspace=packages/config
RUN npm run build --workspace=packages/db

# Build Next.js app.
# Next 16.2's TypeScript detection doesn't recognize the TS 7 package layout and falls into
# its auto-install path. With yarn on PATH it picks yarn, which hard-fails our engines pin
# on this node:22 image. Remove yarn so the fallback uses npm, where it's a no-op.
RUN rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg && corepack disable 2>/dev/null || true
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=apps/web

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/apps/web/next.config.mjs ./apps/web/
COPY --from=builder /app/packages/config/dist ./packages/config/dist
COPY --from=builder /app/packages/config/package.json ./packages/config/
COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/packages/db/package.json ./packages/db/
COPY --from=builder /app/package.json ./

EXPOSE 3000
WORKDIR /app/apps/web
CMD ["/app/node_modules/.bin/next", "start"]
