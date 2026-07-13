---
stepsCompleted: [1, 2, 3, 4, 5, 6]
assessor: 'bmad-check-implementation-readiness (Claude, facilitated by Sean)'
assessmentDate: 2026-07-12
overallStatus: READY
documentsIncluded:
  prd:
    - prds/prd-life-focus-2026-07-10/prd.md
    - prds/prd-life-focus-2026-07-10/addendum.md
  architecture:
    - architecture/architecture-life-focus-2026-07-12/ARCHITECTURE-SPINE.md
  epics:
    - epics.md
  ux:
    - ux-designs/ux-life-focus-2026-07-12/DESIGN.md
    - ux-designs/ux-life-focus-2026-07-12/EXPERIENCE.md
---

# Implementation Readiness Assessment Report

**Date:** 2026-07-12
**Project:** life-focus

## Document Inventory

### PRD
- `prds/prd-life-focus-2026-07-10/prd.md` (68 KB, modified 2026-07-12 23:13) — primary
- `prds/prd-life-focus-2026-07-10/addendum.md` (9 KB, 2026-07-10)
- Supporting (context only): `review-rubric.md`, `review-adversarial-general.md`, `reconcile-draft-pdf.md`

### Architecture
- `architecture/architecture-life-focus-2026-07-12/ARCHITECTURE-SPINE.md` (16 KB, 2026-07-12 15:51) — primary
- Supporting (context only): `reviews/review-versions.md`, `reviews/review-adversarial.md`, `reviews/review-rubric.md`, `reconcile-prd.md`

### Epics & Stories
- `epics.md` (85 KB, modified 2026-07-12 23:08) — single consolidated epics + stories document

### UX Design
- `ux-designs/ux-life-focus-2026-07-12/DESIGN.md` (49 KB, 2026-07-12 17:07)
- `ux-designs/ux-life-focus-2026-07-12/EXPERIENCE.md` (44 KB, 2026-07-12 17:08)
- Supporting (context only): `review-accessibility.md`, `reconcile-stitch.md`, `review-rubric.md`, `mockups/` (3 HTML), `imports/` (10 screen designs)

### Issues Noted at Discovery
- No duplicate whole/sharded versions — nothing to resolve.
- No separate story files or sprint plan found; stories are expected inline in `epics.md`.

## PRD Analysis

Source: `prd.md` (status: final, updated 2026-07-12) + `addendum.md`. The PRD uses explicit numbering: FR-1..FR-68 (functional), ADD-1..ADD-9 (foundational correctness, added 2026-07-12 from pre-epic review), NFR-1..NFR-9 (non-functional), SEC-1..SEC-6 (privacy/security). Phases: [MVP] = §7.2 wedge; [v1.0] = complete product; split tags (e.g. MVP-core / v1.0-full) indicate partial MVP delivery.

### Functional Requirements

**§9.1 Life model and onboarding**
- FR-1 [MVP]: Users define configurable life domains (11 defaults); items may span domains; domains inform context without becoming rigid silos.
- FR-2 [MVP]: System distinguishes and separately models: goals, relationship intentions, responsibilities, boundaries, rhythms/rituals, important dates.
- FR-3 [MVP]: Every commitment/work item/relationship action/goal action/event supports a protection level: hard commitment; protected priority; flexible intention; optional opportunity.
- FR-4 [MVP]: Life Operating Policies across 7 categories; MVP ships starter templates for non-negotiables and work boundaries; v1.0 full catalog.
- FR-5 [v1.0]: Gradual policy onboarding — templates, observed confirmed choices, suggested policy additions with confirmation.
- FR-6 [v1.0]: Policy conflicts surfaced: identify conflict, explain affected commitments, show likely controlling policy, present alternatives, ask for decision when no rule controls, record approved exceptions.
- FR-7 [MVP]: Onboarding with limited setup (workday shape, hard stop, sleep boundary, hard commitments, up to 3 goals, core people, starter policies, autonomy permissions); gradual context addition; v1.0 extends to 3–5 goals, 5–15 people, full policy/rhythm setup.

**§9.2 People and relationships**
- FR-8 [MVP-lite / v1.0-full]: Person model (full field list); MVP captures identity/intention/important-date subset; "meaningful interactions" and "life events" are user-asserted only, never inferred.
- FR-9 [v1.0]: Relationship importance levels influence attention but never create absolute priority.
- FR-10 [MVP-rhythm-lite / v1.0-full]: MVP: one flexible communication rhythm per core person as a flexible intention with repeated-displacement visibility. v1.0: relationship-generated actions across 6 categories (communication, shared time, care, celebration, commitment fulfillment, repair).
- FR-11 [v1.0]: Important dates generate staged preparation workflows (decide → coordinate → gift → reserve → invite → protect → celebrate); depth scales with context; all editable.
- FR-12 [all phases]: Ethical constraint (P5): reason only about user's behavior/intentions; never claim another person's internal state; never compute a relationship score.

**§9.3 Source ingestion and context**
- FR-13 [MVP]: OAuth/least-privilege source connection; source links preserved; sync state tracked; imported vs. inferred vs. user-confirmed distinguished. MVP sources: work+personal Google Calendar, work+personal Gmail. v1.0 adds Slack, Jira, personal task app, Apple ecosystem, meeting notes, selected documents.
- FR-14 [MVP]: Separate work and personal identities first-class, with §11 privacy boundary between them.
- FR-15 [MVP-core / v1.0-full]: Request/action extraction (10 categories). MVP: email-scope extraction, confirmation required, per-account toggle, >50% week-one rejection → forward-only fallback. v1.0 extends to Slack, Jira, all sources.
- FR-16 [v1.0]: Layered context model: intention, operational, people, evidence, capacity/feasibility, policy, planning layers.

