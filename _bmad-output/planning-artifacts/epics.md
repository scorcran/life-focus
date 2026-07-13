---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - prds/prd-life-focus-2026-07-10/prd.md
  - prds/prd-life-focus-2026-07-10/addendum.md
  - architecture/architecture-life-focus-2026-07-12/ARCHITECTURE-SPINE.md
  - ux-designs/ux-life-focus-2026-07-12/DESIGN.md
  - ux-designs/ux-life-focus-2026-07-12/EXPERIENCE.md
---

# life-focus - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Life Focus Intelligence, decomposing the requirements from the PRD, UX design contract, and Architecture spine into implementable stories. IDs are preserved from the source documents (PRD FR-n/NFR-n/SEC-n/AC-n, architecture AD-n) so stories can cite them stably. Phase tags: [MVP] = the §7.2 wedge; [v1.0] = complete product.

## Requirements Inventory

### Functional Requirements

**Life model and onboarding**
- FR-1 [MVP]: Configurable life domains (11 defaults); items may span domains; domains inform without becoming silos.
- FR-2 [MVP]: Distinct models for goals, relationship intentions, responsibilities, boundaries, rhythms, important dates.
- FR-3 [MVP]: Protection levels on every plannable item: hard commitment / protected priority / flexible intention / optional opportunity.
- FR-4 [MVP-starter / v1.0-full]: Life Operating Policies across 7 categories; MVP ships non-negotiable + work-boundary starter templates.
- FR-5 [v1.0]: Gradual policy onboarding — templates, observed repeated choices, suggested additions with confirmation.
- FR-6 [v1.0]: Policy-conflict surfacing with controlling policy, alternatives, and recorded exceptions.
- FR-7 [MVP]: Limited-setup onboarding (workday, hard stop, sleep, hard commitments, ≤3 goals, core people, starter policies); v1.0 extends to 3–5 goals / 5–15 people.

**People and relationships**
- FR-8 [MVP-lite / v1.0-full]: Person model (full field set); MVP captures identity/intention/important-date subset; "meaningful interactions" and "life events" are user-asserted only.
- FR-9 [v1.0]: Relationship importance levels influence attention, never absolute priority.
- FR-10 [MVP-rhythm-lite / v1.0-full]: Relationship-generated actions across 6 categories. MVP addition (2026-07-12): one flexible communication rhythm per core person, implemented as a flexible intention linked to a Person, with repeated-displacement visibility; all other action generation v1.0.
- FR-11 [v1.0]: Important dates generate staged preparation workflows scaled by importance/type/lead time; all editable.
- FR-12 [all]: Ethical constraint P5 — reason only about the user's behavior/intentions; never third-party internal state; no relationship scores.

**Source ingestion and context**
- FR-13 [MVP]: OAuth least-privilege source connection with sync tracking; MVP sources = work+personal Google Calendar, work+personal Gmail; v1.0 adds Slack, Jira, task app, Apple ecosystem, meeting notes, documents. Framing (2026-07-12): the email-only MVP is a deliberate channel-limited validation of the interrupt-decision model; Slack (v0.2) completes it.
- FR-14 [MVP]: Separate work/personal identities as first-class, with the §11 privacy boundary.
- FR-15 [MVP-core / v1.0-full]: Request/action extraction (10 intent categories at v1.0); MVP = email-scope extraction, confirmation required, per-account toggle, >50% week-one rejection → forward-only fallback.
- FR-16 [v1.0]: Layered context model (7 layers; entity catalog in addendum).

**Capture**
- FR-17 [MVP]: Natural-language capture desktop + mobile web into Capture Inbox; v1.0 adds voice/extension/share-sheet/forwarding/Slack action/photo/API.
- FR-18 [MVP]: Capture classification into 12 types.
- FR-19 [MVP]: Minimal clarification — ≤3 prompts per item, each naming the planning decision it unblocks.
- FR-20 [MVP]: Capture guarantee — actionable items traceable until resolved or user-deleted.

**Commitments and the Ledger**
- FR-21 [MVP]: Requests distinguished from commitments; full lifecycle state machine.
- FR-22 [MVP]: Commitment record field set (outcome, parties, dates, source, evidence, definition of done, protection, state, history).
- FR-23 [MVP-manual / v1.0-interpreted]: Acceptance interpretation (acknowledgment ≠ investigation ≠ full responsibility); "I'll look into it" never auto-escalates. MVP addition (2026-07-12): when confirming a commitment the user manually selects acceptance type — acknowledged / agreed to investigate / accepted full responsibility / declined; LLM interpretation is v1.0.
- FR-24 [MVP-flag / v1.0-full]: At-risk detection; drafted renegotiation with stakeholder update at v1.0; date-drag ≠ renegotiation.

**Prioritization, capacity, planning**
- FR-25 [MVP]: Multi-dimension prioritization explained in plain language; "why" panel with top contributing dimensions + facts; no unexplained scores.
- FR-26 [MVP-declared / v1.0-inferred]: Realistic capacity — MVP from declared constraints + configurable reserves; v1.0 adds learned/situational inputs.
- FR-27 [v1.0]: Feasibility states (feasible-now / needs preparation / needs person / needs location / needs info).
- FR-28 [MVP]: Overcommitment behavior — state mismatch, show scenarios, never silently consume sleep/family/recovery.
- FR-29 [MVP-day / v1.0-all]: Planning horizons — MVP plans today; v1.0 adds week/month/quarter.
- FR-30 [MVP]: Replanning minimizes movement, explains changes, requests approval; every move shows the P11 six-item consequence checklist.
- FR-31 [MVP-reserves / v1.0-full]: White space protection. Clarified (2026-07-12): reserve mechanics — minimum unallocated buffer, transition time, never auto-filling every opening — are MVP via FR-26 configurable reserves; user-defined named white-space policies and opportunity discovery are v1.0.

**Operating loops**
- FR-32 [MVP]: Morning planning loop (calendars, due work, commitments, requests → capacity → proposed day with exclusions/work-end/risks/confidence → approve/adjust); v1.0 adds evidence retrieval. Clarified (2026-07-12): "due work" at MVP = ledger-resident work — captured commitments, confirmed email-derived items, and calendar deadlines; no external task system of record. MVP additions: goal allocations and relationship rhythms (FR-38/FR-10 lite) feed the loop.
- FR-33 [v1.0]: Weekly planning loop.
- FR-34 [v1.0]: Live-day loop.
- FR-35 [MVP-honest / v1.0-full]: Interrupt loop — MVP: capture, user-confirmed classification, template/user effort, policy check, mechanical plan-diff, do-now/schedule/acknowledge/clarify/decline, P11 display, approval, preserve displaced; v1.0 adds inferred estimation, simulation, delegate, evidence, drafted comms.
- FR-36 [MVP-lite / v1.0-full]: End-of-day loop (completed/displaced/unresolved → closure actions → roll-forward → protect evening → tomorrow model).
- FR-37 [v1.0]: Learning loop (estimate-vs-actual, patterns, confirmed assumptions, correction/expiry/deletion).

**Goal-to-action translation**
- FR-38 [MVP-manual / v1.0-decomposed]: Goal decomposition chain. MVP addition (2026-07-12): the user manually defines one next meaningful action per active goal plus a protected weekly time allocation (reuses protection levels); autonomous decomposition with approval is v1.0.
- FR-39 [v1.0]: Full user control of decomposition.
- FR-40 [MVP-displacement / v1.0-full]: Goal-neglect handling. MVP addition (2026-07-12): repeated displacement of goal allocations is visible (count + neutral language); "best remaining opening" remediation and full allocation tracking are v1.0.

**Documentation, knowledge, evidence**
- FR-41 [v1.0]: Linked-document extraction (commitments/decisions/owners/dates/risks) with confirmation before any document-derived commitment.
- FR-42 [v1.0]: Documents never automatically become work.
- FR-43 [v1.0]: Evidence authority + freshness metadata on every assertion; configurable authority order.
- FR-44 [v1.0]: Source-conflict surfacing with user resolution when material.
- FR-45 [v1.0]: Targeted retrieval only; no bulk indexing.
- FR-46 [MVP]: Traceability — every consequential recommendation retains sources, assumptions, conflicts, confidence, consequences, overrides.

**Execution layer**
- FR-47 [v1.0]: Context packets opening each activity.
- FR-48 [MVP-drafts / v1.0-full]: Execution actions; MVP ships drafted acknowledgments/replies in interrupt + end-of-day loops (Gmail drafts).
- FR-49 [v1.0]: Definitions of done — on request always; proposed automatically for >30-min items without completion criteria.
- FR-50 [v1.0]: Completion behavior checks (waiting parties, follow-ups, source updates, closure).
- FR-51 [MVP]: Communication is work — acknowledge/clarify/renegotiate/status/transfer/confirm as first-class actions.

**Learning and calibration**
- FR-52 [v1.0]: Twelve learnable dimensions.
- FR-53 [v1.0]: Material learned assumptions require confirmation; all visible, correctable, expirable, deletable.
- FR-54 [all]: Learning boundaries — no health/emotional diagnosis, no third-party profiling, no consequential changes from weak patterns.
- FR-55 [v1.0]: Feedback controls (9 named responses).

**Notifications**
- FR-56 [MVP-core / v1.0-full]: Decision-oriented notifications only; MVP triggers (5) / v1.0 triggers (7 more); guilt/engagement/motivational prompts prohibited at every phase.

**Autonomy and audit**
- FR-57 [MVP]: Autonomy ladder L0–L5; MVP = L2–L3 only; sole MVP write surface = Gmail drafts in user's own account; L4 with v1.0 write-back; L5 post-v1.0.
- FR-58 [v1.0]: Autonomy configurable across 8 dimensions.
- FR-59 [MVP]: Every consequential action carries reason, policy, evidence, audit history, undo, disclosure.

**Coverage and degradation**
- FR-60 [MVP-basic / v1.0-full]: Coverage indicators (sources, freshness, blind spots, assumptions, conflicts).
- FR-61 [MVP]: Plan confidence as a defined, documented, displayed function of enumerated inputs.
- FR-62 [MVP]: Connector-failure disclosure, confidence downgrade, manual fallback; active sync-health monitoring.

