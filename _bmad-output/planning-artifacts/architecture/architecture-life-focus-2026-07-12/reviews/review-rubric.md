# Architecture Spine Rubric Review

**Document reviewed:** ARCHITECTURE-SPINE.md
**Spine dated:** 2026-07-12
**PRD reference:** prd-life-focus-2026-07-10/prd.md
**Reviewer:** Rubric-walker pass (2026-07-12)

---

## Verdict

The spine is structurally solid and unusually well-grounded for a solo-founder greenfield: the hexagonal paradigm, event-ledger invariant, and context-tag seam are real load-bearing decisions that prevent the most common divergence modes. Three issues require resolution before build sessions begin — one is a CRITICAL gap (secrets/auth/operations are partially implicit) and two are HIGH (a stale or plausible-but-unverified Next.js version, and a missing decision on test architecture).

---

## Checklist Item Verdicts

### 1. Fixes real divergence points; misses none — THIN

**Rationale:** The 10 ADs cover the most dangerous divergence vectors: hexagonal boundary (AD-1), pure planner (AD-2), single LLM gate (AD-3), event-ledger as sole write mechanism (AD-4), context tag discipline (AD-5), connection-level context assignment (AD-6), connector ingest/promote split (AD-7), MVP write-surface lockdown (AD-8), plain Postgres (AD-9), single authority-order resolver (AD-10). These are the right choices.

However, two divergence points are not covered by any AD:

- **Test architecture** — with a pure planner (AD-2) and typed assertions (AD-3), build sessions will independently reach different answers about where unit tests live, what the test harness for a pg-boss job looks like, and whether integration tests hit a real DB or a stub. In a modular monolith with 8+ packages, a missing test-architecture convention is a genuine divergence point. The spine should at minimum note "unit tests co-located with packages; integration tests in a top-level `tests/` with Docker-composed Postgres."

- **Server Actions vs. API Routes** — `apps/web` is Next.js with server actions as the stated pattern, but the spine never explicitly rules out API routes. In practice, a build session doing the Capture Inbox or the plan-approval flow may reach for `app/api/` routes. A one-line AD or convention note would close this.

Both are thin omissions; neither will cause catastrophic divergence, but they will produce inconsistency across build sessions.

---

### 2. Every AD's Rule is enforceable and prevents stated divergence — THIN

**Rationale:** Most ADs are concrete and machine-checkable or code-reviewable:
- AD-1: `eslint` import rules can enforce the core↔adapter boundary.
- AD-2: function signature `(ContextSnapshot, PolicySet, now) → PlanProposal | PlanDiff` is checkable.
- AD-3: grep for `client.messages.create` outside `llm-gateway` catches violations.
- AD-4: no `UPDATE`/`DELETE` on event tables — enforced by DB policy or code review.
- AD-5: non-null `context` column — DB constraint enforces it.
- AD-8: "no adapter mutates any external system except Gmail draft creation" — clear and auditable.

**One vagueness finding (LOW):** AD-3 states "Both contexts' content may flow to the Anthropic API under no-training terms — this user-approved egress (2026-07-12) is distinct from SEC-2." The distinction is noted but the *mechanism* is not: there is no stated convention for how a build session verifies no-training terms are honored at the API level (header, SDK setting, contract artifact). This is a compliance note, not a true AD, and the lack of a testable mechanism means a build session may assume it's handled elsewhere.

**One aspiration-leaning phrase (LOW):** AD-10 says conflicts "surface to the user (FR-44) rather than auto-resolving; the resolution is an AD-4 event" — this is fine, but "Materially uncertain" is undefined. A build session needs to know what threshold triggers a surfacing vs. auto-resolution. This belongs in `interpretation-schema` design, but the spine should acknowledge the threshold is TBD so a build session doesn't invent one silently.

---

### 3. Nothing under Deferred could let two units diverge NOW — PASS

**Rationale:** Each deferred item is evaluated:

- **Slack/Jira/Apple connectors** — safely deferred; AD-7 already governs how new connectors behave. No new invariants needed.
- **Learning-loop storage** — deferred with a concrete partial decision ("learned assumptions are AD-4 events with expiry"); the schema gap is acknowledged. Safe.
- **Broker hardening** — MVP scope is explicit: tag + audit, allow/deny. The v1.0 constraint-only semantics are deferred but the AD-5 rule governs the MVP behavior completely. Safe.
- **Notification transport** — in-app only at MVP; push deferred. Safe.
- **Estimation defaults (OQ-2)** — deferred with a concrete interim: user-input + per-type templates. No divergence risk because the planner (AD-2) requires effort to be passed in, not inferred internally.
- **Multi-user (OQ-7)** — correctly flagged as a future assumption-breaker; the spine marks it explicitly so it's findable. Safe.
- **Observability** — in-app sync health only; add when needed. Safe.
- **Plan-projection rebuild strategy** — deferred with the AD-4 schema explicitly supporting both options. Safe.

No deferred item creates a current divergence risk. This is one of the spine's stronger sections.

---

### 4. Named tech is verified-current — FAIL (one item)