**§9.4 Capture**
- FR-17 [MVP]: NL capture desktop + mobile web into Capture Inbox. v1.0 adds voice, browser extension, share sheet, email forwarding, Slack action, photo/doc upload, calendar follow-ups, meeting-note import, API.
- FR-18 [MVP]: Classification into 12 types (request, commitment, task, goal, idea, note, responsibility, important date, relationship intention, boundary, waiting item, decision).
- FR-19 [MVP]: Minimal clarification — only questions materially affecting planning; ≤3 prompts per item, each naming the planning decision it unblocks.
- FR-20 [MVP]: Capture guarantee: actionable items remain traceable until scheduled/delegated/clarified/declined/completed/converted/deleted.

**§9.5 Requests, commitments, Commitment Ledger**
- FR-21 [MVP]: Requests vs. commitments distinguished; full lifecycle state machine (detected → unassessed → … → fulfilled/renegotiated/canceled/failed).
- FR-22 [MVP]: Commitment record fields: outcome, requester, owner, beneficiary, dates, source, evidence, scope, definition of done, protection level, relations, confidence, state, communication state, renegotiation history, fulfillment evidence.
- FR-23 [MVP-manual / v1.0-interpreted]: MVP: manual acceptance-type selection (acknowledged / investigate / full responsibility / declined). v1.0: interpreted acceptance across 6 types; "I'll look into it" never auto-escalates.
- FR-24 [MVP-flag / v1.0-full]: At-risk detection; MVP ships flagging; v1.0 adds drafted renegotiation with history preservation.

**§9.6 Prioritization, capacity, planning**
- FR-25 [MVP]: Prioritization across 9 explicit dimensions, explained in plain language; every consequential recommendation exposes a "why" panel; no unexplained scores.
- FR-26 [MVP-declared / v1.0-inferred]: Realistic capacity. MVP: declared inputs only (time constraints, declared energy windows, configurable reserves). v1.0: inferred inputs (meeting fatigue, recovery, resource constraints).
- FR-27 [v1.0]: Feasibility states (important+feasible now; important not feasible; feasible low value; requires preparation/person/location/information).
- FR-28 [MVP]: Overcommitment: state mismatch, identify contributors, show affected domains, recommend moves, preserve displaced commitments, show scenario consequences; never silently consume sleep/family/recovery.
- FR-29 [MVP-day / v1.0-all]: Planning horizons — MVP plans today; v1.0 adds week/month/quarter.
- FR-30 [MVP]: Replanning: recalculate capacity, preserve completed work, minimize movement, identify displacements, explain, record reasons, request approval; every move displays the P11 six-item consequence checklist.
- FR-31 [MVP-reserves / v1.0-full]: White space: MVP reserve mechanics via FR-26; v1.0 named protected unstructured time; opportunities never auto-become obligations.

**§9.7 Operating loops**
- FR-32 [MVP]: Morning planning loop (review sources, calculate capacity, identify gaps/conflicts, propose day with exclusions/assumptions/risks/work-end/confidence, approve/adjust). v1.0 adds goal shortfalls, rhythms/dates, evidence retrieval.
- FR-33 [v1.0]: Weekly planning loop.
- FR-34 [v1.0]: Live-day loop.
- FR-35 [MVP-honest / v1.0-full]: Interrupt loop. MVP: capture → classify (user-confirmed) → existing-commitment check → link relations → effort from user input/templates → policy/boundary check → mechanical plan-diff → recommend (do now/schedule/acknowledge/clarify/decline) → P11 checklist → approved update → preserve displaced → track. v1.0 adds inferred estimation, response simulation, delegate recommendation, evidence retrieval, drafted stakeholder communication.
- FR-36 [MVP-lite / v1.0-full]: End-of-day loop: completed outcomes, displaced commitments, unresolved requests, closure recommendations, renegotiation support, roll-forward, evening protection, preliminary tomorrow model.
- FR-37 [v1.0]: Learning loop: estimated vs. actual, pattern identification, confirmed assumption updates, correction/expiration/deletion.

**§9.8 Goal-to-action translation**
- FR-38 [MVP-manual / v1.0-decomposed]: MVP: user-defined one next action per goal + protected weekly allocation. v1.0: full decomposition chain with approval.
- FR-39 [v1.0]: Full user control over decomposition.
- FR-40 [MVP-displacement / v1.0-full]: MVP: repeated displacement of goal allocations visible (count, neutral language). v1.0: neglect identification + remedy ("best remaining opening" defined); intended-vs-delivered allocation tracking.

**§9.9 Documentation, knowledge, evidence**
- FR-41 [v1.0]: Linked documents; extraction with confirmation before document-derived commitments.
- FR-42 [v1.0]: Documents never automatically become work.
- FR-43 [v1.0]: Evidence before confidence: assertion classes, authority + freshness metadata, configurable authority order.
- FR-44 [v1.0]: Source conflicts surfaced with resolution flow.
- FR-45 [v1.0]: Targeted retrieval only; no bulk indexing by default.
- FR-46 [MVP]: Traceability: every consequential recommendation retains sources, evidence, assumptions, conflicts, confidence, consequences, overrides.

**§9.10 Execution layer**
- FR-47 [v1.0]: Context packets (13 fields).
- FR-48 [v1.0]: Execution actions; MVP ships drafted acknowledgments/replies within interrupt and end-of-day loops.
- FR-49 [v1.0]: Vague titles → definitions of done (on request; auto-proposed >30 min without criteria).
- FR-50 [v1.0]: Completion behavior checks (genuinely complete, waiting parties, follow-ups, source updates, plan effects, ledger closure).
- FR-51 [MVP]: Communication is work: acknowledge/clarify/renegotiate/status/transfer/confirm recognized as right actions.