**Shared responsibility and delegation**
- FR-63 [v1.0]: Responsibility types (7).
- FR-64 [v1.0]: Delegation lifecycle; user responsible until acceptance; drafted requests without collaborative accounts.
- FR-65 [v1.0]: Household behavior — never assume partner absorption; offer options.
- FR-66 [v1.0]: Professional delegation context (ownership, candidates, on-call, approvals, handoff).

**Interface architecture**
- FR-67 [MVP-subset / v1.0-full]: 13 named surfaces; MVP = Today, Morning Plan, Interrupt Decision, Capture Inbox, Commitment Ledger, Policy & Boundaries, End-of-Day Review; v1.0 adds Week, People, Goals, Focus Context, Context Review, Learning Review.
- FR-68 [MVP]: FR-68 visual hierarchy (decision → recommendation → reason → protected → consequence → confidence → source) + mandatory progressive disclosure.

### NonFunctional Requirements

- NFR-1: Trust and explainability — consequential recommendations understandable and traceable to evidence.
- NFR-2: Responsiveness — morning plan interactive <3s from cached context; full refresh <15s; interrupt assessment <10s [ASSUMPTION targets].
- NFR-3: Reliability — commitments and hard boundaries survive connector failure; ledger durable independent of sources.
- NFR-4: Reversibility — one-step undo on every plan mutation; irreversible external actions never automatic.
- NFR-5: Auditability — recommendation → evidence → policy → decision → action → plan change recorded.
- NFR-6: Data minimization — only planning-necessary context retrieved/stored; no bulk indexing.
- NFR-7: Accessibility — keyboard nav, screen readers, AA contrast both themes, non-color status indicators.
- NFR-8: Partial-connectivity operation.
- NFR-9: Platform — desktop web + responsive mobile capture/review as PWA; no native app before Phase 2.
- SEC-1 [MVP]: Strict work/personal context separation.
- SEC-2 [MVP-seam / v1.0-broker]: Trusted planning layer; context tagging + cross-context audit log at MVP; constraint-only broker at v1.0.
- SEC-3 [MVP]: Least-privilege OAuth, permission respect, encryption, retention, deletion, audit history.
- SEC-4 [all]: No training on user data by default; unauthorized cross-context transfers = zero (SM-17, audit-verified).
- SEC-5 [v1.0+]: Document access modes; enterprise processing options scale in Phase 3.
- SEC-6 [all]: Emotionally consequential communication always requires human review; third-party data minimization.

### Additional Requirements

**From the Architecture spine (binding ADs — every story must comply):**
- AD-1: Hexagonal monolith; adapters/hosts depend on core, core imports nothing; intra-core direction planner/policy → ledger/interpretation-schema types.
- AD-2: Planner is a pure function `(ContextSnapshot, PolicySet, now) → PlanProposal|PlanDiff`; no I/O/LLM/clock inside; single named ContextSnapshot zod schema; proposals ephemeral, approved plans persist via AD-4.
- AD-3: All LLM calls through `llm-gateway`, executed only in the worker as pg-boss jobs; web appends commands and observes via DB; typed Assertions (zod, confidence, provenance, context) are the only entry for model output; routing config = claude-haiku-4-5 extraction / claude-sonnet-5 reasoning; per-call cost logging.
- AD-4: All domain mutation = append-only command/event rows; projections in `ledger` only; command/event payload schemas defined once in `ledger`; undo = compensating forward event; no UPDATE/DELETE on event tables.
- AD-5: Non-null context tag (work/personal/joint) on every domain entity; joint only for planning artifacts and user-initiated merges; broker filters everything leaving the authenticated surface; cross-context reads/emits are audit events.
- AD-6: One app user; source identity = (provider, account, context) assigned at connect, immutable; person merge user-initiated only.
- AD-7: Connectors ingest to source-mirror tables (cache semantics); promotion to domain state is an explicit command; failure only lowers confidence; per-connector sync health surfaced in-app.
- AD-8: Only external write at MVP = Gmail draft creation; sending always human; SEC-6 at every phase.
- AD-9: Plain Postgres via Drizzle connection string; no Supabase platform features; nightly pg_dump to unraid array.
- AD-10: Assertion conflicts resolve by the authority order, implemented once in core; material uncertainty surfaces to the user.

