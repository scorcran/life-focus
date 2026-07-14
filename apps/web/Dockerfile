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
COPY apps/web/ apps/web/
COPY packages/config/ packages/config/
COPY packages/db/ packages/db/

# Build packages that web depends on
RUN npm run build --workspace=packages/config
RUN npm run build --workspace=packages/db

# Typecheck gates the image build. next.config.mjs sets ignoreBuildErrors (Next's checker
# doesn't handle the TS 7 layout), so a type-broken image must be caught here instead.
RUN npm run typecheck --workspace=packages/config --workspace=packages/db --workspace=apps/web

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=apps/web

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Production-only install: keeps the dev toolchain (typescript, vitest, eslint, babel)
# out of the runtime image while preserving the workspace symlinks Next needs at runtime.
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
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/next.config.mjs ./apps/web/
COPY --from=builder /app/packages/config/dist ./packages/config/dist
COPY --from=builder /app/packages/db/dist ./packages/db/dist

EXPOSE 3000
WORKDIR /app/apps/web
CMD ["/app/node_modules/.bin/next", "start"]