**Finding (HIGH):** The Stack table lists **Next.js 16.2**. As of early 2026, the stable Next.js release line was 14.x or early 15.x. "16.2" does not correspond to any known stable Next.js release — this either represents a future version being anticipated (which is invalid for a build substrate), a typo for 15.2 or 14.2, or an internal versioning scheme that does not map to npm. A build session scaffolding with `npx create-next-app` against "16.2" will get an error or pull a different version than intended. This must be corrected before scaffold time.

**All other named tech is plausible-current:**
- TypeScript 5.x strict — current.
- Node.js 22 LTS — correct (22 entered LTS in late 2024).
- Drizzle ORM 0.45.x — Drizzle was at ~0.30–0.36 range in late 2025; 0.45.x is a plausible near-future pinned version, flag for web-verification but not obviously wrong.
- pg-boss 12.x — plausible; pg-boss was at ~10.x in late 2025; 12.x is a forward-looking pin worth verifying.
- zod 4.x — Zod 4 was released/announced in 2025; plausible.
- Better Auth — "current stable at scaffold time" is a safe hedge.
- Anthropic TS SDK — "current stable" is a safe hedge; model names `claude-haiku-4-5` and `claude-sonnet-5` are specific and should be web-verified by the tech-currency reviewer.

**Summary:** flag Next.js 16.2 as likely erroneous; flag Drizzle 0.45.x, pg-boss 12.x, and Anthropic model IDs for web-verification.

---

### 5. Covers the PRD's capabilities — PASS (with one thin spot)

**Rationale:** The Capability→Architecture Map is thorough and traceable. Checking against PRD §7.2 MVP scope items:

| MVP Capability | Map Entry | Coverage |
|---|---|---|
| Life model, lite (FR-1–7) | `policy` + `ledger`, AD-4/5 | Covered |
| Google Calendar + Gmail ingestion (FR-13–16) | `connectors/*`, AD-6/7 | Covered |
| Capture inbox (FR-17–20) | `apps/web` → AD-4 commands | Covered |
| Commitment Ledger (FR-21–24) | `ledger`, AD-4 | Covered |
| Morning planning loop + P11 (FR-25–35) | `planner`, AD-1/2 | Covered |
| Extraction + assertions (FR-41–46) | `llm-gateway` + `interpretation-schema`, AD-3 | Covered |
| Interrupt assessment, P11 display | `planner`, AD-2 — P11 checklist noted as data | Covered |
| End-of-day review | `apps/web` routes per surface, AD-1 | Implicitly covered via FR-67–68 row |
| Gmail draft creation (AC-10) | `apps/web` + gmail connector, AD-8 | Covered |
| Sync health / degradation (FR-60–62) | connector sync-health + UI, AD-7 | Covered |
| SEC-1–6 privacy seam | context tags + `broker`, AD-5/6 | Covered |

**Thin spot:** The PRD's `notify` package appears in the Capability Map (FR-56, Notifications) but `notify` is listed in the Structural Seed without a corresponding AD or Consistency Convention governing how it interacts with the broker filter. AD-5's final sentence says "every cross-context read/emit is an AD-4 audit event" and references the broker, but there is no explicit rule stating notifications must pass through the broker before emission. A build session implementing notifications could bypass the context tag check. A one-line convention ("Notifications emitted only via `notify`; `notify` calls broker before any cross-context emission") would close this.

---

### 6. Every owned dimension decided, deferred, or open question — FAIL (one CRITICAL)

**Checklist:** deployment & environments, infra/provider, operations, backup/restore, secrets.

| Dimension | Status |
|---|---|
| Deployment & environments | Decided: unraid Docker Compose prod; dev Docker Compose with local Postgres; explicit environment names (`dev`, `prod`). PASS. |
| Infra/provider | Decided: Supabase Postgres for prod DB; unraid array for nightly backup. PASS. |
| Backup/restore | Decided: nightly `pg_dump` via pg-boss job to unraid array. PASS. |
| Secrets | Partially decided — the Conventions table says "`.env` per environment, loaded once at host startup, typed via a single `config` module; no `process.env` reads outside it" — this is a good convention but does not decide WHERE secrets live in the deployment stack (unraid compose env vars, a `.env` file on disk, Docker secrets). For a solo-founder unraid deployment this is a real operational question: if the `.env` file is on the unraid array, is it in the backup? Is it separate? The spine should note the deployment-time secret-storage mechanism or explicitly defer it as OQ-N. |
| Operations | SILENT — the spine has no statement about what happens when the system runs unattended: no on-call, no alerting, but also no explicit decision that "single-tenant, always-on, sync failures are surfaced in-app and the user self-responds." The deferred section says "Observability beyond in-app sync health" but there is no decision about what to do when the worker crashes silently, when pg-boss jobs fail repeatedly, or when the Supabase connection drops. For a solo-founder this is "I'll notice" but that should be an explicit decision, not a silence. |
| Auth | Decided: Better Auth in `apps/web`; worker trusts DB boundary. PASS. |
| Google OAuth | Mentioned: personal-use/unverified mode, single-tenant, no CASA. PASS. |