**§9.11 Learning and calibration**
- FR-52 [v1.0]: 12 learnable dimensions.
- FR-53 [v1.0]: Material learned assumptions require confirmation; visible, correctable, expirable, deletable.
- FR-54 [all phases]: Learning boundaries (no health/emotional diagnosis, no sensitive-trait inference, no third-party profiling, no permanence from occasional behavior, no hidden assumptions, no consequential auto-changes from weak patterns).
- FR-55 [v1.0]: 9 feedback controls.

**§9.12 Notifications**
- FR-56 [MVP-core / v1.0-full]: Decision-oriented notifications only; batched; focus-respecting. 5 MVP triggers; 7 additional v1.0 triggers; 4 prohibited categories at every phase.

**§9.13 Autonomy and decision rights**
- FR-57 [MVP]: Autonomy ladder L0–L5. MVP at L2–L3 only; sole MVP write surface = Gmail drafts folder; L4 with v1.0; L5 post-v1.0.
- FR-58 [v1.0]: Autonomy configurable by domain/source/person/action-type/risk/confidence/reversibility/context.
- FR-59 [MVP]: Every automatic/consequential action provides reason, policy, evidence, audit history, undo, disclosure, affected-person notification.

**§9.14 Coverage and graceful degradation**
- FR-60 [MVP-basic / v1.0-full]: Coverage indicators (connected/unavailable sources, last sync, metadata-only, exclusions, blind spots, assumptions, conflicts).
- FR-61 [MVP]: Plan confidence = defined documented function of enumerated inputs, displayed with plan.
- FR-62 [MVP]: Connector failure: disclose, explain affected decisions, continue with reliable context, reduce confidence, offer manual capture; active sync-health monitoring.

**§9.15 Shared responsibility and delegation**
- FR-63 [v1.0]: 7 responsibility types.
- FR-64 [v1.0]: Delegation lifecycle; user responsible until acceptance; drafts without collaborative accounts.
- FR-65 [v1.0]: Household behavior: never assume partner absorbs a task; offer options.
- FR-66 [v1.0]: Professional behavior: ownership, qualified delegates, on-call, approvals, handoff context.

**§9.16 Interface architecture**
- FR-67 [MVP-subset / v1.0-full]: Named surfaces. MVP: Today, Morning Plan, Interrupt Decision, Capture Inbox, Commitment Ledger, Policy & Boundaries, End-of-Day Review. v1.0 adds: Week, People, Goals, Focus Context, Context Review, Learning Review.
- FR-68 [MVP]: Visual hierarchy (decision → recommendation → reason → protected entity → consequence → confidence → source detail) with progressive disclosure.

**§9.17 Foundational correctness (ADD-1..9, detail delegated to `epics.md`)**
- ADD-1 [MVP]: Planner behavioral contract (determinism, locked blocks, minimal change, plan states, stale-proposal detection).
- ADD-2 [MVP]: Temporal correctness (time zones, DST, recurrence exceptions, all-day/floating, midnight-crossing, dateless due-dates) in test suites.
- ADD-3 [MVP]: Connector correctness + identity resolution (incremental sync w/ deletions, dedup, reauth, confirmed reversible person merges).
- ADD-4 [MVP]: AI safety (untrusted content, prompt-injection defense, schema-constrained outputs, golden eval sets, model-unavailable usability, cost ceilings).
- ADD-5 [MVP]: Account/data lifecycle (export, disconnect w/o domain loss, selective/full erasure reconciled with append-only ledger by design, retention).
- ADD-6 [MVP]: Operational reliability (correlation-ID logging, dead-letter replay, projection rebuild, backup restore verification).
- ADD-7 [MVP]: Evaluation harness (golden scenarios before planner; regression gates on boundary preservation, false commitments, cross-context disclosure, plan stability).
- ADD-8 [MVP-in-app]: Notification delivery rules (batching, dedup, expiry, snooze, deep links, quiet hours, focus suppression); push + lock-screen redaction Phase 2.
- ADD-9 [all]: Sensitive-domain guardrail (medical/mental-health/legal/financial/grief planned neutrally, never advised on).

**Total FRs: 68 FR + 9 ADD = 77 functional requirements** (with explicit MVP/v1.0 phase splits on 15 of them).

### Non-Functional Requirements

- NFR-1 Trust and explainability — consequential recommendations understandable, traceable to evidence.
- NFR-2 Responsiveness — [ASSUMPTION] morning plan interactive <3s cached, full refresh <15s, interrupt assessment <10s.
- NFR-3 Reliability — commitments/boundaries survive connector failure; ledger durable independent of sources.
- NFR-4 Reversibility — one-step undo for every plan mutation; irreversible external actions never automatic.
- NFR-5 Auditability — recommendation → evidence → policy → decision → action → plan change recorded.
- NFR-6 Data minimization — only planning-necessary context; no bulk indexing by default.
- NFR-7 Accessibility — keyboard nav, high contrast, screen readers, non-color status indicators.
- NFR-8 Partial-connectivity operation.
- NFR-9 Platform — desktop web + responsive mobile capture/review; no native app before Phase 2.

**Privacy/Security (treated as NFR-class binding requirements):**
- SEC-1 [MVP] Strict work/personal context separation.
- SEC-2 [MVP-seam / v1.0-full] Trusted planning layer; context tagging + cross-context audit log (SM-17 instrument) at MVP; boundary broker at v1.0.
- SEC-3 [MVP] Least privilege, OAuth, permission respect, encryption, retention, deletion, audit.
- SEC-4 [all] No training on customer data; zero unauthorized cross-context transfer.
- SEC-5 [v1.0+] Document access modes; residency/deployment options scale with enterprise.
- SEC-6 [all] Third-party dignity; emotionally consequential communication always requires human review.

