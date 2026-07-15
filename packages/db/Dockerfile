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

RUN npm ci

# Copy source for the two packages the migrate runner needs
COPY tsconfig.base.json tsconfig.build.json ./
COPY packages/config/ packages/config/
COPY packages/db/ packages/db/

RUN npm run build --workspace=packages/config
RUN npm run build --workspace=packages/db

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

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

# Built code + the generated migration SQL (runMigrations resolves ../drizzle
# relative to dist/, so the folder must sit next to dist inside packages/db).
COPY --from=builder /app/packages/config/dist ./packages/config/dist
COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/packages/db/drizzle ./packages/db/drizzle

CMD ["node", "packages/db/dist/migrate-cli.js"]