**CRITICAL finding:** The "Operations" dimension is silent on failure handling and recovery posture for unattended runs. A build session implementing the worker will make independent choices about pg-boss job failure escalation, retry limits, and dead-letter handling. AD-7 says "Connector failure may only lower confidence and flag staleness — never mutate or delete domain rows" but does not say what happens when a pg-boss job fails repeatedly: does it dead-letter? Alert? The pg-boss library has rich failure/retry semantics and build sessions will diverge on configuration without an explicit decision or acknowledged deferral.

**HIGH finding (secrets):** Deployment-time secret storage mechanism is unspecified. For unraid + Docker Compose this is a real decision (bind-mounted `.env` file, Docker secrets file, unraid CA plugin). Should be decided or explicitly deferred.

---

### 7. Diagrams are valid mermaid and carry real information — PASS (with one note)

**Diagram 1 — Dependency graph (graph TD):**
Valid Mermaid syntax. Carries real information: the core-is-never-imported-by-adapters constraint is visually explicit via the dashed `CORE -.->|never|` edges. The asymmetry between what `WEB` can import vs. what `WORKER` can import is legible. Real information density: HIGH.

**Diagram 2 — Infrastructure / container diagram (graph LR):**
Valid Mermaid syntax. Shows unraid containers, managed Postgres, external APIs, backup target, and browser. Carries real information about the deployment topology. One note: `WEB --> ANTH` implies the web container also makes direct Anthropic API calls; this should be reconciled with the worker-only LLM invocation implied by the worker's role — if web makes its own calls, the diagram is accurate but AD-3's routing through `llm-gateway` needs to clarify that both hosts can call the gateway (which is a package, not a service). Not a diagram error, but a potential reading inconsistency.

**Diagram 3 — ER diagram (erDiagram):**
Valid Mermaid syntax. The entity chain `SOURCE_IDENTITY → SOURCE_MIRROR → ASSERTION → EVENT → PROJECTION → {COMMITMENT, PERSON, PLAN} → PLAN_DIFF` carries real information about the promotion pipeline. This is a correct and useful diagram.

All three diagrams are valid Mermaid and are not decorative.

---

## Findings Summary

| ID | Severity | Checklist | Finding |
|---|---|---|---|
| F-1 | CRITICAL | #6 (Dimensions) | Operations posture for unattended worker runs is silent — no decision on pg-boss job failure escalation, retry limits, or dead-letter handling; build sessions will diverge independently. |
| F-2 | HIGH | #4 (Tech currency) | Next.js 16.2 does not correspond to any known stable release; likely a typo or error; will break scaffold commands. |
| F-3 | HIGH | #6 (Dimensions) | Deployment-time secret storage mechanism (where `.env` lives in the unraid/Docker Compose stack, backup inclusion) is unspecified. |
| F-4 | HIGH | #1 (Divergence points) | Test architecture is not covered by any AD or convention; build sessions implementing the pure `planner` and pg-boss worker will independently diverge on test harness, co-location, and DB stub strategy. |
| F-5 | MEDIUM | #1 (Divergence points) | Server Actions vs. API Routes is not decided; `apps/web` build sessions will independently reach for both patterns. |
| F-6 | MEDIUM | #5 (PRD coverage) | `notify` package has no explicit broker-pass-through rule; notifications could bypass the context-tag check (SEC-2 violation risk). |
| F-7 | MEDIUM | #4 (Tech currency) | Drizzle 0.45.x, pg-boss 12.x, and Anthropic model IDs (`claude-haiku-4-5`, `claude-sonnet-5`) are plausible but forward-looking; flag for web-verification by tech-currency reviewer. |
| F-8 | LOW | #2 (Enforceable rules) | AD-3's "no-training terms" compliance has no testable mechanism specified; a build session may assume it's handled elsewhere. |
| F-9 | LOW | #2 (Enforceable rules) | AD-10's "materially uncertain" conflict threshold is undefined; build sessions will choose arbitrary thresholds independently. |

**Findings by severity:** CRITICAL: 1 / HIGH: 3 / MEDIUM: 3 / LOW: 2

---

## Top 3 Findings (Prioritized)

1. **[CRITICAL / F-1] Operations posture for unattended worker runs is entirely silent** — pg-boss job failure escalation, retry behavior, and dead-letter handling must be decided or explicitly deferred before the worker is implemented, or build sessions will produce incompatible operational behaviors.

2. **[HIGH / F-2] Next.js 16.2 is not a valid stable release** — this is the version that will be used at scaffold time; if erroneous (likely a typo for 14.2 or 15.2) it will break `create-next-app` invocations and produce a version mismatch across build sessions.

3. **[HIGH / F-4] Test architecture is undecided** — the spine's best feature is a pure, deterministic `planner` core that is trivially unit-testable, but no convention exists for where tests live, what the pg-boss job test harness looks like, or how integration tests provision a DB; this gap will produce inconsistent test coverage across build sessions in a multi-package monorepo.