**Total NFRs: 9 NFR + 6 SEC = 15**

### Additional Requirements and Constraints

- **Principles P1–P11** — binding on all features (user authority; core loop; honest capacity; tradeoffs before consequences; ethical relationship reasoning; non-optimization; privacy separation; recommendation is the product; one capacity pool; time boundaries are real; P11 six-item consequence checklist binding FR-30/FR-35).
- **MVP acceptance criteria AC-1..AC-15** (§7.2) — testable wedge completion definition.
- **Success metrics SM-1..SM-5 (MVP north stars) each with named instrument; SM-6..SM-18 (v1.0)**; counter-metrics with phase and data-source tags (time-in-tool, notification volume, replanning churn, boundary violations, white-space fill, extraction rejection).
- **Non-goals §2.1 (12 binding exclusions)** and permanent exclusion of relationship scoring.
- **Conflict resolution priority order** (§1, 6 levels).
- **Open questions OQ-1..OQ-10** — OQ-1 (AI infrastructure), OQ-3 (identity edge cases), OQ-9 (planner/boundary architecture) are explicitly **architecture-phase blockers** that "must be resolved by bmad-architecture before implementation begins."
- **v0.2–v0.5 increment sequence** with gates (§7.3); post-v1.0 phases 2–4 must not compromise authority/explainability/white-space/privacy.
- **Addendum**: data-model entity catalog (25 core entities), layered context model, privacy broker mechanism sketch, evidence authority order, integration rings 1–4, evidence-drawer spec, learning-loop example observations, white-space policy seeds.

### PRD Completeness Assessment

The PRD is exceptionally complete and implementation-oriented: requirements are individually numbered with explicit phase tags, MVP/v1.0 splits are stated per-requirement, acceptance criteria are enumerated and mapped to metrics with named instruments, assumptions are indexed, and open questions are tracked with explicit blocker status. Notable strengths: the P11 consequence checklist gives a testable definition of the core differentiator; FR-15/FR-19 include quantified quality gates; ADD-1..9 add engineering-grade correctness requirements rarely present at PRD level. Items to verify downstream: (1) the three architecture-phase blockers (OQ-1, OQ-3, OQ-9) must be confirmed resolved in ARCHITECTURE-SPINE.md; (2) ADD-1..9 "full detail in epics.md ADD-1..9" creates a PRD→epics dependency to validate; (3) 2026-07-12 MVP amendments (goal-activation-lite, rhythm-lite, manual acceptance types, FR-31 clarification) must be reflected consistently in epics and UX.

## Epic Coverage Validation

`epics.md` carries a Requirements Inventory (restating all PRD FRs/NFRs/SECs/ADDs plus architecture ADs and UX-DR1..10) and an explicit **FR Coverage Map** with statuses: C = covered in an MVP epic, D = deferred to a named post-MVP epic with phasing rationale. Claim in document: "No requirement is unmapped; nothing was rejected." Verified below against the step-2 PRD extraction.

### Coverage Matrix

