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
COPY apps/worker/ apps/worker/
COPY packages/config/ packages/config/

# Build packages first
RUN npm run build --workspace=packages/config

# Build worker
RUN npm run build --workspace=apps/worker

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/apps/worker/package.json ./apps/worker/
COPY --from=builder /app/packages/config/dist ./packages/config/dist
COPY --from=builder /app/packages/config/package.json ./packages/config/
COPY --from=builder /app/package.json ./

CMD ["node", "apps/worker/dist/index.js"]