**Scaffold and environment (no starter template — Epic 1 Story 1 scaffolds per the spine's Structural Seed):**
- Monorepo: `apps/web` (Next.js 16.2), `apps/worker` (bare Node + pg-boss 12.x), `packages/` (planner, ledger, policy, interpretation-schema, broker, connectors, llm-gateway, db, config, notify).
- Stack pins: TypeScript 7.x strict, Node 24 LTS, Drizzle 0.45.x, zod 4.x, Better Auth, Anthropic TS SDK; Postgres major matched to Supabase prod; UUIDv7 app-side.
- Environments: dev = docker compose with local Postgres; prod = Docker Compose on unraid + Supabase; secrets via compose env_file; Google OAuth in personal-use/unverified mode (no CASA).
- Conventions: server actions append commands (API routes only for OAuth/webhooks); pg-boss retry/backoff + dead-letter + sync-health events (no silent failure); Vitest with co-located tests, planner pure-unit coverage for AC-5/AC-8, integration via ephemeral Postgres container, job handlers tested by direct invocation; ISO-8601 UTC storage, durations integer minutes; commands imperative / events past-tense; typed config module (no stray process.env).
- MVP acceptance contract: PRD AC-1 through AC-15 define wedge completion; SM-1..5 instrumentation (rubric, timestamp pairs, "work ended" tap, ledger audit, capture-inbox denominator) must be built into the product.

**Tenancy (decided, restated for visibility):** single-user personal deployment now — one app user (AD-6), worker trusts the DB boundary, one Docker deployment per person. Multi-tenant/hybrid SaaS is deliberately deferred to the commercial phase (PRD OQ-7); the spine's Deferred section marks every single-tenant assumption so future tenancy is a planned reopening, not an accident. Stories must not introduce new unmarked single-tenant assumptions.

**Foundational requirement groups (added 2026-07-12 from external review, right-sized to a solo personal deployment; all MVP unless noted):**

- ADD-1 Planner semantics contract: given the same ContextSnapshot, PolicySet, and timestamp, the planner returns the same ordered proposal; it never moves a user-locked/pinned block, never schedules an ineligible action, and minimizes changes to the approved plan before optimizing lower-priority preferences. Covers: stable tie-breaking; pinned/locked blocks; soft preferences vs. hard constraints; task splitting + minimum useful block duration; partial completion; scheduling windows vs. deadlines; recurring responsibilities; travel/transition placement; manual edits to an approved plan; context changes while a proposal awaits approval (stale-proposal detection); plan states (proposed → approved → active → superseded → completed) and deterministic plan-diffs.
- ADD-2 Temporal correctness: user + source time zones; DST transitions (including mid-plan clock changes); recurring events with modified/canceled occurrences; all-day and floating-time events; events crossing midnight; due dates without times; "today/tomorrow/end of week" interpretation; week-start and non-Mon–Fri workday preferences; commute/preparation time. Belongs in both planner and connector test suites.
- ADD-3 Connector correctness & identity resolution ops: incremental sync with deletion handling; duplicate event/request/commitment detection across sources (same request in email + calendar invite); OAuth reauthorization and token-refresh flows; rate-limit behavior; suggested person matches with user-confirmed merge, merge reversal, split, source-specific aliases, cross-account email aliases, audited merges, and accidental-cross-context-merge prevention (extends AD-6/AD-7).
- ADD-4 AI safety & quality: all connected content (email, docs, calendar text) is hostile input — delimited/labeled as untrusted data, never instructions; source content can never alter policies, request tools, or trigger writes; output schema validation (AD-3 assertions) plus injection-aware prompt design; prompt + model version recorded on every assertion; golden evaluation set for extraction (false-positive/negative benchmarks, adversarial injection cases); model-vendor outage behavior — the pure planner remains fully usable from confirmed structured data with the LLM gateway down; cost ceilings and rate controls in the gateway.
- ADD-5 Account & data lifecycle: session management and expiry (Better Auth); source disconnect semantics (mirrors dropped; promoted domain records survive with provenance marked stale); user-data export; selective context deletion and full account deletion — reconciling AD-4's append-only events with privacy erasure via redactable payload design or crypto-deletion (architecture decision required at story level); deletion propagation to projections, assertions, and backup expiry; retention configuration.
- ADD-6 Operational reliability (right-sized): structured logs with correlation IDs across web → command → job → event → plan; dead-letter inspection and replay; projection rebuild procedure (exercised, not just designed); backup restore verification on a schedule (a backup is not a backup until restored); LLM latency/failure/cost metrics; token-expiration alerts; migration procedure. No enterprise incident tooling at MVP — sync-health + in-app disclosure (FR-60/62) is the user-facing surface.
- ADD-7 Evaluation harness (lean): curated offline planning scenarios with expected outcomes (protected commitments preserved, infeasibility detected, consequences correct, request-vs-commitment classification, cross-context leakage = zero, injection resisted); regression gate — a planner or prompt change does not ship if it reduces hard-boundary preservation, increases false commitments, increases cross-context disclosure, or degrades plan stability.
- ADD-8 Notification delivery rules (MVP transport = in-app only): batching, duplicate suppression, expiry when no longer relevant, snooze, notification-to-decision deep links, "do not notify again for this condition" (FR-55 tie-in); quiet hours and focus-block suppression; push transport, cross-device read state, and lock-screen redaction (AD-5 broker) land with the PWA push in Phase 2.
- ADD-9 Sensitive-domain guardrail: medical, mental-health, legal, financial, grief, and conflict content is planned neutrally (scheduling, protection, capture) without advice, interpretation, or inference — enforcing Non-Goals §2.1 item 10 and FR-54 at the content-handling level; emergencies follow user-defined emergency policies (FR-4) only.

### UX Design Requirements

- UX-DR1: Implement the dual-theme token system from DESIGN.md frontmatter as CSS custom properties: 47 light + 47 dark core color tokens plus the status vocabulary (6 state-chip pairs, warning/amber tier, success indicators) — all pairs are pre-verified WCAG AA and must ship byte-identical to the spine.
- UX-DR2: Typography system — Playfair Display (display/headline roles) + Public Sans (body/label roles), 8 named roles, 12px hard floor, 70ch line-length cap, zoom/reflow per WCAG 1.4.4/1.4.10.
- UX-DR3: Theme switching — System (default) / Light / Dark selector; localStorage persistence; no-flash inline `<head>` script setting `<html class>` before hydration; both token sets always ship.
- UX-DR4: Component library (each has a DESIGN.md visual spec + EXPERIENCE.md behavioral spec): side-nav (80px rail; mobile 4-tab strip Today/Interrupts/Inbox/Commitments + capture FAB), capacity-chip (5 semantics), timeline-rail + timeline-block + domain-pip (fill-state = protection, never color-only; always-visible "Why:" inset), glass-panel (+ amber warning-ribbon variant), plan-intelligence-panel (4 cards; risk-bar is % overrun, never a score), sticky-action-area (Modify / "Approve today's plan"), decision-scenario-card (P11 six-item checklist as body; roving tabindex), hard-conflict-callout, evidence-drawer (0fr→1fr animation contract, reduced-motion instant, source-icon taxonomy), state-chip (6 states, icon mandatory), focus-ring (2px, :focus-visible only), capture-quick-add, domain-chip, privacy-scope-badge, source-attribution-header, recommendation-panel, interrupt-context-panel, evidence-layer-footer, severity-badge, trusted-baseline-badge, person-detail (v1.0).
- UX-DR5: FR-68 page template — every primary view implements the 7-level hierarchy with mandatory progressive disclosure; evidence collapsed by default.
- UX-DR6: Voice enforcement — preferred/forbidden language lists and the microcopy table are binding on all UI copy ("Approve today's plan," "Choose this option," "Based on current information (n%)"; never "Execute," scores, or guilt language); empty states follow the calm register ("Nothing waiting for a decision.").
- UX-DR7: Accessibility floor — full keyboard semantics (scenario-card radiogroup + arrow keys, approve-flow tab order, post-action focus targets, Enter/Esc on clarification), live regions (plan-diff polite, sync-health polite, undo assertive with ≥8s persistence), landmark map, forced-colors deferral note, reduced-motion.
- UX-DR8: State patterns per surface — day-one cold start, empty states, sync-degraded ("Last synced 9:20 AM…"), connector-failure banner (AC-15), fulfilled/archived via muted tokens at full opacity (opacity idiom banned).
- UX-DR9: PWA delivery — manifest, responsive breakpoints (1200px fixed-center desktop, 4-col mobile), phone scope = capture + review at MVP.
- UX-DR10: Mock fidelity — MVP surfaces built to match: Stitch imports (Today, Morning Plan ×2, Interrupt ×2, alert, commitment detail) and identity mocks (End-of-Day Review, Capture Inbox, Commitment Ledger); spines win over mock copy (4:30 hard stop; no Delegate card at MVP).

### FR Coverage Map

Statuses: **C** covered in an MVP epic · **D** deferred to a named post-MVP epic with rationale (phasing per PRD §7.3) · split FRs show both.

- FR-1..4, FR-7: Epic 2 (C) — life model setup; FR-4 full policy catalog → Epic 12 (D: v1.0 phasing)
- FR-5, FR-6: Epic 12 (D: policy onboarding/conflicts are v1.0)
- FR-8: Epic 2 (C: lite subset); full Person model → Epic 10 (D)
- FR-9, FR-11: Epic 10 (D: v0.4 relationship depth)
- FR-10: Epic 2 (C: rhythm-lite); full action generation → Epic 10 (D)
- FR-12, FR-54: all epics (C: binding constraint, enforced in Epics 2/3/9 stories)
- FR-13, FR-14: Epic 1a (C: calendars + context assignment) / Epic 1b (C: Gmail); v1.0 sources → Epics 8/10 (D)
- FR-15: Epic 3b (C: email-core + gate); full 10-category extraction → Epic 8 (D)
- FR-16: Epic 11 (D: evidence layer is v0.5)
- FR-17..20: Epic 3a (C); v1.0 capture channels → Epics 8/10/11 (D)
- FR-21, FR-22: Epic 3a (C)
- FR-23: Epic 3a (C: manual acceptance types); interpretation → Epic 12 (D)
- FR-24: Epic 3a (C: at-risk flag); drafted renegotiation → Epic 11 (D)
- FR-25, FR-26, FR-28, FR-30: Epic 4 (C); FR-26 inferred inputs → Epic 9 (D)
- FR-27: Epic 9 (D: feasibility states need learning-loop signals)
- FR-29: Epic 4 (C: today); week/month/quarter → Epics 8/10 (D)
- FR-31: Epic 4 (C: reserve mechanics); named white-space policies + opportunities → Epic 10 (D)
- FR-32: Epic 4 (C); evidence retrieval into loop → Epic 11 (D)
- FR-33, FR-34: Epic 8 (D: v0.2 work signal)
- FR-35: Epic 5 (C: MVP-honest loop); inferred estimation/simulation/delegate → Epics 9/11 (D)
- FR-36: Epic 6 (C: lite); full renegotiation support → Epic 11 (D)
- FR-37: Epic 9 (D: v0.3 calibration)
- FR-38: Epic 2 (C: manual next action + allocation); decomposition → Epic 10 (D)
- FR-39: Epic 10 (D)
- FR-40: Epic 2 (C: displacement visibility); remediation + tracking → Epic 10 (D)
- FR-41..45: Epic 11 (D: v0.5 evidence layer)
- FR-46: Epic 1a (C: audit rows) + Epic 3b (C: assertion provenance) + Epic 4 (C: why-panel consumption)
- FR-47, FR-49, FR-50: Epic 11 (D: execution layer v0.5)
- FR-48: Epic 5 (C: Gmail drafts); full execution actions → Epic 11 (D)
- FR-51: Epic 3a (C)
- FR-52, FR-53, FR-55: Epic 9 (D: learning loop v0.3)
- FR-56: Epic 5 (C: MVP triggers + ADD-8 delivery rules); v1.0 triggers → Epic 12 (D)
- FR-57, FR-59: Epic 5 (C); L4/L5 + configuration matrix → Epic 12 (D: FR-58)
- FR-58: Epic 12 (D)
- FR-60..62: Epic 1a (C: basic disclosure) + Epic 1b (C: sync-health surface); full coverage dashboard → Epic 9 (D)
- FR-63..66: Epic 11 (D: delegation v0.5)
- FR-67: Epics 2/3a/4/5/6 (C: 7 MVP surfaces — Policy & Boundaries surface is story 2.7); 6 v1.0 surfaces → Epics 8/10/11/12 (D)
- FR-68: Epic 4 (C: page template established) — binding on all subsequent surfaces
- NFR-1..9: NFR-1 → Epics 4/5 (C: why-panels, FR-25/46 ACs); NFR-2/4/5 → Epics 4/5 (C: latency targets in 4.5/5.2 ACs); NFR-3 → Epic 1a (C); NFR-6 → Epics 1a/3b (C: mirror-scope + retrieval-scope ACs); NFR-7 → Epic 1a (C: floor) + every surface story; NFR-8 → Epic 1b (C: offline queue + degraded operation); NFR-9 → Epic 1b (C: PWA shell)
- SEC-1..6: SEC-1/2-seam/3 → Epic 1 (C); SEC-2-broker → Epic 12 (D); SEC-4 → Epics 1/7 (C); SEC-5 → Epic 11+ (D); SEC-6 → Epic 5 (C: enforced at draft creation)
- ADD-1, ADD-2: Epic 4 (C; ADD-2 connector share in Epic 1)
- ADD-3: Epic 1b (C: sync correctness) + Epic 10 (D: person-merge ops at scale)
- ADD-4: Epic 3b (C)
- ADD-5: Epic 1a (C: erasure design decision) + Epic 7 (C: features)
- ADD-6: Epic 1a (C: correlation-ID logging) + Epic 1b (C: full ops hardening)
- ADD-7: Epic 4 (C: golden scenarios written first + regression gate) + Epic 3b (C: extraction evals)
- ADD-8: Epic 5 (C: in-app); push transport → Phase 2 (D)
- ADD-9: Epic 3a (C)
- UX-DR1: Epic 1a (C: light tokens) + Epic 1b (C: dark tokens + status vocabulary) · UX-DR2: Epic 1a (C: font roles) + Epic 1b (C: floor/reflow ACs in 1b.3) · UX-DR3/9: Epic 1b (C) · UX-DR4: distributed to first-use epics (C: MVP components); v1.0 components verified in Epics 11/12 stories (D) · UX-DR5: Epic 4 (C) then binding · UX-DR6: all UI epics (C) · UX-DR7: Epic 1a (C: floor) + per-surface stories · UX-DR8: per-surface stories (C) · UX-DR10: Epics 3a/4/5/6 (C) + Epic 1b (C: alert mock via sync health)

No requirement is unmapped; nothing was rejected.

## Epic List

### Epic 1a: Steel Thread Foundation (MVP — build order 1)
Sean signs into a minimal but load-bearing app shell and connects both Google Calendars with explicit work/personal context assignment — onto a **final-shape** event ledger: event schema, context tags, audit rows, and the erasure-ready payload design (redactable payloads vs. crypto-deletion decided HERE, before the first event is written; features land in Epic 7). "Small but final," not thin.
**FRs covered:** FR-13(calendars), FR-14, FR-46, FR-62(basic) · SEC-1, SEC-2-seam, SEC-3 · ADD-2(connector share), ADD-5(design decision only), ADD-6 · UX-DR1(core tokens) · AC-1(calendar half), AC-14

### Epic 1b: Foundation Completion (MVP — build order 5)
Both Gmail accounts connect; sync health becomes a surface; the theme system (System/Light/Dark, no-flash) and PWA shell complete; ops hardening lands — structured logs with correlation IDs, dead-letter replay, nightly backup **with restore verification**.
**FRs covered:** FR-13(Gmail), FR-60, FR-61(substrate) · ADD-3(sync correctness), ADD-6(full) · UX-DR2, UX-DR3, UX-DR9 · AC-1(complete), AC-15

### Epic 2: The Life Model (MVP — build order 2)
Sean defines what matters — domains, boundaries, hard stop, protection levels, starter policies, up to 3 goals (each with one next action + protected weekly allocation), core people with important dates and one communication rhythm — in a single ≤45-minute sitting. First story: the onboarding flow design itself (the sitting must not feel like taxes); day-one empty states are explicit ACs.
**FRs covered:** FR-1, FR-2, FR-3, FR-4(starter), FR-7, FR-8-lite, FR-10-lite, FR-12, FR-38-lite, FR-40-displacement, FR-67(Policy & Boundaries surface) · AC-2

### Epic 3a: Capture & the Commitment Ledger (MVP — build order 3)
Anything on Sean's mind becomes a tracked, classified item via manual natural-language capture; requests are distinguished from commitments with manual acceptance types; nothing captured is ever lost. Capture Inbox + Commitment Ledger surfaces. This is the "due work" system of record the morning plan feeds on — no email machinery required.
**FRs covered:** FR-17, FR-18, FR-19, FR-20, FR-21, FR-22, FR-23-manual, FR-24-flag, FR-51 · ADD-9(classification handling) · AC-6, AC-9

### Epic 3b: Email Intelligence (MVP — build order 6)
Sean's email starts proposing commitments: extraction behind its per-account toggle and week-one quality gate, hostile-input/prompt-injection defense, the extraction evaluation set, and LLM-outage fallback (the planner keeps working from confirmed data with the gateway down). Requires Epic 1b (Gmail).
**FRs covered:** FR-15-core · ADD-4 · AC-7

### Epic 4: The Morning Plan (MVP — build order 4)
Sean opens the app at 7:40 AM and approves a realistic, boundary-respecting day in under ten minutes — exclusions, expected work end, risks, and confidence included. Owns the pure planner and its behavioral contract, temporal correctness, capacity/reserves, Today + Morning Plan surfaces, SM-1/SM-2 instrumentation. Sequencing rules from review: the **golden planning scenarios are written before the planner** (first story, they gate everything after), and the **SM-3 "work ended" tap ships here** the day the first plan renders — the two-week baseline can't wait for Epic 6.
**FRs covered:** FR-25, FR-26-declared, FR-28, FR-29-day, FR-30, FR-31-reserves, FR-32, FR-46(why-panel), FR-61, FR-68 · ADD-1, ADD-2, ADD-7 · AC-3, AC-4, AC-5, AC-12, AC-13 · SM-3 instrument

### Epic 5: Interrupts with Visible Tradeoffs (MVP — build order 7)
A mid-day demand becomes a ≤5-interaction decision showing the P11 checklist — what moves, who is affected, whether the 4:30 boundary survives — with an acknowledgment drafted straight into Gmail drafts.
**FRs covered:** FR-35-MVP, FR-48-drafts, FR-56-core, FR-57, FR-59 · SEC-6 · ADD-8 · AC-8, AC-9, AC-10

### Epic 6: The Deliberate Stop (MVP — build order 8)
At day's end Sean closes loops — completed, displaced, unanswered-with-drafts — rolls the rest forward, and leaves with tomorrow already shaped. (The "work ended" tap itself ships early in Epic 4; this epic builds the full review around it.)
**FRs covered:** FR-36-lite · AC-11

### Epic 7: My Data, My Rules (MVP — build order 9)
Sean can export everything, disconnect a source without losing promoted commitments, selectively delete, and fully erase — implementing the erasure design decided in Epic 1a.
**FRs covered:** ADD-5(features) · SEC-3, SEC-4

### Epic 8: Work Signal (v0.2)
Work interrupts arrive without manual capture: Slack + Jira ingestion, full 10-category extraction, live-day loop, weekly planning loop. *Gate: interrupts arrive hands-free; the week has a planned shape.*
**FRs covered:** FR-15-full, FR-29-week, FR-33, FR-34, FR-67(Week surface)

### Epic 9: Calibration (v0.3)
The system learns Sean's reality: learning loop, inferred capacity (energy/resources), feasibility states, full coverage dashboard, inferred interrupt estimation. *Gate: SM-13 effort-calibration error visibly shrinking.*
**FRs covered:** FR-26-inferred, FR-27, FR-35-estimation, FR-37, FR-52, FR-53, FR-55, FR-60-full · FR-67(Learning Review)

### Epic 10: People & Goals in Full (v0.4)
Relationships and goals become fully active planning inputs: goal decomposition, relationship-generated actions, staged important-date workflows, person-merge operations, task-app + Apple-ecosystem sources, white-space policies and opportunities. *Gate: SM-10 and SM-11 measurable.*
**FRs covered:** FR-8-full, FR-9, FR-10-full, FR-11, FR-29-month/quarter, FR-31-full, FR-38-full, FR-39, FR-40-full · ADD-3(merge ops) · FR-67(People, Goals surfaces)

### Epic 11: Evidence & Execution (v0.5)
Decisions gain grounding and follow-through: documentation/evidence layer with authority order, context packets, full execution actions, drafted renegotiation, delegation model. *Gate: UJ-6 works end-to-end.*
**FRs covered:** FR-16, FR-24-full, FR-35-evidence, FR-36-full, FR-41, FR-42, FR-43, FR-44, FR-45, FR-47, FR-48-full, FR-49, FR-50, FR-63, FR-64, FR-65, FR-66 · FR-67(Focus Context, Context Review)

### Epic 12: Completion & Hardening (v1.0)
The complete product: full policy catalog and conflict handling, interpreted acceptance, autonomy configuration matrix with L4, full notification triggers, SEC-2 broker hardening, and the source draft's 32-step acceptance journey passing.
**FRs covered:** FR-4-full, FR-5, FR-6, FR-23-full, FR-56-full, FR-58 · SEC-2-broker

**MVP build order (adopted 2026-07-12 after party-mode review):** 1a → 2 → 3a → 4 → 1b → 3b → 5 → 6 → 7. Rationale: the first honest morning plan (Epic 4) arrives on the shortest trustworthy path — calendars + life model + manually captured commitments — weeks before the email-extraction machinery; the erasure design and golden scenarios are pulled forward to where retrofitting would be impossible or dishonest.

**Dependencies:** 1a → all; 2 needs 1a; 3a needs 1a+2; 4 needs 1a+2+3a; 1b needs 1a; 3b needs 1b; 5 needs 4+1b; 6 needs 4; 7 needs 1a; 8–12 sequence per architecture gates. Each epic delivers complete standalone functionality for its domain.

## Epic 1a: Steel Thread Foundation

Sean signs into a minimal but load-bearing app shell and connects both Google Calendars onto a final-shape event ledger — small but final.

### Story 1a.1: Project Scaffold and Development Environment

As Sean (builder-user),
I want the monorepo scaffolded per the architecture's Structural Seed with a one-command dev environment,
So that every subsequent story lands in a consistent, testable codebase.

**Acceptance Criteria:**

**Given** a clean checkout,
**When** I run `docker compose up` in dev,
**Then** the web host, worker host, and local Postgres (major pinned to Supabase prod) start, a health endpoint responds, and pg-boss connects.
**And** the package layout matches the spine (`apps/web`, `apps/worker`, 10 `packages/*`); TypeScript 7 strict passes; Vitest runs green with one seed test per package; dependency-direction lint enforces AD-1; structured JSON logging with request/job correlation IDs is in place; all config flows through the typed `config` module (a stray `process.env` read fails lint).

### Story 1a.2: Sign In to a Themed, Accessible Shell

As Sean,
I want to sign in and land in the app shell with the core visual identity,
So that the product is mine and unmistakably itself from the first render.

**Acceptance Criteria:**

**Given** an unauthenticated browser,
**When** I visit the app,
**Then** Better Auth gates every surface and signs me in as the single app user.
**And** the shell renders with DESIGN.md core light tokens (byte-identical values); Playfair Display + Public Sans load; the 80px side-nav rail renders with focus-visible rings, landmark roles (nav/main/aside), and full keyboard operability.

### Story 1a.3: The Event Ledger — Small but Final

As Sean,
I want every domain change recorded as an append-only, context-tagged, erasure-ready event with one-step undo,
So that my commitments can never silently vanish and my privacy rights are designed in before the first event exists.

**Acceptance Criteria:**

**Given** any domain write,
**When** it executes,
**Then** it appends a command/event row (`event_seq`, `event_type`, `actor`, non-null `context`, `payload`, `caused_by`) using the payload shape from the erasure design decision recorded in this story (redactable payloads vs. crypto-deletion — an ADR in-repo per ADD-5), and current state is served from a `ledger` projection.
**And** attempted UPDATE/DELETE on event tables fails at the DB level; undo emits a compensating forward event (`compensatesEventId` audit-only); every cross-context read/emit writes an audit row (AC-14 instrument); payload schemas live only in `packages/ledger`; integration tests prove append → project → undo → audit round-trips. *(Sizing note: large — expect execution as 2 sequential dev sessions: the erasure ADR spike first, then schema + undo + audit implementation against the decided design.)*

### Story 1a.4: Connect Both Google Calendars with Context Assignment

As Sean,
I want to connect my work and personal Google Calendars, assigning each to its context at connect time,
So that my real schedule flows into the system with the privacy seam intact from day one.

**Acceptance Criteria:**

**Given** the connections screen,
**When** I OAuth a Google account,
**Then** I must choose work or personal before the connection saves (AD-6: immutable thereafter; reconnect to change), scopes are read-only calendar, and events land in context-tagged source-mirror tables (AD-7 cache semantics; promotion is an explicit command).
**And** initial + incremental sync run as pg-boss jobs with retry/backoff; a revoked token surfaces an in-app disclosure within one sync cycle (FR-62 basic); recurring events, all-day events, and timezone/DST handling pass the ADD-2 connector test cases.

### Story 1a.5: See My Real Days

As Sean,
I want a read-only agenda view of my synced calendars across both contexts,
So that the steel thread proves end-to-end trust — my actual life, correctly tagged.

**Acceptance Criteria:**

**Given** both calendars synced,
**When** I open the agenda,
**Then** today's events from both contexts render with context tags and correct local times (DST-transition dates included), last-sync time is visible per source, and a stale source shows the "Last synced …" degraded framing (UX-DR8).
**And** every cross-context join in this view is present in the audit log — verified by an automated test (AC-14); a separation test proves a work-context query can never return personal-context rows and vice versa (SEC-1 enforced, not assumed); mirror sync stores only planning-necessary fields (NFR-6 — no bodies/attachments beyond what extraction needs).

## Epic 2: The Life Model

Sean defines what matters — boundaries, protection levels, policies, goals, people — in a single ≤45-minute sitting that must not feel like taxes.

### Story 2.1: Guided Onboarding Flow

As Sean,
I want a guided, resumable setup flow designed around the ≤45-minute sitting,
So that defining my life model feels like a conversation, not taxes.

**Acceptance Criteria:**

**Given** a fresh account,
**When** I start setup,
**Then** a multi-step flow (progress visible, every step skippable-with-defaults, resumable mid-way) walks the life-model sequence, styled per DESIGN.md with the calm voice register.
**And** each step names why it matters ("What this protects"); abandoning mid-flow loses nothing (every completed step already persisted as events); the flow's empty/first-run states follow UX-DR8.

### Story 2.2: Boundaries, Domains, and Starter Policies

As Sean,
I want to define my workday shape, 4:30 hard stop, sleep window, and life domains, and accept starter policies,
So that the planner knows my non-negotiables before it ever proposes anything.

**Acceptance Criteria:**

**Given** the boundaries step,
**When** I set workday/hard-stop/sleep and review the 11 default domains (rename/disable/add),
**Then** each persists as a policy/boundary entity via AD-4 events.
**And** the non-negotiable and work-boundary starter templates (FR-4) are offered with plain-language explanations, editable before accepting; declining a template is recorded, not nagged.

### Story 2.3: Hard Commitments and Protection Levels

As Sean,
I want to enter my standing hard commitments and protected priorities with protection levels,
So that school pickup can never be scheduled over.

**Acceptance Criteria:**

**Given** the commitments step,
**When** I add an item (e.g., Thursday 3:30 pickup),
**Then** I assign one of the four protection levels (FR-3) with lock/shield/tune iconography (never color-only), recurrence if applicable, and context tag.
**And** protection level is required (no untagged plannable item exists); each level's meaning is shown at selection in preferred language ("should not move except for a genuine emergency").

### Story 2.4: Important People and Communication Rhythms

As Sean,
I want to add my core people with important dates, relationship intentions, and one communication rhythm each,
So that relationships occupy real planning space from day one.

**Acceptance Criteria:**

**Given** the people step,
**When** I add a person,
**Then** the MVP-lite Person model captures name, relationship type, importance, intention, important dates, and context; a rhythm ("call Mom weekly") is created as a flexible intention linked to that Person (FR-10-lite) schedulable within its window.
**And** "meaningful interactions" and "life events" fields are user-asserted only (FR-12/P5 enforced at schema level); no relationship scoring exists anywhere.

### Story 2.5: Goals with a Next Action and Protected Allocation

As Sean,
I want up to 3 active goals, each with one meaningful next action and a protected weekly time allocation,
So that my intentions claim capacity before the calendar fills it.

**Acceptance Criteria:**

**Given** the goals step,
**When** I define a goal,
**Then** I name its next action and choose a weekly allocation (e.g., 3×45min), stored as protected-priority intentions linked to the goal (FR-38-lite).
**And** a displacement counter exists per goal allocation, incremented whenever a planned allocation is moved or dropped, displayed on the goal in neutral language (FR-40-displacement) — no guilt mechanics.

### Story 2.6: The Forty-Five-Minute Proof

As Sean,
I want the complete first sitting verified end-to-end,
So that AC-2 is honestly met, not assumed.

**Acceptance Criteria:**

**Given** a fresh account with connected calendars,
**When** I complete the full onboarding,
**Then** an instrumented timestamp pair proves the sitting completed in ≤45 minutes with the full life model persisted (boundaries, domains, policies, ≥3 hard commitments, ≥1 protected priority, ≤3 goals with actions+allocations, ≥5 people with dates and rhythms).
**And** an automated end-to-end test replays this journey; every entity is queryable from ledger projections; re-entering setup later edits rather than duplicates.

### Story 2.7: The Policy & Boundaries Surface

As Sean,
I want a dedicated surface to view and edit my policies, boundaries, and autonomy settings after onboarding,
So that the rules governing my plan are always inspectable and adjustable — not buried in a setup wizard I can't revisit.

**Acceptance Criteria:**

**Given** a completed life model,
**When** I open Policy & Boundaries (Settings area, per FR-67),
**Then** all boundaries, policies (by category), protection defaults, and the theme preference are viewable and editable, with each edit flowing through AD-4 events with undo.
**And** the surface states the current autonomy posture in plain language ("The system recommends and drafts; nothing is sent or changed without you"); policy edits take effect on the next plan without restart.

## Epic 3a: Capture & the Commitment Ledger

Anything on Sean's mind becomes a tracked, classified item; requests are distinguished from commitments; nothing captured is ever lost. Deliberately deterministic — LLM classification arrives with Epic 3b.

### Story 3a.1: Capture Anything in Two Interactions

As Sean,
I want natural-language quick capture from desktop and phone,
So that a thought, promise, or demand is out of my head and safe before it evaporates.

**Acceptance Criteria:**

**Given** any surface (desktop shell, or mobile responsive browser),
**When** I invoke capture and type text,
**Then** the item lands in the Capture Inbox in ≤2 interactions from entry point (AC-6), persisted as an AD-4 event; context is asked only when ambiguous, one tap.
**And** the input follows the `capture-quick-add` component spec; a keyboard shortcut focuses capture from anywhere on desktop. (Installed-PWA FAB and offline capture queue arrive with story 1b.4 — no forward dependency here.)

### Story 3a.2: Rule-Based Classification and Minimal Clarification

As Sean,
I want captured items classified with sensible proposals and at most a couple of pointed questions,
So that triage is fast and never an interrogation.

**Acceptance Criteria:**

**Given** a captured item,
**When** it lands in the Inbox,
**Then** a rule-based classifier proposes one of the 12 types (FR-18) as editable chips — dates → important date; interrogatives → request; "I will / I told" → commitment candidate; sensitive-domain content (ADD-9) gets neutral handling with no advice framing.
**And** clarification prompts are capped at 3 per item, each naming the planning decision it unblocks (FR-19); confirming takes one tap; reclassifying takes two.

### Story 3a.3: Requests, Commitments, and Manual Acceptance

As Sean,
I want requests distinguished from commitments, with me stating exactly what kind of acceptance I gave,
So that "I'll look into it" never silently becomes "I promised."

**Acceptance Criteria:**

**Given** a captured item classified as request or commitment,
**When** I confirm it,
**Then** the FR-21 lifecycle state machine governs it, and confirming acceptance requires choosing: acknowledged / agreed to investigate / accepted full responsibility / declined (FR-23-manual).
**And** commitment records carry the FR-22 field set; every transition is an AD-4 event; communication states (acknowledge, clarify, provide status — FR-51) are first-class actions on any request.

### Story 3a.4: The Commitment Ledger Surface

As Sean,
I want the Ledger surface showing everything I've promised with state, protection, and risk at a glance,
So that no promise depends on my memory.

**Acceptance Criteria:**

**Given** commitments exist,
**When** I open the Ledger,
**Then** it renders per the commitment_ledger mock: summary strip (at risk / active / waiting on you), filter chips, rows with state chips (6 states, icon mandatory), protection-level markers, due dates, requester/beneficiary.
**And** at-risk flagging (FR-24-flag) is mechanical and explained — due date approaching with insufficient scheduled time, or repeated displacement — with the reason shown on the row; fulfilled rows use muted tokens at full opacity; "Renegotiate" is a labeled action (at MVP it opens manual edit + note; drafted renegotiation is v0.5).

### Story 3a.5: The Capture Guarantee

As Sean,
I want proof that nothing captured is ever lost,
So that I can trust the inbox with my whole head.

**Acceptance Criteria:**

**Given** any actionable captured item,
**When** it is not yet scheduled, delegated, clarified, declined, completed, converted to reference, or deleted by me,
**Then** it remains visible and queryable in the Inbox or Ledger (FR-20), and an automated test walks every lifecycle path proving no terminal-state-free item can vanish.
**And** every inbox decision is a recorded state (AC-9 ledger instrument); the Inbox empty state reads "Nothing waiting for a decision."

## Epic 4: The Morning Plan

Sean opens the app at 7:40 AM and approves a realistic, boundary-respecting day in minutes. Golden scenarios precede the planner; the SM-3 tap ships here.

### Story 4.1: Golden Planning Scenarios and the Regression Gate

As Sean,
I want the planner's expected behavior written down as executable scenarios before the planner exists,
So that "the plan respects my boundaries" is a gate, not a hope.

**Acceptance Criteria:**

**Given** the scenario suite,
**When** CI runs,
**Then** curated fixtures (ContextSnapshot + PolicySet + expected outcome) cover: hard-commitment preservation, hard-stop under overload, protected-priority displacement requiring explicit tradeoff, goal-allocation placement, rhythm windows, reserves honored, overcommitment surfaced not hidden, and the ADD-2 temporal traps (DST-transition day, all-day events, midnight-crossing, recurring exception, due-date-without-time).
**And** the regression gate fails the build on any hard-boundary violation, plan instability (same input → different output), or capacity overrun — wired into CI from this story forward (ADD-7).

### Story 4.2: ContextSnapshot and Declared Capacity

As Sean,
I want my calendars, commitments, boundaries, goals, and rhythms assembled into one honest picture of my real capacity,
So that the plan starts from truth, not from empty calendar slots.

**Acceptance Criteria:**

**Given** synced sources and a defined life model,
**When** the snapshot builder runs,
**Then** it produces the single named ContextSnapshot zod schema (AD-2) from ledger projections and **CalendarFacts** — a typed, zod-validated projection derived *automatically* from calendar mirrors (read-only constraints, distinct from domain state; not per-event AD-7 promotion, which remains explicit and applies only when an event becomes a domain commitment) — never raw source content — including declared time constraints, user-declared energy windows, and configurable reserves (interrupt reserve, transition buffer, minimum unallocated — FR-26-declared, FR-31-reserves).
**And** timezone/DST normalization happens here once (ADD-2); snapshot assembly is deterministic and unit-tested; theoretical availability vs. realistic capacity are distinct computed values (P3).

### Story 4.3: The Pure Planner — an Honest Day

As Sean,
I want a proposed day that fits my actual capacity and never quietly breaks what I protect,
So that approving the plan means trusting it.

**Acceptance Criteria:**

**Given** a ContextSnapshot, PolicySet, and timestamp,
**When** the planner runs,
**Then** it returns the same ordered PlanProposal every time (ADD-1 determinism, stable documented tie-breaking), placing due work, hard commitments, goal allocations, and rhythm windows with buffers — never scheduling over a hard commitment or past the hard stop without an explicitly flagged tradeoff (AC-5, gate-enforced).
**And** overcommitment produces FR-28 behavior (mismatch stated, contributing items named, scenarios shown — never silent consumption of sleep/family/recovery); user-locked/pinned blocks never move; unplaceable items become "intentionally not scheduled" exclusions with reasons; the planner is a pure function passing 100% of story 4.1's scenarios.

### Story 4.4: Plan Lifecycle, Diffs, and Undo

As Sean,
I want plan versions with deterministic diffs and one-step undo,
So that every change to my day is explicit, explainable, and reversible.

**Acceptance Criteria:**

**Given** an approved plan and a changed context,
**When** replanning runs,
**Then** it minimizes movement (FR-30), produces a deterministic PlanDiff whose every move carries the P11 six-item checklist as data, and marks a pending proposal stale when its snapshot no longer matches reality (ADD-1).
**And** plan states flow proposed → approved → active → superseded → completed via AD-4 events; approval/adjustment/undo are compensating-event commands (AC-13); manual edits to an approved plan are first-class diffs, not exceptions.

### Story 4.5: The Morning Plan Surface

As Sean,
I want to review and approve my day in one calm screen,
So that the morning ritual takes minutes and answers "why" before I ask.

**Acceptance Criteria:**

**Given** a proposed plan,
**When** I open Morning Plan,
**Then** it renders per the morning_whole_life_plan mock: capacity chips, timeline with domain pips and always-visible "Why:" insets, Plan Intelligence panel (protects / needs attention / risks with % overrun bar / intentionally-not-scheduled), expected work end, and plan confidence as the FR-61 defined function framed "Based on current information."
**And** the FR-68 hierarchy governs the page; every recommendation exposes its why-panel (FR-25/46, AC-12); Modify enters adjust mode (explicit controls, no drag); "Approve today's plan" records the SM-2 render→approve timestamp pair; approval works end-to-end on day one after onboarding (AC-3, e2e-tested); approve-flow keyboard semantics and the plan-diff live region per UX-DR7; NFR-2 latency targets are instrumented and met (plan interactive <3s from cached context, full refresh <15s). *(Sizing note: large — expect execution as 2–3 sequential dev sessions: components, then panel+instrumentation, then e2e/a11y.)*

### Story 4.6: Today and the "Work Ended" Tap

As Sean,
I want the approved plan living on the Today surface with a one-tap end to my workday,
So that the day has a shape — and its actual end is measured from week one.

**Acceptance Criteria:**

**Given** an approved plan,
**When** I open Today,
**Then** it shows the approved timeline, what's now/next, protected items, and expected work end (static MVP subset of the live_day_focus mock; the live-day loop is v0.2).
**And** a "Mark work ended" action is present from this story forward (SM-3 baseline cannot wait for Epic 6), recording a work-ended event with timestamp; the SM-3 metric (actual vs. planned finish) computes from these events; a minimal SM-1 rubric (the three questions, skippable) attaches to the tap from this story forward so plan-accuracy baseline starts the week the first plan renders — the full ritual arrives with 6.2; the tap is reachable in ≤2 interactions and announced to screen readers.

## Epic 1b: Foundation Completion

Both Gmail accounts connect; sync health becomes a surface; theming and PWA complete; ops hardening proves the boring guarantees.

### Story 1b.1: Connect Both Gmail Accounts

As Sean,
I want my work and personal Gmail connected with the same context discipline as my calendars,
So that email — where requests actually arrive — flows into the system.

**Acceptance Criteria:**

**Given** the connections screen,
**When** I OAuth a Gmail account,
**Then** context assignment is required at connect (AD-6), scopes are gmail.readonly + gmail.compose (drafts only — never send), and messages land in context-tagged mirror tables via incremental history-based sync as pg-boss jobs.
**And** duplicate detection handles the same thread across syncs (ADD-3); rate limits respected with backoff; token refresh is automatic with in-app reauthorization prompts on failure; Google OAuth runs in personal-use/unverified mode per the architecture.

### Story 1b.2: The Sync Health Surface

As Sean,
I want one glance to tell me what the system can currently see,
So that I never trust a plan built on stale context without knowing it.

**Acceptance Criteria:**

**Given** connected sources,
**When** I open sync health,
**Then** each source shows connection state, last-sync time, and freshness per FR-60, in the material_status_change_alert mock idiom.
**And** a failed/revoked connector is disclosed within one sync cycle in plain framing; plan confidence downgrades (FR-61 substrate); manual capture is offered as fallback — the complete AC-15 behavior, e2e-tested by revoking a token.

### Story 1b.3: Dark Mode and Theme Switching

As Sean,
I want System/Light/Dark theming that never flashes,
So that the 7:40 AM plan and the 9 PM glance both feel right.

**Acceptance Criteria:**

**Given** the Settings area,
**When** I pick System, Light, or Dark,
**Then** the choice persists in localStorage, applies without reload, and System follows prefers-color-scheme live (UX-DR3).
**And** the dark token set ships complete and byte-identical to DESIGN.md; a no-flash inline head script sets the html class before hydration; automated contrast checks verify load-bearing pairs in both themes; reduced-motion honored; the UX-DR2 typography floor is AC-enforced (8 named roles in use, 12px hard minimum, 70ch line-length cap, 200% zoom reflow without loss).

### Story 1b.4: The Phone in My Pocket

As Sean,
I want the PWA installable on my phone with capture and review working well,
So that demands caught in a hallway make it into the system.

**Acceptance Criteria:**

**Given** a mobile browser,
**When** I install and open the PWA,
**Then** the manifest, responsive layout, bottom tab strip (Today / Interrupts / Inbox / Commitments), and capture FAB work per UX-DR9; capture meets the ≤2-interaction bar (AC-6).
**And** Today/Inbox/Ledger review is usable at phone width; **offline capture queues locally and syncs on reconnect (moved here from 3a.1 — this story owns all offline machinery)**; desktop-only surfaces degrade gracefully.

### Story 1b.5: Ops Hardening — Trust the Machinery

As Sean,
I want the boring guarantees proven — backups restore, dead jobs surface, projections rebuild,
So that the system holding my life doesn't rot silently.

**Acceptance Criteria:**

**Given** production on unraid,
**When** the nightly backup job runs,
**Then** pg_dump lands on the array AND a scheduled restore-verification job restores it into a scratch database and validates row counts + latest event_seq — failure notifies in-app (ADD-6).
**And** dead-lettered jobs are inspectable and replayable from an admin view; the projection-rebuild procedure is implemented and exercised in a test (full replay rebuilds identical projections); token-expiration and job-age alerts surface as sync-health events, never silently. *(Sizing note: large — expect execution as 2–3 sequential dev sessions: backup+restore-verification, dead-letter/rebuild tooling, alerting.)*

## Epic 3b: Email Intelligence

Sean's email starts proposing commitments — with the LLM treated as powerful and dangerous: gated, priced, injection-defended, and fully optional to the system's survival.

### Story 3b.1: The LLM Gateway

As Sean,
I want every model call flowing through one governed gateway,
So that AI in my life system is routed, priced, versioned, and swappable — never scattered.

**Acceptance Criteria:**

**Given** any LLM need,
**When** a call executes,
**Then** it runs only in the worker as a pg-boss job (AD-3), routed by config (extraction → claude-haiku-4-5 batched + prompt-cached; reasoning → claude-sonnet-5), and its output enters the domain only as zod-validated Assertions carrying confidence, provenance (source ref + model + prompt version), and context tag.
**And** every call logs tokens and cost; monthly cost ceilings and rate controls halt with in-app disclosure rather than degrading silently; prompt templates are versioned in-repo; untrusted-content delimiting is built into the prompt scaffold from day one.

### Story 3b.2: Email Commitment Extraction

As Sean,
I want my email proposing requests and commitments it finds,
So that promises made in threads stop living only in my memory.

**Acceptance Criteria:**

**Given** extraction enabled for an account (per-account toggle, default off),
**When** new mail syncs,
**Then** batch extraction produces candidate requests/commitments/important dates as proposals in the Capture Inbox — source badge, confidence, originating snippet — and nothing becomes a domain commitment without confirmation (AC-7).
**And** confirmed proposals flow through the 3a.3 lifecycle including manual acceptance type; rejections are recorded as feedback events, never silently trained on; handled threads don't re-propose (ADD-3 dedup).

### Story 3b.3: Hostile Input Defense

As Sean,
I want every connected email treated as untrusted data — never instructions,
So that a malicious message can't steer my life system.

**Acceptance Criteria:**

**Given** an email containing instruction-shaped text,
**When** extraction processes it,
**Then** the content is delimited and labeled untrusted in the prompt; the output schema permits only extraction fields (no tool requests, policy changes, or write triggers); schema-violating output is rejected and logged.
**And** an adversarial corpus (injection, role-play coercion, scope escalation) runs in CI with zero policy-affecting or write-triggering outcomes required; sensitive-domain content (ADD-9) extracts neutrally with no advice framing; no assertion exists without a source reference.

### Story 3b.4: The Extraction Quality Gate

As Sean,
I want extraction quality measured against a golden corpus and my own rejections,
So that a noisy extractor demotes itself instead of drowning me.

**Acceptance Criteria:**

**Given** the golden email corpus,
**When** CI runs or a prompt/model version changes,
**Then** false-positive and false-negative rates compute against the corpus, and the ADD-7 regression gate blocks changes that increase false commitments.
**And** in production the week-one behavioral gate holds: >50% rejection on an account drops it to forward-only mode automatically with an in-app explanation (FR-15); extraction proposals vs. rejections are counted continuously (§5.3 counter-metric).

### Story 3b.5: The System Survives the Model

As Sean,
I want everything essential working when the AI is down,
So that my plan never depends on someone else's uptime.

**Acceptance Criteria:**

**Given** the Anthropic API unreachable or the cost ceiling hit,
**When** I use the product,
**Then** capture, rule-based classification, the ledger, the planner, morning approval, and the work-ended tap all function fully from confirmed structured data (ADD-4 fallback — verified by an e2e test with the gateway disabled).
**And** queued extraction resumes when the gateway returns (no lost mail); degraded state is disclosed in sync-health framing ("Email suggestions paused — everything you've confirmed still works").

## Epic 5: Interrupts with Visible Tradeoffs

A mid-day demand becomes a ≤5-interaction decision showing the P11 checklist, with acknowledgments drafted straight into Gmail drafts.

### Story 5.1: Interrupt Intake

As Sean,
I want a new demand — captured by hand or proposed from email — to become a persistent interrupt record with a confirmed outcome and effort,
So that assessment starts from facts I've endorsed.

**Acceptance Criteria:**

**Given** a captured item or confirmed email proposal marked as an interrupt,
**When** I open it,
**Then** an interrupt record exists (never lost, FR-20) showing the original request verbatim, my confirmable outcome classification, effort from my input or a per-type template (no inferred estimation at MVP — FR-35), links to related people/goals/commitments, and whether a matching commitment already exists.
**And** the record carries context tag + source provenance; intake to assessment-ready is ≤2 interactions.

### Story 5.2: The Tradeoff View

As Sean,
I want scenario cards showing exactly what each response costs,
So that saying yes is a decision, not a reflex.

**Acceptance Criteria:**

**Given** an assessment-ready interrupt,
**When** the decision view opens,
**Then** a mechanical plan-diff runs against the active plan and renders up to five scenario cards — do now / schedule / acknowledge / clarify / decline — each carrying the P11 six-item checklist as its body, per the interrupt_decision_tradeoffs mock (no Delegate card at MVP).
**And** hard-boundary conflicts render the hard-conflict callout; the recommended card shows its why-panel ("Based on current information, this option preserves…"); starter policies gate recommendations; scenario cards use roving-tabindex keyboard semantics; capture-to-decision completes in ≤5 interactions (AC-8, e2e-tested); assessment renders within the NFR-2 <10s target, instrumented.

### Story 5.3: Decide, Apply, Preserve

As Sean,
I want my chosen response to update the plan while preserving everything it displaces,
So that accepting new work never silently costs me something I promised.

**Acceptance Criteria:**

**Given** scenario cards,
**When** I choose one,
**Then** the plan updates through the 4.4 diff machinery after explicit approval; displaced commitments are preserved with new state (never deleted — FR-35/AD-4); the interrupt reaches a recorded terminal decision state (AC-9).
**And** every consequential action carries reason, policy, evidence, audit history, one-step undo, and disclosure (FR-59); post-decision focus moves to the plan-diff summary; the decision announces via the polite live region.

### Story 5.4: Drafts, Never Sends

As Sean,
I want acknowledgments and replies drafted into the right Gmail account's drafts folder,
So that communication happens at machine speed but leaves at human speed.

**Acceptance Criteria:**

**Given** a decision whose scenario includes communication,
**When** I approve it,
**Then** a drafted reply lands in the correct context's Gmail drafts folder, ready to send — never auto-sent (AC-10, AD-8, FR-57: the sole external write).
**And** drafts pass the AD-5 broker filter (a work draft may say "unavailable after 4:05 PM — hard external commitment," never the school's name); emotionally consequential drafts are flagged for extra review regardless of settings (SEC-6); voice follows the microcopy table; the FR-57 autonomy ladder is documented in `packages/policy` and an automated test verifies no code path mutates any external system except Gmail draft creation (MVP = L2–L3, machine-verified).

### Story 5.5: Notifications That Earn Their Interruption

As Sean,
I want to be notified only when a decision genuinely needs me, batched and quiet by default,
So that the anti-interruption system never becomes an interrupter.

**Acceptance Criteria:**

**Given** notification-worthy conditions,
**When** they occur,
**Then** only the FR-56 MVP triggers fire, in-app only, each deep-linking to its decision surface (ADD-8).
**And** low-priority notifications batch; duplicates suppress; stale ones expire; snooze and "do not notify again for this condition" work; quiet hours and focus-block suppression are configurable; prohibited categories (guilt, engagement, per-movement) have no code path — verified by test.

## Epic 6: The Deliberate Stop

At day's end Sean closes loops and leaves work on purpose, with tomorrow already shaped.

### Story 6.1: The End-of-Day Review

As Sean,
I want an end-of-day review that closes my loops — what finished, what moved, who's still waiting,
So that nothing follows me home unhandled.

**Acceptance Criteria:**

**Given** the work-end window approaching (or the Today surface after the work-ended tap),
**When** I open the End-of-Day Review,
**Then** it renders per the end_of_day_review mock: completed outcomes; displaced commitments with renegotiation state; unanswered requests each with a drafted reply ready in Gmail (5.4 machinery); a roll-forward list carrying unresolved items to tomorrow without loss (AC-11, ledger-verified).
**And** each closure action is one interaction (confirm draft / roll forward / mark done); everything flows through AD-4 events with undo.

### Story 6.2: The Stop Ritual

As Sean,
I want the day to end on purpose — evening protected, tomorrow shaped, one honest question answered,
So that I close the laptop without the background hum.

**Acceptance Criteria:**

**Given** the review complete,
**When** I finish the stop flow,
**Then** the "Evening is protected" panel shows tonight's personal commitments; a preliminary model for tomorrow exists (roll-forwards + fixed events visible); the transition out of work is marked.
**And** the SM-1 three-question rubric is asked here — skippable, never guilt-framed — recording the daily plan-accuracy datum; SM-3's planned-vs-actual finish renders as a simple trend; the whole flow honors the calm register ("Intentionally not scheduled," never "Failed").

## Epic 7: My Data, My Rules

Sean can export, disconnect, delete, and inspect — implementing the erasure design decided in Epic 1a.

### Story 7.1: Export Everything

As Sean,
I want a complete export of my data in a portable format,
So that my life's record is never hostage to my own software.

**Acceptance Criteria:**

**Given** the data settings surface,
**When** I request an export,
**Then** a background job produces a downloadable archive: all events (in event_seq order), current projections, assertions with provenance, policies, and connected-source metadata — documented format, no proprietary lock.
**And** the export completes for realistic volumes without blocking the app; its generation is itself an audited event.

### Story 7.2: Disconnect Without Loss

As Sean,
I want to disconnect any source cleanly,
So that leaving a tool never costs me the commitments I made through it.

**Acceptance Criteria:**

**Given** a connected source,
**When** I disconnect it,
**Then** OAuth tokens are revoked and deleted, source-mirror tables are dropped (AD-7 cache semantics), and promoted domain records survive with provenance marked stale.
**And** sync health reflects the disconnection; plan confidence adjusts; reconnecting later resumes without duplicating previously promoted records (ADD-3 dedup).

### Story 7.3: Erasure That Actually Erases

As Sean,
I want selective and full deletion that reaches every copy,
So that "delete" means what it says — even in an append-only system.

**Acceptance Criteria:**

**Given** a deletion request (single item, context slice, or full account),
**When** it executes,
**Then** the 1a.3 erasure design does its job: payload content becomes unrecoverable (redaction/key-destruction per the ADR) while ledger integrity (event_seq chain) survives, and erasure propagates to projections, assertions, and search structures — verified by a test proving erased content is unfindable.
**And** backup expiry semantics are stated in-app; full account erasure leaves a system that boots clean; every erasure is itself an audited, content-free event.

### Story 7.4: The Audit Window

As Sean,
I want to see the cross-context audit trail and retention settings myself,
So that the privacy guarantees are inspectable, not promised.

**Acceptance Criteria:**

**Given** the data settings surface,
**When** I open the audit view,
**Then** cross-context reads/emits are browsable (what joined work+personal, when, which surface — the SM-17/AC-14 instrument made visible) and retention configuration is editable within the erasure design's bounds.
**And** the audit view is read-only; SEC-4's zero-unauthorized-transfers claim is checkable against the log.

## Epic 8: Work Signal (v0.2)

Work interrupts arrive without manual capture; the week has a planned shape. *(Post-MVP stories are deliberately coarse — re-decomposed after MVP learning.)*

### Story 8.1: Slack Ingestion
As Sean, I want Slack connected with context assignment, So that work interrupts arrive hands-free.
**Acceptance Criteria:**
**Given** a connected Slack workspace, **When** a message demands something of me, **Then** it lands as an interrupt-intake candidate through the same extraction gates as email (3b machinery), **And** sync health, dedup against email versions of the same request, and rate-limit behavior match ADD-3.

### Story 8.2: Jira Ingestion
As Sean, I want Jira work items and incidents flowing in, So that due work has its work-side system of record.
**Acceptance Criteria:**
**Given** connected Jira, **When** issues are assigned or escalated to me, **Then** they appear as due work / interrupts with source links, **And** promotion to domain state remains an explicit command (AD-7).

### Story 8.3: Full Request Extraction
As Sean, I want all ten FR-15 intent categories extracted across email, Slack, and Jira, So that requests, follow-ups, decisions, and invitations are all caught.
**Acceptance Criteria:**
**Given** the expanded corpus, **When** extraction runs, **Then** all categories extract behind the same confirmation, injection-defense, and quality gates as 3b, **And** the golden corpus and regression gate extend to every category and source.

### Story 8.4: The Live Day
As Sean, I want Today to live through the day — now, next, remaining capacity, projected finish, So that circumstances changing mid-day never make the plan a lie.
**Acceptance Criteria:**
**Given** an active plan, **When** time passes or items complete/expand, **Then** Today updates now/next, remaining capacity, and projected finish (FR-34), surfacing only material risks, **And** later commitments stay protected; changes flow through plan-diffs.

### Story 8.5: The Weekly Shape
As Sean, I want a weekly planning loop and Week surface, So that goal allocations, rhythms, and recovery get placed before the week fills.
**Acceptance Criteria:**
**Given** a new week, **When** the weekly loop runs, **Then** it proposes a flexible weekly shape (FR-33: obligations, allocations, rhythms, white space, overcommitment surfaced), **And** the Week surface renders per FR-67 with approval semantics matching the morning plan.

## Epic 9: Calibration (v0.3)

The system learns Sean's reality. *Gate: SM-13 calibration error visibly shrinking.*

### Story 9.1: The Learning Loop
As Sean, I want the system comparing estimates to actuals and proposing corrections, So that plans get more honest with use.
**Acceptance Criteria:**
**Given** accumulated plan/actual history, **When** the learning loop runs, **Then** it identifies patterns across the FR-52 dimensions and proposes assumption updates requiring my confirmation (FR-37/53), **And** every learned assumption is visible, correctable, expirable, deletable — and FR-54 boundaries hold (no health/emotional inference, no third-party profiling).

### Story 9.2: Capacity That Knows Me
As Sean, I want inferred energy and resource constraints in the capacity model, So that the plan stops pretending all hours are equal.
**Acceptance Criteria:**
**Given** confirmed learned assumptions, **When** snapshots build, **Then** FR-26's inferred inputs (meeting-load fatigue, recovery, location/resources) and FR-27 feasibility states apply, **And** the planner remains pure — inference happens upstream in assertion-space, and the golden scenarios extend to cover it.

### Story 9.3: Inferred Interrupt Estimation
As Sean, I want the interrupt loop estimating effort and simulating responses, So that assessment gets faster without getting opaque.
**Acceptance Criteria:**
**Given** an interrupt, **When** assessment runs, **Then** Sonnet-tier estimation and response simulation produce confidence-tagged scenario enrichments (FR-35-estimation) via the gateway, **And** user-supplied effort always overrides; the why-panel shows the estimate's basis.

### Story 9.4: Learning Review and Coverage
As Sean, I want the Learning Review surface and full coverage dashboard, So that what the system believes about me is inspectable.
**Acceptance Criteria:**
**Given** learned assumptions and connected sources, **When** I open Learning Review, **Then** I can confirm/reject/expire assumptions and use all FR-55 feedback controls, **And** the FR-60-full coverage dashboard shows sources, freshness, blind spots, and material assumptions.

## Epic 10: People & Goals in Full (v0.4)

Relationships and goals become fully active planning inputs. *Gate: SM-10/SM-11 measurable.*

### Story 10.1: Goal Decomposition
As Sean, I want goals decomposed into outcomes, milestones, and next actions with my approval, So that intentions become plans without me doing all the translation.
**Acceptance Criteria:**
**Given** an active goal, **When** decomposition runs, **Then** the FR-38 chain proposes outcomes → milestones/rhythms → next actions → allocations, all editable and approval-gated (FR-39), **And** material decompositions never auto-apply.

### Story 10.2: Allocation Tracking and White Space
As Sean, I want allocation delivery tracked and white space defended by name, So that neglect is visible and rest is legitimate.
**Acceptance Criteria:**
**Given** goal allocations and white-space policies, **When** weeks pass, **Then** FR-40-full reports intended vs. delivered capacity with best-remaining-opening remediation, **And** FR-31-full named white-space policies hold and opportunities render as opportunities, never obligations.

### Story 10.3: Relationships That Generate Action
As Sean, I want relationship actions and staged important-date workflows, So that showing up for people is planned, not remembered.
**Acceptance Criteria:**
**Given** people with intentions and dates, **When** rhythms lapse or dates approach, **Then** FR-10's six action categories and FR-11's staged workflows generate editable proposed actions at correct lead times, **And** the People and Goals surfaces render per FR-67; P5 ethics hold everywhere (no scores, ever).

### Story 10.4: One Person, Many Sources
As Sean, I want person-identity resolution across accounts and sources, So that Jane-at-work and Jane-my-friend merge only when I say so.
**Acceptance Criteria:**
**Given** similar identities across sources, **When** a match is suggested, **Then** merge requires my confirmation, is audited, reversible, and splittable (ADD-3, AD-6), **And** accidental cross-context merges are structurally prevented; merged Persons become joint-context.

### Story 10.5: Personal Sources
As Sean, I want my task app and Apple ecosystem feeding the system, So that personal obligations stop living in fragments.
**Acceptance Criteria:**
**Given** connected personal sources, **When** sync runs, **Then** tasks/reminders flow through mirror → promotion semantics (iMessage is feasibility-gated: spike first, drop without replanning if API-constrained), **And** month/quarter horizons (FR-29-full) activate with important dates feeding them.

## Epic 11: Evidence & Execution (v0.5)

Decisions gain grounding and follow-through. *Gate: UJ-6 end-to-end.*

### Story 11.1: Linked Documents
As Sean, I want selected documents extracted for commitments, decisions, and risks, So that context stops living only in my head.
**Acceptance Criteria:**
**Given** user-linked documents, **When** extraction runs, **Then** FR-41 candidates require confirmation and FR-42 holds (documents never auto-become work; "should/need/will" creates nothing by itself), **And** all 3b injection defenses apply to document content.

### Story 11.2: Authority and Conflicts
As Sean, I want evidence carrying authority and freshness, with conflicts surfaced, So that recommendations rest on the strongest available truth.
**Acceptance Criteria:**
**Given** assertions from multiple sources, **When** they disagree, **Then** AD-10's single authority-order implementation resolves or escalates to me (FR-43/44), **And** targeted retrieval only (FR-45); the Context Review surface renders per the context_review mock with the trusted-baseline idiom.

### Story 11.3: Context Packets
As Sean, I want each activity opening with its full context packet, So that starting costs seconds, not reconstruction.
**Acceptance Criteria:**
**Given** a plan block, **When** I enter Focus Context, **Then** the FR-47 packet renders (outcome, why, definition of done, time, people, decisions, documents, risks), **And** FR-49 definitions of done and FR-50 completion checks work end-to-end.

### Story 11.4: Execution and Renegotiation
As Sean, I want full execution actions and drafted renegotiation, So that follow-through and rescheduling both happen at machine speed with human approval.
**Acceptance Criteria:**
**Given** at-risk commitments and completing work, **When** I act, **Then** FR-48's full action set and FR-24's drafted renegotiation (with stakeholder updates and acceptance tracking) work, **And** FR-36-full end-of-day renegotiation support lands; date-drag still isn't renegotiation.

### Story 11.5: Delegation
As Sean, I want delegation with explicit acceptance tracking, So that handing off never silently drops responsibility.
**Acceptance Criteria:**
**Given** a delegable item, **When** I delegate, **Then** the FR-64 lifecycle holds (mine until accepted), household behavior follows FR-65 (never assume partner absorption), professional context per FR-66, **And** the interrupt loop's Delegate card returns (FR-35-full).

## Epic 12: Completion & Hardening (v1.0)

The complete product, proven against the source draft's acceptance journey.

### Story 12.1: The Full Policy System
As Sean, I want the complete policy catalog with gradual onboarding and conflict handling, So that the system's rules grow from my life, not from a settings marathon.
**Acceptance Criteria:**
**Given** ongoing use, **When** repeated choices form patterns, **Then** FR-5 suggests policy additions with confirmation and FR-6 surfaces conflicts with controlling-policy explanation, **And** all seven FR-4 categories ship with templates.

### Story 12.2: Interpreted Acceptance
As Sean, I want acceptance language interpreted, So that "I'll look into it" is classified for me — and still never auto-escalates.
**Acceptance Criteria:**
**Given** a reply or confirmation text, **When** interpretation runs, **Then** FR-23's six acceptance types are proposed with confidence, confirmation required for material ones, **And** the manual selector remains available and authoritative.

### Story 12.3: Configurable Autonomy
As Sean, I want the 8-dimension autonomy matrix with L4 execute-with-approval, So that trusted actions get faster while everything else stays mine.
**Acceptance Criteria:**
**Given** the autonomy settings, **When** I configure per domain/source/person/action/risk/confidence/reversibility/context, **Then** FR-58 rules apply with FR-59 guarantees on every action (reason, policy, evidence, undo, audit), **And** L4 calendar/task write-back works within explicit rules; L5 remains post-v1.0.

### Story 12.4: Full Notifications and the Broker
As Sean, I want every v1.0 notification trigger and the hardened privacy broker, So that attention and privacy both scale with the product.
**Acceptance Criteria:**
**Given** v1.0 surfaces live, **When** triggers fire, **Then** all FR-56 triggers work under ADD-8 delivery rules (push transport included, lock-screen redaction via broker), **And** SEC-2's constraint-only exchange governs every third-party-visible output.

### Story 12.5: The 32-Step Proof
As Sean, I want the source draft's full acceptance journey passing end-to-end, So that v1.0 means what the original vision meant.
**Acceptance Criteria:**
**Given** the complete product, **When** the 32-step verification journey runs (connect → life model → plan → interrupt → delegate → focus → evidence → conflict → learning → privacy → end-of-day), **Then** every step passes with evidence recorded, **And** all 18 SM metrics have live instruments; the v1.0 exclusions (PRD §7.3) remain excluded.