| FR | Requirement (abbrev.) | Epic Coverage | Status |
|---|---|---|---|
| FR-1 | Life domains | Epic 2 | ✓ Covered (MVP) |
| FR-2 | Distinct entity models | Epic 2 | ✓ Covered (MVP) |
| FR-3 | Protection levels | Epic 2 (story 2.3) | ✓ Covered (MVP) |
| FR-4 | Life Operating Policies | Epic 2 (starter) + Epic 12 (full) | ✓ Covered (split) |
| FR-5 | Gradual policy onboarding | Epic 12 | ✓ Deferred-mapped (v1.0) |
| FR-6 | Policy-conflict surfacing | Epic 12 | ✓ Deferred-mapped (v1.0) |
| FR-7 | Limited-setup onboarding | Epic 2 | ✓ Covered (MVP) |
| FR-8 | Person model | Epic 2 (lite) + Epic 10 (full) | ✓ Covered (split) |
| FR-9 | Relationship importance | Epic 10 | ✓ Deferred-mapped (v0.4) |
| FR-10 | Rhythms / relationship actions | Epic 2 (rhythm-lite, story 2.4) + Epic 10 | ✓ Covered (split) |
| FR-11 | Important-date workflows | Epic 10 (story 10.3) | ✓ Deferred-mapped (v0.4) |
| FR-12 | P5 ethical constraint | All epics; enforced in 2.4 schema AC | ✓ Covered (all phases) |
| FR-13 | Source connection | Epic 1a (calendars) + 1b (Gmail); v1.0 sources → 8/10 | ✓ Covered (split) |
| FR-14 | Work/personal identities | Epic 1a (story 1a.4) | ✓ Covered (MVP) |
| FR-15 | Request extraction | Epic 3b (email-core + gate) + Epic 8 (full) | ✓ Covered (split) |
| FR-16 | Layered context model | Epic 11 | ✓ Deferred-mapped (v0.5) |
| FR-17–20 | Capture, classification, clarification, guarantee | Epic 3a (stories 3a.1–3a.5) | ✓ Covered (MVP) |
| FR-21–22 | Lifecycle + commitment fields | Epic 3a (story 3a.3) | ✓ Covered (MVP) |
| FR-23 | Acceptance types | Epic 3a (manual) + Epic 12 (interpreted) | ✓ Covered (split) |
| FR-24 | At-risk / renegotiation | Epic 3a (flag, story 3a.4) + Epic 11 (drafted) | ✓ Covered (split) |
| FR-25 | Explained prioritization | Epic 4 (story 4.5 why-panel) | ✓ Covered (MVP) |
| FR-26 | Realistic capacity | Epic 4 (declared, story 4.2) + Epic 9 (inferred) | ✓ Covered (split) |
| FR-27 | Feasibility states | Epic 9 | ✓ Deferred-mapped (v0.3) |
| FR-28 | Overcommitment behavior | Epic 4 (story 4.3) | ✓ Covered (MVP) |
| FR-29 | Planning horizons | Epic 4 (day) + Epics 8/10 (week/month/quarter) | ✓ Covered (split) |
| FR-30 | Replanning + P11 checklist | Epic 4 (story 4.4) | ✓ Covered (MVP) |
| FR-31 | White space | Epic 4 (reserves) + Epic 10 (named policies) | ✓ Covered (split) |
| FR-32 | Morning loop | Epic 4 + Epic 11 (evidence retrieval) | ✓ Covered (split) |
| FR-33–34 | Weekly + live-day loops | Epic 8 (stories 8.4, 8.5) | ✓ Deferred-mapped (v0.2) |
| FR-35 | Interrupt loop | Epic 5 (MVP-honest) + Epics 9/11 | ✓ Covered (split) |
| FR-36 | End-of-day loop | Epic 6 (lite) + Epic 11 (full) | ✓ Covered (split) |
| FR-37 | Learning loop | Epic 9 (story 9.1) | ✓ Deferred-mapped (v0.3) |
| FR-38 | Goal decomposition | Epic 2 (manual, story 2.5) + Epic 10 | ✓ Covered (split) |
| FR-39 | Decomposition control | Epic 10 (story 10.1) | ✓ Deferred-mapped (v0.4) |
| FR-40 | Goal neglect/displacement | Epic 2 (displacement counter) + Epic 10 (full) | ✓ Covered (split) |
| FR-41–45 | Evidence layer | Epic 11 (stories 11.1–11.2) | ✓ Deferred-mapped (v0.5) |
| FR-46 | Traceability | Epics 1a (audit) + 3b (provenance) + 4 (why-panel) | ✓ Covered (MVP) |
| FR-47, 49, 50 | Context packets, DoD, completion | Epic 11 (story 11.3) | ✓ Deferred-mapped (v0.5) |
| FR-48 | Execution actions | Epic 5 (drafts, story 5.4) + Epic 11 (full) | ✓ Covered (split) |
| FR-51 | Communication is work | Epic 3a (story 3a.3) | ✓ Covered (MVP) |
| FR-52, 53, 55 | Learning dimensions/controls | Epic 9 | ✓ Deferred-mapped (v0.3) |
| FR-54 | Learning boundaries | All epics; AC-enforced in 9.1 | ✓ Covered (all phases) |
| FR-56 | Notifications | Epic 5 (MVP triggers, story 5.5) + Epic 12 (full) | ✓ Covered (split) |
| FR-57 | Autonomy ladder | Epic 5 (story 5.4, machine-verified L2–L3) | ✓ Covered (MVP) |
| FR-58 | Configurable autonomy | Epic 12 (story 12.3) | ✓ Deferred-mapped (v1.0) |
| FR-59 | Action guarantees | Epic 5 (story 5.3) | ✓ Covered (MVP) |
| FR-60 | Coverage indicators | Epic 1b (story 1b.2) + Epic 9 (full dashboard) | ✓ Covered (split) |
| FR-61 | Plan confidence | Epic 4 (story 4.5) + 1b substrate | ✓ Covered (MVP) |
| FR-62 | Connector failure | Epic 1a (basic) + 1b (AC-15 e2e) | ✓ Covered (MVP) |
| FR-63–66 | Delegation | Epic 11 (story 11.5) | ✓ Deferred-mapped (v0.5) |
| FR-67 | Interface surfaces | 7 MVP surfaces → Epics 2 (2.7)/3a/4/5/6; 6 v1.0 surfaces → 8/9/10/11 | ✓ Covered (split) |
| FR-68 | Visual hierarchy | Epic 4 (story 4.5), binding thereafter | ✓ Covered (MVP) |
| ADD-1 | Planner contract | Epic 4 (stories 4.1, 4.3, 4.4) | ✓ Covered (MVP) |
| ADD-2 | Temporal correctness | Epic 4 + Epic 1a (connector share) | ✓ Covered (MVP) |
| ADD-3 | Connector/identity ops | Epic 1b + Epic 10 (merge ops) | ✓ Covered (split) |
| ADD-4 | AI safety | Epic 3b (stories 3b.1, 3b.3, 3b.5) | ✓ Covered (MVP) |
| ADD-5 | Data lifecycle | Epic 1a (erasure ADR, story 1a.3) + Epic 7 (features) | ✓ Covered (MVP) |
| ADD-6 | Operational reliability | Epic 1a (logging) + Epic 1b (story 1b.5) | ✓ Covered (MVP) |
| ADD-7 | Evaluation harness | Epic 4 (story 4.1) + Epic 3b (story 3b.4) | ✓ Covered (MVP) |
| ADD-8 | Notification delivery | Epic 5 (story 5.5, in-app); push → Phase 2 | ✓ Covered (MVP scope) |
| ADD-9 | Sensitive-domain guardrail | Epic 3a (story 3a.2) | ✓ Covered (MVP) |

NFR-1..9, SEC-1..6, and all 15 MVP acceptance criteria (AC-1..15) are likewise mapped: every AC is explicitly claimed by a story AC (AC-1 → 1a.4/1b.1; AC-2 → 2.6; AC-3/4/5/12/13 → Epic 4; AC-6/9 → 3a; AC-7 → 3b; AC-8/9/10 → Epic 5; AC-11 → 6.1; AC-14 → 1a.3/1a.5; AC-15 → 1b.2). SM-1/SM-2/SM-3 instrumentation is assigned to named stories (4.5, 4.6, 6.2).

