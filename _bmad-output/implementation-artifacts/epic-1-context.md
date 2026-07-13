# Epic 1 Context: Steel Thread Foundation

<!-- Generated from planning artifacts. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Establish the load-bearing infrastructure for every story that follows: a scaffolded, linted, testable monorepo; an authenticated shell with the full visual identity; an append-only event ledger with undo and cross-context audit; Google Calendar OAuth with context assignment at connect time; and a read-only agenda view that proves events flow end-to-end correctly. When Epic 1 is complete, the architecture's structural constraints are enforced by tooling (not just convention), the privacy seam exists at the database level before any user data lands, and a developer can add a new feature into a consistent, well-understood codebase.

## Stories

- Story 1.1: Project Scaffold and Development Environment
- Story 1.2: Sign In to a Themed, Accessible Shell
- Story 1.3: The Event Ledger — Small but Final
- Story 1.4: Connect Both Google Calendars with Context Assignment
- Story 1.5: See My Real Days

## Requirements & Constraints

**Environment and tooling**
- `docker compose up` must bring up the web host, worker host, and a local Postgres container (major version pinned to match Supabase prod) with pg-boss connected and a health endpoint responding.
- TypeScript 7 strict must pass. Vitest must run green with at least one seed test per package. Dependency-direction lint must enforce that core packages never import adapters or hosts.
- All environment configuration flows through a single typed `config` module; any `process.env` read outside it fails lint.
- Structured JSON logging with request/job correlation IDs must be in place from the first commit.

**Authentication and shell**
- Better Auth gates every surface; the single app user must sign in before seeing any content.
- DESIGN.md core light-mode tokens (exact hex values) must be in place by end of Story 1.2 — dark tokens are deferred to Epic 13.

**Event ledger (the core mechanism)**
- Every domain write appends a row with: `event_seq`, `event_type`, `actor`, non-null `context`, `payload JSONB`, `caused_by`. No `UPDATE` or `DELETE` on event tables — enforce at the DB level (constraint or revoked privilege, not just convention).
- Current state is served exclusively from projection tables rebuilt from events.
- Undo emits a compensating *forward* event; `compensatesEventId` is an audit linkage field only, never consulted by projection logic.
- Every cross-context read/emit writes an audit row (the AC-14 instrument). A separation test must prove a work-context query can never return personal-context rows and vice versa.
- An erasure ADR must be recorded in-repo (redactable payloads vs. crypto-deletion) before schema implementation begins. All payload schemas live only in `packages/ledger`.

**Google Calendar connector**
- OAuth scopes are read-only calendar. Context (`work` or `personal`) must be chosen before the connection saves; it is immutable thereafter (reconnect to change).
- Events land in source-mirror tables (cache semantics, safe to rebuild) — never written directly to domain state. Promotion is an explicit command.
- Initial and incremental sync run as pg-boss jobs with retry/backoff. Connector failure lowers confidence and emits a sync-health event; it must never mutate or delete domain rows.
- A revoked token must surface an in-app disclosure within one sync cycle.
- Recurring events, all-day events, and timezone/DST edge cases must pass the ADD-2 connector test suite.

**Privacy and security**
- Mirror sync stores only planning-necessary fields — no calendar event bodies or attachments beyond what future extraction will require (NFR-6).
- The broker (SEC-2 seam) at MVP scope = context-tag check + audit emit on any cross-context read or output. The constraint-exchange engine is v1.0.
- The erasure design (ADD-5) — whether payloads are redactable or crypto-deleted — must be decided and recorded as an ADR before any event schema is finalized.

**Accessibility floor (applies to all UI in this epic)**
- Status must never be conveyed by color alone (icon + text required).
- `eslint-plugin-jsx-a11y` in the lint gate from Story 1.1.
- Landmark roles (`nav`, `main`, `aside`) and keyboard operability on the shell navigation.
- Focus-visible ring: 2px, 2px offset, `light-primary` color, applied via `:focus-visible` only, never clipped by parent `overflow:hidden` or `border-radius`.

## Technical Decisions

