---
title: 'Story 1.1: Project Scaffold and Development Environment'
type: 'chore'
created: '2026-07-12'
status: 'in-review'
baseline_revision: 'e601cb281c25deb98b09f046fe4e805a9abb04e3'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-life-focus-2026-07-12/ARCHITECTURE-SPINE.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** The repo contains only planning artifacts — no code. Every subsequent story needs a consistent, testable monorepo where the architecture's structural constraints (dependency direction, config discipline, logging, a11y lint) are enforced by tooling from the first commit.

**Approach:** Scaffold the monorepo exactly per the architecture Structural Seed (npm workspaces: `apps/web`, `apps/worker`, 10 `packages/*`), with a one-command dev environment (`docker compose up` → web + worker + Postgres 17 + pg-boss connected + health endpoint), and gates: TS 7 strict, Vitest seed tests, dependency-direction lint, no-stray-`process.env` lint, jsx-a11y lint, pino JSON logging with correlation IDs.

## Boundaries & Constraints

**Always:**
- Package layout matches the Structural Seed exactly: `apps/web`, `apps/worker`, and `packages/`: `planner`, `ledger`, `policy`, `interpretation-schema`, `broker`, `connectors`, `llm-gateway`, `db`, `config`, `notify` (10 packages; `connectors` is one package containing a `gcal/` subdir placeholder).
- Stack pins: TypeScript 7.x strict, Node 24 LTS, Next.js 16.2, Drizzle ORM 0.45.x, pg-boss 12.x, zod 4.x, Postgres 17 (matches Supabase prod major). Drizzle connects via standard Postgres connection string only.
- All env access flows through `packages/config` (zod-typed, loaded once at host startup). A `process.env` read anywhere else must fail `npm run lint`.
- Lint enforces AD-1: core packages (`planner`, `ledger`, `policy`, `interpretation-schema`) may not import adapters (`broker`, `connectors`, `llm-gateway`, `notify`, `db`), hosts, or I/O/framework libraries; `planner`/`policy` may import `ledger`/`interpretation-schema` types, never the reverse.
- `eslint-plugin-jsx-a11y` is in the lint gate.
- Structured JSON logging (pino or equivalent) with a request-correlation-ID middleware in `apps/web` and job-correlation IDs in `apps/worker`.
- Secrets via `.env` (gitignored, compose `env_file`); commit `.env.example` with every variable documented.

**Block If:**
- TypeScript 7.x, Next.js 16.2, pg-boss 12.x, Drizzle 0.45.x, or zod 4.x is not installable from the npm registry — deviating from an architecture pin is a human decision.
- The scaffold cannot satisfy AD-1 lint enforcement with any available tooling (eslint rules or dependency-cruiser).

**Never:**
- No auth (Better Auth is Story 1.2), no event-ledger schema or migrations (1.3), no Google OAuth/connector logic (1.4), no agenda UI (1.5). Packages ship as compilable stubs with seed tests only.
- No Supabase Auth/SDK/realtime/edge functions. No LLM calls. No CI pipeline setup (not in scope).
- Do not delete or modify `_bmad*`, `design-artifacts/`, `stitch_life_focus_intelligence 2/`, or planning docs.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Dev up | clean checkout + `.env` from example, `docker compose up` | web, worker, postgres:17 start; `GET /api/health` → 200 JSON incl. db-reachable; worker logs pg-boss connected | No error expected |
| Health w/ DB down | postgres container stopped | `/api/health` responds non-200 (or 200 with `db: false` status field) — never hangs/crashes | Degraded status reported |
| Stray env read | `process.env.X` added outside `packages/config` | `npm run lint` fails | Lint error names the rule |
| Core imports adapter | `packages/planner` imports `packages/db` | `npm run lint` (or the dedicated dep-check script in the lint gate) fails | Violation names the boundary |

</intent-contract>

## Code Map

Greenfield — repo root has only planning artifacts, `package.json` (shadcn devDep — keep), `package-lock.json`, `.gitignore`.

