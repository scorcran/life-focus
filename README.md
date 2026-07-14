# Life Focus Intelligence

A personal intelligence system for managing work-life balance and commitments.

## Prerequisites

- Node.js 24 LTS
- Docker and Docker Compose
- npm (comes with Node.js)

## Quick Start

1. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build packages** (required before `npm run dev` or Docker builds):
   ```bash
   npm run build
   ```

4. **Start the development environment:**
   ```bash
   docker compose up
   ```
   This starts:
   - `postgres:17` on port 5432 (configurable via `POSTGRES_HOST_PORT`)
   - `apps/web` (Next.js) on port 3000 (configurable via `WEB_HOST_PORT`)
   - `apps/worker` (pg-boss job runner)

5. **Verify the web app is running:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Healthy response: `{"status":"ok","db":true,"correlationId":"..."}`

   Degraded response (DB unreachable — HTTP 503):
   `{"status":"degraded","db":false,"correlationId":"..."}`

## Development

```bash
# Type checking
npm run typecheck

# Linting (ESLint, incl. AD-1 architecture rules + fixture checks)
npm run lint

# Tests
npm test

# Lint violation fixtures (asserts violations are caught)
bash check-fixtures.sh
```

## Project Structure

```
apps/
  web/        # Next.js 16.2 host (UI, server actions)
  worker/     # Bare Node 24 host (pg-boss jobs)
packages/
  config/     # Typed environment configuration (zod 4)
  planner/    # Pure planning function stub
  ledger/     # Event ledger stub (append-only, AD-4)
  policy/     # Protection levels and autonomy rules stub
  interpretation-schema/  # Zod assertion contracts (AD-3)
  broker/     # Cross-context output filter stub (SEC-2)
  connectors/ # Google Calendar connector stub (gcal/)
  llm-gateway/ # LLM routing stub (AD-3)
  db/         # Drizzle ORM client factory
  notify/     # Notification adapter stub
```

## Architecture

This project follows hexagonal architecture (ports & adapters):

- **Core packages** (`planner`, `ledger`, `policy`, `interpretation-schema`): pure TypeScript, no I/O, no framework dependencies
- **Adapters** (`broker`, `connectors`, `llm-gateway`, `notify`, `db`): implement ports defined by core
- **Hosts** (`apps/web`, `apps/worker`): thin, replaceable entry points

**AD-1:** Core packages must never import adapters or hosts. Enforced by **ESLint**
(`no-restricted-imports` in `eslint.config.js`), covering both:
- workspace package specifiers (e.g. `@life-focus/db`)
- relative paths that traverse into another package's `src/` or `dist/`
  (e.g. `import '../../db/src/index.js'` from `packages/planner/src`)

Env discipline is enforced alongside it: `process.env` reads and
`import { env } from 'node:process'` are banned everywhere except `packages/config`.

`npm run lint` runs ESLint over the repo and then `check-fixtures.sh`, which lints
known-violation files in `fixtures/` with the production config and fails the build
if any violation class goes undetected.

## Stopping

```bash
# Stop containers, keep the database volume intact
docker compose stop

# Stop containers AND remove them (keeps the DB volume)
docker compose down

# WARNING: this DESTROYS the database volume and all data
docker compose down -v
```