**Monorepo layout (Structural Seed — exact)**
```
apps/web/        # Next.js 16 host: UI, server actions, Better Auth
apps/worker/     # bare-Node host: pg-boss jobs (sync, extraction, plan-prep, backup)
packages/
  planner/       # pure function: (ContextSnapshot, PolicySet, now) → PlanProposal
  ledger/        # event append + projections + undo
  policy/        # protection levels, boundaries, autonomy rules
  interpretation-schema/  # zod contracts: Assertion, typed extraction shapes
  broker/        # cross-context output filter (SEC-2)
  connectors/    # gcal/ connector lives here
  llm-gateway/   # model routing, cost log, prompt versions
  db/            # drizzle schema, migrations
  config/        # typed env access
```
Epic 1 touches: `apps/web`, `apps/worker`, `packages/ledger`, `packages/db`, `packages/connectors/gcal`, `packages/config`, `packages/broker` (stub).

**Stack pins**
TypeScript 7.x strict · Node 24 LTS · Next.js 16.2 · Drizzle ORM 0.45.x · pg-boss 12.x · Better Auth (current stable at scaffold) · zod 4.x · Postgres via Supabase (standard connection string only — no Supabase Auth, SDK, realtime, or edge functions)

**Binding architectural rules**
- AD-1: Core packages import no adapter, host, or I/O library. Direction: `planner`/`policy` may import types from `ledger` and `interpretation-schema`; never the reverse. Enforced by lint.
- AD-4: All domain mutation is an append. Command naming is imperative (`CalendarConnected`); event naming is past-tense (`CalendarSynced`). Payloads are zod-validated against schemas defined once in `packages/ledger`.
- AD-5: `context ∈ {work, personal, joint}` is a non-null column on every domain entity. `joint` is legal only on planning-layer artifacts — not on source-mirror rows.
- AD-6: Source identity = (provider, account, context). Context is assigned at connect time, immutable thereafter.
- AD-7: Connectors write to source-mirror tables only. Domain state changes only via explicit AD-4 commands.
- AD-9: Drizzle over a standard Postgres connection string. No ORM-specific or Supabase-specific features.

**Conventions that apply from Story 1.1**
- IDs: UUIDv7 (application-generated via `uuidv7` npm package). Event tables also carry a monotonic `event_seq bigint`.
- Time: ISO-8601 UTC in storage and payloads; user timezone applied at render only. Durations are integer minutes.
- Web mutations: Next.js server actions append AD-4 commands. API route handlers exist only for OAuth callbacks and webhooks.
- Worker jobs: defined in `apps/worker` only; handlers are thin over core. Exhausted jobs emit a sync-health event (no silent failure).
- Testing: Vitest, co-located `*.test.ts`. Planner logic covered by pure unit tests. Integration tests run against an ephemeral Postgres container.

**No LLM calls in Epic 1.** The `llm-gateway` package is scaffolded but not invoked. The planner and broker exist as stubs or minimal implementations sufficient for Story 1.5's read-only agenda view.

## UX & Interaction Patterns

**Visual identity (Story 1.2)**
- Fonts: Playfair Display (headlines only: `display-lg` 48px, `headline-lg` 32px, `headline-md` 24px). Public Sans for all body, labels, and navigation text.
- Colors: warm stone background (`#fcf9f3` family), deep teal-sage primary (`#2D3E40`/`#17282a`). Exact hex values per DESIGN.md frontmatter — no hardcoded overrides.
- Side nav: 80px icon rail on desktop; icon + `label-caps` (12px, 600 weight, 0.08em tracking, uppercase) label below each item. Active item: `surface-container` fill + 2px primary right border. On mobile: 4-tab bottom strip (Today / Interrupts / Inbox / Commitments).

**Agenda view degraded states (Story 1.5)**
- Last-sync timestamp must be visible per calendar source.
- When a source is stale or connector has failed: "Last synced [time] — plan may not reflect recent changes. Capture anything new manually." Never "Error" or "Sync failed."
- Context tags (work / personal) must render on every event, with correct local times including DST-transition dates.

## Cross-Story Dependencies

- Story 1.1 must complete before all others — it establishes the package layout, lint rules, and dev environment that every subsequent story runs inside.
- Story 1.3 (the event ledger) must complete before Story 1.4, because calendar sync events are AD-4 commands landing in the ledger.
- Story 1.4 must complete before Story 1.5 — the agenda view reads from the projections populated by the calendar connector.
- Story 1.2 can run in parallel with Story 1.3 after Story 1.1 is done.
- The erasure ADR (Story 1.3 spike) is a blocking dependency on the event table schema — it must be decided before any integration tests or Story 1.4 work begins.
- Epic 13 (Foundation Completion) depends on Epic 1 for dark token delivery and full sync hardening; do not defer dark-mode infrastructure beyond Epic 13.