### Missing Requirements

**None.** Every PRD FR (68), ADD (9), NFR (9), SEC (6), and AC (15) has a traceable epic/story home. No FRs appear in epics that are absent from the PRD; the epics add architecture ADs (AD-1..10) and UX design requirements (UX-DR1..10) sourced from the other two planning documents — additive, not contradictory.

**Minor consistency observations (not gaps):**
1. **FR-32 MVP scope extension** — the PRD says goal-allocation shortfalls and rhythms join the morning loop at v1.0, while epics feed the *lite* goal allocations (FR-38-lite) and rhythms (FR-10-lite) into the MVP loop. This is a coherent consequence of the 2026-07-12 MVP amendments and matches PRD §7.2 item 1; the PRD's FR-32 sentence was not updated to match. Cosmetic PRD-text inconsistency only.
2. **FR-48 phase tag** — PRD tags FR-48 [v1.0] with an MVP-drafts sentence inside it; epics re-tag as [MVP-drafts / v1.0-full]. Same substance, cleaner tagging in epics.

### Coverage Statistics

- Total PRD functional requirements: 77 (68 FR + 9 ADD)
- Covered/mapped in epics: 77
- **Coverage: 100%** (48 with MVP delivery in Epics 1a–7; 29 fully deferred to named post-MVP epics with PRD §7.3 phasing rationale)
- NFR/SEC coverage: 15/15 mapped · MVP acceptance criteria: 15/15 mapped

## UX Alignment Assessment

### UX Document Status

**Found.** Two-document UX contract: `DESIGN.md` (visual spec: complete light+dark token sets with WCAG AA contrast computations, typography, 25+ component token specs) and `EXPERIENCE.md` (behavioral spec: IA, voice/microcopy, component behavior, state patterns, accessibility floor, MVP key flows, theme switching). Both status: final, updated 2026-07-12, and both cite the PRD, addendum, and ARCHITECTURE-SPINE.md as sources.

### UX ↔ PRD Alignment

Strong, deliberate alignment — the UX documents quote the PRD rather than paraphrase it:

- **FR-67 surfaces:** all 13 named surfaces present with the exact MVP-7 / v1.0-6 split and the question each answers.
- **FR-68 hierarchy:** the 7-level visual hierarchy is reproduced verbatim with mandatory progressive disclosure (evidence collapsed by default).
- **Voice:** preferred/forbidden language lists verbatim from PRD §3 + addendum §8 (including "knowledge-graph score"); a binding microcopy table operationalizes them.
- **P11 checklist:** six items reproduced exactly; scenario cards carry them as primary body content; items without consequence are omitted, not "N/A."
- **P5/FR-12:** ethical relationship reasoning enforced in microcopy rules with correct/forbidden examples.
- **MVP scope fidelity:** Delegate card explicitly omitted at MVP (RESOLVED note citing FR-35); autonomy stated as L2+L3 with Gmail drafts as the sole write (AD-8); capture ≤2 interactions (AC-6); ≤3 clarification prompts (FR-19); 4:30 PM hard stop corrected over the erroneous Stitch mock copy ("spines win").
- **Journeys:** UJ-1/2/3 specified step-by-step with failure paths; UJ-4/5/6 correctly deferred to v1.0 story level.
- **NFRs:** NFR-2 latency targets in loading states; NFR-4 one-step undo (as AD-4 forward compensating event); NFR-7 exceeds the PRD floor (live regions, roving tabindex, forced-colors mitigation, zoom/reflow, 12px floor); NFR-9 PWA delivery specified.

### UX ↔ Architecture Alignment

Aligned. The UX stack declaration (Next.js 16.2 PWA, custom component library on tokens) matches the spine; undo semantics restate AD-4 exactly; the privacy state pattern ("work context on personal surface: FORBIDDEN") enforces SEC-1/AC-14/AD-5; offline capture queue matches the spine's mobile conventions and lands in epic story 1b.4; NFR-2's <10s interrupt budget is architecturally answered by AD-3 job pickup. Also verified here: the PRD's three architecture-phase blockers are resolved in the spine — OQ-1 → AD-3 (model routing, cost logging), OQ-3 → AD-6 (context is a property of the connection), OQ-9 → AD-5 (context tags; `joint` planning-only; broker filter).

### Alignment Issues

All minor; none blocks implementation:

1. **Autonomy-ladder glossary drift (EXPERIENCE.md §Glossary)** — describes "five levels: L1 (inform) → L2 (recommend) → L3 (draft) → L4 (act with review) → L5 (act autonomously)." PRD FR-57 defines six: L0 observe, L1 surface, L2 recommend, L3 draft, L4 execute with approval, L5 execute automatically within policy. Body text elsewhere is correct (L2+L3 at MVP); only the glossary entry is wrong. Fix the glossary row.
2. **Protected-priority glossary mis-citation (EXPERIENCE.md §Glossary)** — cites FR-24 for protection status (should be FR-3) and says protected priorities are "implemented identically to hard commitments," while FR-3 distinguishes them (protected priority moves via explicit tradeoff; hard commitment does not). Timeline treatment identical is fine; the semantic distinction must survive in the planner (it does — epics story 4.1 fixtures treat them separately).
3. **Scenario-card count inconsistency** — DESIGN.md says "grid of up to 4 options"; EXPERIENCE.md UJ-2 says "Four decision scenario cards render" then lists five options; MVP recommendation set is five (do now / schedule / acknowledge / clarify / decline), and epics story 5.2 correctly says "up to five." Epics resolved it correctly; DESIGN.md/EXPERIENCE.md wording should be updated to five.
4. **Lint-gate attribution** — EXPERIENCE.md attributes `eslint-plugin-jsx-a11y` to "AD-9 conventions"; it actually lives in the spine's Consistency Conventions table (AD-9 is Postgres). Cosmetic.