- `package.json` -- extend to npm workspaces root; scripts: `dev`, `build`, `lint`, `typecheck`, `test`
- `tsconfig.base.json` + per-workspace `tsconfig.json` -- TS 7 strict, project references
- `eslint.config.*` -- flat config: boundaries/AD-1 rules, no-process-env (allowlist `packages/config`), jsx-a11y for `apps/web`
- `docker-compose.yml`, `apps/web/Dockerfile`, `apps/worker/Dockerfile` -- dev environment; postgres:17 service with volume
- `.env.example` -- documented variables (DATABASE_URL, PORT, LOG_LEVEL, …)
- `apps/web/` -- Next.js 16.2 minimal app; `/api/health` route; pino request-ID middleware/instrumentation
- `apps/worker/` -- bare-Node entry: loads config, connects pg-boss 12, registers a heartbeat/noop job with job-correlation-ID logging
- `packages/*` (10) -- each: `package.json`, `tsconfig.json`, `src/index.ts` minimal typed stub, co-located `*.test.ts` seed test
- `packages/config/src/` -- zod-validated env schema, single load point
- `packages/db/src/` -- drizzle client factory from connection string (no schema yet)

## Tasks & Acceptance

**Execution:**
- [x] `package.json`, `tsconfig.base.json`, `.gitignore` -- init npm workspaces, TS 7 strict base config, ignore `.env`/build outputs -- foundation for all workspaces
- [x] `packages/config` -- typed env module (zod 4) + seed test -- config discipline from first commit
- [x] `packages/{planner,ledger,policy,interpretation-schema,broker,connectors,llm-gateway,db,notify}` -- stub `src/index.ts` + seed test each; `connectors` gets `gcal/` placeholder dir; `db` exports drizzle client factory -- Structural Seed complete
- [x] `eslint.config.*` -- dependency-direction rules (AD-1 + intra-core direction), no-process-env outside config, jsx-a11y -- constraints enforced by tooling
- [x] `apps/web` -- Next.js 16.2 minimal host, `/api/health` (checks DB reachability via `packages/db` + `packages/config`), pino JSON logging with per-request correlation ID -- web host + health AC
- [x] `apps/worker` -- Node 24 entry connecting pg-boss 12 via config, noop job registration, pino JSON logging with job correlation IDs -- worker host AC
- [x] `docker-compose.yml` + Dockerfiles + `.env.example` -- postgres:17, web, worker services wired via `env_file` -- one-command dev environment
- [x] `packages/config/src/*.test.ts` + lint fixtures -- unit-test I/O matrix edge cases (env validation failure) and verify lint catches the two violation scenarios (may be a script asserting eslint exit code on fixture files) -- gates proven, not assumed
- [x] `README.md` -- quickstart: prerequisites, `.env` setup, `docker compose up`, test/lint commands -- onboarding for later stories

**Acceptance Criteria:**
- Given a clean checkout with `.env` copied from `.env.example`, when `docker compose up` runs, then web, worker, and Postgres 17 containers start, `GET /api/health` returns 200 with a db-reachable indicator, and worker logs show pg-boss connected.
- Given the repo, when `npm run typecheck` runs, then TS 7 strict passes across all workspaces.
- Given the repo, when `npm test` runs, then Vitest passes with ≥1 seed test per package (10) and per app (2).
- Given a fixture where a core package imports an adapter or a `process.env` read exists outside `packages/config`, when the lint gate runs, then it exits non-zero.
- Given `apps/web` handles a request or `apps/worker` runs a job, when logs are emitted, then they are structured JSON lines carrying a correlation ID.

## Spec Change Log

## Review Triage Log

## Design Notes

- Package manager: npm (lockfile already present) with workspaces — no pnpm/turbo; keep tooling minimal.
- Dependency-direction enforcement: prefer eslint (`eslint-plugin-boundaries` or `import-x/no-restricted-paths`); dependency-cruiser as a `lint`-gate script is acceptable if eslint proves awkward. Mechanism is free; the failing-build behavior is the requirement.
- Stubs must be honest: each core package exports at least one typed symbol reflecting its future role (e.g. `planner` exports a `planDay` signature returning a placeholder) so seed tests test something real, but no domain logic.
- Health endpoint reports degraded rather than throwing when DB is unreachable — connector/sync-health framing (never raw "Error") starts here.

## Verification

**Commands:**
- `npm install` -- expected: clean install, lockfile updated
- `npm run typecheck` -- expected: exit 0
- `npm run lint` -- expected: exit 0 on clean tree; non-zero on the two violation fixtures
- `npm test` -- expected: Vitest green, ≥12 tests
- `docker compose up -d && curl -fsS localhost:3000/api/health` -- expected: 200 JSON with ok/db status; `docker compose logs worker` shows pg-boss connected
- `docker compose down -v` -- expected: clean teardown
