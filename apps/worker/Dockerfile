FROM node:24-alpine AS builder
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

# Typecheck gates the image build so a type-broken image cannot be produced.
# (Not the workspace `typecheck` script: TS7 rejects `--build --noEmit` when the
# project references composite projects — TS6310.)
RUN npm run typecheck --workspace=packages/config && npx tsc -p apps/worker --noEmit

# Build worker
RUN npm run build --workspace=apps/worker

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Production-only install: keeps the dev toolchain (typescript, vitest, eslint, babel)
# out of the runtime image while preserving the workspace symlinks needed at runtime.
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
RUN npm ci --omit=dev && npm cache clean --force

# Copy built artifacts
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/packages/config/dist ./packages/config/dist

CMD ["node", "apps/worker/dist/index.js"]