### Warnings

- **UX GAP register: two GAPs were deferred "to epic creation" but epics only partially closed them.** (a) The keyboard key-binding table (plan approval, capture focus, undo, surface navigation) — epics story 3a.1 specifies only the capture-focus shortcut; the rest remain undefined and will fall to story-level implementation. (b) Exact Settings/Preferences IA — story 2.7 places Policy & Boundaries + theme preference in a Settings area, which mostly resolves it, but no explicit Settings IA exists. Neither blocks build-start; both should be resolved in the first story that touches them (4.5 approve-flow keyboard path is already specified via UX-DR7).
- Three GAPs are legitimately deferred to implementation (no-flash pattern vs. Next.js 16 RSC, modify-mode interaction detail, PWA install-prompt timing) and are visible in the epics' story ACs where relevant.

## Epic Quality Review

Scope: 13 epics (9 MVP: 1a, 1b, 2, 3a, 3b, 4, 5, 6, 7; 4 post-MVP: 8–12), 42 stories (33 MVP-detailed, 19 post-MVP-coarse). Standard applied: create-epics-and-stories best practices — user value, independence, no forward dependencies, sizing, AC quality, traceability.

### Epic Structure Validation

**User value:** Every MVP epic is framed as a user outcome, including the two that are traditionally technical:
- Epic 1a ("Steel Thread Foundation") ends in story 1a.5 with visible user value (Sean sees his real days, correctly context-tagged) — a genuine steel thread, not "setup database." Story 1a.1 (scaffold) is the legitimate greenfield exception, and the architecture explicitly specifies *no starter template* with Epic-1-Story-1 scaffolding per the Structural Seed — the special-check requirement is satisfied.
- Epic 1b mixes user-visible value (Gmail connect, sync-health surface, dark mode, PWA) with ops hardening (1b.5); 1b.5 traces to ADD-6, a PRD-level requirement ("a backup is not a backup until restored"), so it is requirement-driven, not gold-plating.
- Epic 7 ("My Data, My Rules") turns data-lifecycle plumbing into user-facing guarantees (export, disconnect, erasure, audit window). Correct framing.

**Independence & build order:** The adopted MVP build order (1a → 2 → 3a → 4 → 1b → 3b → 5 → 6 → 7) is a topological ordering of the declared dependency graph — verified: every epic depends only on epics earlier in the build order. No circular dependencies. Notably good decision: the order deliberately reaches the first honest morning plan (Epic 4) before email machinery (1b/3b), matching the PRD's time-to-value driver. Epic numbering ≠ build order (1a/1b, 3a/3b splits) costs some readability but is explicitly rationalized and listed.

**Database/entity timing:** The event-ledger substrate is created in story 1a.3 ("small but final") rather than tables-per-story. This is a justified deviation, not a violation: ADD-5 requires the erasure design (redactable payloads vs. crypto-deletion) to be decided *before the first event is written*, and AD-4 makes the ledger the single mutation mechanism. Domain projections are still added per-story as needed.

### Story Quality Assessment

**Format & ACs:** All 23 MVP stories use proper user-story framing and Given/When/Then ACs. AC quality is unusually high: testable and instrumented (timestamp pairs, e2e tests named, "verified by automated test" clauses), with failure paths covered as first-class ACs (revoked token → 1b.2; LLM outage → 3b.5; offline capture → 1b.4; prompt injection → 3b.3). Every story cites FR/AC/AD/UX-DR IDs — full traceability.

**Sizing:** Stories are single-session sized, with honest sizing notes on the three known-large ones (1a.3: 2 sessions; 4.5: 2–3 sessions; 1b.5: 2–3 sessions) including recommended session splits. No epic-sized stories in MVP scope.

**Forward-dependency audit:** No forward dependencies found in the build order. The document actively guards against them — e.g., 3a.1 explicitly relocates offline-queue machinery to 1b.4 ("no forward dependency here"), and 4.6 pulls the SM-3 tap and SM-1 rubric-lite forward from Epic 6 so metric baselines can't be orphaned.

### Findings

**🔴 Critical Violations:** None.

**🟠 Major Issues:** None.

**🟡 Minor Concerns:**
1. **Epic 6 dependency list is incomplete.** Declared as "6 needs 4," but story 6.1's AC requires drafted replies via "5.4 machinery" (and hence 1b Gmail). Harmless under the adopted build order (5 precedes 6), but anyone re-sequencing from the dependency list alone would break 6.1. Fix: declare "6 needs 4+5."
2. **Epic 5's soft dependency on 3b is undeclared.** Story 5.1 intake accepts "captured item or confirmed email proposal"; the email path needs 3b (which does precede 5 in build order). The flow degrades gracefully without it, but the dependency list ("5 needs 4+1b") should note 3b as soft.
3. **CI pipeline creation is implied, never owned.** Story 1a.1 establishes lint/test gates and 4.1 says the regression gate is "wired into CI from this story forward," but no story explicitly creates the CI pipeline itself. Recommend making CI setup an explicit AC of 1a.1.
4. **Post-MVP epics 8–12 are deliberately coarse** (self-declared: "re-decomposed after MVP learning"). Correct approach — but they are *not* implementation-ready as written and must go through story re-decomposition before their phase begins. Not an MVP blocker.
5. **Story 4.6 is slightly overloaded** (Today surface + SM-3 tap + SM-1 rubric-lite), though the bundling rationale (baseline can't wait for Epic 6) is sound. Watch it at execution; split if the surface work grows.

### Best Practices Compliance Summary

| Epic | User value | Independent | Sized | No fwd deps | ACs testable | Traceable |
|---|---|---|---|---|---|---|
| 1a | ✓ (steel thread) | ✓ | ✓ (1a.3 flagged large) | ✓ | ✓ | ✓ |
| 1b | ✓ | ✓ (needs 1a) | ✓ (1b.5 flagged large) | ✓ | ✓ | ✓ |
| 2 | ✓ | ✓ (needs 1a) | ✓ | ✓ | ✓ | ✓ |
| 3a | ✓ | ✓ (needs 1a+2) | ✓ | ✓ | ✓ | ✓ |
| 3b | ✓ | ✓ (needs 1b) | ✓ | ✓ | ✓ | ✓ |
| 4 | ✓ | ✓ (needs 1a+2+3a) | ✓ (4.5 flagged large) | ✓ | ✓ | ✓ |
| 5 | ✓ | ⚠ (3b soft dep undeclared) | ✓ | ✓ | ✓ | ✓ |
| 6 | ✓ | ⚠ (dep on 5 undeclared) | ✓ | ✓ | ✓ | ✓ |
| 7 | ✓ | ✓ (needs 1a) | ✓ | ✓ | ✓ | ✓ |
| 8–12 | ✓ | ✓ (gated sequence) | ⚠ coarse (deliberate) | ✓ | ⚠ thin (deliberate) | ✓ |

**Verdict:** The epics document meets or exceeds best-practice standards for MVP implementation. The five minor concerns are documentation-hygiene fixes, none blocking.

## Summary and Recommendations

### Overall Readiness Status

**✅ READY** — for MVP implementation (Epics 1a–7 in the adopted build order). Post-MVP epics 8–12 are deliberately coarse and require re-decomposition before their respective phases begin; this does not affect MVP readiness.

The planning chain is unusually strong: PRD (77 numbered FRs with phase splits and named metric instruments) → Architecture spine (10 binding ADs resolving all three PRD architecture-phase blockers) → UX contract (token-complete, behaviorally specified, PRD-verbatim voice rules) → Epics (100% requirement coverage, dependency-clean build order, instrumented Given/When/Then ACs). No critical or major defects were found anywhere in the chain.

### Critical Issues Requiring Immediate Action

**None.** No finding blocks implementation start.

### All Findings (11, all minor)

*Traceability/consistency (from steps 2–3):*
1. PRD FR-32 text still says goal allocations/rhythms join the morning loop at v1.0; the amended MVP (FR-38-lite/FR-10-lite) feeds them in at MVP and epics reflect that. Update the FR-32 sentence.
2. PRD FR-48 phase tag reads [v1.0] while containing MVP-drafts scope; epics re-tag correctly as [MVP-drafts / v1.0-full]. Align the PRD tag.

*UX alignment (from step 4):*
3. EXPERIENCE.md glossary autonomy-ladder entry lists five levels and renames them; PRD FR-57 defines six (L0–L5). Fix the glossary row.
4. EXPERIENCE.md glossary cites FR-24 for protection levels (should be FR-3) and blurs the protected-priority vs. hard-commitment distinction that the planner must preserve.
5. Scenario-card count: DESIGN.md "up to 4" / EXPERIENCE.md "four… (lists five)" vs. correct five in epics story 5.2. Update both UX docs to five.
6. EXPERIENCE.md attributes the jsx-a11y lint gate to "AD-9"; it lives in the spine's Consistency Conventions. Cosmetic.
7. UX GAP "keyboard key-binding table" was deferred to epic creation but only the capture shortcut landed (3a.1). Define the minimum bindings (approve, capture, undo, nav) in the first story that touches each, or add to 4.5.
8. UX GAP "Settings IA" only partially resolved by story 2.7. Confirm Settings structure when 2.7 is implemented.

*Epic hygiene (from step 5):*
9. Epic 6's declared dependency list omits Epic 5 (story 6.1 uses 5.4 draft machinery). Declare "6 needs 4+5."
10. Epic 5's soft dependency on 3b (email-proposal intake path in 5.1) is undeclared. Note it.
11. No story explicitly owns CI pipeline creation (1a.1 implies gates; 4.1 assumes CI exists). Add CI setup as an explicit 1a.1 AC.

### Recommended Next Steps

1. **Apply the 11 minor fixes** — roughly 30 minutes of edits across prd.md, EXPERIENCE.md/DESIGN.md, and epics.md (items 1–6, 9–11 are one-line edits; 7–8 are notes-to-story).
2. **Proceed to sprint planning** (`bmad-sprint-planning`) against the adopted MVP build order 1a → 2 → 3a → 4 → 1b → 3b → 5 → 6 → 7, then story creation (`bmad-create-story`) starting with story 1a.1.
3. **Honor the two in-build sequencing commitments the epics made:** the erasure ADR (1a.3) is decided before the first event is written, and the golden planning scenarios (4.1) are written before the planner exists — these are load-bearing and were pulled forward for a reason.
4. **Before starting Epics 8–12 (post-MVP),** re-run story decomposition on the target epic with MVP learnings, and re-verify the coarse ACs against what actually shipped.

### Final Note

This assessment identified **11 issues across 3 categories (traceability consistency, UX-document drift, epic-documentation hygiene) — all minor, none critical or major**. Requirement coverage is 100% (77/77 functional requirements, 15/15 NFR/SEC, 15/15 MVP acceptance criteria mapped). The three PRD architecture-phase blockers (OQ-1, OQ-3, OQ-9) are confirmed resolved by the architecture spine (AD-3, AD-6, AD-5/AD-10). You may address the findings before proceeding or proceed as-is; nothing here blocks implementation.
